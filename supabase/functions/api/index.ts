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
  let nombre = emp?.nombre || "";
  if (data.rol === "admin") { const { data: a } = await sb.from("admin_cfg").select("nombre").eq("id", 1).maybeSingle(); nombre = a?.nombre || "Administrador"; }
  return { token: data.token, rol: data.rol as "emp" | "admin", emp, nombre, jefe: data.rol === "admin" || !!emp?.ver, admin: data.rol === "admin" };
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
async function notify(target: "jefes" | "todos" | "equipo", payload: { title: string; body: string; tag?: string; url?: string }) {
  const s = await secrets();
  if (!s.vapid_public || !s.vapid_private) return;
  webpush.setVapidDetails("mailto:avisos@beespizza.app", s.vapid_public, s.vapid_private);
  let q = sb.from("push_subs").select("endpoint,p256dh,auth,jefe,dnd_ini,dnd_fin,pend");
  if (target === "jefes") q = q.eq("jefe", true);
  if (target === "equipo") q = q.eq("rol", "emp");
  const { data } = await q;
  const cm = relojMin();
  await Promise.all((data || []).map(async (sub: any) => {
    if (enDnd(sub, cm)) { await sb.from("push_subs").update({ pend: (sub.pend || 0) + 1 }).eq("endpoint", sub.endpoint); return; }
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
  const { data } = await sb.from("push_subs").select("endpoint,p256dh,auth,dnd_ini,dnd_fin,pend").eq("emp_id", empId);
  const cm = relojMin();
  await Promise.all((data || []).map(async (sub: any) => {
    if (enDnd(sub, cm)) { await sb.from("push_subs").update({ pend: (sub.pend || 0) + 1 }).eq("endpoint", sub.endpoint); return; }
    try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify(payload), { TTL: 3600, urgency: "high" }); }
    catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); }
  }));
}
const quien = (ses: any) => ses.nombre || ses.emp?.nombre || "Administrador";
const relojMin = () => { const d = S.mxDate(Date.now()); return d.getUTCHours() * 60 + d.getUTCMinutes(); };
const enDnd = (sub: any, cm: number) => sub.dnd_ini != null && sub.dnd_fin != null && sub.dnd_ini !== sub.dnd_fin && (sub.dnd_ini < sub.dnd_fin ? cm >= sub.dnd_ini && cm < sub.dnd_fin : cm >= sub.dnd_ini || cm < sub.dnd_fin);
async function horarioCfg() { const { data } = await sb.from("config").select("valor").eq("clave", "horario").maybeSingle(); return (data?.valor || {}) as Record<string, string | null>; }
/* Inicio de rutina de una jornada: {m, por, auto, at} o null si aún no inicia. */
async function inicioInfo(j: string, now: number | null, horario?: any) {
  const [{ data: fila }, hor] = await Promise.all([sb.from("jornadas").select("*").eq("fecha", j).maybeSingle(), horario ? Promise.resolve(horario) : horarioCfg()]);
  const m = S.inicioDe(j, fila, hor, now);
  if (m == null) return { m: null, prog: S.hhmmToMin(hor[String(S.diaSem(j))]), horario: hor };
  return { m, por: fila?.por || "Programada", auto: fila ? !!fila.auto : true, prog: S.hhmmToMin(hor[String(S.diaSem(j))]), horario: hor };
}
async function iniciosRango(desde: string, hasta: string, hor: any, nowHoy: number) {
  const { data } = await sb.from("jornadas").select("fecha,inicio").gte("fecha", desde).lte("fecha", hasta);
  const filas = Object.fromEntries((data || []).map((x: any) => [x.fecha, x]));
  const out: Record<string, number | null> = {};
  for (let j = hasta; j >= desde; j = S.addDays(j, -1)) out[j] = S.inicioDe(j, filas[j], hor, j === hasta ? nowHoy : null);
  return out;
}
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

