import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { searchMovies } from "../../lib/tmdb.api";
import type { MovieCard } from "../../lib/tmdb-map";

export function MoviePicker({
  label,
  onSelect,
  exclude,
}: {
  label: string;
  onSelect: (movie: MovieCard) => void;
  /** A movie id to hide from results (e.g. whichever film is already picked on the other side). */
  exclude?: number;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<MovieCard[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const value = q.trim();
    if (!value) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timer = window.setTimeout(async () => {
      const found = await searchMovies({ data: { q: value } });
      setResults(found);
      setLoading(false);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [q]);

  useEffect(() => {
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  const shown = exclude ? results.filter((m) => m.id !== exclude) : results;

  return (
    <div ref={ref} className="relative flex h-full min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 bg-surface p-6 text-center sm:min-h-[360px]">
      <div className="label-gold">{label}</div>
      <p className="mt-2 max-w-[220px] font-sans text-xs text-muted-foreground">
        Search for a film to bring it into the comparison.
      </p>

      <div className="relative mt-5 w-full max-w-[280px]">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-2"
        >
          <Search className="size-3.5 shrink-0 text-muted-foreground" />
          <input
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            placeholder="Search films…"
            aria-label={`Search for ${label}`}
            className="w-full min-w-0 bg-transparent font-sans text-xs text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q ? (
            <button
              type="button"
              aria-label="Clear"
              onClick={() => {
                setQ("");
                setResults([]);
              }}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3" />
            </button>
          ) : null}
        </form>

        {open && q.trim() ? (
          <div className="absolute left-1/2 top-11 z-30 w-[min(80vw,300px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface p-2 text-left shadow-2xl shadow-stone-900/15 dark:shadow-black/50">
            {loading ? (
              <div className="px-3 py-4 text-center font-mono text-[0.6rem] tracking-wider text-muted-foreground">
                SEARCHING…
              </div>
            ) : shown.length ? (
              shown.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelect(m);
                    setQ("");
                    setResults([]);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface-2"
                >
                  <div className="h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                    {m.poster ? <img src={m.poster} alt="" className="size-full object-cover" /> : null}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-display text-sm text-foreground">{m.title}</div>
                    <div className="font-mono text-[0.6rem] text-muted-foreground">
                      {m.year} · ⭐ {m.rating.toFixed(1)}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center font-mono text-[0.6rem] tracking-wider text-muted-foreground">
                NO MATCHES
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
