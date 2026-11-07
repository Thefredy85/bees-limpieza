// Bee's Pizza · Checklist de limpieza — API.
// Todas las tablas están cerradas (RLS sin políticas): solo esta función, con la llave de servicio,
// lee y escribe. Cada petición se valida con el token de sesión obtenido al marcar la clave.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import * as S from "./shared.js";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const SESSION_HOURS = 14;
const MAX_FAILS = 8;

class HttpErr extends Error { constructor(public status: number, msg: string) { super(msg); } }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

let SECRETS: Record<string, string> | null = null;
async function secrets() {
  if (!SECRETS) {
    const { data, error } = await sb.from("secretos").select("clave,valor");
    if (error) throw error;
    SECRETS = Object.fromEntries((data || []).map((r: any) => [r.clave, r.valor]));
  }
  return SECRETS!;
}
async function hashPin(pin: string) {
  const s = await secrets();
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s.pepper + ":" + pin));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const isPin = (p: unknown) => typeof p === "string" && /^\d{4}$/.test(p);

async function getSession(token?: string) {
  if (!token) throw new HttpErr(401, "Tu sesión terminó. Vuelve a marcar tu clave.");
  const { data } = await sb.from("sesiones").select("token,rol,emp_id,expira,empleados(id,nombre,areas,turnos,ver)").eq("token", token).maybeSingle();
  if (!data || new Date(data.expira) < new Date()) throw new HttpErr(401, "Tu sesión terminó. Vuelve a marcar tu clave.");
  const emp: any = (data as any).empleados || null;
  return { token: data.token, rol: data.rol as "emp" | "admin", emp, jefe: data.rol === "admin" || !!emp?.ver, admin: data.rol === "admin" };
}
async function newSession(rol: "emp" | "admin", empId: string | null) {
  const expira = new Date(Date.now() + SESSION_HOURS * 3600e3).toISOString();
  const { data, error } = await sb.from("sesiones").insert({ rol, emp_id: empId, expira }).select("token").single();
  if (error) throw error;
  await sb.from("sesiones").delete().lt("expira", new Date().toISOString());
  return data.token as string;
}
function publicEmp(e: any) { return e ? { id: e.id, nombre: e.nombre, areas: e.areas, turnos: e.turnos, ver: e.ver } : null; }

/* ---------- Fotos (bucket privado, enlaces firmados de 2 h) ---------- */
function b64ToBytes(b64: string) {
  const clean = b64.replace(/^data:image\/\w+;base64,/, "");
  const bin = atob(clean); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function uploadFoto(fecha: string, b64: string) {
  const bytes = b64ToBytes(b64);
  if (bytes.length < 100 || bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new HttpErr(400, "La foto no es válida. Intenta otra vez.");
  if (bytes.length > 5 * 1024 * 1024) throw new HttpErr(413, "La foto es muy pesada.");
  const path = fecha + "/" + crypto.randomUUID() + ".jpg";
  const { error } = await sb.storage.from("fotos").upload(path, bytes, { contentType: "image/jpeg", upsert: false });
  if (error) throw new HttpErr(500, "No se pudo guardar la foto. Intenta otra vez.");
  return path;
}
async function removeFotos(paths: string[]) { const p = paths.filter(Boolean); if (p.length) await sb.storage.from("fotos").remove(p); }
async function signed(paths: string[]) {
  const p = [...new Set(paths.filter(Boolean))];
  const out: Record<string, string> = {};
  for (let i = 0; i < p.length; i += 100) {
    const { data } = await sb.storage.from("fotos").createSignedUrls(p.slice(i, i + 100), 7200);
    (data || []).forEach((d: any) => { if (d.signedUrl && d.path) out[d.path] = d.signedUrl; });
  }
  return out;
}
const entregaFotos = (e: any) => Object.values(e?.fotos || {}) as string[];

/* ---------- Notificaciones push ---------- */
async function notify(target: "jefes" | "todos", payload: { title: string; body: string; tag?: string; url?: string }) {
  const s = await secrets();
  if (!s.vapid_public || !s.vapid_private) return;
  webpush.setVapidDetails("mailto:avisos@beespizza.app", s.vapid_public, s.vapid_private);
  let q = sb.from("push_subs").select("endpoint,p256dh,auth,jefe");
  if (target === "jefes") q = q.eq("jefe", true);
  const { data } = await q;
  await Promise.all((data || []).map(async (sub: any) => {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 3600, urgency: "high" });
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", sub.endpoint);
    }
  }));
}

