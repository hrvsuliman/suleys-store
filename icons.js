// Shared icon set for the shop and the admin page.
window.ICONS = (() => {
  const paths = {
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
    car: '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5M3 12h18"/>',
    gun: '<path d="M3 9h17v4h-6l-1 2h-3l-1 4H5l1-6H3z"/><path d="M20 9V7"/>',
    crown: '<path d="m3 8 4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9.5 17h5"/>',
    music: '<path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2.5 3h3l2.6 12.4a1.5 1.5 0 0 0 1.5 1.1h8.6a1.5 1.5 0 0 0 1.5-1.1L21.5 7H6.2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4"/>',
    book: '<path d="M4 19.5V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14"/><path d="M8 7h8"/>',
    chat: '<path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.1A8.5 8.5 0 1 1 21 12z"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  };
  const builtIn = ["box", "ball", "sword", "sparkles", "layers", "users", "building", "map", "shield", "code", "bolt", "car", "gun", "crown", "trophy", "music", "cart", "globe"];
  const icon = (k) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[k] || paths.box}</svg>`;
  const robux =
    '<svg class="ico rbx" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.6 20.2 7.3v9.4L12 21.4 3.8 16.7V7.3z"/><rect x="9.2" y="9.2" width="5.6" height="5.6" rx=".8"/></svg>';
  const discord =
    '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.6 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1 0-.12l.37-.3a.07.07 0 0 1 .08-.01c3.93 1.8 8.180 1.8 12.06 0a.07.07 0 0 1 .08.01l.37.3a.08.08 0 0 1 0 .12c-.6.35-1.22.65-1.88.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.670-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.150-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/></svg>';
  /* ── Stickers: full-colour floating icons (original artwork) ── */
  let uid = 0;
  const pent = (cx, cy, r, rot = -90) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = ((rot + i * 72) * Math.PI) / 180;
      return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(" ");
  const grad = (id, a, b, radial) =>
    radial
      ? `<radialGradient id="${id}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`
      : `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const ink = "#0b0d1a";
  const stickerDefs = {
    ball: (g) => {
      const outer = [0, 1, 2, 3, 4].map((i) => {
        const a = ((-90 + i * 72) * Math.PI) / 180;
        return [50 + 44 * Math.cos(a), 50 + 44 * Math.sin(a)];
      });
      return `<defs>${grad(g, "#ffffff", "#c9d2e6", true)}<clipPath id="${g}c"><circle cx="50" cy="50" r="44"/></clipPath></defs>
        <circle cx="50" cy="50" r="44" fill="url(#${g})"/>
        <g clip-path="url(#${g}c)" fill="${ink}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round">
          <polygon points="${pent(50, 50, 15)}"/>
          ${outer.map(([x, y], i) => `<line x1="${(50 + 15 * Math.cos(((-90 + i * 72) * Math.PI) / 180)).toFixed(1)}" y1="${(50 + 15 * Math.sin(((-90 + i * 72) * Math.PI) / 180)).toFixed(1)}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><polygon points="${pent(x, y, 12, -90 + i * 72 + 36)}"/>`).join("")}
        </g>
        <circle cx="50" cy="50" r="44" fill="none" stroke="${ink}" stroke-width="4"/>
        <ellipse cx="36" cy="28" rx="12" ry="6" fill="#fff" opacity=".7" transform="rotate(-30 36 28)"/>`;
    },
    robux: (g) => `<defs>${grad(g, "#ffe27a", "#f59e0b")}</defs>
        <polygon points="50,5 89,27.5 89,72.5 50,95 11,72.5 11,27.5" fill="url(#${g})" stroke="#6b3f00" stroke-width="5" stroke-linejoin="round"/>
        <rect x="36" y="36" width="28" height="28" rx="5" fill="#6b3f00"/>
        <polyline points="20,32 50,14 80,32" fill="none" stroke="#fff6cc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".8"/>`,
    smile: (g) => `<defs>${grad(g, "#ffe066", "#f7a400", true)}</defs>
        <circle cx="50" cy="50" r="44" fill="url(#${g})" stroke="${ink}" stroke-width="4"/>
        <path d="M18 40 Q20 36 26 36 H44 Q48 36 50 39 Q52 36 56 36 H74 Q80 36 82 40 L79 52 Q76 58 68 58 H60 Q54 58 52 50 H48 Q46 58 40 58 H32 Q24 58 21 52 Z" fill="${ink}"/>
        <path d="M60 41 l8 0" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
        <path d="M34 70 Q50 82 66 70" fill="none" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>`,
    bolt: (g) => `<defs>${grad(g, "#fff176", "#ff9f0a")}</defs>
        <path d="M58 4 18 56 H46 L38 96 82 40 H54 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M54 16 32 48" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
    flame: (g) => `<defs>${grad(g, "#ffd60a", "#ff375f")}${grad(g + "i", "#fff7ae", "#ffb020")}</defs>
        <path d="M50 4 C60 22 82 34 82 60 C82 82 66 96 50 96 C34 96 18 82 18 62 C18 46 28 38 34 26 C36 38 42 42 46 44 C46 30 44 18 50 4 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M50 52 C56 62 66 66 66 78 C66 88 58 94 50 94 C42 94 34 88 34 79 C34 70 42 66 44 58 C46 64 50 64 50 52 Z" fill="url(#${g}i)"/>`,
    trophy: (g) => `<defs>${grad(g, "#ffe27a", "#e0a100")}</defs>
        <path d="M28 10 H72 V36 C72 52 62 62 50 62 C38 62 28 52 28 36 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M28 18 H12 C12 34 20 42 30 44 M72 18 H88 C88 34 80 42 70 44" fill="none" stroke="${ink}" stroke-width="4.5" stroke-linecap="round"/>
        <path d="M44 62 V74 H56 V62 M32 90 H68 V80 Q68 74 62 74 H38 Q32 74 32 80 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M38 18 V34" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>`,
    music: (g) => `<defs>${grad(g, "#ff8ad8", "#a855f7")}</defs>
        <path d="M36 72 V20 L84 8 V60" fill="none" stroke="${ink}" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"/>
        <path d="M36 72 V20 L84 8 V60" fill="none" stroke="url(#${g})" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <ellipse cx="25" cy="76" rx="15" ry="12" fill="url(#${g})" stroke="${ink}" stroke-width="4.5"/>
        <ellipse cx="73" cy="64" rx="15" ry="12" fill="url(#${g})" stroke="${ink}" stroke-width="4.5"/>`,
    star: (g) => `<defs>${grad(g, "#fff176", "#ffb300")}</defs>
        <polygon points="${Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 19 : 46; const a = ((-90 + i * 36) * Math.PI) / 180; return `${(50 + r * Math.cos(a)).toFixed(1)},${(53 + r * Math.sin(a)).toFixed(1)}`; }).join(" ")}" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>`,
    crown: (g) => `<defs>${grad(g, "#ffe27a", "#f59e0b")}</defs>
        <path d="M10 30 30 52 50 18 70 52 90 30 82 80 H18 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <circle cx="50" cy="62" r="7" fill="#ff375f" stroke="${ink}" stroke-width="3"/>`,
    heart: (g) => `<defs>${grad(g, "#ff6b9d", "#e11d48")}</defs>
        <path d="M50 88 C20 66 8 50 8 34 C8 20 18 10 31 10 C40 10 46 15 50 22 C54 15 60 10 69 10 C82 10 92 20 92 34 C92 50 80 66 50 88 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M24 26 Q28 20 34 20" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".7"/>`,
    controller: (g) => `<defs>${grad(g, "#7cc4ff", "#3b5bfd")}</defs>
        <path d="M26 28 H74 C86 28 94 40 94 58 C94 72 88 80 80 80 C72 80 68 70 62 66 H38 C32 70 28 80 20 80 C12 80 6 72 6 58 C6 40 14 28 26 28 Z" fill="url(#${g})" stroke="${ink}" stroke-width="4.5" stroke-linejoin="round"/>
        <path d="M26 46 V60 M19 53 H33" stroke="${ink}" stroke-width="5" stroke-linecap="round"/>
        <circle cx="70" cy="48" r="5" fill="#ffd60a" stroke="${ink}" stroke-width="2.5"/><circle cx="78" cy="58" r="5" fill="#ff375f" stroke="${ink}" stroke-width="2.5"/>`,
  };
  const stickerNames = Object.keys(stickerDefs);
  const sticker = (name) => {
    const def = stickerDefs[name];
    if (!def) return "";
    const g = `stk${++uid}`;
    return `<svg class="stk" viewBox="0 0 100 100" aria-hidden="true">${def(g)}</svg>`;
  };

  return { paths, builtIn, icon, robux, discord, sticker, stickerNames };
})();
