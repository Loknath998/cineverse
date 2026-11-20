/**
 * Persistence for the single per-user CineVerse data row (see
 * supabase/schema.sql: public.user_data). One JSON blob per signed-in user
 * — the same shape lib/library.tsx already keeps in localStorage — so
 * syncing is just "load it in, debounce-save it back out".
 *
 * Both functions return a structured result (never throw) so the caller can
 * tell "no data yet" apart from "the request failed", and show the real
 * error message instead of failing silently.
 */

import { supabase } from "./supabase";

export type FetchResult = { ok: true; data: unknown | null } | { ok: false; error: string };
export type SaveResult = { ok: true } | { ok: false; error: string };

function sanitizeErrorMessage(msg: string): string {
  if (msg.toLowerCase().includes("permission denied for table user_data")) {
    return "Supabase permission denied: run the updated supabase/schema.sql in your Supabase SQL editor to GRANT table access.";
  }
  return msg;
}

export async function fetchUserData(userId: string): Promise<FetchResult> {
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      const cleanMsg = sanitizeErrorMessage(error.message);
      console.error("[CineVerse] Failed to load synced data:", cleanMsg);
      return { ok: false, error: cleanMsg };
    }
    return { ok: true, data: data?.data ?? null };
  } catch (err) {
    const message = err instanceof Error ? sanitizeErrorMessage(err.message) : "Unknown error while loading synced data.";
    console.error("[CineVerse] Failed to load synced data:", message);
    return { ok: false, error: message };
  }
}

export async function saveUserData(userId: string, data: unknown): Promise<SaveResult> {
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  try {
    const { error } = await supabase
      .from("user_data")
      .upsert({ user_id: userId, data, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

    if (error) {
      const cleanMsg = sanitizeErrorMessage(error.message);
      console.error("[CineVerse] Failed to sync data:", cleanMsg);
      return { ok: false, error: cleanMsg };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? sanitizeErrorMessage(err.message) : "Unknown error while syncing data.";
    console.error("[CineVerse] Failed to sync data:", message);
    return { ok: false, error: message };
  }
}
