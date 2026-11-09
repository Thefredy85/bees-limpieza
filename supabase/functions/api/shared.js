/* Bee's Pizza · Checklist de limpieza — lógica compartida entre la app y el servidor.
   Hora de Ciudad de México (UTC-6, sin horario de verano). */

export const TZ_OFFSET_MIN = -360;
export const TOL = 15;              /* tolerancia en minutos */
export const OPEN_MIN = 660;        /* 11:00 inicio de rutina por defecto */
export const CUT_MIN = 1410;        /* 23:30 fin de rutina (todos los días) */
export const DAY_START = 360;       /* 6:00 cambio de jornada */
export const REP_MIN = 20;          /* minutos para repetir una tarea */

/* Calificaciones: 4 Excelente · 3 Bueno · 2 Regular · 1 Malo */
export const NOTAS = { 4: ["🟢", "Excelente"], 3: ["🟡", "Bueno"], 2: ["🟠", "Regular"], 1: ["🔴", "Malo"] };
export function notaDe(avg) { return avg == null ? null : avg >= 3.5 ? 4 : avg >= 2.5 ? 3 : avg >= 1.75 ? 2 : 1; }
export function notaTxt(n) { return n ? NOTAS[n][0] + " " + NOTAS[n][1] : ""; }

export const TASKS = {
  cierre: {
    cocina: [
      { id: "c1", t: "Área de escaleras despejada" },
      { id: "c2", t: "Lavadero despejado, sin trapos" },
      { id: "c3", t: "Baño de personal limpio y trapeado" },
      { id: "c4", t: "Área de cajas despejada" },
      { id: "c5", t: "Pasillo del área de cajas despejado, barrido y trapeado" },
      { id: "c6", t: "Área de amasado limpia", n: "Mesa 1, mesa 2 y filtros deben verse limpios en la foto." },
      { id: "c7", t: "Área de wash libre y despejada" },
      { id: "c8", t: "Área de insumos en orden y acomodada" },
      { id: "c9", t: "Lavabo del personal limpio y despejado" },
      { id: "c10", t: "Cámara de refrigeración trapeada y en orden", p: ["Estante 1 en orden", "Estante 2 en orden", "Piso trapeado", "Área de masas", "Hawaianas limpias"] },
      { id: "c11", t: "Make limpia" },
      { id: "c12", t: "Área de laminado limpia" },
      { id: "c13", t: "Puerta entre salón y cocina limpia", p: ["Parte frontal", "Parte trasera"] }
    ],
    salon: [
      { id: "s1", t: "Baños limpios y sin botes de basura", p: ["Baño de chicos", "Baño de chicas", "Lavabo de chicos", "Lavabo de chicas"] },
      { id: "s2", t: "Área de salsas limpia y en orden", p: ["Bolsas retiradas", "Área limpia y en orden"] },
      { id: "s3", t: "Mesas limpias" },
      { id: "s4", t: "Salón barrido y trapeado, con mesas limpias", n: "Foto panorámica de todo el salón." },
      { id: "s5", t: "Teles apagadas", p: ["Tele 1", "Tele 2", "Tele 3"] },
      { id: "s6", t: "Taylor (máquina de helado) limpia y con seguro", n: "Debe verse toda la Taylor." },
      { id: "s7", t: "Área de caja en orden y limpia", p: ["Empaque, papeles y conos de helado", "Rollos y cajas 3 y 4"] },
      { id: "s8", t: "Estante de refrescos limpio y en modo hibernación", n: "Deben verse ambos refris." },
      { id: "s9", t: "Kratkos limpios y apagados", n: "Deben verse ambos Kratkos." },
      { id: "s10", t: "Horno apagado", n: "Deben verse las perillas." },
      { id: "s11", t: "Piso barrido y trapeado", p: ["Área de corte", "Área de caja"] },
      { id: "s12", t: "Tabletas de delivery apagadas y limpias" },
      { id: "s13", t: "Lavabo del personal (área de corte) limpio y en orden" },
      { id: "s14", t: "Área de corte limpia y despejada", p: ["Mesa de corte", "Mesa de especieros"] },
      { id: "s15", t: "Paneles frontales limpios", n: "Cristales frente a la caja." },
      { id: "s16", t: "Tapete tallado y limpio" }
    ]
  },
  apertura: { cocina: [], salon: [] }
};
export const AREAS = ["cocina", "salon"];
export const TURNOS = ["cierre", "apertura"];
export const AREA_NAME = { cocina: "Cocina", salon: "Salón" };
export const TURNO_NAME = { cierre: "Cierre", apertura: "Apertura" };

