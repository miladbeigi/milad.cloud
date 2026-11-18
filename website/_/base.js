// Shared by the project pages (/glimpse/, /penhan/, ...): copy buttons, the latest release tag, reveal-on-scroll,
// the sticky nav border and the family footer.
(() => {
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const ICON_COPY = '<svg class="cp" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="5.5" y="5.5" width="8" height="8" rx="1.5"/><path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5"/></svg>';
  const ICON_OK = '<svg class="ok" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5"/></svg>';

  /* ---------- copy buttons: <button class="copy" data-copy="#id-of-text"> ---------- */
  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.append(live);
  for (const btn of $$(".copy")) {
    btn.innerHTML = ICON_COPY + ICON_OK;
    btn.setAttribute("aria-label", btn.getAttribute("aria-label") || "Copy command");
    btn.addEventListener("click", async () => {
      const src = document.querySelector(btn.dataset.copy);
      const text = (src.dataset.text || [...src.childNodes].filter((n) => !(n.classList && n.classList.contains("p"))).map((n) => n.textContent).join("")).trim();
      try { await navigator.clipboard.writeText(text); } catch { return; }
      btn.classList.add("done");
      live.textContent = "Copied to clipboard";
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.classList.remove("done"); live.textContent = ""; }, 1600);
    });
  }

  /* ---------- latest release: <span data-release="owner/repo">fallback</span> ---------- */
  // Tags come from /assets/releases.json, written at deploy time by scripts/refresh-data.py,
  // so the page never calls GitHub from the browser.
  if ($$("[data-release]").length) {
    fetch("/assets/releases.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((tags) => {
        if (!tags) return;
        for (const el of $$("[data-release]")) {
          const tag = tags[el.dataset.release.split("/").pop()];
          if (tag) el.textContent = tag;
        }
      })
      .catch(() => {});
  }

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px" });
  $$(".rv").forEach((el) => io.observe(el));

  /* ---------- nav border once scrolled ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => nav.classList.toggle("scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- family footer: <footer class="foot" data-current="glimpse"> ---------- */
  const APPS = [
    { id: "glimpse", name: "Glimpse", line: "Screenshots and recordings for macOS", icon: "glimpse.png" },
    { id: "claude-usage-bar", name: "Claude Usage Bar", line: "Claude limits in your menu bar", icon: "claude-usage-bar.png" },
    { id: "penhan", name: "Penhan", line: "Encrypted secrets in Git", icon: "penhan.svg" },
    { id: "vaultui", name: "VaultUI", line: "A terminal UI for Vault", icon: "vaultui.svg" },
  ];
  const foot = document.querySelector(".foot");
  if (foot) {
    const cur = foot.dataset.current;
    const app = APPS.find((a) => a.id === cur);
    foot.innerHTML = `
      <div class="wrap">
        <nav class="foot__fam" aria-labelledby="fam-h">
          <h2 id="fam-h">More small tools</h2>
          ${APPS.map((a) => `
          <a class="fam" href="/${a.id}/"${a.id === cur ? ' aria-current="page"' : ""}>
            <img src="/_/icons/${a.icon}" alt="" width="36" height="36" loading="lazy">
            <span><b>${a.name}</b><span>${a.line}</span></span>
          </a>`).join("")}
        </nav>
        <div class="foot__row">
          <span>Made by <a href="/">Milad Beigi</a> · MIT licensed</span>
          <span><a href="https://github.com/miladbeigi/${cur}">${app ? app.name : "Source"} on GitHub</a> · <a href="https://github.com/miladbeigi/${cur}/releases">Releases</a> · <a href="https://github.com/miladbeigi/${cur}/issues">Issues</a></span>
        </div>
      </div>`;
  }
})();