async function notifyEmp(empId: string | null, payload: { title: string; body: string; tag?: string }) {
  if (!empId) return;
  const s = await secrets();
  webpush.setVapidDetails("mailto:avisos@beespizza.app", s.vapid_public, s.vapid_private);
  const { data } = await sb.from("push_subs").select("endpoint,p256dh,auth").eq("emp_id", empId);
  await Promise.all((data || []).map(async (sub: any) => {
    try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 3600, urgency: "high" }); }
    catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); }
  }));
}
const quien = (ses: any) => ses.emp?.nombre || "Administrador";
const RUT_COLS = "id,fecha,task_id,emp_id,nombre,at,foto,nota,coment,cal_por,cal_at,anulado,rep_txt,rep_por,rep_at,rep_para,rep_de";
const itemsDe = (rows: any[], j: string) => rows.map((d) => ({ m: S.minOf(d.at, j), id: d.id, anulado: !!d.anulado, rep_de: d.rep_de || null, rep_at_m: d.rep_at ? S.minOf(d.rep_at, j) : null }));
/* Repeticiones de rutina pedidas hoy que nadie ha cubierto todavía. */
async function repPendientes(j: string, taskId?: string) {
  let q = sb.from("rutina").select(RUT_COLS).eq("fecha", j).eq("anulado", true);
  if (taskId) q = q.eq("task_id", taskId);
  const { data: anul } = await q;
  if (!anul?.length) return [];
  const { data: hechas } = await sb.from("rutina").select("rep_de").in("rep_de", anul.map((a: any) => a.id));
  const cubiertas = new Set((hechas || []).map((h: any) => h.rep_de));
  return anul.filter((a: any) => !cubiertas.has(a.id)).sort((a: any, b: any) => (a.rep_at < b.rep_at ? -1 : 1));
}