export const ZONAS = [
  { id: "banos", n: "Baños" },
  { id: "salon", n: "Salón" },
  { id: "cocina", n: "Cocina" },
  { id: "exterior", n: "Exterior" }
];
export const RUTINA = [
  { id: "r1", z: "banos", t: "Baños de clientes", d: "Limpieza y desinfección", every: 60 },
  { id: "r2", z: "banos", t: "Baños de colaboradores", d: "Limpieza y desinfección", every: 60 },
  { id: "r3", z: "salon", t: "Botes de basura", d: "Revisión y vaciado cuando sea necesario", every: 60 },
  { id: "r4", z: "salon", t: "Vidrios del área de corte", every: 120 },
  { id: "r5", z: "salon", t: "Mostrador y área de atención", every: 180 },
  { id: "r6", z: "salon", t: "Comedor", d: "Mesas, sillas y pisos", every: 180 },
  { id: "r7", z: "salon", t: "Área de cajas y terminales", every: 180 },
  { id: "r8", z: "cocina", t: "Área de amasado", every: 240 },
  { id: "r9", z: "cocina", t: "Vestidores de colaboradores", every: 240 },
  { id: "r10", z: "cocina", t: "Bodega", every: 240 },
  { id: "r11", z: "cocina", t: "Escaleras y pasillos internos", every: 240 },
  { id: "r12", z: "exterior", t: "Fachada y Alucobond", win: true },
  { id: "r13", z: "exterior", t: "Ventanas, cristales y puertas de vidrio", win: true },
  { id: "r14", z: "exterior", t: "Banqueta y acceso principal", win: true }
];
/* Rondas fijas de exterior: [inicio, fin, tolerancia]. La 1 debe estar lista a las 11:00 en punto. */
export const WINDOWS = [[540, 660, 0], [900, 1050, TOL], [1110, 1140, TOL]];

/* ---------- Tiempo ---------- */
const pad = (n) => String(n).padStart(2, "0");
export function mxDate(ms) { return new Date(ms + TZ_OFFSET_MIN * 60000); }
export function jornadaOf(ms) {
  let d = mxDate(ms ?? Date.now());
  if (d.getUTCHours() < 6) d = new Date(d.getTime() - 86400000);
  return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
}
export function jMidnightMs(j) { const [y, m, d] = j.split("-").map(Number); return Date.UTC(y, m - 1, d) - TZ_OFFSET_MIN * 60000; }
export function minOf(iso, j) { return (Date.parse(iso) - jMidnightMs(j)) / 60000; }
export function nowMinFor(j, ms) { return ((ms ?? Date.now()) - jMidnightMs(j)) / 60000; }
export function addDays(j, n) { const [y, m, d] = j.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d + n)); return t.getUTCFullYear() + "-" + pad(t.getUTCMonth() + 1) + "-" + pad(t.getUTCDate()); }
export function fmtMin(m) { m = Math.round(m) % 1440; const h = Math.floor(m / 60), mi = m % 60; return (h % 12 || 12) + ":" + pad(mi) + (h < 12 ? " a.m." : " p.m."); }
export function horaIso(iso) { if (!iso) return ""; const d = mxDate(Date.parse(iso)); const h = d.getUTCHours(), mi = d.getUTCMinutes(); return (h % 12 || 12) + ":" + pad(mi) + (h < 12 ? " a.m." : " p.m."); }
export function durTxt(m) { m = Math.max(0, Math.round(m)); if (m < 60) return m + " min"; const h = Math.floor(m / 60), r = m % 60; return h + " h" + (r ? " " + r + " min" : ""); }
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
export function fechaLarga(j) { const [y, m, d] = j.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d)); return DIAS[t.getUTCDay()] + " " + d + " de " + MESES[m - 1]; }
export function diaCorto(j) { const [y, m, d] = j.split("-").map(Number); return DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()].slice(0, 3); }
export function everyLabel(r) { return r.win ? "3 veces al día" : r.every === 60 ? "Cada hora" : "Cada " + r.every / 60 + " horas"; }

