import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import { useAuth } from "./auth";
import { fetchUserData, saveUserData } from "./user-data";

/**
 * Client-side library store (watchlist, favorites, watched, ratings, notes,
 * diary, activity, profile). Always mirrored to localStorage so the app works
 * fully offline / signed-out. When a user is signed in (see lib/auth.tsx),
 * the same JSON shape is also synced to Supabase (see lib/user-data.ts +
 * supabase/schema.sql) so it persists across devices and is protected by
 * row-level security.
 */

export type LibraryEntry = {
  id: number;
  title: string;
  poster: string | null;
  year: string;
  rating: number;
  addedAt: number;
};

export type DiaryEntry = {
  id: string;
  movieId: number;
  title: string;
  poster: string | null;
  year: string;
  watchedDate: string; // YYYY-MM-DD
  rating?: number; // 1-10
  rewatch: boolean;
  review?: string;
  loggedAt: number;
};

type Activity = {
  id: number;
  title: string;
  poster: string | null;
  kind: "rated" | "watched" | "watchlist" | "favorite" | "diary";
  value?: number;
  at: number;
};

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  favouriteEra: string;
};

type State = {
  watchlist: LibraryEntry[];
  favorites: LibraryEntry[];
  watched: LibraryEntry[];
  ratings: Record<number, number>;
  notes: Record<number, string>;
  diary: DiaryEntry[];
  activity: Activity[];
  profile: Profile;
};

const DEFAULT_PROFILE: Profile = {
  name: "Guest Cinephile",
  handle: "@guest",
  bio: "Watching widely, rating honestly.",
  favouriteEra: "1970s",
};

const EMPTY: State = {
  watchlist: [],
  favorites: [],
  watched: [],
  ratings: {},
  notes: {},
  diary: [],
  activity: [],
  profile: DEFAULT_PROFILE,
};

const GUEST_KEY = "cineverse.library.v1.guest";
const legacyKey = () => "cineverse.library.v1"; // pre-accounts key, migrated once below
const keyFor = (userId: string | null) => (userId ? `cineverse.library.v1.user.${userId}` : GUEST_KEY);

function readLocal(key: string): State {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      const diary = parsed.diary && Array.isArray(parsed.diary) ? parsed.diary : [];
      // If diary is empty but watched has entries, seed diary from watched
      const initialDiary =
        diary.length > 0
          ? diary
          : (parsed.watched ?? []).map((w) => ({
              id: `seed-${w.id}-${w.addedAt}`,
              movieId: w.id,
              title: w.title,
              poster: w.poster,
              year: w.year,
              watchedDate: new Date(w.addedAt).toISOString().slice(0, 10),
              rating: parsed.ratings?.[w.id],
              rewatch: false,
              review: parsed.notes?.[w.id],
              loggedAt: w.addedAt,
            }));

      return {
        ...EMPTY,
        ...parsed,
        diary: initialDiary,
        profile: { ...DEFAULT_PROFILE, ...(parsed.profile ?? {}) },
      };
    }
  } catch {
    /* ignore corrupt storage */
  }
  return EMPTY;
}

function migrateLegacyGuestData() {
  try {
    const legacy = localStorage.getItem(legacyKey());
    if (legacy && !localStorage.getItem(GUEST_KEY)) {
      localStorage.setItem(GUEST_KEY, legacy);
    }
  } catch {
    /* ignore */
  }
}

type Ctx = Omit<State, "profile"> & {
  profile: Profile;
  ready: boolean;
  /** True while an authenticated user's data is being pulled from / pushed to Supabase. */
  syncing: boolean;
  /** Signed in + Supabase configured, i.e. this library is cloud-backed rather than local-only. */
  cloudSynced: boolean;
  /** The most recent Supabase error, if any (cleared on the next successful sync). Show this in the UI — don't fail silently. */
  syncError: string | null;
  has: (list: "watchlist" | "favorites" | "watched", id: number) => boolean;
  toggle: (
    list: "watchlist" | "favorites" | "watched",
    movie: Omit<LibraryEntry, "addedAt">,
  ) => void;
  rate: (movie: Omit<LibraryEntry, "addedAt">, value: number) => void;
  setNote: (movieId: number, note: string) => void;
  logToDiary: (entry: {
    movieId: number;
    title: string;
    poster: string | null;
    year: string;
    watchedDate?: string;
    rating?: number;
    rewatch?: boolean;
    review?: string;
  }) => void;
  removeDiaryEntry: (id: string) => void;
  importLetterboxdCsv: (csvText: string) => number;
  remove: (list: "watchlist" | "favorites" | "watched", ids: number[]) => void;
  reorderFavorites: (ids: number[]) => void;
  saveProfile: (next: Partial<Profile>) => void;
};

const LibraryContext = createContext<Ctx | null>(null);

