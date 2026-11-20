import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  Film,
  Grid,
  Loader2,
  Plus,
  Repeat,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useLibrary, isCorruptedEntry } from "../lib/library";
import type { DiaryEntry } from "../lib/library";
import { searchMovies } from "../lib/tmdb.api";
import { tmdb } from "../lib/tmdb";
import { img } from "../lib/tmdb-map";
import type { MovieCard } from "../lib/tmdb-map";
import { useLibraryFilms } from "../components/site/library-list";

export interface ParsedLetterboxdMovie {
  name: string;
  year?: string;
  rating?: number;
  watchedDate: string;
  rewatch: boolean;
  tmdbId?: number;
  poster?: string | null;
  status?: "pending" | "searching" | "found" | "not_found";
}

/**
 * Fallback poster placeholder with a sleek dark gold gradient and film icon.
 * Never renders as an empty or blank box.
 */
function MoviePosterFallback({
  title,
  year,
  className = "",
}: {
  title: string;
  year?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center p-2.5 text-center rounded-lg bg-gradient-to-br from-[#241c10] via-[#16130d] to-[#0d0c0a] border border-gold/25 shadow-inner select-none overflow-hidden ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/15 via-transparent to-transparent pointer-events-none" />
      <Film className="size-5 text-gold/80 mb-1.5 shrink-0 drop-shadow-[0_1px_4px_rgba(234,179,8,0.3)]" />
      <span className="font-display text-[0.68rem] font-semibold text-gold-soft line-clamp-2 leading-tight">
        {title}
      </span>
      {year && year !== "—" ? (
        <span className="mt-1 font-mono text-[0.58rem] text-muted-foreground">
          {year}
        </span>
      ) : null}
    </div>
  );
}

function cleanToken(token: string): string {
  let val = token.trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1).trim();
  }
  return val.replace(/""/g, '"');
}

function splitCsvRow(line: string, delim: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delim && !inQuotes) {
      cols.push(cleanToken(cur));
      cur = "";
    } else {
      cur += char;
    }
  }
  cols.push(cleanToken(cur));
  return cols;
}

/**
 * Robust, production-grade parser for Letterboxd CSV exports.
 * Detects delimiters (comma, tab, semicolon) and extracts ONLY:
 * - Name (string)
 * - Year (string)
 * - Rating (number)
 * - Watched Date (YYYY-MM-DD string)
 * - Rewatch (boolean)
 */