/* ---------- Entregas ---------- */
export function tasksOf(turno, area) { return (TASKS[turno] && TASKS[turno][area]) || []; }
export function slots(area, turno) {
  const out = [];
  tasksOf(turno || "cierre", area).forEach((t, ti) => {
    (t.p || ["Foto"]).forEach((label, i) => out.push({ key: t.id + "-" + i, task: t, ti, i, label, multi: !!t.p }));
  });
  return out;
}
export function countDone(e) { const f = (e && e.fotos) || {}; return slots(e.area, e.turno).filter((s) => f[s.key]).length; }
export function pendRepetir(e) { return Object.keys((e && e.repetir) || {}).length; }
/* Calificación general de una entrega: promedio de las fotos calificadas. */
export function califEntrega(e) {
  const ks = slots(e.area, e.turno).filter((s) => e.fotos && e.fotos[s.key]);
  const ns = ks.map((s) => e.calif && e.calif[s.key] && e.calif[s.key].n).filter(Boolean);
  const avg = ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
  return { avg, nota: notaDe(avg), rated: ns.length, total: ks.length };
}
export function califRutina(docs) {
  const ns = docs.filter((d) => d.nota).map((d) => d.nota);
  const avg = ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : null;
  const by = { 4: 0, 3: 0, 2: 0, 1: 0 }; ns.forEach((n) => by[n]++);
  return { avg, nota: notaDe(avg), rated: ns.length, by };
}

/* ---------- Rutina ---------- */
/* Horarios esperados. H: hora programada · dl: límite a tiempo · from/to: cuándo cuenta un registro. */
export function schedule(r, ini) {
  const out = [];
  if (r.win) {
    WINDOWS.forEach((w, i) => out.push({ i, H: w[0], end: w[1], dl: w[1] + w[2], from: w[0], to: i + 1 < WINDOWS.length ? WINDOWS[i + 1][0] : CUT_MIN, label: "Ronda " + (i + 1) }));
    return out;
  }
  /* Sin inicio no hay horarios: la rutina cuenta desde que alguien la inicia (o desde la hora programada). */
  if (ini == null) return out;
  for (let H = ini + r.every, i = 0; H < CUT_MIN; H += r.every, i++) {
    out.push({ i, H, dl: H + TOL, from: i === 0 ? ini : H - r.every + TOL, to: Math.min(H + r.every, CUT_MIN), label: fmtMin(H) });
  }
  return out;
}
/* Cada registro cubre el primer horario pendiente que lo acepte (primero el atrasado). */
export function assign(sch, ms) {
  const filled = sch.map(() => null), extras = [];
  ms.forEach((m, ix) => {
    const k = sch.findIndex((s, i) => !filled[i] && m >= s.from && m <= s.to);
    if (k < 0) { extras.push({ m, ix }); return; }
    const s = sch[k];
    filled[k] = { m, ix, late: m > s.dl ? Math.round(m - (s.end != null ? s.end : s.H)) : 0 };
  });
  return { filled, extras };
}
/* Semáforo de una tarea. now = minuto actual de la jornada, o null para días pasados.
   items: registros [{m, id, anulado, rep_de, rep_at_m}] (o solo minutos).
   Un registro anulado ("Repetir, por favor") deja su horario pendiente REP_MIN minutos;
   la repetición lo cubre pero siempre cuenta como tarde. */
