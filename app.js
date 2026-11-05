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

  /* ── Video helpers (YouTube background embeds + muted autoplay) ── */
  const ytCmd = (iframe, func) => { try { iframe.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*"); } catch (e) {} };
  const ytSrc = (id) => `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
  // Builds a muted, looping background iframe and keeps nudging it to play (some browsers ignore autoplay the first time)
  const ytIframe = (id, title, onReady) => {
    const f = document.createElement("iframe");
    f.src = ytSrc(id);
    f.title = title;
    f.allow = "autoplay; encrypted-media; picture-in-picture";
    f.tabIndex = -1;
    f.addEventListener("load", () => {
      [0, 400, 1200].forEach((ms) => setTimeout(() => { ytCmd(f, "mute"); ytCmd(f, "playVideo"); }, ms));
      setTimeout(() => onReady?.(), 700);
    });
    return f;
  };
  const playMuted = (v) => { v.muted = true; v.playsInline = true; const p = v.play(); if (p) p.catch(() => {}); };

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
    // Reference-style title: first words grey, the last word bright.
    title.innerHTML = words.map((w, i) => `<span class="w${i === words.length - 1 ? " hot" : ""}" aria-hidden="true"><span style="--i:${i}">${esc(w)}</span></span>`).join(" ");
    requestAnimationFrame(() => requestAnimationFrame(() => title.classList.add("in")));

    /* ── A few of Suley's icons floating beside the title ── */
    // [left%, top%, size px, depth, delay s]
    const slots = [[8, 30, 92, 1.1, 0], [91, 26, 84, 0.9, 1.1], [17, 70, 60, 0.6, 0.6], [83, 72, 66, 0.7, 1.8], [27, 10, 46, 0.45, 2.4], [72, 8, 50, 0.5, 0.3]];
    const heroStickers = S.hero?.stickers?.length ? S.hero.stickers : ["red-ball", "robux", "mic", "trophy", "heart", "crystal"];
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
      let cur = -1, elapsed = 0;
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
        if (v) { v.currentTime = 0; playMuted(v); }
        const yt = $(".yt", el);
        if (yt && !$("iframe", yt)) {
          const id = yt.dataset.yt;
          yt.append(ytIframe(id, `${slides[cur].p.name} video`, () => yt.classList.add("ready")));
        }
        elapsed = 0;
        segEls.forEach((s, i) => {
          s.classList.toggle("done", i < cur);
          s.classList.toggle("on", i === cur);
          s.style.setProperty("--prog", i < cur ? 1 : 0);
        });
      };
      go(0);
      // Play the current video when the slideshow is on screen, pause it when you scroll away
      new IntersectionObserver(([en]) => {
        const on = $(".slide.on", root);
        const f = on && $("iframe", on), v = on && $("video", on);
        if (f) ytCmd(f, en.isIntersecting ? "playVideo" : "pauseVideo");
        if (v) en.isIntersecting ? playMuted(v) : v.pause();
      }, { threshold: 0.25 }).observe(root);
      if (slides.length < 2) return;

      // Timer in JS (not a CSS animation), so it works the same when the device has animations turned off
      let last = performance.now();
      setInterval(() => {
        const now = performance.now();
        if (!root.classList.contains("paused")) elapsed += now - last;
        last = now;
        segEls[cur]?.style.setProperty("--prog", Math.min(1, elapsed / SLIDE_MS).toFixed(4));
        if (elapsed >= SLIDE_MS) go(cur + 1);
      }, 100);
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

    /* Hover a card to play its video (muted). Only on devices with a mouse. */
    if (matchMedia("(hover: hover)").matches) {
      $$(".card", grid).forEach((card) => {
        const p = byId[card.dataset.id];
        if (!p?.video) return;
        const art = $(".card-art", card);
        let timer = 0, box = null;
        card.addEventListener("mouseenter", () => {
          timer = setTimeout(() => {
            const id = K.ytId(p.video);
            box = document.createElement("div");
            box.className = "card-preview";
            if (id) box.append(ytIframe(id, `${p.name} preview`, () => box?.classList.add("ready")));
            else {
              const v = document.createElement("video");
              v.src = p.video; v.loop = true; v.preload = "auto";
              v.addEventListener("playing", () => box?.classList.add("ready"), { once: true });
              box.append(v);
              playMuted(v);
            }
            art.append(box);
          }, 250);
        });
        card.addEventListener("mouseleave", () => {
          clearTimeout(timer);
          if (!box) return;
          const old = box; box = null;
          old.classList.remove("ready");
          setTimeout(() => old.remove(), 350);
        });
      });
    }
    // Category chips: each one uses the icon of the first kit in that category.
    const tabs = $("#tabs");
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    const catIcon = (c) => { const p = products.find((x) => x.category === c); return p ? (p.iconImage ? `<img src="${esc(p.iconImage)}" alt="" />` : I.sticker(p.icon)) : ""; };
    tabs.innerHTML =
      `<button class="chip" role="tab" aria-selected="true" data-cat="All">${I.sticker("podium")}All kits</button>` +
      cats.map((c) => `<button class="chip" role="tab" aria-selected="false" data-cat="${esc(c)}">${catIcon(c)}${esc(c)}</button>`).join("");
    let cat = "All", query = "";
    const applyFilter = () => {
      const run = () => {
        let shown = 0;
        $$(".card", grid).forEach((c) => {
          const p = byId[c.dataset.id];
          const hay = `${p.name} ${p.short} ${p.category} ${p.description} ${(p.features || []).join(" ")}`.toLowerCase();
          const ok = (cat === "All" || p.category === cat) && (!query || hay.includes(query));
          c.hidden = !ok;
          if (ok) { c.classList.add("in"); shown++; }
        });
        $("#empty").hidden = shown > 0;
      };
      if (document.startViewTransition && !reduce) document.startViewTransition(run); else run();
    };
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      $$(".chip", tabs).forEach((x) => x.setAttribute("aria-selected", x === b));
      cat = b.dataset.cat;
      applyFilter();
    });
    let qT;
    $("#search").addEventListener("input", (e) => {
      clearTimeout(qT);
      qT = setTimeout(() => { query = e.target.value.trim().toLowerCase(); applyFilter(); }, 120);
    });
    $(".search-ico").innerHTML = I.icon("search");
    $$(".discord-mark").forEach((el) => (el.innerHTML = I.discord));

    /* ── How to buy, perks, reviews, FAQ ─────────────── */
    $("#pay").textContent = S.payments?.length ? `Accepted: ${S.payments.join(", ")}.` : "";
    $("#perks").innerHTML = (S.perks || []).map((k, i) => `<div class="perk spot reveal" style="--d:${i * 0.08}s"><span class="perk-ico">${I.sticker(k.icon)}</span><h3>${esc(k.title)}</h3><p>${esc(k.text)}</p></div>`).join("");
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

    /* ── Kit page (opens over the store) ─────────────── */
    const wrap = $("#sheetWrap"), sheet = $("#sheet"), frame = $("#sheetFrame");
    let lastFocus = null;
    const paras = (t) => String(t || "").split(/\n\s*\n/).map((x) => `<p>${esc(x.trim())}</p>`).join("");
    const listHTML = (arr) => `<ul class="list">${arr.map((f) => `<li>${I.icon("check")}${esc(f)}</li>`).join("")}</ul>`;
    const openSheet = (id, push = true) => {
      const p = byId[id];
      if (!p) return;
      if (!wrap.classList.contains("open")) lastFocus = document.activeElement;
      const items = K.media(p);
      const images = items.filter((m) => m.type === "image");
      const others = products.filter((x) => x !== p);
      const stage = items.length
        ? `<div class="stage" id="stage">${K.mediaHTML(items[0], p)}</div>` +
          (items.length > 1 ? `<div class="thumbs" role="tablist">${items.map((m, i) => `<button class="thumb" role="tab" aria-selected="${i === 0}" aria-label="Media ${i + 1}" data-i="${i}">${K.thumbHTML(m, p)}</button>`).join("")}</div>` : "")
        : `<div class="sheet-art" style="${K.vars(p)}">${K.scene(p)}</div>`;
      const buyBtns = (cls = "") => `
        <a class="btn btn-primary ${cls}" href="${esc(invite)}" target="_blank" rel="noopener">${I.discord}Buy on Discord</a>
        <a class="btn btn-ghost ${cls}" href="${esc(dmUrl)}" data-dm target="_blank" rel="noopener"><span>DM @${esc(S.discord.username)}</span></a>`;

      frame.setAttribute("style", K.vars(p));
      sheet.innerHTML = `
        <header class="kp-bar">
          <button class="kp-back" data-close>${I.icon("down")}<span>All kits</span></button>
          <div class="kp-bar-title">${K.appIcon(p)}<b>${esc(p.name)}</b><span class="kp-bar-price">${K.priceHTML(p)}</span></div>
          <div class="kp-bar-actions">
            <a class="btn btn-primary btn-sm" href="${esc(invite)}" target="_blank" rel="noopener">Buy on Discord</a>
            <button class="close" data-close aria-label="Close">${I.icon("close")}</button>
          </div>
        </header>

        <section class="kp-hero">
          <div class="kp-name">
            <div class="kp-icon">${K.appIcon(p)}</div>
            <div>
              <span class="card-label">${esc([p.badge, p.category].filter(Boolean).join(" · "))}</span>
              <h2 id="sheetTitle">${esc(p.name)}</h2>
              <p class="kp-short">${esc(p.short)}</p>
            </div>
          </div>
          <div class="kp-buy">
            <div class="kp-price">${K.priceHTML(p)}</div>
            <div class="kp-buy-btns">${buyBtns()}</div>
            <button class="kp-copy" data-copy>Copy order message</button>
          </div>
        </section>

        <section class="kp-main">
          <div class="kp-media">${stage}</div>
          <aside class="kp-side">
            <div class="kp-box">
              <p class="sub">Ways to pay</p>
              ${p.options?.length ? K.optionsHTML(p) : `<ul class="pay-opts"><li><span>Robux</span>${K.priceHTML(p)}</li></ul>`}
            </div>
            ${p.includes?.length ? `<div class="kp-box"><p class="sub">What you get</p>${listHTML(p.includes)}</div>` : ""}
            <div class="kp-box kp-how">
              <p class="sub">How to buy</p>
              <p>Join the Discord and open a ticket, or DM <b>${esc(S.discord.username)}</b>. Tell me you want ${esc(p.name)}, pay, and I send it right after.</p>
            </div>
          </aside>
        </section>

        <section class="kp-about">
          <div class="kp-desc"><h3>About this kit</h3>${paras(p.description || p.short)}</div>
          ${p.features?.length ? `<div class="kp-feats"><h3>Features</h3>${listHTML(p.features)}</div>` : ""}
        </section>

        ${images.length > 1 ? `
        <section class="kp-section">
          <h3>Screenshots</h3>
          <div class="kp-shots">${images.map((m) => `<button class="kp-shot" data-src="${esc(m.src)}">${K.mediaHTML(m, p)}</button>`).join("")}</div>
        </section>` : ""}

        ${others.length ? `
        <section class="kp-section">
          <h3>Other kits</h3>
          <div class="grid kp-others">${others.slice(0, 4).map(K.cardHTML).join("")}</div>
        </section>` : ""}

        <footer class="kp-end">
          <div>
            <h3>Want ${esc(p.name)}?</h3>
            <p>Hit me up on Discord and you'll have it in a few minutes.</p>
          </div>
          <div class="kp-buy-btns">${buyBtns()}</div>
        </footer>`;

      $$(".kp-others .card", sheet).forEach((c) => c.classList.add("in"));
      $$("[data-copy]", sheet).forEach((b) => b.addEventListener("click", async () => {
        if (await copy(`Yo! I want ${p.name} (${K.priceText(p)}).`)) toast("Copied! Paste it in Discord.");
      }));
      const showMedia = (i, autoplay = true) => {
        const st = $("#stage", sheet);
        if (!st) return;
        $$(".thumb", sheet).forEach((t) => t.setAttribute("aria-selected", +t.dataset.i === i));
        st.classList.add("swap");
        setTimeout(() => { st.innerHTML = K.mediaHTML(items[i], p, autoplay); st.classList.remove("swap"); }, 160);
      };
      sheet.onclick = (e) => {
        const th = e.target.closest(".thumb");
        if (th) return showMedia(+th.dataset.i);
        const shot = e.target.closest(".kp-shot");
        if (shot) {
          showMedia(items.findIndex((m) => m.src === shot.dataset.src), false);
          sheet.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        const card = e.target.closest(".kp-others .card");
        if (card) openSheet(card.dataset.id);
      };

      sheet.classList.remove("scrolled");
      sheet.scrollTop = 0;
      if (!wrap.classList.contains("open")) {
        wrap.classList.add("open");
        wrap.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        lenis?.stop();
        setTimeout(() => $(".kp-back", sheet)?.focus({ preventScroll: true }), 60);
      }
      if (push) history.pushState({ kit: id }, "", `#kit-${id}`);
      else if (location.hash !== `#kit-${id}`) history.replaceState({ kit: id }, "", `#kit-${id}`);
    };
    // Compact bar with the buy button shows up once you scroll past the title
    sheet.addEventListener("scroll", () => sheet.classList.toggle("scrolled", sheet.scrollTop > 180), { passive: true });

    const closeSheet = (fromPop = false) => {
      if (!wrap.classList.contains("open")) return;
      wrap.classList.remove("open");
      wrap.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      lenis?.start();
      setTimeout(() => { if (!wrap.classList.contains("open")) sheet.innerHTML = ""; }, 450); // stops videos
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

    // Swipe down from the top to close on phones
    let sy = null;
    sheet.addEventListener("touchstart", (e) => { sy = sheet.scrollTop <= 0 && !e.target.closest(".thumbs") ? e.touches[0].clientY : null; }, { passive: true });
    sheet.addEventListener("touchmove", (e) => {
      if (sy == null) return;
      const dy = e.touches[0].clientY - sy;
      if (dy > 0) { frame.style.transition = "none"; frame.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    sheet.addEventListener("touchend", (e) => {
      if (sy == null) return;
      const dy = e.changedTouches[0].clientY - sy;
      frame.style.transition = ""; frame.style.transform = "";
      if (dy > 110) closeSheet();
      sy = null;
    });

    /* ── Background music: quiet, fades in, can loop just a part, remembers on/off ── */
    (() => {
      const M = S.music || {};
      const btn = $("#musicBtn");
      if (!M.src || !btn) return;
      btn.hidden = false;
      const target = Math.min(1, Math.max(0, M.volume ?? 0.18));
      const start = Math.max(0, +M.start || 0);
      const end = +M.end > start ? +M.end : 0;
      const audio = new Audio();
      audio.src = M.src;
      audio.preload = "none";
      audio.loop = false; // looping is done by hand so every restart fades out and back in
      const FADE_IN = 4000, FADE_OUT = 3000;
      audio.volume = 0;
      let wanted = true;
      try { wanted = localStorage.getItem("music") !== "off"; } catch (e) {}
      let fadeTimer = 0, ducked = false, started = false, looping = false;
      const isOn = () => btn.classList.contains("on");
      const level = () => target * (ducked ? 0.35 : 1);
      // Eased volume fade. Uses a timer (not requestAnimationFrame) so it keeps going in background tabs.
      const fadeTo = (v, ms, done) => {
        clearInterval(fadeTimer);
        const from = audio.volume, t0 = performance.now();
        fadeTimer = setInterval(() => {
          const k = Math.min(1, (performance.now() - t0) / ms);
          audio.volume = Math.min(1, Math.max(0, from + (v - from) * (k * k * (3 - 2 * k))));
          if (k >= 1) { clearInterval(fadeTimer); done?.(); }
        }, 30);
      };
      // Jumping to the loop start only works once the file's metadata has loaded
      const seekStart = () => {
        const go = () => { try { audio.currentTime = start; } catch (e) {} };
        if (audio.readyState >= 1) go(); else audio.addEventListener("loadedmetadata", go, { once: true });
      };
      const setUI = (on) => {
        btn.classList.toggle("on", on);
        btn.setAttribute("aria-pressed", String(on));
        btn.setAttribute("aria-label", on ? "Turn music off" : "Turn music on");
      };
      const play = () => {
        if (!started) { started = true; seekStart(); }
        audio.play().then(() => {
          setUI(true);
          fadeTo(level(), FADE_IN);
          let seen = false;
          try { seen = localStorage.getItem("musicHint") === "1"; localStorage.setItem("musicHint", "1"); } catch (e) {}
          if (!seen) toast("Music's on. Tap “Music” in the top bar to turn it off.");
        }).catch(() => setUI(false));
      };
      const stop = () => { setUI(false); fadeTo(0, 1500, () => audio.pause()); };
      setUI(false);

      btn.addEventListener("click", () => {
        wanted = !isOn();
        try { localStorage.setItem("music", wanted ? "on" : "off"); } catch (e) {}
        wanted ? play() : stop();
      });
      // Browsers only allow sound after the visitor interacts, so it starts on the first click, tap or key press.
      const kick = (e) => {
        if (e.target.closest?.("#musicBtn")) return;
        removeEventListener("pointerdown", kick);
        removeEventListener("keydown", kick);
        if (wanted && audio.paused) play();
      };
      addEventListener("pointerdown", kick);
      addEventListener("keydown", kick);

      // Fade out before the end (of the song, or of the chosen part), jump back and fade in again
      const endAt = () => end || audio.duration || Infinity;
      const restart = () => {
        seekStart();
        looping = false;
        if (isOn()) audio.play().then(() => fadeTo(level(), FADE_IN)).catch(() => {});
      };
      audio.addEventListener("timeupdate", () => {
        if (looping || audio.paused || audio.currentTime < endAt() - FADE_OUT / 1000) return;
        looping = true;
        fadeTo(0, FADE_OUT, restart);
      });
      audio.addEventListener("ended", () => { audio.volume = 0; restart(); });
      // Quieter while a kit page is open (so kit videos come through), silent when the tab is hidden
      new MutationObserver(() => {
        ducked = $("#sheetWrap").classList.contains("open");
        if (isOn() && !audio.paused) fadeTo(level(), 600);
      }).observe($("#sheetWrap"), { attributes: true, attributeFilter: ["class"] });
      document.addEventListener("visibilitychange", () => {
        if (!isOn()) return;
        if (document.hidden) fadeTo(0, 400, () => audio.pause());
        else audio.play().then(() => fadeTo(level(), 1200)).catch(() => {});
      });
    })();

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