const SYNC_DEBOUNCE_MS = 400;

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, configured, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [state, setState] = useState<State>(EMPTY);
  const [ready, setReady] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const saveTimer = useRef<number | undefined>(undefined);
  const skipNextPush = useRef(false);
  const lastLoadedUserId = useRef<string | null | undefined>(undefined);
  const stateRef = useRef(state);
  stateRef.current = state;
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  useEffect(() => {
    if (authLoading) return;
    setReady(false);
    migrateLegacyGuestData();
    const key = keyFor(userId);
    setState(readLocal(key));
    setReady(true);
  }, [userId, authLoading]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(keyFor(userId), JSON.stringify(state));
    } catch {
      /* storage full */
    }
  }, [state, ready, userId]);

  useEffect(() => {
    if (!userId || !configured || !ready) return;
    if (lastLoadedUserId.current === userId) return;
    lastLoadedUserId.current = userId;

    let cancelled = false;
    setSyncing(true);
    (async () => {
      const result = await fetchUserData(userId);
      if (cancelled) return;

      if (!result.ok) {
        setSyncError(result.error);
        setSyncing(false);
        return;
      }

      setSyncError(null);
      if (result.data && typeof result.data === "object") {
        skipNextPush.current = true;
        const remote = result.data as Partial<State>;
        setState({
          ...EMPTY,
          ...remote,
          diary: remote.diary ?? [],
          profile: { ...DEFAULT_PROFILE, ...(remote.profile ?? {}) },
        });
      } else {
        const seedResult = await saveUserData(userId, stateRef.current);
        if (!cancelled && !seedResult.ok) setSyncError(seedResult.error);
      }
      if (!cancelled) setSyncing(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, configured, ready]);

  useEffect(() => {
    if (!userId) {
      lastLoadedUserId.current = undefined;
      setSyncError(null);
    }
  }, [userId]);

  const flushPendingSave = useCallback(() => {
    if (!userIdRef.current || !configured) return;
    if (saveTimer.current === undefined) return;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = undefined;
    setSyncing(true);
    saveUserData(userIdRef.current, stateRef.current).then((result) => {
      setSyncing(false);
      setSyncError(result.ok ? null : result.error);
    });
  }, [configured]);

  useEffect(() => {
    if (!userId || !configured || !ready) return;
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = undefined;
      setSyncing(true);
      saveUserData(userId, state).then((result) => {
        setSyncing(false);
        setSyncError(result.ok ? null : result.error);
      });
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (saveTimer.current !== undefined) window.clearTimeout(saveTimer.current);
    };
  }, [state, userId, configured, ready]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flushPendingSave);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flushPendingSave);
    };
  }, [flushPendingSave]);

  const has = useCallback(
    (list: "watchlist" | "favorites" | "watched", id: number) =>
      state[list].some((e) => e.id === id),
    [state],
  );

  const toggle = useCallback<Ctx["toggle"]>((list, movie) => {
    setState((prev) => {
      const exists = prev[list].some((e) => e.id === movie.id);
      const next = exists
        ? prev[list].filter((e) => e.id !== movie.id)
        : [{ ...movie, addedAt: Date.now() }, ...prev[list]];
      const activity: Activity[] = exists
        ? prev.activity
        : [
            {
              id: movie.id,
              title: movie.title,
              poster: movie.poster,
              kind: (list === "favorites"
                ? "favorite"
                : list === "watched"
                  ? "watched"
                  : "watchlist") as Activity["kind"],
              at: Date.now(),
            },
            ...prev.activity,
          ].slice(0, 30);
      return { ...prev, [list]: next, activity };
    });
  }, []);

  const rate = useCallback<Ctx["rate"]>((movie, value) => {
    setState((prev) => ({
      ...prev,
      ratings: { ...prev.ratings, [movie.id]: value },
      watched: prev.watched.some((e) => e.id === movie.id)
        ? prev.watched
        : [{ ...movie, addedAt: Date.now() }, ...prev.watched],
      activity: [
        {
          id: movie.id,
          title: movie.title,
          poster: movie.poster,
          kind: "rated" as const,
          value,
          at: Date.now(),
        },
        ...prev.activity,
      ].slice(0, 30),
    }));
  }, []);

  const setNote = useCallback<Ctx["setNote"]>((movieId, note) => {
    setState((prev) => {
      const notes = { ...prev.notes };
      if (note.trim()) notes[movieId] = note;
      else delete notes[movieId];
      return { ...prev, notes };
    });
  }, []);

  const logToDiary = useCallback<Ctx["logToDiary"]>((entry) => {
    const today = new Date().toISOString().slice(0, 10);
    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      movieId: entry.movieId,
      title: entry.title,
      poster: entry.poster,
      year: entry.year,
      watchedDate: entry.watchedDate || today,
      rating: entry.rating,
      rewatch: Boolean(entry.rewatch),
      review: entry.review?.trim() || undefined,
      loggedAt: Date.now(),
    };

    setState((prev) => {
      const isAlreadyWatched = prev.watched.some((w) => w.id === entry.movieId);
      const nextWatched = isAlreadyWatched
        ? prev.watched
        : [{ id: entry.movieId, title: entry.title, poster: entry.poster, year: entry.year, rating: 0, addedAt: Date.now() }, ...prev.watched];

      const nextRatings = { ...prev.ratings };
      if (entry.rating) nextRatings[entry.movieId] = entry.rating;

      const nextNotes = { ...prev.notes };
      if (entry.review?.trim()) nextNotes[entry.movieId] = entry.review.trim();

      const activity: Activity[] = [
        {
          id: entry.movieId,
          title: entry.title,
          poster: entry.poster,
          kind: "diary" as const,
          value: entry.rating,
          at: Date.now(),
        },
        ...prev.activity,
      ].slice(0, 30);

      return {
        ...prev,
        diary: [newEntry, ...prev.diary],
        watched: nextWatched,
        ratings: nextRatings,
        notes: nextNotes,
        activity,
      };
    });
  }, []);

  const removeDiaryEntry = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      diary: prev.diary.filter((d) => d.id !== id),
    }));
  }, []);

  const importLetterboxdCsv = useCallback((csvText: string): number => {
    try {
      const lines = csvText.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return 0;
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/["']/g, ""));
      const dateIdx = headers.indexOf("date") !== -1 ? headers.indexOf("date") : headers.indexOf("watched date");
      const nameIdx = headers.indexOf("name");
      const yearIdx = headers.indexOf("year");
      const ratingIdx = headers.indexOf("rating");
      const rewatchIdx = headers.indexOf("rewatch");

      if (nameIdx === -1) return 0;

      let importedCount = 0;
      const newDiaryEntries: DiaryEntry[] = [];
      const newWatched: LibraryEntry[] = [];
      const newRatings: Record<number, number> = {};

      for (let i = 1; i < lines.length; i++) {
        // basic CSV quote-aware split
        const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((col) => col.trim().replace(/^"|"$/g, ""));
        const title = row[nameIdx];
        if (!title) continue;
        const year = yearIdx !== -1 && row[yearIdx] ? row[yearIdx] : "—";
        const date = dateIdx !== -1 && row[dateIdx] ? row[dateIdx] : new Date().toISOString().slice(0, 10);
        const ratingRaw = ratingIdx !== -1 ? parseFloat(row[ratingIdx]) : NaN;
        // Letterboxd uses 0.5-5.0 scale, CineVerse uses 1-10
        const rating = !isNaN(ratingRaw) ? Math.min(10, Math.round(ratingRaw * 2)) : undefined;
        const rewatch = rewatchIdx !== -1 && ["yes", "true", "1"].includes((row[rewatchIdx] || "").toLowerCase());

        // Use a deterministic pseudo-id based on title + year
        const syntheticId = Math.abs(
          title.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0),
        );

        newDiaryEntries.push({
          id: `lb-${Date.now()}-${i}`,
          movieId: syntheticId,
          title,
          poster: null,
          year,
          watchedDate: date,
          rating,
          rewatch,
          loggedAt: Date.now() - i * 1000,
        });

        newWatched.push({
          id: syntheticId,
          title,
          poster: null,
          year,
          rating: rating ?? 0,
          addedAt: Date.now(),
        });

        if (rating) newRatings[syntheticId] = rating;
        importedCount++;
      }

      if (importedCount > 0) {
        setState((prev) => ({
          ...prev,
          diary: [...newDiaryEntries, ...prev.diary],
          watched: [...newWatched, ...prev.watched],
          ratings: { ...prev.ratings, ...newRatings },
        }));
      }

      return importedCount;
    } catch {
      return 0;
    }
  }, []);

  const remove = useCallback<Ctx["remove"]>((list, ids) => {
    setState((prev) => ({ ...prev, [list]: prev[list].filter((e) => !ids.includes(e.id)) }));
  }, []);

  const reorderFavorites = useCallback((ids: number[]) => {
    setState((prev) => ({
      ...prev,
      favorites: ids
        .map((id) => prev.favorites.find((f) => f.id === id))
        .filter(Boolean) as LibraryEntry[],
    }));
  }, []);

  const saveProfile = useCallback((next: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...next } }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      ...state,
      ready,
      syncing,
      syncError,
      cloudSynced: Boolean(userId && configured),
      has,
      toggle,
      rate,
      setNote,
      logToDiary,
      removeDiaryEntry,
      importLetterboxdCsv,
      remove,
      reorderFavorites,
      saveProfile,
    }),
    [
      state,
      ready,
      syncing,
      syncError,
      userId,
      configured,
      has,
      toggle,
      rate,
      setNote,
      logToDiary,
      removeDiaryEntry,
      importLetterboxdCsv,
      remove,
      reorderFavorites,
      saveProfile,
    ],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary must be used inside LibraryProvider");
  return ctx;
}