async function retrosNuevas(empId: string) {
  const desde = S.addDays(S.jornadaOf(Date.now()), -13);
  const [{ data: e }, { data: rut }, { data: ent }] = await Promise.all([
    sb.from("empleados").select("retro_visto").eq("id", empId).maybeSingle(),
    sb.from("rutina").select("cal_at,rep_at").eq("emp_id", empId).gte("fecha", desde).or("nota.not.is.null,coment.not.is.null,anulado.eq.true"),
    sb.from("entregas").select("calif,nota_at").eq("emp_id", empId).gte("fecha", desde),
  ]);
  const v = e?.retro_visto || "";
  let n = (rut || []).filter((r: any) => (r.cal_at || "") > v || (r.rep_at || "") > v).length;
  (ent || []).forEach((x: any) => { if ((x.nota_at || "") > v) n++; Object.values(x.calif || {}).forEach((c: any) => { if (c && (c.at || "") > v) n++; }); });
  return n;
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
    if (emp) { await ok(); return { token: await newSession("emp", emp.id), rol: "emp", emp: publicEmp(emp), nombre: emp.nombre, jefe: !!emp.ver, admin: false, vapid: s.vapid_public }; }
    const { data: adm } = await sb.from("admin_cfg").select("pin_hash").eq("id", 1).maybeSingle();
    if (adm && adm.pin_hash === h) { await ok(); const { data: an } = await sb.from("admin_cfg").select("nombre").eq("id", 1).maybeSingle(); return { token: await newSession("admin", null), rol: "admin", emp: null, nombre: an?.nombre || "Administrador", jefe: true, admin: true, vapid: s.vapid_public }; }
    await sb.from("login_fallos").delete().lt("ts", new Date(Date.now() - 86400e3).toISOString());
    throw new HttpErr(401, "Clave incorrecta");
  },

  async setup(b) {
    const { count } = await sb.from("admin_cfg").select("id", { count: "exact", head: true });
    if ((count || 0) > 0) throw new HttpErr(403, "El administrador ya fue creado.");
    const s = await secrets();
    if (String(b.code || "").trim().toUpperCase() !== s.setup) throw new HttpErr(403, "Código de configuración incorrecto.");
    if (!isPin(b.pin)) throw new HttpErr(400, "El PIN debe tener 4 números.");
    const nombre = String(b.nombre || "").trim().slice(0, 30);
    if (!nombre) throw new HttpErr(400, "Escribe tu nombre.");
    const h = await hashPin(b.pin);
    const { data: clash } = await sb.from("empleados").select("id").eq("pin_hash", h).maybeSingle();
    if (clash) throw new HttpErr(409, "Esa clave ya la usa un empleado.");
    const { error } = await sb.from("admin_cfg").insert({ id: 1, pin_hash: h, nombre });
    if (error) throw error;
    return { token: await newSession("admin", null), rol: "admin", emp: null, nombre, jefe: true, admin: true, vapid: s.vapid_public };
  },

  async logout(b) { if (b.token) await sb.from("sesiones").delete().eq("token", b.token); return { ok: true }; },

  async yo(b) { const ses = await getSession(b.token); return { rol: ses.rol, emp: publicEmp(ses.emp), nombre: ses.nombre, jefe: ses.jefe, admin: ses.admin, vapid: (await secrets()).vapid_public }; },

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
    const ini = await inicioInfo(j, S.nowMinFor(j));
    return { fecha: j, ahora: Date.now(), entregas: ent || [], rutina: rut || [], urls: await signed(ses.jefe ? [...(rut || []).map((r: any) => r.foto), ...(ent || []).flatMap(entregaFotos)] : [...mine, ...myEnt]), emp: publicEmp(ses.emp), nombre: ses.nombre, equipo: Object.fromEntries((eq || []).map((x: any) => [x.id, x.nombre])), inicio: ini, retros_nuevas: ses.emp ? await retrosNuevas(ses.emp.id) : 0 };
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
    const ini = await inicioInfo(j, S.nowMinFor(j));
    if (!r.win && ini.m == null) throw new HttpErr(409, "La rutina aún no inicia. Pídele a tu supervisor que la inicie.");
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
    const a = S.analyze(r, itemsDe(hoy || [], j), S.nowMinFor(j), ini.m);
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
    const iniD = await inicioInfo(d.fecha, S.nowMinFor(d.fecha));
    const an = S.analyze(rDef, itemsDe(delDia || [], d.fecha), S.nowMinFor(d.fecha), iniD.m);
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
    const hor = await horarioCfg();
    const inicios = await iniciosRango(fecha < desde ? fecha : desde, hoyJ, hor, S.nowMinFor(hoyJ));
    const ini = await inicioInfo(fecha, fecha === hoyJ ? S.nowMinFor(hoyJ) : null, hor);
    return { fecha, hoy: hoyJ, ahora: Date.now(), entregas: ent || [], rutina: rut || [], rango: rango || [], inicios, inicio: ini, urls: await signed(paths), nombre: ses.nombre, equipo: Object.fromEntries((eq || []).map((x: any) => [x.id, x.nombre])) };
  },

  async rutina_iniciar(b) {
    const ses = await getSession(b.token);
    if (!ses.jefe) throw new HttpErr(403, "Solo supervisores y administrador inician la rutina.");
    const j = S.jornadaOf(Date.now()), now = S.nowMinFor(j);
    if (now >= S.CUT_MIN - 30) throw new HttpErr(409, "Ya es muy tarde para iniciar la rutina de hoy.");
    const ini = await inicioInfo(j, now);
    if (ini.m != null) throw new HttpErr(409, "La rutina ya inició a las " + S.fmtMin(ini.m) + (ini.por ? " (" + ini.por + ")" : "") + ".");
    const at = new Date().toISOString();
    const { error } = await sb.from("jornadas").insert({ fecha: j, inicio: at, por: quien(ses), auto: false });
    if (error) throw new HttpErr(409, "La rutina ya se inició.");
    const m = Math.round(S.minOf(at, j));
    await notify("todos", { title: "▶️ Rutina iniciada por " + quien(ses), body: "Desde las " + S.fmtMin(m) + ". Las primeras tareas tocan a las " + S.fmtMin(m + 60) + ".", tag: "inicio-" + j });
    return { inicio: await inicioInfo(j, S.nowMinFor(j)) };
  },

  async horario_guardar(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador cambia el horario.");
    const out: Record<string, string | null> = {};
    for (let d = 0; d < 7; d++) {
      const v = b.horario?.[String(d)];
      if (v == null || v === "") { out[String(d)] = null; continue; }
      const m = S.hhmmToMin(String(v));
      if (m == null || m < 7 * 60 || m > 22 * 60) throw new HttpErr(400, "La hora de inicio debe estar entre 7:00 a.m. y 10:00 p.m.");
      out[String(d)] = String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0");
    }
    await sb.from("config").upsert({ clave: "horario", valor: out });
    return { horario: out };
  },

  async mi_nombre(b) {
    const ses = await getSession(b.token);
    if (!ses.admin) throw new HttpErr(403, "Solo el administrador.");
    const nombre = String(b.nombre || "").trim().slice(0, 30);
    if (!nombre) throw new HttpErr(400, "Escribe tu nombre.");
    await sb.from("admin_cfg").update({ nombre }).eq("id", 1);
    return { nombre };
  },

  async mi_clave(b, req) {
    const ses = await getSession(b.token);
    const ip = (req.headers.get("x-forwarded-for") || "?").split(",")[0].trim();
    if (!isPin(b.actual) || !isPin(b.nueva)) throw new HttpErr(400, "Las claves son de 4 números.");
    const { data: intento } = await sb.from("login_fallos").insert({ ip }).select("id").single();
    const { count } = await sb.from("login_fallos").select("id", { count: "exact", head: true }).eq("ip", ip).gte("ts", new Date(Date.now() - 10 * 60e3).toISOString());
    if ((count || 0) > MAX_FAILS) throw new HttpErr(429, "Demasiados intentos. Espera 10 minutos.");
    const hA = await hashPin(b.actual), hN = await hashPin(b.nueva);
    const { data: adm } = await sb.from("admin_cfg").select("pin_hash").eq("id", 1).maybeSingle();
    let actualOk = false;
    if (ses.admin) actualOk = adm?.pin_hash === hA;
    else { const { data: e } = await sb.from("empleados").select("pin_hash").eq("id", ses.emp.id).maybeSingle(); actualOk = e?.pin_hash === hA; }
    if (!actualOk) throw new HttpErr(403, "Tu clave actual no es correcta.");
    if (intento) await sb.from("login_fallos").delete().eq("id", intento.id);
    if (b.actual === b.nueva) throw new HttpErr(400, "La clave nueva debe ser distinta a la actual.");
    const { data: clash } = await sb.from("empleados").select("id").eq("pin_hash", hN).maybeSingle();
    if ((clash && clash.id !== ses.emp?.id) || (!ses.admin && adm?.pin_hash === hN)) throw new HttpErr(409, "Esa clave no está disponible. Elige otra.");
    if (ses.admin) await sb.from("admin_cfg").update({ pin_hash: hN }).eq("id", 1);
    else await sb.from("empleados").update({ pin_hash: hN }).eq("id", ses.emp.id);
    return { ok: true };
  },

  async push_dnd(b) {
    await getSession(b.token);
    const ok = (v: any) => v == null || (Number.isInteger(v) && v >= 0 && v < 1440);
    if (!b.endpoint || !ok(b.ini) || !ok(b.fin)) throw new HttpErr(400, "Horario no válido.");
    const { data } = await sb.from("push_subs").update({ dnd_ini: b.ini ?? null, dnd_fin: b.fin ?? null }).eq("endpoint", b.endpoint).select("endpoint");
    if (!data?.length) throw new HttpErr(404, "Primero activa los avisos en este celular.");
    return { ok: true };
  },

  async mis_retros(b) {
    const ses = await getSession(b.token);
    if (!ses.emp) return { rutina: [], entregas: [], urls: {}, visto: null };
    const desde = S.addDays(S.jornadaOf(Date.now()), -13);
    const [{ data: rut }, { data: ent }, { data: e }] = await Promise.all([
      sb.from("rutina").select(RUT_COLS).eq("emp_id", ses.emp.id).gte("fecha", desde).or("nota.not.is.null,coment.not.is.null,anulado.eq.true").order("at", { ascending: false }),
      sb.from("entregas").select("*").eq("emp_id", ses.emp.id).gte("fecha", desde).order("inicio", { ascending: false }),
      sb.from("empleados").select("retro_visto").eq("id", ses.emp.id).maybeSingle(),
    ]);
    const paths = [...(rut || []).map((r: any) => r.foto), ...(ent || []).flatMap((x: any) => Object.entries(x.fotos || {}).filter(([k]) => x.calif?.[k]?.c || x.repetir?.[k]).map(([, p]) => p as string))];
    return { rutina: rut || [], entregas: ent || [], urls: await signed(paths), visto: e?.retro_visto || null };
  },

  async retros_visto(b) {
    const ses = await getSession(b.token);
    if (ses.emp) await sb.from("empleados").update({ retro_visto: new Date().toISOString() }).eq("id", ses.emp.id);
    return { ok: true };
  },

  async animo(b) {
    const ses = await getSession(b.token);
    const hoyJ = S.jornadaOf(Date.now()), lunes = S.lunesDe(hoyJ), lunesAnt = S.addDays(lunes, -7), desde = S.addDays(hoyJ, -30);
    const [{ data: rut }, { data: ent }, hor] = await Promise.all([
      sb.from("rutina").select("id,fecha,task_id,emp_id,nombre,at,nota,anulado,rep_de,rep_at").gte("fecha", desde < lunesAnt ? desde : lunesAnt),
      sb.from("entregas").select("fecha,emp_id,nombre,estado,area,turno,fotos,calif").gte("fecha", lunesAnt),
      horarioCfg(),
    ]);
    const inis = await iniciosRango(desde < lunesAnt ? desde : lunesAnt, hoyJ, hor, S.nowMinFor(hoyJ));
    const porDia: Record<string, any[]> = {};
    (rut || []).forEach((d: any) => (porDia[d.fecha] = porDia[d.fecha] || []).push(d));
    const dias: Record<string, any> = {};
    Object.keys(inis).forEach((j) => { const docs = (porDia[j] || []).sort((a: any, c: any) => (a.at < c.at ? -1 : 1)); dias[j] = S.porPersonaDia(docs, j, j === hoyJ ? S.nowMinFor(j) : null, inis[j]); });
    const rango = (a: string, z: string) => Object.keys(dias).filter((j) => j >= a && j <= z);
    const semana = S.puntosSemana(rango(lunes, hoyJ).map((j) => dias[j]), (ent || []).filter((e: any) => e.fecha >= lunes));
    const pasada = S.puntosSemana(rango(lunesAnt, S.addDays(lunes, -1)).map((j) => dias[j]), (ent || []).filter((e: any) => e.fecha >= lunesAnt && e.fecha < lunes));
    const desc = Object.keys(dias).sort().reverse().map((j) => dias[j]);
    const corto = (p: any) => ({ nombre: p.nombre, pts: p.pts, nota: p.nota });
    return { racha: ses.emp ? S.rachaDe(ses.emp.id, desc) : null, podio: semana.slice(0, 3).map(corto), ganador: pasada[0] && pasada[0].pts > 0 ? corto(pasada[0]) : null, semana_desde: lunes, tabla: ses.jefe ? semana : undefined };
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
    let enviados = 0;
    // Resumen para quien sale de "No molestar" con avisos pendientes.
    const cm = relojMin();
    const { data: pend } = await sb.from("push_subs").select("*").gt("pend", 0);
    webpush.setVapidDetails("mailto:avisos@beespizza.app", s.vapid_public, s.vapid_private);
    for (const sub of pend || []) {
      if (enDnd(sub, cm)) continue;
      await sb.from("push_subs").update({ pend: 0 }).eq("endpoint", sub.endpoint);
      try { await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, JSON.stringify({ title: "🔕 Terminó tu No molestar", body: "Llegaron " + sub.pend + " aviso" + (sub.pend > 1 ? "s" : "") + " mientras tanto. Ábrela para ver cómo va el día.", tag: "dnd" }), { TTL: 3600 }); enviados++; } catch {}
    }
    if (now < 420 || now >= S.CUT_MIN) return { ok: true, fuera: true, enviados };
    // Inicio programado: se marca una sola vez y se avisa a todos.
    const ini = await inicioInfo(j, now);
    if (ini.m != null && ini.auto) {
      const { error } = await sb.from("jornadas").insert({ fecha: j, inicio: new Date(S.jMidnightMs(j) + ini.m * 60e3).toISOString(), por: "Programada", auto: true });
      if (!error) { enviados++; await notify("todos", { title: "▶️ Rutina iniciada", body: "Inició a la hora programada, " + S.fmtMin(ini.m) + ". Las primeras tareas tocan a las " + S.fmtMin(ini.m + 60) + ".", tag: "inicio-" + j }); }
    }
    const { data: rut } = await sb.from("rutina").select(RUT_COLS).eq("fecha", j);
    const all = S.rutAll(rut || [], j, now, ini.m);
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
      // Exterior: por ahora solo al equipo (no al administrador).
      await notify(a.r.win ? "equipo" : "todos", { title: "⏰ " + a.r.t + " atrasado", body: a.text, tag: "atraso-" + a.r.id });
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
