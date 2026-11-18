// A replay of VaultUI: screens.json holds 34-row captures of the real app (tmux capture-pane,
// converted to HTML with the app's theme colours). This file wires them together with the
// app's key bindings, moves the selected row with j/k, and draws the command palette.
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tui = $("#tui"), screenEl = $("#tui-screen"), pre = $("#tui-pre");

  const DASH = "01-dashboard";
  const QUICK = { 1: "02-secret-engines", 2: "10-auth-methods", 3: "11-policies", 4: "13-identity", 5: "16-pki", 6: "19-transit", 7: "26-database", 8: "27-aws" };
  // per screen: where Enter goes for a row (matched against the row's text), Tab, extra keys, Esc
  const NAV = {
    "02-secret-engines": { enter: { "secret/": "03-kv-root", "pki/": "16-pki", "transit/": "19-transit", "identity/": "13-identity", "database/": "26-database", "aws/": "27-aws" }, back: DASH },
    "03-kv-root": { enter: { "apps/": "04-kv-apps" }, back: "02-secret-engines" },
    "04-kv-apps": { enter: { "myapp/": "05-kv-myapp" }, back: "03-kv-root" },
    "05-kv-myapp": { enter: { config: "06-secret-detail", "legacy-token": "31-secret-deleted" }, back: "04-kv-apps" },
    "06-secret-detail": { keys: { J: "07-secret-raw-json", y: "07-secret-raw-json", v: "08-version-history" }, back: "05-kv-myapp" },
    "07-secret-raw-json": { back: "06-secret-detail" },
    "31-secret-deleted": { keys: { c: "!copy is disabled: this secret was deleted", C: "!copy is disabled: this secret was deleted", v: "!deleted secret: restore it in Vault to see its versions" }, back: "05-kv-myapp" },
    "08-version-history": { keys: { d: "09-version-diff" }, back: "06-secret-detail" },
    "09-version-diff": { back: "08-version-history" },
    "10-auth-methods": { back: DASH },
    "11-policies": { enter: { "base-read": "12-policy-body" }, back: DASH },
    "12-policy-body": { back: "11-policies" },
    "13-identity": { tab: "14-identity-groups", back: DASH },
    "14-identity-groups": { tab: "13-identity", enter: { "dev-team": "15-identity-group-detail" }, back: DASH },
    "15-identity-group-detail": { back: "14-identity-groups" },
    "16-pki": { tab: "18-pki-roles", enter: { "": "17-pki-cert-detail" }, back: DASH },
    "17-pki-cert-detail": { back: "16-pki" },
    "18-pki-roles": { tab: "16-pki", back: DASH },
    "19-transit": { enter: { "payment-key": "20-transit-key-detail" }, back: DASH },
    "20-transit-key-detail": { back: "19-transit" },
    "25-contexts": { back: DASH },
    "26-database": { back: DASH },
    "27-aws": { back: DASH },
    "28-token-inspector": { back: DASH },
    "30-go-jump-result": { back: DASH },
  };
  const COMMANDS = {
    secrets: "02-secret-engines", auth: "10-auth-methods", policies: "11-policies", identity: "13-identity",
    pki: "16-pki", transit: "19-transit", database: "26-database", aws: "27-aws", ctx: "25-contexts",
    dash: DASH, token: "28-token-inspector", "go secret/infra/aws": "30-go-jump-result", q: "quit", quit: "quit",
  };
  const HELP = "23-help-overlay";
  const REFRESH = new Set(["03-kv-root", "04-kv-apps", "05-kv-myapp", "06-secret-detail", "31-secret-deleted"]);

  let S = null;                 // screens.json
  let cur = DASH, sel = {};     // current screen and the selected row per screen
  let palette = null;           // typed command text while the palette is open
  let help = null;              // screen to return to from the help overlay
  let flashMsg = null, flashT = 0;

  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const wide = (s) => esc(s).replace(/\p{Extended_Pictographic}/gu, (c) => `<i class="wd">${c}</i>`).replace(/[⏎↑↓←→✔●◆▸█❯]/g, (c) => `<i class="c1">${c}</i>`);
  const pad = (s, n) => s + " ".repeat(Math.max(n - [...s].length, 0));

  function rowText(name, i) { return S[name].table.plain[i] || ""; }

  function linesFor(name) {
    const sc = S[name];
    const lines = sc.lines.slice();
    const t = sc.table;
    if (t && sel[name] !== undefined && sel[name] !== t.sel) {
      // un-highlight the captured row, highlight the chosen one
      lines[t.sel] = `<span class="t">${wide(rowText(name, t.sel))}</span>`;
      const txt = rowText(name, sel[name]);
      lines[sel[name]] = ` <span class="bp B t">${wide(pad(txt.slice(1), t.width - 1))}</span>`;
    }
    return lines;
  }

  function paletteBox(text) {
    const W = 116;
    const matches = text && !text.includes(" ") ? Object.keys(COMMANDS).filter((c) => c.startsWith(text) && c !== text && !c.includes(" ")) : [];
    const hint = matches.length > 1 ? `  tab: ${matches.slice(0, 4).join(", ")}` : matches.length === 1 ? `  tab: ${matches[0]}` : "";
    const body = `: ${text}`;
    const fill = W - [...body].length - 1 - [...hint].length;
    return [
      ` <span class="p"><i class="c1">╭</i>${"─".repeat(W)}<i class="c1">╮</i></span>`,
      ` <span class="p"><i class="c1">│</i></span><span class="t">${esc(body)}</span><span class="cur"> </span><span class="d">${esc(hint)}</span>${" ".repeat(Math.max(fill, 0))}<span class="p"><i class="c1">│</i></span>`,
      ` <span class="p"><i class="c1">╰</i>${"─".repeat(W)}<i class="c1">╯</i></span>`,
    ];
  }

  function draw() {
    if (!S) return;
    let lines;
    if (cur === "quit") {
      lines = Array(34).fill("");
      lines[1] = `<span class="d">~/work</span> <span class="p"><i class="c1">❯</i></span> vaultui`;
      lines[2] = `<span class="d">~/work</span> <span class="p"><i class="c1">❯</i></span> <span class="cur"> </span>`;
      lines[4] = `<span class="d">  vaultui exited. Press any key to start it again.</span>`;
    } else {
      lines = linesFor(help ? HELP : cur);
      if (palette !== null) {
        const body = lines.slice(4, 31);
        lines = [...lines.slice(0, 4), ...paletteBox(palette), ...body.slice(0, body.length - 3), ...lines.slice(31)];
      }
      if (flashMsg) lines[33] = `  <span class="flash B">${esc(flashMsg)}</span>`;
    }
    pre.innerHTML = lines.map((l, i) => `<span class="ln${cur !== "quit" && (i < 4 || i > 30) ? " hb" : ""}">${l || " "}</span>`).join("");
  }

  function flash(msg) {
    flashMsg = msg;
    clearTimeout(flashT);
    flashT = setTimeout(() => { flashMsg = null; draw(); }, 1800);
    screenEl.classList.remove("bump");
    void screenEl.offsetWidth;
    screenEl.classList.add("bump");
    draw();
  }

  function go(name) {
    cur = name;
    help = null;
    if (S[name] && S[name].table && sel[name] === undefined) sel[name] = S[name].table.sel;
    draw();
  }

  function key(k) {
    if (!S) return;
    if (cur === "quit") { sel = {}; go(DASH); return; }
    if (help) { if (k === "Escape" || k === "?" || k === "q") { help = null; draw(); } return; }
    if (palette !== null) {
      if (k === "Escape") { palette = null; }
      else if (k === "Enter") {
        const target = COMMANDS[palette.trim()];
        palette = null;
        if (target === "quit") { cur = "quit"; }
        else if (target) { go(target); return; }
        else { draw(); flash("unknown command: try :secrets, :pki, :ctx, :token or :go secret/infra/aws"); return; }
      } else if (k === "Backspace") { palette = palette.slice(0, -1); }
      else if (k === "Tab") {
        const m = Object.keys(COMMANDS).filter((c) => c.startsWith(palette) && !c.includes(" "));
        if (m.length) palette = m[0];
      } else if (k.length === 1) { palette += k; }
      draw();
      return;
    }
    if (k === ":") { palette = ""; draw(); return; }
    if (k === "?") { help = cur; draw(); return; }
    if (k === "q") { cur = "quit"; draw(); return; }
    if (QUICK[k]) { go(QUICK[k]); return; }
    const nav = NAV[cur] || {};
    const t = S[cur].table;
    if (t && (k === "j" || k === "ArrowDown" || k === "k" || k === "ArrowUp" || k === "g" || k === "G")) {
      const now = sel[cur] ?? t.sel;
      const next = k === "g" ? t.first : k === "G" ? t.last : now + (k === "j" || k === "ArrowDown" ? 1 : -1);
      sel[cur] = Math.min(Math.max(next, t.first), t.last);
      draw();
      return;
    }
    if (k === "Escape" || k === "ArrowLeft") { if (nav.back) go(nav.back); return; }
    if (k === "Tab") { if (nav.tab) go(nav.tab); return; }
    if (k === "Enter" || k === "ArrowRight") {
      if (!nav.enter) return flash("nothing to open here");
      const row = t ? rowText(cur, sel[cur] ?? t.sel) : "";
      const hit = Object.entries(nav.enter).find(([label]) => label === "" ? (sel[cur] ?? t.sel) === t.first : row.includes(label));
      if (hit) return go(hit[1]);
      const want = Object.keys(nav.enter)[0];
      return flash(`this demo has sample data under ${want || "the first row"}: move there and press ⏎`);
    }
    if (nav.keys && nav.keys[k]) return nav.keys[k][0] === "!" ? flash(nav.keys[k].slice(1)) : go(nav.keys[k]);
    if (k === "r" && REFRESH.has(cur)) return flash("refetched from Vault (cache cleared)");
    if (/^[a-zA-Z]$/.test(k)) flash(`'${k}' isn't bound in this view; press ? for help`);
  }

  /* ---------- input ---------- */
  const keyChip = document.createElement("span");
  keyChip.className = "sr-only";
  screenEl.append(keyChip);
  let touched = false;
  const take = () => { touched = true; stopTour(); };
  screenEl.addEventListener("focus", () => tui.classList.add("focused"));
  screenEl.addEventListener("blur", () => tui.classList.remove("focused"));
  screenEl.addEventListener("pointerdown", () => { take(); screenEl.focus({ preventScroll: true }); });
  screenEl.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    const handled = k.length === 1 || ["Enter", "Escape", "Tab", "Backspace", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(k);
    if (!handled) return;
    if (k === "Tab" && palette === null && !(NAV[cur] || {}).tab) return; // let Tab leave the demo
    e.preventDefault();
    take();
    key(k);
  });
  for (const b of document.querySelectorAll("#keys button")) {
    b.addEventListener("click", () => {
      take();
      b.classList.add("hit");
      setTimeout(() => b.classList.remove("hit"), 150);
      key(b.dataset.k);
    });
  }
  for (const b of document.querySelectorAll("[data-go]")) {
    b.addEventListener("click", () => {
      take();
      palette = null;
      go(b.dataset.go);
      tui.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      setTimeout(() => screenEl.focus({ preventScroll: true }), reduced ? 0 : 500);
    });
  }

  /* ---------- the tour: plays real key sequences until someone takes over ---------- */
  const TOUR = ["1", "j", "j", "j", "j", "j", "j", "Enter", "Enter", "j", "Enter", "j", "Enter", "?", "Escape", "v", "d", "Escape", "Escape", "Escape", "j", "j", "Enter", "Escape", ":", "p", "k", "i", "Enter", "Enter", ":", "c", "t", "x", "Enter", "Escape"];
  let tourT = 0, tourI = 0;
  const live = $("#tui-live");
  function stopTour() { clearTimeout(tourT); tourT = 0; live.textContent = "your turn: type away"; }
  function tourStep() {
    if (touched) return;
    if (tourI >= TOUR.length) { tourI = 0; sel = {}; palette = null; go(DASH); tourT = setTimeout(tourStep, 2600); return; }
    const k = TOUR[tourI++];
    live.textContent = `playing: ${k === "Enter" ? "⏎" : k === "Escape" ? "esc" : k}`;
    key(k);
    tourT = setTimeout(tourStep, palette !== null ? 380 : k === "d" || k === "?" || cur === "31-secret-deleted" ? 2600 : 1050);
  }
  const vis = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !touched && !tourT && !reduced) tourT = setTimeout(tourStep, 1200);
      if (!e.isIntersecting && tourT) { clearTimeout(tourT); tourT = 0; }
    }
  }, { threshold: .5 });

  /* ---------- install tabs ---------- */
  const tabs = [...document.querySelectorAll('[role="tab"]')];
  const pick = (t) => {
    for (const x of tabs) {
      const on = x === t;
      x.setAttribute("aria-selected", on);
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !on;
    }
    try { localStorage.setItem("vaultui-install", t.id); } catch {}
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => pick(t));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      pick(n); n.focus();
    });
  });
  try { const saved = document.getElementById(localStorage.getItem("vaultui-install")); if (saved) pick(saved); } catch {}

  fetch("screens.json").then((r) => r.json()).then((data) => {
    S = data;
    go(DASH);
    vis.observe(tui);
  });
})();