export function analyze(r, itemsIn, now, ini) {
  const items = itemsIn.map((x) => (typeof x === "number" ? { m: x } : x));
  const sch = schedule(r, ini);
  const normalIx = []; items.forEach((it, i) => { if (!it.rep_de) normalIx.push(i); });
  const as = assign(sch, normalIx.map((i) => items[i].m));
  const filled = as.filled.map((f) => (f ? { ...f, ix: normalIx[f.ix] } : null));
  const extras = as.extras.map((x) => ({ ...x, ix: normalIx[x.ix] }));
  const repPend = sch.map(() => null);
  filled.forEach((f, k) => {
    if (!f || !items[f.ix].anulado) return;
    const it = items[f.ix], s = sch[k];
    const repIx = items.findIndex((x) => x.rep_de && x.rep_de === it.id);
    if (repIx >= 0) { const rm = items[repIx].m; filled[k] = { m: rm, ix: repIx, late: Math.max(1, Math.round(rm - (s.end != null ? s.end : s.H))), rep: true, orig: f.ix }; }
    else { filled[k] = null; repPend[k] = { ix: f.ix, until: (it.rep_at_m != null ? it.rep_at_m : f.m) + REP_MIN }; }
  });
  const out = { r, sch, filled, extras, repPend, rep: null, state: "gray", text: "", fill: 0, rank: 3, left: 1e9, ok: 0, late: 0, missed: 0, pending: 0, next: null };
  sch.forEach((s, i) => {
    const f = filled[i], rp = repPend[i];
    if (f) { if (f.late) out.late++; else out.ok++; }
    else if (rp) { if (now == null || now > rp.until) out.missed++; else out.pending++; }
    else if (now == null || s.to <= now) out.missed++;
    else out.pending++;
  });
  if (now == null) return out;
  const rk = repPend.findIndex(Boolean);
  if (rk >= 0 && now < CUT_MIN) {
    const rp = repPend[rk];
    out.rep = { k: rk, ix: rp.ix, until: rp.until, vencido: now > rp.until };
    out.state = "red"; out.rank = -1; out.fill = 1; out.left = rp.until - now; out.next = sch[rk];
    out.text = now > rp.until ? "🔁 Repetir · venció hace " + durTxt(now - rp.until) : "🔁 Repetir antes de " + fmtMin(rp.until);
    return out;
  }
  const p = sch.findIndex((s, i) => !filled[i] && !repPend[i] && s.to > now);
  const firstStart = WINDOWS[0][0];
  if (!r.win && ini == null && now < CUT_MIN) { out.state = "off"; out.rank = 4; out.text = "La rutina aún no inicia"; out.noIni = true; return out; }
  if (now >= CUT_MIN) { out.state = "off"; out.rank = 4; out.text = "Fuera de horario · todo en orden"; return out; }
  if (p < 0) { out.state = "green"; out.rank = 2; out.fill = 1; out.text = r.win ? (out.ok + out.late) + " de 3 rondas hechas" : "Al día hasta las 11:30 p.m."; return out; }
  const s = sch[p]; out.next = s;
  if (r.win) {
    if (now < s.H) {
      if (p === 0 && now < firstStart) { out.state = "off"; out.rank = 4; out.text = "Ronda 1 de 9:00 a 11:00 a.m."; return out; }
      out.state = "green"; out.rank = 2; out.left = s.H - now; out.fill = 0.05; out.text = s.label + ": " + fmtMin(s.H) + " a " + fmtMin(s.end);
    } else if (now <= s.dl) {
      out.state = "yellow"; out.rank = 1; out.left = s.dl - now; out.fill = Math.min(1, (now - s.H) / (s.end - s.H));
      out.text = now <= s.end ? "Toca " + s.label.toLowerCase() + " · antes de " + fmtMin(s.end) : "Toca " + s.label.toLowerCase() + " · hasta " + fmtMin(s.dl);
    } else { out.state = "red"; out.rank = 0; out.left = s.dl - now; out.fill = 1; out.text = s.label + " atrasada " + durTxt(now - s.end); }
    return out;
  }
  const start = p > 0 ? sch[p - 1].H : s.H - r.every;
  if (now > s.dl) { out.state = "red"; out.rank = 0; out.left = s.dl - now; out.fill = 1; out.text = "Atrasado " + durTxt(now - s.H) + " · tocaba " + fmtMin(s.H); }
  else if (now >= s.H - 10) { out.state = "yellow"; out.rank = 1; out.left = s.dl - now; out.fill = Math.min(1, Math.max(0.85, (now - start) / (s.H - start))); out.text = now < s.H ? "Toca a las " + fmtMin(s.H) + " · en " + durTxt(s.H - now) : "Ya toca · hasta " + fmtMin(s.dl); }
  else { out.state = "green"; out.rank = 2; out.left = s.H - now; out.fill = Math.max(0.05, Math.min(1, (now - start) / (s.H - start))); out.text = "Siguiente " + fmtMin(s.H) + " · en " + durTxt(s.H - now); }
  return out;
}
export function rutByTask(docs) {
  const g = {}; RUTINA.forEach((r) => (g[r.id] = []));
  docs.forEach((d) => { if (g[d.task_id]) g[d.task_id].push(d); });
  Object.values(g).forEach((a) => a.sort((x, y) => (x.at < y.at ? -1 : 1)));
  return g;
}
export function rutAll(docs, j, now, ini) {
  const g = rutByTask(docs);
  return RUTINA.map((r, idx) => {
    const items = g[r.id].map((d) => ({ m: minOf(d.at, j), id: d.id, anulado: !!d.anulado, rep_de: d.rep_de || null, rep_at_m: d.rep_at ? minOf(d.rep_at, j) : null }));
    const a = analyze(r, items, now, ini); a.idx = idx; a.docs = g[r.id]; return a;
  });
}
export function dayStats(all) {
  const s = { ok: 0, late: 0, missed: 0, pending: 0, red: 0, yellow: 0 };
  all.forEach((a) => { s.ok += a.ok; s.late += a.late; s.missed += a.missed; s.pending += a.pending; if (a.state === "red") s.red++; if (a.state === "yellow") s.yellow++; });
  s.due = s.ok + s.late + s.missed; s.pct = s.due ? Math.round((s.ok / s.due) * 100) : null;
  return s;
}

