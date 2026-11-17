import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useMemo, useState } from "react";
import {
  Calendar,
  FileSpreadsheet,
  Grid,
  Plus,
  Repeat,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { PosterCard } from "../components/site/media";
import { useLibrary } from "../lib/library";
import type { DiaryEntry } from "../lib/library";
import { searchMovies } from "../lib/tmdb.api";
import type { MovieCard } from "../lib/tmdb-map";
import { useLibraryFilms } from "../components/site/library-list";

export const Route = createRoute({
  path: "/library/watched",
  component: WatchedJournalPage,
});

function WatchedJournalPage() {
  const { watched, diary, removeDiaryEntry, logToDiary, importLetterboxdCsv } = useLibrary();
  const { films: watchedFilms, loading: watchedLoading } = useLibraryFilms("watched");
  const [viewMode, setViewMode] = useState<"diary" | "grid">("diary");
  const [importOpen, setImportOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Group diary by Year-Month
  const groupedDiary = useMemo(() => {
    const groups: { month: string; entries: DiaryEntry[] }[] = [];
    const map = new Map<string, DiaryEntry[]>();

    const sorted = [...diary].sort((a, b) => b.watchedDate.localeCompare(a.watchedDate));

    for (const entry of sorted) {
      const date = new Date(entry.watchedDate || Date.now());
      const key = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!map.has(key)) {
        map.set(key, []);
        groups.push({ month: key, entries: map.get(key)! });
      }
      map.get(key)!.push(entry);
    }
    return groups;
  }, [diary]);

  const handleImportSubmit = () => {
    if (!csvText.trim()) return;
    const count = importLetterboxdCsv(csvText);
    setImportStatus(`Successfully imported ${count} diary entries!`);
    setTimeout(() => {
      setImportOpen(false);
      setCsvText("");
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
            {diary.length} diary entries logged · {watched.length} unique films seen
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex rounded-full border border-border/70 bg-surface p-1 text-xs">
            <button
              onClick={() => setViewMode("diary")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans transition-colors ${
                viewMode === "diary"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="size-3" />
              <span>Diary Timeline</span>
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-sans transition-colors ${
                viewMode === "grid"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Grid className="size-3" />
              <span>All Watched ({watched.length})</span>
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

      {/* View 1: Chronological Diary Timeline */}
      {viewMode === "diary" ? (
        diary.length ? (
          <div className="space-y-10">
            {groupedDiary.map((group) => (
              <div key={group.month}>
                <div className="label-mono mb-4 flex items-center gap-2 text-xs font-semibold text-gold">
                  <Calendar className="size-3.5" />
                  <span>{group.month}</span>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    ({group.entries.length} {group.entries.length === 1 ? "entry" : "entries"})
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
                            <div className="grid size-full place-items-center font-display text-[0.55rem] text-muted-foreground text-center p-1">
                              {entry.title}
                            </div>
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
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center">
            <Calendar className="mx-auto size-8 text-muted-foreground opacity-50" />
            <div className="label-mono mt-3">Your diary is empty</div>
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
        /* View 2: All Watched Poster Grid */
        watchedLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {watched.slice(0, 12).map((m) => (
              <div key={m.id} className="aspect-[2/3] animate-pulse rounded-2xl bg-surface-2" />
            ))}
          </div>
        ) : watchedFilms.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {watchedFilms.map((movie) => (
              <PosterCard key={movie.id} movie={movie} width="w-full" />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center font-sans text-xs text-muted-foreground">
            No watched films recorded yet.
          </div>
        )
      )}

      {/* Log a Film Modal */}
      {logOpen ? (
        <LogFilmModal onClose={() => setLogOpen(false)} onLog={logToDiary} />
      ) : null}

      {/* Letterboxd Import Modal */}
      {importOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-4 text-gold" />
                <h3 className="font-display text-lg text-foreground">Import Letterboxd Diary</h3>
              </div>
              <button onClick={() => setImportOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <p className="mt-2 font-sans text-xs text-muted-foreground">
              In Letterboxd, go to <strong>Settings → Import & Export → Export Your Data</strong>.
              Upload or paste the contents of your <code>diary.csv</code> below:
            </p>

            <div className="mt-4">
              <label className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-surface-2/40 p-4 text-center cursor-pointer hover:border-gold/60 transition">
                <Upload className="size-5 text-muted-foreground mb-1" />
                <span className="font-sans text-xs text-foreground font-medium">Upload diary.csv</span>
                <span className="font-mono text-[0.6rem] text-muted-foreground">or paste text below</span>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            <div className="mt-3">
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="Date,Name,Year,Letterboxd URI,Rating,Rewatch,Tags,Watched Date..."
                rows={4}
                className="w-full rounded-xl border border-border/70 bg-surface p-2.5 font-mono text-[0.65rem] text-foreground outline-none focus:border-gold/70"
              />
            </div>

            {importStatus ? (
              <div className="mt-3 rounded-lg bg-gold/15 p-2 font-mono text-xs text-gold text-center">
                {importStatus}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setImportOpen(false)}
                className="rounded-lg border border-border px-4 py-2 font-sans text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={!csvText.trim()}
                className="rounded-lg bg-gold px-4 py-2 font-sans text-xs font-medium text-background hover:bg-gold-soft disabled:opacity-50"
              >
                Import Diary Entries
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
