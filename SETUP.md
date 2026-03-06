# 🏃‍♀️ Bonnie's Marathon App — Deployment Guide

Follow these steps in order. Takes about 20 minutes total.

---

## Step 1 — Create a GitHub account (5 min)

1. Go to **github.com** and click **Sign up**
2. Choose a username, enter your email, create a password
3. Verify your email

---

## Step 2 — Upload the app files to GitHub (5 min)

1. Once logged in, click the **+** button (top right) → **New repository**
2. Name it: `bonnie-marathon`
3. Set it to **Private**
4. Click **Create repository**
5. Click **uploading an existing file** (the link in the middle of the page)
6. **Drag the entire `bonnie-marathon` folder** contents into the upload area:
   - `netlify.toml`
   - `public/` folder (with `index.html`, `manifest.json`)
   - `netlify/` folder (with `functions/` inside)
7. Click **Commit changes**

---

## Step 3 — Deploy on Netlify (5 min)

1. Go to **netlify.com** → click **Sign up** → choose **Sign up with GitHub**
2. Click **Add new site** → **Import an existing project**
3. Click **GitHub** → select your `bonnie-marathon` repository
4. Leave all build settings as default (Netlify detects the `netlify.toml` automatically)
5. Click **Deploy site**
6. Wait ~1 minute — Netlify gives you a URL like `random-name-123.netlify.app`
7. Click **Site settings** → **Domain management** → rename it to something like `bonnie-marathon.netlify.app`

---

## Step 4 — Create a Strava API app (5 min)

1. Go to **strava.com/settings/api**
2. Fill in:
   - **Application Name:** Bonnie Marathon
   - **Category:** Other
   - **Club:** leave blank
   - **Website:** your Netlify URL (e.g. `https://bonnie-marathon.netlify.app`)
   - **Authorization Callback Domain:** your Netlify domain (e.g. `bonnie-marathon.netlify.app`)
3. Click **Create**
4. You'll see your **Client ID** and **Client Secret** — copy both

---

## Step 5 — Add your Strava keys to Netlify (2 min)

1. In Netlify, go to **Site settings** → **Environment variables**
2. Add these two variables:

| Key | Value |
|-----|-------|
| `STRAVA_CLIENT_ID` | your Client ID from Strava (just the number) |
| `STRAVA_CLIENT_SECRET` | your Client Secret from Strava |

3. Click **Save**
4. Go to **Deploys** → click **Trigger deploy** → **Deploy site**

---

## Step 6 — Open your app and connect Strava! 🎉

1. Go to your Netlify URL (e.g. `https://bonnie-marathon.netlify.app`)
2. Tap **Connect Strava 🟠**
3. Log in to Strava and click **Authorize**
4. You'll be redirected back to your app with all your runs loaded!

---

## Add to your iPhone home screen

1. Open your app URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Tap **Add**

Now it works like a real app! 🏅

---

## After that — fully automatic!

Every time you open the app, it fetches your latest Strava runs automatically.
No Zapier, no Google Sheets, no manual anything. Just run and open the app. 🟠
