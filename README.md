# Suley's Store

Shop site for my Roblox kits. Prices are in Robux, and there's no checkout: every "Buy" button sends people to Discord.

Live site: https://hrvsuliman.github.io/suleys-store/

## Edit the shop (admin page)

Open **https://hrvsuliman.github.io/suleys-store/admin.html** and sign in with a GitHub token.

From there you can:

- add, edit, reorder and delete kits (name, Robux price, old price, label, category, descriptions, features)
- pick a built-in icon and colours, or upload your own icon
- upload a cover image, gallery screenshots, and a video (upload an MP4 or paste a YouTube link)
- set the hero headline, subtitle and a hero banner (image, video or YouTube)
- edit the FAQ, vouches, perks, Discord details and payment methods

Press **Publish** and the site updates in about a minute. Images are resized automatically before upload.

### Getting a token

1. Go to https://github.com/settings/personal-access-tokens/new
2. Repository access: **Only select repositories** → `suleys-store`
3. Permissions → Repository permissions → **Contents: Read and write**
4. Generate, copy, and paste it into the admin page

The token stays in your browser and can only change this one repo.

## Files

- `data/store.json`: all shop content (the admin page writes this)
- `media/`: uploaded images and videos
- `index.html`, `styles.css`, `app.js`: the shop
- `admin.html`, `admin.css`, `admin.js`: the admin page
- `icons.js`, `shared.js`: shared by both

## Run locally

```bash
python -m http.server 5517
```

Then open http://localhost:5517.
