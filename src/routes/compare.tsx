import { createRoute } from "../lib/route";
import { Link, useNavigate } from "../lib/router";
import { ArrowLeftRight, Film, Music4, PenLine, Users, Video, X } from "lucide-react";
import type { ReactNode } from "react";

import { MoviePicker } from "../components/site/movie-picker";
import { getMovie } from "../lib/tmdb.api";
import { fmtRuntime } from "../lib/tmdb-map";
import type { MovieDetail, MovieCard } from "../lib/tmdb-map";
import { buildComparison } from "../lib/compare";
import { useLibrary } from "../lib/library";

type Search = { a?: number; b?: number };
type LoaderData = { a: MovieDetail | null; b: MovieDetail | null };

export const Route = createRoute<LoaderData, Search>({
  path: "/compare",
  validateSearch: (search): Search => ({
    ...(search["a"] ? { a: Number(search["a"]) } : {}),
    ...(search["b"] ? { b: Number(search["b"]) } : {}),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const [a, b] = await Promise.all([
      deps.a ? getMovie({ data: { id: deps.a } }).catch(() => null) : Promise.resolve(null),
      deps.b ? getMovie({ data: { id: deps.b } }).catch(() => null) : Promise.resolve(null),
    ]);
    return { a, b };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData?.a && loaderData?.b
            ? `${loaderData.a.title} vs ${loaderData.b.title} — CineVerse`
            : "Compare films — CineVerse",
      },
      {
        name: "description",
        content: "Put two films side by side: ratings, cast, crew and the connections between them.",
      },
    ],
  }),
  component: ComparePage,
});

function UserStatus({ movieId }: { movieId: number }) {
  const { ready, has, ratings } = useLibrary();
  if (!ready) return null;

  const chips: string[] = [];
  const rating = ratings[movieId];
  if (rating) chips.push(`You rated it ${rating}/10`);
  if (has("watched", movieId)) chips.push("Watched");
  if (has("watchlist", movieId)) chips.push("On your watchlist");
  if (has("favorites", movieId)) chips.push("Favourite");

  if (!chips.length) {
    return <span className="font-mono text-[0.6rem] tracking-wide text-muted-foreground">Not logged in your library yet</span>;
  }
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {chips.map((c) => (
        <span key={c} className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[0.55rem] tracking-wide text-gold">
          {c}
        </span>
      ))}
    </div>
  );
}

function FilmSlot({ movie, onClear }: { movie: MovieDetail; onClear: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center rounded-2xl border border-border/60 bg-surface p-5 text-center sm:p-6">
      <button
        onClick={onClear}
        aria-label={`Remove ${movie.title} from comparison`}
        className="absolute right-3 top-3 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-surface-2 hover:text-foreground"
      >
        <X className="size-4" />
      </button>
      <Link to="/movie/$id" params={{ id: String(movie.id) }} className="w-28 sm:w-36">
        <div className="aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/60 shadow-lg">
          {movie.poster ? (
            <img src={movie.poster} alt={`${movie.title} poster`} className="size-full object-cover" />
          ) : null}
        </div>
      </Link>
      <Link
        to="/movie/$id"
        params={{ id: String(movie.id) }}
        className="mt-4 font-display text-base leading-tight text-foreground hover:text-gold sm:text-lg"
      >
        {movie.title}
      </Link>
      <div className="mt-1 font-mono text-[0.65rem] tracking-wide text-muted-foreground">{movie.year}</div>
      <div className="mt-3 flex items-center gap-1.5 text-gold">
        <span className="font-mono text-sm">★ {movie.rating.toFixed(1)}</span>
      </div>
      <div className="mt-4">
        <UserStatus movieId={movie.id} />
      </div>
    </div>
  );
}

