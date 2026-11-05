// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE — everything on the site is generated from it.
//  No checkout: every "Get it" button sends buyers to your Discord.
// ─────────────────────────────────────────────────────────────
window.SHOP = {
  name: "Suley's Store",
  tagline: "Roblox kits that are ready for your game.",
  subtitle: "Systems, UI and maps with full source code. You buy on Discord and get the kit in minutes.",

  // The kit shown big in the hero.
  featured: "football-engine",

  discord: {
    invite: "https://discord.gg/3KuKZCT6Xp",    // ← your server invite link
    username: "suleyman.cgn",                 // ← your Discord @username (shown on the site)
    userId: "",                               // ← your Discord user ID for the "DM me" button.
                                              //   Discord → Settings → Advanced → Developer Mode,
                                              //   then right-click yourself → Copy User ID.
                                              //   Leave "" and "DM me" copies your username + opens the server.
    // Member / online counts are fetched live from the invite — nothing to fill in.
  },

  // How people can pay you (shown as chips).
  payments: ["PayPal", "Robux", "Gift cards"],

  // The "Why buy here" row. icon options are listed above products.
  perks: [
    { icon: "code", title: "Full source code", text: "Every script is readable and commented, so you can change anything." },
    { icon: "refresh", title: "Free updates", text: "Fixes and new features are posted in the Discord at no extra cost." },
    { icon: "book", title: "Setup guide", text: "Step-by-step instructions get each kit running in Studio." },
    { icon: "chat", title: "Help on Discord", text: "If you get stuck, ask me and I'll help you set it up." },
  ],

  // Your kits. `icon` options: ball, sword, sparkles, layers, users, building, map, shield, box, code, bolt
  // Optional `image: "images/my-kit.png"` replaces the generated artwork.
  products: [
    {
      id: "football-engine",
      name: "Football Engine",
      category: "Systems",
      price: "$25",
      oldPrice: "$35",
      badge: "Best seller",
      icon: "ball",
      colors: ["#34d399", "#3b82f6"],
      short: "Full football gameplay: ball physics, tackles, keepers and matches.",
      description:
        "Everything you need to launch a football game. Server-authoritative ball physics, tackling, shooting with power and curve, goalkeeper AI and a complete match flow with timers and scoring.",
      features: ["Server-side ball physics", "Shoot, pass, tackle, dribble", "Goalkeeper AI", "Match timer & scoreboard", "Mobile + console controls"],
      includes: ["Place file", "Source code", "Setup guide"],
    },
    {
      id: "combat-framework",
      name: "Combat Framework",
      category: "Systems",
      price: "$20",
      badge: "Popular",
      icon: "sword",
      colors: ["#fb7185", "#a855f7"],
      short: "Hitboxes, combos, blocking and stuns — smooth and exploit-safe.",
      description:
        "A modular melee combat system with raycast hitboxes, combo chains, blocking, parrying and stun states. Hook in your own animations and VFX in minutes.",
      features: ["Raycast hitboxes", "Combo chains", "Block & parry", "Stun / ragdoll states", "VFX & sound hooks"],
      includes: ["Model", "Source code", "Animation pack"],
    },
    {
      id: "glass-ui",
      name: "Glass UI Kit",
      category: "UI",
      price: "$12",
      badge: "New",
      icon: "layers",
      colors: ["#a78bfa", "#60a5fa"],
      short: "40+ clean, animated UI components with a frosted-glass look.",
      description:
        "A polished UI library for Roblox: shop menus, inventories, settings, notifications, buttons and more. Fully tweened, scales to every device.",
      features: ["40+ components", "Tweened animations", "Mobile-ready scaling", "Light & dark themes", "Easy colour theming"],
      includes: ["UI models", "Module scripts", "Figma file"],
    },
    {
      id: "simulator-starter",
      name: "Simulator Starter",
      category: "Systems",
      price: "$18",
      icon: "sparkles",
      colors: ["#fbbf24", "#f472b6"],
      short: "Pets, eggs, rebirths and saving — the full simulator loop.",
      description:
        "Start your simulator with the core loop already done: clicking, currencies, pets with eggs and rarities, rebirths and safe DataStore saving.",
      features: ["Pets & egg hatching", "Rarities & equip slots", "Rebirth system", "Session-locked saving", "Gamepass hooks"],
      includes: ["Place file", "Source code", "Setup guide"],
    },
    {
      id: "lobby-matchmaking",
      name: "Lobby & Matchmaking",
      category: "Systems",
      price: "$15",
      icon: "users",
      colors: ["#22d3ee", "#6366f1"],
      short: "Queues, parties and teleports into reserved servers.",
      description:
        "A drop-in lobby with party invites, queue pads, skill-free or ranked matchmaking and safe teleports into reserved servers.",
      features: ["Party system", "Queue pads & UI", "Reserved server teleports", "Rejoin handling"],
      includes: ["Place file", "Source code"],
    },
    {
      id: "tycoon-kit",
      name: "Tycoon Kit",
      category: "Systems",
      price: "$14",
      icon: "building",
      colors: ["#f59e0b", "#ef4444"],
      short: "Plots, droppers, buttons and upgrades with saving.",
      description:
        "A clean, data-driven tycoon base. Claim plots, buy buttons, run droppers and upgrades — all saved between sessions.",
      features: ["Plot claiming", "Button & dropper system", "Upgrades", "Data saving"],
      includes: ["Place file", "Source code"],
    },
    {
      id: "stadium-pack",
      name: "Stadium Map Pack",
      category: "Maps",
      price: "$10",
      icon: "map",
      colors: ["#4ade80", "#14b8a6"],
      short: "Three optimised, low-poly stadiums ready for matches.",
      description:
        "Three stylised stadiums built for performance, with spawn points, goals and camera spots already set up.",
      features: ["3 stadiums", "Low part count", "Lighting presets", "Spawn & goal setup"],
      includes: ["Map models"],
    },
    {
      id: "admin-suite",
      name: "Admin Suite",
      category: "Scripts",
      price: "$8",
      icon: "shield",
      colors: ["#94a3b8", "#6366f1"],
      short: "Commands, bans, logs and a slick admin panel.",
      description:
        "A lightweight admin system with a command bar, rank permissions, timed bans and a searchable log panel.",
      features: ["Command bar", "Rank permissions", "Timed bans", "Action logs"],
      includes: ["Model", "Source code"],
    },
  ],

  // Real vouches from your Discord. The "Vouches" section stays hidden while this is empty.
  // Example: { name: "username", text: "Clean code, fast delivery!", kit: "Football Engine" },
  reviews: [],

  faq: [
    {
      q: "How do I buy a kit?",
      a: "There's no checkout on this site. Join the Discord server and open a ticket, or DM me directly. Tell me which kit you want, pay, and you get it delivered right there.",
    },
    { q: "How do I pay?", a: "PayPal, Robux and gift cards are accepted. Ask in Discord if you want to use something else." },
    { q: "Do I get updates?", a: "Yes. Every kit comes with free updates — they're posted in the Discord server." },
    { q: "Do I need to know how to script?", a: "No. Every kit ships with a setup guide. If you get stuck, ask in Discord and I'll help." },
    { q: "Can I resell or leak kits?", a: "No. You can use kits in your own games, but reselling or sharing the files isn't allowed." },
    { q: "Refunds?", a: "Because kits are digital files, sales are final once delivered. If something doesn't work, I'll fix it." },
  ],
};
