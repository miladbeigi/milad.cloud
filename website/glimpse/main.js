(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- headline marquee: draw it, then show its real size ---------- */
  const mq = $("#mq");
  const measure = () => { const r = mq.getBoundingClientRect(); $("#mq-size").textContent = `${Math.round(r.width)} × ${Math.round(r.height)}`; };
  measure();
  addEventListener("resize", measure);
  requestAnimationFrame(() => mq.classList.add("drawn"));

  /* ---------- menu bar clock ---------- */
  const clock = $("#mb-clock");
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
  const tick = () => { clock.textContent = fmt.format(new Date()).replace(",", ""); };
  tick();
  setInterval(tick, 20000);

  /* ---------- the playable desktop ---------- */
  const desk = $("#desk"), scene = $("#scene"), sel = $("#sel"), selSize = $("#sel-size");
  const cross = $("#cross"), crossXY = $("#cross-xy"), flash = $("#flash"), qa = $("#qa"), mbIcon = $("#mb-glimpse");
  let drag = null, demoing = false, userTouched = false;

  const local = (e) => {
    const r = desk.getBoundingClientRect();
    return { x: Math.min(Math.max(e.clientX - r.left, 0), r.width), y: Math.min(Math.max(e.clientY - r.top, 0), r.height) };
  };
  const place = (a, b) => {
    const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(a.x - b.x), h = Math.abs(a.y - b.y);
    Object.assign(sel.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px` });
    // Retina: report pixels like the real app does on a 2x display
    selSize.textContent = `${Math.round(w * 2)} × ${Math.round(h * 2)}`;
    return { x, y, w, h };
  };
  const moveCross = (p) => {
    cross.hidden = false;
    cross.style.transform = `translate(${p.x}px, ${p.y}px)`;
    crossXY.textContent = `${Math.round(p.x * 2)}, ${Math.round(p.y * 2)}`;
  };

  desk.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const p = local(e);
    if (!drag) { if (!demoing) moveCross(p); return; }
    moveCross(p);
    drag.rect = place(drag.start, p);
  });
  desk.addEventListener("pointerleave", () => { if (!drag && !demoing) cross.hidden = true; });
  desk.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || e.target.closest(".qa")) return;
    if (e.pointerType === "touch") { if (!demoing) demo(); return; }
    userTouched = true;
    desk.classList.add("used");
    desk.setPointerCapture(e.pointerId);
    const p = local(e);
    drag = { start: p, rect: place(p, p) };
    sel.hidden = false;
    mbIcon.classList.add("on");
  });
  const end = () => {
    if (!drag) return;
    const { rect } = drag;
    drag = null;
    sel.hidden = true;
    mbIcon.classList.remove("on");
    if (rect.w > 14 && rect.h > 14) capture(rect);
  };
  desk.addEventListener("pointerup", end);
  desk.addEventListener("pointercancel", end);

  // ⌥⇧⌘4 (or Ctrl+Shift+Alt+4 elsewhere) runs the capture demo, like the real shortcut would
  addEventListener("keydown", (e) => {
    if (e.code === "Digit4" && e.altKey && e.shiftKey && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      desk.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      if (!demoing) demo();
    }
  });

  function capture(rect) {
    flash.classList.remove("go");
    void flash.offsetWidth;
    flash.classList.add("go");

    const dw = desk.clientWidth, dh = desk.clientHeight;
    const maxW = Math.min(240, dw * .34), maxH = Math.min(150, dh * .3);
    // uniform scale; tiny or skinny captures sit centered on a card big enough for its buttons
    const s = Math.min(maxW / rect.w, maxH / rect.h);
    const iw = Math.round(rect.w * s), ih = Math.round(rect.h * s);
    const cw = Math.max(iw, 150), ch = Math.max(ih, 96);

    const card = document.createElement("div");
    card.className = "qa__card";
    card.innerHTML = `
      <div class="qa__crop" style="width:${cw}px;height:${ch}px"></div>
      <div class="qa__ui">
        <button class="corner x" type="button" aria-label="Close">${svg("x")}</button>
        <button class="corner ed" type="button" aria-label="Annotate">${svg("pen")}</button>
        <button class="corner pn" type="button" aria-label="Pin">${svg("pin")}</button>
        <button class="corner tx" type="button" aria-label="Copy text">${svg("text")}</button>
        <button class="big" type="button" data-act="Copied">Copy</button>
        <button class="big" type="button" data-act="Saved">Save</button>
      </div>
      <div class="qa__done"></div>`;
    const clone = scene.cloneNode(true);
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    clone.setAttribute("aria-hidden", "true");
    Object.assign(clone.style, { width: `${dw}px`, height: `${dh}px`, transform: `translate(${(cw - iw) / 2}px, ${(ch - ih) / 2}px) scale(${s}) translate(${-rect.x}px, ${-rect.y}px)`, clipPath: `inset(${rect.y}px ${dw - rect.x - rect.w}px ${dh - rect.y - rect.h}px ${rect.x}px)` });
    card.querySelector(".qa__crop").append(clone);

    const done = card.querySelector(".qa__done");
    const dismiss = () => { card.classList.add("out"); setTimeout(() => card.remove(), 400); };
    card.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("x")) return dismiss();
      done.textContent = b.dataset.act || (b.classList.contains("pn") ? "Pinned" : b.classList.contains("tx") ? "Text copied" : "Opening editor…");
      done.classList.add("on");
      setTimeout(() => { done.classList.remove("on"); if (b.dataset.act) dismiss(); }, 900);
    });
    qa.append(card);
    while (qa.children.length > 3) qa.firstElementChild.remove();
    card._t = setTimeout(dismiss, 9000);
    card.addEventListener("pointerenter", () => clearTimeout(card._t));
    card.addEventListener("pointerleave", () => { card._t = setTimeout(dismiss, 4000); });
  }

  function svg(name) {
    const paths = {
      x: '<path d="M4 4l8 8M12 4l-8 8"/>',
      pen: '<path d="M10.5 3.5l2 2L6 12l-2.5.5L4 10z"/>',
      pin: '<path d="M6 2.5h4l-.5 4 2 2v1h-7v-1l2-2zM8 9.5V14"/>',
      text: '<path d="M2.5 5V2.5H5M11 2.5h2.5V5M13.5 11v2.5H11M5 13.5H2.5V11M5.5 6h5M8 6v4.5"/>',
    };
    return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
  }

  /* An unattended run-through: a ghost cursor selects the revenue chart and captures it. */
  async function demo() {
    if (demoing) return;
    demoing = true;
    desk.classList.add("used");
    const r = desk.getBoundingClientRect(), win = $("#win").getBoundingClientRect();
    const chart = $(".chart", scene).getBoundingClientRect();
    const a = { x: chart.left - r.left - 6, y: chart.top - r.top - 6 };
    const b = { x: chart.right - r.left + 6, y: chart.bottom - r.top + 6 };
    if (!win.width) { demoing = false; return; }
    moveCross({ x: a.x - 60, y: a.y - 40 });
    await wait(350);
    moveCross(a);
    await wait(450);
    mbIcon.classList.add("on");
    sel.hidden = false;
    const steps = reduced ? 1 : 36;
    let rect;
    for (let i = 1; i <= steps; i++) {
      const t = 1 - Math.pow(1 - i / steps, 3);
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      rect = place(a, p);
      moveCross(p);
      await wait(16);
    }
    await wait(500);
    sel.hidden = true;
    cross.hidden = true;
    mbIcon.classList.remove("on");
    capture(rect);
    demoing = false;
  }

  // play the demo once when the desktop first comes into view, unless the visitor got there first
  const seen = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      seen.disconnect();
      setTimeout(() => { if (!userTouched) demo(); }, 1400);
    }
  }, { threshold: .6 });
  seen.observe(desk);

  /* ---------- agent terminal ---------- */
  const term = $("#agent-term");
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const SCRIPT = [
    { type: "user", text: "> The settings page looks off on my machine. Take a look?" },
    { type: "pause", ms: 500 },
    { type: "line", html: '<span class="d">⏺</span> <span class="t">glimpse</span> - <span class="k">list_windows</span>' },
    { type: "line", html: '  <span class="d">⎿  12 windows · Safari "Settings · Northwind" id 4182</span>' },
    { type: "pause", ms: 400 },
    { type: "line", html: '<span class="d">⏺</span> <span class="t">glimpse</span> - <span class="k">screenshot_window</span>(<span class="s">window_id: 4182</span>)' },
    { type: "line", html: '  <span class="d">⎿  [image 1568×980] saved to /tmp/glimpse/4182.png</span>' },
    { type: "pause", ms: 600 },
    { type: "line", html: '<span class="u">⏺ The Save button overlaps the footer below 900px wide.</span>' },
    { type: "line", html: '<span class="u">  The sidebar sets a fixed height of 100vh; switching it to</span>' },
    { type: "line", html: '<span class="u">  min-height fixes it. Want me to make the change?</span>' },
  ];
  let ran = false;
  async function runTerm() {
    if (ran) return;
    ran = true;
    let html = "";
    const show = (extra = "") => { term.innerHTML = html + extra; };
    for (const step of SCRIPT) {
      if (step.type === "pause") { if (!reduced) await wait(step.ms); continue; }
      if (step.type === "user") {
        if (reduced) { html += `<span class="u">${esc(step.text)}</span>\n\n`; continue; }
        for (let i = 1; i <= step.text.length; i++) {
          show(`<span class="u">${esc(step.text.slice(0, i))}</span><span class="cur"></span>`);
          await wait(22 + Math.random() * 30);
        }
        html += `<span class="u">${esc(step.text)}</span>\n\n`;
        show();
        continue;
      }
      html += step.html + "\n";
      show();
      if (!reduced) await wait(260);
    }
    show('\n<span class="cur"></span>');
  }
  const tio = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { tio.disconnect(); runTerm(); }
  }, { threshold: .4 });
  tio.observe(term);
})();