function CompareRow({
  label,
  a,
  b,
  match,
}: {
  label: string;
  a: ReactNode;
  b: ReactNode;
  match?: boolean;
}) {
  return (
    <div className="grid grid-cols-[1fr_84px_1fr] items-center gap-2 border-b border-border/40 py-3.5 last:border-0 sm:grid-cols-[1fr_120px_1fr] sm:gap-4">
      <div className="text-right font-sans text-xs leading-snug text-foreground sm:text-sm">{a}</div>
      <div className="flex flex-col items-center gap-1 px-1 text-center">
        <span className="label-mono">{label}</span>
        {match ? (
          <span className="rounded-full bg-gold/15 px-1.5 py-0.5 font-mono text-[0.5rem] tracking-wide text-gold">MATCH</span>
        ) : null}
      </div>
      <div className="text-left font-sans text-xs leading-snug text-foreground sm:text-sm">{b}</div>
    </div>
  );
}

function GenrePills({ genres, shared, align }: { genres: string[]; shared: string[]; align: "start" | "end" }) {
  const sharedSet = new Set(shared.map((s) => s.toLowerCase()));
  return (
    <div className={`flex flex-wrap gap-1.5 ${align === "end" ? "justify-end" : "justify-start"}`}>
      {genres.length ? (
        genres.map((g) => (
          <span
            key={g}
            className={`rounded-full border px-2 py-0.5 font-mono text-[0.58rem] tracking-wide ${
              sharedSet.has(g.toLowerCase()) ? "border-gold/50 text-gold" : "border-border text-muted-foreground"
            }`}
          >
            {g}
          </span>
        ))
      ) : (
        <span className="font-mono text-[0.6rem] text-muted-foreground">—</span>
      )}
    </div>
  );
}

