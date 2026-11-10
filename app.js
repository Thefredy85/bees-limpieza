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
  fire: sv('<path d="M12 3c1 3 4 4.5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/>'),
  play: sv('<path d="M8 5l11 7-11 7z"/>'),
  msg: sv('<path d="M4 5h16v11H9l-5 4z"/>'),
  trophy: sv('<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4a3 3 0 0 0 4 4M16 6h4a3 3 0 0 1-4 4M12 13v4M8 20h8M9 17h6v3H9z"/>'),
  sun: sv('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>'),
  grid: sv('<rect x="3.5" y="3.5" width="7" height="9" rx="2"/><rect x="13.5" y="3.5" width="7" height="5" rx="2"/><rect x="13.5" y="11.5" width="7" height="9" rx="2"/><rect x="3.5" y="15.5" width="7" height="5" rx="2"/>'),
  alarm: sv('<circle cx="12" cy="13" r="7.5"/><path d="M12 9v4l2.5 2M4 5l3-2M20 5l-3-2"/>'),
  box: sv('<path d="M3.5 7.5L12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5L12 12l8.5-4.5M12 12v9"/>'),
  star: sv('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>'),
  eye: sv('<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>'),
  key: sv('<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>'),
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
  animo: null, tablero: null, acc: new Set(["atr"]), accJust: null, accX: 50, tlOpen: new Set(), tlScrolled: false, heroDone: false, rutView: (() => { try { return JSON.parse(localStorage.getItem("bees-checklist-v1") || "{}").rutView || "linea"; } catch { return "linea"; } })(),
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
let lastTap = { x: innerWidth / 2, y: innerHeight };
document.addEventListener("pointerdown", (e) => (lastTap = { x: e.clientX, y: e.clientY }), { capture: true, passive: true });
function sheet(html, wire, center) {
  const bg = document.createElement("div");
  bg.className = "sheet-bg" + (center ? " center" : "");
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  requestAnimationFrame(() => {
    // La burbuja nace donde tocaste, pero siempre dentro de la hoja y con radio suficiente para cubrirla completa.
    const sh = bg.firstChild, r = sh.getBoundingClientRect();
    const ox = Math.min(Math.max(lastTap.x - r.left, 0), r.width), oy = Math.min(Math.max(lastTap.y - r.top, 0), r.height);
    const rad = Math.ceil(Math.hypot(Math.max(ox, r.width - ox), Math.max(oy, r.height - oy))) + 20;
    sh.style.setProperty("--ox", Math.round(ox) + "px"); sh.style.setProperty("--oy", Math.round(oy) + "px"); sh.style.setProperty("--or", rad + "px");
    sh.classList.add("grow");
    sh.addEventListener("animationend", () => { sh.style.clipPath = "none"; sh.classList.add("shown"); }, { once: true });
  });
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
function confetti(n = 46) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div"); box.className = "confeti"; box.setAttribute("aria-hidden", "true");
  const col = ["#F5B324", "#1F9D55", "#DC2626", "#3B82F6", "#FFF6DE", "#B87C00"];
  for (let i = 0; i < n; i++) { const p = document.createElement("i"); p.style.cssText = `left:${Math.random() * 100}%;background:${col[i % col.length]};animation-delay:${Math.random() * 0.35}s;animation-duration:${1.6 + Math.random() * 1.2}s;transform:rotate(${Math.random() * 360}deg);width:${6 + Math.random() * 6}px;height:${8 + Math.random() * 8}px`; box.appendChild(p); }
  document.body.appendChild(box); setTimeout(() => box.remove(), 3200);
}
function doneOverlay(title, line1, line2, big) {
  confetti(big ? 90 : 46);
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
/* Los mismos registros viven en varias vistas (panel, rutina, registros): se actualizan en todas. */
const fuentes = () => [st.panel.data, st.tablero, st.hoy].filter(Boolean);
function ponRegistro(reg) { fuentes().forEach((D) => { const i = (D.rutina || []).findIndex((x) => x.id === reg.id); if (i >= 0) D.rutina[i] = { ...D.rutina[i], ...reg }; }); }
function ponEntrega(e) { fuentes().forEach((D) => { const i = (D.entregas || []).findIndex((x) => x.id === e.id); if (i >= 0) D.entregas[i] = e; }); }
async function rateRutina(id, nota, coment, quiet) {
  try {
    const body = { id }; if (nota !== undefined) body.nota = nota; if (coment !== undefined) body.coment = coment;
    const r = await api("rutina_calificar", body);
    ponRegistro(r.registro);
    if (!quiet) toast(nota ? S.notaTxt(r.registro.nota) + " guardado" : "Comentario guardado");
    renderMain(); return r.registro;
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
      try { const r = await api("rutina_repetir", { id: d.id, txt, para }); ponRegistro(r.registro); close(); toast("Se pidió repetir. Ya le avisamos."); renderMain(); if (st.panel.data) refreshPanel(true); if (st.tablero) refreshTablero(true); refreshHoy(true); }
      catch (e) { $("#re", s).textContent = e.message; b.disabled = false; }
    };
    $("[data-a=mismo]", s).onclick = (e) => go("mismo", e.currentTarget);
    $("[data-a=todos]", s).onclick = (e) => go("todos", e.currentTarget);
  });
}
/* Galería para calificar las fotos de una entrega: desliza, califica y pasa a la siguiente. */
function galeriaEntrega(entId, startKey) {
  const D = fuentes().find((x) => (x.entregas || []).some((e) => e.id === entId) && x.urls);
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
      try { const r = await api("entrega_calificar", { id: entId, key: keys[i].key, ...body }); ponEntrega(r.entrega); vibrate(20);
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
          try { const r = await api("entrega_repetir", { id: entId, key: keys[i].key, txt: t }); ponEntrega(r.entrega); draw(); toast("Se pidió repetir. Ya le avisamos."); }
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
  st.token = null; st.me = null; st.hoy = null; st.ent = null; st.animo = null; st.tablero = null; st.panel = { fecha: null, data: null, sub: "rutina", zone: "todas", open: new Set() }; st.emps = null; st.alerted = new Set(); st.alertInit = false;
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
  st.token = r.token; st.me = { rol: r.rol, emp: r.emp, nombre: r.nombre || r.emp?.nombre || "", jefe: r.jefe, admin: r.admin, vapid: r.vapid };
  st.heroDone = false; st.tlScrolled = false; st.animo = null;
  saveSession(); lastAct = Date.now();
  st.tab = st.me.jefe ? "panel" : "rutina"; st.tablero = null; st.enter = true;
  render();
  refreshHoy(); if (st.me.jefe) refreshTablero();
  refreshAnimo();
}

/* ---------------- Carga de datos ---------------- */
async function loadEstado() { try { st.estado = await api("estado"); if (!st.token) render(); } catch {} }
async function refreshHoy(silent) {
  try { st.hoy = await api("hoy"); if (st.hoy.emp) st.me.emp = st.hoy.emp; if (st.hoy.nombre) st.me.nombre = st.hoy.nombre; saveSession(); renderMain(); }
  catch (e) { if (!silent) toast(e.message); }
}
async function refreshPanel(silent) {
  try { st.panel.data = await api("panel", { fecha: st.panel.fecha || today() }); st.panel.fecha = st.panel.data.fecha; renderMain(); }
  catch (e) { if (!silent) toast(e.message); }
}
async function refreshTablero(silent) {
  try { st.tablero = await api("panel", { fecha: today() }); if (st.tablero.nombre) st.me.nombre = st.tablero.nombre; renderMain(); }
  catch (e) { if (!silent) toast(e.message); }
}
async function refreshAnimo() { try { st.animo = await api("animo"); renderMain(); } catch {} }
async function refreshEmps() { try { st.emps = (await api("empleados")).empleados; renderMain(); } catch (e) { toast(e.message); } }

/* ================= VISTAS ================= */
const root = () => $("#root");
function render() {
  if (!st.token) return renderLogin();
  root().innerHTML = `<div class="blobs" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="app"><header class="top" id="top"></header><main id="main"></main></div><nav class="tabs" aria-label="Secciones"><div class="in" id="tabs"></div></nav>`;
  wireSwipe($("#main"));
  renderMain();
}

/* ---------- Acceso ---------- */
function renderLogin() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent), standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  root().innerHTML = `<div class="blobs" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="login">
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
    <label class="lb" for="sn">Tu nombre</label><input type="text" id="sn" maxlength="30" autocomplete="off" placeholder="Alfredo">
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
      if (!$("#sn", s).value.trim()) return (e.textContent = "Escribe tu nombre.");
      try { const r = await api("setup", { code: $("#sc", s).value, pin: p1, nombre: $("#sn", s).value.trim() }); close(); await afterLogin(r); toast("Listo. Ya eres administrador."); }
      catch (er) { e.textContent = er.message; b.disabled = false; b.textContent = "Crear y entrar"; }
    };
  });
}

/* ---------- Encabezado y pestañas ---------- */
/* Toman fotos: colaboradores con área y todos los supervisores. El administrador solo ve y califica. */
const haceTareas = () => !!st.me?.emp && (!!st.me.emp.ver || !!st.me.emp.areas?.length);
function tabsFor() {
  const P = ["panel", "Panel", I.grid], R = ["rutina", "Rutina", I.list], E = ["entregas", "Entregas", I.moon], M = ["midia", "Mi día", I.cal], G = ["registros", "Registros", I.chart], Q = ["empleados", "Equipo", I.users];
  if (st.me.admin) return [P, R, G, Q];
  if (st.me.jefe) return [P, R, E, G];
  return [R, E, M];
}
function renderTop(all, stats) {
  const top = $("#top"); if (!top) return;
  const pushOn = store.get().push === true, nombre = st.me.nombre || st.me.emp?.nombre || "";
  const gear = `<button class="ico" id="gear" aria-label="Ajustes" aria-pressed="${st.tab === "ajustes"}">${I.gear}${pushOn ? "" : '<span class="dot"></span>'}</button>`;
  if (st.me.jefe && st.tab !== "rutina" && st.tab !== "entregas" && st.tab !== "midia") {
    top.innerHTML = `<div class="hex" style="width:38px;height:42px;font-size:20px">B</div><div class="who"><b>${esc(nombre)}</b><span>${st.me.admin ? "Administrador · Bee's Sullivan" : "Supervisor · Bee's Sullivan"}</span></div>
      ${gear}<button class="ico" id="out" aria-label="Salir">${I.out}</button>`;
  } else {
    const pct = stats?.pct, urg = (stats?.red || 0) + (stats?.yellow || 0);
    top.innerHTML = `<div class="ring" style="--p:${pct ?? 0}" aria-label="${pct == null ? "Sin horarios vencidos" : pct + "% a tiempo hoy"}"><span>${pct == null ? "—" : pct + "%"}</span></div>
      <div class="who"><b>${esc(nombre)}</b><span>${esc(S.fechaLarga(today()))} · ${urg ? urg + " por hacer ahora" : "todo al día"}</span></div>
      ${gear}<button class="ico" id="out" aria-label="Salir">${I.out}</button>`;
  }
  $("#out").onclick = salirSheet;
  $("#gear") && ($("#gear").onclick = () => goTab(st.tab === "ajustes" ? (st.prevTab || tabsFor()[0][0]) : "ajustes"));
}
function goTab(id, dir) {
  if (st.tab === id) return window.scrollTo({ top: 0, behavior: "smooth" });
  if (id === "ajustes") st.prevTab = st.tab;
  st.tab = id; st.ent = null; st.tlScrolled = false; window.scrollTo(0, 0); renderMain();
  const m = $("#main"); if (m && dir) { m.classList.remove("slide-l", "slide-r"); void m.offsetWidth; m.classList.add(dir > 0 ? "slide-l" : "slide-r"); }
  if (st.tab === "registros") refreshPanel(); else if (st.tab === "empleados") refreshEmps(); else if (st.tab !== "ajustes") refreshHoy(true);
  if (st.tab === "panel") refreshTablero(true);
  if (st.tab === "midia" || st.tab === "rutina" || st.tab === "panel") refreshAnimo();
  if (st.tab === "ajustes" && st.me.admin && !st.panel.data && !st.tablero) refreshTablero(true);
}
function renderTabs(badge) {
  const t = $("#tabs"); if (!t) return;
  t.innerHTML = tabsFor().map(([id, lbl, ic]) => `<button role="tab" data-tab="${id}" aria-selected="${st.tab === id}">${ic}<span>${lbl}</span>${id === "rutina" && badge ? `<span class="badge">${badge}</span>` : ""}</button>`).join("");
  $$("[data-tab]", t).forEach((b) => (b.onclick = () => { const ids = tabsFor().map((x) => x[0]); goTab(b.dataset.tab, ids.indexOf(b.dataset.tab) - ids.indexOf(st.tab)); }));
}
function renderMain() {
  const main = $("#main"); if (!main || !st.token) return;
  let all = null, stats = null;
  if (st.hoy) { all = S.rutAll(st.hoy.rutina, st.hoy.fecha === today() ? st.hoy.fecha : today(), nowMin(), iniHoy()); stats = S.dayStats(all); checkAlerts(all); }
  renderTop(all, stats); renderTabs(stats ? stats.red + stats.yellow : 0);
  const y = window.scrollY, oldHero = $("#hero");
  $(".stick")?.remove();
  if (st.tab === "panel") main.innerHTML = viewPanel();
  else if (st.tab === "rutina") main.innerHTML = viewRutina(all, stats);
  else if (st.tab === "entregas") main.innerHTML = st.ent ? viewChecklist() : viewEntregas();
  else if (st.tab === "midia") main.innerHTML = viewMiDia(all);
  else if (st.tab === "registros") main.innerHTML = viewRegistros();
  else if (st.tab === "empleados") main.innerHTML = viewEmpleados();
  else if (st.tab === "ajustes") main.innerHTML = viewAjustes();
  const nh = $("#hero", main);
  if (oldHero && nh && oldHero.dataset.k === nh.dataset.k) { oldHero.querySelector(".racha")?.remove(); const rc = nh.querySelector(".racha"); if (rc) oldHero.appendChild(rc); nh.replaceWith(oldHero); }
  else if (nh && !st.heroDone) nh.classList.add("anim");
  if (nh) st.heroDone = true;
  if (st.enter && main.children.length > 2) { st.enter = false; main.classList.remove("enter"); void main.offsetWidth; main.classList.add("enter"); setTimeout(() => main.classList.remove("enter"), 1200); }
  st.accJust = null;
  wireMain(main, all);
  window.scrollTo(0, y);
  if (st.tab === "rutina" && !st.tlScrolled && $("#tlNow", main)) { st.tlScrolled = true; const el = $("#tlNow", main); if (el.getBoundingClientRect().top > innerHeight * 0.75) el.scrollIntoView({ block: "center", behavior: "smooth" }); }
}

/* ---------- Rutina ---------- */
function viewRutina(all, stats) {
  if (!st.hoy) return `<div class="empty"><div class="spin" style="margin:30px auto"></div>Cargando…</div>`;
  let h = heroHtml() + retrosCard() + inicioCard(st.hoy.inicio, true);
  if (st.me.jefe && haceTareas()) h += `<div class="pad" style="margin:-2px 0 10px"><button class="btn lt sm" data-a="midia">${I.cal} Mi día</button></div>`;
  h += `<div class="seg" role="tablist" style="margin-top:4px"><button role="tab" data-rv="linea" aria-selected="${st.rutView === "linea"}">Línea de tiempo</button><button role="tab" data-rv="zona" aria-selected="${st.rutView === "zona"}">Por zona</button></div>`;
  h += st.rutView === "linea" ? viewLinea(all) : viewZonas(all);
  h += `<div class="pad" style="margin-top:16px;display:flex;gap:8px"><a class="btn lt sm" href="${esc(waLink(S.resumenRutina(today(), st.hoy.rutina, true, iniHoy())))}" target="_blank" rel="noopener">${I.wa} Resumen WhatsApp</a><button class="btn lt sm" data-copy="rutina">Copiar</button></div>`;
  return h;
}
const iniHoy = () => st.hoy?.inicio?.m ?? null;
function viewZonas(all) {
  const now = nowMin(), offAll = all.every((a) => a.state === "off");
  const urgent = all.filter((a) => a.state === "red" || a.state === "yellow").sort((a, b) => a.rank - b.rank || a.left - b.left);
  const next = all.filter((a) => a.state === "green" && a.next).sort((a, b) => a.left - b.left)[0];
  let h = "";
  if (offAll && now >= S.CUT_MIN) h += `<div class="banner off">${I.check}<span>Fuera de horario de rutina. Todo en orden hasta mañana.</span></div>`;
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
  return h;
}
/* Texto de una repetición pendiente: motivo, quién la pidió y a quién. */
function repInfo(a) {
  if (!a.rep) return "";
  const d = a.docs[a.rep.ix], me = st.me.emp?.id, eq = st.hoy?.equipo || {};
  const para = d.rep_para ? (d.rep_para === me ? "Te lo pidió " : "Pedido a " + (eq[d.rep_para] || d.nombre) + " por ") : "";
  return (d.rep_txt ? "“" + d.rep_txt + "” " : "") + "— " + (para || "") + (d.rep_por || "");
}
function startRutina(a, directo) {
  if (!haceTareas()) return verCalificar(a);
  // Supervisor: si la tarea ya tiene registros, elige entre tomar foto o revisar la última.
  if (st.me.jefe && !directo && a.docs.some((d) => !d.anulado)) {
    return sheet(`<h2>${esc(a.r.t)}</h2><span class="mu sm">${esc(a.text)}</span>
      <button class="btn honey block" data-a="foto">${I.cam} Tomar foto</button><button class="btn lt block" data-a="ver">${I.eye} Ver y calificar la última</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
      $("[data-a=foto]", s).onclick = () => { close(); startRutina(a, true); };
      $("[data-a=ver]", s).onclick = () => { close(); verCalificar(a); };
      $("[data-a=no]", s).onclick = close;
    });
  }
  const r = a.r;
  if (a.noIni) return toast(st.me.jefe ? "La rutina aún no inicia. Iníciala con el botón de arriba." : "La rutina aún no inicia. Avísale a tu supervisor si ya hay que empezar.", 4500);
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


