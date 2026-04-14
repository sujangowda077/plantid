# 🌿 Botanica v3 — AI Plant Detection App

A production-ready, full-stack plant identification app built with **Next.js 14 (App Router)**, **Supabase**, and **PlantNet AI**.

---

## ✅ Bug Fixes in v3

| File | Bug | Fix |
|---|---|---|
| `components/Navbar.jsx` | `../lib/` import path wrong (crashes) | `@/lib/` alias |
| `components/PlantCard.jsx` | `../lib/savePlant` wrong path | `@/lib/savePlant` |
| `components/CareTipsCard.jsx` | `../lib/careTips` wrong path | `@/lib/careTips` |
| `components/Navbar.jsx` | `../hooks/useDarkMode` wrong path | `@/hooks/useDarkMode` |
| All files | No `@/` alias configured | Added `jsconfig.json` |
| `next.config.js` | Deprecated `images.domains` | Upgraded to `remotePatterns` |
| `PlantCard.jsx` | `confirmDelete` never auto-resets | 4-second timeout auto-cancel |
| `detect/page.jsx` | Save errors not shown to user | Proper error state displayed |
| `imageUtils.js` | No SSR safety — crashes server | `typeof window` guards added |
| `useDarkMode.js` | No OS preference live listener | Added `matchMedia` event listener |
| `api/detect/route.js` | PlantNet 404 crashes app | Handled as "no match found" |

---

## ✨ What's New in v3

### Dashboard
- **Tabs** — All Plants / Favourites with live count badges
- **A→Z sort** option added
- **Notes search** — search filters now include `user_notes`
- **Real-time updates** — Supabase channel auto-adds new plants without refresh
- **User greeting** — "Welcome back, [name]"

### Detect Page
- **Camera flip** button (front ↔ rear)
- **Upload drag-and-drop** zone alongside camera
- **Result overlay on image** — shows name and confidence score on the photo
- **Dismissable alerts** — ×-close on error/warning banners
- **"Proceed anyway"** on blur warnings instead of hard block

### Login Page
- **Password show/hide** toggle (👁️ / 🙈)
- **Dismissable error** banner with × button
- **Floating leaf** animation on logo

### Navbar
- **Scroll shadow** — elevates navbar on scroll
- **Breadcrumbs** on desktop
- **User avatar initial** pill on large screens
- **Mobile back** button always visible

### PlantCard
- **Alternatives expandable** — show/hide other API matches inline
- **Confidence badge on image** overlay
- **Delete with timeout** — "Sure?" auto-cancels after 4 s

### CareTipsCard
- **Collapsible** — click header to toggle open/closed
- **Quick reference chips** at the bottom

### Code Quality
- All `@/` imports consistent across every file
- `jsconfig.json` so VS Code and Next.js both resolve aliases correctly
- `@layer components` and `@layer utilities` in CSS — Tailwind purge safe
- All custom class names (`card`, `btn-primary`, `badge`, `chip`, etc.) properly defined in component layer
- SSR-safe image utilities (no `window` access at module level)
- OS theme-change listener in `useDarkMode`

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
# → Fill in Supabase URL, anon key, PlantNet key

# 3. Run Supabase SQL
# → Paste supabase-setup.sql into Supabase SQL Editor → Run

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

---

## 🗂 Project Structure

```
botanica-v3/
├── app/
│   ├── layout.jsx              # Root layout (dark-mode flash prevention)
│   ├── page.jsx                # → /login redirect
│   ├── globals.css             # Full design system + CSS variables
│   ├── login/page.jsx          # Email + Google OAuth
│   ├── dashboard/page.jsx      # Collection — tabs, search, sort, realtime
│   ├── detect/page.jsx         # Camera + upload → detect → save
│   └── api/detect/route.js     # 🔒 Server-side PlantNet proxy
├── components/
│   ├── Navbar.jsx              # Header — breadcrumbs, dark toggle, user pill
│   ├── ConfidenceBar.jsx       # Animated colour-coded bar
│   ├── CareTipsCard.jsx        # Collapsible care guide
│   └── PlantCard.jsx           # Dashboard card — fav, notes, delete, alternatives
├── hooks/
│   └── useDarkMode.js          # Dark/light theme with OS listener
├── lib/
│   ├── supabaseClient.js       # Singleton Supabase client
│   ├── getUser.js              # Auth helper
│   ├── savePlant.js            # Full CRUD + getPlantById
│   ├── imageUtils.js           # Blur detect, resolution check, compress (SSR-safe)
│   └── careTips.js             # 12-plant care database
├── jsconfig.json               # @/ path alias
├── supabase-setup.sql          # Run once in Supabase SQL Editor
└── .env.local.example
```

---

## 🗃 Database Schema

```sql
Table: plants
  id           uuid        PK — auto generated
  user_id      uuid        FK → auth.users (cascade delete)
  plant_name   text        Common name from PlantNet
  scientific   text        Scientific name
  family       text        Plant family
  confidence   float4      0.0 – 1.0
  image_url    text        Base64 data URI
  alternatives jsonb       [{name, scientific, confidence}]
  care_tips    jsonb       {water, sunlight, soil, humidity, notes}
  user_notes   text        User personal notes
  is_favorite  boolean     Default false
  created_at   timestamptz Auto timestamp
```

**RLS**: Users can only read/write their own rows — enforced at DB level.

---

## 🔐 Environment Variables

| Variable | Side | Required | Notes |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | ✅ | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | ✅ | Public anon key (safe with RLS) |
| `PLANTNET_API_KEY` | **Server only** | ✅ | Never use `NEXT_PUBLIC_` prefix |
| `PLANTID_API_KEY` | **Server only** | Optional | For Plant.id integration |

---

## 🚀 Deploy to Vercel

```bash
npx vercel --prod
```

Add all variables in Vercel → **Settings → Environment Variables**.

Update Supabase → **Authentication → URL Configuration**:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 📡 Enable Real-Time Updates

Run once in Supabase SQL Editor:
```sql
alter publication supabase_realtime add table public.plants;
```

The dashboard will then auto-add newly detected plants without refreshing.

---

## 🔭 Upgrade Path

| Upgrade | How |
|---|---|
| Plant.id (more accurate) | Set `PLANTID_API_KEY`, uncomment Plant.id block in `api/detect/route.js` |
| Supabase Storage (vs base64) | Replace `image_url` base64 with `supabase.storage.upload()` |
| PWA / offline | Add `next-pwa` package + service worker |
| React Native | Share `lib/` helpers; replace Webcam with `expo-camera` |
