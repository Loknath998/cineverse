/*
# Create CineVerse shared app state

1. New Tables
- `cineverse_state` stores the app's watchlist, favorites, watched titles, followed people, and profile settings.
- `id` identifies the single CineVerse workspace state.
- `watchlist`, `favorites`, and `watched` store TMDB movie IDs as JSON arrays.
- `profile` stores the display name and short profile details as JSON.
- `created_at` and `updated_at` track lifecycle changes.
2. Security
- Row level security is enabled.
- This V1 has no sign-in screen, so anon and authenticated users can access the intentionally shared workspace state.
- Separate CRUD policies are included for predictable browser access.
3. Important notes
- The row is seeded with empty lists and a default profile.
- No existing user data is changed or removed.
*/

CREATE TABLE IF NOT EXISTS public.cineverse_state (
  id text PRIMARY KEY,
  watchlist jsonb NOT NULL DEFAULT '[]'::jsonb,
  favorites jsonb NOT NULL DEFAULT '[]'::jsonb,
  watched jsonb NOT NULL DEFAULT '[]'::jsonb,
  profile jsonb NOT NULL DEFAULT '{"name":"Harper Quinn","location":"Night film, long takes, and anything shot on 35mm."}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.cineverse_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cineverse_state_select" ON public.cineverse_state;
CREATE POLICY "cineverse_state_select" ON public.cineverse_state FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "cineverse_state_insert" ON public.cineverse_state;
CREATE POLICY "cineverse_state_insert" ON public.cineverse_state FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "cineverse_state_update" ON public.cineverse_state;
CREATE POLICY "cineverse_state_update" ON public.cineverse_state FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "cineverse_state_delete" ON public.cineverse_state;
CREATE POLICY "cineverse_state_delete" ON public.cineverse_state FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.cineverse_state (id)
VALUES ('default')
ON CONFLICT (id) DO NOTHING;
