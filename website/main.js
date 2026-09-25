(() => {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  $$(".fx").forEach((el, i) => el.style.setProperty("--i", i));
  $("#year").textContent = new Date().getFullYear();
  const svgIcon = (id) => `<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;

  /* ---------- theme: follows the system until you pick one ---------- */
  const root = document.documentElement;
  const systemDark = matchMedia("(prefers-color-scheme: dark)");
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : systemDark.matches);
  const themeBtn = $("#theme");
  const labelTheme = () => themeBtn.setAttribute("aria-label", isDark() ? "Switch to light theme" : "Switch to dark theme");
  labelTheme();
  systemDark.addEventListener("change", labelTheme);
  themeBtn.addEventListener("click", () => {
    const next = isDark() ? "light" : "dark";
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    labelTheme();
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  });

  /* ---------- Toronto clock ---------- */
  const fmt = new Intl.DateTimeFormat("en-US", { timeZone: "America/Toronto", hour: "numeric", minute: "2-digit" });
  const clock = $("#clock");
  const tick = () => { clock.textContent = fmt.format(new Date()); };
  tick();
  setInterval(tick, 10000);

  /* ---------- terminals: fit the text to the frame ---------- */
  function fitTerm(pre) {
    const cols = +pre.dataset.cols, rows = +pre.dataset.rows;
    const fit = () => {
      const cs = getComputedStyle(pre);
      const inner = pre.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      if (inner <= 0) return;
      const size = Math.max(9, Math.min(12.5, inner / (cols * 0.6)));
      pre.style.fontSize = `${size}px`;
      pre.style.height = `${rows * size * 1.6 + parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)}px`;
    };
    fit();
    new ResizeObserver(fit).observe(pre);
  }
  $$(".term__body").forEach(fitTerm);

  /* ---------- demos, started when a project opens ---------- */
  const demos = {};

  // VaultUI: the recording plays while the project is open
  {
    const img = $("[data-gif]");
    const still = img.src;
    let gif = null;
    demos.vaultui = {
      start() {
        if (!gif) { gif = new Image(); gif.src = img.dataset.gif; }
        const swap = () => { if (img.closest(".proj").classList.contains("open")) img.src = gif.src; };
        gif.complete ? swap() : gif.addEventListener("load", swap, { once: true });
      },
      stop() { img.src = still; },
    };
  }

  // Glimpse: the README screenshots, one after another
  {
    const box = $(".slides");
    const imgs = $$("img", box);
    const dots = $(".slides__dots", box);
    dots.innerHTML = imgs.map(() => "<i></i>").join("");
    const dotEls = $$("i", dots);
    let i = 0, timer = 0;
    const show = (n) => {
      imgs[i].classList.remove("on"); dotEls[i].classList.remove("on");
      i = n;
      imgs[i].classList.add("on"); dotEls[i].classList.add("on");
    };
    show(0);
    demos.glimpse = {
      start() { clearInterval(timer); if (!reduced) timer = setInterval(() => show((i + 1) % imgs.length), 3200); },
      stop() { clearInterval(timer); },
    };
  }

  // penhan: output captured from penhan v0.5.1 against a throwaway Vault dev server
  {
    const pre = $("#penhan-term");
    const rows = +pre.dataset.rows;
    const session = [
      { cmd: ["penhan add payments --encryption=aes --backend=vault \\", "  --vault-addr=$VAULT_ADDR --vault-token-file=./token"], out: [
        "✓ Created safe payments",
        "✓ Generated AES key at payments/.penhan/keys/aes.key",
        "✓ Created payments/penhan.yaml",
        "✓ Updated .gitignore",
      ] },
      { cmd: ["cd payments && mkdir -p secrets/db secrets/stripe"] },
      { cmd: ["echo 'password: hunter2' > secrets/db/credentials.yaml"] },
      { cmd: ["echo 'api_key: sk_test_123' > secrets/stripe/key.yaml"] },
      { cmd: ["penhan encrypt"], out: ["  Encrypted: secrets/db/credentials.yaml", "  Encrypted: secrets/stripe/key.yaml"] },
      { cmd: ["penhan check"], out: ["  new        db/credentials", "  new        stripe/key", "", "2 secret(s), 2 to push"] },
      { cmd: ["penhan push"], out: ["  Pushed (new): db/credentials", "  Pushed (new): stripe/key", "", "Push complete: 2 pushed, 0 unchanged"] },
      { cmd: ["echo 'api_key: sk_test_456' > secrets/stripe/key.yaml"] },
      { cmd: ["penhan check"], out: ["  unchanged  db/credentials", "  changed    stripe/key", "", "2 secret(s), 1 to push"] },
      { cmd: ["penhan push"], out: ["  Unchanged: db/credentials", "  Pushed (changed): stripe/key", "", "Push complete: 1 pushed, 1 unchanged"] },
    ];
    const paint = (l) => esc(l)
      .replace(/^✓/, '<span class="ok">✓</span>')
      .replace(/^(\s+)(new)(\s)/, '$1<span class="new">$2</span>$3')
      .replace(/^(\s+)(changed)(\s)/, '$1<span class="chg">$2</span>$3')
      .replace(/^(\s+)(unchanged)(\s)/, '$1<span class="dim">$2</span>$3')
      .replace(/^(\s+)(Encrypted:|Pushed \(new\):)/, '$1<span class="ok">$2</span>')
      .replace(/^(\s+)(Pushed \(changed\):)/, '$1<span class="chg">$2</span>')
      .replace(/^(\s+)(Unchanged:)/, '$1<span class="dim">$2</span>');
    const prompt = '<span class="pr">$</span> ';
    const all = session.flatMap((s) => [...s.cmd.map((c, i) => (i === 0 ? prompt : "") + esc(c)), ...(s.out || []).map(paint)]);
    let lines = [], token = 0;
    const render = (live) => { pre.innerHTML = (live === undefined ? lines : [...lines, live]).slice(-rows).join("\n"); };
    async function play(t) {
      lines = [];
      for (const step of session) {
        for (let li = 0; li < step.cmd.length; li++) {
          const text = step.cmd[li], lead = li === 0 ? prompt : "";
          for (let c = 0; c <= text.length; c++) {
            if (t !== token) return;
            render(`${lead}${esc(text.slice(0, c))}<span class="caret"></span>`);
            await wait(c === 0 ? 200 : 8 + Math.random() * 16);
          }
          lines.push(lead + esc(text));
        }
        render();
        await wait(step.out ? 280 : 110);
        for (const o of step.out || []) {
          if (t !== token) return;
          lines.push(paint(o));
          render();
          await wait(60);
        }
        await wait(step.out ? 700 : 110);
      }
      render(`${prompt}<span class="caret"></span>`);
      await wait(4000);
      if (t === token) play(t);
    }
    lines = all; render(); // readable before it opens
    demos.penhan = {
      start() { if (reduced) return; play(++token); },
      stop() { token++; lines = all; render(); },
    };
  }

  // Claude Usage Bar: the popover rebuilt from the app's SwiftUI source (Views.swift, UsageAPI.swift),
  // including its level, pace and duration rules. Refresh steps through sample readings.
  {
    const desk = $("#cub");
    const pop = $("#cub-pop"), mb = $(".mb", desk);
    const SESSION = 5 * 3600, WEEK = 7 * 86400;
    const SAMPLES = [
      { s: 74, sLeft: 133 * 60, w: 18, wLeft: 4 * 86400 },
      { s: 86, sLeft: 104 * 60, w: 21, wLeft: 4 * 86400 - 29 * 60 },
      { s: 94, sLeft: 88 * 60, w: 23, wLeft: 4 * 86400 - 45 * 60 },
      { s: 31, sLeft: 185 * 60, w: 24, wLeft: 4 * 86400 - 60 * 60 },
    ];
    let idx = 0, fetchedAt = Date.now() - 90e3, resets = {}, timer = 0;
    const load = (n) => {
      idx = n;
      const now = Date.now();
      resets = { s: now + SAMPLES[n].sLeft * 1e3, w: now + SAMPLES[n].wLeft * 1e3 };
    };
    load(0);

    const duration = (sec) => {
      const m = Math.max(Math.floor(sec / 60), 0), d = Math.floor(m / 1440), h = Math.floor((m % 1440) / 60);
      if (d > 0) return `${d}d ${h}h`;
      return h > 0 ? `${h}h ${m % 60}m` : `${m % 60}m`;
    };
    const level = (u) => (u < 70 ? "normal" : u < 90 ? "high" : "critical");
    function pace(u, resetAt, span, now) {
      const elapsed = Math.min(Math.max(1 - (resetAt - now) / 1e3 / span, 0), 1);
      if (u >= 100) return { icon: "critical", label: "Limit reached", sev: 4 };
      if (elapsed <= 0.03) return null;
      const projected = u / (elapsed * 100);
      const rate = u / (elapsed * span);
      const out = Math.min(rate > 0 ? (100 - u) / rate : Infinity, (resetAt - now) / 1e3);
      if (projected < 0.75) return { icon: "turtle", label: "Under pace", sev: 0 };
      if (projected <= 1) return { icon: "dog", label: "On pace", sev: 1 };
      return { icon: projected <= 1.5 ? "rabbit" : "bird", label: `Out in ~${duration(out)}`, sev: projected <= 1.5 ? 2 : 3 };
    }
    const sameDay = (a, b) => a.toDateString() === b.toDateString();
    const clockTime = (d) => d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    const resetClock = (d, now) => (sameDay(d, now) ? clockTime(d) : `${d.toLocaleDateString("en-US", { weekday: "short" })} ${clockTime(d)}`);

    pop.innerHTML = `
      <div class="pop__head">
        <span class="spark">${svgIcon("sparkle")}</span>
        <span class="pop__plan">Max 5x</span>
        <span class="pop__updated"></span>
        <button class="pop__refresh" type="button" aria-label="Refresh">${svgIcon("refresh")}</button>
      </div>
      <div class="pop__body">
        ${["s", "w"].map((k) => `
        <div class="lim" data-k="${k}">
          <div class="lim__title">
            <span class="lim__icon">${svgIcon(k === "s" ? "clock" : "calendar")}</span>
            <span class="lim__name">${k === "s" ? "Session" : "Weekly"}</span>
            <span class="lim__sub">${k === "s" ? "5 hours" : "All models"}</span>
            <span class="lim__badge"></span>
            <span class="lim__pct"><span class="n"></span><small>%</small></span>
          </div>
          <div class="bar"><span class="bar__fill"></span><span class="bar__tick"></span></div>
          <div class="lim__meta"><span class="lim__reset"></span><span class="pace"></span></div>
        </div>`).join("")}
      </div>
      <div class="pop__foot">
        <a href="https://claude.ai/settings/usage" target="_blank" rel="noreferrer">Open claude.ai ${svgIcon("out")}</a>
        <span class="sc">Settings <span><kbd>⌘</kbd> <kbd>,</kbd></span></span>
        <button class="sc pop__quit" type="button">Quit <span><kbd>⌘</kbd> <kbd>Q</kbd></span></button>
      </div>`;

    const refreshBtn = $(".pop__refresh", pop);
    function render() {
      const now = new Date(), t = now.getTime(), smp = SAMPLES[idx];
      const since = (t - fetchedAt) / 1e3;
      $(".pop__updated", pop).textContent = since < 60 ? "Updated just now" : `Updated ${duration(since)} ago`;
      const paces = [];
      for (const [k, u, span] of [["s", smp.s, SESSION], ["w", smp.w, WEEK]]) {
        const row = $(`.lim[data-k="${k}"]`, pop), reset = new Date(resets[k]);
        const lv = level(u);
        $(".n", row).textContent = Math.round(u);
        $(".lim__badge", row).innerHTML = lv === "normal" ? "" : lv === "high"
          ? `<span class="pill" style="--c:var(--warn)">${svgIcon("high")}High</span>`
          : `<span class="pill" style="--c:var(--crit)">${svgIcon("critical")}Near limit</span>`;
        const fill = $(".bar__fill", row);
        fill.style.width = `max(${Math.min(u, 100)}%, 6px)`;
        fill.style.setProperty("--fill", lv === "normal" ? "var(--p-norm)" : lv === "high" ? "var(--warn)" : "var(--crit)");
        $(".bar__tick", row).style.left = `${Math.min(Math.max(1 - (resets[k] - t) / 1e3 / span, 0), 1) * 100}%`;
        $(".lim__reset", row).textContent = `Resets ${resetClock(reset, now)} · ${duration((resets[k] - t) / 1e3)}`;
        const p = pace(u, resets[k], span, t);
        const el = $(".pace", row);
        el.className = `pace${p && p.sev >= 2 ? " warn" : ""}`;
        el.innerHTML = p ? `${svgIcon(p.icon)}${p.label}` : "";
        if (p) paces.push(p);
      }
      const urgent = paces.sort((a, b) => b.sev - a.sev)[0];
      mb.innerHTML = `${svgIcon("clock")}${smp.s}%<span class="gap"></span>${svgIcon("calendar")}${smp.w}%${urgent ? `<span class="gap"></span>${svgIcon(urgent.icon)}` : ""}`;
    }
    const setOpenPop = (open) => { pop.classList.toggle("closed", !open); mb.setAttribute("aria-expanded", open); };
    mb.addEventListener("click", () => setOpenPop(pop.classList.contains("closed")));
    $(".pop__quit", pop).addEventListener("click", () => setOpenPop(false));
    refreshBtn.addEventListener("click", () => {
      if (refreshBtn.classList.contains("spin")) return;
      refreshBtn.classList.add("spin");
      setTimeout(() => {
        refreshBtn.classList.remove("spin");
        load((idx + 1) % SAMPLES.length);
        fetchedAt = Date.now();
        render();
      }, 800);
    });
    render();
    demos["claude-usage-bar"] = {
      start() { setOpenPop(true); render(); clearInterval(timer); timer = setInterval(render, 15000); },
      stop() { clearInterval(timer); },
    };
  }

  /* ---------- accordion: one project open at a time ---------- */
  const projs = $$(".proj");
  function setOpen(p, open) {
    p.classList.toggle("open", open);
    $(".proj__row", p).setAttribute("aria-expanded", open);
    const d = demos[p.dataset.repo];
    if (d) open ? d.start() : d.stop();
  }
  projs.forEach((p) => {
    $(".proj__row", p).addEventListener("click", () => {
      const open = !p.classList.contains("open");
      projs.forEach((q) => q !== p && q.classList.contains("open") && setOpen(q, false));
      setOpen(p, open);
      hidePeek();
    });
  });

  /* ---------- hover preview that trails the cursor ---------- */
  const peek = $("#peek"), peekImg = $("img", peek);
  const canHover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0, shown = false;
  function loop() {
    x += (tx - x) * 0.18; y += (ty - y) * 0.18;
    peek.style.transform = `translate(${x}px, ${y}px)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 || shown ? requestAnimationFrame(loop) : 0;
  }
  function hidePeek() { shown = false; peek.classList.remove("on"); }
  if (canHover && !reduced) {
    projs.forEach((p) => p.dataset.preview && (new Image().src = p.dataset.preview));
    new Image().src = "assets/cub-popover-dark@3x.png";
    projs.forEach((p) => {
      const row = $(".proj__row", p);
      row.addEventListener("pointerenter", (e) => {
        if (p.classList.contains("open")) return;
        peekImg.src = p.dataset.repo === "claude-usage-bar" && isDark() ? "assets/cub-popover-dark@3x.png" : p.dataset.preview;
        peekImg.classList.toggle("contain", p.dataset.repo === "claude-usage-bar");
        tx = e.clientX + 22; ty = e.clientY + 18;
        if (!shown) { x = tx; y = ty; }
        shown = true;
        peek.classList.add("on");
        if (!raf) raf = requestAnimationFrame(loop);
      });
      row.addEventListener("pointermove", (e) => {
        const w = peek.offsetWidth, h = peek.offsetHeight;
        tx = Math.min(e.clientX + 22, innerWidth - w - 12);
        ty = Math.min(e.clientY + 18, innerHeight - h - 12);
      });
      row.addEventListener("pointerleave", hidePeek);
    });
    addEventListener("scroll", hidePeek, { passive: true });
  }

  /* ---------- activity: a year of GitHub contributions ---------- */
  (async () => {
    const section = $("#activity"), graph = $("#graph"), tip = $("#graph-tip");
    let data;
    try { data = await fetch("assets/contributions.json").then((r) => (r.ok ? r.json() : null)); } catch {}
    if (!data || !data.days || !data.days.length) return;
    section.hidden = false;
    $("#activity-total").textContent = `${data.total.toLocaleString("en-US")} contributions in the last year`;
    const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    const weeks = [];
    for (let i = 0; i < data.days.length; i += 7) weeks.push(data.days.slice(i, i + 7));
    let shown = 0;
    function draw() {
      const w = graph.clientWidth, gap = w < 420 ? 2 : 3;
      const n = Math.max(1, Math.min(weeks.length, Math.floor((w + gap) / (8 + gap))));
      if (n === shown) return;
      shown = n;
      const slice = weeks.slice(-n);
      graph.style.gridTemplateColumns = `repeat(${n}, 1fr)`;
      graph.innerHTML = slice.map((wk, wi) => wk.map(([d, c, l]) => `<i data-l="${l}" data-d="${d}" data-c="${c}" style="--w:${wi}"></i>`).join("")).join("");
      const total = slice.flat().reduce((s, d) => s + d[1], 0);
      graph.setAttribute("aria-label", `${total} contributions in the last ${n} weeks`);
    }
    draw();
    new ResizeObserver(draw).observe(graph);
    const say = (cell) => {
      const c = +cell.dataset.c, when = dateFmt.format(new Date(`${cell.dataset.d}T00:00:00Z`));
      tip.textContent = `${c === 0 ? "No" : c} contribution${c === 1 ? "" : "s"} on ${when}`;
    };
    graph.addEventListener("pointerover", (e) => { if (e.target.dataset.d) say(e.target); });
    graph.addEventListener("pointerleave", () => { tip.textContent = ""; });
    if (!reduced) {
      new IntersectionObserver(([en], io) => { if (en.isIntersecting) { graph.classList.add("drawn"); io.disconnect(); } }, { threshold: 0.4 }).observe(graph);
    }
  })();

  /* ---------- latest release tags, written at deploy time by scripts/refresh-data.py ---------- */
  fetch("assets/releases.json")
    .then((r) => (r.ok ? r.json() : {}))
    .then((tags) => {
      for (const [repo, tag] of Object.entries(tags)) {
        const ver = $(`.proj[data-repo="${repo}"] [data-version]`);
        if (ver && typeof tag === "string") ver.textContent = tag;
      }
    })
    .catch(() => {});
})();
