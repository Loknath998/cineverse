# 🎬 CineVerse

> **Your cinematic universe of movies.**

CineVerse is a cinematic movie discovery and personal movie-library web app powered by the **TMDB API**. Explore movies, people and collections, discover similar titles, and keep your favorites, watchlist and library in one place.

## ✨ Features

- 🎬 Movie discovery and detailed movie pages
- 🔎 Global search for movies, people and collections
- 🎞️ TMDB posters, backdrops, ratings, cast and crew
- 🧩 Collection and franchise browsing
- 🤖 Movie-specific recommendations and similar movies
- ⚖️ **Movie Compare** — put any two films head to head: ratings, runtime, genres, director, writers, cinematography, composer, shared cast/crew connections, and your own rating/watch status for each
- ❤️ Favorites
- 🔖 Watchlist
- 📚 Personal library
- 🎥 In-app trailer experience
- ☀️🌙 Dark / light theme with a smooth cross-fade transition
- 📱 Fully responsive cinematic UI (desktop, laptop, tablet, mobile)
- 🔐 Optional email + password accounts (Supabase) with cross-device sync
- 💾 Persistent user-side preferences and lists — local-only by default, cloud-synced when signed in

## 🛠️ Tech Stack

- React
- Create React App
- React Router
- Tailwind CSS
- TMDB API
- Supabase (Auth + Postgres) — optional, for account sync

## 🚀 Getting Started

### 1. Clone

```bash
git clone https://github.com/Loknath998/cineverse-react.git
cd cineverse-react
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure TMDB

Create a `.env` file in the project root:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
```

Keep `.env` out of Git. Commit `.env.example` with only a placeholder value.

> Without a TMDB key, CineVerse still runs — it falls back to a small bundled
> demo catalogue so every page stays browsable.

### 4. (Optional) Enable account sync with Supabase

By default CineVerse works with no login — everything is saved to
`localStorage` in your browser. To add real email/password accounts and
sync your watchlist, ratings, notes and profile across devices:

1. Create a free project at [supabase.com](https://supabase.com).
2. In your Supabase project, open **SQL Editor → New query**, paste the
   contents of [`supabase/schema.sql`](./supabase/schema.sql), and run it.
   This creates one table (`user_data`) with row-level security so each
   user can only ever read or write their own row.
3. In **Project Settings → API**, copy the **Project URL** and the
   **anon/public key**.
4. Add them to your `.env`:

   ```env
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. (Optional, for the quickest local testing) In **Authentication →
   Providers → Email**, you can turn off "Confirm email" so new accounts are
   active immediately. Leave it on for a production deployment — CineVerse
   already handles the "check your inbox to confirm" flow either way.

Restart `npm start` after editing `.env` — Create React App only reads
`.env` when the dev server starts, so changes while it's already running
won't take effect until you restart it. If these two variables are left
blank, CineVerse keeps running exactly as before, local-only, with no login
UI forced on anyone.

#### Verifying sync is actually working

CineVerse never fails silently here: if a write to Supabase fails for any
reason, your Profile page shows a **"SYNC FAILED"** badge with the exact
error message underneath it (and the same message is logged to the browser
console prefixed `[CineVerse]`). If you see that badge, the message itself
tells you what's wrong — the two most common causes are:

- **`relation "public.user_data" does not exist`** — `supabase/schema.sql`
  hasn't been run yet in this project. Run it in the SQL Editor (step 2
  above).
- **`new row violates row-level security policy`** — the table exists but
  the RLS policies from `schema.sql` weren't applied (re-run the script; it's
  safe to run more than once).

To confirm data is really landing in Supabase: sign in, add a film to your
watchlist, then open **Table Editor → user_data** in your Supabase
dashboard — you should see one row for your account with a `data` column
containing your watchlist/watched/favourites/ratings as JSON. Refreshing the
CineVerse page should keep your list; signing out and into a different
account should show that account's own (empty, at first) list, never the
first account's.

### 5. Start CineVerse

```bash
npm start
```

The app runs at `http://localhost:3000`.

## 📁 Project Structure

```text
cineverse-react/
├── public/
├── src/
│   ├── components/site/    # Navbar, footer, poster/media cards, movie picker, actions
│   ├── lib/                 # TMDB client, routing helpers, auth, Supabase sync, compare logic
│   └── routes/               # One file per page, incl. routes/compare.tsx
├── supabase/
│   └── schema.sql           # user_data table + RLS policies
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🔐 Environment Variables

| Variable | Purpose | Required? |
|---|---|---|
| `REACT_APP_TMDB_API_KEY` | TMDB API access | Optional — falls back to bundled demo data |
| `REACT_APP_SUPABASE_URL` | Supabase project URL | Optional — falls back to local-only storage |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anon/public key | Optional — falls back to local-only storage |

## 🔄 How data sync works

- Signed out: everything lives in `localStorage` on the current device,
  under its own guest key.
- Signed in (Supabase configured): on login, CineVerse fetches your
  `user_data` row — if you're a returning user, that row's data replaces
  what's shown; if it's your first time signing in, your current
  browser data is used to create that row, so nothing already in progress
  is lost. From then on, every change is written back to Supabase (debounced
  ~400ms, with an immediate flush if you switch tabs or close the page) as
  well as to a per-account localStorage key, so it's available on any device
  you sign into and still works offline.
- RLS policies mean the Supabase anon key alone is never enough to read or
  write anyone else's row — only an authenticated request from that same
  user can touch it. Signing out and into a different account never shows
  the previous account's data, even on the same browser.
- Failures are surfaced, not swallowed: a failed sync shows a "SYNC FAILED"
  badge with the real error message on the Profile page (see above).


## 🎨 Branding

CineVerse is built around a premium cinematic visual style with a dark-first identity and a carefully balanced light theme.

> **Vibe coded by Loknath ❤️**

## 📜 Credits

Movie data, posters, backdrops and metadata are provided by **The Movie Database (TMDB)**.

CineVerse is an independent project and is not affiliated with TMDB.

## ⭐ Support

If you like the project, give the repository a ⭐ on GitHub.

---

Made with 🎬 and ❤️ by **Loknath**