/* ---------- WhatsApp ---------- */
export function resumenEntrega(e) {
  const ss = slots(e.area, e.turno), f = e.fotos || {}, tasks = tasksOf(e.turno, e.area);
  let ok = 0;
  const cal = e.calif || {};
  const rows = tasks.map((t) => {
    const mine = ss.filter((s) => s.task.id === t.id), done = mine.every((s) => f[s.key]); if (done) ok++;
    const notas = mine.map((s) => cal[s.key]).filter((c) => c && c.n);
    const worst = notas.length ? notas.reduce((a, b) => (b.n < a.n ? b : a)) : null;
    const extra = worst ? " · " + NOTAS[worst.n][0] + (worst.n <= 2 && worst.c ? " " + worst.c : "") : "";
    return (done ? "✅ " : "❌ ") + t.t + extra;
  });
  const c = califEntrega(e);
  const head = ["*Entrega de " + TURNO_NAME[e.turno].toLowerCase() + "*", "Bee's Pizza Sullivan · " + AREA_NAME[e.area], "📅 " + fechaLarga(e.fecha), "👤 " + e.nombre,
    "🕒 Inició " + horaIso(e.inicio) + (e.estado === "entregado" ? " · Entregó " + horaIso(e.fin) : " · ⏳ En curso"),
    "📋 " + ok + "/" + tasks.length + " tareas · " + countDone(e) + "/" + ss.length + " fotos"];
  if (c.nota) head.push("⭐ Calificación: " + notaTxt(c.nota) + " (" + c.avg.toFixed(1) + ") · " + c.rated + "/" + c.total + " fotos calificadas");
  if (e.nota_general) head.push("💬 " + e.nota_general + (e.nota_por ? " — " + e.nota_por : ""));
  return head.concat([""], rows).join("\n");
}
export function resumenRutina(j, docs, isToday, ini) {
  const now = isToday ? nowMinFor(j) : null, all = rutAll(docs, j, now, ini), st = dayStats(all);
  const lines = ["*Checklist de rutina*", "Bee's Pizza Sullivan", "📅 " + fechaLarga(j) + (isToday ? " · corte " + horaIso(new Date().toISOString()) : ""),
    ini == null ? "▶️ La rutina no se inició" : "▶️ Inició " + fmtMin(ini),
    "📋 " + (st.pct == null ? "Sin horarios vencidos aún" : st.pct + "% a tiempo") + " · ✅ " + st.ok + " · ⚠️ " + st.late + " tarde · ❌ " + st.missed + " sin hacer"];
  const cr = califRutina(docs.filter((d) => !d.anulado || d.nota));
  const reps = docs.filter((d) => d.anulado).length;
  if (cr.rated || reps) lines.push("⭐ " + [4, 3, 2, 1].map((n) => NOTAS[n][0] + " " + cr.by[n]).join(" · ") + (reps ? " · 🔁 " + reps + " repetida" + (reps > 1 ? "s" : "") : ""));
  lines.push("");
  ZONAS.forEach((z) => {
    lines.push("*" + z.n.toUpperCase() + "*");
    all.filter((a) => a.r.z === z.id).forEach((a) => {
      const parts = [];
      a.sch.forEach((s, i) => {
        const f = a.filled[i];
        if (f) { const d = a.docs[f.ix]; parts.push((f.rep ? "🔁 " : f.late ? "⚠️ " : "✅ ") + horaIso(d.at) + " " + d.nombre + (f.rep ? " (repetida)" : f.late ? " (tarde " + durTxt(f.late) + ")" : "") + (d.nota ? " " + NOTAS[d.nota][0] : "")); }
        else if (a.repPend[i]) parts.push("🔁 " + (a.r.win ? s.label.toLowerCase() : fmtMin(s.H)) + " por repetir");
        else if (now == null || s.to <= now) parts.push("❌ " + (a.r.win ? s.label.toLowerCase() : fmtMin(s.H)) + " sin hacer");
      });
      lines.push("• " + a.r.t + ": " + (parts.length ? parts.join(" · ") : "aún no toca"));
    });
    lines.push("");
  });
  return lines.join("\n").trim();
}

