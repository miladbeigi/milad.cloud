// The popover is rebuilt from the app's SwiftUI layout and its level, pace and duration rules
// (SPEC.md §4 and §6). The sliders set the session's usage and elapsed time.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const icon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const SESSION = 5 * 3600, WEEK = 7 * 86400;

  const duration = (sec) => {
    const m = Math.max(Math.floor(sec / 60), 0), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
    if (d > 0) return `${d}d ${h}h`;
    return h > 0 ? `${h}h ${m % 60}m` : `${m % 60}m`;
  };
  const level = (u) => (u < 70 ? "normal" : u < 90 ? "high" : "critical");
  function pace(u, left, span) {
    const elapsed = Math.min(Math.max(1 - left / span, 0), 1);
    if (u >= 100) return { icon: "critical", key: "reached", label: "Limit reached", sev: 4 };
    if (elapsed <= 0.03) return null;
    const projected = u / (elapsed * 100);
    const rate = u / (elapsed * span);
    const out = Math.min(rate > 0 ? (100 - u) / rate : Infinity, left);
    if (projected < 0.75) return { icon: "turtle", key: "turtle", label: "Under pace", sev: 0, projected };
    if (projected <= 1) return { icon: "dog", key: "dog", label: "On pace", sev: 1, projected };
    const fast = projected <= 1.5;
    return { icon: fast ? "rabbit" : "bird", key: fast ? "rabbit" : "bird", label: `Out in ~${duration(out)}`, sev: fast ? 2 : 3, projected, out };
  }
  const clockTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const resetClock = (d, now) => (d.toDateString() === now.toDateString() ? clockTime(d) : `${d.toLocaleDateString("en-US", { weekday: "short" })} ${clockTime(d)}`);

  const pop = $("#pop"), mb = $("#mb");
  pop.innerHTML = `
    <div class="pop__head">
      <span class="spark">${icon("sparkle")}</span>
      <span class="pop__plan">Max 5x</span>
      <span class="pop__updated">Updated just now</span>
      <button class="pop__refresh" type="button" aria-label="Refresh">${icon("refresh")}</button>
    </div>
    <div class="pop__body">
      ${["s", "w"].map((k) => `
      <div class="lim" data-k="${k}">
        <div class="lim__title">
          <span class="lim__icon">${icon(k === "s" ? "clock" : "calendar")}</span>
          <span class="lim__name">${k === "s" ? "Session" : "Weekly"}</span>
          <span class="lim__sub">${k === "s" ? "5 hours" : "All models"}</span>
          <span class="lim__badge"></span>
          <span class="lim__pct"><span class="n"></span><small>%</small></span>
        </div>
        <div class="bar" title=""><span class="bar__fill"></span><span class="bar__tick"></span></div>
        <div class="lim__meta"><span class="lim__reset"></span><span class="pace"></span></div>
      </div>`).join("")}
    </div>
    <div class="pop__foot">
      <a href="https://claude.ai/settings/usage" rel="noreferrer">Open claude.ai ${icon("out")}</a>
      <span class="sc">Settings <span><kbd>⌘</kbd> <kbd>,</kbd></span></span>
      <button class="sc pop__quit" type="button">Quit <span><kbd>⌘</kbd> <kbd>Q</kbd></span></button>
    </div>`;

  const rUsed = $("#r-used"), rTime = $("#r-time"), oUsed = $("#o-used"), oTime = $("#o-time"), verdict = $("#verdict");
  const WEEKLY = { u: 18, left: 4 * 86400 };
  const COLORS = { turtle: "var(--turtle)", dog: "var(--dog)", rabbit: "var(--rabbit)", bird: "var(--bird)", reached: "var(--crit)" };
  let lastKey = { s: null, w: null, mb: null };

  function render() {
    const now = new Date();
    const used = +rUsed.value, mins = +rTime.value;
    oUsed.textContent = `${used}%`;
    oTime.textContent = duration(mins * 60);
    rUsed.style.setProperty("--v", `${used}%`);
    rTime.style.setProperty("--v", `${(mins / 300) * 100}%`);

    const rows = { s: { u: used, left: (300 - mins) * 60, span: SESSION }, w: { u: WEEKLY.u, left: WEEKLY.left, span: WEEK } };
    const paces = [];
    for (const k of ["s", "w"]) {
      const { u, left, span } = rows[k];
      const row = $(`.lim[data-k="${k}"]`, pop), lv = level(u);
      $(".n", row).textContent = Math.round(u);
      $(".lim__badge", row).innerHTML = lv === "normal" ? "" : lv === "high"
        ? `<span class="pill" style="--c:var(--warn)">${icon("high")}High</span>`
        : `<span class="pill" style="--c:var(--crit)">${icon("critical")}Near limit</span>`;
      const fill = $(".bar__fill", row);
      fill.style.width = u > 0 ? `max(${Math.min(u, 100)}%, 6px)` : "0";
      fill.style.setProperty("--fill", lv === "normal" ? "var(--p-norm)" : lv === "high" ? "var(--warn)" : "var(--crit)");
      const elapsed = Math.min(Math.max(1 - left / span, 0), 1);
      $(".bar__tick", row).style.left = `${elapsed * 100}%`;
      $(".bar", row).title = `Bar: usage · Tick: ${Math.round(elapsed * 100)}% of the window has elapsed`;
      $(".lim__reset", row).textContent = `Resets ${resetClock(new Date(now.getTime() + left * 1e3), now)} · ${duration(left)}`;
      const p = pace(u, left, span);
      const el = $(".pace", row);
      el.className = `pace${p && p.sev >= 2 ? " warn" : ""}`;
      el.innerHTML = p ? `${icon(p.icon)}${p.label}` : "";
      if (p && p.key !== lastKey[k]) { el.classList.add("hop"); }
      lastKey[k] = p ? p.key : null;
      if (p) paces.push(p);
      if (k === "s") describe(p, used, mins);
    }
    const urgent = [...paces].sort((a, b) => b.sev - a.sev)[0];
    mb.innerHTML = `${icon("clock")}${used}%<span class="gap"></span>${icon("calendar")}${WEEKLY.u}%${urgent ? `<span class="gap"></span><span class="animal${urgent.key !== lastKey.mb ? " hop" : ""}">${icon(urgent.icon)}</span>` : ""}`;
    lastKey.mb = urgent ? urgent.key : null;
  }

  function describe(p, used, mins) {
    if (!p) {
      verdict.style.setProperty("--c", "var(--turtle)");
      verdict.innerHTML = "<b>Too early to tell.</b> The pace shows up once a few minutes of the window have passed.";
      return;
    }
    verdict.style.setProperty("--c", COLORS[p.key]);
    const x = p.projected ? `${p.projected.toFixed(2)}×` : "";
    const texts = {
      turtle: `<b>Under pace.</b> At this rate you'll end the session at ${Math.round(p.projected * 100)}% of the limit.`,
      dog: `<b>On pace.</b> You'll end the session at about ${Math.round(p.projected * 100)}% of the limit.`,
      rabbit: `<b>Ahead.</b> You're on track for ${x} the limit and will run out in about ${duration(p.out)}, ${duration((300 - mins) * 60 - p.out)} before the reset.`,
      bird: `<b>Way ahead.</b> Heading for ${x} the limit. You'll be out in about ${duration(p.out)}.`,
      reached: `<b>Limit reached.</b> It resets in ${duration((300 - mins) * 60)}.`,
    };
    verdict.innerHTML = texts[p.key];
  }

  for (const r of [rUsed, rTime]) r.addEventListener("input", render);
  for (const b of document.querySelectorAll(".presets button")) {
    b.addEventListener("click", () => animateTo(+b.dataset.u, +b.dataset.t));
  }
  function animateTo(u, t) {
    const u0 = +rUsed.value, t0 = +rTime.value, start = performance.now(), dur = 600;
    const step = (now) => {
      const k = Math.min((now - start) / dur, 1), e = 1 - Math.pow(1 - k, 3);
      rUsed.value = Math.round(u0 + (u - u0) * e);
      rTime.value = Math.round(t0 + (t - t0) * e);
      render();
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // the menu bar item and Quit open and close the popover, like the real thing
  const setOpen = (open) => { pop.classList.toggle("closed", !open); mb.setAttribute("aria-expanded", open); };
  mb.addEventListener("click", () => setOpen(pop.classList.contains("closed")));
  $(".pop__quit", pop).addEventListener("click", () => setOpen(false));
  const refresh = $(".pop__refresh", pop);
  refresh.addEventListener("click", () => { refresh.classList.add("spin"); setTimeout(() => refresh.classList.remove("spin"), 800); });

  const clock = $("#mb-clock");
  const fmt = new Intl.DateTimeFormat("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
  const tick = () => { clock.textContent = fmt.format(new Date()).replace(",", ""); };
  tick();
  setInterval(tick, 20000);

  // hang the popover from its menu bar item, as macOS does
  const anchor = $("#anchor");
  const align = () => {
    anchor.style.paddingRight = "0px";
    if (matchMedia("(max-width: 980px)").matches) return;
    const gap = anchor.getBoundingClientRect().right - mb.getBoundingClientRect().right;
    anchor.style.paddingRight = `${Math.max(gap - 70, 0)}px`;
  };
  addEventListener("resize", align);
  document.fonts.ready.then(align);

  render();
  align();
  // drop the hop class after it plays so the next change can replay it
  document.addEventListener("animationend", (e) => e.target.closest?.(".hop")?.classList.remove("hop"));
})();