/* ---------- Saludo, retros, inicio y línea de tiempo ---------- */
const SALUDOS = {
  m: ["Buenos días", ["¿Listo para arrancar?", "Hoy va a salir increíble.", "Café, guantes y a darle."]],
  t: ["Buena tarde", ["¿Cómo va tu día?", "Vamos a mitad del camino.", "Lo estás haciendo muy bien."]],
  n: ["Buenas noches", ["Ya casi terminamos.", "Un último empujón.", "Cerremos el día con todo."]],
};
function heroHtml() {
  const hr = S.mxDate(nowMs()).getUTCHours(), per = hr < 12 ? "m" : hr < 19 ? "t" : "n";
  const [sal, qs] = SALUDOS[per], name = (st.me.nombre || st.me.emp?.nombre || "").split(" ")[0];
  const q = st.me.jefe && !st.me.emp?.areas?.length ? "¿Cómo va el equipo?" : qs[(+today().slice(8) + (st.me.emp?.nombre?.length || 0)) % qs.length];
  const racha = st.animo?.racha || 0;
  return `<section class="hero ${per}" id="hero" data-k="${per}${esc(name)}"><span class="orb" aria-hidden="true"></span>
    <div class="ht"><span class="hs">${sal}…</span><b class="hn" aria-label="${esc(name)}">${[...name].map((c, i) => `<span style="animation-delay:${0.45 + i * 0.07}s">${esc(c)}</span>`).join("")}<span class="dots" style="animation-delay:${0.5 + name.length * 0.07}s">…</span></b><span class="hq" style="animation-delay:${0.9 + name.length * 0.07}s">${esc(q)}</span></div>
    ${racha > 0 ? `<span class="racha" title="Días seguidos con tu rutina a tiempo">${I.fire}<b>${racha}</b><span>día${racha > 1 ? "s" : ""}</span></span>` : ""}</section>`;
}
function retrosCard() {
  if (!st.me.emp || !st.hoy || !st.me.emp.areas?.length) return "";
  const n = st.hoy.retros_nuevas || 0;
  return `<button class="retro ${n ? "new" : ""}" data-a="retros">${I.msg}<span><b>Mis retros</b><span class="mu xs">${n ? n + " nueva" + (n > 1 ? "s" : "") + " de tu supervisor" : "Tus calificaciones y comentarios"}</span></span>${n ? `<span class="badge">${n}</span>` : I.right}</button>`;
}
async function retrosSheet() {
  let close = sheet(`<h2>${I.msg} Mis retros</h2><div id="rtb"><div class="spin" style="margin:20px auto"></div></div><button class="btn lt block" data-a="no">Cerrar</button>`, (s, c) => ($("[data-a=no]", s).onclick = c));
  try {
    const R = await api("mis_retros"), box = $("#rtb"); if (!box) return;
    const v = R.visto || "", nuevo = (t) => (t || "") > v ? `<span class="pill bad" style="margin-left:6px">Nuevo</span>` : "";
    const items = [];
    R.rutina.forEach((r) => { const t = S.RUTINA.find((x) => x.id === r.task_id), url = R.urls[r.foto];
      items.push({ f: r.fecha, at: r.rep_at || r.cal_at || r.at, h: `<div class="mi" style="flex-wrap:wrap">${url ? `<img alt="" src="${esc(url)}" data-lbr="${esc(url)}">` : `<img alt="">`}<div style="flex:1;min-width:0"><b style="display:block">${esc(t?.t || "Rutina")}${nuevo(r.rep_at || r.cal_at)}</b><span class="mu xs">${esc(S.diaCorto(r.fecha))} ${+r.fecha.slice(8)} · ${S.horaIso(r.at)}</span>${r.nota ? `<div style="margin-top:3px">${notaPill(r.nota)}</div>` : ""}</div>
        ${r.anulado ? `<div class="repbox" style="width:100%"><b>🔁 ${esc(r.rep_por)} pidió repetir</b><span class="sm">${esc(r.rep_txt)}</span></div>` : r.coment ? `<div class="cmt" style="width:100%"><b>${esc(r.cal_por || "")}</b>${esc(r.coment)}</div>` : ""}</div>` }); });
    R.entregas.forEach((e) => { const c = S.califEntrega(e), cal = e.calif || {}, ultimo = [e.nota_at, ...Object.values(cal).map((x) => x && x.at)].filter(Boolean).sort().pop();
      const notas = S.slots(e.area, e.turno).filter((sl) => cal[sl.key] && (cal[sl.key].c || cal[sl.key].n <= 2));
      items.push({ f: e.fecha, at: ultimo || e.fin || e.inicio, h: `<div class="mi" style="padding:12px;display:grid;gap:8px"><div style="display:flex;align-items:center;gap:8px"><div style="flex:1"><b>${S.TURNO_NAME[e.turno]} · ${S.AREA_NAME[e.area]}${nuevo(ultimo)}</b><br><span class="mu xs">${esc(S.diaCorto(e.fecha))} ${+e.fecha.slice(8)} · ${e.estado === "entregado" ? "entregaste " + S.horaIso(e.fin) : "en curso"}</span></div>${c.nota ? notaPill(c.nota) : `<span class="pill gr">Sin calificar</span>`}</div>
        ${e.nota_general ? `<div class="cmt"><b>Comentario general · ${esc(e.nota_por || "")}</b>${esc(e.nota_general)}</div>` : ""}
        ${notas.map((sl) => `<div class="cmt"><b>${S.NOTAS[cal[sl.key].n]?.[0] || ""} ${esc(sl.task.t)}${sl.multi ? " · " + esc(sl.label) : ""}</b>${esc(cal[sl.key].c || S.NOTAS[cal[sl.key].n]?.[1] || "")}</div>`).join("")}</div>` }); });
    items.sort((a, b) => (a.f < b.f ? 1 : a.f > b.f ? -1 : a.at < b.at ? 1 : -1));
    let lastF = "", rows = "";
    items.forEach((x, i) => { if (x.f !== lastF) { lastF = x.f; rows += `<div class="vday it" style="animation-delay:${i * 40}ms"><span>${x.f === today() ? "Hoy" : esc(S.diaCorto(x.f)) + " " + +x.f.slice(8)}</span></div>`; } rows += `<div class="it" style="animation-delay:${i * 40 + 20}ms">${x.h}</div>`; });
    box.innerHTML = items.length ? `<p class="mu sm" style="margin:0 0 8px">Últimos 14 días. Lo más reciente arriba.</p><div class="vr pop" style="--x:50%">${rows}</div>` : `<div class="empty">Aún no tienes calificaciones. Cuando tu supervisor califique tus fotos, aparecerán aquí.</div>`;
    $$("[data-lbr]", box).forEach((im) => (im.onclick = () => lightbox(im.dataset.lbr, "")));
    if (st.hoy?.retros_nuevas) { api("retros_visto").catch(() => {}); st.hoy.retros_nuevas = 0; renderMain(); }
  } catch (e) { const box = $("#rtb"); if (box) box.innerHTML = `<p class="err">${esc(e.message)}</p>`; }
}
function inicioCard(ini, compact) {
  if (!ini) return "";
  const now = nowMin();
  if (ini.m != null) return compact ? `<div class="inicio-ok">${I.play}<span>Rutina iniciada a las <b>${S.fmtMin(ini.m)}</b>${ini.por ? " · " + esc(ini.por === "Programada" ? "programada" : ini.por) : ""}</span></div>` : "";
  if (now >= S.CUT_MIN) return "";
  return `<section class="inicio"><div class="ii">${I.play}</div><div style="flex:1;min-width:0"><b>La rutina aún no inicia</b><span class="mu sm">${ini.prog != null ? "Se inicia sola a las " + S.fmtMin(ini.prog) + "." : "Hoy no tiene hora programada."} Exterior sigue en su horario.</span></div>
    ${st.me.jefe ? `<button class="btn honey block" data-a="iniciar">${I.play} Iniciar rutina ahora</button>` : `<span class="mu xs" style="width:100%">Si ya hay que empezar, avísale a tu supervisor.</span>`}</section>`;
}
async function iniciarRutina() {
  if (!(await confirmSheet("¿Iniciar la rutina ahora?", "Los horarios empiezan a contar desde este momento y a todo el equipo le llega el aviso.", "Iniciar rutina"))) return;
  try {
    const r = await api("rutina_iniciar");
    if (st.hoy) st.hoy.inicio = r.inicio;
    if (st.panel.data && st.panel.data.fecha === st.panel.data.hoy) st.panel.data.inicio = r.inicio;
    if (st.tablero) st.tablero.inicio = r.inicio;
    doneOverlay("¡Rutina iniciada!", "Le avisamos a todo el equipo.", "Primeras tareas a las " + S.fmtMin(r.inicio.m + 60));
    renderMain(); if (st.tab === "registros") refreshPanel(true); refreshHoy(true); if (st.tablero) refreshTablero(true);
  } catch (e) { toast(e.message, 5000); }
}
const CORTO = { r1: "Baños clientes", r2: "Baños colab.", r3: "Botes", r4: "Vidrios", r5: "Mostrador", r6: "Comedor", r7: "Cajas", r8: "Amasado", r9: "Vestidores", r10: "Bodega", r11: "Escaleras" };
const KLBL = { ok: "a tiempo", late: "tarde", rep: "por repetir", miss: "sin hacer", now: "toca ya", next: "pendiente" };
function tcard(a) {
  const ri = repInfo(a), last = a.docs[a.docs.length - 1];
  return `<button class="tcard ${a.state}" data-rut="${a.idx}"><span class="tz">${I[a.r.z]}</span><span class="tt"><b>${esc(a.r.t)}</b><span class="k">${esc(a.text)}</span>${ri ? `<span class="xs" style="font-weight:700">${esc(ri)}</span>` : last && !a.rep ? `<span class="mu xs">Último: ${esc(last.nombre)} ${S.horaIso(last.at)}</span>` : ""}</span><span class="go">${haceTareas() ? I.cam + `<span>${a.rep ? "Repetir" : "Foto"}</span>` : I.eye + "<span>Ver</span>"}</span></button>`;
}
function viewLinea(all) {
  const now = nowMin(), ini = iniHoy();
  const urgent = all.filter((a) => a.state === "red" || a.state === "yellow").sort((a, b) => a.rank - b.rank || a.left - b.left);
  const nodes = {};
  all.forEach((a) => { if (a.r.win) return; a.sch.forEach((sl, i) => {
    const f = a.filled[i], rp = a.repPend[i];
    const k = f ? (f.late || f.rep ? "late" : "ok") : rp ? "rep" : sl.to <= now ? "miss" : now >= sl.H - 10 ? "now" : "next";
    (nodes[sl.H] = nodes[sl.H] || { H: sl.H, it: [] }).it.push({ a, i, k });
  }); });
  const list = Object.values(nodes).sort((x, y) => x.H - y.H);
  let cur = -1; list.forEach((n, ix) => { if (n.H <= now + 10) cur = ix; });
  const fin = now >= S.CUT_MIN;
  const ahora = `<div class="tl-now" id="tlNow"><div class="tl-lbl"><span>Ahora · ${S.fmtMin(now)}</span></div>${urgent.length ? urgent.map(tcard).join("") : `<div class="allgood">${I.check}<span>Todo al día${list[cur + 1] ? " · siguiente a las " + S.fmtMin(list[cur + 1].H) : ""}</span></div>`}</div>`;
  const pill = (side, cls, txt) => `<span class="tp ${cls}">${txt}</span>`;
  const nodeHtml = (n, ix) => {
    const cnt = (k) => n.it.filter((x) => x.k === k).length, ok = cnt("ok"), late = cnt("late"), miss = cnt("miss"), rep = cnt("rep"), total = n.it.length;
    const past = ix < cur || fin, isCur = ix === cur && !fin;
    const color = isCur ? "cur" : past ? (miss || rep ? "r" : late ? "y" : "g") : "f";
    const open = st.tlOpen.has(n.H);
    let L, R;
    if (past || isCur) { L = pill("l", "g", I.check + " " + (ok + late) + " hecha" + (ok + late === 1 ? "" : "s")); R = miss || rep || late ? pill("r", miss || rep ? "r" : "y", [late && late + " tarde", miss && miss + " sin hacer", rep && rep + " por repetir"].filter(Boolean).join(" · ")) : pill("r", "g", "Todo a tiempo"); }
    else { const names = n.it.map((x) => CORTO[x.a.r.id] || x.a.r.t); L = pill("l", "f", total + " tarea" + (total > 1 ? "s" : "")); R = pill("r", "f", esc(names.slice(0, 2).join(" · ")) + (names.length > 2 ? " +" + (names.length - 2) : "")); }
    const det = open ? `<div class="tl-det${st.accJust === "h" + n.H ? " pop" : ""}" style="--x:50%">${n.it.map((x) => `<span class="tchip ${x.k}"><i></i>${esc(x.a.r.t)}<em>${KLBL[x.k]}${x.a.filled[x.i] ? " · " + esc(x.a.docs[x.a.filled[x.i].ix].nombre) : ""}</em></span>`).join("")}</div>` : "";
    return `<div class="tl-row ${color}${open ? " open" : ""}"><button class="tl-hit" data-tlh="${n.H}" aria-expanded="${open}" aria-label="Hora ${S.fmtMin(n.H)}: ${total} tareas">${L}<span class="tl-node">${S.fmtMin(n.H).replace(/ (a|p)\.m\./, "")}<small>${n.H < 720 ? "a.m." : "p.m."}</small></span>${R}</button>${det}</div>${isCur ? ahora : ""}`;
  };
  let h = "";
  if (fin) h += `<div class="banner off">${I.check}<span>Fuera de horario de rutina. Todo en orden hasta mañana.</span></div>`;
  if (ini == null && !fin) { if (urgent.length) h += ahora; }
  else if (!list.length && !fin) h += ahora;
  else {
    const showPast = st.tlOpen.has("past"), showAll = st.tlOpen.has("all");
    const pastIdx = list.map((_, i) => i).filter((i) => i < cur || fin), hidePast = !fin && !showPast ? pastIdx.slice(0, Math.max(0, pastIdx.length - 2)) : [];
    const futIdx = list.map((_, i) => i).filter((i) => i > cur && !fin), hideFut = !showAll ? futIdx.slice(3) : [];
    h += `<div class="tln">`;
    if (hidePast.length) h += `<button class="tl-more" data-tlh="past">${I.chev} Ver ${hidePast.length} hora${hidePast.length > 1 ? "s" : ""} anterior${hidePast.length > 1 ? "es" : ""}</button>`;
    if (cur < 0 && !fin) h += ahora;
    list.forEach((n, ix) => { if (hidePast.includes(ix) || hideFut.includes(ix)) return; h += nodeHtml(n, ix); });
    if (hideFut.length) h += `<button class="tl-more" data-tlh="all">${I.chev} Ver el resto del día (${hideFut.length} hora${hideFut.length > 1 ? "s" : ""})</button>`;
    h += `<div class="tl-end">${S.fmtMin(S.CUT_MIN)} · fin de rutina</div></div>`;
  }
  const ext = S.ZONAS.find((z) => z.id === "exterior");
  h += zonaHtml(ext, all);
  return h;
}
function zonaHtml(z, all) {
  const zs = all.filter((a) => a.r.z === z.id).sort((a, b) => a.rank - b.rank || a.left - b.left || a.idx - b.idx);
  const red = zs.filter((a) => a.state === "red").length, yel = zs.filter((a) => a.state === "yellow").length;
  const open = st.zoneOpen[z.id] ?? (red + yel > 0);
  const pill = red ? `<span class="pill bad">${red} atrasada${red > 1 ? "s" : ""}</span>` : yel ? `<span class="pill run">${yel} ya toca</span>` : `<span class="pill ok">Al día</span>`;
  return `<section class="zone ${open ? "" : "closed"}"><button class="zh" data-zone="${z.id}" aria-expanded="${open}"><span class="zi">${I[z.id]}</span><b>${z.n}</b>${pill}<span class="chev">${I.chev}</span></button>
    <div class="rows">${zs.map((a) => { const last = a.docs[a.docs.length - 1];
      return `<button class="row ${a.state}${a.state === "red" || a.state === "yellow" ? " pulse" : ""}" data-rut="${a.idx}"><span class="fill" style="width:${Math.round(a.fill * 100)}%"></span>
        <span class="tx"><b>${esc(a.r.t)}</b><span><span class="st">${esc(a.text)}</span>${a.rep ? " · " + esc(repInfo(a)) : last ? " · " + esc(last.nombre) + " " + S.horaIso(last.at) : ""}</span></span>
        <span class="cb" aria-label="${haceTareas() ? "Tomar foto" : "Ver y calificar"}">${!haceTareas() ? I.eye : a.state === "green" || a.state === "off" ? I.check : I.cam}</span></button>`; }).join("")}</div></section>`;
}

