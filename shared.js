// Rendering helpers shared by the shop (app.js) and the admin page (admin.js).
window.KIT = (() => {
  const I = window.ICONS;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const fmt = (n) => Number(n || 0).toLocaleString("en-US");

  // src() lets the admin page swap repo paths for local previews of files not yet uploaded.
  let src = (path) => path;
  const setResolver = (fn) => (src = fn);

  const priceHTML = (p) =>
    `<span class="rbx-price">${I.robux}<span>${fmt(p.robux)}</span></span>` +
    (p.oldRobux ? `<s class="rbx-old">${fmt(p.oldRobux)}</s>` : "");
  const priceText = (p) => `${fmt(p.robux)} Robux`;
  // Extra ways to pay, e.g. [{label:"Gamepass", price:6000}, {label:"Cash", price:"$30"}]
  const optPrice = (v) => (typeof v === "number" ? `<span class="rbx-price">${I.robux}<span>${fmt(v)}</span></span>` : esc(v));
  const optionsHTML = (p) =>
    p.options?.length
      ? `<ul class="pay-opts"><li><span>Robux</span>${optPrice(p.robux)}</li>${p.options.map((o) => `<li><span>${esc(o.label)}</span>${optPrice(o.price)}</li>`).join("")}</ul>`
      : "";

  const vars = (p) => {
    const c = p.colors || ["#a1a1a6", "#6e6e73"];
    return `--c1:${esc(c[0])};--c2:${esc(c[1])}`;
  };
  // Kit icon: an uploaded image, or one of Suley's icons.
  const appIcon = (p) =>
    p.iconImage
      ? `<div class="app app-img"><img src="${esc(src(p.iconImage))}" alt="" loading="lazy" /></div>`
      : `<div class="app">${I.sticker(p.icon) || I.sticker((p.stickers || [])[0]) || I.sticker("podium")}</div>`;
  // Floating sticker scene: first sticker big in the middle, the rest orbit around it.
  const scene = (p) => {
    const s = (p.stickers || []).map(I.resolve).filter(Boolean).slice(0, 4);
    if (!s.length) return appIcon(p);
    return `<div class="scene">${s.map((n, i) => `<span class="fl fl${i}">${I.sticker(n)}</span>`).join("")}</div>`;
  };
  const coverOrIcon = (p) => (p.cover ? `<img class="cover" src="${esc(src(p.cover))}" alt="${esc(p.name)}" loading="lazy" />` : scene(p));

  const ytId = (url) => (String(url || "").match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/)([\w-]{11})/) || [])[1] || null;

  // Ordered media for a kit: video first, then cover, then gallery images.
  const media = (p) => {
    const out = [];
    if (p.video) {
      const id = ytId(p.video);
      out.push(id ? { type: "youtube", id } : { type: "video", src: p.video });
    }
    if (p.cover) out.push({ type: "image", src: p.cover });
    (p.gallery || []).forEach((g) => g && out.push({ type: "image", src: g }));
    return out;
  };
  const mediaHTML = (m, p, autoplay = false) => {
    if (m.type === "youtube")
      return `<iframe src="https://www.youtube-nocookie.com/embed/${esc(m.id)}?rel=0&modestbranding=1${autoplay ? "&autoplay=1&mute=1" : ""}" title="${esc(p.name)} video" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>`;
    if (m.type === "video") return `<video src="${esc(src(m.src))}" controls playsinline preload="metadata"${autoplay ? " autoplay muted" : ""}></video>`;
    return `<img src="${esc(src(m.src))}" alt="${esc(p.name)}" />`;
  };
  const thumbHTML = (m, p) => {
    if (m.type === "youtube") return `<img src="https://i.ytimg.com/vi/${esc(m.id)}/mqdefault.jpg" alt="" /><span class="thumb-play">${I.icon("play")}</span>`;
    if (m.type === "video") return `<video src="${esc(src(m.src))}#t=0.5" muted preload="metadata"></video><span class="thumb-play">${I.icon("play")}</span>`;
    return `<img src="${esc(src(m.src))}" alt="" />`;
  };

  // Payment tags shown on each card, like the framework tags on FiveM stores.
  const tagKind = (label) => (/game ?pass/i.test(label) ? "gp" : /cash|usd|\$|€|paypal/i.test(label) ? "cash" : "other");
  const tagsHTML = (p) =>
    `<span class="tag tag-rbx">Robux</span>` + (p.options || []).map((o) => `<span class="tag tag-${tagKind(o.label)}">${esc(o.label)}</span>`).join("");
  // Small line under the price: sale info or the other prices.
  const altLine = (p) => {
    if (p.oldRobux) return `<s>${fmt(p.oldRobux)}</s> on sale right now`;
    const bits = (p.options || []).map((o) => (typeof o.price === "number" ? `${fmt(o.price)} via ${esc(o.label.toLowerCase())}` : `${esc(o.price)} ${esc(o.label.toLowerCase())}`));
    return bits.length ? `or ${bits.join(" · ")}` : esc(p.category || "");
  };

  const cardHTML = (p, i = 0) => `
    <article class="card spot reveal" tabindex="0" role="button" aria-label="${esc(p.name)}, ${esc(priceText(p))}" data-id="${esc(p.id)}" style="--d:${(i % 4) * 0.07}s;view-transition-name:kit-${esc(p.id)}">
      <div class="card-art${p.cover ? " has-cover" : ""}" style="${vars(p)}">${coverOrIcon(p)}${p.badge ? `<span class="card-badge">${esc(p.badge)}</span>` : ""}${p.video ? `<span class="has-video">${I.icon("play")} Video</span>` : ""}</div>
      <div class="card-tags">${tagsHTML(p)}</div>
      <div class="card-body">
        <h3>${esc(p.name)}</h3>
        <div class="card-price">${I.robux}<b>${fmt(p.robux)}</b></div>
        <p class="card-alt">${altLine(p)}</p>
      </div>
    </article>`;

  return { esc, fmt, priceHTML, priceText, optionsHTML, tagsHTML, vars, appIcon, scene, coverOrIcon, ytId, media, mediaHTML, thumbHTML, cardHTML, setResolver };
})();
