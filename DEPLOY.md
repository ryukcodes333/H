# Konosuba Bot Website — Render Deployment Guide

## What This Is
A full web dashboard for the **Shadow Garden / Konosuba WhatsApp Bot**.  
It connects to the **same MongoDB database** the bot uses, so everything is synced automatically.

---

## Step-by-Step: Deploy on Render

### 1. Extract the ZIP
Unzip `konosuba-website.zip` anywhere on your computer.

---

### 2. Push to GitHub (Required by Render)

1. Go to [github.com](https://github.com) → **New repository**
2. Name it `konosuba-website` — set it to **Private**
3. Click **Create repository**
4. In your terminal inside the unzipped folder:
   ```bash
   git init
   git add .
   git commit -m "Initial Konosuba website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/konosuba-website.git
   git push -u origin main
   ```

---

### 3. Create a Web Service on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub account (if not already done)
3. Select your `konosuba-website` repo → click **Connect**
4. Fill in the settings:

| Field | Value |
|-------|-------|
| **Name** | `konosuba-website` |
| **Region** | Closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | Free (or Starter) |

---

### 4. Set Environment Variables

In Render → **Environment** tab, add these:

| Key | Value |
|-----|-------|
| `MONGO_URI` | `mongodb+srv://konosubacommunity1:kono%2Esuba001@cluster-kono.41yglcv.mongodb.net/?appName=Cluster-kono` |
| `JWT_SECRET` | Any long random string, e.g. `konosuba-mega-secret-2025-abc123xyz` |
| `NODE_ENV` | `production` |

> ⚠️ **Important:** The `MONGO_URI` above is the same one in the bot's `database.js`. The website shares the same database — so user accounts, coins, cards, and Pokémon are all synced automatically between the bot and the website.

---

### 5. Deploy

Click **Create Web Service** — Render will:
1. Install dependencies (`npm install`)
2. Start the server (`node server.js`)
3. Give you a live URL like `https://konosuba-website.onrender.com`

> ⏱️ First deploy takes 2–5 minutes.

---

## Pages

| URL | Page |
|-----|------|
| `/` | Home — stats, features, links |
| `/signup` | Sign up with WhatsApp number |
| `/login` | Login |
| `/profile` | Your profile (cards, Pokémon, inventory) |
| `/shop` | Item shop — buy with bot coins |
| `/leaderboard` | Top 50 players by XP/coins/level |
| `/cards` | Full card gallery with filters |
| `/pokemons` | Live Pokédex from PokéAPI |
| `/daily` | Claim daily reward with countdown |

---

## How Phone Linking Works

When a user **signs up on the website** with their WhatsApp number:
- The website creates/updates their record in the **same MongoDB collection** the bot uses (`users`)
- The bot identifies users by phone number
- So when you sign up as `2347052309386` on the web, the bot will recognize you when you message from that number
- Coins, cards, inventory — all synced in real time between bot and website

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MongooseError: buffering timed out` | Check your `MONGO_URI` env var is set correctly |
| Cards page shows 0 cards | Make sure `data/cards_mazoku.json` is in the deployed files |
| 404 on all pages | Ensure `startCommand` is `node server.js` not `npm start` |
| Site loads but login fails | Check `JWT_SECRET` env var is set |
| Render keeps sleeping (free tier) | Upgrade to Starter ($7/mo) for always-on |

---

## Local Testing Before Deploy

```bash
cd konosuba-website
npm install
MONGO_URI="your-mongo-uri" JWT_SECRET="test-secret" node server.js
# Open http://localhost:3000
```

---

## Re-deploying After Changes

After editing files:
```bash
git add .
git commit -m "Update"
git push
```
Render auto-deploys on every push to `main`.

---

## Need Help?
Check Render logs: Dashboard → Your Service → **Logs** tab.