function ComparePage() {
  const data = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const setSlot = (slot: "a" | "b", movie: MovieCard | null) =>
    navigate({ search: (prev: Search) => ({ ...prev, [slot]: movie?.id }) });

  const swap = () => navigate({ search: (prev: Search) => ({ ...prev, a: prev.b, b: prev.a }) });

  const a = data?.a ?? null;
  const b = data?.b ?? null;
  const cmp = a && b ? buildComparison(a, b) : null;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-12 sm:px-8">
      <div className="label-gold">Movie compare</div>
      <h1 className="mt-3 font-display text-3xl text-foreground sm:text-4xl">Put two films head to head</h1>
      <p className="mt-3 max-w-xl font-sans text-sm leading-relaxed text-muted-foreground">
        Pick any two films to see how they stack up — ratings, runtime, the people behind the camera, and every
        connection between them.
      </p>

      <div className="mt-10 grid grid-cols-1 items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
        {a ? (
          <FilmSlot movie={a} onClear={() => setSlot("a", null)} />
        ) : (
          <MoviePicker label="Film A" onSelect={(m) => setSlot("a", m)} {...(b ? { exclude: b.id } : {})} />
        )}

        <div className="flex flex-row items-center justify-center gap-3 py-1 md:flex-col md:gap-4 md:py-0">
          <span className="h-px flex-1 bg-border/60 md:h-full md:w-px md:flex-none" />
          <button
            onClick={swap}
            disabled={!search.a && !search.b}
            aria-label="Swap films"
            title="Swap films"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border bg-surface text-muted-foreground transition hover:border-gold/60 hover:text-gold disabled:opacity-30"
          >
            <ArrowLeftRight className="size-4" />
          </button>
          <span className="h-px flex-1 bg-border/60 md:h-full md:w-px md:flex-none" />
        </div>

        {b ? (
          <FilmSlot movie={b} onClear={() => setSlot("b", null)} />
        ) : (
          <MoviePicker label="Film B" onSelect={(m) => setSlot("b", m)} {...(a ? { exclude: a.id } : {})} />
        )}
      </div>

      {a && b && cmp ? (
        <>
          {/* Head-to-head verdict strip */}
          <section className="mt-14 rounded-2xl border border-border/60 bg-surface p-6">
            <div className="label-gold">At a glance</div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-sans text-sm text-foreground">
              <span>
                {cmp.yearGap === 0
                  ? "Released the same year"
                  : `${cmp.yearGap} year${cmp.yearGap === 1 ? "" : "s"} apart`}
              </span>
              <span className="opacity-30">·</span>
              <span>
                {cmp.runtimeGapMinutes === 0
                  ? "Identical runtime"
                  : cmp.longer === "a"
                    ? `${a.title} runs ${cmp.runtimeGapMinutes}m longer`
                    : `${b.title} runs ${cmp.runtimeGapMinutes}m longer`}
              </span>
              <span className="opacity-30">·</span>
              <span>
                {cmp.ratingWinner === "tie"
                  ? "Tied on TMDB rating"
                  : `${cmp.ratingWinner === "a" ? a.title : b.title} rates ${cmp.ratingGap.toFixed(1)} points higher`}
              </span>
              {cmp.sameDirector ? (
                <>
                  <span className="opacity-30">·</span>
                  <span className="text-gold">Same director — {a.director}</span>
                </>
              ) : null}
              {cmp.sameCollection ? (
                <>
                  <span className="opacity-30">·</span>
                  <span className="text-gold">Part of the same saga — {cmp.sameCollection.name}</span>
                </>
              ) : null}
            </div>

            {/* rating bars */}
            <div className="mt-6 space-y-3">
              {[a, b].map((m, i) => (
                <div key={m.id} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 truncate font-sans text-xs text-muted-foreground sm:w-40">{m.title}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${
                        cmp.ratingWinner === (i === 0 ? "a" : "b") || cmp.ratingWinner === "tie" ? "bg-gold" : "bg-gold/40"
                      }`}
                      style={{ width: `${Math.max(4, (m.rating / 10) * 100)}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-mono text-xs text-gold">{m.rating.toFixed(1)}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Shared connections */}
          <section className="mt-10">
            <div className="label-gold">Shared connections</div>
            <h2 className="section-title mt-2">What links these two films</h2>

            <div className="mt-5 grid gap-3">
              {cmp.sameDirector ? (
                <ConnectionLine icon={<Video className="size-4" />} text={`Both directed by ${a.director}`} />
              ) : null}
              {cmp.sharedWriters.map((w) => (
                <ConnectionLine key={w} icon={<PenLine className="size-4" />} text={`Shared writer — ${w}`} />
              ))}
              {cmp.sameCinematographer && cmp.cinematographerA ? (
                <ConnectionLine icon={<Film className="size-4" />} text={`Same cinematographer — ${cmp.cinematographerA}`} />
              ) : null}
              {cmp.sameComposer && cmp.composerA ? (
                <ConnectionLine icon={<Music4 className="size-4" />} text={`Same composer — ${cmp.composerA}`} />
              ) : null}
              {cmp.sharedCrew
                .filter((p) => p.roleA === "Producer" || p.roleB === "Producer")
                .slice(0, 2)
                .map((p) => (
                  <ConnectionLine key={p.id} icon={<Video className="size-4" />} text={`Shared producer — ${p.name}`} />
                ))}
              {cmp.sharedCast.length ? (
                <ConnectionLine
                  icon={<Users className="size-4" />}
                  text={`${cmp.sharedCast.length} shared cast member${cmp.sharedCast.length === 1 ? "" : "s"}`}
                />
              ) : null}
              {!cmp.sameDirector &&
              !cmp.sharedWriters.length &&
              !cmp.sameCinematographer &&
              !cmp.sameComposer &&
              !cmp.sharedCrew.some((p) => p.roleA === "Producer" || p.roleB === "Producer") &&
              !cmp.sharedCast.length ? (
                <p className="font-sans text-sm text-muted-foreground">
                  No overlapping cast or crew — a clean, independent pairing with no shared credits.
                </p>
              ) : null}
            </div>

            {cmp.sharedCast.length ? (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {cmp.sharedCast.slice(0, 8).map((p) => (
                  <Link
                    key={p.id}
                    to="/person/$id"
                    params={{ id: String(p.id) }}
                    className="group flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 px-3 py-2 hover:border-gold/60"
                  >
                    <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ring-gold/40">
                      {p.profile ? <img src={p.profile} alt={p.name} loading="lazy" className="size-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-display text-xs text-foreground">{p.name}</div>
                      <div className="truncate font-mono text-[0.58rem] text-muted-foreground">
                        {p.roleA}
                        {p.roleA !== p.roleB ? ` / ${p.roleB}` : ""}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}
          </section>

          {/* Tale of the tape */}
          <section className="mt-10">
            <div className="label-gold">Tale of the tape</div>
            <h2 className="section-title mt-2">Side by side</h2>
            <div className="mt-5 rounded-2xl border border-border/60 bg-surface px-4 sm:px-6">
              <CompareRow
                label="Genres"
                a={<GenrePills genres={a.genres} shared={cmp.sharedGenres} align="end" />}
                b={<GenrePills genres={b.genres} shared={cmp.sharedGenres} align="start" />}
                match={cmp.sharedGenres.length > 0}
              />
              <CompareRow
                label="Runtime"
                a={fmtRuntime(a.runtime)}
                b={fmtRuntime(b.runtime)}
                match={cmp.runtimeGapMinutes === 0}
              />
              <CompareRow
                label="TMDB rating"
                a={<span className={cmp.ratingWinner === "a" ? "text-gold" : ""}>★ {a.rating.toFixed(1)}</span>}
                b={<span className={cmp.ratingWinner === "b" ? "text-gold" : ""}>★ {b.rating.toFixed(1)}</span>}
                match={cmp.ratingWinner === "tie"}
              />
              <CompareRow label="Director" a={a.director} b={b.director} match={cmp.sameDirector} />
              <CompareRow
                label="Writers"
                a={a.writers.join(", ") || "—"}
                b={b.writers.join(", ") || "—"}
                match={cmp.sharedWriters.length > 0}
              />
              <CompareRow
                label="Cinematography"
                a={cmp.cinematographerA ?? "—"}
                b={cmp.cinematographerB ?? "—"}
                match={cmp.sameCinematographer}
              />
              <CompareRow
                label="Composer"
                a={cmp.composerA ?? "—"}
                b={cmp.composerB ?? "—"}
                match={cmp.sameComposer}
              />
              {cmp.editorA || cmp.editorB ? (
                <CompareRow
                  label="Editor"
                  a={cmp.editorA ?? "—"}
                  b={cmp.editorB ?? "—"}
                  match={Boolean(cmp.editorA && cmp.editorA === cmp.editorB)}
                />
              ) : null}
              <CompareRow
                label="Language"
                a={a.languages[0] ?? a.language}
                b={b.languages[0] ?? b.language}
                match={cmp.sameLanguage}
              />
              <CompareRow
                label="Country"
                a={a.countries[0] ?? "—"}
                b={b.countries[0] ?? "—"}
                match={cmp.sameCountry}
              />
              <CompareRow label="Year" a={a.year} b={b.year} match={cmp.yearGap === 0} />
            </div>
          </section>

          {/* Cast comparison */}
          <section className="mt-10 mb-4">
            <div className="label-gold">Cast</div>
            <h2 className="section-title mt-2">Who's on screen</h2>
            <div className="mt-5 grid gap-8 sm:grid-cols-2">
              {[a, b].map((m) => {
                const sharedIds = new Set(cmp.sharedCast.map((p) => p.id));
                return (
                  <div key={m.id}>
                    <div className="mb-3 truncate font-display text-sm text-foreground">{m.title}</div>
                    <div className="grid gap-3">
                      {m.cast.slice(0, 6).map((p) => (
                        <Link
                          key={p.id}
                          to="/person/$id"
                          params={{ id: String(p.id) }}
                          className={`flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-surface-2 ${
                            sharedIds.has(p.id) ? "text-gold" : "text-foreground"
                          }`}
                        >
                          <div
                            className={`size-9 shrink-0 overflow-hidden rounded-full bg-surface-2 ring-1 ${
                              sharedIds.has(p.id) ? "ring-gold/60" : "ring-border/60"
                            }`}
                          >
                            {p.profile ? (
                              <img src={p.profile} alt={p.name} loading="lazy" className="size-full object-cover" />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-display text-xs">{p.name}</div>
                            <div className="truncate font-mono text-[0.58rem] text-muted-foreground">{p.character}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (a || b) ? (
        <p className="mt-10 text-center font-sans text-xs text-muted-foreground">
          Pick a second film above to see the full comparison.
        </p>
      ) : null}
    </div>
  );
}

function ConnectionLine({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gold/30 bg-gold/5 px-4 py-2.5 text-gold">
      {icon}
      <span className="font-sans text-sm">{text}</span>
    </div>
  );
}
