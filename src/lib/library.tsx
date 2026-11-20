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

export function isCorruptedEntry(entry: { title?: string } | undefined | null): boolean {
  if (!entry || typeof entry !== "object") return true;
  const title = (entry.title || "").trim();
  if (!title) return true;
  const lower = title.toLowerCase();
  if (
    lower.startsWith("date,name") ||
    lower.startsWith("name,year") ||
    lower.startsWith("date,") ||
    lower.startsWith("name,") ||
    lower.startsWith("date\tname")
  ) {
    return true;
  }
  if (title.includes("https://boxd.it") || title.includes("letterboxd.com") || title.includes("http://")) {
    return true;
  }
  if (title.includes(",") && (/\b\d{4}-\d{2}-\d{2}\b/.test(title) || (title.match(/,/g) || []).length >= 3)) {
    return true;
  }
  return false;
}

function readLocal(key: string): State {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<State>;
      const rawDiary = parsed.diary && Array.isArray(parsed.diary) ? parsed.diary : [];
      const cleanDiary = rawDiary.filter((e) => !isCorruptedEntry(e));
      const cleanWatched = (parsed.watched ?? []).filter((w) => !isCorruptedEntry(w));
      const cleanWatchlist = (parsed.watchlist ?? []).filter((w) => !isCorruptedEntry(w));
      const cleanFavorites = (parsed.favorites ?? []).filter((f) => !isCorruptedEntry(f));
      const cleanActivity = (parsed.activity ?? []).filter((a) => !isCorruptedEntry(a));

      const initialDiary =
        cleanDiary.length > 0
          ? cleanDiary
          : cleanWatched.map((w) => ({
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
        watched: cleanWatched,
        watchlist: cleanWatchlist,
        favorites: cleanFavorites,
        activity: cleanActivity,
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
  importLetterboxdCsv: (input: string | any[]) => number;
  clearCorruptedEntries: () => void;
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
        const cleanDiary = (remote.diary ?? []).filter((e: any) => !isCorruptedEntry(e));
        const cleanWatched = (remote.watched ?? []).filter((w: any) => !isCorruptedEntry(w));
        const cleanWatchlist = (remote.watchlist ?? []).filter((w: any) => !isCorruptedEntry(w));
        const cleanFavorites = (remote.favorites ?? []).filter((f: any) => !isCorruptedEntry(f));
        const cleanActivity = (remote.activity ?? []).filter((a: any) => !isCorruptedEntry(a));
        setState({
          ...EMPTY,
          ...remote,
          diary: cleanDiary,
          watched: cleanWatched,
          watchlist: cleanWatchlist,
          favorites: cleanFavorites,
          activity: cleanActivity,
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

  const importLetterboxdCsv = useCallback((input: string | any[]): number => {
    try {
      let items: any[] = [];
      if (Array.isArray(input)) {
        items = input;
      } else if (typeof input === "string") {
        const clean = input.replace(/^\uFEFF/, "").trim();
        const lines = clean.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
        if (lines.length >= 1) {
          const parseLine = (line: string): string[] => {
            const cols: string[] = [];
            let cur = "";
            let inQuotes = false;
            for (let i = 0; i < line.length; i++) {
              const c = line[i];
              if (c === '"') {
                if (inQuotes && line[i + 1] === '"') {
                  cur += '"';
                  i++;
                } else {
                  inQuotes = !inQuotes;
                }
              } else if (c === "," && !inQuotes) {
                cols.push(cur.trim().replace(/^"|"$/g, ""));
                cur = "";
              } else {
                cur += c;
              }
            }
            cols.push(cur.trim().replace(/^"|"$/g, ""));
            return cols;
          };

          const firstCols = parseLine(lines[0]);
          const normHeaders = firstCols.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
          let nameIdx = normHeaders.findIndex((h) => ["name", "title", "film", "movie"].includes(h));
          let yearIdx = normHeaders.findIndex((h) => ["year", "releaseyear"].includes(h));
          let ratingIdx = normHeaders.findIndex((h) => ["rating", "yourrating"].includes(h));
          let dateIdx = normHeaders.indexOf("watcheddate");
          if (dateIdx === -1) dateIdx = normHeaders.indexOf("date");
          let rewatchIdx = normHeaders.findIndex((h) => ["rewatch"].includes(h));
          let startRow = 1;

          if (nameIdx === -1) {
            if (firstCols.length >= 2) {
              nameIdx = /^\d{4}-\d{2}-\d{2}$/.test(firstCols[0]) ? 1 : 0;
              yearIdx = nameIdx === 1 ? 2 : 1;
              ratingIdx = 4;
              dateIdx = 0;
              startRow = 0;
            } else {
              nameIdx = 0;
              yearIdx = 1;
              startRow = 0;
            }
          }

          for (let i = startRow; i < lines.length; i++) {
            const row = parseLine(lines[i]);
            const title = (row[nameIdx] || "").trim();
            if (!title || title.toLowerCase() === "name" || title.toLowerCase() === "title") continue;
            const year = yearIdx !== -1 && row[yearIdx] ? row[yearIdx].trim() : "—";
            const date = dateIdx !== -1 && row[dateIdx] ? row[dateIdx].trim() : new Date().toISOString().slice(0, 10);
            const ratingRaw = ratingIdx !== -1 && row[ratingIdx] ? parseFloat(row[ratingIdx]) : NaN;
            const rating = !isNaN(ratingRaw) && ratingRaw > 0 ? Math.min(10, Math.round(ratingRaw <= 5 ? ratingRaw * 2 : ratingRaw)) : undefined;
            const rewatch = rewatchIdx !== -1 && ["yes", "true", "1", "rewatch"].includes((row[rewatchIdx] || "").toLowerCase().trim());
            items.push({ name: title, title, year, date, rating, rewatch });
          }
        }
      }

      console.log("[Letterboxd Import] Parsed entries:", items);

      if (!items.length) return 0;

      let importedCount = 0;
      const newDiaryEntries: DiaryEntry[] = [];
      const newWatched: LibraryEntry[] = [];
      const newRatings: Record<number, number> = {};

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const title = (item.name || item.title || "").trim();
        if (!title || isCorruptedEntry({ title })) continue;

        const movieId =
          item.tmdbId ||
          item.id ||
          Math.abs(title.split("").reduce((acc: number, char: string) => (acc << 5) - acc + char.charCodeAt(0), 0));

        const poster = item.poster || item.posterPath || null;
        const year = item.year || "—";
        const date = item.date || item.watchedDate || new Date().toISOString().slice(0, 10);
        const rating = item.rating;
        const rewatch = Boolean(item.rewatch);

        newDiaryEntries.push({
          id: `lb-${Date.now()}-${i}`,
          movieId,
          title,
          poster,
          year,
          watchedDate: date,
          rating,
          rewatch,
          loggedAt: Date.now() - i * 1000,
        });

        newWatched.push({
          id: movieId,
          title,
          poster,
          year,
          rating: rating ?? 0,
          addedAt: Date.now(),
        });

        if (rating) newRatings[movieId] = rating;
        importedCount++;
      }

      if (importedCount > 0) {
        setState((prev) => {
          const importedTitles = new Set(newDiaryEntries.map((e) => e.title.toLowerCase().trim()));
          const existingDiary = prev.diary.filter((e) => !importedTitles.has(e.title.toLowerCase().trim()));

          const importedMovieIds = new Set(newWatched.map((w) => w.id));
          const existingWatched = prev.watched.filter((w) => !importedMovieIds.has(w.id));

          return {
            ...prev,
            diary: [...newDiaryEntries, ...existingDiary],
            watched: [...newWatched, ...existingWatched],
            ratings: { ...prev.ratings, ...newRatings },
          };
        });
      }

      return importedCount;
    } catch (err) {
      console.error("[Letterboxd Import] Error importing CSV:", err);
      return 0;
    }
  }, []);

  const clearCorruptedEntries = useCallback(() => {
    setState((prev) => ({
      ...prev,
      diary: prev.diary.filter((e) => !isCorruptedEntry(e)),
      watched: prev.watched.filter((w) => !isCorruptedEntry(w)),
      watchlist: prev.watchlist.filter((w) => !isCorruptedEntry(w)),
      favorites: prev.favorites.filter((f) => !isCorruptedEntry(f)),
      activity: prev.activity.filter((a) => !isCorruptedEntry(a)),
    }));
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
      clearCorruptedEntries,
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
      clearCorruptedEntries,
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