/* ---------- Acciones ---------- */
type Body = Record<string, any>;
const handlers: Record<string, (b: Body, req: Request) => Promise<unknown>> = {
  async estado() {
    const [{ count: admins }, { count: emps }] = await Promise.all([
      sb.from("admin_cfg").select("id", { count: "exact", head: true }),
      sb.from("empleados").select("id", { count: "exact", head: true }),
    ]);
    return { adminExiste: (admins || 0) > 0, empleados: emps || 0, ahora: Date.now() };
  },

  async login(b, req) {
    const ip = (req.headers.get("x-forwarded-for") || "?").split(",")[0].trim();
    if (!isPin(b.pin)) throw new HttpErr(400, "La clave es de 4 números.");
    // El intento se anota ANTES de revisar la clave: así una ráfaga de intentos simultáneos también se bloquea.
    const { data: intento } = await sb.from("login_fallos").insert({ ip }).select("id").single();
    const since = new Date(Date.now() - 10 * 60e3).toISOString();
    const { count } = await sb.from("login_fallos").select("id", { count: "exact", head: true }).eq("ip", ip).gte("ts", since);
    if ((count || 0) > MAX_FAILS) throw new HttpErr(429, "Demasiados intentos. Espera 10 minutos.");
    const h = await hashPin(b.pin);
    const { data: emp } = await sb.from("empleados").select("id,nombre,areas,turnos,ver").eq("pin_hash", h).maybeSingle();
    const s = await secrets();
    const ok = async () => { if (intento) await sb.from("login_fallos").delete().eq("id", intento.id); };
    if (emp) { await ok(); return { token: await newSession("emp", emp.id), rol: "emp", emp: publicEmp(emp), jefe: !!emp.ver, admin: false, vapid: s.vapid_public }; }
    const { data: adm } = await sb.from("admin_cfg").select("pin_hash").eq("id", 1).maybeSingle();
    if (adm && adm.pin_hash === h) { await ok(); return { token: await newSession("admin", null), rol: "admin", emp: null, jefe: true, admin: true, vapid: s.vapid_public }; }
    await sb.from("login_fallos").delete().lt("ts", new Date(Date.now() - 86400e3).toISOString());
    throw new HttpErr(401, "Clave incorrecta");
  },

  async setup(b) {
    const { count } = await sb.from("admin_cfg").select("id", { count: "exact", head: true });
    if ((count || 0) > 0) throw new HttpErr(403, "El administrador ya fue creado.");
    const s = await secrets();
    if (String(b.code || "").trim().toUpperCase() !== s.setup) throw new HttpErr(403, "Código de configuración incorrecto.");
    if (!isPin(b.pin)) throw new HttpErr(400, "El PIN debe tener 4 números.");
    const h = await hashPin(b.pin);
    const { data: clash } = await sb.from("empleados").select("id").eq("pin_hash", h).maybeSingle();
    if (clash) throw new HttpErr(409, "Esa clave ya la usa un empleado.");
    const { error } = await sb.from("admin_cfg").insert({ id: 1, pin_hash: h });
    if (error) throw error;
    return { token: await newSession("admin", null), rol: "admin", emp: null, jefe: true, admin: true, vapid: s.vapid_public };
  },

  async logout(b) { if (b.token) await sb.from("sesiones").delete().eq("token", b.token); return { ok: true }; },

  async yo(b) { const ses = await getSession(b.token); return { rol: ses.rol, emp: publicEmp(ses.emp), jefe: ses.jefe, admin: ses.admin, vapid: (await secrets()).vapid_public }; },

  async hoy(b) {
    const ses = await getSession(b.token);
    const j = S.jornadaOf(Date.now());
    const [{ data: ent }, { data: rut }] = await Promise.all([
      sb.from("entregas").select("*").eq("fecha", j).order("inicio"),
      sb.from("rutina").select(RUT_COLS).eq("fecha", j).order("at"),
    ]);
    const mine = (rut || []).filter((r: any) => ses.emp && r.emp_id === ses.emp.id).map((r: any) => r.foto);
    const myEnt = (ent || []).filter((e: any) => ses.emp && e.emp_id === ses.emp.id).flatMap(entregaFotos);
    const { data: eq } = await sb.from("empleados").select("id,nombre");
    return { fecha: j, ahora: Date.now(), entregas: ent || [], rutina: rut || [], urls: await signed([...mine, ...myEnt]), emp: publicEmp(ses.emp), equipo: Object.fromEntries((eq || []).map((x: any) => [x.id, x.nombre])) };
  },

  async entrega_iniciar(b) {
    const ses = await getSession(b.token);
    if (!ses.emp) throw new HttpErr(403, "Solo los empleados hacen entregas.");
    const { area, turno } = b;
    if (!S.AREAS.includes(area) || !S.TURNOS.includes(turno)) throw new HttpErr(400, "Entrega no válida.");
    if (!ses.emp.areas.includes(area) || !ses.emp.turnos.includes(turno)) throw new HttpErr(403, "No tienes habilitada esta entrega.");
    if (!S.tasksOf(turno, area).length) throw new HttpErr(400, "Esta lista aún no está lista.");
    const j = S.jornadaOf(Date.now());
    const { data: open } = await sb.from("entregas").select("*").eq("fecha", j).eq("area", area).eq("turno", turno).eq("emp_id", ses.emp.id).eq("estado", "en_curso").maybeSingle();
    if (open) return { entrega: open, urls: await signed(entregaFotos(open)) };
    const { data, error } = await sb.from("entregas").insert({ fecha: j, area, turno, emp_id: ses.emp.id, nombre: ses.emp.nombre, total: S.slots(area, turno).length }).select("*").single();
    if (error) throw error;
    return { entrega: data, urls: {} };
  },

  async entrega_ver(b) {
    const ses = await getSession(b.token);
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e) throw new HttpErr(404, "Esta entrega ya no existe.");
    if (!ses.jefe && e.emp_id !== ses.emp?.id) throw new HttpErr(403, "No puedes ver esta entrega.");
    return { entrega: e, urls: await signed(entregaFotos(e)) };
  },

  async entrega_foto(b) {
    const ses = await getSession(b.token);
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e || e.emp_id !== ses.emp?.id) throw new HttpErr(403, "No puedes editar esta entrega.");
    if (e.estado !== "en_curso") throw new HttpErr(409, "Esta entrega ya se entregó.");
    if (!S.slots(e.area, e.turno).some((s: any) => s.key === b.key)) throw new HttpErr(400, "Foto no válida.");
    const path = await uploadFoto(e.fecha, b.data);
    const old = e.fotos?.[b.key];
    const { data: rows, error } = await sb.rpc("entrega_set_foto", { p_id: e.id, p_key: b.key, p_path: path });
    const upd = rows?.[0];
    if (error || !upd) { await removeFotos([path]); if (error) throw error; throw new HttpErr(409, "Esta entrega ya se entregó."); }
    if (old && upd.fotos?.[b.key] !== old) await removeFotos([old]);
    return { entrega: upd, urls: await signed(entregaFotos(upd)) };
  },

  async entrega_foto_borrar(b) {
    const ses = await getSession(b.token);
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e || e.emp_id !== ses.emp?.id) throw new HttpErr(403, "No puedes editar esta entrega.");
    if (e.estado !== "en_curso") throw new HttpErr(409, "Esta entrega ya se entregó.");
    const old = e.fotos?.[b.key];
    const { data: rows, error } = await sb.rpc("entrega_del_foto", { p_id: e.id, p_key: b.key });
    if (error) throw error;
    const upd = rows?.[0];
    if (!upd) throw new HttpErr(409, "Esta entrega ya se entregó.");
    if (old) await removeFotos([old]);
    return { entrega: upd, urls: await signed(entregaFotos(upd)) };
  },

  async entrega_entregar(b) {
    const ses = await getSession(b.token);
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e || e.emp_id !== ses.emp?.id) throw new HttpErr(403, "No puedes entregar esta lista.");
    if (e.estado === "entregado") return { entrega: e };
    const faltan = S.slots(e.area, e.turno).length - S.countDone(e);
    if (faltan > 0) throw new HttpErr(409, "Faltan " + faltan + " fotos.");
    const rep = S.pendRepetir(e);
    if (rep > 0) throw new HttpErr(409, "Te falta repetir " + rep + " foto" + (rep > 1 ? "s" : "") + ".");
    const { data: upd, error } = await sb.from("entregas").update({ estado: "entregado", fin: new Date().toISOString() }).eq("id", e.id).select("*").single();
    if (error) throw error;
    await notify("jefes", { title: "✅ Entrega de " + S.TURNO_NAME[upd.turno].toLowerCase() + " · " + S.AREA_NAME[upd.area], body: upd.nombre + " entregó a las " + S.horaIso(upd.fin) + " con todas sus fotos.", tag: "entrega-" + upd.id });
    return { entrega: upd };
  },

  async rutina_registrar(b) {
    const ses = await getSession(b.token);
    if (!ses.emp) throw new HttpErr(403, "Solo los empleados registran rutina.");
    const r = S.RUTINA.find((x: any) => x.id === b.task_id);
    if (!r) throw new HttpErr(400, "Tarea no válida.");
    const j = S.jornadaOf(Date.now());
    // ¿Hay una repetición pendiente de esta tarea? Si se le pidió a otra persona, solo ella puede cubrirla dentro de los 20 minutos.
    const pend = await repPendientes(j, r.id);
    let repDe: any = null;
    if (pend.length) {
      const p = pend[0], vence = Date.parse(p.rep_at) + S.REP_MIN * 60e3;
      if (p.rep_para && p.rep_para !== ses.emp.id && Date.now() <= vence) {
        const { data: otro } = await sb.from("empleados").select("nombre").eq("id", p.rep_para).maybeSingle();
        throw new HttpErr(409, "Esta tarea se le pidió repetir a " + (otro?.nombre || "otra persona") + ". Se abre a todos a las " + S.horaIso(new Date(vence).toISOString()));
      }
      repDe = p;
    }
    const path = await uploadFoto(j, b.data);
    const at = new Date().toISOString();
    const { data, error } = await sb.from("rutina").insert({ fecha: j, task_id: r.id, emp_id: ses.emp.id, nombre: ses.emp.nombre, at, foto: path, rep_de: repDe?.id || null }).select(RUT_COLS).single();
    if (error) { await removeFotos([path]); throw error; }
    const { data: hoy } = await sb.from("rutina").select(RUT_COLS).eq("fecha", j).eq("task_id", r.id).order("at");
    const a = S.analyze(r, itemsDe(hoy || [], j), S.nowMinFor(j));
    const ix = (hoy || []).findIndex((d: any) => d.id === data.id);
    const f = a.filled.find((x: any) => x && x.ix === ix);
    const estado = repDe ? "repetida (cuenta como tarde)" : f ? (f.late ? "tarde " + S.durTxt(f.late) : "a tiempo") : "extra";
    await notify("jefes", { title: (repDe ? "🔁 " : "🧽 ") + r.t + (repDe ? " repetido" : ""), body: ses.emp.nombre + " · " + S.horaIso(at) + " · " + estado, tag: "rut-" + r.id });
    const sig = a.sch.find((s: any, i: number) => !a.filled[i] && !a.repPend[i] && s.H > S.nowMinFor(j));
    return { registro: data, estado, repeticion: !!repDe, siguiente: sig ? S.fmtMin(sig.H) : null };
  },

  async rutina_calificar(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador califican.");
    const nota = b.nota == null ? null : Number(b.nota);
    if (nota != null && ![1, 2, 3, 4].includes(nota)) throw new HttpErr(400, "Calificación no válida.");
    const coment = b.coment == null ? undefined : String(b.coment).trim().slice(0, 300) || null;
    const row: any = { cal_por: quien(ses), cal_at: new Date().toISOString() };
    if (b.nota !== undefined) row.nota = nota;
    if (coment !== undefined) row.coment = coment;
    const { data, error } = await sb.from("rutina").update(row).eq("id", b.id).select(RUT_COLS).single();
    if (error || !data) throw new HttpErr(404, "Ese registro ya no existe.");
    const r = S.RUTINA.find((x: any) => x.id === data.task_id);
    if (data.emp_id && (b.nota !== undefined || coment)) await notifyEmp(data.emp_id, { title: "⭐ " + (r?.t || "Tu registro") + (data.nota ? " · " + S.notaTxt(data.nota) : ""), body: (data.coment ? data.coment + " — " : "") + quien(ses) + " calificó tu registro de las " + S.horaIso(data.at) + ".", tag: "cal-" + data.id });
    return { registro: data };
  },

  async rutina_repetir(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador.");
    const { data: d } = await sb.from("rutina").select(RUT_COLS).eq("id", b.id).maybeSingle();
    if (!d) throw new HttpErr(404, "Ese registro ya no existe.");
    if (d.fecha !== S.jornadaOf(Date.now())) throw new HttpErr(409, "Solo se pueden repetir tareas de la jornada de hoy.");
    if (d.anulado) throw new HttpErr(409, "Ya se pidió repetir esta tarea.");
    if (d.rep_de) throw new HttpErr(409, "Este registro ya es una repetición. Califícalo con su nota.");
    const rDef = S.RUTINA.find((x: any) => x.id === d.task_id);
    const { data: delDia } = await sb.from("rutina").select(RUT_COLS).eq("fecha", d.fecha).eq("task_id", d.task_id).order("at");
    const an = S.analyze(rDef, itemsDe(delDia || [], d.fecha), S.nowMinFor(d.fecha));
    const ixD = (delDia || []).findIndex((x: any) => x.id === d.id);
    if (!an.filled.some((f: any) => f && f.ix === ixD)) throw new HttpErr(409, "Este registro fue fuera de horario y no cuenta para ninguno; no hace falta repetirlo. Califícalo con su nota.");
    const txt = String(b.txt || "").trim().slice(0, 200);
    if (!txt) throw new HttpErr(400, "Escribe qué hay que corregir.");
    const para = b.para === "mismo" ? d.emp_id : null;
    const now = new Date().toISOString();
    const { data: upd, error } = await sb.from("rutina").update({ anulado: true, rep_txt: txt, rep_por: quien(ses), rep_at: now, rep_para: para, nota: d.nota || 1, cal_por: quien(ses), cal_at: now }).eq("id", d.id).select(RUT_COLS).single();
    if (error) throw error;
    const r = S.RUTINA.find((x: any) => x.id === d.task_id);
    const vence = S.horaIso(new Date(Date.now() + S.REP_MIN * 60e3).toISOString());
    const payload = { title: "🔁 Repetir: " + (r?.t || "tarea"), body: txt + " — " + quien(ses) + ". Tienes hasta las " + vence + ".", tag: "rep-" + d.id };
    if (para) await notifyEmp(para, payload); else await notify("todos", payload);
    return { registro: upd };
  },

  async entrega_calificar(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador califican.");
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e) throw new HttpErr(404, "Esta entrega ya no existe.");
    if (!e.fotos?.[b.key]) throw new HttpErr(400, "Esa foto no existe.");
    const prev = e.calif?.[b.key] || {};
    const nota = b.nota === undefined ? prev.n : b.nota == null ? null : Number(b.nota);
    if (nota != null && ![1, 2, 3, 4].includes(nota)) throw new HttpErr(400, "Calificación no válida.");
    const c = b.coment === undefined ? prev.c : String(b.coment || "").trim().slice(0, 300) || null;
    const { data: rows, error } = await sb.rpc("entrega_set_calif", { p_id: e.id, p_key: b.key, p_val: { n: nota, c, por: quien(ses), at: new Date().toISOString() } });
    if (error) throw error;
    const upd = rows?.[0];
    const cal = S.califEntrega(upd);
    if (cal.rated === cal.total && cal.total > 0) {
      const { error: dup } = await sb.from("avisos").insert({ clave: "cal-ent:" + upd.id });
      if (!dup) await notifyEmp(upd.emp_id, { title: "⭐ Tu " + S.TURNO_NAME[upd.turno].toLowerCase() + " de " + S.AREA_NAME[upd.area] + ": " + S.notaTxt(cal.nota), body: "Calificado por " + quien(ses) + ". Revisa los comentarios en Mi día.", tag: "cal-ent-" + upd.id });
    }
    return { entrega: upd };
  },

  async entrega_comentar(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador.");
    const txt = String(b.txt || "").trim().slice(0, 500) || null;
    const { data: upd, error } = await sb.from("entregas").update({ nota_general: txt, nota_por: txt ? quien(ses) : null, nota_at: txt ? new Date().toISOString() : null }).eq("id", b.id).select("*").single();
    if (error || !upd) throw new HttpErr(404, "Esta entrega ya no existe.");
    if (txt) await notifyEmp(upd.emp_id, { title: "💬 Comentario de tu " + S.TURNO_NAME[upd.turno].toLowerCase(), body: txt + " — " + quien(ses), tag: "com-ent-" + upd.id });
    return { entrega: upd };
  },

  async entrega_repetir(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador.");
    const { data: e } = await sb.from("entregas").select("*").eq("id", b.id).maybeSingle();
    if (!e) throw new HttpErr(404, "Esta entrega ya no existe.");
    if (e.turno !== "apertura") throw new HttpErr(409, "Repetir solo aplica a la entrega de apertura.");
    if (!e.fotos?.[b.key]) throw new HttpErr(400, "Esa foto no existe.");
    const txt = String(b.txt || "").trim().slice(0, 200);
    if (!txt) throw new HttpErr(400, "Escribe qué hay que corregir.");
    const now = new Date().toISOString();
    await sb.rpc("entrega_set_calif", { p_id: e.id, p_key: b.key, p_val: { n: 1, c: txt, por: quien(ses), at: now } });
    const { data: rows, error } = await sb.rpc("entrega_set_repetir", { p_id: e.id, p_key: b.key, p_val: { txt, por: quien(ses), at: now } });
    if (error) throw error;
    const s = S.slots(e.area, e.turno).find((x: any) => x.key === b.key);
    await notifyEmp(e.emp_id, { title: "🔁 Repetir en tu apertura: " + (s?.task.t || "foto"), body: txt + " — " + quien(ses) + ". Toma la foto de nuevo y vuelve a entregar.", tag: "rep-ent-" + e.id });
    return { entrega: rows?.[0] };
  },

  async panel(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "No tienes acceso a los registros.");
    const hoyJ = S.jornadaOf(Date.now());
    const fecha = /^\d{4}-\d{2}-\d{2}$/.test(b.fecha || "") ? b.fecha : hoyJ;
    const desde = S.addDays(hoyJ, -13);
    const [{ data: ent }, { data: rut }, { data: rango }] = await Promise.all([
      sb.from("entregas").select("*").eq("fecha", fecha).order("inicio"),
      sb.from("rutina").select(RUT_COLS).eq("fecha", fecha).order("at"),
      sb.from("rutina").select("id,fecha,task_id,at,anulado,rep_de,rep_at").gte("fecha", desde),
    ]);
    const paths = [...(rut || []).map((r: any) => r.foto), ...(ent || []).flatMap(entregaFotos)];
    const { data: eq } = await sb.from("empleados").select("id,nombre");
    return { fecha, hoy: hoyJ, ahora: Date.now(), entregas: ent || [], rutina: rut || [], rango: rango || [], urls: await signed(paths), equipo: Object.fromEntries((eq || []).map((x: any) => [x.id, x.nombre])) };
  },

  async rutina_borrar(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador puede borrar.");
    const { data } = await sb.from("rutina").select("foto").eq("id", b.id).maybeSingle();
    await sb.from("rutina").delete().eq("id", b.id);
    if (data?.foto) await removeFotos([data.foto]);
    return { ok: true };
  },

  async entrega_borrar(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador puede borrar.");
    const { data } = await sb.from("entregas").select("fotos").eq("id", b.id).maybeSingle();
    await sb.from("entregas").delete().eq("id", b.id);
    if (data) await removeFotos(entregaFotos(data));
    return { ok: true };
  },

  async empleados(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador.");
    const { data } = await sb.from("empleados").select("id,nombre,areas,turnos,ver").order("creado");
    return { empleados: data || [] };
  },

  async empleado_guardar(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador.");
    const nombre = String(b.nombre || "").trim().slice(0, 30);
    const areas = (b.areas || []).filter((a: string) => S.AREAS.includes(a));
    const turnos = (b.turnos || []).filter((t: string) => S.TURNOS.includes(t));
    const ver = !!b.ver;
    if (!nombre) throw new HttpErr(400, "Escribe el nombre.");
    if (!b.id && !isPin(b.pin)) throw new HttpErr(400, "La clave debe ser de 4 dígitos.");
    if (b.pin && !isPin(b.pin)) throw new HttpErr(400, "La clave debe ser de 4 dígitos.");
    if (!ver && !areas.length) throw new HttpErr(400, "Elige al menos un área: Cocina o Salón.");
    if (!ver && !turnos.length) throw new HttpErr(400, "Elige al menos una entrega: Apertura o Cierre.");
    const row: any = { nombre, areas, turnos, ver };
    if (b.pin) {
      const h = await hashPin(b.pin);
      const { data: adm } = await sb.from("admin_cfg").select("pin_hash").eq("id", 1).maybeSingle();
      if (adm?.pin_hash === h) throw new HttpErr(409, "Esa clave no está disponible. Elige otra.");
      const { data: clash } = await sb.from("empleados").select("id,nombre").eq("pin_hash", h).maybeSingle();
      if (clash && clash.id !== b.id) throw new HttpErr(409, "Esa clave ya la usa " + clash.nombre + ". Elige otra.");
      row.pin_hash = h;
    }
    if (b.id) {
      const { error } = await sb.from("empleados").update(row).eq("id", b.id);
      if (error) throw error;
      await sb.from("push_subs").update({ jefe: ver }).eq("emp_id", b.id);
    } else {
      const { error } = await sb.from("empleados").insert(row);
      if (error) throw error;
    }
    return handlers.empleados(b, null as any);
  },

  async empleado_borrar(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador.");
    await sb.from("empleados").delete().eq("id", b.id);
    return handlers.empleados(b, null as any);
  },

  async admin_pin(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador.");
    if (!isPin(b.pin)) throw new HttpErr(400, "El PIN debe tener 4 números.");
    const h = await hashPin(b.pin);
    const { data: clash } = await sb.from("empleados").select("id").eq("pin_hash", h).maybeSingle();
    if (clash) throw new HttpErr(409, "Esa clave ya la usa un empleado. Elige otra.");
    await sb.from("admin_cfg").update({ pin_hash: h }).eq("id", 1);
    return { ok: true };
  },

  async push_alta(b) {
    const ses = await getSession(b.token);
    const sub = b.sub;
    if (!sub?.endpoint || !sub?.keys?.p256dh || !sub?.keys?.auth) throw new HttpErr(400, "Suscripción no válida.");
    if (!/^https:\/\//.test(sub.endpoint)) throw new HttpErr(400, "Suscripción no válida.");
    await sb.from("push_subs").upsert({ endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth, rol: ses.rol, emp_id: ses.emp?.id || null, jefe: ses.jefe });
    return { ok: true };
  },

  async push_baja(b) {
    await getSession(b.token);
    if (b.endpoint) await sb.from("push_subs").delete().eq("endpoint", b.endpoint);
    return { ok: true };
  },

  async push_prueba(b) {
    const ses = await getSession(b.token);
    const s = await secrets();
    webpush.setVapidDetails("mailto:avisos@beespizza.app", s.vapid_public, s.vapid_private);
    const { data } = await sb.from("push_subs").select("*").eq("endpoint", b.endpoint).maybeSingle();
    if (!data) throw new HttpErr(404, "Este equipo no tiene avisos activados.");
    await webpush.sendNotification({ endpoint: data.endpoint, keys: { p256dh: data.p256dh, auth: data.auth } }, JSON.stringify({ title: "🔔 Avisos activados", body: "Así te llegarán los avisos del checklist, " + (ses.emp?.nombre || "administrador") + "." }));
    return { ok: true };
  },

  /* Lo llama el reloj de Supabase cada 5 minutos. Avisa una sola vez por cada horario atrasado. */
  async revisar_atrasos(_b, req) {
    const s = await secrets();
    if (req.headers.get("x-cron-key") !== s.cron) throw new HttpErr(403, "No autorizado.");
    const j = S.jornadaOf(Date.now()), now = S.nowMinFor(j);
    if (now < S.OPEN_MIN - 120 || now >= S.CUT_MIN) return { ok: true, fuera: true };
    const { data: rut } = await sb.from("rutina").select(RUT_COLS).eq("fecha", j);
    const all = S.rutAll(rut || [], j, now);
    let enviados = 0;
    // Repeticiones pedidas a una persona que vencieron: se abren a todo el turno (un solo aviso).
    for (const p of await repPendientes(j)) {
      if (!p.rep_para || Date.now() <= Date.parse(p.rep_at) + S.REP_MIN * 60e3) continue;
      const { error } = await sb.from("avisos").insert({ clave: "rep-abierta:" + p.id });
      if (error) continue;
      enviados++;
      const r = S.RUTINA.find((x: any) => x.id === p.task_id);
      await notify("todos", { title: "🔁 " + (r?.t || "Tarea") + ": se abre a todo el turno", body: "No se repitió a tiempo. Cualquiera puede hacerla ahora. Motivo: " + (p.rep_txt || ""), tag: "rep-" + p.id });
    }
    for (const a of all) {
      if (a.state !== "red" || !a.next || a.rep) continue;
      const clave = j + ":" + a.r.id + ":" + a.next.i;
      const { error } = await sb.from("avisos").insert({ clave });
      if (error) continue; // ya avisado
      enviados++;
      await notify("todos", { title: "⏰ " + a.r.t + " atrasado", body: a.text, tag: "atraso-" + a.r.id });
    }
    await sb.from("avisos").delete().lt("creado", new Date(Date.now() - 3 * 86400e3).toISOString());
    return { ok: true, enviados };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  let body: Body;
  try { body = await req.json(); } catch { return json({ error: "Petición no válida" }, 400); }
  const fn = handlers[body?.action];
  if (!fn) return json({ error: "Acción no válida" }, 400);
  try {
    return json(await fn(body, req));
  } catch (e: any) {
    if (e instanceof HttpErr) return json({ error: e.message }, e.status);
    console.error(body?.action, e);
    return json({ error: "Ocurrió un error. Intenta otra vez." }, 500);
  }
});