/* ---------- Ver y calificar (quien no toma fotos) ---------- */
function verCalificar(a) {
  const docs = (a.docs || []).filter((d) => !d.anulado || a.docs.length === 1);
  const d = docs[docs.length - 1];
  if (!d) return toast("Aún no hay registros de " + a.r.t + " hoy.");
  verRegistro(d);
}
function verRegistro(d) {
  const t = S.RUTINA.find((x) => x.id === d.task_id), D = fuentes().find((x) => x.urls && x.urls[d.foto]), url = D?.urls[d.foto];
  const puedeRep = d.fecha === today() && !d.anulado && !d.rep_de;
  sheet(`<h2>${esc(t?.t || "Registro")}</h2><span class="mu sm">${esc(d.nombre)} · ${S.horaIso(d.at)}${d.cal_por ? " · calificó " + esc(d.cal_por) : ""}</span>
    ${url ? `<img class="view" alt="" src="${esc(url)}">` : `<div class="empty">Foto no disponible</div>`}
    ${d.anulado ? `<div class="repbox"><b>🔁 Repetir pedido por ${esc(d.rep_por)}</b><span class="sm">${esc(d.rep_txt)}</span></div>` : ""}
    <div data-vr>${rateBtns(d.nota, "vn")}</div>
    <textarea id="vc" maxlength="300" placeholder="Comentario (opcional)">${esc(d.coment || "")}</textarea>
    <div style="display:flex;gap:8px"><button class="btn lt" style="flex:1" data-a="vc">Guardar comentario</button>${puedeRep ? `<button class="btn danger" data-a="vrep">🔁 Repetir</button>` : ""}${st.me.admin ? `<button class="btn danger" data-a="vdel" aria-label="Borrar registro">${I.trash}</button>` : ""}</div>
    <button class="btn lt block" data-a="no">Cerrar</button>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    $$("[data-vn]", s).forEach((b) => (b.onclick = async () => { const r = await rateRutina(d.id, +b.dataset.vn, $("#vc", s).value || undefined); if (r) { vibrate(20); close(); } }));
    $("[data-a=vc]", s).onclick = async () => { const r = await rateRutina(d.id, undefined, $("#vc", s).value); if (r) close(); };
    $("[data-a=vrep]", s) && ($("[data-a=vrep]", s).onclick = () => { close(); repetirRutinaSheet(d); });
    $("[data-a=vdel]", s) && ($("[data-a=vdel]", s).onclick = async () => { close(); if (!(await confirmSheet("¿Borrar este registro?", "La foto se borrará para siempre.", "Borrar", true))) return; try { await api("rutina_borrar", { id: d.id }); toast("Registro borrado."); fuentes().forEach((D) => { if (D.rutina) D.rutina = D.rutina.filter((x) => x.id !== d.id); }); renderMain(); } catch (er) { toast(er.message); } });
  });
}

/* ---------- Ramificación (línea central con ramas a los lados) ---------- */
const rnode = (t, sub, cls, big) => `<span class="rnd ${cls || ""}${big ? " big" : ""}">${t}${sub ? `<small>${sub}</small>` : ""}</span>`;
const hm = (m) => { const t = S.fmtMin(m); return [t.replace(/ (a|p)\.m\./, ""), t.slice(-4)]; };
function rama(rows, heads) {
  return `${heads ? `<div class="rhead"><span>${heads[0]}</span><span></span><span>${heads[1]}</span></div>` : ""}<div class="rama"><span class="rsp"></span>${rows.map((r) => `<div class="rrow"><div class="rl">${(r.L || []).join("")}</div>${r.node}<div class="rr">${(r.R || []).join("")}</div></div>`).join("")}</div>`;
}
const rcard = (c, title, sub, extra, attrs) => `<button class="rc it" style="--c:${c}" ${attrs || ""}><span class="st"></span><b>${title}</b>${sub ? `<span class="sm">${sub}</span>` : ""}${extra || ""}</button>`;
const COLS = { r: "var(--red)", y: "var(--honey)", g: "var(--ok)", n: "var(--line)" };

/* ---------- Panel de supervisor y administrador ---------- */
function acc(id, icon, tone, title, sub, count, body) {
  const open = st.acc.has(id), pop = st.accJust === id;
  return `<section class="acc gl ${open ? "open" : ""}"><button class="acc-h" data-acc="${id}" aria-expanded="${open}"><span class="aic ${tone}">${icon}</span><span class="att"><b>${title}</b><span class="sm">${sub}</span></span>${count != null ? `<span class="acnt ${tone}">${count}</span>` : ""}<span class="chev">${I.right}</span></button>${open ? `<div class="acc-b${pop ? " pop" : ""}" style="--x:${st.accX}px">${body()}</div>` : ""}</section>`;
}
function porCalificar(T) {
  const out = [];
  T.rutina.forEach((d) => { if (!d.nota && !d.anulado && T.urls[d.foto]) out.push({ k: "r", m: S.minOf(d.at, T.fecha), d }); });
  T.entregas.forEach((e) => { if (e.estado !== "entregado") return; S.slots(e.area, e.turno).forEach((sl) => { const p = e.fotos?.[sl.key]; if (p && T.urls[p] && !(e.calif?.[sl.key]?.n)) out.push({ k: "e", m: S.minOf(e.fin || e.inicio, T.fecha), e, sl }); }); });
  return out.sort((a, b) => a.m - b.m);
}
function viewPanel() {
  const T = st.tablero;
  if (!T || !st.hoy) return `<div class="empty"><div class="spin" style="margin:30px auto"></div>Armando tu panel…</div>`;
  const j = T.hoy, now = S.nowMinFor(j, nowMs()), ini = T.inicio?.m ?? null, fin = now >= S.CUT_MIN;
  const all = S.rutAll(T.rutina, j, now, ini), stt = S.dayStats(all);
  const urgent = all.filter((a) => a.state === "red" || a.state === "yellow").sort((a, b) => (a.next?.H ?? 0) - (b.next?.H ?? 0));
  const reps = all.filter((a) => a.rep && !a.rep.vencido);
  let h = heroHtml();
  if (ini == null && !fin) h += inicioCard(T.inicio);
  else h += `<section class="estado gl it"><div class="ring big" style="--p:${stt.pct ?? 0}"><span>${stt.pct == null ? "—" : stt.pct + "%"}</span></div><div style="flex:1;min-width:0"><b>${fin ? "Rutina terminada" : "Rutina en marcha"}</b><span class="sm">${ini != null ? "Inició " + S.fmtMin(ini) + (T.inicio?.por ? " · " + esc(T.inicio.por === "Programada" ? "programada" : T.inicio.por) : "") : ""}</span>
    <div class="pills">${stt.red ? `<span class="pill bad">${stt.red} atrasada${stt.red > 1 ? "s" : ""}</span>` : ""}${stt.yellow ? `<span class="pill run">${stt.yellow} toca${stt.yellow > 1 ? "n" : ""} ya</span>` : ""}${reps.length ? `<span class="pill bad">🔁 ${reps.length} por repetir · ${Math.max(0, Math.round(reps[0].rep.until - now))} min</span>` : ""}${!stt.red && !stt.yellow && !reps.length ? `<span class="pill ok">Todo al día</span>` : ""}</div></div></section>`;

  // Atrasadas
  h += acc("atr", I.alarm, urgent.length ? "r" : "g", "Atrasadas ahora", urgent.length ? urgent.filter((a) => a.state === "red").length + " en rojo" + (reps.length ? " · " + reps.length + " por repetir" : "") : "Nada atrasado", urgent.length, () => {
    if (!urgent.length) return `<div class="allgood it">${I.check}<span>Todo al día. Buen trabajo del equipo.</span></div>`;
    const grupos = {};
    urgent.forEach((a) => { const m = a.rep ? Math.round(a.rep.until - S.REP_MIN) : a.next?.H ?? now; (grupos[m] = grupos[m] || []).push(a); });
    const ms = Object.keys(grupos).map(Number).sort((x, y) => x - y);
    return rama(ms.map((m, ix) => {
      const cards = grupos[m].map((a) => { const last = a.docs.filter((d) => !d.anulado).pop(); return rcard(a.state === "red" ? COLS.r : COLS.y, esc(a.r.t), esc(a.rep ? "Repetir · " + (T.equipo?.[a.docs[a.rep.ix].rep_para] || "en turno") + " · " + Math.max(0, Math.round(a.rep.until - now)) + " min" : (a.state === "red" ? "Hace " + S.durTxt(now - (a.r.win ? a.next.end : a.next.H)) : "Toca ya") + " · " + (last ? esc(last.nombre) : "nadie")), "", `data-pver="${a.idx}"`); });
      const red = grupos[m].some((a) => a.state === "red"), [t, sb] = hm(m);
      return { node: rnode(t, sb, "it " + (red ? "r" : "y"), ix === ms.length - 1), L: ix % 2 ? [] : cards, R: ix % 2 ? cards : [] };
    }));
  });

  // Entregas de hoy
  const nEnt = T.entregas.filter((e) => e.estado === "entregado").length, sinCal = T.entregas.filter((e) => e.estado === "entregado" && S.califEntrega(e).rated < S.califEntrega(e).total).length;
  h += acc("ent", I.box, sinCal ? "y" : "g", "Entregas de hoy", nEnt ? nEnt + " entregada" + (nEnt > 1 ? "s" : "") + (sinCal ? " · " + sinCal + " por calificar" : "") : "Aún no hay entregas", null, () => {
    return ramaEntregas(T, j);
  });

  // Fotos por calificar
  const pc = porCalificar(T), pr = pc.filter((x) => x.k === "r").length;
  h += acc("cal", I.star, pc.length ? "y" : "g", "Fotos por calificar", pc.length ? pr + " de rutina · " + (pc.length - pr) + " de entregas" : "Todo calificado", pc.length, () => {
    if (!pc.length) return `<div class="allgood it">${I.check}<span>Todo calificado. Buen trabajo.</span></div>`;
    const MAX = 20, rut = pc.filter((x) => x.k === "r"), lista = rut.slice(-MAX), grupos = {};
    lista.forEach((x) => { const hh = Math.floor(x.m / 60) * 60; (grupos[hh] = grupos[hh] || { L: [], R: [] }).L.push(x); });
    const porEnt = {}; pc.filter((x) => x.k === "e").forEach((x) => (porEnt[x.e.id] = porEnt[x.e.id] || []).push(x));
    Object.values(porEnt).forEach((xs) => { const hh = Math.floor(xs[0].m / 60) * 60; (grupos[hh] = grupos[hh] || { L: [], R: [] }).R.push({ k: "E", xs }); });
    const foto = (x) => {
      if (x.k === "E") { const e = x.xs[0].e; return `<button class="rc qc qe it" style="--c:var(--honey)" data-pgal="${e.id}" data-pkey="${x.xs[0].sl.key}"><span class="st"></span><span class="qth">${x.xs.slice(0, 3).map((y) => `<img alt="" loading="lazy" src="${esc(T.urls[e.fotos[y.sl.key]])}">`).join("")}</span><b>${S.TURNO_NAME[e.turno]} · ${S.AREA_NAME[e.area]}</b><span class="sm">${esc(e.nombre)} · ${x.xs.length} foto${x.xs.length > 1 ? "s" : ""} sin calificar</span><span class="pill run">${I.star} Calificar</span></button>`; }
      const url = x.k === "r" ? T.urls[x.d.foto] : T.urls[x.e.fotos[x.sl.key]];
      const tt = x.k === "r" ? (S.RUTINA.find((r) => r.id === x.d.task_id)?.t || "") : (x.sl.multi ? x.sl.label : x.sl.task.t);
      const who = x.k === "r" ? x.d.nombre + " · " + S.horaIso(x.d.at) : S.TURNO_NAME[x.e.turno] + " " + S.AREA_NAME[x.e.area] + " · " + x.e.nombre;
      const id = x.k === "r" ? "r:" + x.d.id : "e:" + x.e.id + ":" + x.sl.key;
      return `<div class="rc qc it" data-q="${esc(id)}"><span class="flash"></span><img alt="" loading="lazy" src="${esc(url)}" data-qlb="${esc(url)}"><b>${esc(tt)}</b><span class="sm">${esc(who)}</span><span class="qr">${[4, 3, 2, 1].map((n) => `<button class="qd n${n}" data-qn="${n}" aria-label="${S.NOTAS[n][1]}"></button>`).join("")}</span></div>`;
    };
    const hs = Object.keys(grupos).map(Number).sort((a, b) => a - b);
    return (rut.length > MAX ? `<p class="mu xs it" style="text-align:center;margin:0 0 8px">Rutina: mostrando las ${MAX} más recientes de ${rut.length}.</p>` : "") +
      rama(hs.map((hh) => { const [t, sb] = hm(hh); return { node: rnode(t, sb, "it y"), L: grupos[hh].L.map(foto), R: grupos[hh].R.map(foto) }; }), ["Rutina", "Entregas"]) +
      `<button class="btn block it serie" data-a="serie">${I.play} Calificar en serie</button>`;
  });

  // Equipo hoy
  const gente = {};
  T.rutina.forEach((d) => { if (!d.emp_id) return; const g = (gente[d.emp_id] = gente[d.emp_id] || { nombre: d.nombre, n: 0, last: null }); g.n++; if (!g.last || d.at > g.last) g.last = d.at; });
  const gl = Object.values(gente).sort((a, b) => (a.last < b.last ? 1 : -1));
  const pts = Object.fromEntries((st.animo?.tabla || []).map((p) => [p.nombre, p.pts]));
  const quietos = gl.filter((g) => ini != null && !fin && now - S.minOf(g.last, j) > 60).length;
  h += acc("eq", I.users, quietos ? "r" : "g", "Equipo hoy", gl.length ? gl.length + " registrando" + (quietos ? " · " + quietos + " sin registrar hace rato" : "") : "Nadie ha registrado", null, () => gl.length ? `<div class="eqs">${gl.map((g) => { const sin = now - S.minOf(g.last, j), q = ini != null && !fin && sin > 60;
    return `<div class="eqr it ${q ? "q" : ""}"><span class="dot"></span><b>${esc(g.nombre)}</b><span class="sm">${q ? "Sin registrar hace " + S.durTxt(sin) : g.n + " registro" + (g.n > 1 ? "s" : "") + " · " + S.horaIso(g.last)}</span>${pts[g.nombre] != null ? `<span class="pill gr">${pts[g.nombre]} pts</span>` : ""}</div>`; }).join("")}</div>` : `<div class="empty it">Aún nadie registra rutina hoy.</div>`);

  // La semana
  h += acc("sem", I.chart, "y", "La semana", "% a tiempo y podio", null, () => {
    const dias = [];
    for (let k = 6; k >= 0; k--) { const dj = S.addDays(j, -k), docs = (T.rango || []).filter((x) => x.fecha === dj); const sx = S.dayStats(S.rutAll(docs, dj, k === 0 ? now : null, T.inicios?.[dj] ?? null)); dias.push({ dj, pct: docs.length ? sx.pct : null, k }); }
    const P = st.animo?.podio || [];
    return `<div class="bars it">${dias.map((d) => `<div class="bar1"><i class="${d.pct == null ? "n" : d.pct >= 90 ? "g" : d.pct >= 60 ? "y" : "r"}" style="height:${d.pct == null ? 6 : Math.max(8, d.pct)}%"></i><span>${d.k === 0 ? "Hoy" : S.diaCorto(d.dj).slice(0, 2)}</span><em>${d.pct == null ? "—" : d.pct + "%"}</em></div>`).join("")}</div>
      ${P.length ? `<div class="mini-podio it">${P.map((p, i) => `<span class="${i === 0 ? "oro" : ""}">${["🥇", "🥈", "🥉"][i]} ${esc(p.nombre)} <b>${p.pts}</b></span>`).join("")}</div>` : ""}`;
  });
  return h;
}
function ramaEntregas(T, j) {
  const now = S.nowMinFor(j, nowMs()), esHoy = j === today();
  const ents = (turno, area) => T.entregas.filter((e) => e.turno === turno && e.area === area).sort((a, b) => (a.inicio < b.inicio ? 1 : -1))[0];
  const entCard = (turno, area) => {
    const e = ents(turno, area);
    if (!S.tasksOf(turno, area).length) return rcard(COLS.n, S.TURNO_NAME[turno], "Lista por definir");
    if (!e) return rcard(COLS.n, S.TURNO_NAME[turno], "Sin iniciar");
    const c = S.califEntrega(e), n = S.countDone(e), tot = S.slots(area, turno).length, rp = S.pendRepetir(e);
    if (e.estado !== "entregado") return rcard(rp ? COLS.r : COLS.y, S.TURNO_NAME[turno], esc(e.nombre) + " · " + (rp ? "repitiendo " + rp : "en curso " + n + "/" + tot), "", `data-pgal="${e.id}"`);
    const full = c.rated === c.total;
    return rcard(full ? COLS.g : COLS.y, S.TURNO_NAME[turno], esc(e.nombre) + " · " + S.horaIso(e.fin), `<span class="pill ${full ? "ok" : "run"}">${full ? S.notaTxt(c.nota) : c.rated + "/" + c.total + " calificadas"}</span>`, `data-pgal="${e.id}"`);
  };
    const ap = T.entregas.filter((e) => e.turno === "apertura").map((e) => S.minOf(e.inicio, j)).sort((a, b) => a - b)[0];
    const ci = T.entregas.filter((e) => e.turno === "cierre").map((e) => S.minOf(e.inicio, j)).sort((a, b) => a - b)[0];
    const [at, as] = ap != null ? hm(ap) : ["Apert.", ""], [ct, cs] = ci != null ? hm(ci) : hm(S.CUT_MIN);
    const tone = (t) => { const es = S.AREAS.map((a) => ents(t, a)).filter(Boolean); return !es.length ? "n" : es.every((e) => e.estado === "entregado" && S.califEntrega(e).rated === S.califEntrega(e).total) ? "g" : "y"; };
    return rama([
      { node: rnode(at, as, "it " + tone("apertura")), L: [entCard("apertura", "cocina")], R: [entCard("apertura", "salon")] },
      ...(esHoy ? [{ node: rnode("Ahora", "", "it y", true), L: [], R: [] }] : []),
      { node: rnode(ct, cs, "it " + tone("cierre")), L: [entCard("cierre", "cocina")], R: [entCard("cierre", "salon")] },
    ], ["Cocina", "Salón"]);
}
function wirePanel(main) {
  $$("[data-acc]", main).forEach((b) => (b.onclick = (ev) => {
    const id = b.dataset.acc, r = b.getBoundingClientRect();
    st.accX = Math.round((ev.clientX || r.left + r.width / 2) - r.left);
    if (st.acc.has(id)) st.acc.delete(id); else { st.acc.add(id); st.accJust = id; }
    renderMain();
  }));
  const T = st.tablero || { rutina: [], entregas: [], hoy: today(), urls: {} };
  const allT = () => S.rutAll(T.rutina, T.hoy, S.nowMinFor(T.hoy, nowMs()), T.inicio?.m ?? null);
  $$("[data-pver]", main).forEach((b) => (b.onclick = () => verCalificar(allT()[+b.dataset.pver])));
  $$("[data-pgal]", main).forEach((b) => (b.onclick = () => { const e = fuentes().flatMap((D) => D.entregas || []).find((x) => x.id === b.dataset.pgal); if (b.dataset.pkey) return galeriaEntrega(e.id, b.dataset.pkey); const f = S.slots(e.area, e.turno).find((sl) => e.fotos?.[sl.key] && !e.calif?.[sl.key]?.n) || S.slots(e.area, e.turno).find((sl) => e.fotos?.[sl.key]); if (f) galeriaEntrega(e.id, f.key); else toast("Aún no tiene fotos."); }));
  $$("[data-qlb]", main).forEach((im) => (im.onclick = () => lightbox(im.dataset.qlb, "")));
  $$("[data-qn]", main).forEach((b) => (b.onclick = () => calRapida(b.closest("[data-q]"), +b.dataset.qn)));
  $("[data-a=serie]", main) && ($("[data-a=serie]", main).onclick = () => serieSheet(porCalificar(T)));
}
async function calRapida(card, n) {
  if (!card || card.classList.contains("gone")) return;
  const [k, id, key] = card.dataset.q.split(":");
  card.style.setProperty("--fc", ["", "var(--red)", "#F97316", "var(--honey)", "var(--ok)"][n]); card.classList.add("ok"); vibrate(15);
  try {
    if (k === "r") { const r = await api("rutina_calificar", { id, nota: n }); ponRegistro(r.registro); }
    else { const r = await api("entrega_calificar", { id, key, nota: n }); ponEntrega(r.entrega); }
    card.classList.add("gone"); setTimeout(renderMain, 320);
  } catch (e) { card.classList.remove("ok"); toast(e.message); }
}
function serieSheet(lista) {
  if (!lista.length) return toast("No hay fotos por calificar.");
  const T = st.tablero; let i = 0, hechas = 0;
  sheet(`<div id="sr"></div>`, (s, close) => {
    const box = $("#sr", s);
    const draw = () => {
      if (i >= lista.length) { box.innerHTML = `<div style="display:grid;justify-items:center;gap:8px;text-align:center;padding:10px 0"><div class="ckc" style="width:64px;height:64px;border-radius:50%;background:var(--ok);display:grid;place-items:center;color:var(--onc)">${I.check}</div><h2>¡Listo!</h2><span class="mu">Calificaste ${hechas} foto${hechas === 1 ? "" : "s"}.</span><button class="btn honey block" data-a="fin">Cerrar</button></div>`; $("[data-a=fin]", box).onclick = () => { close(); renderMain(); }; if (hechas) confetti(50); return; }
      const x = lista[i], url = x.k === "r" ? T.urls[x.d.foto] : T.urls[x.e.fotos[x.sl.key]];
      const tt = x.k === "r" ? (S.RUTINA.find((r) => r.id === x.d.task_id)?.t || "") : S.TURNO_NAME[x.e.turno] + " " + S.AREA_NAME[x.e.area] + " · " + (x.sl.multi ? x.sl.label : x.sl.task.t);
      const who = x.k === "r" ? x.d.nombre + " · " + S.horaIso(x.d.at) : x.e.nombre;
      box.innerHTML = `<div style="display:grid;gap:10px"><div style="display:flex;justify-content:space-between;align-items:center"><b>${esc(tt)}</b><span class="mu xs">${i + 1} / ${lista.length}</span></div><span class="mu sm" style="margin-top:-6px">${esc(who)}</span>
        <img class="view" alt="" src="${esc(url)}">${rateBtns(null, "sn")}<textarea id="sc2" maxlength="300" placeholder="Comentario (opcional)"></textarea>
        <div style="display:flex;gap:8px"><button class="btn lt" style="flex:1" data-a="skip">Saltar</button><button class="btn lt" style="flex:1" data-a="fin">Terminar</button></div></div>`;
      $$("[data-sn]", box).forEach((b) => (b.onclick = async () => {
        const n = +b.dataset.sn, c = $("#sc2", box).value.trim() || undefined; b.disabled = true;
        try {
          if (x.k === "r") { const r = await api("rutina_calificar", { id: x.d.id, nota: n, coment: c }); ponRegistro(r.registro); }
          else { const r = await api("entrega_calificar", { id: x.e.id, key: x.sl.key, nota: n, coment: c }); ponEntrega(r.entrega); }
          hechas++; vibrate(15); i++; draw();
        } catch (e) { toast(e.message); b.disabled = false; }
      }));
      $("[data-a=skip]", box).onclick = () => { i++; draw(); };
      $("[data-a=fin]", box).onclick = () => { close(); renderMain(); };
    };
    draw();
  });
}

/* ---------- Ventana de salida: resumen del turno y pendientes ---------- */
function salirSheet() {
  const hr = S.mxDate(nowMs()).getUTCHours(), noche = hr >= 19 || hr < 6, nombre = (st.me.nombre || st.me.emp?.nombre || "").split(" ")[0];
  const now = nowMin(), pend = [], stats = [];
  const P = (tone, ic, t, sub) => pend.push(`<div class="spend it" style="--c:${COLS[tone]}"><span class="si">${ic}</span><div><b>${esc(t)}</b><span class="sm">${esc(sub)}</span></div></div>`);
  if (st.me.jefe) {
    const T = st.tablero || st.hoy;
    if (T) {
      const j = T.hoy || T.fecha, ini = T.inicio?.m ?? null, all = S.rutAll(T.rutina, j, S.nowMinFor(j, nowMs()), ini), sx = S.dayStats(all);
      const pc = st.tablero ? porCalificar(st.tablero).length : T.rutina.filter((d) => !d.nota && !d.anulado).length;
      stats.push([sx.pct == null ? "—" : sx.pct + "%", "a tiempo", "g"], [sx.red, "atrasada" + (sx.red === 1 ? "" : "s"), sx.red ? "r" : "g"], [pc, "por calificar", pc ? "y" : "g"]);
      if (ini == null && now < S.CUT_MIN) P("y", I.play, "La rutina no se ha iniciado", T.inicio?.prog != null ? "Se inicia sola a las " + S.fmtMin(T.inicio.prog) : "Hoy no tiene hora programada");
      (T.entregas || []).filter((e) => e.estado === "entregado" && S.califEntrega(e).rated < S.califEntrega(e).total).forEach((e) => P("y", I.box, S.TURNO_NAME[e.turno] + " de " + S.AREA_NAME[e.area].toLowerCase() + " sin calificar", e.nombre + " · entregó " + S.horaIso(e.fin)));
      all.filter((a) => a.rep && !a.rep.vencido).forEach((a) => P("r", "🔁", "Repetir: " + a.r.t, "Vence " + S.fmtMin(a.rep.until)));
    }
  } else if (st.hoy) {
    const me = st.me.emp, all = S.rutAll(st.hoy.rutina, st.hoy.fecha, now, iniHoy());
    let ok = 0, late = 0; all.forEach((a) => a.filled.forEach((f) => { if (f && a.docs[f.ix]?.emp_id === me.id) (f.late || f.rep ? late++ : ok++); }));
    const mios = st.hoy.rutina.filter((d) => d.emp_id === me.id).length, racha = st.animo?.racha || 0;
    stats.push([mios, "registro" + (mios === 1 ? "" : "s"), "y"], [ok + late ? Math.round((ok / (ok + late)) * 100) + "%" : "—", "a tiempo", late ? "y" : "g"], [racha ? "🔥 " + racha : "—", "día" + (racha === 1 ? "" : "s") + " de racha", "y"]);
    all.filter((a) => a.rep && !a.rep.vencido).forEach((a) => { const d = a.docs[a.rep.ix]; if (!d.rep_para || d.rep_para === me.id) P("r", "🔁", "Repetir: " + a.r.t, (d.rep_por ? "Te lo pidió " + d.rep_por + " · " : "") + "vence " + S.fmtMin(a.rep.until)); });
    st.hoy.entregas.filter((e) => e.emp_id === me.id && e.estado !== "entregado").forEach((e) => { const n = S.countDone(e), tot = S.slots(e.area, e.turno).length, rp = S.pendRepetir(e); P(rp ? "r" : "y", I.box, S.TURNO_NAME[e.turno] + " de " + S.AREA_NAME[e.area].toLowerCase() + (rp ? ": repetir " + rp + " foto" + (rp > 1 ? "s" : "") : " en " + n + "/" + tot), rp ? "Tu supervisor pidió repetir" : "Faltan " + (tot - n) + " foto" + (tot - n === 1 ? "" : "s") + " por tomar"); });
    const atr = all.filter((a) => a.state === "red" && !a.rep).length;
    if (atr) P("r", I.alarm, atr + " tarea" + (atr > 1 ? "s" : "") + " atrasada" + (atr > 1 ? "s" : ""), "Avísale a quien sigue en turno");
  }
  const titulo = st.me.jefe ? (noche ? "Hasta luego, " : "Nos vemos, ") + nombre : (noche ? "Descansa, " : "¡Buen trabajo, ") + nombre + (noche ? "" : "!");
  sheet(`<div class="salir"><div class="it" style="text-align:center"><span class="wave">${noche ? "🌙" : "👋"}</span><h2 style="margin-top:4px">${esc(titulo)}</h2><span class="mu sm">${st.me.jefe ? "Así dejas la jornada" : "Así cerraste tu turno de hoy"}</span></div>
    ${stats.length ? `<div class="sstats">${stats.map(([v, l, t]) => `<div class="sst it"><b class="${t}">${esc(String(v))}</b><span class="sm">${esc(l)}</span></div>`).join("")}</div>` : ""}
    ${pend.length ? `<span class="slbl it">Antes de irte</span>${pend.join("")}` : `<div class="sok it">${I.check}<span>Todo en orden ✨</span></div>`}
    <div class="sbtns it"><button class="btn lt" data-a="no">Me quedo</button><button class="btn" data-a="ok">Cerrar sesión</button></div></div>`, (s, close) => {
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = () => { close(); logout(); };
    $$(".it", s).forEach((el, i) => (el.style.animationDelay = 110 + i * 45 + "ms"));
    if (!pend.length) setTimeout(() => confetti(40), 260);
  }, true);
}

/* ---------- Podio y colaborador de la semana ---------- */
function podioHtml() {
  const A = st.animo; if (!A) return "";
  let h = "";
  if (A.ganador) {
    const v = store.get(), fresh = v.ganadorVisto !== A.semana_desde;
    if (fresh) { v.ganadorVisto = A.semana_desde; store.set(v); setTimeout(() => confetti(60), 300); }
    h += `<section class="ganador ${fresh ? "fresh" : ""}"><span class="gs">${I.trophy}</span><div><span class="mu xs">Colaborador de la semana pasada</span><b>${esc(A.ganador.nombre)}</b><span class="xs">${A.ganador.pts} puntos${A.ganador.nota ? " · " + S.notaTxt(A.ganador.nota) : ""}</span></div></section>`;
  }
  const P = A.podio || [];
  h += `<div class="sect"><h2>Podio de la semana</h2><button class="link" data-a="pts" style="font-size:12px">¿Cómo se gana?</button></div>`;
  h += P.length ? `<div class="podio">${[1, 0, 2].filter((i) => P[i]).map((i) => `<div class="pd p${i + 1}"><span class="pn">${esc(P[i].nombre)}</span><span class="pp">${P[i].pts} pts</span><div class="pb"><b>${i + 1}</b></div></div>`).join("")}</div>`
    : `<div class="empty" style="padding:14px">Aún no hay puntos esta semana. ¡El primero en registrar arranca el podio!</div>`;
  return h;
}
function puntosSheet() { sheet(`<h2>${I.trophy} Cómo se ganan puntos</h2><div class="mu sm" style="display:grid;gap:6px"><span>✅ Tarea de rutina a tiempo: <b>+3</b></span><span>⚠️ Tarea tarde: <b>+1</b></span><span>🔁 Te piden repetir: <b>−2</b></span><span>Calificación de cada foto: 🟢 <b>+2</b> · 🟡 <b>+1</b> · 🟠 <b>0</b> · 🔴 <b>−1</b></span><span>📦 Entrega completa: <b>+5</b>, más su calificación general (🟢 +4 · 🟡 +2 · 🔴 −2)</span><span>La semana va de lunes a domingo. El lunes se anuncia al colaborador de la semana.</span></div><button class="btn honey block" data-a="ok">Entendido</button>`, (s, c) => ($("[data-a=ok]", s).onclick = c)); }
function semanaTabla() {
  const T = st.animo?.tabla;
  if (!T) return `<div class="empty"><div class="spin" style="margin:20px auto"></div></div>`;
  if (!T.length) return `<div class="empty">Aún no hay registros esta semana.</div>`;
  return `<div class="card" style="margin:0 14px"><div class="mu xs" style="margin-bottom:6px">Semana desde el ${esc(S.fechaLarga(st.animo.semana_desde))}. Solo tú y los supervisores ven la tabla completa; el equipo ve el podio.</div>${T.map((p, i) => `<div class="emp"><div style="display:flex;gap:10px;align-items:center"><b style="font:400 22px/1 var(--fd);width:26px">${i + 1}</b><div><b>${esc(p.nombre)}</b><div class="mu xs">✅ ${p.ok} · ⚠️ ${p.late} · 🔁 ${p.rep} · 📦 ${p.ent}${p.nota ? " · " + S.NOTAS[p.nota][0] : ""}</div></div></div><span class="pill ${i === 0 ? "ok" : "gr"}">${p.pts} pts</span></div>`).join("")}</div>`;
}

/* ---------- Tema ---------- */
function applyTheme() {
  const t = store.get().tema || "auto", el = document.documentElement;
  if (t === "auto") el.removeAttribute("data-theme"); else el.setAttribute("data-theme", t);
  const dark = t === "dark" || (t === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  $('meta[name="theme-color"]')?.setAttribute("content", dark ? "#14100A" : "#F5B324");
}
applyTheme();

/* ---------- Deslizar entre pantallas ---------- */
function wireSwipe(m) {
  let x0 = null, y0 = 0, t0 = 0, ok = false;
  m.addEventListener("touchstart", (e) => { const t = e.touches[0]; ok = e.touches.length === 1 && !e.target.closest(".strip,.thumbs,.chips,.now,input,textarea,select,.qpop,.gv"); x0 = t.clientX; y0 = t.clientY; t0 = Date.now(); }, { passive: true });
  m.addEventListener("touchend", (e) => {
    if (!ok || x0 == null) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null;
    if (Math.abs(dx) < 70 || Math.abs(dy) > Math.abs(dx) * 0.6 || Date.now() - t0 > 800 || (st.tab === "entregas" && st.ent)) return;
    const ids = tabsFor().map((x) => x[0]), i = ids.indexOf(st.tab); if (i < 0) return;
    const ni = i + (dx < 0 ? 1 : -1); if (ni < 0 || ni >= ids.length) return;
    goTab(ids[ni], dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ---------- Entregas ---------- */
function viewEntregas() {
  const emp = st.me.emp, list = st.hoy?.entregas || [];
  const puede = (t, a) => emp.ver || (emp.turnos.includes(t) && emp.areas.includes(a));
  const areas = S.AREAS.filter((a) => S.TURNOS.some((t) => puede(t, a)));
  if (!areas.length) return `<div class="empty">No tienes entregas habilitadas. Avísale al encargado.</div>`;
  const hr = S.mxDate(nowMs()).getUTCHours(), toca = hr >= 20 || hr < 6 ? "cierre" : hr < 13 ? "apertura" : null;
  const turnoBtn = (t, a) => {
    if (!puede(t, a)) return "";
    const has = S.tasksOf(t, a).length > 0, tot = S.slots(a, t).length;
    const mine = list.filter((e) => e.area === a && e.turno === t && e.emp_id === emp.id).sort((x, y) => (x.inicio < y.inicio ? 1 : -1))[0];
    const otro = list.filter((e) => e.area === a && e.turno === t && e.estado === "entregado" && e.emp_id !== emp.id)[0];
    const n = mine ? S.countDone(mine) : 0, pct = tot ? Math.round((n / tot) * 100) : 0, c = mine ? S.califEntrega(mine) : null, rp = mine ? S.pendRepetir(mine) : 0;
    let est, cls, cta;
    if (!has) { est = "Lista por definir"; cls = "off"; cta = "Próximamente"; }
    else if (rp) { est = "🔁 Repetir " + rp + " foto" + (rp > 1 ? "s" : ""); cls = "rep"; cta = "Corregir"; }
    else if (mine?.estado === "entregado") { est = "Entregado " + S.horaIso(mine.fin) + (c.nota ? " · " + S.notaTxt(c.nota) : ""); cls = "done"; cta = "Ver"; }
    else if (mine) { est = n + " de " + tot + " fotos"; cls = "run"; cta = "Continuar"; }
    else { est = otro ? "Ya la entregó " + otro.nombre : tot + " fotos"; cls = "new"; cta = "Empezar"; }
    return `<button class="tbtn ${cls}${toca === t && cls !== "done" && cls !== "off" ? " toca" : ""}" data-t="${t}" data-a="${a}" ${has ? "" : "disabled"}>
      <span class="tri" style="--p:${cls === "done" ? 100 : pct}"><span>${cls === "done" ? I.check : t === "cierre" ? I.moon : I.sun}</span></span>
      <span class="ttx"><span class="tg">${S.TURNO_NAME[t]}</span><b>${esc(est)}</b>${cls === "run" ? `<span class="bar"><i style="width:${pct}%"></i></span>` : ""}</span>
      <span class="tcta">${cta}${has ? I.right : ""}</span></button>`;
  };
  return `<div class="sect"><h2>Entregas de hoy</h2>${toca ? `<span class="pill run">Toca ${S.TURNO_NAME[toca].toLowerCase()}</span>` : ""}</div>
    <div class="egrid">${areas.map((a, i) => `<section class="earea gl ${a}" style="animation-delay:${i * 90}ms"><span class="eorb" aria-hidden="true"></span>
      <div class="ehd"><span class="eic">${I[a]}</span><div><span class="tg">Área</span><b>${S.AREA_NAME[a]}</b></div></div>
      <div class="ebtns">${S.TURNOS.slice().reverse().map((t) => turnoBtn(t, a)).join("")}</div></section>`).join("")}</div>
    <section class="etips gl" style="animation-delay:${areas.length * 90 + 60}ms"><b>${I.star} Para una entrega 🟢 Excelente</b>
      <div class="tip"><span>💡</span><span><b>Con buena luz</b>Prende la luz del área antes de tomar la foto.</span></div>
      <div class="tip"><span>🖼️</span><span><b>Que se vea completo</b>Aléjate un paso: la foto debe mostrar toda el área, no solo una parte.</span></div>
      <div class="tip"><span>👀</span><span><b>Revisa antes de entregar</b>Toca cada foto para verla en grande; si salió borrosa, cámbiala.</span></div></section>`;
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
  try { const r = await api("entrega_entregar", { id: e.id }); st.ent = r.entrega; vibrate([40, 30, 120]); renderMain(); confetti(90); entregaDoneSheet(r.entrega, true); refreshHoy(true); }
  catch (er) { toast(er.message); }
}
function entregaDoneSheet(e, fresh) {
  const txt = S.resumenEntrega(e);
  let t = fresh ? setTimeout(() => { close(); logout(); }, 30000) : null, close;
  close = sheet(`${fresh ? `<div style="display:grid;justify-items:center;gap:6px;text-align:center"><div class="ckc" style="width:64px;height:64px;border-radius:50%;background:var(--ok);display:grid;place-items:center;color:var(--onc)">${I.check}</div><h2>Turno entregado</h2><span class="mu">Gracias, ${esc(e.nombre)}. Ya puedes irte a descansar.</span></div>` : `<h2>Resumen de la entrega</h2>`}
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
  return `${podioHtml()}${st.animo?.racha ? `<div class="banner info" style="margin-top:10px">${I.fire}<span>Llevas <b>${st.animo.racha} día${st.animo.racha > 1 ? "s" : ""}</b> seguidos con tu rutina a tiempo. ¡No la rompas!</span></div>` : ""}
    <div class="sect"><h2>Lo que hiciste hoy</h2><span class="pill ok">${mine.length} registro${mine.length === 1 ? "" : "s"}</span></div>
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
    const s = S.dayStats(S.rutAll(docs, dj, dj === hoyJ ? S.nowMinFor(dj, nowMs()) : null, D.inicios?.[dj] ?? null));
    const cls = docs.length ? (s.pct >= 90 ? "g" : s.pct >= 60 ? "y" : "r") : "";
    strip += `<button class="day" data-day="${dj}" aria-pressed="${dj === j}"><span class="dn">${k === 0 ? "Hoy" : k === 1 ? "Ayer" : S.diaCorto(dj)}</span><span class="dd">${+dj.slice(8)}</span><span class="dt ${cls}"></span></button>`;
  }
  const older = j < S.addDays(hoyJ, -13);
  strip += `<label class="day" aria-pressed="${older}"><span class="dn">Otra</span><span class="dd">${older ? +j.slice(8) : "…"}</span><span class="dt"></span><input type="date" id="pickDay" max="${hoyJ}" value="${j}" aria-label="Elegir otra fecha"></label></div>`;
  const ini = D.inicio?.m ?? null;
  let h = `${isToday ? inicioCard(D.inicio, true) : ini != null ? `<div class="inicio-ok">${I.play}<span>Rutina iniciada a las <b>${S.fmtMin(ini)}</b></span></div>` : ""}<div class="sect" style="margin-top:6px"><h2>Jornada · ${esc(S.fechaLarga(j))}</h2></div>${strip}
    <div class="seg" role="tablist"><button role="tab" data-sub="rutina" aria-selected="${P.sub === "rutina"}">Rutina</button><button role="tab" data-sub="entregas" aria-selected="${P.sub === "entregas"}">Entregas (${D.entregas.length})</button><button role="tab" data-sub="semana" aria-selected="${P.sub === "semana"}">Semana</button></div>`;
  if (P.sub === "rutina") {
    const all = S.rutAll(D.rutina, j, isToday ? S.nowMinFor(j, nowMs()) : null, ini), s = S.dayStats(all);
    h += `<div class="kpis"><div class="kpi"><b>${s.pct == null ? "—" : s.pct + "%"}</b><span>a tiempo</span></div><div class="kpi"><b style="color:var(--ok)">${s.ok}</b><span>bien</span></div><div class="kpi"><b style="color:var(--honey-d)">${s.late}</b><span>tarde</span></div><div class="kpi"><b style="color:var(--red)">${s.missed}</b><span>sin hacer</span></div></div>
      <div class="pad" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px"><a class="btn honey sm" href="${esc(waLink(S.resumenRutina(j, D.rutina, isToday, ini)))}" target="_blank" rel="noopener">${I.wa} WhatsApp</a><button class="btn lt sm" data-copy="panel">Copiar</button><button class="btn lt sm" data-a="ziprut" ${D.rutina.length ? "" : "disabled"}>${I.dl} Fotos (ZIP)</button></div>
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
    // Bitácora en ramificación: un nodo por hora, los registros cuelgan alternando de lado.
    const KC = { ok: COLS.g, late: COLS.y, rep: COLS.y, anul: COLS.r, anulc: COLS.n, miss: COLS.r, pend: COLS.n, extra: "var(--mu)" };
    const porHora = {};
    evts.forEach((e) => { const hr = Math.floor(e.m / 60) * 60; (porHora[hr] = porHora[hr] || []).push(e); });
    const horas = Object.keys(porHora).map(Number).sort((x, y) => x - y);
    const tonoHora = (es) => es.some((e) => e.k === "miss" || e.k === "anul") ? "r" : es.some((e) => e.k === "late" || e.k === "rep") ? "y" : es.every((e) => e.k === "pend") ? "n" : "g";
    const evCard = (e) => {
      let k = e.k;
      if (k === "anul" && e.d.rep_de == null && D.rutina.some((x) => x.rep_de === e.d.id)) k = "anulc";
      const lbl = k === "anulc" ? ["gr", "🔁 Repetido después"] : L[k];
      const pill = `<span class="pill ${lbl[0]}">${e.d && e.d.nota ? S.NOTAS[e.d.nota][0] + " " : ""}${lbl[1]}${e.late && k !== "rep" ? " " + S.durTxt(e.late) : ""}</span>`;
      const sub = e.s ? (e.a.r.win ? e.s.label : "horario " + S.fmtMin(e.s.H)) : "";
      if (!e.d) return `<div class="rc it nd" style="--c:${KC[k]}"><span class="st"></span><b>${esc(e.a.r.t)}</b><span class="sm">${esc(sub)}</span>${pill}</div>`;
      const d = e.d, url = D.urls[d.foto];
      return `<button class="rc it evr" style="--c:${KC[k]}" data-evr="${d.id}"><span class="st"></span>${url ? `<img alt="" loading="lazy" src="${esc(url)}">` : ""}<b>${S.horaIso(d.at)} · ${esc(e.a.r.t)}</b><span class="sm">${esc(d.nombre)}${sub ? " · " + esc(sub) : ""}</span>${pill}${d.coment ? `<span class="sm cm">💬 ${esc(d.coment)}</span>` : ""}</button>`;
    };
    h += evts.length ? `<div class="pop" style="--x:50%;margin:4px 14px 0">${rama(horas.map((hr, ix) => { const [t, sb] = hm(hr); const cards = porHora[hr].map(evCard); return { node: rnode(t, sb, "it " + tonoHora(porHora[hr]), isToday && hr === Math.floor(S.nowMinFor(j, nowMs()) / 60) * 60), L: ix % 2 ? [] : cards, R: ix % 2 ? cards : [] }; }))}</div>
      <p class="mu xs pad" style="text-align:center;margin-top:10px">Toca un registro para ver la foto, calificar o pedir repetir. Mantenlo presionado para calificar rápido.</p>` : `<div class="empty">Sin registros para esta jornada.</div>`;
  } else if (P.sub === "semana") {
    h += podioHtml() + `<div class="sect"><h2>Tabla completa</h2></div>` + semanaTabla();
  } else {
    if (D.entregas.length) h += `<div class="acc gl" style="padding:12px 10px"><div class="pop" style="--x:50%">${ramaEntregas(D, j)}</div></div>`;
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
  const v = store.get(), pushOn = v.push === true, tema = v.tema || "auto", dnd = v.dnd || { on: false, ini: "11:00", fin: "15:00" };
  const hor = st.tablero?.inicio?.horario || st.panel.data?.inicio?.horario || st.hoy?.inicio?.horario || null;
  const card = (inner) => `<div class="card" style="margin:0 14px 10px;display:grid;gap:10px">${inner}</div>`;
  let h = `<div class="sect"><h2>Ajustes</h2></div>`;
  if (st.me.admin) h += card(`<b>Mi nombre</b><span class="mu sm">Así te saluda la app y así aparece cuando calificas o pides repetir.</span><input type="text" id="myName" maxlength="30" value="${esc(st.me.nombre || "")}"><button class="btn lt" data-a="nombre">Guardar nombre</button>`);
  h += card(`<b>${I.key} Mi clave</b><span class="mu sm">Para cambiarla te pedimos tu clave actual y la nueva dos veces.</span><button class="btn lt" data-a="clave">Cambiar mi clave</button>`);
  h += card(`<b>${I.sun} Tema</b><div class="seg" style="margin:0" role="radiogroup">${[["light", "Claro"], ["dark", "Oscuro"], ["auto", "Automático"]].map(([k, l]) => `<button role="radio" data-tema="${k}" aria-selected="${tema === k}" aria-checked="${tema === k}">${l}</button>`).join("")}</div><span class="mu xs">Automático sigue el modo de tu celular.</span>`);
  h += card(`<b>${I.bell} Avisos en este celular</b><span class="mu sm">${pushOn ? "Activados." : "Actívalos para que te lleguen los avisos aunque la app esté cerrada."}</span><button class="btn ${pushOn ? "lt" : "honey"}" data-a="push">${I.bell} ${pushOn ? "Administrar avisos" : "Activar avisos"}</button>
    <div class="dnd ${pushOn ? "" : "dis"}"><label class="sw"><input type="checkbox" id="dndOn" ${dnd.on ? "checked" : ""} ${pushOn ? "" : "disabled"}><span></span><b>No molestar</b></label>
    <div class="dnd-h"><label>Desde<input type="time" id="dndIni" value="${esc(dnd.ini)}" ${pushOn ? "" : "disabled"}></label><label>Hasta<input type="time" id="dndFin" value="${esc(dnd.fin)}" ${pushOn ? "" : "disabled"}></label></div>
    <span class="mu xs">En ese horario no te suena nada. Al terminar te llega un solo resumen.</span><button class="btn lt sm" data-a="dnd" ${pushOn ? "" : "disabled"}>Guardar No molestar</button></div>`);
  if (st.me.jefe && hor) h += card(`<b>${I.play} Inicio de la rutina</b><span class="mu sm">${st.me.admin ? "Hora en que la rutina se inicia sola cada día. Déjala vacía para iniciarla a mano. Tú y los supervisores también pueden iniciarla antes desde la app." : "La programa el administrador. Tú puedes iniciarla antes desde la pantalla de rutina."}</span>
    <div class="hor">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label><span>${S.DIAS_SEM[d]}</span><input type="time" data-hd="${d}" value="${esc(hor[String(d)] || "")}" ${st.me.admin ? "" : "disabled"}></label>`).join("")}</div>${st.me.admin ? `<button class="btn lt" data-a="horario">Guardar horario</button>` : ""}`);
  if (st.installEvt) h += card(`<b>Instalar app</b><button class="btn lt" data-a="install">${I.dl} Instalar en este celular</button>`);
  h += `<div class="pad"><button class="btn danger block" data-a="salir">${I.out} Cerrar sesión</button></div>`;
  return h;
}
function claveSheet() {
  sheet(`<h2>${I.key} Cambiar mi clave</h2>
    <label class="lb" for="ka">Clave actual</label><input type="password" inputmode="numeric" maxlength="4" id="ka" autocomplete="off">
    <label class="lb" for="k1">Clave nueva (4 números)</label><input type="password" inputmode="numeric" maxlength="4" id="k1" autocomplete="off">
    <label class="lb" for="k2">Repite la clave nueva</label><input type="password" inputmode="numeric" maxlength="4" id="k2" autocomplete="off">
    <p class="err" id="ke"></p><button class="btn honey block" data-a="ok">Guardar clave</button><button class="btn lt block" data-a="no">Cancelar</button>`, (s, close) => {
    $$("#ka,#k1,#k2", s).forEach((i) => i.addEventListener("input", () => (i.value = i.value.replace(/\D/g, "").slice(0, 4))));
    $("[data-a=no]", s).onclick = close;
    $("[data-a=ok]", s).onclick = async (ev) => {
      const b = ev.currentTarget, e = $("#ke", s), a = $("#ka", s).value, n1 = $("#k1", s).value, n2 = $("#k2", s).value;
      if (!/^\d{4}$/.test(a)) return (e.textContent = "Escribe tu clave actual de 4 números.");
      if (!/^\d{4}$/.test(n1)) return (e.textContent = "La clave nueva debe tener 4 números.");
      if (n1 !== n2) return (e.textContent = "Las claves nuevas no coinciden.");
      if (n1 === a) return (e.textContent = "La clave nueva debe ser distinta a la actual.");
      b.disabled = true; b.textContent = "Guardando…";
      try { await api("mi_clave", { actual: a, nueva: n1 }); close(); doneOverlay("Clave actualizada", "La próxima vez entra con tu clave nueva.", ""); }
      catch (er) { e.textContent = er.message; b.disabled = false; b.textContent = "Guardar clave"; }
    };
  });
}
async function guardarDnd(ev) {
  const b = ev.currentTarget, on = $("#dndOn").checked, ini = $("#dndIni").value, fin = $("#dndFin").value;
  const m = (t) => S.hhmmToMin(t);
  if (on && (m(ini) == null || m(fin) == null || m(ini) === m(fin))) return toast("Elige una hora de inicio y una de fin distintas.");
  b.disabled = true;
  try {
    const sub = await (await navigator.serviceWorker.ready).pushManager.getSubscription();
    if (!sub) throw new Error("Primero activa los avisos en este celular.");
    await api("push_dnd", { endpoint: sub.endpoint, ini: on ? m(ini) : null, fin: on ? m(fin) : null });
    const v = store.get(); v.dnd = { on, ini, fin }; store.set(v);
    toast(on ? "No molestar de " + S.fmtMin(m(ini)) + " a " + S.fmtMin(m(fin)) + "." : "No molestar desactivado.");
  } catch (e) { toast(e.message, 5000); }
  b.disabled = false;
}
async function guardarHorario(ev) {
  const b = ev.currentTarget, horario = {};
  $$("[data-hd]").forEach((i) => (horario[i.dataset.hd] = i.value || null));
  b.disabled = true;
  try { const r = await api("horario_guardar", { horario }); [st.panel.data, st.tablero, st.hoy].forEach((D) => { if (D?.inicio) D.inicio.horario = r.horario; }); toast("Horario guardado."); renderMain(); }
  catch (e) { toast(e.message, 5000); }
  b.disabled = false;
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
  $$("[data-copy]", main).forEach((b) => (b.onclick = () => copy(b.dataset.copy === "rutina" ? S.resumenRutina(today(), st.hoy.rutina, true, iniHoy()) : S.resumenRutina(st.panel.data.fecha, st.panel.data.rutina, st.panel.data.fecha === st.panel.data.hoy, st.panel.data.inicio?.m ?? null))));
  // Registros
  $$("[data-day]", main).forEach((b) => (b.onclick = () => { st.panel.fecha = b.dataset.day; st.panel.data = { ...st.panel.data, fecha: b.dataset.day }; refreshPanel(); }));
  $("#pickDay", main) && ($("#pickDay", main).onchange = (e) => { if (e.target.value) { st.panel.fecha = e.target.value; refreshPanel(); } });
  const strip = $("#strip", main), sel = strip && $('[aria-pressed="true"]', strip);
  if (strip && sel) strip.scrollLeft = Math.max(0, sel.offsetLeft - strip.clientWidth / 2 + sel.clientWidth / 2);
  $$("[data-sub]", main).forEach((b) => (b.onclick = () => { st.panel.sub = b.dataset.sub; renderMain(); if (b.dataset.sub === "semana") refreshAnimo(); }));
  // Rutina nueva, retros, inicio, podio
  $$("[data-rv]", main).forEach((b) => (b.onclick = () => { st.rutView = b.dataset.rv; const v = store.get(); v.rutView = st.rutView; store.set(v); st.tlScrolled = false; renderMain(); }));
  $$("[data-tlh]", main).forEach((b) => (b.onclick = () => { const k = b.dataset.tlh, key = k === "past" || k === "all" ? k : +k; if (st.tlOpen.has(key)) st.tlOpen.delete(key); else { st.tlOpen.add(key); st.accJust = "h" + key; } renderMain(); }));
  $("[data-a=retros]", main) && ($("[data-a=retros]", main).onclick = retrosSheet);
  $("[data-a=midia]", main) && ($("[data-a=midia]", main).onclick = () => goTab("midia", 1));
  wirePanel(main);
  $("[data-a=iniciar]", main) && ($("[data-a=iniciar]", main).onclick = iniciarRutina);
  $("[data-a=pts]", main) && ($("[data-a=pts]", main).onclick = puntosSheet);
  // Ajustes de cada quien
  $$("[data-tema]", main).forEach((b) => (b.onclick = () => { const v = store.get(); v.tema = b.dataset.tema; store.set(v); applyTheme(); renderMain(); }));
  $("[data-a=clave]", main) && ($("[data-a=clave]", main).onclick = claveSheet);
  $("[data-a=nombre]", main) && ($("[data-a=nombre]", main).onclick = async (ev) => { const b = ev.currentTarget, n = $("#myName", main).value.trim(); if (!n) return toast("Escribe tu nombre."); b.disabled = true; try { const r = await api("mi_nombre", { nombre: n }); st.me.nombre = r.nombre; saveSession(); st.heroDone = false; renderMain(); toast("Nombre guardado."); } catch (e) { toast(e.message); } b.disabled = false; });
  $("[data-a=dnd]", main) && ($("[data-a=dnd]", main).onclick = guardarDnd);
  $("[data-a=horario]", main) && ($("[data-a=horario]", main).onclick = guardarHorario);
  $("[data-a=salir]", main) && ($("[data-a=salir]", main).onclick = salirSheet);
  $$("[data-zf]", main).forEach((b) => (b.onclick = () => { st.panel.zone = b.dataset.zf; renderMain(); }));
  // Calificar rutina
  $$("[data-rrn]", main).forEach((b) => (b.onclick = (e) => { e.preventDefault(); rateRutina(b.closest("[data-rid]").dataset.rid, +b.dataset.rrn); }));
  $$("[data-savec]", main).forEach((b) => (b.onclick = () => { const id = b.dataset.savec; rateRutina(id, undefined, $(`[data-rc="${id}"]`, main).value); }));
  $$("[data-rep]", main).forEach((b) => (b.onclick = () => { const d = st.panel.data.rutina.find((x) => x.id === b.dataset.rep); if (d) repetirRutinaSheet(d); }));
  $$("[data-evr]", main).forEach((b) => { const find = () => st.panel.data?.rutina.find((x) => x.id === b.dataset.evr); b.onclick = () => { const d = find(); if (d) verRegistro(d); }; longPress(b, (x, y) => quickRate(x, y, (n) => rateRutina(b.dataset.evr, n))); });
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
  $("[data-a=push]", main) && ($("[data-a=push]", main).onclick = pushSheet);
  $("[data-a=install]", main) && ($("[data-a=install]", main).onclick = async () => { st.installEvt.prompt(); await st.installEvt.userChoice.catch(() => {}); st.installEvt = null; renderMain(); });
}

/* ---------------- Arranque ---------------- */
window.addEventListener("scroll", () => { const t = $("#top"); if (t) t.classList.toggle("scrolled", window.scrollY > 4); }, { passive: true });
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); st.installEvt = e; if (!st.token) renderLogin(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
const typing = () => { const a = document.activeElement; return a && (a.tagName === "TEXTAREA" || a.tagName === "INPUT"); };
setInterval(() => { if (!st.token || document.hidden || $(".cam") || typing()) return; renderMain(); }, 30000);
setInterval(() => { if (!st.token || document.hidden || $(".cam") || $(".sheet-bg") || $(".qpop") || $(".rc.gone") || typing()) return; if (st.tab === "registros") refreshPanel(true); else if (st.tab !== "empleados" && st.tab !== "ajustes") refreshHoy(true); if (st.tab === "panel") refreshTablero(true); }, 25000);
setInterval(() => { if (st.token && !document.hidden) refreshAnimo(); }, 5 * 60e3);
document.addEventListener("visibilitychange", () => { if (!document.hidden && st.token) { if (st.tab === "registros") refreshPanel(true); else refreshHoy(true); if (st.tab === "panel") refreshTablero(true); } });

(async function boot() {
  const saved = store.get();
  if (saved.token && saved.me) {
    st.token = saved.token; st.me = saved.me; st.tab = st.me.admin ? "registros" : "rutina";
    render();
    try { const me = await api("yo"); st.me = { ...st.me, ...me }; saveSession(); if (st.me.admin) refreshPanel(); else refreshHoy(); }
    catch { /* api() ya cierra la sesión si venció */ }
  } else { render(); loadEstado(); }
})();
