// Icons for the shop and the admin page.
// Real icons are Suley's own artwork in assets/icons. The tiny line glyphs below are only
// for UI controls the icon set doesn't cover (search, close, arrows, checkmarks).
window.ICONS = (() => {
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    up: '<path d="m6 15 6-6 6 6"/>',
    play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    film: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  };
  const icon = (k) =>
    `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[k] || ""}</svg>`;

  // Suley's icon set
  const stickerNames = ["red-ball", "mic", "robux", "trophy", "podium", "star", "star-medal", "heart", "crystal", "prism", "gear", "document", "list", "money-bag", "basket", "question-medal", "yen"];
  const assetUrl = (n) => `assets/icons/${n}.webp`;
  // Older data used drawn placeholder names — map them onto the real set.
  const legacy = { ball: "red-ball", smile: "mic", music: "mic", bolt: "star", flame: "trophy", crown: "podium", controller: "gear", code: "document", refresh: "star-medal", book: "gear", chat: "heart", box: "podium", sparkles: "prism", layers: "list" };
  const resolve = (n) => (stickerNames.includes(n) ? n : legacy[n] || null);
  const sticker = (n, alt = "") => {
    const r = resolve(n);
    return r ? `<img class="stk" src="${assetUrl(r)}" alt="${alt}" draggable="false" loading="lazy" decoding="async" />` : "";
  };
  const robux = `<img class="rbx" src="${assetUrl("robux")}" alt="Robux" draggable="false" />`;

  const discord =
    '<svg class="ico" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.6 1.25a18.3 18.3 0 0 0-5.49 0 12.6 12.6 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.7 19.7 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .09-.03c.46-.63.87-1.3 1.22-2a.08.08 0 0 0-.04-.1 13.1 13.1 0 0 1-1.87-.9.08.08 0 0 1 0-.12l.37-.3a.07.07 0 0 1 .08-.01c3.93 1.8 8.18 1.8 12.06 0a.07.07 0 0 1 .08.01l.37.3a.08.08 0 0 1 0 .12c-.6.35-1.22.65-1.88.9a.08.08 0 0 0-.04.1c.36.7.77 1.37 1.23 2a.08.08 0 0 0 .08.03 19.8 19.8 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/></svg>';

  return { paths, icon, robux, discord, sticker, stickerNames, assetUrl, resolve, builtIn: stickerNames };
})();