/* ---------- Inicio de rutina ---------- */
export const DIAS_SEM = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export function diaSem(j) { const [y, m, d] = j.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); }
export function hhmmToMin(t) { const m = /^(\d{1,2}):(\d{2})$/.exec(t || ""); return m ? +m[1] * 60 + +m[2] : null; }
/* Minuto de inicio de una jornada: el que alguien marcó, o el programado si ya pasó. null = aún no inicia. */
export function inicioDe(j, fila, horario, now) {
  if (fila && fila.inicio) return Math.round(minOf(fila.inicio, j));
  const prog = hhmmToMin(horario && horario[String(diaSem(j))]);
  if (prog == null) return null;
  return now == null || now >= prog ? prog : null;
}

/* ---------- Ánimo: racha y semana ---------- */
export function lunesDe(j) { const d = diaSem(j); return addDays(j, -((d + 6) % 7)); }
/* Por persona: a tiempo, tarde, repetidas y calificaciones de un día de rutina. */
export function porPersonaDia(docs, j, now, ini) {
  const out = {};
  const P = (d) => (out[d.emp_id] = out[d.emp_id] || { nombre: d.nombre, ok: 0, late: 0, rep: 0, notas: [] });
  rutAll(docs, j, now, ini).forEach((a) => {
    a.filled.forEach((f) => { if (!f) return; const d = a.docs[f.ix]; if (!d.emp_id) return; const p = P(d); if (f.rep || f.late) p.late++; else p.ok++; });
    a.docs.forEach((d) => { if (!d.emp_id) return; const p = P(d); if (d.anulado) p.rep++; if (d.nota) p.notas.push(d.nota); });
  });
  return out;
}
const NPTS = { 4: 2, 3: 1, 2: 0, 1: -1 };
/* Puntos de la semana: a tiempo +3, tarde +1, repetir -2, calificación 🟢+2 🟡+1 🟠0 🔴-1, entrega completa +5 y su calificación general ×2. */
export function puntosSemana(dias, entregas) {
  const t = {};
  const P = (id, nombre) => (t[id] = t[id] || { id, nombre, pts: 0, ok: 0, late: 0, rep: 0, ent: 0, notas: [] });
  dias.forEach((pp) => Object.entries(pp).forEach(([id, x]) => { const p = P(id, x.nombre); p.ok += x.ok; p.late += x.late; p.rep += x.rep; p.notas.push(...x.notas); }));
  (entregas || []).forEach((e) => { if (!e.emp_id || e.estado !== "entregado") return; const p = P(e.emp_id, e.nombre); p.ent++; p.pts += 5; const c = califEntrega(e); if (c.nota) p.pts += NPTS[c.nota] * 2; });
  Object.values(t).forEach((p) => { p.pts += p.ok * 3 + p.late - p.rep * 2 + p.notas.reduce((a, n) => a + NPTS[n], 0); const c = p.notas.length ? p.notas.reduce((a, b) => a + b, 0) / p.notas.length : null; p.nota = notaDe(c); delete p.notas; });
  return Object.values(t).sort((a, b) => b.pts - a.pts || b.ok - a.ok);
}
/* Racha: días seguidos (hacia atrás) en que la persona registró rutina sin tardes ni repeticiones. Los días sin registros no cuentan ni la rompen. */
export function rachaDe(empId, diasDesc) {
  let n = 0;
  for (const pp of diasDesc) {
    const x = pp[empId];
    if (!x || x.ok + x.late + x.rep === 0) continue;
    if (x.late || x.rep) break;
    n++;
  }
  return n;
}
