(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const I = window.ICONS, K = window.KIT, esc = K.esc;
  const get = (o, path) => path.split(".").reduce((a, k) => (a == null ? a : a[k]), o);

  fetch(`data/store.json?v=${Date.now()}`)
    .then((r) => r.json())
    .then(start)
    .catch((e) => {
      console.error(e);
      document.body.insertAdjacentHTML("afterbegin", '<p style="padding:20px;text-align:center">The store couldn\'t load. Refresh to try again.</p>');
    });

  function start(S) {
    /* ── Text bindings & links ───────────────────────── */
    document.title = `${S.name} · Roblox Kits`;
    $$("[data-bind]").forEach((el) => { const v = get(S, el.dataset.bind); if (v != null) el.textContent = v; });
    $("#year").textContent = new Date().getFullYear();
    const invite = S.discord.invite;
    const dmUrl = S.discord.userId ? `https://discord.com/users/${S.discord.userId}` : invite;
    $$("[data-discord]").forEach((a) => (a.href = invite));
    $$("[data-dm]").forEach((a) => (a.href = dmUrl));

    /* ── Toast + clipboard ───────────────────────────── */
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
    document.addEventListener("click", (e) => {
      if (!e.target.closest("[data-dm]") || S.discord.userId) return;
      copy(S.discord.username).then((ok) => ok && toast(`Copied “${S.discord.username}”. Add me on Discord to send a DM.`));
    });

    /* ── Hero title ──────────────────────────────────── */
    const title = $("#heroTitle");
    title.setAttribute("aria-label", S.tagline);
    title.innerHTML = S.tagline.split(" ").map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("in")));

    /* ── Hero banner (image, video file or YouTube) ──── */
    const scalers = [];
    const banner = S.hero?.banner;
    if (banner) {
      const wrap = $("#heroBanner");
      const id = K.ytId(banner);
      const inner = id
        ? `<iframe src="https://www.youtube-nocookie.com/embed/${esc(id)}?autoplay=1&mute=1&loop=1&playlist=${esc(id)}&controls=0&rel=0&modestbranding=1&playsinline=1" title="Banner video" allow="autoplay; encrypted-media" loading="lazy"></iframe>`
        : /\.(mp4|webm|mov)(\?|$)/i.test(banner)
          ? `<video src="${esc(banner)}" autoplay muted loop playsinline></video>`
          : `<img src="${esc(banner)}" alt="${esc(S.name)}" />`;
      wrap.innerHTML = `<div class="banner">${inner}</div>`;
      wrap.hidden = false;
      scalers.push($(".banner", wrap));
    }

    /* ── Featured ────────────────────────────────────── */
    const products = S.products || [];
    const byId = Object.fromEntries(products.map((p) => [p.id, p]));
    const F = S.hero?.featured === "" ? null : byId[S.hero?.featured] || products[0];
    const featured = $("#featured");
    if (F) {
      featured.innerHTML = `
        <div class="feat-copy reveal">
          <p class="feat-label">${esc(F.badge || "Featured")}</p>
          <h2>${esc(F.name)}</h2>
          <p>${esc(F.short)}</p>
          <p class="feat-price">${K.priceHTML(F)}</p>
          <div class="feat-actions">
            <button class="btn btn-primary" data-open="${esc(F.id)}">Buy</button>
            <button class="btn-link" data-open="${esc(F.id)}">Learn more <span class="chev">›</span></button>
          </div>
        </div>
        <div class="feat-art${F.cover ? " has-cover" : ""}" style="${K.vars(F)}">${K.coverOrIcon(F)}</div>`;
      scalers.push(featured);
    } else {
      featured.parentElement.remove();
    }

    /* ── Grid + tabs ─────────────────────────────────── */
    const grid = $("#grid");
    grid.innerHTML = products.map(K.cardHTML).join("");
    const tabs = $("#tabs");
    const cats = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];
    tabs.innerHTML = `<span class="tab-pill" id="tabPill"></span>` + cats.map((c, i) => `<button role="tab" aria-selected="${i === 0}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
    if (cats.length < 3) tabs.hidden = true;
    const pill = $("#tabPill");
    pill.style.left = "3px";
    const movePill = () => {
      const on = $('[aria-selected="true"]', tabs);
      if (!on) return;
      pill.style.width = on.offsetWidth + "px";
      pill.style.transform = `translateX(${on.offsetLeft - 3}px)`;
    };
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

    /* ── How to buy, perks, reviews, FAQ ─────────────── */
    $("#pay").textContent = S.payments?.length ? `Accepted: ${S.payments.join(", ")}.` : "";
    $("#perks").innerHTML = (S.perks || []).map((k, i) => `<div class="perk reveal" style="--d:${i * 0.08}s">${I.icon(k.icon)}<h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`).join("");
    if (!S.perks?.length) $("#perks").closest("section").remove();

    if (S.reviews?.length) {
      $("#reviews").hidden = false;
      $("#reviewList").innerHTML = S.reviews
        .map((r, i) => `<figure class="review reveal" style="--d:${(i % 3) * 0.08}s;margin:0"><p>“${esc(r.text)}”</p><span>${esc(r.name)}${r.kit ? ` · ${esc(r.kit)}` : ""}</span></figure>`)
        .join("");
    }

    const faq = $("#faqList");
    faq.innerHTML = (S.faq || [])
      .map((f, i) => `<div class="faq-item"><button class="faq-q" aria-expanded="false" aria-controls="fa${i}">${esc(f.q)}<span class="chevron">${I.icon("down")}</span></button><div class="faq-a" id="fa${i}" role="region"><div><p>${esc(f.a)}</p></div></div></div>`)
      .join("");
    faq.addEventListener("click", (e) => {
      const b = e.target.closest(".faq-q");
      if (!b) return;
      const item = b.parentElement, open = !item.classList.contains("open");
      item.classList.toggle("open", open);
      b.setAttribute("aria-expanded", open);
    });

    /* ── Live Discord counts ─────────────────────────── */
    const code = (invite.match(/(?:discord\.gg|discord\.com\/invite)\/([\w-]+)/) || [])[1];
    if (code) {
      fetch(`https://discord.com/api/v10/invites/${code}?with_counts=true`)
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((d) => {
          const m = d.approximate_member_count, o = d.approximate_presence_count;
          if (!m) return;
          const meta = $("#ctaMeta");
          meta.innerHTML = `<span class="dot"></span>${K.fmt(m)} members${o ? ` · ${K.fmt(o)} online now` : ""}`;
          meta.hidden = false;
        })
        .catch(() => {});
    }

    /* ── Kit sheet with media gallery ────────────────── */
    const wrap = $("#sheetWrap"), sheet = $("#sheet");
    let lastFocus = null;
    const openSheet = (id, push = true) => {
      const p = byId[id];
      if (!p) return;
      lastFocus = document.activeElement;
      const items = K.media(p);
      const stage = items.length
        ? `<div class="stage" id="stage">${K.mediaHTML(items[0], p)}</div>` +
          (items.length > 1 ? `<div class="thumbs" role="tablist">${items.map((m, i) => `<button class="thumb" role="tab" aria-selected="${i === 0}" aria-label="Media ${i + 1}" data-i="${i}">${K.thumbHTML(m, p)}</button>`).join("")}</div>` : "")
        : `<div class="sheet-art" style="${K.vars(p)}">${K.appIcon(p)}</div>`;
      sheet.innerHTML = `
        <button class="close" data-close aria-label="Close">${I.icon("close")}</button>
        <div class="sheet-media">${stage}</div>
        <div class="sheet-info">
          <div class="sheet-head">
            <div class="sheet-icon" style="${K.vars(p)}">${K.appIcon(p)}</div>
            <div>
              <span class="card-label">${esc(p.badge || p.category || "")}</span>
              <h2 id="sheetTitle">${esc(p.name)}</h2>
              <p class="sheet-price">${K.priceHTML(p)}</p>
            </div>
          </div>
          <p class="desc">${esc(p.description || p.short)}</p>
          <div class="sheet-cols">
            ${p.features?.length ? `<div><p class="sub">Features</p><ul class="list">${p.features.map((f) => `<li>${I.icon("check")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
            ${p.includes?.length ? `<div><p class="sub">What you get</p><ul class="list">${p.includes.map((f) => `<li>${I.icon("check")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <div class="buy">
            <p class="buy-note">Kits are sold on Discord. Join the server and open a ticket, or message <b>@${esc(S.discord.username)}</b>.</p>
            <a class="btn btn-primary btn-block" href="${esc(invite)}" target="_blank" rel="noopener">${I.discord}Buy on Discord · ${esc(K.priceText(p))}</a>
            <div class="buy-links">
              <a class="btn-link" href="${esc(dmUrl)}" data-dm target="_blank" rel="noopener">DM @${esc(S.discord.username)} <span class="chev">›</span></a>
              <button class="btn-link" data-copy>Copy order message <span class="chev">›</span></button>
            </div>
          </div>
        </div>`;
      $("[data-copy]", sheet).addEventListener("click", async () => {
        if (await copy(`Hi! I'd like to buy ${p.name} (${K.priceText(p)}) from ${S.name}.`)) toast("Order message copied. Paste it in Discord.");
      });
      const thumbs = $(".thumbs", sheet);
      if (thumbs) thumbs.addEventListener("click", (e) => {
        const b = e.target.closest(".thumb");
        if (!b) return;
        $$(".thumb", thumbs).forEach((t) => t.setAttribute("aria-selected", t === b));
        const st = $("#stage");
        st.classList.add("swap");
        setTimeout(() => { st.innerHTML = K.mediaHTML(items[+b.dataset.i], p, true); st.classList.remove("swap"); }, 160);
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
      setTimeout(() => { if (!wrap.classList.contains("open")) sheet.innerHTML = ""; }, 400); // stops videos
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

    let sy = null;
    sheet.addEventListener("touchstart", (e) => { sy = sheet.scrollTop <= 0 && !e.target.closest(".thumbs") ? e.touches[0].clientY : null; }, { passive: true });
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

    /* ── Scroll reveal ───────────────────────────────── */
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }),
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));

    /* ── Scroll: nav hairline + scale-in panels ──────── */
    const nav = $("#nav");
    let ticking = false;
    const onScroll = () => {
      nav.classList.toggle("scrolled", scrollY > 8);
      if (!reduce) scalers.forEach((el) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--p", Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.75))).toFixed(3));
      });
      ticking = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
})();
