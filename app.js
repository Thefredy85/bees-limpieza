/* Bee's Pizza · Checklist de limpieza — app móvil. */
import * as S from "./shared.js";

const API = "https://iwjhmdeffwhqxmcivfso.supabase.co/functions/v1/api";
const KEY = "sb_publishable_juXxPOjPZEbao5Ky4v1Yww_DD3xDjXj";
const LS = "bees-checklist-v1";

/* ---------------- Íconos ---------------- */
const sv = (p, w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const I = {
  cam: sv('<path d="M3 8h3.5l2-3h7l2 3H21v12H3z"/><circle cx="12" cy="13.5" r="3.8"/>'),
  gal: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/>'),
  check: sv('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.6),
  bell: sv('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  out: sv('<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>'),
  x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
  flip: sv('<path d="M4 7h12l-3-3M20 17H8l3 3"/>'),
  chev: sv('<path d="M6 9l6 6 6-6"/>'),
  right: sv('<path d="M9 6l6 6-6 6"/>'),
  left: sv('<path d="M15 6l-6 6 6 6"/>'),
  list: sv('<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>'),
  moon: sv('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  cal: sv('<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>'),
  chart: sv('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'),
  users: sv('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 20a6.5 6.5 0 0 0-2.5-5"/>'),
  gear: sv('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>'),
  wa: sv('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8c-1-.5-1.8-1.3-2.3-2.3l.8-1-1-2z"/>'),
  dl: sv('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>'),
  trash: sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  banos: sv('<path d="M4 12h16v2a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6z"/><path d="M6 12V5a2 2 0 0 1 4 0"/>'),
  salon: sv('<path d="M3 10h18M5 10v10M19 10v10M8 10V6h8v4M9 20v-5h6v5"/>'),
  cocina: sv('<path d="M6 14a4 4 0 0 1-1-7.8A5 5 0 0 1 14.6 5 4 4 0 1 1 18 14"/><path d="M6 14h12v6H6z"/>'),
  exterior: sv('<path d="M3 21h18M4 21V10l8-6 8 6v11"/><path d="M9 21v-6h6v6"/>'),
};

/* ---------------- Utilidades ---------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "x";
const store = { get() { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } }, set(v) { try { localStorage.setItem(LS, JSON.stringify(v)); } catch {} } };
let toastT;
function toast(msg, ms = 3200) { const t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), ms); }
function vibrate(p) { try { navigator.vibrate && navigator.vibrate(p); } catch {} }
const waLink = (t) => "https://wa.me/?text=" + encodeURIComponent(t);
async function copy(t) { try { await navigator.clipboard.writeText(t); toast("Texto copiado. Pégalo en WhatsApp."); } catch { toast("No se pudo copiar."); } }

/* ---------------- Estado ---------------- */
const st = {
  token: null, me: null, tab: "rutina", skew: 0,
  hoy: null, ent: null, entUrls: {}, busy: {},
  panel: { fecha: null, data: null, sub: "rutina", zone: "todas", open: new Set() },
  emps: null, zoneOpen: {}, alerted: new Set(), alertInit: false,
  pin: "", pinErr: "", checking: false, estado: null, installEvt: null,
};
const nowMs = () => Date.now() + st.skew;
const today = () => S.jornadaOf(nowMs());
const nowMin = () => S.nowMinFor(today(), nowMs());

/* ---------------- API ---------------- */
async function api(action, body = {}) {
  let res;
  try {
    res = await fetch(API, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY }, body: JSON.stringify({ action, token: st.token, ...body }) });
  } catch { throw new Error("Sin conexión. Revisa el internet e intenta otra vez."); }
  let data = {};
  try { data = await res.json(); } catch {}
  if (res.status === 401 && st.token && action !== "login") { logout(true); throw new Error(data.error || "Tu sesión terminó."); }
  if (!res.ok) throw new Error(data.error || "Ocurrió un error. Intenta otra vez.");
  if (data.ahora) st.skew = data.ahora - Date.now();
  return data;
}

/* ---------------- Hojas (bottom sheets) ---------------- */
function sheet(html, wire) {
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  const close = () => bg.remove();
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  document.body.appendChild(bg);
  wire && wire(bg.firstChild, close);
  return close;
}
function confirmSheet(title, text, ok = "Aceptar", danger = false) {
  return new Promise((res) => {
    sheet(`<h2>${esc(title)}</h2>${text ? `<p class="mu" style="margin:0">${esc(text)}</p>` : ""}
      <button class="btn ${danger ? "danger" : "honey"} block" data-a="ok">${esc(ok)}</button>
      <button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
      $("[data-a=ok]", s).onclick = () => { close(); res(true); };
      $("[data-a=no]", s).onclick = () => { close(); res(false); };
    });
  });
}
function lightbox(url, cap) {
  const d = document.createElement("div"); d.className = "light";
  d.innerHTML = `<div><img alt="" src="${esc(url)}"><p>${esc(cap)}</p></div>`;
  d.onclick = () => d.remove(); document.body.appendChild(d);
}
function doneOverlay(title, line1, line2) {
  const d = document.createElement("div"); d.className = "done-ov";
  d.innerHTML = `<div class="box"><div class="ckc">${I.check}</div><b style="font:800 20px/1.2 var(--fb)">${esc(title)}</b><span>${esc(line1)}</span>${line2 ? `<span class="mu sm">${esc(line2)}</span>` : ""}</div>`;
  d.onclick = () => d.remove(); document.body.appendChild(d);
  setTimeout(() => d.remove(), 2600);
}

/* ---------------- Calificaciones ---------------- */
const rateBtns = (sel, attr) => `<div class="rate">${[4, 3, 2, 1].map((n) => `<button class="rb ${sel === n ? "on" : ""}" data-${attr}="${n}" aria-pressed="${sel === n}"><span>${S.NOTAS[n][0]}</span>${S.NOTAS[n][1]}</button>`).join("")}</div>`;
const notaPill = (n) => n ? `<span class="pill ${n >= 4 ? "ok" : n === 3 ? "run" : "bad"}">${S.notaTxt(n)}</span>` : "";
/* Mantener presionado: abre la barrita rápida de calificación (como las reacciones de WhatsApp). */
function longPress(el, fn) {
  let t = null, sx = 0, sy = 0;
  const cancel = () => { if (t) { clearTimeout(t); t = null; } };
  el.addEventListener("pointerdown", (e) => { sx = e.clientX; sy = e.clientY; cancel(); t = setTimeout(() => { t = null; el.dataset.lp = "1"; vibrate(25); fn(sx, sy); }, 450); });
  el.addEventListener("pointermove", (e) => { if (Math.abs(e.clientX - sx) > 8 || Math.abs(e.clientY - sy) > 8) cancel(); });
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => el.addEventListener(ev, cancel));
  el.addEventListener("contextmenu", (e) => e.preventDefault());
  el.addEventListener("click", (e) => { if (el.dataset.lp) { e.preventDefault(); e.stopPropagation(); delete el.dataset.lp; } }, true);
}
function quickRate(x, y, onPick) {
  $$(".qpop").forEach((p) => p.remove());
  const p = document.createElement("div"); p.className = "qpop"; p.setAttribute("role", "menu");
  p.innerHTML = [4, 3, 2, 1].map((n) => `<button role="menuitem" data-n="${n}" aria-label="${S.NOTAS[n][1]}">${S.NOTAS[n][0]}</button>`).join("");
  document.body.appendChild(p);
  const w = p.offsetWidth || 220;
  p.style.left = Math.max(8, Math.min(innerWidth - w - 8, x - w / 2)) + "px";
  p.style.top = Math.max(8, y - 76) + "px";
  const out = (e) => { if (!p.contains(e.target)) close(); };
  const close = () => { p.remove(); document.removeEventListener("pointerdown", out, true); };
  setTimeout(() => document.addEventListener("pointerdown", out, true), 0);
  p.onclick = (e) => { const b = e.target.closest("[data-n]"); if (b) { close(); vibrate(20); onPick(+b.dataset.n); } };
}
async function rateRutina(id, nota, coment) {
  try {
    const body = { id }; if (nota !== undefined) body.nota = nota; if (coment !== undefined) body.coment = coment;
    const r = await api("rutina_calificar", body);
    const D = st.panel.data, i = D.rutina.findIndex((x) => x.id === id); if (i >= 0) D.rutina[i] = { ...D.rutina[i], ...r.registro };
    toast(nota ? S.notaTxt(r.registro.nota) + " guardado" : "Comentario guardado"); renderMain();
  } catch (e) { toast(e.message); }
}
function repetirRutinaSheet(d) {
  const t = S.RUTINA.find((x) => x.id === d.task_id);
  sheet(`<h2>🔁 Repetir, por favor</h2><span class="mu sm">${esc(t?.t)} · ${esc(d.nombre)} · ${S.horaIso(d.at)}</span>
    <label class="lb" for="rt">¿Qué hay que corregir?</label><textarea id="rt" maxlength="200" placeholder="Ej. quedó agua en el piso"></textarea>
    <span class="lb">¿A quién se lo pides?</span>
    <button class="btn honey block" data-a="mismo">Pedírselo a ${esc(d.nombre)}</button>
    <button class="btn lt block" data-a="todos">A quien esté en turno</button>
    <span class="mu xs">Tiene ${S.REP_MIN} minutos. Si se lo pides a ${esc(d.nombre)} y no la repite a tiempo, se abre a todo el turno. Cuenta como tarde aunque la corrijan.</span>
    <p class="err" id="re"></p><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    const go = async (para, b) => {
      const txt = $("#rt", s).value.trim(); if (!txt) return ($("#re", s).textContent = "Escribe qué hay que corregir.");
      b.disabled = true;
      try { await api("rutina_repetir", { id: d.id, txt, para }); close(); toast("Se pidió repetir. Ya le avisamos."); refreshPanel(true); }
      catch (e) { $("#re", s).textContent = e.message; b.disabled = false; }
    };
    $("[data-a=mismo]", s).onclick = (e) => go("mismo", e.currentTarget);
    $("[data-a=todos]", s).onclick = (e) => go("todos", e.currentTarget);
  });
}
/* Galería para calificar las fotos de una entrega: desliza, califica y pasa a la siguiente. */
function galeriaEntrega(entId, startKey) {
  const D = st.panel.data;
  const get = () => D.entregas.find((x) => x.id === entId);
  let e = get(); const keys = S.slots(e.area, e.turno).filter((s) => e.fotos[s.key]);
  let i = Math.max(0, keys.findIndex((s) => s.key === startKey));
  sheet(`<div id="gvw"></div>`, (sh, close) => {
    const box = $("#gvw", sh);
    const draw = () => {
      e = get(); const s = keys[i], cal = (e.calif || {})[s.key] || {}, rep = (e.repetir || {})[s.key], url = D.urls[e.fotos[s.key]], c = S.califEntrega(e);
      box.innerHTML = `<div style="display:grid;gap:10px">
        <div class="gv"><img alt="" src="${esc(url || "")}"><span class="cnt">${i + 1} / ${keys.length}</span>${i > 0 ? `<button class="nav prev" data-a="prev" aria-label="Anterior">${I.left}</button>` : ""}${i < keys.length - 1 ? `<button class="nav next" data-a="next" aria-label="Siguiente">${I.right}</button>` : ""}</div>
        <div><b style="font-size:16px">${esc(s.task.t)}</b>${s.multi ? `<div class="mu sm">${esc(s.label)}</div>` : ""}</div>
        ${rep ? `<div class="repbox"><b>🔁 Repetir pedido</b><span class="sm">${esc(rep.txt)} — ${esc(rep.por)}</span></div>` : ""}
        ${rateBtns(cal.n, "rn")}
        <textarea id="gc" maxlength="300" placeholder="Comentario de esta foto (opcional)">${esc(cal.c || "")}</textarea>
        <div style="display:flex;gap:8px"><button class="btn lt" style="flex:1" data-a="savec">Guardar comentario</button>${e.turno === "apertura" && !rep ? `<button class="btn danger" data-a="rep">🔁 Repetir</button>` : ""}</div>
        <span class="mu xs" style="text-align:center">${c.rated} de ${c.total} calificadas${c.nota ? " · General: " + S.notaTxt(c.nota) : ""}</span>
        <button class="btn block" data-a="close">Listo</button></div>`;
    };
    const save = async (body, advance) => {
      try { const r = await api("entrega_calificar", { id: entId, key: keys[i].key, ...body }); const k = D.entregas.findIndex((x) => x.id === entId); D.entregas[k] = r.entrega; vibrate(20);
        if (advance && i < keys.length - 1) { i++; } draw(); }
      catch (er) { toast(er.message); }
    };
    box.addEventListener("click", (ev) => {
      const b = ev.target.closest("[data-a],[data-rn]"); if (!b) return;
      if (b.dataset.rn) return save({ nota: +b.dataset.rn, coment: $("#gc", box).value }, true);
      const a = b.dataset.a;
      if (a === "prev" && i > 0) { i--; draw(); }
      if (a === "next" && i < keys.length - 1) { i++; draw(); }
      if (a === "savec") save({ coment: $("#gc", box).value }, false).then(() => toast("Comentario guardado"));
      if (a === "close") { close(); renderMain(); }
      if (a === "rep") {
        const txt = prompt2("¿Qué hay que corregir en esta foto?", async (t) => {
          try { const r = await api("entrega_repetir", { id: entId, key: keys[i].key, txt: t }); const k = D.entregas.findIndex((x) => x.id === entId); D.entregas[k] = r.entrega; draw(); toast("Se pidió repetir. Ya le avisamos."); }
          catch (er) { toast(er.message); }
        });
      }
    });
    let tx = null;
    box.addEventListener("touchstart", (ev) => { if (ev.target.closest(".gv")) tx = ev.touches[0].clientX; }, { passive: true });
    box.addEventListener("touchend", (ev) => { if (tx == null) return; const dx = ev.changedTouches[0].clientX - tx; tx = null; if (Math.abs(dx) > 50) { if (dx < 0 && i < keys.length - 1) i++; else if (dx > 0 && i > 0) i--; draw(); } });
    draw();
  });
}
function prompt2(title, onOk, value = "") {
  sheet(`<h2>${esc(title)}</h2><textarea id="p2" maxlength="300">${esc(value)}</textarea><p class="err" id="p2e"></p><button class="btn honey block" data-a="ok">Enviar</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = () => { const t = $("#p2", s).value.trim(); if (!t) return ($("#p2e", s).textContent = "Escribe un comentario."); close(); onOk(t); };
    setTimeout(() => $("#p2", s).focus(), 50);
  });
}

/* ---------------- Fotos ---------------- */
function scaleToJpeg(src, w, h) {
  const max = 1600, r = Math.min(1, max / Math.max(w, h));
  const c = document.createElement("canvas"); c.width = Math.round(w * r); c.height = Math.round(h * r);
  c.getContext("2d").drawImage(src, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("No se pudo procesar la foto."))), "image/jpeg", 0.8));
}
function fileToJpeg(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => { scaleToJpeg(img, img.naturalWidth, img.naturalHeight).then(res, rej).finally(() => URL.revokeObjectURL(url)); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("No se pudo leer la foto. Prueba con otra.")); };
    img.src = url;
  });
}
const blobToB64 = (b) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(",")[1]); r.onerror = rej; r.readAsDataURL(b); });
function pickFile(cam) {
  return new Promise((res) => {
    const inp = $(cam ? "#fileCam" : "#fileGal"); inp.value = "";
    inp.onchange = () => res(inp.files && inp.files[0] ? inp.files[0] : null);
    inp.click();
  });
}

/* Cámara dentro de la app (getUserMedia). Si el navegador no la permite, usa la del teléfono. */
function openCamera({ title, sub, onPhoto }) {
  const ov = document.createElement("div"); ov.className = "cam";
  ov.innerHTML = `<video playsinline autoplay muted></video><img class="prev" alt="" hidden>
    <div class="ct"><button class="round" data-a="close" aria-label="Cerrar cámara">${I.x}</button><b>${esc(title)}${sub ? `<br><span style="font-weight:600;font-size:12px;opacity:.85">${esc(sub)}</span>` : ""}</b></div>
    <div class="msg" hidden></div>
    <div class="cb2" data-mode="live"><button class="round" data-a="gal" aria-label="Elegir de la galería">${I.gal}</button><button class="shut" data-a="shot" aria-label="Tomar foto"></button><button class="round" data-a="flip" aria-label="Cambiar de cámara">${I.flip}</button></div>
    <div class="cb2" data-mode="prev" hidden><button class="btn lt" style="color:#fff;border-color:#555" data-a="retry">Repetir</button><button class="btn honey" data-a="use">${I.check} Usar foto</button></div>`;
  document.body.appendChild(ov);
  const video = $("video", ov), prev = $("img.prev", ov), msg = $(".msg", ov);
  let stream = null, facing = "environment", blob = null, prevUrl = null;
  const stop = () => { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; };
  const close = () => { stop(); if (prevUrl) URL.revokeObjectURL(prevUrl); ov.remove(); };
  const mode = (m) => { $('[data-mode="live"]', ov).hidden = m !== "live"; $('[data-mode="prev"]', ov).hidden = m !== "prev"; video.hidden = m !== "live"; prev.hidden = m !== "prev"; };
  const showPrev = (b) => { blob = b; if (prevUrl) URL.revokeObjectURL(prevUrl); prevUrl = URL.createObjectURL(b); prev.src = prevUrl; stop(); mode("prev"); };
  async function start() {
    stop(); msg.hidden = true;
    if (!navigator.mediaDevices?.getUserMedia) return fallback();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1440 } }, audio: false });
      video.srcObject = stream; await video.play().catch(() => {});
    } catch { fallback(); }
  }
  function fallback() {
    msg.hidden = false;
    msg.innerHTML = `<div style="display:grid;gap:12px;max-width:280px">No se pudo abrir la cámara aquí. Puedes dar permiso de cámara en el navegador, o usar la del teléfono.<button class="btn honey" data-a="native">${I.cam} Abrir cámara del teléfono</button><button class="btn lt" style="color:#fff;border-color:#555" data-a="gal2">${I.gal} Elegir de galería</button></div>`;
    $("[data-a=native]", msg).onclick = async () => { const f = await pickFile(true); if (f) fileToJpeg(f).then(showPrev, (e) => toast(e.message)); };
    $("[data-a=gal2]", msg).onclick = async () => { const f = await pickFile(false); if (f) fileToJpeg(f).then(showPrev, (e) => toast(e.message)); };
  }
  ov.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-a]")?.dataset.a; if (!a) return;
    if (a === "close") close();
    if (a === "shot" && stream && video.videoWidth) { vibrate(30); showPrev(await scaleToJpeg(video, video.videoWidth, video.videoHeight)); }
    if (a === "flip") { facing = facing === "environment" ? "user" : "environment"; start(); }
    if (a === "gal") { const f = await pickFile(false); if (f) fileToJpeg(f).then(showPrev, (er) => toast(er.message)); }
    if (a === "retry") { blob = null; mode("live"); start(); }
    if (a === "use" && blob) { const b = blob; close(); onPhoto(b); }
  });
  mode("live"); start();
}

/* ---------------- Timbres (app abierta) ---------------- */
let actx = null;
document.addEventListener("pointerdown", () => { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch {} } else if (actx.state === "suspended") actx.resume(); }, { passive: true });
function chime() {
  if (!actx) return;
  const t0 = actx.currentTime;
  [[880, 0], [1175, 0.18], [880, 0.36]].forEach(([f, d]) => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(actx.destination);
    g.gain.setValueAtTime(0.0001, t0 + d); g.gain.exponentialRampToValueAtTime(0.35, t0 + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.16);
    o.start(t0 + d); o.stop(t0 + d + 0.18);
  });
}
function checkAlerts(all) {
  if (!st.me?.emp) return;
  const fresh = [];
  all.forEach((a) => { if ((a.state === "red" || a.state === "yellow") && a.next) { const k = a.r.id + ":" + a.next.i + ":" + a.state; if (!st.alerted.has(k)) { st.alerted.add(k); fresh.push(a); } } });
  if (!st.alertInit) { st.alertInit = true; return; }
  if (fresh.length) { chime(); vibrate([140, 80, 140]); toast("⏰ " + (fresh[0].state === "red" ? "Atrasado: " : "Ya toca: ") + fresh[0].r.t + (fresh.length > 1 ? " y " + (fresh.length - 1) + " más" : ""), 5000); }
}

/* ---------------- Sesión ---------------- */
function saveSession() { const s = store.get(); s.token = st.token; s.me = st.me; store.set(s); }
function logout(expired) {
  const tok = st.token;
  st.token = null; st.me = null; st.hoy = null; st.ent = null; st.panel = { fecha: null, data: null, sub: "rutina", zone: "todas", open: new Set() }; st.emps = null; st.alerted = new Set(); st.alertInit = false;
  const s = store.get(); delete s.token; delete s.me; store.set(s);
  if (tok && !expired) fetch(API, { method: "POST", headers: { "Content-Type": "application/json", apikey: KEY }, body: JSON.stringify({ action: "logout", token: tok }) }).catch(() => {});
  $$(".sheet-bg,.cam,.light,.done-ov").forEach((n) => n.remove());
  st.pin = ""; st.pinErr = expired ? "Tu sesión terminó. Marca tu clave." : "";
  loadEstado(); render(); window.scrollTo(0, 0);
}
let lastAct = Date.now();
["pointerdown", "keydown"].forEach((ev) => document.addEventListener(ev, () => (lastAct = Date.now()), true));
setInterval(() => { if (st.token && Date.now() - lastAct > 10 * 60e3 && !$(".cam")) { logout(); toast("Sesión cerrada por inactividad."); } }, 30000);

async function afterLogin(r) {
  st.token = r.token; st.me = { rol: r.rol, emp: r.emp, jefe: r.jefe, admin: r.admin, vapid: r.vapid };
  saveSession(); lastAct = Date.now();
  st.tab = st.me.admin ? "registros" : "rutina";
  render();
  if (st.me.admin) refreshPanel(); else refreshHoy();
}

/* ---------------- Carga de datos ---------------- */
async function loadEstado() { try { st.estado = await api("estado"); if (!st.token) render(); } catch {} }
async function refreshHoy(silent) {
  try { st.hoy = await api("hoy"); if (st.hoy.emp) { st.me.emp = st.hoy.emp; saveSession(); } renderMain(); }
  catch (e) { if (!silent) toast(e.message); }
}
async function refreshPanel(silent) {
  try { st.panel.data = await api("panel", { fecha: st.panel.fecha || today() }); st.panel.fecha = st.panel.data.fecha; renderMain(); }
  catch (e) { if (!silent) toast(e.message); }
}
async function refreshEmps() { try { st.emps = (await api("empleados")).empleados; renderMain(); } catch (e) { toast(e.message); } }

/* ================= VISTAS ================= */
const root = () => $("#root");
function render() {
  if (!st.token) return renderLogin();
  root().innerHTML = `<div class="app"><header class="top" id="top"></header><main id="main"></main></div><nav class="tabs" aria-label="Secciones"><div class="in" id="tabs"></div></nav>`;
  renderMain();
}

/* ---------- Acceso ---------- */
function renderLogin() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  root().innerHTML = `<div class="login">
    <div class="brand"><div class="hex">B</div><div><b>Bee's Limpieza</b><span>Sullivan · Checklist</span></div></div>
    <p class="mu" style="margin:6px 0 0">Marca tu clave de 4 números</p>
    <div class="dots" id="dots" aria-label="Clave"></div><p class="perr" id="perr"></p>
    <div class="keypad">${keys.map((k) => !k ? `<button class="k-none" tabindex="-1" aria-hidden="true"></button>` : k === "del" ? `<button class="k-txt" data-k="del">Borrar</button>` : `<button data-k="${k}">${k}</button>`).join("")}</div>
    ${st.estado && !st.estado.adminExiste ? `<button class="link" id="setup">Configurar administrador</button>` : ""}
    ${st.installEvt ? `<button class="btn lt" id="install">${I.dl} Instalar app</button>` : isIOS && !standalone ? `<button class="link" id="iosHelp">¿Cómo instalarla en iPhone?</button>` : ""}
  </div>`;
  $$("[data-k]").forEach((b) => (b.onclick = () => pressKey(b.dataset.k)));
  $("#setup") && ($("#setup").onclick = setupSheet);
  $("#install") && ($("#install").onclick = async () => { st.installEvt.prompt(); await st.installEvt.userChoice.catch(() => {}); st.installEvt = null; renderLogin(); });
  $("#iosHelp") && ($("#iosHelp").onclick = iosHelp);
  renderDots();
}
function iosHelp() { sheet(`<h2>Instalar en iPhone</h2><p style="margin:0">1. Abre esta página en <b>Safari</b>.<br>2. Toca el botón <b>Compartir</b> (cuadro con flecha).<br>3. Elige <b>Agregar a pantalla de inicio</b>.<br><br>Así se abre como app y puede recibir avisos (iOS 16.4 o más nuevo).</p><button class="btn honey block" data-a="ok">Entendido</button>`, (s, c) => ($("[data-a=ok]", s).onclick = c)); }
function renderDots(shake) {
  const d = $("#dots"); if (!d) return;
  d.innerHTML = [0, 1, 2, 3].map((i) => `<i class="${i < st.pin.length ? "on" : ""}"></i>`).join("");
  $("#perr").textContent = st.pinErr;
  if (shake) { d.classList.remove("shake"); void d.offsetWidth; d.classList.add("shake"); vibrate([60, 40, 60]); }
}
async function pressKey(k) {
  if (st.checking || st.token) return;
  if (k === "del") { st.pin = st.pin.slice(0, -1); st.pinErr = ""; return renderDots(); }
  if (st.pin.length >= 4) return;
  st.pin += k; st.pinErr = ""; renderDots();
  if (st.pin.length < 4) return;
  st.checking = true;
  try { const r = await api("login", { pin: st.pin }); st.pin = ""; await afterLogin(r); }
  catch (e) { st.pin = ""; st.pinErr = e.message; renderDots(true); }
  finally { st.checking = false; }
}
document.addEventListener("keydown", (e) => { if (st.token || $(".sheet-bg")) return; if (/^\d$/.test(e.key)) pressKey(e.key); else if (e.key === "Backspace") pressKey("del"); });
function setupSheet() {
  sheet(`<h2>Configurar administrador</h2><p class="mu sm" style="margin:0">Escribe el código de configuración que te dio Claude y crea tu PIN de 4 números. Con ese PIN entras al panel desde el mismo teclado.</p>
    <label class="lb" for="sc">Código de configuración</label><input type="text" id="sc" autocomplete="off" autocapitalize="characters" maxlength="6">
    <label class="lb" for="sp1">PIN de administrador</label><input type="password" inputmode="numeric" maxlength="4" id="sp1" autocomplete="off">
    <label class="lb" for="sp2">Repite el PIN</label><input type="password" inputmode="numeric" maxlength="4" id="sp2" autocomplete="off">
    <p class="err" id="se"></p><button class="btn honey block" data-a="ok">Crear y entrar</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $$("#sp1,#sp2", s).forEach((i) => i.addEventListener("input", () => (i.value = i.value.replace(/\D/g, "").slice(0, 4))));
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = async (ev) => {
      const b = ev.currentTarget, e = $("#se", s), p1 = $("#sp1", s).value, p2 = $("#sp2", s).value;
      if (!/^\d{4}$/.test(p1)) return (e.textContent = "El PIN debe tener 4 números.");
      if (p1 !== p2) return (e.textContent = "Los PIN no coinciden.");
      b.disabled = true; b.textContent = "Creando…";
      try { const r = await api("setup", { code: $("#sc", s).value, pin: p1 }); close(); await afterLogin(r); toast("Listo. Ya eres administrador."); }
      catch (er) { e.textContent = er.message; b.disabled = false; b.textContent = "Crear y entrar"; }
    };
  });
}

/* ---------- Encabezado y pestañas ---------- */
function tabsFor() {
  if (st.me.admin) return [["registros", "Registros", I.chart], ["empleados", "Empleados", I.users], ["ajustes", "Ajustes", I.gear]];
  const t = [["rutina", "Rutina", I.list], ["entregas", "Entregas", I.moon], ["midia", "Mi día", I.cal]];
  if (st.me.jefe) t.push(["registros", "Registros", I.chart]);
  return t;
}
function renderTop(all, stats) {
  const top = $("#top"); if (!top) return;
  const pushOn = store.get().push === true;
  if (st.me.admin || st.tab === "registros") {
    top.innerHTML = `<div class="hex" style="width:38px;height:42px;font-size:20px">B</div><div class="who"><b>${st.me.admin ? "Administrador" : esc(st.me.emp?.nombre)}</b><span>${st.me.admin ? "Bee's Pizza Sullivan" : "Supervisor · registros"}</span></div>
      <button class="ico" id="bell" aria-label="Avisos">${I.bell}${pushOn ? "" : '<span class="dot"></span>'}</button><button class="ico" id="out" aria-label="Salir">${I.out}</button>`;
  } else {
    const pct = stats?.pct, urg = (stats?.red || 0) + (stats?.yellow || 0);
    top.innerHTML = `<div class="ring" style="--p:${pct ?? 0}" aria-label="${pct == null ? "Sin horarios vencidos" : pct + "% a tiempo hoy"}"><span>${pct == null ? "—" : pct + "%"}</span></div>
      <div class="who"><b>Hola, ${esc(st.me.emp?.nombre)}</b><span>${esc(S.fechaLarga(today()))} · ${urg ? urg + " por hacer ahora" : "todo al día"}</span></div>
      <button class="ico" id="bell" aria-label="Avisos">${I.bell}${pushOn ? "" : '<span class="dot"></span>'}</button><button class="ico" id="out" aria-label="Salir">${I.out}</button>`;
  }
  $("#out").onclick = async () => { if (await confirmSheet("¿Cerrar sesión?", "El siguiente compañero entra con su clave.", "Cerrar sesión")) logout(); };
  $("#bell").onclick = pushSheet;
}
function renderTabs(badge) {
  const t = $("#tabs"); if (!t) return;
  t.innerHTML = tabsFor().map(([id, lbl, ic]) => `<button role="tab" data-tab="${id}" aria-selected="${st.tab === id}">${ic}<span>${lbl}</span>${id === "rutina" && badge ? `<span class="badge">${badge}</span>` : ""}</button>`).join("");
  $$("[data-tab]", t).forEach((b) => (b.onclick = () => { if (st.tab === b.dataset.tab) return window.scrollTo({ top: 0, behavior: "smooth" }); st.tab = b.dataset.tab; st.ent = null; window.scrollTo(0, 0); renderMain(); if (st.tab === "registros") refreshPanel(); else if (st.tab === "empleados") refreshEmps(); else if (!st.me.admin) refreshHoy(true); }));
}
function renderMain() {
  const main = $("#main"); if (!main || !st.token) return;
  let all = null, stats = null;
  if (st.hoy && !st.me.admin) { all = S.rutAll(st.hoy.rutina, st.hoy.fecha === today() ? st.hoy.fecha : today(), nowMin()); stats = S.dayStats(all); checkAlerts(all); }
  renderTop(all, stats); renderTabs(stats ? stats.red + stats.yellow : 0);
  const y = window.scrollY;
  $(".stick")?.remove();
  if (st.tab === "rutina") main.innerHTML = viewRutina(all, stats);
  else if (st.tab === "entregas") main.innerHTML = st.ent ? viewChecklist() : viewEntregas();
  else if (st.tab === "midia") main.innerHTML = viewMiDia(all);
  else if (st.tab === "registros") main.innerHTML = viewRegistros();
  else if (st.tab === "empleados") main.innerHTML = viewEmpleados();
  else if (st.tab === "ajustes") main.innerHTML = viewAjustes();
  wireMain(main, all);
  window.scrollTo(0, y);
}

/* ---------- Rutina ---------- */
function viewRutina(all, stats) {
  if (!st.hoy) return `<div class="empty"><div class="spin" style="margin:30px auto"></div>Cargando…</div>`;
  const now = nowMin(), offAll = all.every((a) => a.state === "off");
  const urgent = all.filter((a) => a.state === "red" || a.state === "yellow").sort((a, b) => a.rank - b.rank || a.left - b.left);
  const next = all.filter((a) => a.state === "green" && a.next).sort((a, b) => a.left - b.left)[0];
  let h = "";
  if (offAll) h += `<div class="banner off">${I.check}<span>${now >= S.CUT_MIN ? "Fuera de horario de rutina. Todo en orden hasta mañana." : "La rutina empieza a las 11:00 a.m. Todo en orden."}</span></div>`;
  if (!offAll) {
    h += `<div class="sect"><h2>Ahora</h2>${urgent.length ? `<span class="pill bad">${urgent.length}</span>` : ""}</div>`;
    h += urgent.length
      ? `<div class="now">${urgent.map((a) => { const ri = repInfo(a); return `<button class="nc ${a.state} pulse" data-rut="${a.idx}"><span class="k">${esc(a.text)}</span><b>${esc(a.r.t)}</b>${ri ? `<span class="xs" style="font-weight:700">${esc(ri)}</span>` : ""}<span class="go">${I.cam} ${a.rep ? "Repetir ahora" : "Tomar foto"}</span></button>`; }).join("")}</div>`
      : `<div class="allgood">${I.check}<span>Todo al día${next ? ` · siguiente: ${esc(next.r.t)}, ${S.fmtMin(next.next.H)}` : ""}</span></div>`;
  }
  h += S.ZONAS.map((z) => {
    const zs = all.filter((a) => a.r.z === z.id).sort((a, b) => a.rank - b.rank || a.left - b.left || a.idx - b.idx);
    const red = zs.filter((a) => a.state === "red").length, yel = zs.filter((a) => a.state === "yellow").length;
    const open = st.zoneOpen[z.id] ?? (red + yel > 0);
    const pill = red ? `<span class="pill bad">${red} atrasada${red > 1 ? "s" : ""}</span>` : yel ? `<span class="pill run">${yel} ya toca</span>` : `<span class="pill ok">Al día</span>`;
    return `<section class="zone ${open ? "" : "closed"}"><button class="zh" data-zone="${z.id}" aria-expanded="${open}"><span class="zi">${I[z.id]}</span><b>${z.n}</b>${pill}<span class="chev">${I.chev}</span></button>
      <div class="rows">${zs.map((a) => { const last = a.docs[a.docs.length - 1];
        return `<button class="row ${a.state}${a.state === "red" || a.state === "yellow" ? " pulse" : ""}" data-rut="${a.idx}"><span class="fill" style="width:${Math.round(a.fill * 100)}%"></span>
          <span class="tx"><b>${esc(a.r.t)}</b><span><span class="st">${esc(a.text)}</span>${a.rep ? " · " + esc(repInfo(a)) : last ? " · " + esc(last.nombre) + " " + S.horaIso(last.at) : ""}</span></span>
          <span class="cb" aria-label="Tomar foto">${a.state === "green" || a.state === "off" ? I.check : I.cam}</span></button>`; }).join("")}</div></section>`;
  }).join("");
  h += `<div class="pad" style="margin-top:16px;display:flex;gap:8px"><a class="btn lt sm" href="${esc(waLink(S.resumenRutina(today(), st.hoy.rutina, true)))}" target="_blank" rel="noopener">${I.wa} Resumen WhatsApp</a><button class="btn lt sm" data-copy="rutina">Copiar</button></div>`;
  return h;
}
/* Texto de una repetición pendiente: motivo, quién la pidió y a quién. */
function repInfo(a) {
  if (!a.rep) return "";
  const d = a.docs[a.rep.ix], me = st.me.emp?.id, eq = st.hoy?.equipo || {};
  const para = d.rep_para ? (d.rep_para === me ? "Te lo pidió " : "Pedido a " + (eq[d.rep_para] || d.nombre) + " por ") : "";
  return (d.rep_txt ? "“" + d.rep_txt + "” " : "") + "— " + (para || "") + (d.rep_por || "");
}
function startRutina(a) {
  const r = a.r;
  if (a.rep) {
    const d = a.docs[a.rep.ix];
    if (d.rep_para && d.rep_para !== st.me.emp?.id && !a.rep.vencido) {
      return toast("Esta tarea se le pidió repetir a " + (st.hoy?.equipo?.[d.rep_para] || d.nombre) + ". Se abre a todos a las " + S.fmtMin(a.rep.until), 5000);
    }
  }
  openCamera({ title: (a.rep ? "🔁 " : "") + r.t, sub: a.rep ? (a.docs[a.rep.ix].rep_txt || "Repetir") : r.d || S.everyLabel(r), onPhoto: async (blob) => {
    toast("Guardando foto…", 20000);
    try {
      const res = await api("rutina_registrar", { task_id: r.id, data: await blobToB64(blob) });
      $("#toast").hidden = true; vibrate([40, 30, 80]);
      if (res.repeticion) doneOverlay("¡Repetición lista!", r.t + " · ya le avisamos a tu supervisor", "Cuenta como tarde, pero quedó corregida.");
      else doneOverlay("¡Listo, " + (st.me.emp?.nombre || "") + "!", r.t + " · " + res.estado, res.siguiente ? "Siguiente: " + res.siguiente : "");
      refreshHoy(true);
    } catch (e) { toast(e.message, 5000); }
  } });
}

/* ---------- Entregas ---------- */
function viewEntregas() {
  const emp = st.me.emp, list = st.hoy?.entregas || [];
  const combos = [];
  S.TURNOS.forEach((t) => { if (emp.turnos.includes(t)) S.AREAS.forEach((a) => { if (emp.areas.includes(a)) combos.push([t, a]); }); });
  if (!combos.length) return `<div class="empty">No tienes entregas habilitadas. Avísale al encargado.</div>`;
  return `<div class="sect"><h2>Entregas de hoy</h2></div><div class="elist">${combos.map(([t, a]) => {
    const has = S.tasksOf(t, a).length > 0, tot = S.slots(a, t).length;
    const mine = list.filter((e) => e.area === a && e.turno === t && e.emp_id === emp.id).sort((x, y) => (x.inicio < y.inicio ? 1 : -1))[0];
    const others = list.filter((e) => e.area === a && e.turno === t && e.estado === "entregado" && e.emp_id !== emp.id);
    const n = mine ? S.countDone(mine) : 0;
    const c = mine ? S.califEntrega(mine) : null;
    const status = !has ? `<span class="pill gr">Próximamente</span>` : mine && S.pendRepetir(mine) ? `<span class="pill bad">🔁 Repetir ${S.pendRepetir(mine)} foto${S.pendRepetir(mine) > 1 ? "s" : ""}</span>` : mine?.estado === "entregado" ? `<span class="pill ok">Entregado ${S.horaIso(mine.fin)}${c.nota ? " · " + S.notaTxt(c.nota) : ""}</span>` : mine ? `<span class="pill run">En curso · ${n}/${tot} fotos</span>` : others.length ? `<span class="pill ok">Entregó ${esc(others[0].nombre)}</span>` : `<span class="mu xs">${S.tasksOf(t, a).length} tareas · ${tot} fotos</span>`;
    return `<button class="ecard" data-t="${t}" data-a="${a}" ${has ? "" : "disabled"}><span class="tx"><span class="tg">${S.TURNO_NAME[t]}</span><span class="big">${S.AREA_NAME[a]}</span>${status}${mine && mine.estado !== "entregado" ? `<span class="bar"><i style="width:${(n / tot) * 100}%"></i></span>` : ""}</span><span class="arrow">${I.right}</span></button>`;
  }).join("")}</div>`;
}
async function openEntrega(area, turno) {
  toast("Abriendo…", 8000);
  try { const r = await api("entrega_iniciar", { area, turno }); $("#toast").hidden = true; st.ent = r.entrega; st.entUrls = r.urls || {}; window.scrollTo(0, 0); renderMain(); }
  catch (e) { toast(e.message); }
}
function viewChecklist() {
  const e = st.ent, f = e.fotos || {}, locked = e.estado === "entregado";
  const ss = S.slots(e.area, e.turno), tot = ss.length, n = S.countDone(e);
  let h = `<div class="backbar"><button class="ico" data-a="back" aria-label="Volver">${I.left}</button><div style="flex:1"><span class="mu xs" style="font-weight:800;letter-spacing:.1em;text-transform:uppercase">${S.TURNO_NAME[e.turno]}</span><h1 class="h">${S.AREA_NAME[e.area]}</h1></div><span class="pill ${n === tot ? "ok" : "run"}">${n}/${tot}</span></div>
    <div class="pad" style="margin-bottom:10px"><div class="bar"><i style="width:${(n / tot) * 100}%"></i></div><p class="mu xs" style="margin:6px 0 0">${locked ? "Entregado a las " + S.horaIso(e.fin) : "Toca un recuadro para tomar la foto. Toca una foto para verla, cambiarla o eliminarla."}</p></div>`;
  const reps = Object.entries(e.repetir || {});
  if (reps.length) h += `<div class="repbox" style="margin:0 14px 10px"><b>🔁 Tu supervisor pidió repetir ${reps.length} foto${reps.length > 1 ? "s" : ""}</b>${reps.map(([k, v]) => { const s = ss.find((x) => x.key === k); return `<span class="sm">• ${esc(s ? s.task.t + (s.multi ? " · " + s.label : "") : k)}: ${esc(v.txt)} — ${esc(v.por)}</span>`; }).join("")}<span class="mu xs">Toma la foto de nuevo y vuelve a entregar.</span></div>`;
  h += S.tasksOf(e.turno, e.area).map((t, ti) => {
    const mine = ss.filter((s) => s.task.id === t.id), done = mine.every((s) => f[s.key]);
    return `<section class="task ${done ? "done" : ""}"><h3><span class="n">${done ? "✓" : ti + 1}</span><span>${esc(t.t)}</span></h3>${t.n ? `<p class="note">${esc(t.n)}</p>` : ""}<div class="slots">${mine.map((s) => {
      const p = f[s.key], url = p && st.entUrls[p];
      if (st.busy[s.key]) return `<div class="slot busy"><div class="spin"></div></div>`;
      const rp = (e.repetir || {})[s.key];
      if (p && rp) return `<button class="slot has rep" data-shot="${s.key}" aria-label="Repetir foto ${esc(s.multi ? s.label : t.t)}">${url ? `<img alt="" loading="lazy" src="${esc(url)}" style="opacity:.55">` : ""}<span class="rtag">🔁 Repetir</span><span class="cap">${esc(rp.txt)}</span></button>`;
      if (p) return `<button class="slot has" data-view="${s.key}" aria-label="Ver foto ${esc(s.multi ? s.label : t.t)}">${url ? `<img alt="" loading="lazy" src="${esc(url)}">` : `<div class="spin"></div>`}<span class="ck">✓</span>${s.multi ? `<span class="cap">${esc(s.label)}</span>` : ""}</button>`;
      return `<button class="slot" data-shot="${s.key}" ${locked ? "disabled" : ""}><span class="add">${I.cam}${esc(s.multi ? s.label : "Tomar foto")}</span></button>`;
    }).join("")}</div></section>`;
  }).join("");
  return h;
}
function stickyEntrega() {
  const e = st.ent; if (!e) return;
  const tot = S.slots(e.area, e.turno).length, n = S.countDone(e), locked = e.estado === "entregado", rp = S.pendRepetir(e);
  const d = document.createElement("div"); d.className = "stick";
  d.innerHTML = `<div class="in">${locked ? `<span style="flex:1;font-weight:800">Turno entregado</span><button class="btn lt" data-a="wa">${I.wa} WhatsApp</button>` : `<span style="flex:1" class="sm"><b>${n}/${tot}</b> fotos${n < tot ? " · faltan " + (tot - n) : rp ? " · 🔁 repetir " + rp : " · ¡listo!"}</span><button class="btn honey" data-a="send" ${n < tot || rp ? "disabled" : ""}>Entregar turno</button>`}</div>`;
  document.body.appendChild(d);
  $("[data-a=send]", d) && ($("[data-a=send]", d).onclick = entregar);
  $("[data-a=wa]", d) && ($("[data-a=wa]", d).onclick = () => entregaDoneSheet(st.ent, false));
}
function shotEntrega(key) {
  const e = st.ent, s = S.slots(e.area, e.turno).find((x) => x.key === key);
  openCamera({ title: s.task.t, sub: s.multi ? s.label : s.task.n || "", onPhoto: async (blob) => {
    st.busy[key] = true; renderMain();
    try { const r = await api("entrega_foto", { id: e.id, key, data: await blobToB64(blob) }); st.ent = r.entrega; st.entUrls = r.urls; vibrate(40); }
    catch (er) { toast(er.message, 5000); }
    delete st.busy[key]; renderMain();
  } });
}
function viewEntregaPhoto(key) {
  const e = st.ent, s = S.slots(e.area, e.turno).find((x) => x.key === key), url = st.entUrls[e.fotos[key]], locked = e.estado === "entregado";
  sheet(`${url ? `<img class="view" alt="" src="${esc(url)}">` : ""}<h2>${esc(s.task.t)}</h2>${s.multi ? `<span class="mu">${esc(s.label)}</span>` : ""}
    ${locked ? `<button class="btn lt block" data-a="no">Cerrar</button>` : `<button class="btn honey block" data-a="chg">${I.cam} Cambiar foto</button><button class="btn danger block" data-a="del">${I.trash} Eliminar foto</button><button class="btn lt block" data-a="no">Cerrar</button>`}`, (sh, close) => {
    $("[data-a=no]", sh).onclick = close;
    if (locked) return;
    $("[data-a=chg]", sh).onclick = () => { close(); shotEntrega(key); };
    $("[data-a=del]", sh).onclick = async () => {
      close();
      if (!(await confirmSheet("¿Seguro que deseas borrar la foto?", "", "Borrar", true))) return;
      st.busy[key] = true; renderMain();
      try { const r = await api("entrega_foto_borrar", { id: e.id, key }); st.ent = r.entrega; st.entUrls = r.urls; toast("Foto borrada."); } catch (er) { toast(er.message); }
      delete st.busy[key]; renderMain();
    };
  });
}
async function entregar() {
  const e = st.ent;
  if (!(await confirmSheet("¿Entregar " + S.TURNO_NAME[e.turno].toLowerCase() + " de " + S.AREA_NAME[e.area] + "?", "Ya no podrás cambiar las fotos después de entregar.", "Entregar turno"))) return;
  try { const r = await api("entrega_entregar", { id: e.id }); st.ent = r.entrega; vibrate([40, 30, 120]); renderMain(); entregaDoneSheet(r.entrega, true); refreshHoy(true); }
  catch (er) { toast(er.message); }
}
function entregaDoneSheet(e, fresh) {
  const txt = S.resumenEntrega(e);
  let t = fresh ? setTimeout(() => { close(); logout(); }, 30000) : null, close;
  close = sheet(`${fresh ? `<div style="display:grid;justify-items:center;gap:6px;text-align:center"><div class="ckc" style="width:64px;height:64px;border-radius:50%;background:var(--ok);display:grid;place-items:center;color:#fff">${I.check}</div><h2>Turno entregado</h2><span class="mu">Gracias, ${esc(e.nombre)}. Ya puedes irte a descansar.</span></div>` : `<h2>Resumen de la entrega</h2>`}
    <a class="btn honey block" href="${esc(waLink(txt))}" target="_blank" rel="noopener">${I.wa} Enviar por WhatsApp</a>
    <button class="btn lt block" data-a="copy">Copiar texto</button>
    ${fresh ? `<button class="btn block" data-a="fin">Terminar y cerrar sesión</button><span class="mu xs" style="text-align:center">Tu sesión se cerrará sola en 30 segundos.</span>` : `<button class="btn lt block" data-a="no">Cerrar</button>`}`, (s, c) => {
    $("[data-a=copy]", s).onclick = () => { copy(txt); if (t) { clearTimeout(t); t = setTimeout(() => { c(); logout(); }, 60000); } };
    $("a", s).addEventListener("click", () => { if (t) { clearTimeout(t); t = setTimeout(() => { c(); logout(); }, 60000); } });
    $("[data-a=fin]", s) && ($("[data-a=fin]", s).onclick = () => { clearTimeout(t); c(); logout(); });
    $("[data-a=no]", s) && ($("[data-a=no]", s).onclick = c);
  });
}

/* ---------- Mi día ---------- */
function viewMiDia(all) {
  if (!st.hoy) return `<div class="empty">Cargando…</div>`;
  const me = st.me.emp, mine = st.hoy.rutina.filter((r) => r.emp_id === me.id).sort((a, b) => (a.at < b.at ? 1 : -1));
  const ents = st.hoy.entregas.filter((e) => e.emp_id === me.id);
  const lateBy = {};
  (all || []).forEach((a) => a.filled.forEach((f) => { if (f) lateBy[a.docs[f.ix].id] = f.late; }));
  const cr = S.califRutina(mine);
  return `<div class="sect"><h2>Lo que hiciste hoy</h2><span class="pill ok">${mine.length} registro${mine.length === 1 ? "" : "s"}</span></div>
    ${cr.nota ? `<div class="card" style="margin:0 14px 8px;display:flex;align-items:center;gap:10px"><span style="font-size:28px">${S.NOTAS[cr.nota][0]}</span><div><b>Tu rutina de hoy: ${S.NOTAS[cr.nota][1]}</b><div class="mu xs">${cr.rated} registro${cr.rated === 1 ? "" : "s"} calificado${cr.rated === 1 ? "" : "s"} · ${[4, 3, 2, 1].filter((n) => cr.by[n]).map((n) => S.NOTAS[n][0] + " " + cr.by[n]).join("  ")}</div></div></div>` : ""}
    ${mine.length ? `<div class="mine">${mine.map((r) => { const t = S.RUTINA.find((x) => x.id === r.task_id), url = st.hoy.urls[r.foto], late = lateBy[r.id];
      const status = r.anulado ? `<span class="pill bad">🔁 Repetir</span>` : r.rep_de ? `<span class="pill run">🔁 Repetida</span>` : late === undefined ? `<span class="pill gr">Extra</span>` : late ? `<span class="pill run">Tarde ${S.durTxt(late)}</span>` : `<span class="pill ok">A tiempo</span>`;
      return `<div class="mi" style="flex-wrap:wrap">${url ? `<img alt="" loading="lazy" src="${esc(url)}" data-lb="${esc(url)}" data-cap="${esc(t?.t)}">` : `<img alt="">`}<div style="flex:1;min-width:0"><b style="display:block">${esc(t?.t || r.task_id)}</b><span class="mu xs">${S.horaIso(r.at)}</span>${r.nota ? `<div style="margin-top:3px">${notaPill(r.nota)}</div>` : ""}</div>${status}
        ${r.anulado ? `<div class="repbox" style="width:100%"><b>🔁 ${esc(r.rep_por)} pidió repetir</b><span class="sm">${esc(r.rep_txt)}</span></div>` : r.coment ? `<div class="cmt" style="width:100%"><b>${esc(r.cal_por || "")}</b>${esc(r.coment)}</div>` : ""}</div>`; }).join("")}</div>` : `<div class="empty">Aún no registras rutina hoy. ¡Tú puedes!</div>`}
    ${ents.length ? `<div class="sect"><h2>Tus entregas</h2></div><div class="mine">${ents.map((e) => {
      const c = S.califEntrega(e), cal = e.calif || {}, notas = S.slots(e.area, e.turno).filter((s) => cal[s.key] && (cal[s.key].c || cal[s.key].n <= 2));
      return `<div class="mi" style="padding:12px;display:grid;gap:8px"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1"><b>${S.TURNO_NAME[e.turno]} · ${S.AREA_NAME[e.area]}</b><br><span class="mu xs">${e.estado === "entregado" ? "Entregado " + S.horaIso(e.fin) : S.pendRepetir(e) ? "Tienes " + S.pendRepetir(e) + " foto(s) por repetir" : "En curso · " + S.countDone(e) + "/" + e.total + " fotos"}</span></div>${c.nota ? notaPill(c.nota) : `<span class="pill ${e.estado === "entregado" ? "ok" : "run"}">${e.estado === "entregado" ? "Sin calificar" : "En curso"}</span>`}</div>
        ${e.nota_general ? `<div class="cmt"><b>Comentario general · ${esc(e.nota_por || "")}</b>${esc(e.nota_general)}</div>` : ""}
        ${notas.map((s) => `<div class="cmt"><b>${S.NOTAS[cal[s.key].n]?.[0] || ""} ${esc(s.task.t)}${s.multi ? " · " + esc(s.label) : ""}</b>${esc(cal[s.key].c || S.NOTAS[cal[s.key].n]?.[1] || "")}</div>`).join("")}</div>`; }).join("")}</div>` : ""}`;
}

/* ---------- Registros (supervisores y administrador) ---------- */
function viewRegistros() {
  const P = st.panel, D = P.data;
  if (!D) return `<div class="empty"><div class="spin" style="margin:30px auto"></div>Cargando registros…</div>`;
  const hoyJ = D.hoy, j = D.fecha, isToday = j === hoyJ;
  let strip = `<div class="strip" id="strip">`;
  for (let k = 0; k < 14; k++) {
    const dj = S.addDays(hoyJ, -k), docs = D.rango.filter((x) => x.fecha === dj);
    const s = S.dayStats(S.rutAll(docs, dj, dj === hoyJ ? S.nowMinFor(dj, nowMs()) : null));
    const cls = docs.length ? (s.pct >= 90 ? "g" : s.pct >= 60 ? "y" : "r") : "";
    strip += `<button class="day" data-day="${dj}" aria-pressed="${dj === j}"><span class="dn">${k === 0 ? "Hoy" : k === 1 ? "Ayer" : S.diaCorto(dj)}</span><span class="dd">${+dj.slice(8)}</span><span class="dt ${cls}"></span></button>`;
  }
  const older = j < S.addDays(hoyJ, -13);
  strip += `<label class="day" aria-pressed="${older}"><span class="dn">Otra</span><span class="dd">${older ? +j.slice(8) : "…"}</span><span class="dt"></span><input type="date" id="pickDay" max="${hoyJ}" value="${j}" aria-label="Elegir otra fecha"></label></div>`;
  let h = `<div class="sect" style="margin-top:6px"><h2>Jornada · ${esc(S.fechaLarga(j))}</h2></div>${strip}
    <div class="seg" role="tablist"><button role="tab" data-sub="rutina" aria-selected="${P.sub === "rutina"}">Rutina</button><button role="tab" data-sub="entregas" aria-selected="${P.sub === "entregas"}">Entregas (${D.entregas.length})</button></div>`;
  if (P.sub === "rutina") {
    const all = S.rutAll(D.rutina, j, isToday ? S.nowMinFor(j, nowMs()) : null), s = S.dayStats(all);
    h += `<div class="kpis"><div class="kpi"><b>${s.pct == null ? "—" : s.pct + "%"}</b><span>a tiempo</span></div><div class="kpi"><b style="color:var(--ok)">${s.ok}</b><span>bien</span></div><div class="kpi"><b style="color:var(--honey-d)">${s.late}</b><span>tarde</span></div><div class="kpi"><b style="color:var(--red)">${s.missed}</b><span>sin hacer</span></div></div>
      <div class="pad" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><a class="btn honey sm" href="${esc(waLink(S.resumenRutina(j, D.rutina, isToday)))}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><button class="btn lt sm" data-copy="panel">Copiar</button><button class="btn lt sm" data-a="ziprut" ${D.rutina.length ? "" : "disabled"}>${I.dl} Fotos (ZIP)</button></div>
      <div class="chips">${[["todas", "Todas"], ...S.ZONAS.map((z) => [z.id, z.n])].map(([id, n]) => `<button class="chip" data-zf="${id}" aria-pressed="${P.zone === id}">${n}</button>`).join("")}</div>`;
    const now = isToday ? S.nowMinFor(j, nowMs()) : null, evts = [];
    all.forEach((a) => {
      if (P.zone !== "todas" && a.r.z !== P.zone) return;
      a.sch.forEach((sl, i) => {
        const f = a.filled[i];
        if (f) evts.push({ m: f.m, a, s: sl, d: a.docs[f.ix], k: f.rep ? "rep" : f.late ? "late" : "ok", late: f.late });
        else if (a.repPend[i]) return;
        else if (now == null || sl.to <= now) evts.push({ m: a.r.win ? sl.end : sl.H, a, s: sl, k: "miss" });
        else if (sl.H <= now + 60 && now < S.CUT_MIN) evts.push({ m: sl.H, a, s: sl, k: "pend" });
      });
      a.docs.forEach((d) => { if (d.anulado) evts.push({ m: S.minOf(d.at, j), a, d, k: "anul" }); });
      a.extras.forEach((x) => { const d = a.docs[x.ix]; if (!d.anulado) evts.push({ m: x.m, a, d, k: "extra" }); });
    });
    evts.sort((x, y) => x.m - y.m || x.a.idx - y.a.idx);
    const L = { ok: ["ok", "A tiempo"], late: ["run", "Tarde"], rep: ["run", "🔁 Repetida"], anul: ["bad", "🔁 Por repetir"], miss: ["bad", "No se hizo"], pend: ["gr", "Pendiente"], extra: ["gr", "Extra"] };
    const hoyEs = isToday;
    let lastH = -1, tl = "";
    evts.forEach((e) => {
      const hr = Math.floor(e.m / 60); if (hr !== lastH) { tl += `<div class="th">${S.fmtMin(hr * 60).replace(":00", "")}</div>`; lastH = hr; }
      const zn = S.ZONAS.find((z) => z.id === e.a.r.z).n, sub = zn + (e.s ? (e.a.r.win ? " · " + e.s.label : " · horario " + S.fmtMin(e.s.H)) : "");
      let k = e.k;
      if (k === "anul" && e.d.rep_de == null) { const cub = D.rutina.some((x) => x.rep_de === e.d.id); if (cub) k = "anulc"; }
      const lbl = k === "anulc" ? ["gr", "🔁 Repetido después"] : L[k];
      const pill = `<span class="pill ${lbl[0]}">${e.d && e.d.nota ? S.NOTAS[e.d.nota][0] + " " : ""}${lbl[1]}${e.late && k !== "rep" ? " " + S.durTxt(e.late) : ""}</span>`;
      if (!e.d) { tl += `<div class="ev ${e.k} nd"><div><div class="et">${esc(e.a.r.t)}</div><div class="es">${esc(sub)}</div></div>${pill}</div>`; return; }
      const d = e.d, url = D.urls[d.foto], canRep = hoyEs && !d.anulado && !d.rep_de && (e.k === "ok" || e.k === "late");
      const repInfo = d.anulado ? `<div class="repbox"><b>🔁 Repetir pedido por ${esc(d.rep_por)} · ${S.horaIso(d.rep_at)}</b><span class="sm">${esc(d.rep_txt)}</span><span class="mu xs">${d.rep_para ? "Pedido a " + esc(D.equipo?.[d.rep_para] || d.nombre) : "Para quien esté en turno"}</span></div>` : "";
      tl += `<details class="ev ${e.k === "anul" ? "miss" : e.k === "rep" ? "late" : e.k}" data-ev="${d.id}" ${st.panel.open.has(d.id) ? "open" : ""}><summary><div><div class="et">${S.horaIso(d.at)} · ${esc(e.a.r.t)}</div><div class="es">${esc(d.nombre)} · ${esc(sub)}</div></div>${pill}</summary><div class="body">${url ? `<img alt="" loading="lazy" src="${esc(url)}">` : ""}
        ${repInfo}
        <span class="lb" style="margin:0">Calificación${d.cal_por ? ` <span class="mu xs" style="font-weight:600">· ${esc(d.cal_por)}</span>` : ""}</span>
        <div data-rid="${d.id}">${rateBtns(d.nota, "rrn")}</div>
        <textarea data-rc="${d.id}" maxlength="300" placeholder="Comentario (opcional)">${esc(d.coment || "")}</textarea>
        <div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn lt sm" data-savec="${d.id}">Guardar comentario</button>${canRep ? `<button class="btn danger sm" data-rep="${d.id}">🔁 Repetir, por favor</button>` : ""}${st.me.admin ? `<button class="btn danger sm" data-delrut="${d.id}" aria-label="Borrar registro">${I.trash}</button>` : ""}</div>
        <span class="mu xs">${esc(d.nombre)} registró a las ${S.horaIso(d.at)}. Mantén presionado el registro para calificar rápido.</span></div></details>`;
    });
    h += evts.length ? `<div class="tl">${tl}</div>` : `<div class="empty">Sin registros para esta jornada.</div>`;
  } else {
    h += D.entregas.length ? D.entregas.map((e, idx) => {
      const ss = S.slots(e.area, e.turno), f = e.fotos || {}, n = S.countDone(e), cal = e.calif || {}, c = S.califEntrega(e), rep = e.repetir || {};
      const first = ss.find((s) => f[s.key] && !(cal[s.key] && cal[s.key].n)) || ss.find((s) => f[s.key]);
      return `<section class="card" style="margin:0 14px 10px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b style="font-size:15px">${S.TURNO_NAME[e.turno]} · ${S.AREA_NAME[e.area]}</b><div class="mu xs">${esc(e.nombre)} · inició ${S.horaIso(e.inicio)}${e.estado === "entregado" ? " · entregó " + S.horaIso(e.fin) : ""} · ${n}/${ss.length}</div></div><span class="pill ${e.estado === "entregado" ? "ok" : "run"}">${e.estado === "entregado" ? "Entregado" : S.pendRepetir(e) ? "🔁 Repitiendo" : "En curso"}</span></div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap">${c.nota ? `<span style="font:400 22px/1 var(--fd)">${S.NOTAS[c.nota][0]} ${S.NOTAS[c.nota][1]}</span><span class="mu xs">${c.avg.toFixed(1)} · ${c.rated}/${c.total} calificadas</span>` : `<span class="mu sm">Sin calificar · ${c.total} fotos</span>`}</div>
        ${e.nota_general ? `<div class="cmt" style="margin-top:8px"><b>Comentario general · ${esc(e.nota_por || "")}</b>${esc(e.nota_general)}</div>` : ""}
        <div class="thumbs">${ss.map((s) => { const p = f[s.key], url = p && D.urls[p], cap = s.multi ? s.label : s.task.t, cn = cal[s.key] && cal[s.key].n; return url ? `<button class="${rep[s.key] ? "rb-rep" : ""}" style="${rep[s.key] ? "outline:2px solid var(--red)" : ""}" data-gal="${e.id}" data-key="${s.key}" aria-label="Calificar ${esc(cap)}"><img alt="" loading="lazy" src="${esc(url)}">${cn ? `<span class="nb">${S.NOTAS[cn][0]}</span>` : rep[s.key] ? `<span class="nb">🔁</span>` : ""}<span class="cap">${esc(cap)}</span></button>` : `<div class="miss">Falta: ${esc(cap)}</div>`; }).join("")}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">${first ? `<button class="btn honey sm" data-gal="${e.id}" data-key="${first.key}">⭐ Calificar</button>` : ""}<button class="btn lt sm" data-gen="${idx}">💬 Comentario general</button><a class="btn lt sm" href="${esc(waLink(S.resumenEntrega(e)))}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><button class="btn lt sm" data-zipent="${idx}" ${n ? "" : "disabled"}>${I.dl} ZIP</button>${st.me.admin ? `<button class="btn danger sm" data-delent="${idx}" aria-label="Borrar entrega">${I.trash}</button>` : ""}</div>
        <span class="mu xs" style="display:block;margin-top:6px">Toca una foto para calificarla y deslizar a la siguiente. Mantenla presionada para calificar rápido.</span></section>`;
    }).join("") : `<div class="empty">No hay entregas en esta jornada.</div>`;
  }
  return h;
}
let zipLib = null;
function loadZip() { return zipLib || (zipLib = new Promise((res, rej) => { const s = document.createElement("script"); s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"; s.onload = () => res(window.JSZip); s.onerror = () => { zipLib = null; rej(new Error("No se pudo cargar el compresor.")); }; document.head.appendChild(s); })); }
async function downloadZip(items, filename, btn) {
  if (!items.length) return toast("No hay fotos para descargar.");
  const lbl = btn.innerHTML; btn.disabled = true;
  try {
    const JSZip = await loadZip(), zip = new JSZip(); let ok = 0;
    for (let i = 0; i < items.length; i++) {
      btn.textContent = "Foto " + (i + 1) + " de " + items.length + "…";
      try { const r = await fetch(items[i].url); if (r.ok) { zip.file(items[i].path, await r.blob()); ok++; } } catch {}
    }
    if (!ok) throw new Error("No se pudieron descargar las fotos.");
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    toast(ok + " fotos descargadas.");
  } catch (e) { toast(e.message); }
  btn.disabled = false; btn.innerHTML = lbl;
}

/* ---------- Empleados y ajustes (administrador) ---------- */
function viewEmpleados() {
  if (!st.emps) return `<div class="empty"><div class="spin" style="margin:30px auto"></div></div>`;
  return `<div class="sect"><h2>Empleados</h2><span class="pill gr">${st.emps.length}</span></div>
    <div class="pad"><button class="btn honey block" data-a="addemp">+ Agregar empleado</button></div>
    <div class="card" style="margin:10px 14px">${st.emps.length ? st.emps.map((e, i) => `<div class="emp"><div><b>${esc(e.nombre)}</b><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${e.ver ? '<span class="pill" style="background:var(--ink);color:var(--bg)">Supervisor</span>' : ""}${e.turnos.map((t) => `<span class="pill run">${S.TURNO_NAME[t]}</span>`).join("")}${e.areas.map((a) => `<span class="pill ok">${S.AREA_NAME[a]}</span>`).join("")}</div></div><div style="display:flex;gap:6px"><button class="btn lt sm" data-edit="${i}">Editar</button><button class="btn danger sm" data-rm="${i}" aria-label="Borrar a ${esc(e.nombre)}">${I.trash}</button></div></div>`).join("") : `<span class="mu">Agrega al primero con su nombre, su clave de 4 números y sus entregas.</span>`}</div>
    <p class="mu xs pad">Las claves se guardan protegidas: no se pueden ver, solo cambiar. Quien tenga "Puede ver todos los registros" entra con su clave y ve la bitácora y las entregas, sin poder borrar ni editar empleados.</p>`;
}
function empSheet(emp) {
  const e = emp || { nombre: "", areas: [], turnos: ["cierre"], ver: false };
  sheet(`<h2>${emp ? "Editar empleado" : "Nuevo empleado"}</h2>
    <label class="lb" for="en">Nombre</label><input type="text" id="en" maxlength="30" value="${esc(e.nombre)}" autocomplete="off">
    <label class="lb" for="ep">Clave de 4 números</label><input type="tel" inputmode="numeric" id="ep" maxlength="4" placeholder="${emp ? "Déjala vacía para no cambiarla" : "La que te diga el empleado"}" autocomplete="off">
    <span class="lb">Área</span><div class="checks">${S.AREAS.map((a) => `<label><input type="checkbox" data-ar="${a}" ${e.areas.includes(a) ? "checked" : ""}> ${S.AREA_NAME[a]}</label>`).join("")}</div>
    <span class="lb">Entrega</span><div class="checks">${S.TURNOS.map((t) => `<label><input type="checkbox" data-tu="${t}" ${e.turnos.includes(t) ? "checked" : ""}> ${S.TURNO_NAME[t]}</label>`).join("")}</div>
    <span class="lb">Permisos</span><div class="checks"><label class="wide"><input type="checkbox" id="ev" ${e.ver ? "checked" : ""}> Puede ver todos los registros (jefe de piso o gerente)</label></div>
    <p class="err" id="ee"></p><button class="btn honey block" data-a="ok">Guardar</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $("#ep", s).addEventListener("input", (ev) => (ev.target.value = ev.target.value.replace(/\D/g, "").slice(0, 4)));
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = async (ev) => {
      const b = ev.currentTarget; $("#ee", s).textContent = ""; b.disabled = true; b.textContent = "Guardando…";
      try {
        const r = await api("empleado_guardar", { id: emp?.id, nombre: $("#en", s).value, pin: $("#ep", s).value || undefined, areas: $$("[data-ar]", s).filter((c) => c.checked).map((c) => c.dataset.ar), turnos: $$("[data-tu]", s).filter((c) => c.checked).map((c) => c.dataset.tu), ver: $("#ev", s).checked });
        st.emps = r.empleados; close(); renderMain(); toast(emp ? "Empleado actualizado." : "Empleado agregado.");
      } catch (er) { $("#ee", s).textContent = er.message; b.disabled = false; b.textContent = "Guardar"; }
    };
  });
}
function viewAjustes() {
  const pushOn = store.get().push === true;
  return `<div class="sect"><h2>Ajustes</h2></div>
    <div class="card" style="margin:0 14px 10px;display:grid;gap:10px"><b>Mi PIN de administrador</b><span class="mu sm">Lo marcas en el teclado principal para entrar aquí.</span><button class="btn lt" data-a="pin">Cambiar mi PIN</button></div>
    <div class="card" style="margin:0 14px 10px;display:grid;gap:10px"><b>Avisos en este equipo</b><span class="mu sm">${pushOn ? "Activados. Te llegan cierres, aperturas, rutinas terminadas y atrasos." : "Actívalos para recibir cierres, aperturas, rutinas terminadas y atrasos."}</span><button class="btn ${pushOn ? "lt" : "honey"}" data-a="push">${I.bell} ${pushOn ? "Administrar avisos" : "Activar avisos"}</button></div>
    ${st.installEvt ? `<div class="card" style="margin:0 14px 10px;display:grid;gap:10px"><b>Instalar app</b><button class="btn lt" data-a="install">${I.dl} Instalar en este equipo</button></div>` : ""}`;
}
function pinSheet() {
  sheet(`<h2>Cambiar mi PIN</h2><label class="lb" for="np1">PIN nuevo (4 números)</label><input type="password" inputmode="numeric" maxlength="4" id="np1"><label class="lb" for="np2">Repite el PIN</label><input type="password" inputmode="numeric" maxlength="4" id="np2"><p class="err" id="ne"></p><button class="btn honey block" data-a="ok">Guardar PIN</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = async () => {
      const a = $("#np1", s).value, b = $("#np2", s).value, e = $("#ne", s);
      if (!/^\d{4}$/.test(a)) return (e.textContent = "El PIN debe tener 4 números.");
      if (a !== b) return (e.textContent = "Los PIN no coinciden.");
      try { await api("admin_pin", { pin: a }); close(); toast("PIN actualizado."); } catch (er) { e.textContent = er.message; }
    };
  });
}

/* ---------- Avisos (notificaciones push) ---------- */
const b64u = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4), b = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(b, (c) => c.charCodeAt(0)); };
async function pushSheet() {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  let sub = null; try { sub = supported ? await (await navigator.serviceWorker.ready).pushManager.getSubscription() : null; } catch {}
  const who = st.me.jefe ? "cierres, aperturas, rutinas terminadas y tareas atrasadas" : "tareas atrasadas de la rutina";
  sheet(`<h2>${I.bell} Avisos</h2>
    ${!supported ? `<p style="margin:0">${isIOS && !standalone ? "En iPhone primero instala la app: en Safari toca <b>Compartir</b> → <b>Agregar a pantalla de inicio</b>, ábrela desde ahí y vuelve a esta opción." : "Este navegador no permite avisos. Prueba con Chrome."}</p>` :
      sub ? `<p style="margin:0">Los avisos están <b>activados</b> en este equipo. Te llegan: ${who}.</p><button class="btn honey block" data-a="test">Enviar aviso de prueba</button><button class="btn danger block" data-a="off">Desactivar en este equipo</button>` :
      `<p style="margin:0">Recibe un aviso en este equipo aunque la app esté cerrada: ${who}.</p><button class="btn honey block" data-a="on">Activar avisos</button>`}
    <button class="btn lt block" data-a="no">Cerrar</button>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    $("[data-a=on]", s) && ($("[data-a=on]", s).onclick = async (ev) => {
      const b = ev.currentTarget; b.disabled = true; b.textContent = "Activando…";
      try {
        const perm = await Notification.requestPermission();
        if (perm !== "granted") throw new Error("No diste permiso de avisos. Puedes activarlo en los ajustes del navegador.");
        const reg = await navigator.serviceWorker.ready;
        const ns = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(st.me.vapid) });
        await api("push_alta", { sub: ns.toJSON() });
        const v = store.get(); v.push = true; store.set(v);
        await api("push_prueba", { endpoint: ns.endpoint }).catch(() => {});
        close(); renderMain(); toast("Avisos activados.");
      } catch (e) { toast(e.message, 5000); b.disabled = false; b.textContent = "Activar avisos"; }
    });
    $("[data-a=test]", s) && ($("[data-a=test]", s).onclick = async () => { try { await api("push_prueba", { endpoint: sub.endpoint }); toast("Aviso de prueba enviado."); } catch (e) { toast(e.message); } });
    $("[data-a=off]", s) && ($("[data-a=off]", s).onclick = async () => { try { await api("push_baja", { endpoint: sub.endpoint }); await sub.unsubscribe(); } catch {} const v = store.get(); v.push = false; store.set(v); close(); renderMain(); toast("Avisos desactivados."); });
  });
}

/* ---------- Eventos de la vista ---------- */
function wireMain(main, all) {
  $$("[data-rut]", main).forEach((b) => (b.onclick = () => startRutina(all[+b.dataset.rut])));
  $$("[data-zone]", main).forEach((b) => (b.onclick = () => { const z = b.dataset.zone, sec = b.parentElement; const open = sec.classList.contains("closed"); st.zoneOpen[z] = open; sec.classList.toggle("closed", !open); b.setAttribute("aria-expanded", open); }));
  $$("[data-t]", main).forEach((b) => (b.onclick = () => openEntrega(b.dataset.a, b.dataset.t)));
  $("[data-a=back]", main) && ($("[data-a=back]", main).onclick = () => { st.ent = null; renderMain(); refreshHoy(true); });
  $$("[data-shot]", main).forEach((b) => (b.onclick = () => shotEntrega(b.dataset.shot)));
  $$("[data-view]", main).forEach((b) => (b.onclick = () => viewEntregaPhoto(b.dataset.view)));
  if (st.tab === "entregas" && st.ent) stickyEntrega();
  $$("[data-lb]", main).forEach((b) => (b.onclick = () => lightbox(b.dataset.lb, b.dataset.cap)));
  $$("[data-copy]", main).forEach((b) => (b.onclick = () => copy(b.dataset.copy === "rutina" ? S.resumenRutina(today(), st.hoy.rutina, true) : S.resumenRutina(st.panel.data.fecha, st.panel.data.rutina, st.panel.data.fecha === st.panel.data.hoy))));
  // Registros
  $$("[data-day]", main).forEach((b) => (b.onclick = () => { st.panel.fecha = b.dataset.day; st.panel.data = { ...st.panel.data, fecha: b.dataset.day }; refreshPanel(); }));
  $("#pickDay", main) && ($("#pickDay", main).onchange = (e) => { if (e.target.value) { st.panel.fecha = e.target.value; refreshPanel(); } });
  const strip = $("#strip", main), sel = strip && $('[aria-pressed="true"]', strip);
  if (strip && sel) strip.scrollLeft = Math.max(0, sel.offsetLeft - strip.clientWidth / 2 + sel.clientWidth / 2);
  $$("[data-sub]", main).forEach((b) => (b.onclick = () => { st.panel.sub = b.dataset.sub; renderMain(); }));
  $$("[data-zf]", main).forEach((b) => (b.onclick = () => { st.panel.zone = b.dataset.zf; renderMain(); }));
  // Calificar rutina
  $$("[data-rrn]", main).forEach((b) => (b.onclick = (e) => { e.preventDefault(); rateRutina(b.closest("[data-rid]").dataset.rid, +b.dataset.rrn); }));
  $$("[data-savec]", main).forEach((b) => (b.onclick = () => { const id = b.dataset.savec; rateRutina(id, undefined, $(`[data-rc="${id}"]`, main).value); }));
  $$("[data-rep]", main).forEach((b) => (b.onclick = () => { const d = st.panel.data.rutina.find((x) => x.id === b.dataset.rep); if (d) repetirRutinaSheet(d); }));
  $$("details[data-ev]", main).forEach((dt) => dt.addEventListener("toggle", () => { if (dt.open) st.panel.open.add(dt.dataset.ev); else st.panel.open.delete(dt.dataset.ev); }));
  $$("details[data-ev] > summary", main).forEach((sm) => longPress(sm, (x, y) => quickRate(x, y, (n) => rateRutina(sm.parentElement.dataset.ev, n))));
  // Calificar entregas
  $$("[data-gal]", main).forEach((b) => (b.onclick = () => galeriaEntrega(b.dataset.gal, b.dataset.key)));
  $$(".thumbs [data-gal]", main).forEach((b) => longPress(b, (x, y) => quickRate(x, y, async (n) => {
    try { const r = await api("entrega_calificar", { id: b.dataset.gal, key: b.dataset.key, nota: n }); const D = st.panel.data, k = D.entregas.findIndex((z) => z.id === b.dataset.gal); D.entregas[k] = r.entrega; toast(S.notaTxt(n) + " guardado"); renderMain(); }
    catch (er) { toast(er.message); }
  })));
  $$("[data-gen]", main).forEach((b) => (b.onclick = () => {
    const D = st.panel.data, e = D.entregas[+b.dataset.gen];
    prompt2("Comentario general de la entrega", async (t) => {
      try { const r = await api("entrega_comentar", { id: e.id, txt: t }); D.entregas[+b.dataset.gen] = r.entrega; renderMain(); toast("Comentario enviado."); } catch (er) { toast(er.message); }
    }, e.nota_general || "");
  }));
  $$("[data-delrut]", main).forEach((b) => (b.onclick = async (e) => { e.preventDefault(); if (!(await confirmSheet("¿Borrar este registro?", "La foto se borrará para siempre.", "Borrar", true))) return; try { await api("rutina_borrar", { id: b.dataset.delrut }); toast("Registro borrado."); refreshPanel(); } catch (er) { toast(er.message); } }));
  $$("[data-delent]", main).forEach((b) => (b.onclick = async () => { const e = st.panel.data.entregas[+b.dataset.delent]; if (!(await confirmSheet("¿Borrar esta entrega?", "Se borrarán sus " + S.countDone(e) + " fotos para siempre.", "Borrar", true))) return; try { await api("entrega_borrar", { id: e.id }); toast("Entrega borrada."); refreshPanel(); } catch (er) { toast(er.message); } }));
  $$("[data-zipent]", main).forEach((b) => (b.onclick = () => {
    const D = st.panel.data, e = D.entregas[+b.dataset.zipent], dir = e.fecha + "_" + slug(S.TURNO_NAME[e.turno]) + "_" + slug(S.AREA_NAME[e.area]) + "_" + slug(e.nombre);
    downloadZip(S.slots(e.area, e.turno).filter((s) => e.fotos[s.key] && D.urls[e.fotos[s.key]]).map((s) => ({ url: D.urls[e.fotos[s.key]], path: dir + "/" + String(s.ti + 1).padStart(2, "0") + "_" + slug(s.task.t) + (s.multi ? "_" + (s.i + 1) + "-" + slug(s.label) : "") + ".jpg" })), "checklist_" + dir + ".zip", b);
  }));
  $("[data-a=ziprut]", main) && ($("[data-a=ziprut]", main).onclick = (ev) => {
    const D = st.panel.data, g = S.rutByTask(D.rutina), items = [];
    S.RUTINA.forEach((r, i) => g[r.id].forEach((d) => { if (D.urls[d.foto]) items.push({ url: D.urls[d.foto], path: "rutina_" + D.fecha + "/" + String(i + 1).padStart(2, "0") + "_" + slug(r.t) + "/" + S.horaIso(d.at).replace(/[^0-9a-z]/gi, "") + "_" + slug(d.nombre) + ".jpg" }); }));
    downloadZip(items, "checklist-rutina_" + D.fecha + ".zip", ev.currentTarget);
  });
  // Empleados / ajustes
  $("[data-a=addemp]", main) && ($("[data-a=addemp]", main).onclick = () => empSheet(null));
  $$("[data-edit]", main).forEach((b) => (b.onclick = () => empSheet(st.emps[+b.dataset.edit])));
  $$("[data-rm]", main).forEach((b) => (b.onclick = async () => { const e = st.emps[+b.dataset.rm]; if (!(await confirmSheet("¿Borrar a " + e.nombre + "?", "Ya no podrá entrar con su clave. Sus registros se conservan.", "Borrar", true))) return; try { st.emps = (await api("empleado_borrar", { id: e.id })).empleados; renderMain(); toast("Empleado borrado."); } catch (er) { toast(er.message); } }));
  $("[data-a=pin]", main) && ($("[data-a=pin]", main).onclick = pinSheet);
  $("[data-a=push]", main) && ($("[data-a=push]", main).onclick = pushSheet);
  $("[data-a=install]", main) && ($("[data-a=install]", main).onclick = async () => { st.installEvt.prompt(); await st.installEvt.userChoice.catch(() => {}); st.installEvt = null; renderMain(); });
}

/* ---------------- Arranque ---------------- */
window.addEventListener("scroll", () => { const t = $("#top"); if (t) t.classList.toggle("scrolled", window.scrollY > 4); }, { passive: true });
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); st.installEvt = e; if (!st.token) renderLogin(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
const typing = () => { const a = document.activeElement; return a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT"); };
setInterval(() => { if (!st.token || document.hidden || $(".cam") || typing()) return; renderMain(); }, 30000);
setInterval(() => { if (!st.token || document.hidden || $(".cam") || $(".sheet-bg") || $(".qpop") || typing()) return; if (st.tab === "registros") refreshPanel(true); else if (!st.me.admin && st.tab !== "empleados") refreshHoy(true); }, 25000);
document.addEventListener("visibilitychange", () => { if (!document.hidden && st.token) { if (st.tab === "registros") refreshPanel(true); else if (!st.me.admin) refreshHoy(true); } });

(async function boot() {
  const saved = store.get();
  if (saved.token && saved.me) {
    st.token = saved.token; st.me = saved.me; st.tab = st.me.admin ? "registros" : "rutina";
    render();
    try { const me = await api("yo"); st.me = { ...st.me, ...me }; saveSession(); if (st.me.admin) refreshPanel(); else refreshHoy(); }
    catch { /* api() ya cierra la sesión si venció */ }
  } else { render(); loadEstado(); }
})();