export function parseLetterboxdCsvText(text: string): ParsedLetterboxdMovie[] {
  const items: ParsedLetterboxdMovie[] = [];
  if (!text || !text.trim()) return items;

  // 1. Strip BOM and split non-empty lines
  const clean = text.replace(/^\uFEFF/, "").trim();
  const rawLines = clean.split(/\r\n|\n|\r/).map((l) => l.trim()).filter(Boolean);
  if (!rawLines.length) return items;

  // 2. Detect delimiter (comma vs tab vs semicolon)
  const sample = rawLines.slice(0, 5).join("\n");
  const tabs = (sample.match(/\t/g) || []).length;
  const commas = (sample.match(/,/g) || []).length;
  const semis = (sample.match(/;/g) || []).length;
  const delimiter = tabs > commas && tabs > semis ? "\t" : semis > commas && semis > tabs ? ";" : ",";

  // 3. Normalize headers
  const headerCols = splitCsvRow(rawLines[0], delimiter);
  const normHeaders = headerCols.map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));

  let nameIdx = normHeaders.findIndex((h) => ["name", "title", "film", "movie"].includes(h));
  let yearIdx = normHeaders.findIndex((h) => ["year", "releaseyear"].includes(h));
  let ratingIdx = normHeaders.findIndex((h) => ["rating", "yourrating", "stars"].includes(h));
  let watchedDateIdx = normHeaders.indexOf("watcheddate");
  if (watchedDateIdx === -1) watchedDateIdx = normHeaders.indexOf("date");
  let rewatchIdx = normHeaders.findIndex((h) => ["rewatch", "rewatched"].includes(h));
  let startIdx = 1;

  // If no header matches, detect positional columns
  if (nameIdx === -1) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(headerCols[0])) {
      // Letterboxd diary line without header: Date, Name, Year, URI, Rating, Rewatch, Tags, Watched Date
      nameIdx = 1;
      yearIdx = 2;
      ratingIdx = headerCols.length >= 5 ? 4 : -1;
      rewatchIdx = headerCols.length >= 6 ? 5 : -1;
      watchedDateIdx = headerCols.length >= 8 ? 7 : 0;
      startIdx = 0;
    } else {
      // Simple format: Name, Year, Rating
      nameIdx = 0;
      yearIdx = headerCols.length >= 2 ? 1 : -1;
      ratingIdx = headerCols.length >= 3 ? 2 : -1;
      watchedDateIdx = -1;
      rewatchIdx = -1;
      startIdx = 0;
    }
  }

  for (let i = startIdx; i < rawLines.length; i++) {
    const cols = splitCsvRow(rawLines[i], delimiter);
    let rawName = (cols[nameIdx] || "").trim();
    if (!rawName) continue;
    if (["name", "title", "film", "movie"].includes(rawName.toLowerCase())) continue;
    rawName = rawName.replace(/^["']|["']$/g, "").trim();
    if (!rawName) continue;

    // Extract Year
    let year: string | undefined = undefined;
    if (yearIdx !== -1 && cols[yearIdx]) {
      const ym = cols[yearIdx].match(/\b(19\d\d|20\d\d)\b/);
      if (ym) year = ym[1];
    }
    if (!year) {
      const ym = rawName.match(/\((19\d\d|20\d\d)\)$/);
      if (ym) {
        year = ym[1];
        rawName = rawName.replace(/\((19\d\d|20\d\d)\)$/, "").trim();
      }
    }

    // Extract Rating (convert to number on 1-10 scale)
    let rating: number | undefined = undefined;
    if (ratingIdx !== -1 && cols[ratingIdx]) {
      const r = parseFloat(cols[ratingIdx]);
      if (!isNaN(r) && r > 0) {
        rating = r <= 5 ? Math.round(r * 2 * 10) / 10 : Math.round(r * 10) / 10;
      }
    }

    // Extract Watched Date (YYYY-MM-DD)
    let watchedDate = new Date().toISOString().slice(0, 10);
    if (watchedDateIdx !== -1 && cols[watchedDateIdx]) {
      const dm = cols[watchedDateIdx].match(/\b\d{4}-\d{2}-\d{2}\b/);
      if (dm) watchedDate = dm[0];
    }

    // Extract Rewatch (convert to boolean)
    let rewatch = false;
    if (rewatchIdx !== -1 && cols[rewatchIdx]) {
      const rw = cols[rewatchIdx].toLowerCase().trim();
      rewatch = ["yes", "true", "1", "rewatch", "y"].includes(rw);
    }

    items.push({
      name: rawName,
      year: year || "—",
      rating,
      watchedDate,
      rewatch,
      poster: null,
      status: "pending",
    });
  }

  console.log("[Letterboxd Import] Parsed entries:", items);
  return items;
}

/**
 * Searches TMDB for a movie by name and optional year to fetch official poster and id.
 */
async function searchLetterboxdMovieTmdb(
  name: string,
  year?: string,
): Promise<{ id: number; poster: string | null } | null> {
  const cleanName = name.trim();
  if (!cleanName) return null;

  const cleanYear = year && /^\d{4}$/.test(year.trim()) ? year.trim() : undefined;

  try {
    if (cleanYear) {
      const res = await tmdb<{ results: Array<{ id: number; poster_path: string | null }> }>("/search/movie", {
        query: cleanName,
        year: cleanYear,
        include_adult: "false",
      });
      if (res?.results && res.results.length > 0) {
        const top = res.results[0];
        return {
          id: top.id,
          poster: img(top.poster_path, "w500"),
        };
      }
    }

    const res = await tmdb<{ results: Array<{ id: number; poster_path: string | null }> }>("/search/movie", {
      query: cleanName,
      include_adult: "false",
    });
    if (res?.results && res.results.length > 0) {
      const top = res.results[0];
      return {
        id: top.id,
        poster: img(top.poster_path, "w500"),
      };
    }
  } catch (err) {
    console.warn(`[TMDB Search] Query failed for "${name}":`, err);
  }
  return null;
}

export const Route = createRoute({
  path: "/library/watched",
  component: WatchedJournalPage,
});

function WatchedJournalPage() {
  const { watched, diary, removeDiaryEntry, logToDiary, importLetterboxdCsv, clearCorruptedEntries } = useLibrary();
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");
  const [importOpen, setImportOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [parsedMovies, setParsedMovies] = useState<ParsedLetterboxdMovie[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichProgress, setEnrichProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Auto-clean corrupted raw text entries from Supabase & local storage
  useEffect(() => {
    const hasCorrupt = diary.some((d) => isCorruptedEntry(d)) || watched.some((w) => isCorruptedEntry(w));
    if (hasCorrupt) {
      console.log("[CineVerse] Purging corrupted raw CSV rows from library & Supabase...");
      clearCorruptedEntries();
    }
  }, [diary, watched, clearCorruptedEntries]);

  // Clean sorted entries for the Library Grid
  const sortedEntries = useMemo(() => {
    return [...diary]
      .filter((e) => !isCorruptedEntry(e))
      .sort((a, b) => (b.watchedDate || "").localeCompare(a.watchedDate || ""));
  }, [diary]);

  // Group diary by Year-Month for Timeline View
  const groupedDiary = useMemo(() => {
    const groups: { month: string; entries: DiaryEntry[] }[] = [];
    const map = new Map<string, DiaryEntry[]>();

    for (const entry of sortedEntries) {
      const date = new Date(entry.watchedDate || Date.now());
      const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!map.has(key)) {
        map.set(key, []);
        groups.push({ month: key, entries: map.get(key)! });
      }
      map.get(key)!.push(entry);
    }
    return groups;
  }, [sortedEntries]);

  // Synchronously parse and asynchronously enrich CSV rows from TMDB
  useEffect(() => {
    if (!csvText.trim()) {
      setParsedMovies([]);
      setIsEnriching(false);
      setEnrichProgress({ done: 0, total: 0 });
      return;
    }

    const parsed = parseLetterboxdCsvText(csvText);
    setParsedMovies(parsed);

    if (parsed.length === 0) {
      setIsEnriching(false);
      return;
    }

    let cancelled = false;
    setIsEnriching(true);
    setEnrichProgress({ done: 0, total: parsed.length });

    (async () => {
      const enriched = [...parsed];
      for (let i = 0; i < enriched.length; i++) {
        if (cancelled) return;
        const item = enriched[i];
        const match = await searchLetterboxdMovieTmdb(item.name, item.year);
        if (cancelled) return;
        if (match) {
          enriched[i] = {
            ...enriched[i],
            tmdbId: match.id,
            poster: match.poster,
            status: match.poster ? "found" : "not_found",
          };
        } else {
          enriched[i] = {
            ...enriched[i],
            status: "not_found",
          };
        }
        setParsedMovies([...enriched]);
        setEnrichProgress({ done: i + 1, total: enriched.length });
      }
      if (!cancelled) {
        setIsEnriching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [csvText]);

  const handleImportSubmit = async () => {
    let itemsToProcess = parsedMovies.length > 0 ? [...parsedMovies] : parseLetterboxdCsvText(csvText);
    if (!itemsToProcess.length) return;

    setIsImporting(true);
    setImportProgress({ done: 0, total: itemsToProcess.length });

    // Ensure TMDB metadata is fetched for each movie before saving to Supabase
    const enrichedList: ParsedLetterboxdMovie[] = [];
    for (let i = 0; i < itemsToProcess.length; i++) {
      const item = itemsToProcess[i];
      setImportProgress({ done: i + 1, total: itemsToProcess.length });
      if (item.tmdbId && item.poster) {
        enrichedList.push(item);
      } else {
        const match = await searchLetterboxdMovieTmdb(item.name, item.year);
        enrichedList.push({
          ...item,
          tmdbId: match?.id,
          poster: match?.poster || null,
          status: match?.poster ? "found" : "not_found",
        });
      }
    }

    const count = importLetterboxdCsv(enrichedList);
    setImportStatus(`Successfully imported ${count} movies with TMDB posters!`);
    setIsImporting(false);
    setTimeout(() => {
      setImportOpen(false);
      setCsvText("");
      setParsedMovies([]);
      setImportStatus(null);
    }, 1800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* Header & Controls */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="section-title">Personal Film Journal</h2>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            {sortedEntries.length} films logged · {watched.length} watched
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-full border border-border/70 bg-surface p-1 text-xs">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-sans transition-colors ${
                viewMode === "grid"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="size-3.5" />
              <span>Library Grid ({sortedEntries.length})</span>
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-sans transition-colors ${
                viewMode === "timeline"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="size-3.5" />
              <span>Diary Timeline</span>
            </button>
          </div>

          {/* Action: Log to Diary */}
          <button
            onClick={() => setLogOpen(true)}
            className="flex items-center gap-1.5 rounded-full bg-gold px-3.5 py-1.5 font-sans text-xs font-medium text-background transition-all hover:bg-gold-soft hover:-translate-y-0.5 shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Log a film</span>
          </button>

          {/* Action: Letterboxd Import */}
          <button
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-border/70 bg-surface px-3.5 py-1.5 font-sans text-xs text-muted-foreground transition hover:border-gold/60 hover:text-foreground"
          >
            <FileSpreadsheet className="size-3.5 text-gold" />
            <span className="hidden sm:inline">Import Letterboxd CSV</span>
            <span className="sm:hidden">Import CSV</span>
          </button>
        </div>
      </div>

      {/* Main View: Grid vs Timeline */}
      {viewMode === "grid" ? (
        sortedEntries.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {sortedEntries.map((entry) => (
              <div
                key={entry.id}
                className="group relative flex flex-col rounded-2xl border border-border/60 bg-surface p-2.5 transition-all duration-300 hover:border-gold/50 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1"
              >
                {/* Movie Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40">
                  {entry.poster ? (
                    <img
                      src={entry.poster}
                      alt={entry.title}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <MoviePosterFallback
                      title={entry.title}
                      year={entry.year}
                      className="size-full"
                    />
                  )}

                  {/* Rating Badge */}
                  {entry.rating ? (
                    <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/85 px-2 py-0.5 font-mono text-[0.62rem] font-semibold text-gold shadow-md backdrop-blur-md border border-gold/30">
                      <span>★</span>
                      <span>{entry.rating}/10</span>
                    </div>
                  ) : null}

                  {/* Rewatch Pill */}
                  {entry.rewatch ? (
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/85 px-2 py-0.5 font-mono text-[0.55rem] font-medium text-gold/90 shadow-md backdrop-blur-md border border-white/10">
                      <Repeat className="size-2.5" />
                      <span>Rewatch</span>
                    </div>
                  ) : null}

                  {/* Delete button on hover */}
                  <button
                    onClick={() => removeDiaryEntry(entry.id)}
                    title="Remove entry"
                    className="absolute bottom-2 right-2 grid size-7 place-items-center rounded-full bg-black/85 text-muted-foreground opacity-0 transition-all hover:bg-destructive hover:text-white group-hover:opacity-100 shadow-md"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

                {/* Movie Details: Title, Year, Watched Date */}
                <div className="mt-2.5 flex flex-1 flex-col justify-between px-1">
                  <div>
                    <Link
                      to="/movie/$id"
                      params={{ id: String(entry.movieId) }}
                      className="font-display text-sm font-semibold text-foreground hover:text-gold transition-colors line-clamp-1"
                      title={entry.title}
                    >
                      {entry.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
                      <span>{entry.year || "—"}</span>
                      {entry.rating ? (
                        <>
                          <span className="opacity-40">·</span>
                          <span className="text-gold font-medium">★ {entry.rating}</span>
                        </>
                      ) : null}
                    </div>
                  </div>

                  {/* Date Watched */}
                  <div className="mt-2 flex items-center gap-1.5 border-t border-border/40 pt-1.5 font-mono text-[0.62rem] text-gold/90">
                    <Calendar className="size-3 text-gold/70" />
                    <span>Watched {entry.watchedDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
            <Film className="mx-auto size-8 text-muted-foreground opacity-50" />
            <div className="label-mono mt-3">Your library is empty</div>
            <p className="mt-1 font-sans text-xs text-muted-foreground max-w-sm mx-auto">
              Start building your viewing chronology. Log films as you watch them or import your
              history from Letterboxd.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setLogOpen(true)}
                className="rounded-full bg-gold px-4 py-2 font-sans text-xs font-medium text-background"
              >
                Log your first film
              </button>
              <button
                onClick={() => setImportOpen(true)}
                className="rounded-full border border-border bg-surface px-4 py-2 font-sans text-xs text-foreground"
              >
                Import from Letterboxd
              </button>
            </div>
          </div>
        )
      ) : (
        /* View 2: Diary Timeline */
        sortedEntries.length ? (
          <div className="space-y-10">
            {groupedDiary.map((group) => (
              <div key={group.month}>
                <div className="label-mono mb-4 flex items-center gap-2 text-xs font-semibold text-gold">
                  <Calendar className="size-3.5" />
                  <span>{group.month}</span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    ({group.entries.length} {group.entries.length === 1 ? "film" : "films"})
                  </span>
                </div>

                <div className="divide-y divide-border/40 rounded-2xl border border-border/60 bg-surface shadow-sm">
                  {group.entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="group flex flex-col gap-4 p-4 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex items-center gap-4">
                        {/* Film Poster Thumbnail */}
                        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border/50">
                          {entry.poster ? (
                            <img src={entry.poster} alt="" className="size-full object-cover" />
                          ) : (
                            <MoviePosterFallback
                              title={entry.title}
                              year={entry.year}
                              className="size-full text-[0.5rem] p-1"
                            />
                          )}
                        </div>

                        {/* Title & Date Details */}
                        <div>
                          <div className="flex flex-wrap items-baseline gap-2">
                            <Link
                              to="/movie/$id"
                              params={{ id: String(entry.movieId) }}
                              className="font-display text-sm font-semibold text-foreground hover:text-gold transition-colors"
                            >
                              {entry.title}
                            </Link>
                            <span className="font-mono text-[0.62rem] text-muted-foreground">
                              ({entry.year})
                            </span>
                            {entry.rewatch ? (
                              <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-mono text-[0.55rem] font-medium text-gold">
                                <Repeat className="size-2.5" />
                                <span>Rewatch</span>
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-1 flex items-center gap-3 font-mono text-[0.62rem] text-muted-foreground">
                            <span>Watched on {entry.watchedDate}</span>
                            {entry.rating ? (
                              <>
                                <span className="opacity-40">·</span>
                                <span className="text-gold font-medium">★ {entry.rating}/10</span>
                              </>
                            ) : null}
                          </div>

                          {entry.review ? (
                            <p className="mt-2 max-w-xl font-sans text-xs italic text-foreground/80">
                              “{entry.review}”
                            </p>
                          ) : null}
                        </div>
                      </div>

                      {/* Action to delete entry */}
                      <button
                        onClick={() => removeDiaryEntry(entry.id)}
                        title="Remove diary entry"
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-muted-foreground hover:text-destructive self-end sm:self-center"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center font-sans text-xs text-muted-foreground">
            No diary entries recorded yet.
          </div>
        )
      )}

      {/* Log a Film Modal */}
      {logOpen ? (
        <LogFilmModal onClose={() => setLogOpen(false)} onLog={logToDiary} />
      ) : null}

      {/* Letterboxd Import Modal */}
      {importOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-gold" />
                <h3 className="font-display text-lg text-foreground">Import Letterboxd Diary</h3>
              </div>
              <button
                onClick={() => !isImporting && setImportOpen(false)}
                disabled={isImporting}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md transition disabled:opacity-40"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 font-sans text-xs text-muted-foreground shrink-0">
              In Letterboxd, go to <strong>Settings → Import & Export → Export Your Data</strong>.
              Upload or paste your <code>diary.csv</code> or <code>watched.csv</code>:
            </p>

            <div className="mt-3 shrink-0">
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface-2/40 p-3 text-center cursor-pointer hover:border-gold/60 transition">
                <Upload className="size-5 text-muted-foreground mb-1" />
                <span className="font-sans text-xs text-foreground font-medium">Upload diary.csv</span>
                <span className="font-mono text-[0.6rem] text-muted-foreground">or paste CSV text directly below</span>
                <input type="file" accept=".csv,text/csv,text/plain" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="mt-3 shrink-0">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date&#10;2024-03-10,&quot;Dune: Part Two&quot;,2024,https://boxd.it/xxx,4.5,No,,2024-03-09"
                rows={3}
                className="w-full rounded-xl border border-border/70 bg-surface p-2.5 font-mono text-[0.65rem] text-foreground outline-none focus:border-gold/70 resize-none"
              />
            </div>

            {/* Live detection and progress badge */}
            {csvText.trim() ? (
              <div className="mt-3 shrink-0 flex items-center justify-between rounded-xl bg-gold/10 border border-gold/30 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gold inline-block" />
                  <span className="font-mono text-gold font-medium">
                    {parsedMovies.length} {parsedMovies.length === 1 ? "film" : "films"} detected
                  </span>
                </div>
                {isEnriching ? (
                  <span className="font-mono text-[0.65rem] text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="size-3 animate-spin text-gold" />
                    Fetching TMDB posters ({enrichProgress.done}/{enrichProgress.total})…
                  </span>
                ) : parsedMovies.length > 0 ? (
                  <span className="font-mono text-[0.65rem] text-gold/90 font-medium flex items-center gap-1">
                    <CheckCircle2 className="size-3 text-gold" />
                    TMDB Posters Ready
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Movie Preview Grid */}
            {parsedMovies.length > 0 ? (
              <div className="mt-4 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center justify-between mb-2 shrink-0">
                  <div className="label-mono text-xs text-muted-foreground">
                    Preview ({parsedMovies.length} films ready to import)
                  </div>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    Artwork and metadata fetched from TMDB
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto rounded-xl border border-border/50 bg-surface-2/30 p-2.5 max-h-56">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {parsedMovies.map((movie, idx) => (
                      <div
                        key={`${movie.name}-${idx}`}
                        className="group relative flex flex-col rounded-lg border border-border/60 bg-surface p-1.5 transition-all hover:border-gold/50"
                      >
                        <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-surface-2">
                          {movie.poster ? (
                            <img
                              src={movie.poster}
                              alt={movie.name}
                              className="size-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <MoviePosterFallback
                              title={movie.name}
                              year={movie.year}
                              className="size-full"
                            />
                          )}
                          {movie.rating ? (
                            <div className="absolute bottom-1 right-1 rounded bg-black/85 px-1 py-0.5 font-mono text-[0.55rem] font-medium text-gold backdrop-blur-xs">
                              ★ {movie.rating}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-1.5 min-w-0">
                          <div
                            className="truncate font-display text-[0.68rem] font-medium text-foreground"
                            title={movie.name}
                          >
                            {movie.name}
                          </div>
                          <div className="flex items-center justify-between font-mono text-[0.58rem] text-muted-foreground">
                            <span>{movie.year || "—"}</span>
                            {movie.rewatch ? (
                              <span className="text-[0.55rem] text-gold font-medium">Rewatch</span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {isImporting ? (
              <div className="mt-3 shrink-0 rounded-lg bg-gold/15 p-2.5 font-mono text-xs text-gold text-center flex items-center justify-center gap-2">
                <Loader2 className="size-3.5 animate-spin text-gold" />
                <span>
                  Fetching TMDB metadata and saving... ({importProgress.done}/{importProgress.total})
                </span>
              </div>
            ) : importStatus ? (
              <div className="mt-3 shrink-0 rounded-lg bg-gold/15 p-2 font-mono text-xs text-gold text-center">
                {importStatus}
              </div>
            ) : null}

            <div className="mt-5 shrink-0 flex justify-end gap-2 pt-2 border-t border-border/40">
              <button
                onClick={() => setImportOpen(false)}
                disabled={isImporting}
                className="rounded-lg border border-border px-4 py-2 font-sans text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={(!parsedMovies.length && !csvText.trim()) || isImporting}
                className="rounded-lg bg-gold px-4 py-2 font-sans text-xs font-medium text-background hover:bg-gold-soft disabled:opacity-50 flex items-center gap-1.5"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="size-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Import {parsedMovies.length ? `${parsedMovies.length} Films` : "Diary Entries"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LogFilmModal({
  onClose,
  onLog,
}: {
  onClose: () => void;
  onLog: (entry: any) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MovieCard[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<MovieCard | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState<number>(8);
  const [rewatch, setRewatch] = useState(false);
  const [review, setReview] = useState("");

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (!val.trim()) {
      setResults([]);
      return;
    }
    const found = await searchMovies({ data: { q: val.trim() } });
    setResults(found);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMovie) return;
    onLog({
      movieId: selectedMovie.id,
      title: selectedMovie.title,
      poster: selectedMovie.poster,
      year: selectedMovie.year,
      watchedDate: date,
      rating,
      rewatch,
      review,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="label-gold">Film Journal</div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
        <h3 className="mt-1 font-display text-xl text-foreground">Log a Movie to Your Diary</h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {!selectedMovie ? (
            <div>
              <label className="label-mono mb-1.5 block">Search Movie</label>
              <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Type film title…"
                autoFocus
                className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 font-sans text-xs text-foreground outline-none focus:border-gold/70"
              />
              {results.length ? (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-surface divide-y divide-border/40">
                  {results.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setSelectedMovie(m);
                        setResults([]);
                      }}
                      className="flex items-center gap-3 w-full p-2.5 text-left hover:bg-surface-2 transition"
                    >
                      <div className="h-10 w-7 rounded bg-surface-2 shrink-0 overflow-hidden">
                        {m.poster ? <img src={m.poster} alt="" className="size-full object-cover" /> : null}
                      </div>
                      <div>
                        <div className="font-display text-xs text-foreground">{m.title}</div>
                        <div className="font-mono text-[0.6rem] text-muted-foreground">{m.year} · ★ {m.rating.toFixed(1)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/5 p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-8 rounded bg-surface-2 shrink-0 overflow-hidden ring-1 ring-gold/40">
                  {selectedMovie.poster ? <img src={selectedMovie.poster} alt="" className="size-full object-cover" /> : null}
                </div>
                <div>
                  <div className="font-display text-sm text-foreground font-medium">{selectedMovie.title}</div>
                  <div className="font-mono text-[0.62rem] text-muted-foreground">{selectedMovie.year}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMovie(null)}
                className="font-mono text-[0.62rem] text-gold hover:underline"
              >
                Change
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-mono mb-1.5 block">Watch Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/70"
              />
            </div>
            <div>
              <label className="label-mono mb-1.5 block">Rating (1–10)</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-xl border border-border/70 bg-surface px-3 py-2 font-mono text-xs text-foreground outline-none focus:border-gold/70"
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>
                    ★ {num} / 10
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rewatch"
              checked={rewatch}
              onChange={(e) => setRewatch(e.target.checked)}
              className="size-4 rounded border-border text-gold focus:ring-gold"
            />
            <label htmlFor="rewatch" className="font-sans text-xs text-foreground cursor-pointer">
              I have watched this film before (Rewatch)
            </label>
          </div>

          <div>
            <label className="label-mono mb-1.5 block">Journal Review / Notes</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What struck you about the direction, atmosphere, or cinematography? Write your thoughts..."
              rows={3}
              className="w-full rounded-xl border border-border/70 bg-surface p-3 font-sans text-xs text-foreground outline-none focus:border-gold/70"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2 font-sans text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedMovie}
              className="rounded-xl bg-gold px-5 py-2 font-sans text-xs font-medium text-background hover:bg-gold-soft disabled:opacity-50"
            >
              Save Diary Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
