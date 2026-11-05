(() => {
  "use strict";
  const S = window.SHOP;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);

  /* ── Icons ─────────────────────────────────────────── */
  const P = {
    box: '<path d="m12 2.8 8.5 4.7v9L12 21.2 3.5 16.5v-9z"/><path d="m3.8 7.6 8.2 4.6 8.2-4.6M12 12.2v9"/>',
    ball: '<circle cx="12" cy="12" r="9"/><path d="m12 7.5 3.8 2.8-1.5 4.4H9.7l-1.5-4.4z"/><path d="M12 3v4.5M15.8 10.3l4.3-1.4M14.3 14.7l2.6 3.7M9.7 14.7l-2.6 3.7M8.2 10.3 3.9 8.9"/>',
    sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="m13 19 6-6M16 16l4 4M19 21l2-2"/>',
    sparkles: '<path d="m12 3 1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12.5 9 5 9-5"/><path d="m3 16.5 9 5 9-5"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.7 3.1 2.5 3.5 5.2"/>',
    building: '<path d="M4 21V8l6-4v17M10 21V10l10 4v7M2 21h20M7 10v.01M7 14v.01M7 17.5v.01M14 15v.01M17 16v.01"/>',
    map: '<path d="M9 4 3 6.5V20l6-2.5 6 2.5 6-2.5V4l-6 2.5z"/><path d="M9 4v13.5M15 6.5V20"/>',
    shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"/><path d="m9 12 2 2 4-4"/>',
    code: '<path d="m8 8-5 4 5 4M16 8l5 4-5 4M14 4l-4 16"/>',
    bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2h14"/><path d="M8 7h8"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.1A8.5 8.5 0 1 1 21 12z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
  };
  const DISCORD =
    '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.6 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1 0-.12l.37-.3a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01l.37.3a.08.08 0 0 1 0 .12c-.6.35-1.22.65-1.88.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/></svg>';
  const icon = (k) => `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k] || P.box}</svg>`;

  /* ── Text bindings & links ─────────────────────────── */
  document.title = `${S.name} · Roblox Kits`;
  $$("[data-bind]").forEach((el) => { const v = get(S, el.dataset.bind); if (v != null) el.textContent = v; });
  $("#year").textContent = new Date().getFullYear();
  const invite = S.discord.invite;
  const dmUrl = S.discord.userId ? `https://discord.com/users/${S.discord.userId}` : invite;
  $$("[data-discord]").forEach((a) => (a.href = invite));
  $$("[data-dm]").forEach((a) => (a.href = dmUrl));

  /* ── Toast + clipboard ─────────────────────────────── */
  let toastT;
  const toast = (msg) => {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2800);
  };
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand("copy"); } catch (e2) {}
      ta.remove(); return ok;
    }
  };
  // With no user ID there's no direct DM link: copy the username, then open the server.
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-dm]") || S.discord.userId) return;
    copy(S.discord.username).then((ok) => ok && toast(`Copied “${S.discord.username}”. Add me on Discord to send a DM.`));
  });

  /* ── Hero title: word-by-word rise ─────────────────── */
  const title = $("#heroTitle");
  title.setAttribute("aria-label", S.tagline);
  title.innerHTML = S.tagline
    .split(" ")
    .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`)
    .join(" ");
  requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("in")));

  /* ── Kit artwork ───────────────────────────────────── */
  const products = S.products;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const vars = (p) => `--c1:${esc(p.colors[0])};--c2:${esc(p.colors[1])}`;
  const appIcon = (p) => `<div class="app">${icon(p.icon)}</div>`;
  const art = (p) => (p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)} preview" loading="lazy" />` : appIcon(p));
  const priceHTML = (p) => `${esc(p.price)}${p.oldPrice ? `<s>${esc(p.oldPrice)}</s>` : ""}`;

  /* ── Featured ──────────────────────────────────────── */
  const F = byId[S.featured] || products[0];
  const featured = $("#featured");
  featured.innerHTML = `
    <div class="feat-copy reveal">
      <p class="feat-label">${esc(F.badge || "Featured")}</p>
      <h2>${esc(F.name)}</h2>
      <p>${esc(F.short)}</p>
      <p class="feat-price">${priceHTML(F)}</p>
      <div class="feat-actions">
        <button class="btn btn-primary" data-open="${esc(F.id)}">Buy</button>
        <button class="btn-link" data-open="${esc(F.id)}">Learn more <span class="chev">›</span></button>
      </div>
    </div>
    <div class="feat-art" style="${vars(F)}">${art(F)}</div>`;

  /* ── Grid ──────────────────────────────────────────── */
  const grid = $("#grid");
  grid.innerHTML = products
    .map(
      (p, i) => `
    <article class="card reveal" tabindex="0" role="button" aria-label="${esc(p.name)}, ${esc(p.price)}" data-id="${esc(p.id)}" style="--d:${(i % 3) * 0.08}s;view-transition-name:kit-${esc(p.id)}">
      <div class="card-art" style="${vars(p)}">${art(p)}</div>
      <div class="card-body">
        <span class="card-label">${esc(p.badge || "")}</span>
        <h3>${esc(p.name)}</h3>
        <p>${esc(p.short)}</p>
        <div class="card-foot">
          <span class="price">${priceHTML(p)}</span>
          <span class="btn btn-primary btn-sm">Buy</span>
        </div>
      </div>
    </article>`
    )
    .join("");

  /* ── Tabs ──────────────────────────────────────────── */
  const tabs = $("#tabs");
  const cats = ["All", ...new Set(products.map((p) => p.category))];
  tabs.innerHTML = `<span class="tab-pill" id="tabPill"></span>` + cats.map((c, i) => `<button role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  const pill = $("#tabPill");
  const movePill = () => {
    const on = $('[aria-selected="true"]', tabs);
    pill.style.width = on.offsetWidth + "px";
    pill.style.transform = `translateX(${on.offsetLeft - 3}px)`;
  };
  pill.style.left = "3px";
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    $$("button", tabs).forEach((x) => x.setAttribute("aria-selected", x === b));
    movePill();
    const cat = b.dataset.cat;
    const run = () => $$(".card", grid).forEach((c) => {
      const show = cat === "All" || byId[c.dataset.id].category === cat;
      c.hidden = !show;
      if (show) c.classList.add("in");
    });
    if (document.startViewTransition && !reduce) document.startViewTransition(run); else run();
  });
  requestAnimationFrame(movePill);
  addEventListener("resize", movePill);
  document.fonts?.ready.then(movePill);

  /* ── How to buy, perks, reviews, FAQ ───────────────── */
  $("#pay").textContent = S.payments?.length ? `Accepted: ${S.payments.join(", ")}.` : "";

  $("#perks").innerHTML = (S.perks || [])
    .map((k, i) => `<div class="perk reveal" style="--d:${i * 0.08}s">${icon(k.icon)}<h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`)
    .join("");

  if (S.reviews?.length) {
    $("#reviews").hidden = false;
    $("#reviewList").innerHTML = S.reviews
      .map((r, i) => `<figure class="review reveal" style="--d:${(i % 3) * 0.08}s;margin:0"><p>“${esc(r.text)}”</p><span>${esc(r.name)}${r.kit ? ` · ${esc(r.kit)}` : ""}</span></figure>`)
      .join("");
  }

  const faq = $("#faqList");
  faq.innerHTML = S.faq
    .map((f, i) => `<div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="fa${i}">${esc(f.q)}<span class="chevron">${icon("down")}</span></button><div class="faq-a" id="fa${i}" role="region"><div><p>${esc(f.a)}</p></div></div></div>`)
    .join("");
  faq.addEventListener("click", (e) => {
    const b = e.target.closest(".faq-q");
    if (!b) return;
    const item = b.parentElement;
    const open = !item.classList.contains("open");
    item.classList.toggle("open", open);
    b.setAttribute("aria-expanded", open);
  });

  /* ── Live Discord counts ───────────────────────────── */
  const code = (invite.match(/(?:discord\.gg|discord\.com\/invite)\/([\w-]+)/) || [])[1];
  if (code) {
    fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const m = d.approximate_member_count, o = d.approximate_presence_count;
        if (!m) return;
        const meta = $("#ctaMeta");
        meta.innerHTML = `<span class="dot"></span>${m.toLocaleString("en-US")} members${o ? ` · ${o.toLocaleString("en-US")} online now` : ""}`;
        meta.hidden = false;
      })
      .catch(() => {});
  }

  /* ── Kit sheet ─────────────────────────────────────── */
  const wrap = $("#sheetWrap"), sheet = $("#sheet");
  let lastFocus = null;
  const openSheet = (id, push = true) => {
    const p = byId[id];
    if (!p) return;
    lastFocus = document.activeElement;
    sheet.innerHTML = `
      <button class="close" data-close aria-label="Close">${icon("close")}</button>
      <div class="sheet-art" style="${vars(p)}">${art(p)}</div>
      <div class="sheet-info">
        <span class="card-label">${esc(p.badge || p.category)}</span>
        <h2 id="sheetTitle">${esc(p.name)}</h2>
        <p class="sheet-price">${priceHTML(p)}</p>
        <p class="desc">${esc(p.description || p.short)}</p>
        ${p.features?.length ? `<p class="sub">Features</p><ul class="list">${p.features.map((f) => `<li>${icon("check")}${esc(f)}</li>`).join("")}</ul>` : ""}
        ${p.includes?.length ? `<p class="sub">What you get</p><ul class="list">${p.includes.map((f) => `<li>${icon("check")}${esc(f)}</li>`).join("")}</ul>` : ""}
        <div class="buy">
          <p class="buy-note">Kits are sold on Discord. Join the server and open a ticket, or message <b>@${esc(S.discord.username)}</b>.</p>
          <a class="btn btn-primary btn-block" href="${esc(invite)}" target="_blank" rel="noopener">${DISCORD}Buy on Discord</a>
          <div class="buy-links">
            <a class="btn-link" href="${esc(dmUrl)}" data-dm target="_blank" rel="noopener">DM @${esc(S.discord.username)} <span class="chev">›</span></a>
            <button class="btn-link" data-copy>Copy order message <span class="chev">›</span></button>
          </div>
        </div>
      </div>`;
    $("[data-copy]", sheet).addEventListener("click", async () => {
      const msg = `Hi! I'd like to buy ${p.name} (${p.price}) from ${S.name}.`;
      if (await copy(msg)) toast("Order message copied. Paste it in Discord.");
    });
    wrap.classList.add("open");
    wrap.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    sheet.scrollTop = 0;
    setTimeout(() => $(".close", sheet).focus({ preventScroll: true }), 60);
    if (push) history.pushState({ kit: id }, "", `#kit-${id}`);
  };
  const closeSheet = (fromPop = false) => {
    if (!wrap.classList.contains("open")) return;
    wrap.classList.remove("open");
    wrap.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lastFocus?.focus?.({ preventScroll: true });
    if (!fromPop && location.hash.startsWith("#kit-")) history.replaceState(null, "", location.pathname + location.search);
  };
  grid.addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c) openSheet(c.dataset.id); });
  grid.addEventListener("keydown", (e) => {
    const c = e.target.closest(".card");
    if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openSheet(c.dataset.id); }
  });
  featured.addEventListener("click", (e) => { const b = e.target.closest("[data-open]"); if (b) openSheet(b.dataset.open); });
  wrap.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeSheet(); });
  addEventListener("keydown", (e) => {
    if (!wrap.classList.contains("open")) return;
    if (e.key === "Escape") closeSheet();
    if (e.key === "Tab") {
      const f = $$("a[href],button", sheet);
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f.at(-1).focus(); }
      else if (!e.shiftKey && document.activeElement === f.at(-1)) { e.preventDefault(); f[0].focus(); }
    }
  });
  addEventListener("popstate", () => {
    const m = location.hash.match(/^#kit-(.+)$/);
    if (m) openSheet(m[1], false); else closeSheet(true);
  });
  const initial = location.hash.match(/^#kit-(.+)$/);
  if (initial) openSheet(initial[1], false);

  // Swipe down to dismiss on phones
  let sy = null;
  sheet.addEventListener("touchstart", (e) => { sy = sheet.scrollTop <= 0 ? e.touches[0].clientY : null; }, { passive: true });
  sheet.addEventListener("touchmove", (e) => {
    if (sy == null) return;
    const dy = e.touches[0].clientY - sy;
    if (dy > 0) { sheet.style.transition = "none"; sheet.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });
  sheet.addEventListener("touchend", (e) => {
    if (sy == null) return;
    const dy = e.changedTouches[0].clientY - sy;
    sheet.style.transition = ""; sheet.style.transform = "";
    if (dy > 110) closeSheet();
    sy = null;
  });

  /* ── Scroll reveal ─────────────────────────────────── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
    { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── Scroll: nav hairline + featured card scale ────── */
  const nav = $("#nav");
  let ticking = false;
  const onScroll = () => {
    nav.classList.toggle("scrolled", scrollY > 8);
    if (!reduce) {
      const r = featured.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.75)));
      featured.style.setProperty("--p", p.toFixed(3));
    }
    ticking = false;
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})();
