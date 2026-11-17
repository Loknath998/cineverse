/**
 * Supabase client (browser).
 *
 * Configure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in .env.
 * See supabase/schema.sql for the table + RLS policies this app expects,
 * and README.md for step-by-step setup.
 *
 * If credentials aren't configured, `supabase` is null and the app quietly
 * falls back to local-only storage (see lib/library.tsx) — mirroring how
 * lib/tmdb.ts falls back to bundled demo data when no TMDB key is set, so
 * the project always runs after a plain `npm install && npm start`.
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (process.env.REACT_APP_SUPABASE_URL ?? "").trim();
const SUPABASE_ANON_KEY = (process.env.REACT_APP_SUPABASE_ANON_KEY ?? "").trim();

export const SUPABASE_CONFIGURED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = SUPABASE_CONFIGURED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "cineverse-auth",
      },
    })
  : null;

let warned = false;
export function warnIfUnconfigured() {
  if (warned || SUPABASE_CONFIGURED) return;
  warned = true;
  // Informational only — the app keeps working in local-only mode.
  console.info(
    "[CineVerse] Supabase isn't configured (REACT_APP_SUPABASE_URL / REACT_APP_SUPABASE_ANON_KEY missing). Running with local-only storage — see README.md to enable account sync.",
  );
}
