// The dossier shows one real secret both ways: the plaintext on disk, and the AES-256-GCM file
// penhan wrote for it (xxd of secrets/db.yaml.enc). The terminal replays a captured session
// (penhan v0.7.1, throwaway Vault dev server, a generated SSH key served as github.com/alice.keys).
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);

  /* ---------- the dossier ---------- */
  const SIDES = {
    plain: {
      text: "$ cat secrets/db.yaml\npassword: s3cr3t-0012\n\n\n\n",
      html: '<span class="o">$ cat secrets/db.yaml</span>\n<span class="k">password:</span> <span class="v">s3cr3t-0012</span>\n\n\n\n',
      label: "plaintext · gitignored",
    },
    cipher: {
      text: [
        "$ xxd secrets/db.yaml.enc",
        "00000000: 126b 450d 6b68 a617 32c5 ccff 994f 0737  .kE.kh..2....O.7",
        "00000010: fdbd 9465 acf9 fbc2 db92 cbdc 8249 9223  ...e.........I.#",
        "00000020: 07ca e8d8 4274 c259 fe79 c078 2407 21b5  ....Bt.Y.y.x$.!.",
        "00000030: b013                                     ..",
      ].join("\n"),
      html: null,
      label: "ciphertext · committed",
    },
  };
  SIDES.cipher.html = SIDES.cipher.text.split("\n").map((l, i) => {
    if (i === 0) return `<span class="o">${esc(l)}</span>`;
    const off = l.slice(0, 9), hex = l.slice(9, 50), asc = l.slice(50);
    return `<span class="x">${off}</span><span class="a">${hex}</span><span class="x">${esc(asc)}</span>`;
  }).join("\n");

  const text = $("#dossier-text"), label = $("#dossier-label");
  const tabs = [...document.querySelectorAll(".dossier__tabs button")];
  const GLYPHS = "0123456789abcdef";
  let side = "plain", anim = 0, auto = 0, userPicked = false;

  function show(next, instant) {
    side = next;
    tabs.forEach((t) => t.setAttribute("aria-selected", t.dataset.side === next));
    label.textContent = SIDES[next].label;
    cancelAnimationFrame(anim);
    if (instant || reduced) { text.innerHTML = SIDES[next].html; return; }
    // scramble: every position cycles through hex digits, settling left to right
    const target = SIDES[next].text;
    const len = target.length, start = performance.now(), dur = 750;
    const step = (now) => {
      const k = Math.min((now - start) / dur, 1);
      const settled = Math.floor(k * len);
      let out = "";
      for (let i = 0; i < len; i++) {
        const c = target[i];
        out += i < settled || c === "\n" || c === " " ? c : GLYPHS[(Math.random() * 16) | 0];
      }
      text.textContent = out;
      if (k < 1) anim = requestAnimationFrame(step);
      else text.innerHTML = SIDES[next].html;
    };
    anim = requestAnimationFrame(step);
  }
  tabs.forEach((t) => t.addEventListener("click", () => { userPicked = true; clearInterval(auto); show(t.dataset.side); }));
  show("plain", true);
  if (!reduced) {
    setTimeout(() => {
      if (userPicked) return;
      show("cipher");
      auto = setInterval(() => { if (!userPicked) show(side === "plain" ? "cipher" : "plain"); }, 4200);
    }, 1800);
  }

  /* ---------- the session ---------- */
  const SESSION = [
    { cwd: "project", cmd: "# Create a safe: its own key, config, and backend (here, Vault)" },
    { cwd: "project", cmd: "penhan add myapp --encryption=aes --backend=vault \\\n    --vault-addr=http://127.0.0.1:8201 --vault-token-file=token",
      out: "<span class=\"ok\">✓</span> Created safe myapp\n<span class=\"ok\">✓</span> Generated AES key at myapp/.penhan/keys/aes.key\n<span class=\"ok\">✓</span> Created myapp/penhan.yaml\n<span class=\"ok\">✓</span> Updated .gitignore" },
    { cwd: "project", cmd: "cd myapp && echo 'password: s3cr3t-0012' > secrets/db.yaml" },
    { cwd: "myapp", cmd: "# Encrypt it; only ciphertext is ever committed to git" },
    { cwd: "myapp", cmd: "penhan encrypt", out: "  Encrypted: secrets/db.yaml" },
    { cwd: "myapp", cmd: "git status --short -uall", out: "<span class=\"r\">??</span> ../.gitignore\n<span class=\"r\">??</span> penhan.yaml\n<span class=\"r\">??</span> secrets/db.yaml.enc" },
    { cwd: "myapp", cmd: "# Compare with Vault, then push what changed" },
    { cwd: "myapp", cmd: "penhan check", out: "  <span class=\"y\">new</span>        db\n\n1 secret(s), 1 to push" },
    { cwd: "myapp", cmd: "penhan push", out: "  Pushed (new): db\n\nPush complete: 1 pushed, 0 unchanged" },
    { cwd: "myapp", cmd: "vault kv get -mount=secret -field=password myapp/db", out: "s3cr3t-0012" },
    { cwd: "myapp", cmd: "# Change a value and add a secret: only those two get pushed" },
    { cwd: "myapp", cmd: "penhan encrypt", out: "  Encrypted: secrets/api.yaml\n  Encrypted: secrets/db.yaml" },
    { cwd: "myapp", cmd: "penhan check", out: "  <span class=\"y\">new</span>        api\n  <span class=\"y\">changed</span>    db\n\n2 secret(s), 2 to push" },
    { cwd: "myapp", cmd: "penhan push", out: "  Pushed (new): api\n  Pushed (changed): db\n\nPush complete: 2 pushed, 0 unchanged" },
    { cwd: "myapp", cmd: "penhan check", out: "  unchanged  api\n  unchanged  db\n\n2 secret(s), 0 to push" },
    { cwd: "myapp", cmd: "# Share safe keys with a master key, unlocked by GitHub SSH keys" },
    { cwd: "myapp", cmd: "cd .. && penhan access grant alice",
      out: "<span class=\"ok\">✓</span> Created master key /tmp/penhan.72rZ/project/.penhan/master.key (gitignored)\n<span class=\"ok\">✓</span> Granted alice access with 1 key(s):\n    SHA256:nGrrNmPBSHgnSlxbXtXXNteiOO9s54slPkhCgYU1EFY ssh-ed25519\nCommit .penhan/access.yaml and .penhan/master.age.\nNext: run `penhan wrap` here to wrap the existing safe keys." },
    { cwd: "project", cmd: "penhan wrap && git add -A && git commit -qm 'Add myapp'", out: "<span class=\"ok\">✓</span> wrapped myapp" },
    { cwd: "project", cmd: "# A fresh clone has no keys until you unlock it with your SSH key" },
    { cwd: "project", cmd: "git clone -q . ../laptop && cd ../laptop && penhan unlock",
      out: "<span class=\"ok\">✓</span> Unlocked the master key into /tmp/penhan.72rZ/laptop/.penhan/master.key (gitignored)" },
    { cwd: "laptop", cmd: "cd myapp && penhan decrypt && cat secrets/db.yaml",
      out: "  Decrypted: secrets/api.yaml\n  Decrypted: secrets/db.yaml\npassword: n3w-s3cr3t-0013" },
  ];
  const body = $("#term-body");
  let run = 0;
  async function play() {
    const me = ++run;
    let html = "";
    const alive = () => me === run;
    const paint = (extra = "") => {
      body.innerHTML = html + extra;
      body.scrollTop = body.scrollHeight;
    };
    for (const step of SESSION) {
      if (!alive()) return;
      const prompt = `<span class="d">${step.cwd}</span> $ `;
      const comment = step.cmd.startsWith("#");
      const full = comment ? `<span class="c">${esc(step.cmd)}</span>` : esc(step.cmd);
      if (reduced) {
        html += prompt + full + "\n" + (step.out ? step.out + "\n" : "");
        continue;
      }
      for (let i = 1; i <= step.cmd.length; i++) {
        if (!alive()) return;
        const part = esc(step.cmd.slice(0, i));
        paint(prompt + (comment ? `<span class="c">${part}</span>` : part) + '<span class="cur"></span>');
        await wait(step.cmd[i - 1] === "\n" ? 200 : 18 + Math.random() * 34);
      }
      html += prompt + full + "\n";
      paint();
      await wait(comment ? 260 : 420);
      if (step.out) { html += step.out + "\n"; paint(); await wait(900); }
      if (comment) html += "";
    }
    paint(`<span class="d">myapp</span> $ <span class="cur"></span>`);
  }
  // keep the session scrolled to the latest line, like a terminal
  body.style.overflowY = "hidden";
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); play(); }
  }, { threshold: .35 });
  io.observe(body);
  $("#replay").addEventListener("click", () => play());

  /* ---------- install tabs ---------- */
  const itabs = [...document.querySelectorAll('.install [role="tab"]')];
  for (const t of itabs) {
    t.addEventListener("click", () => {
      for (const x of itabs) {
        x.setAttribute("aria-selected", x === t);
        document.getElementById(x.getAttribute("aria-controls")).hidden = x !== t;
      }
    });
  }
})();
