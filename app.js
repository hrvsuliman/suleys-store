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

  let lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new window.Lenis({ lerp: 0.09, smoothWheel: true });
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
  // Smooth anchor jumps
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    const el = id === "#top" ? document.body : document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(id === "#top" ? 0 : el, { offset: -60, duration: 1.4 });
    else el.scrollIntoView({ behavior: "smooth" });
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
    const words = S.tagline.split(" ");
    title.innerHTML = words.map((w, i) => `<span class="w${i >= words.length - 2 ? " hot" : ""}" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("in")));

    /* ── Floating stickers around the hero ───────────── */
    // [left%, top%, size px, depth, delay s]
    const slots = [[8, 18, 110, 1.2, 0], [84, 14, 96, 0.8, 1.1], [3, 58, 78, 0.6, 0.6], [90, 52, 120, 1.4, 1.8], [18, 80, 64, 0.5, 2.4], [74, 80, 70, 0.7, 0.3], [30, 14, 54, 0.4, 1.5], [66, 12, 58, 0.5, 2.1]];
    const heroStickers = S.hero?.stickers?.length ? S.hero.stickers : ["ball", "robux", "smile", "bolt", "flame", "trophy", "music", "star"];
    const floaters = $("#floaters");
    floaters.innerHTML = heroStickers.slice(0, slots.length).map((n, i) => {
      const [x, y, s, depth, delay] = slots[i];
      return `<span class="floater" data-depth="${depth}" style="left:${x}%;top:${y}%;--s:${s}px;--delay:${delay}s;--rot:${(i % 2 ? 1 : -1) * (8 + i * 3)}deg">${I.sticker(n)}</span>`;
    }).join("");
    const floatEls = $$(".floater", floaters);
    floatEls.forEach((el) => { const d = +el.dataset.depth; el.classList.add(d < 0.6 ? "far" : d < 0.9 ? "mid" : "near"); });
    if (!reduce) {
      let mx = 0, my = 0;
      const place = () => floatEls.forEach((el) => {
        const d = +el.dataset.depth;
        el.style.translate = `${mx * d * 30}px ${my * d * 30 - scrollY * d * 0.25}px`;
      });
      addEventListener("pointermove", (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; requestAnimationFrame(place); }, { passive: true });
      addEventListener("scroll", () => requestAnimationFrame(place), { passive: true });
    }

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
      buildShow(featured, [F, ...products.filter((p) => p !== F)]);
      scalers.push(featured);
    } else {
      featured.parentElement.remove();
    }

    /* ── Slideshow: one slide per video/image of each kit, 15s each ── */
    function buildShow(root, kits) {
      const SLIDE_MS = 15000;
      const slides = [];
      kits.forEach((p) => {
        const media = K.media(p);
        if (media.length) media.forEach((m) => slides.push({ p, m }));
        else slides.push({ p, m: null });
      });
      const bg = ({ p, m }) => {
        if (!m) return `<div class="slide-art" style="${K.vars(p)}">${K.scene(p)}</div>`;
        if (m.type === "image") return `<img class="kb" src="${esc(m.src)}" alt="" />`;
        if (m.type === "video") return `<video src="${esc(m.src)}" muted loop playsinline preload="metadata"></video>`;
        return `<div class="yt" data-yt="${esc(m.id)}"><img src="https://i.ytimg.com/vi/${esc(m.id)}/maxresdefault.jpg" alt="" /></div>`;
      };
      root.classList.add("show");
      root.style.setProperty("--slide-ms", SLIDE_MS + "ms");
      root.innerHTML = `
        <div class="slides">${slides.map((s, i) => `
          <div class="slide" data-i="${i}" style="${K.vars(s.p)}" aria-hidden="${i !== 0}">
            <div class="slide-bg">${bg(s)}</div>
            <div class="slide-shade"></div>
            <div class="slide-info">
              <div class="slide-kit">${K.appIcon(s.p)}<span>${esc(s.p.badge || s.p.category || "Kit")}</span></div>
              <h2>${esc(s.p.name)}</h2>
              <p>${esc(s.p.short)}</p>
              <p class="feat-price">${K.priceHTML(s.p)}</p>
              <div class="feat-actions">
                <button class="btn btn-primary" data-open="${esc(s.p.id)}">Buy</button>
                <button class="btn-link" data-open="${esc(s.p.id)}">Learn more <span class="chev">›</span></button>
              </div>
            </div>
          </div>`).join("")}
        </div>
        ${slides.length > 1 ? `
        <div class="show-bar">
          <div class="segs">${slides.map((s, i) => `<button class="seg" data-go="${i}" aria-label="Slide ${i + 1}: ${esc(s.p.name)}"><span></span></button>`).join("")}</div>
          <div class="arrows">
            <button class="arrow" data-step="-1" aria-label="Previous">${I.icon("down")}</button>
            <button class="arrow" data-step="1" aria-label="Next">${I.icon("down")}</button>
          </div>
        </div>` : ""}`;

      const slideEls = $$(".slide", root), segEls = $$(".seg", root);
      let cur = -1;
      const go = (n) => {
        n = (n + slides.length) % slides.length;
        if (n === cur) return;
        const prev = slideEls[cur];
        if (prev) {
          prev.classList.remove("on");
          prev.setAttribute("aria-hidden", "true");
          $("video", prev)?.pause();
          const yt = $(".yt", prev);
          if (yt) setTimeout(() => { if (!prev.classList.contains("on")) $("iframe", yt)?.remove(); }, 900);
        }
        cur = n;
        const el = slideEls[cur];
        el.classList.add("on");
        el.setAttribute("aria-hidden", "false");
        const v = $("video", el);
        if (v) { v.currentTime = 0; v.play().catch(() => {}); }
        const yt = $(".yt", el);
        if (yt && !$("iframe", yt)) {
          const id = yt.dataset.yt;
          yt.insertAdjacentHTML("beforeend", `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1" title="${esc(slides[cur].p.name)} video" allow="autoplay; encrypted-media"></iframe>`);
        }
        segEls.forEach((s, i) => {
          s.classList.toggle("done", i < cur);
          s.classList.remove("on");
          if (i === cur) { void s.offsetWidth; s.classList.add("on"); } // restart the fill animation
        });
      };
      go(0);
      if (slides.length < 2) return;

      root.addEventListener("animationend", (e) => { if (e.target.parentElement?.classList.contains("on") && e.animationName === "segfill") go(cur + 1); });
      root.addEventListener("click", (e) => {
        const b = e.target.closest("[data-go],[data-step]");
        if (!b) return;
        go(b.dataset.go != null ? +b.dataset.go : cur + +b.dataset.step);
      });
      // Pause while hovered, while a kit is open, or when the tab is hidden
      const setPaused = () => root.classList.toggle("paused", root.matches(":hover") || document.hidden || $("#sheetWrap").classList.contains("open"));
      root.addEventListener("pointerenter", setPaused);
      root.addEventListener("pointerleave", () => setTimeout(setPaused));
      document.addEventListener("visibilitychange", setPaused);
      new MutationObserver(setPaused).observe($("#sheetWrap"), { attributes: true, attributeFilter: ["class"] });
      // Swipe on phones
      let sx = null;
      root.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
      root.addEventListener("touchend", (e) => {
        if (sx == null) return;
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 50) go(cur + (dx < 0 ? 1 : -1));
        sx = null;
      });
      addEventListener("keydown", (e) => {
        if ($("#sheetWrap").classList.contains("open") || !root.matches(":hover")) return;
        if (e.key === "ArrowRight") go(cur + 1);
        if (e.key === "ArrowLeft") go(cur - 1);
      });
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
    $("#perks").innerHTML = (S.perks || []).map((k, i) => `<div class="perk spot reveal" style="--d:${i * 0.08}s">${I.icon(k.icon)}<h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`).join("");
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
        : `<div class="sheet-art" style="${K.vars(p)}">${K.scene(p)}</div>`;
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
          ${p.options?.length ? `<div><p class="sub">Ways to pay</p>${K.optionsHTML(p)}</div>` : ""}
          <p class="desc">${esc(p.description || p.short)}</p>
          <div class="sheet-cols">
            ${p.features?.length ? `<div><p class="sub">Features</p><ul class="list">${p.features.map((f) => `<li>${I.icon("check")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
            ${p.includes?.length ? `<div><p class="sub">What you get</p><ul class="list">${p.includes.map((f) => `<li>${I.icon("check")}${esc(f)}</li>`).join("")}</ul></div>` : ""}
          </div>
          <div class="buy">
            <p class="buy-note">Buy it on Discord. Open a ticket or DM <b>${esc(S.discord.username)}</b>.</p>
            <a class="btn btn-primary btn-block" href="${esc(invite)}" target="_blank" rel="noopener">${I.discord}Buy on Discord · ${esc(K.priceText(p))}</a>
            <div class="buy-links">
              <a class="btn-link" href="${esc(dmUrl)}" data-dm target="_blank" rel="noopener">DM @${esc(S.discord.username)} <span class="chev">›</span></a>
              <button class="btn-link" data-copy>Copy order message <span class="chev">›</span></button>
            </div>
          </div>
        </div>`;
      $("[data-copy]", sheet).addEventListener("click", async () => {
        if (await copy(`Yo! I want ${p.name} (${K.priceText(p)}).`)) toast("Copied! Paste it in Discord.");
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
      lenis?.stop();
      sheet.scrollTop = 0;
      setTimeout(() => $(".close", sheet).focus({ preventScroll: true }), 60);
      if (push) history.pushState({ kit: id }, "", `#kit-${id}`);
    };
    const closeSheet = (fromPop = false) => {
      if (!wrap.classList.contains("open")) return;
      wrap.classList.remove("open");
      wrap.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lenis?.start();
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

    /* ── Headlines light up word by word as you scroll (Apple-style) ── */
    const heads = $$(".headline").map((h) => {
      h.classList.remove("reveal");
      const wrap = (node) => {
        [...node.childNodes].forEach((n) => {
          if (n.nodeType === 3) {
            const frag = document.createDocumentFragment();
            n.textContent.split(/(\s+)/).forEach((t) => {
              if (!t) return;
              if (/^\s+$/.test(t)) frag.append(t);
              else { const sp = document.createElement("span"); sp.className = "hw"; sp.textContent = t; frag.append(sp); }
            });
            n.replaceWith(frag);
          } else if (n.nodeType === 1) wrap(n);
        });
      };
      wrap(h);
      return { h, words: $$(".hw", h) };
    });
    const lightHeads = () => heads.forEach(({ h, words }) => {
      const r = h.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (innerHeight * 0.88 - r.top) / (innerHeight * 0.4)));
      const n = Math.round(f * words.length);
      words.forEach((w, i) => w.classList.toggle("lit", i < n));
    });

    /* ── Spotlight that follows the cursor on cards ─────── */
    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.(".spot");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });

    /* ── Magnetic buttons ───────────────────────────────── */
    if (matchMedia("(hover: hover)").matches && !reduce) {
      $$(".magnetic").forEach((b) => {
        b.addEventListener("pointermove", (e) => {
          const r = b.getBoundingClientRect();
          b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
        });
        b.addEventListener("pointerleave", () => (b.style.translate = ""));
      });
    }

    /* ── Active nav link ────────────────────────────────── */
    const navLinks = $$(".nav-links a");
    const navSecs = navLinks.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
    const markNav = () => {
      let cur = null;
      navSecs.forEach((sec) => { if (sec.getBoundingClientRect().top < innerHeight * 0.4) cur = sec; });
      navLinks.forEach((a) => a.classList.toggle("active", !!cur && a.getAttribute("href") === "#" + cur.id));
    };

    /* ── Scroll: nav hairline + scale-in panels ──────── */
    const nav = $("#nav");
    let ticking = false;
    const onScroll = () => {
      nav.classList.toggle("scrolled", scrollY > 8);
      lightHeads();
      markNav();
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
