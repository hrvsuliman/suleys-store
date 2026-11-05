(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const I = window.ICONS, K = window.KIT, esc = K.esc;
  I.paths.edit = '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>';
  I.paths.left = '<path d="m15 6-6 6 6 6"/>';
  I.paths.right = '<path d="m9 6 6 6-6 6"/>';
  const ic = I.icon;

  /* ── Config & storage ──────────────────────────────── */
  const guessRepo = () => {
    const m = location.hostname.match(/^([\w-]+)\.github\.io$/);
    const seg = location.pathname.split("/").filter(Boolean)[0];
    return m && seg && seg !== "admin.html" ? `${m[1]}/${seg}` : "hrvsuliman/suleys-store";
  };
  const mem = {
    get(k) { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v, persist) { try { (persist ? localStorage : sessionStorage).setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (e) {} },
  };

  let cfg = { repo: mem.get("adm.repo") || guessRepo(), token: mem.get("adm.token") || "", branch: "main" };
  let data = null;
  let original = "";
  const pending = new Map(); // repo path -> { blob, url } for files not uploaded yet
  const uploaded = new Map(); // repo path -> local url (keeps previews working until Pages rebuilds)
  let tab = "kits";
  let editing = null; // kit id being edited
  const ui = { iconMode: {} };

  const json = (v) => JSON.stringify(v, (k, x) => (k.startsWith("__") ? undefined : x), 2) + "\n";
  K.setResolver((p) => (/^(https?:|blob:|data:)/.test(p) ? p : pending.get(p)?.url || uploaded.get(p) || p));

  /* ── GitHub API ────────────────────────────────────── */
  const gh = async (path, opts = {}) => {
    const res = await fetch(`https://api.github.com/repos/${cfg.repo}${path ? "/" + path : ""}`, {
      method: opts.method || "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${cfg.token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) {
      let msg = "";
      try { msg = (await res.json()).message; } catch (e) {}
      const err = new Error(msg || res.statusText);
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  };
  const friendly = (e, writing) => {
    if (e.status === 401) return "That token isn't valid or has expired. Create a new one and sign in again.";
    if (e.status === 404) return writing ? "This token can't write to the repo. Give it Contents: Read and write." : "Couldn't find the repo, or the token doesn't have access to it.";
    if (e.status === 403) return writing ? "This token can't write to the repo. Give it Contents: Read and write." : "GitHub refused the request. Check the token's permissions.";
    if (e.status === 409 || e.status === 422) return `GitHub rejected the save (${e.message}). Try publishing again.`;
    return e.message || "Something went wrong. Check your connection and try again.";
  };
  const b64ToText = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));
  const blobToB64 = (blob) =>
    new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result).split(",")[1] || "");
      r.onerror = rej;
      r.readAsDataURL(blob);
    });

  /* ── Data ──────────────────────────────────────────── */
  const normalize = (d) => {
    d.hero ??= {};
    d.hero.banner ??= "";
    d.hero.featured ??= "";
    d.discord ??= { invite: "", username: "", userId: "" };
    d.music ??= { src: "", volume: 0.18, start: 0, end: 0 };
    for (const k of ["products", "faq", "reviews", "perks", "payments"]) if (!Array.isArray(d[k])) d[k] = [];
    d.products.forEach(fixKit);
    return d;
  };
  const fixKit = (p) => {
    p.features ??= []; p.includes ??= []; p.gallery ??= []; p.options ??= []; p.stickers ??= [];
    p.colors ??= ["#60a5fa", "#6366f1"];
    p.icon ??= "box";
    for (const k of ["iconImage", "cover", "video", "badge", "category", "short", "description"]) p[k] ??= "";
    p.robux ??= 0; p.oldRobux ??= null;
    return p;
  };
  const slug = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-").slice(0, 48) || "kit";
  const uniqueId = (base, self) => {
    let id = base, n = 2;
    while (data.products.some((p) => p.id === id && p !== self)) id = `${base}-${n++}`;
    return id;
  };
  const kit = () => data.products.find((p) => p.id === editing);

  const isDirty = () => json(data) !== original;
  const markDirty = () => {
    const d = isDirty();
    $("#publishBtn").disabled = !d;
    const st = $("#status");
    st.textContent = d ? "Unpublished changes" : "All changes published";
    st.classList.toggle("dirty", d);
  };
  addEventListener("beforeunload", (e) => { if (data && isDirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ── Files ─────────────────────────────────────────── */
  const MAX_BYTES = 95 * 1024 * 1024;
  const extOf = (f) => (f.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const processImage = async (file, max, keepAlpha) => {
    if (/image\/(gif|svg)/.test(file.type)) return { blob: file, ext: extOf(file) };
    let bmp;
    try { bmp = await createImageBitmap(file); } catch (e) { return { blob: file, ext: extOf(file) }; }
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 350 * 1024) return { blob: file, ext: extOf(file) };
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const webp = await new Promise((r) => c.toBlob(r, "image/webp", 0.86));
    if (webp && webp.type === "image/webp") return { blob: webp, ext: "webp" };
    const fallback = await new Promise((r) => c.toBlob(r, keepAlpha ? "image/png" : "image/jpeg", 0.88));
    return { blob: fallback, ext: keepAlpha ? "png" : "jpg" };
  };
  const addFile = (blob, ext, prefix) => {
    const path = `media/${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}.${ext}`;
    pending.set(path, { blob, url: URL.createObjectURL(blob) });
    return path;
  };
  // kind: "image" | "video" | "image|video"
  const takeFiles = async (files, kind, opts) => {
    const out = [];
    for (const f of files) {
      const isVid = f.type.startsWith("video/");
      const isImg = f.type.startsWith("image/");
      const isAud = f.type.startsWith("audio/");
      if (isAud && kind.includes("audio")) {
        if (f.size > MAX_BYTES) { toast(`${f.name} is over 95 MB.`); continue; }
        if (f.size > 8 * 1024 * 1024) toast("That's a big audio file. It works, but a shorter or smaller file loads faster.");
        out.push({ path: addFile(f, extOf(f) || "mp3", opts.prefix), type: "audio" });
        continue;
      }
      if ((isVid && !kind.includes("video")) || (isImg && !kind.includes("image")) || (!isVid && !isImg)) {
        toast(`${f.name} isn't a supported ${kind.replace("|", " or ")} file.`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        toast(`${f.name} is over 95 MB. Upload it to YouTube and paste the link instead.`);
        continue;
      }
      if (isVid) {
        if (f.size > 40 * 1024 * 1024) toast("Big video. It'll work, but a YouTube link loads faster for visitors.");
        out.push({ path: addFile(f, extOf(f) === "mov" ? "mov" : extOf(f), opts.prefix), type: "video" });
      } else {
        const { blob, ext } = await processImage(f, opts.max || 1920, opts.alpha);
        out.push({ path: addFile(blob, ext, opts.prefix), type: "image" });
      }
    }
    return out;
  };
  const dropZone = (id, label, accept, multiple) => `
    <label class="drop" data-drop="${id}">
      ${ic(accept.includes("video") && !accept.includes("image") ? "film" : "image")}
      <span><b>Choose ${multiple ? "files" : "a file"}</b> or drop ${multiple ? "them" : "it"} here</span>
      <span class="hint">${esc(label)}</span>
      <input type="file" accept="${accept}" ${multiple ? "multiple" : ""} data-file="${id}" />
    </label>`;
  const wireDrops = (handlers) => {
    $$("[data-file]", $("#view")).forEach((input) => input.addEventListener("change", () => { const h = handlers[input.dataset.file]; if (h && input.files.length) h([...input.files]); }));
    $$("[data-drop]", $("#view")).forEach((z) => {
      z.addEventListener("dragover", (e) => { e.preventDefault(); z.classList.add("over"); });
      z.addEventListener("dragleave", () => z.classList.remove("over"));
      z.addEventListener("drop", (e) => {
        e.preventDefault();
        z.classList.remove("over");
        const h = handlers[z.dataset.drop];
        if (h && e.dataTransfer.files.length) h([...e.dataTransfer.files]);
      });
    });
  };
  const mediaPreview = (path, { square = false, rm } = {}) => {
    const id = K.ytId(path);
    const src = pending.get(path)?.url || uploaded.get(path) || path;
    const body = id
      ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}" title="YouTube preview" allowfullscreen></iframe>`
      : /\.(mp4|webm|mov)$/i.test(path)
        ? `<video src="${esc(src)}" controls muted playsinline></video>`
        : `<img src="${esc(src)}" alt="" />`;
    return `<div class="media-one${square ? " square" : ""}">${body}<button class="remove" type="button" data-rm="${rm}" aria-label="Remove">${ic("close")}</button></div>${pending.has(path) ? '<span class="pending-tag">Uploads when you publish</span>' : ""}`;
  };

  /* ── Toast & modal ─────────────────────────────────── */
  let toastT;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 3600);
  };
  const modal = (html) => { $("#modalCard").innerHTML = html; $("#modal").hidden = !html; };

  /* ── Connect ───────────────────────────────────────── */
  const siteUrl = () => {
    const [o, r] = cfg.repo.split("/");
    return `https://${o.toLowerCase()}.github.io/${r}/`;
  };
  const load = async () => {
    const info = await gh("");
    cfg.branch = info.default_branch || "main";
    const file = await gh(`contents/data/store.json?ref=${encodeURIComponent(cfg.branch)}`);
    data = normalize(JSON.parse(b64ToText(file.content)));
    original = json(data);
  };
  const showEditor = () => {
    $("#connect").hidden = true;
    $("#shell").hidden = false;
    $("#adminBrand").textContent = `${data.name || "Store"} Admin`;
    $("#viewSite").href = siteUrl();
    render();
    markDirty();
  };
  const showConnect = (err) => {
    $("#shell").hidden = true;
    $("#connect").hidden = false;
    const f = $("#connectForm");
    f.repo.value = cfg.repo;
    f.token.value = "";
    $("#connectError").hidden = !err;
    $("#connectError").textContent = err || "";
  };
  $("#connectForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = $("#connectBtn");
    cfg.repo = f.repo.value.trim().replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").replace(/\/$/, "");
    cfg.token = f.token.value.trim();
    btn.disabled = true;
    btn.textContent = "Signing in…";
    try {
      await load();
      mem.set("adm.repo", cfg.repo, true);
      mem.set("adm.token", cfg.token, f.remember.checked);
      showEditor();
    } catch (err) {
      $("#connectError").textContent = friendly(err, false);
      $("#connectError").hidden = false;
    } finally {
      btn.disabled = false;
      btn.textContent = "Sign in";
    }
  });

  /* ── Top bar ───────────────────────────────────────── */
  $("#tabsbar").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    tab = b.dataset.tab;
    editing = null;
    $$("button", $("#tabsbar")).forEach((x) => x.setAttribute("aria-selected", x === b));
    render();
    scrollTo(0, 0);
  });
  $("#menuBtn").addEventListener("click", (e) => { e.stopPropagation(); $("#menu").hidden = !$("#menu").hidden; });
  document.addEventListener("click", () => ($("#menu").hidden = true));
  $("#menu").addEventListener("click", async (e) => {
    const act = e.target.closest("button")?.dataset.act;
    if (act === "download") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([json(data)], { type: "application/json" }));
      a.download = "store.json";
      a.click();
    }
    if (act === "discard" && confirm("Throw away everything you haven't published?")) {
      pending.clear();
      try { await load(); editing = null; render(); markDirty(); toast("Changes discarded."); } catch (err) { toast(friendly(err)); }
    }
    if (act === "signout") {
      if (isDirty() && !confirm("You have unpublished changes. Sign out anyway?")) return;
      mem.del("adm.token");
      cfg.token = "";
      data = null;
      showConnect();
    }
  });

  /* ── Rendering ─────────────────────────────────────── */
  const view = () => $("#view");
  const render = () => {
    const v = view();
    v.oninput = v.onchange = v.onclick = null;
    if (tab === "kits") editing ? renderKitEditor() : renderKitList();
    if (tab === "store") renderStore();
    if (tab === "faq") renderRows("faq", "FAQ", "Questions shown at the bottom of the site.", [{ k: "q", label: "Question" }, { k: "a", label: "Answer", area: true }], { q: "", a: "" });
    if (tab === "reviews") renderRows("reviews", "Vouches", "Real reviews from buyers. The section is hidden on the site while this list is empty.", [{ k: "name", label: "Name" }, { k: "kit", label: "Kit (optional)" }, { k: "text", label: "Review", area: true }], { name: "", kit: "", text: "" });
    if (tab === "perks") renderRows("perks", "Perks", "The “Why buy here” cards.", [{ k: "icon", label: "Icon", icon: true }, { k: "title", label: "Title" }, { k: "text", label: "Text", area: true }], { icon: "star", title: "", text: "" });
  };

  /* Kit list */
  const resolve = (path) => pending.get(path)?.url || uploaded.get(path) || path;
  const thumb = (p) => `<div class="kit-thumb" style="${K.vars(p)}">${p.cover ? `<img src="${esc(resolve(p.cover))}" alt="" />` : K.appIcon(p)}</div>`;
  const renderKitList = () => {
    const ps = data.products;
    view().innerHTML = `
      <div class="view-head">
        <div><h1>Kits</h1><p>${ps.length} kit${ps.length === 1 ? "" : "s"}. They show on the site in this order.</p></div>
        <button class="btn btn-primary btn-sm" data-add>${ic("plus")} Add kit</button>
      </div>
      ${ps.length ? `<div class="kit-list">${ps.map((p, i) => `
        <div class="kit-row" data-id="${esc(p.id)}">
          ${thumb(p)}
          <div><b>${esc(p.name || "Untitled kit")}</b><small>${esc([p.category, p.badge].filter(Boolean).join(" · ") || "No category")}</small></div>
          <span class="price">${K.priceHTML(p)}</span>
          <div class="row-actions">
            <button class="mini" data-up="${i}" aria-label="Move up" ${i ? "" : "disabled"}>${ic("up")}</button>
            <button class="mini" data-down="${i}" aria-label="Move down" ${i < ps.length - 1 ? "" : "disabled"}>${ic("down")}</button>
            <button class="mini" data-edit="${esc(p.id)}" aria-label="Edit">${ic("edit")}</button>
            <button class="mini danger" data-del="${esc(p.id)}" aria-label="Delete">${ic("trash")}</button>
          </div>
        </div>`).join("")}</div>` : `<div class="empty-state">No kits yet. Add your first one.</div>`}`;
    view().onclick = (e) => {
      const t = e.target.closest("button, .kit-row");
      if (!t) return;
      const ps = data.products;
      if (t.dataset.add !== undefined) {
        const p = fixKit({ id: uniqueId("new-kit"), name: "", category: ps[0]?.category || "Systems", robux: 0, __new: true, colors: ["#60a5fa", "#6366f1"], icon: "box" });
        ps.push(p);
        editing = p.id;
        render();
        scrollTo(0, 0);
        $('[data-k="name"]')?.focus();
        return markDirty();
      }
      if (t.dataset.up) { const i = +t.dataset.up; [ps[i - 1], ps[i]] = [ps[i], ps[i - 1]]; render(); return markDirty(); }
      if (t.dataset.down) { const i = +t.dataset.down; [ps[i + 1], ps[i]] = [ps[i], ps[i + 1]]; render(); return markDirty(); }
      if (t.dataset.del) {
        const p = ps.find((x) => x.id === t.dataset.del);
        if (!confirm(`Delete “${p.name || "this kit"}”? It disappears from the site when you publish.`)) return;
        data.products = ps.filter((x) => x !== p);
        if (data.hero.featured === p.id) data.hero.featured = data.products[0]?.id || "";
        render();
        return markDirty();
      }
      const id = t.dataset.edit || t.dataset.id;
      if (id) { editing = id; render(); scrollTo(0, 0); }
    };
  };

  /* Kit editor */
  const SWATCHES = [["#34d399", "#3b82f6"], ["#fb7185", "#a855f7"], ["#a78bfa", "#60a5fa"], ["#fbbf24", "#f472b6"], ["#22d3ee", "#6366f1"], ["#f59e0b", "#ef4444"], ["#4ade80", "#14b8a6"], ["#94a3b8", "#475569"], ["#f472b6", "#ef4444"], ["#1d1d1f", "#48484a"]];
  const renderKitEditor = () => {
    const p = kit();
    if (!p) { editing = null; return render(); }
    const mode = ui.iconMode[p.id] || (p.iconImage ? "upload" : "builtin");
    const cats = [...new Set(data.products.map((x) => x.category).filter(Boolean))];
    view().innerHTML = `
      <button class="back" data-back>${ic("left")} All kits</button>
      <div class="view-head"><div><h1>${esc(p.name || "New kit")}</h1><p>Changes show in the preview right away. Press Publish to put them on the site.</p></div></div>
      <div class="editor">
        <div>
          <section class="group">
            <h2>Details</h2>
            <label class="field"><span>Name</span><input data-k="name" value="${esc(p.name)}" placeholder="e.g. Football Engine" /></label>
            <div class="three">
              <label class="field"><span>Price (Robux)</span><input data-k="robux" type="number" min="0" step="1" inputmode="numeric" value="${esc(p.robux ?? "")}" /></label>
              <label class="field"><span>Old price <span class="hint">(optional, shows crossed out)</span></span><input data-k="oldRobux" type="number" min="0" step="1" inputmode="numeric" value="${esc(p.oldRobux ?? "")}" /></label>
              <label class="field"><span>Label <span class="hint">(optional)</span></span><input data-k="badge" list="badges" value="${esc(p.badge)}" placeholder="New, Best seller…" /></label>
            </div>
            <label class="field"><span>Other ways to pay <span class="hint">(one per line, like “Gamepass = 6000” or “Cash = $30”)</span></span><textarea data-k="options" rows="3">${esc((p.options || []).map((o) => `${o.label} = ${o.price}`).join("\n"))}</textarea></label>
            <label class="field"><span>Category</span><input data-k="category" list="cats" value="${esc(p.category)}" placeholder="Systems, UI, Maps…" /></label>
            <datalist id="cats">${cats.map((c) => `<option value="${esc(c)}">`).join("")}</datalist>
            <datalist id="badges"><option value="New"><option value="Best seller"><option value="Popular"><option value="Sale"><option value="Limited"></datalist>
            <label class="field"><span>Short description <span class="hint">(on the card, one line)</span></span><input data-k="short" maxlength="140" value="${esc(p.short)}" /></label>
            <label class="field"><span>Full description</span><textarea data-k="description" rows="5">${esc(p.description)}</textarea></label>
            <div class="two">
              <label class="field"><span>Features <span class="hint">(one per line)</span></span><textarea data-k="features" rows="6">${esc(p.features.join("\n"))}</textarea></label>
              <label class="field"><span>What you get <span class="hint">(one per line)</span></span><textarea data-k="includes" rows="6">${esc(p.includes.join("\n"))}</textarea></label>
            </div>
          </section>

          <section class="group">
            <h2>Icon</h2>
            <div class="seg-mini"><button type="button" data-mode="builtin" aria-pressed="${mode === "builtin"}">My icons</button><button type="button" data-mode="upload" aria-pressed="${mode === "upload"}">Upload image</button></div>
            ${mode === "builtin" ? `
              <div class="icon-grid">${I.builtIn.map((k) => `<button type="button" data-icon-pick="${k}" aria-pressed="${I.resolve(p.icon) === k && !p.iconImage}" aria-label="${k}">${I.sticker(k)}</button>`).join("")}</div>
              <div class="colors">
                <span>Card colours</span><label>From <input type="color" data-color="0" value="${esc(p.colors[0])}" /></label>
                <label>To <input type="color" data-color="1" value="${esc(p.colors[1])}" /></label>
                <div class="swatches">${SWATCHES.map((s) => `<button type="button" data-sw="${s.join(",")}" style="--a:${s[0]};--b:${s[1]}" aria-label="Colour preset"></button>`).join("")}</div>
              </div>` : p.iconImage ? mediaPreview(p.iconImage, { square: true, rm: "iconImage" }) : dropZone("icon", "Square image, at least 512×512. PNG with transparency works.", "image/*", false)}
          </section>

          <section class="group">
            <h2>Stickers</h2>
            <p class="group-sub">Floating icons on the kit art (shown when there's no cover image). The first one you pick is the big one. Up to 4.</p>
            ${stickerGrid(p.stickers, "stk")}
          </section>

          <section class="group">
            <h2>Cover image</h2>
            <p class="group-sub">Shown on the kit card and first in the kit's gallery. Wide images (16:9) look best.</p>
            ${p.cover ? mediaPreview(p.cover, { rm: "cover" }) : dropZone("cover", "JPG, PNG or WebP. Big images are resized automatically.", "image/*", false)}
          </section>

          <section class="group">
            <h2>Gallery</h2>
            <p class="group-sub">Extra screenshots shown when someone opens the kit.</p>
            ${p.gallery.length ? `<div class="gallery">${p.gallery.map((g, i) => `
              <div class="tile"><img src="${esc(resolve(g))}" alt="" />
                <button class="remove" type="button" data-gal-rm="${i}" aria-label="Remove">${ic("close")}</button>
                <div class="moves">${i ? `<button type="button" data-gal-l="${i}" aria-label="Move left">‹</button>` : ""}${i < p.gallery.length - 1 ? `<button type="button" data-gal-r="${i}" aria-label="Move right">›</button>` : ""}</div>
              </div>`).join("")}</div>` : ""}
            ${dropZone("gallery", "Add as many as you like.", "image/*", true)}
          </section>

          <section class="group">
            <h2>Video</h2>
            <p class="group-sub">Plays first when someone opens the kit. A YouTube link loads fastest.</p>
            ${p.video ? mediaPreview(p.video, { rm: "video" }) : `
              <label class="field"><span>YouTube link</span><input data-yt placeholder="https://youtu.be/…" /></label>
              <div class="or">or</div>
              ${dropZone("video", "MP4 or WebM, up to 95 MB.", "video/mp4,video/webm,video/quicktime", false)}`}
          </section>

          <section class="group">
            <h2>Danger zone</h2>
            <div><button class="btn btn-sm btn-secondary" type="button" data-delete style="color:#e30000;box-shadow:inset 0 0 0 1px #e30000">Delete this kit</button></div>
          </section>
        </div>
        <aside class="preview"><span class="label">Card preview</span><div id="cardPreview"></div></aside>
      </div>`;
    const preview = () => {
      $("#cardPreview").innerHTML = K.cardHTML(p);
      $("h1", view()).textContent = p.name || "New kit";
    };
    preview();

    view().oninput = (e) => {
      const el = e.target;
      if (el.dataset.k) {
        const k = el.dataset.k;
        let v = el.value;
        if (k === "robux" || k === "oldRobux") v = v === "" ? (k === "robux" ? 0 : null) : Math.max(0, Math.round(+v));
        if (k === "features" || k === "includes") v = v.split("\n").map((s) => s.trim()).filter(Boolean);
        if (k === "options")
          v = v.split("\n").map((line) => {
            const m = line.match(/^\s*(.+?)\s*[=:|]\s*(.+?)\s*$/);
            if (!m) return null;
            const num = m[2].replace(/[,\s]|robux|r\$/gi, "");
            return { label: m[1], price: /^\d+$/.test(num) ? +num : m[2] };
          }).filter(Boolean);
        p[k] = v;
        if (k === "name" && p.__new) {
          const old = p.id;
          p.id = uniqueId(slug(v), p);
          editing = p.id;
          if (ui.iconMode[old]) ui.iconMode[p.id] = ui.iconMode[old];
        }
      }
      if (el.dataset.color) p.colors[+el.dataset.color] = el.value;
      preview();
      markDirty();
    };
    view().onchange = (e) => {
      if (e.target.dataset.yt === undefined) return;
      const v = e.target.value.trim();
      if (!v) return;
      if (!K.ytId(v)) return toast("That doesn't look like a YouTube link.");
      p.video = v;
      renderKitEditor();
      markDirty();
    };
    view().onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const d = b.dataset;
      if (d.back !== undefined) { editing = null; render(); return; }
      if (d.mode) { ui.iconMode[p.id] = d.mode; if (d.mode === "builtin") p.iconImage = ""; renderKitEditor(); markDirty(); return; }
      if (d.iconPick) { p.icon = d.iconPick; p.iconImage = ""; $$("[data-icon-pick]").forEach((x) => x.setAttribute("aria-pressed", x === b)); preview(); markDirty(); return; }
      if (d.sw) { p.colors = d.sw.split(","); $$("[data-color]").forEach((x, i) => (x.value = p.colors[i])); preview(); markDirty(); return; }
      if (d.stk) { toggleSticker(p.stickers, d.stk, 4); const y = scrollY; renderKitEditor(); scrollTo(0, y); markDirty(); return; }
      if (d.rm) { p[d.rm] = ""; renderKitEditor(); markDirty(); return; }
      if (d.galRm) { p.gallery.splice(+d.galRm, 1); renderKitEditor(); markDirty(); return; }
      if (d.galL) { const i = +d.galL; [p.gallery[i - 1], p.gallery[i]] = [p.gallery[i], p.gallery[i - 1]]; renderKitEditor(); markDirty(); return; }
      if (d.galR) { const i = +d.galR; [p.gallery[i + 1], p.gallery[i]] = [p.gallery[i], p.gallery[i + 1]]; renderKitEditor(); markDirty(); return; }
      if (d.delete !== undefined) {
        if (!confirm(`Delete “${p.name || "this kit"}”? It disappears from the site when you publish.`)) return;
        data.products = data.products.filter((x) => x !== p);
        if (data.hero.featured === p.id) data.hero.featured = data.products[0]?.id || "";
        editing = null;
        render();
        markDirty();
      }
    };
    const keepScroll = async (fn) => { const y = scrollY; await fn(); renderKitEditor(); scrollTo(0, y); markDirty(); };
    wireDrops({
      icon: (files) => keepScroll(async () => { const [f] = await takeFiles(files.slice(0, 1), "image", { prefix: "icon", max: 512, alpha: true }); if (f) p.iconImage = f.path; }),
      cover: (files) => keepScroll(async () => { const [f] = await takeFiles(files.slice(0, 1), "image", { prefix: "cover", max: 1920 }); if (f) p.cover = f.path; }),
      gallery: (files) => keepScroll(async () => { (await takeFiles(files, "image", { prefix: "shot", max: 1920 })).forEach((f) => p.gallery.push(f.path)); }),
      video: (files) => keepScroll(async () => { const [f] = await takeFiles(files.slice(0, 1), "video", { prefix: "video" }); if (f) p.video = f.path; }),
    });
  };

  const stickerGrid = (list, attr) =>
    `<div class="sticker-grid">${I.stickerNames.map((n) => { const i = list.indexOf(n); return `<button type="button" data-${attr}="${n}" aria-pressed="${i > -1}" aria-label="${n}">${I.sticker(n)}${i > -1 ? `<span>${i + 1}</span>` : ""}</button>`; }).join("")}</div>`;
  const toggleSticker = (list, n, max) => {
    const i = list.indexOf(n);
    if (i > -1) list.splice(i, 1);
    else if (list.length < max) list.push(n);
    else toast(`Max ${max}. Remove one first.`);
  };

  /* Store & hero */
  const setPath = (obj, path, v) => { const ks = path.split("."); const last = ks.pop(); ks.reduce((o, k) => (o[k] ??= {}), obj)[last] = v; };
  const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);
  const renderStore = () => {
    const d = data;
    const f = (path, label, opts = {}) =>
      `<label class="field"><span>${label}${opts.hint ? ` <span class="hint">${opts.hint}</span>` : ""}</span>${
        opts.area ? `<textarea data-path="${path}" rows="3">${esc(getPath(d, path))}</textarea>` : `<input data-path="${path}" value="${esc(opts.value ?? getPath(d, path) ?? "")}" ${opts.ph ? `placeholder="${esc(opts.ph)}"` : ""} ${opts.list ? 'data-list="1"' : ""} />`
      }</label>`;
    view().innerHTML = `
      <div class="view-head"><div><h1>Hero &amp; store</h1><p>The top of your site, your Discord details and payment methods.</p></div></div>
      <section class="group">
        <h2>Hero</h2>
        ${f("name", "Store name")}
        ${f("tagline", "Headline", { hint: "(the big text at the top)" })}
        ${f("subtitle", "Subtitle", { area: true })}
      </section>
      <section class="group">
        <h2>Floating stickers</h2>
        <p class="group-sub">The icons floating next to the title at the top of the site. Up to 6.</p>
        ${stickerGrid((d.hero.stickers ??= []), "hstk")}
      </section>
      <section class="group">
        <h2>Hero banner</h2>
        <p class="group-sub">A big image or video right under the headline. Leave it empty to hide it.</p>
        ${d.hero.banner ? mediaPreview(d.hero.banner, { rm: "banner" }) : `
          <label class="field"><span>YouTube link</span><input data-yt-banner placeholder="https://youtu.be/…" /></label>
          <div class="or">or</div>
          ${dropZone("banner", "Image (2560 px wide is ideal) or MP4/WebM video, up to 95 MB.", "image/*,video/mp4,video/webm", false)}`}
      </section>
      <section class="group">
        <h2>Background music</h2>
        <p class="group-sub">Plays quietly in the background and fades in once a visitor clicks or taps anywhere. Visitors can turn it off with the button in the top bar. Only use music you have the rights to, because the file ends up in your public repo.</p>
        ${d.music.src ? `
          <div class="music-row">
            <audio id="musicPreview" controls preload="metadata" src="${esc(resolve(d.music.src))}"></audio>
            <button class="remove" type="button" data-rm-music aria-label="Remove music">${ic("close")}</button>
          </div>
          ${pending.has(d.music.src) ? '<span class="pending-tag">Uploads when you publish</span>' : ""}
          <label class="field"><span>Volume <span class="hint" id="volLabel">${Math.round((d.music.volume ?? 0.18) * 100)}%</span></span>
            <input type="range" min="0.03" max="0.6" step="0.01" data-path="music.volume" data-num value="${esc(d.music.volume ?? 0.18)}" /></label>
          <div class="two">
            <label class="field"><span>Loop from <span class="hint">(seconds)</span></span><input type="number" min="0" step="0.5" data-path="music.start" data-num value="${esc(d.music.start || 0)}" /></label>
            <label class="field"><span>Loop until <span class="hint">(seconds, 0 = whole song)</span></span><input type="number" min="0" step="0.5" data-path="music.end" data-num value="${esc(d.music.end || 0)}" /></label>
          </div>
          <div class="music-marks">
            <button class="btn btn-sm btn-ghost" type="button" data-mark="start">Set start to current time</button>
            <button class="btn btn-sm btn-ghost" type="button" data-mark="end">Set end to current time</button>
          </div>`
        : dropZone("music", "MP3, M4A or OGG. Keep it small, under 5 MB is ideal.", "audio/*", false)}
      </section>
      <section class="group">
        <h2>Featured kit</h2>
        <p class="group-sub">The first slide in the “Latest releases” slideshow.</p>
        <label class="field"><span>Kit</span><select data-path="hero.featured">
          <option value="" ${d.hero.featured ? "" : "selected"}>None (hide this section)</option>
          ${d.products.map((p) => `<option value="${esc(p.id)}" ${d.hero.featured === p.id ? "selected" : ""}>${esc(p.name || p.id)}</option>`).join("")}
        </select></label>
      </section>
      <section class="group">
        <h2>Discord</h2>
        ${f("discord.invite", "Server invite link", { ph: "https://discord.gg/…" })}
        <div class="two">
          ${f("discord.username", "Your username")}
          ${f("discord.userId", "Your user ID", { hint: "(optional, makes “DM me” open your profile)" })}
        </div>
      </section>
      <section class="group">
        <h2>Payments</h2>
        ${f("payments", "Accepted payment methods", { hint: "(separate with commas)", value: d.payments.join(", "), list: true })}
      </section>`;
    view().oninput = (e) => {
      const el = e.target;
      if (!el.dataset.path) return;
      const val = el.dataset.list ? el.value.split(",").map((s) => s.trim()).filter(Boolean) : el.dataset.num !== undefined ? Math.max(0, parseFloat(el.value) || 0) : el.value;
      setPath(d, el.dataset.path, val);
      if (el.dataset.path === "music.volume") { $("#volLabel").textContent = `${Math.round(val * 100)}%`; const a = $("#musicPreview"); if (a) a.volume = val; }
      if (el.dataset.path === "name") $("#adminBrand").textContent = `${el.value || "Store"} Admin`;
      markDirty();
    };
    view().onchange = (e) => {
      if (e.target.dataset.path === "hero.featured") { d.hero.featured = e.target.value; markDirty(); }
      if (e.target.dataset.ytBanner !== undefined) {
        const v = e.target.value.trim();
        if (!v) return;
        if (!K.ytId(v)) return toast("That doesn't look like a YouTube link.");
        d.hero.banner = v;
        renderStore();
        markDirty();
      }
    };
    view().onclick = (e) => {
      const s = e.target.closest("[data-hstk]");
      if (s) { toggleSticker(d.hero.stickers, s.dataset.hstk, 6); const y = scrollY; renderStore(); scrollTo(0, y); markDirty(); return; }
      if (e.target.closest("[data-rm-music]")) { d.music.src = ""; const y = scrollY; renderStore(); scrollTo(0, y); markDirty(); return; }
      const mk = e.target.closest("[data-mark]");
      if (mk) {
        const a = $("#musicPreview");
        const t = Math.round((a?.currentTime || 0) * 2) / 2;
        d.music[mk.dataset.mark] = t;
        $(`[data-path="music.${mk.dataset.mark}"]`).value = t;
        toast(`Loop ${mk.dataset.mark} set to ${t}s.`);
        markDirty();
        return;
      }
      const b = e.target.closest("[data-rm]");
      if (b) { d.hero.banner = ""; renderStore(); markDirty(); }
    };
    wireDrops({
      music: async (files) => {
        const y = scrollY;
        const [f] = await takeFiles(files.slice(0, 1), "audio", { prefix: "music" });
        if (f) d.music.src = f.path;
        renderStore();
        scrollTo(0, y);
        markDirty();
      },
      banner: async (files) => {
        const y = scrollY;
        const [f] = await takeFiles(files.slice(0, 1), "image|video", { prefix: "banner", max: 2560 });
        if (f) d.hero.banner = f.path;
        renderStore();
        scrollTo(0, y);
        markDirty();
      },
    });
  };

  /* Repeating rows: FAQ, vouches, perks */
  const renderRows = (key, title, sub, fields, blank) => {
    const list = data[key];
    view().innerHTML = `
      <div class="view-head"><div><h1>${title}</h1><p>${sub}</p></div><button class="btn btn-primary btn-sm" data-add>${ic("plus")} Add</button></div>
      <div class="rows">${list.length ? list.map((r, i) => `
        <div class="row">
          <div class="row-top"><span>#${i + 1}</span><div class="row-actions">
            <button class="mini" data-up="${i}" aria-label="Move up" ${i ? "" : "disabled"}>${ic("up")}</button>
            <button class="mini" data-down="${i}" aria-label="Move down" ${i < list.length - 1 ? "" : "disabled"}>${ic("down")}</button>
            <button class="mini danger" data-del="${i}" aria-label="Delete">${ic("trash")}</button>
          </div></div>
          ${fields.map((f) => `<label class="field"><span>${f.label}</span>${
            f.icon ? `<div class="sticker-grid small">${I.stickerNames.map((n) => `<button type="button" data-ri="${i}" data-rk="${f.k}" data-rv="${n}" aria-pressed="${I.resolve(r[f.k]) === n}" aria-label="${n}">${I.sticker(n)}</button>`).join("")}</div>`
            : f.area ? `<textarea data-i="${i}" data-f="${f.k}" rows="3">${esc(r[f.k])}</textarea>`
            : `<input data-i="${i}" data-f="${f.k}" value="${esc(r[f.k])}" />`}</label>`).join("")}
        </div>`).join("") : `<div class="empty-state">Nothing here yet.</div>`}</div>`;
    view().oninput = view().onchange = (e) => {
      const el = e.target;
      if (el.dataset.f === undefined) return;
      list[+el.dataset.i][el.dataset.f] = el.value;
      markDirty();
    };
    view().onclick = (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.add !== undefined) { list.push({ ...blank }); render(); markDirty(); $$(".row").at(-1)?.scrollIntoView({ block: "center" }); $$(".row").at(-1)?.querySelector("input,textarea")?.focus(); return; }
      if (b.dataset.rv) { list[+b.dataset.ri][b.dataset.rk] = b.dataset.rv; const y = scrollY; render(); scrollTo(0, y); markDirty(); return; }
      if (b.dataset.up) { const i = +b.dataset.up; [list[i - 1], list[i]] = [list[i], list[i - 1]]; }
      else if (b.dataset.down) { const i = +b.dataset.down; [list[i + 1], list[i]] = [list[i], list[i + 1]]; }
      else if (b.dataset.del) { if (!confirm("Delete this item?")) return; list.splice(+b.dataset.del, 1); }
      else return;
      render();
      markDirty();
    };
  };

  /* ── Publish (one commit via the Git Data API) ─────── */
  const validate = () => {
    const bad = data.products.find((p) => !p.name.trim());
    if (bad) return "One of your kits has no name. Give it a name or delete it.";
    const noPrice = data.products.find((p) => !(p.robux > 0));
    if (noPrice) return `“${noPrice.name}” has no Robux price.`;
    return null;
  };
  $("#publishBtn").addEventListener("click", async () => {
    const problem = validate();
    if (problem) return toast(problem);
    data.products.forEach((p) => delete p.__new);
    const text = json(data);
    const used = new Set(text.match(/media\/[^"\\]+/g) || []);
    const files = [...pending].filter(([path]) => used.has(path));
    const steps = files.length + 4;
    let done = 0;
    const progress = (label) => {
      done++;
      modal(`<div class="spinner"></div><h2>Publishing…</h2><p>${esc(label)}</p><div class="bar"><span style="width:${Math.round((done / steps) * 100)}%"></span></div>`);
    };
    try {
      progress("Checking the repo");
      const ref = await gh(`git/ref/heads/${encodeURIComponent(cfg.branch)}`);
      const head = await gh(`git/commits/${ref.object.sha}`);
      const tree = [];
      for (const [path, f] of files) {
        progress(`Uploading ${path.split("/").pop()} (${(f.blob.size / 1048576).toFixed(1)} MB)`);
        const blob = await gh("git/blobs", { method: "POST", body: { content: await blobToB64(f.blob), encoding: "base64" } });
        tree.push({ path, mode: "100644", type: "blob", sha: blob.sha });
      }
      progress("Saving your store");
      const dataBlob = await gh("git/blobs", { method: "POST", body: { content: text, encoding: "utf-8" } });
      tree.push({ path: "data/store.json", mode: "100644", type: "blob", sha: dataBlob.sha });
      const newTree = await gh("git/trees", { method: "POST", body: { base_tree: head.tree.sha, tree } });
      progress("Publishing");
      const commit = await gh("git/commits", { method: "POST", body: { message: `Update store from admin${files.length ? ` (+${files.length} file${files.length > 1 ? "s" : ""})` : ""}`, tree: newTree.sha, parents: [ref.object.sha] } });
      await gh(`git/refs/heads/${encodeURIComponent(cfg.branch)}`, { method: "PATCH", body: { sha: commit.sha } });

      files.forEach(([path, f]) => uploaded.set(path, f.url));
      pending.clear();
      original = text;
      markDirty();
      modal(`<div class="done-mark">${ic("check")}</div><h2>Published</h2><p>Your site updates in about a minute. Refresh it if you don't see the changes yet.</p><div style="display:flex;gap:10px;justify-content:center"><a class="btn btn-primary btn-sm" href="${esc(siteUrl())}" target="_blank" rel="noopener">View site</a><button class="btn btn-sm btn-secondary" data-close-modal>Keep editing</button></div>`);
    } catch (err) {
      console.error(err);
      modal(`<h2>Couldn't publish</h2><p>${esc(friendly(err, true))}</p><p class="muted" style="font-size:13px">Nothing was lost. Your edits are still here.</p><button class="btn btn-sm btn-primary" data-close-modal>OK</button>`);
    }
  });
  $("#modal").addEventListener("click", (e) => { if (e.target.closest("[data-close-modal]")) modal(""); });

  /* ── Start ─────────────────────────────────────────── */
  (async () => {
    if (!cfg.token) return showConnect();
    try { await load(); showEditor(); } catch (err) { showConnect(friendly(err, false)); }
  })();
})();
