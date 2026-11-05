# Suley's Store

Shop site for my Roblox kits. There's no checkout: every "Buy" button sends people to Discord.

## Edit the shop

Everything is in **`config.js`**:

- `name`, `tagline`, `subtitle`, `featured`: shop name, hero text, and the kit shown big under the hero
- `discord`: server invite, username, and (optional) user ID for a direct DM link
- `products`: your kits (name, price, description, features, colours, icon, optional image)
- `reviews`: real vouches (the section stays hidden while this is empty)
- `perks`, `faq`, `payments`

Product images go in an `images/` folder; set `image: "images/your-file.png"` on the kit.

## Run locally

```bash
python -m http.server 5517
```

Then open http://localhost:5517.

## Deploy

It's hosted on GitHub Pages from the `main` branch. Push to `main` and the site updates in about a minute.
