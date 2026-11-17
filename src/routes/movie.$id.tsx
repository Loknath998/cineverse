import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  GitCompare,
  Play,
  Sparkles,
  Tv,
} from "lucide-react";

import { MovieActions } from "../components/site/movie-actions";
import { PosterRail } from "../components/site/media";
import { getMovie } from "../lib/tmdb.api";
import { fmtMoney, fmtRuntime } from "../lib/tmdb-map";
import { useLibrary } from "../lib/library";

export const Route = createRoute({
  path: "/movie/$id",
  loader: ({ params }) => getMovie({ data: { id: Number(params.id) } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Film unavailable — CineVerse" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title} (${loaderData.year}) — CineVerse`;
    const description =
      loaderData.overview.slice(0, 155) ||
      `Cast, crew, director context and details for ${loaderData.title}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.poster
          ? [
              { property: "og:image", content: loaderData.poster },
              { name: "twitter:image", content: loaderData.poster },
            ]
          : []),
      ],
    };
  },
  component: MoviePage,
});

function MoviePage() {
  const m = Route.useLoaderData() as Awaited<ReturnType<typeof getMovie>>;
  const { watched } = useLibrary();

  const watchedIds = useMemo(() => new Set(watched.map((w) => w.id)), [watched]);

  // Personal history: how many films by this director has the user seen?
  const directorWatchedCount = useMemo(() => {
    if (!m.directorCareer?.allDirected?.length) return 0;
    return m.directorCareer.allDirected.filter((f) => watchedIds.has(f.id)).length;
  }, [m.directorCareer, watchedIds]);

  // Other films by the same director (excluding current)
  const otherDirectorFilms = useMemo(() => {
    if (!m.directorCareer?.allDirected) return [];
    return m.directorCareer.allDirected.filter((f) => f.id !== m.id);
  }, [m.directorCareer, m.id]);

  // Key crew members
  const cinematographer = useMemo(
    () => m.crew.find((c) => c.role.toLowerCase().includes("photograph")),
    [m.crew]
  );
  const composer = useMemo(
    () =>
      m.crew.find(
        (c) =>
          c.role.toLowerCase().includes("composer") ||
          c.role.toLowerCase().includes("music")
      ),
    [m.crew]
  );
  const editor = useMemo(
    () => m.crew.find((c) => c.role.toLowerCase().includes("editor")),
    [m.crew]
  );

  const eraDecade = m.year ? `${m.year.slice(0, 3)}0s` : "";

  return (
    <div className="relative isolate min-h-screen pb-24">
      {/* ─────────────────────────────────────────────────────────────
          01 — THE FILM: ATMOSPHERIC BACKDROP & PRIMARY IDENTITY
          High visual presence, natural dissolves, movie is the subject.
         ───────────────────────────────────────────────────────────── */}
      <div className="relative isolate overflow-hidden pt-4 pb-12 sm:pb-16">
        {/* Cinematic Atmospheric Backdrop Layer (Stronger presence, natural fades) */}
        {m.backdrop ? (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] sm:h-[620px] overflow-hidden select-none z-0">
            <img
              src={m.backdrop}
              alt=""
              aria-hidden="true"
              className="size-full object-cover object-top opacity-35 dark:opacity-50 transition-opacity duration-700"
            />
            {/* Soft, natural gradient dissolves so typography is crystal clear */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent lg:w-3/4" />
          </div>
        ) : null}

        <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 flex items-center gap-1.5 font-mono text-[0.65rem] tracking-widest text-muted-foreground uppercase">
            <Link to="/discover" className="hover:text-foreground">
              Archive
            </Link>
            <ChevronRight className="size-3 opacity-30" />
            <span>{m.year}</span>
            {m.director && m.directorId ? (
              <>
                <ChevronRight className="size-3 opacity-30" />
                <Link
                  to="/person/$id"
                  params={{ id: String(m.directorId) }}
                  className="hover:text-foreground"
                >
                  {m.director}
                </Link>
              </>
            ) : null}
            <ChevronRight className="size-3 opacity-30" />
            <span className="truncate text-foreground font-medium">{m.title}</span>
          </nav>

          {/* Core Film Stage: Poster + Full Identity + Direct Synopsis */}
          <div className="grid gap-8 md:grid-cols-[260px_1fr] lg:gap-12 lg:grid-cols-[320px_1fr] items-start">
            {/* Left: Focal Artwork Poster */}
            <div className="w-52 sm:w-64 md:w-full space-y-4">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/50 shadow-2xl shadow-black/40">
                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={`${m.title} poster`}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="grid size-full place-items-center p-4 text-center font-display text-muted-foreground">
                    {m.title}
                  </div>
                )}
              </div>

              {/* Action Controls & Trailer */}
              <div className="space-y-3">
                <MovieActions movie={m} />

                {m.trailer ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${m.trailer}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold/10 py-2.5 font-mono text-xs text-gold hover:bg-gold/20 hover:border-gold transition"
                  >
                    <Play className="size-3.5 fill-gold" />
                    <span>Watch Official Trailer</span>
                  </a>
                ) : null}
              </div>
            </div>

            {/* Right: Title, Director, Core Metadata & Direct Synopsis */}
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-foreground font-bold tracking-tight leading-[0.95]">
                  {m.title}
                </h1>

                {m.tagline ? (
                  <p className="font-display text-base sm:text-xl italic text-gold-soft">
                    “{m.tagline}”
                  </p>
                ) : null}
              </div>

              {/* Director Attribution */}
              {m.director && m.directorId ? (
                <div className="pt-0.5">
                  <Link
                    to="/person/$id"
                    params={{ id: String(m.directorId) }}
                    className="group inline-flex items-center gap-2 font-display text-xl sm:text-2xl text-foreground hover:text-gold transition-colors"
                  >
                    <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground font-normal">
                      A film by
                    </span>
                    <span className="font-semibold underline decoration-gold/50 underline-offset-4 group-hover:decoration-gold">
                      {m.director}
                    </span>
                    <ArrowRight className="size-4 text-gold transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              ) : null}

              {/* Core Metadata Row */}
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{m.year}</span>
                <span className="opacity-30">·</span>
                <span>{fmtRuntime(m.runtime)}</span>
                <span className="opacity-30">·</span>
                <span>{m.genres.slice(0, 3).join(" / ")}</span>
                <span className="opacity-30">·</span>
                <span className="text-gold font-medium">★ {m.rating.toFixed(1)} TMDB</span>
                {m.language ? (
                  <>
                    <span className="opacity-30">·</span>
                    <span className="rounded bg-surface px-2 py-0.5 text-[0.68rem] ring-1 ring-border/50 uppercase">
                      {m.language}
                    </span>
                  </>
                ) : null}
              </div>

              {/* WHAT IS THIS MOVIE? — Primary Overview & Synopsis */}
              {m.overview ? (
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-gold font-semibold">
                    Synopsis
                  </span>
                  <p className="font-serif text-base sm:text-lg leading-relaxed text-foreground/90 max-w-3xl">
                    {m.overview}
                  </p>
                </div>
              ) : null}

              {/* Production Ledger & Streaming Providers in Primary View */}
              <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t border-border/40">
                <div className="space-y-2">
                  <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground font-semibold">
                    Production Archive
                  </span>
                  <dl className="space-y-1.5 font-mono text-xs">
                    {m.release ? (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Release Date</dt>
                        <dd className="text-foreground font-medium">{m.release}</dd>
                      </div>
                    ) : null}
                    {m.budget ? (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Budget</dt>
                        <dd className="text-foreground">{fmtMoney(m.budget)}</dd>
                      </div>
                    ) : null}
                    {m.revenue ? (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Box Office</dt>
                        <dd className="text-foreground">{fmtMoney(m.revenue)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                {m.providers?.length ? (
                  <div className="space-y-2">
                    <span className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-gold font-semibold">
                      <Tv className="size-3" />
                      <span>Where to Watch</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {m.providers.slice(0, 4).map((p) => (
                        <span
                          key={p.name}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface px-3 py-1 font-sans text-xs text-foreground"
                        >
                          {p.logo ? (
                            <img src={p.logo} alt="" className="size-3.5 rounded-full object-cover" />
                          ) : null}
                          <span>{p.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground font-semibold">
                      External Reference
                    </span>
                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                      {m.imdb ? (
                        <a
                          href={`https://www.imdb.com/title/${m.imdb}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-gold flex items-center gap-1"
                        >
                          <span>IMDb Entry</span>
                          <ExternalLink className="size-3" />
                        </a>
                      ) : null}
                      <Link
                        to="/compare"
                        search={{ a: m.id }}
                        className="hover:text-gold flex items-center gap-1"
                      >
                        <GitCompare className="size-3 text-gold" />
                        <span>Compare Film</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-8 space-y-16">
        {/* ─────────────────────────────────────────────────────────────
            01B — PRODUCTION FRAMING & CINEMATIC STILLS
            Show how the movie looks visually before dissecting connections.
           ───────────────────────────────────────────────────────────── */}
        {m.images.length ? (
          <section className="space-y-4 pt-4 border-t border-border/40">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-xl sm:text-2xl text-foreground font-bold">
                Cinematic Framing & Stills
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                {m.images.length} Archival Frames
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {m.images.slice(0, 4).map((imgUrl, i) => (
                <div
                  key={i}
                  className="aspect-[16/10] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 shadow-md transition-all hover:scale-[1.02]"
                >
                  <img
                    src={imgUrl}
                    alt=""
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            02 — THE PEOPLE: CAST & CREATIVE CONTRIBUTORS
            The faces and minds behind the film.
           ───────────────────────────────────────────────────────────── */}
        <section className="space-y-8 pt-4 border-t border-border/40">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
              The People Behind The Film
            </span>
            <h2 className="font-display text-2xl sm:text-4xl text-foreground font-bold mt-1">
              Cast & Principal Creators
            </h2>
          </div>

          {/* Principal Cast Avatars */}
          {m.cast.length ? (
            <div className="space-y-3">
              <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted-foreground">
                Lead Performances
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {m.cast.slice(0, 6).map((actor) => (
                  <Link
                    key={actor.id}
                    to="/person/$id"
                    params={{ id: String(actor.id) }}
                    className="group flex flex-col items-center text-center transition hover:-translate-y-1"
                  >
                    <div className="size-20 sm:size-24 overflow-hidden rounded-full bg-surface-2 ring-1 ring-border/50 group-hover:ring-gold/60 shadow-md">
                      {actor.profile ? (
                        <img
                          src={actor.profile}
                          alt={actor.name}
                          loading="lazy"
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid size-full place-items-center font-display text-muted-foreground text-sm">
                          {actor.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="mt-2.5 font-display text-xs text-foreground group-hover:text-gold font-medium truncate w-full">
                      {actor.name}
                    </div>
                    <div className="font-mono text-[0.62rem] text-muted-foreground truncate w-full">
                      {actor.character}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Key Creative Contributors (Screenplay, Cinematography, Score, Editing) */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4 pt-4 border-t border-border/30">
            {m.writers.length ? (
              <div className="space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Screenplay
                </span>
                <p className="font-display text-sm text-foreground font-medium">
                  {m.writers.join(", ")}
                </p>
              </div>
            ) : null}

            {cinematographer ? (
              <div className="space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Cinematography
                </span>
                <Link
                  to="/person/$id"
                  params={{ id: String(cinematographer.id) }}
                  className="block font-display text-sm text-foreground font-medium hover:text-gold transition"
                >
                  {cinematographer.name}
                </Link>
              </div>
            ) : null}

            {composer ? (
              <div className="space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Original Score
                </span>
                <Link
                  to="/person/$id"
                  params={{ id: String(composer.id) }}
                  className="block font-display text-sm text-foreground font-medium hover:text-gold transition"
                >
                  {composer.name}
                </Link>
              </div>
            ) : null}

            {editor ? (
              <div className="space-y-1">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Film Editing
                </span>
                <p className="font-display text-sm text-foreground font-medium">
                  {editor.name}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            03 — THE FILMMAKER: EDITORIAL CAREER TIMELINE
            Simple, elegant axis: PRECEDING ── CURRENT FILM ── SUCCEEDING
            Positioned within director's career, not a boxed card!
           ───────────────────────────────────────────────────────────── */}
        {m.directorCareer ? (
          <section className="py-8 border-y border-border/40">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <div>
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-gold font-semibold">
                  Filmmaker Continuum
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-foreground font-bold">
                  Where this film sits in the career of {m.director}
                </h3>
                {directorWatchedCount > 0 ? (
                  <p className="font-mono text-xs text-gold/90 mt-0.5">
                    You've logged {directorWatchedCount} of {m.directorCareer.totalFilms} films directed by {m.director}.
                  </p>
                ) : null}
              </div>

              <Link
                to="/person/$id"
                params={{ id: String(m.directorCareer.directorId) }}
                className="font-mono text-xs text-muted-foreground hover:text-gold transition-colors flex items-center gap-1"
              >
                <span>Complete career oeuvre ({m.directorCareer.totalFilms} films)</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            {/* Clean Typographic Axis (PRECEDING ── CURRENT ── SUCCEEDING) */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 items-center">
              {/* Preceding Feature */}
              <div className="sm:pr-4">
                {m.directorCareer.before ? (
                  <Link
                    to="/movie/$id"
                    params={{ id: String(m.directorCareer.before.id) }}
                    className="group inline-flex items-center gap-3 transition-colors hover:text-gold"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 shadow-sm">
                      {m.directorCareer.before.poster ? (
                        <img
                          src={m.directorCareer.before.poster}
                          alt=""
                          className="size-full object-cover transition group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 font-mono text-[0.62rem] text-muted-foreground">
                        <ArrowLeft className="size-3" />
                        <span>Preceding Work ({m.directorCareer.before.year})</span>
                      </div>
                      <div className="font-display text-sm text-foreground group-hover:text-gold font-medium truncate">
                        {m.directorCareer.before.title}
                      </div>
                      <div className="font-mono text-[0.65rem] text-gold font-medium">
                        ★ {m.directorCareer.before.rating.toFixed(1)}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground italic">
                    Directorial Debut
                  </span>
                )}
              </div>

              {/* Current Film Focus (Dominant Center Anchor) */}
              <div className="sm:text-center sm:border-x border-border/40 sm:px-6 py-2">
                <span className="inline-block rounded-full bg-gold/15 px-3 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-gold font-semibold ring-1 ring-gold/30">
                  Current Feature
                </span>
                <div className="mt-1 font-display text-lg sm:text-xl text-foreground font-bold truncate">
                  {m.title}
                </div>
                <div className="font-mono text-xs text-muted-foreground mt-0.5">
                  Film {m.directorCareer.currentNumber} of {m.directorCareer.totalFilms} directed
                </div>
              </div>

              {/* Succeeding Feature */}
              <div className="sm:text-right sm:pl-4">
                {m.directorCareer.after ? (
                  <Link
                    to="/movie/$id"
                    params={{ id: String(m.directorCareer.after.id) }}
                    className="group inline-flex items-center gap-3 sm:flex-row-reverse transition-colors hover:text-gold"
                  >
                    <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 shadow-sm">
                      {m.directorCareer.after.poster ? (
                        <img
                          src={m.directorCareer.after.poster}
                          alt=""
                          className="size-full object-cover transition group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:justify-end font-mono text-[0.62rem] text-muted-foreground">
                        <span>Next Project ({m.directorCareer.after.year})</span>
                        <ArrowRight className="size-3" />
                      </div>
                      <div className="font-display text-sm text-foreground group-hover:text-gold font-medium truncate">
                        {m.directorCareer.after.title}
                      </div>
                      <div className="font-mono text-[0.65rem] text-gold font-medium">
                        ★ {m.directorCareer.after.rating.toFixed(1)}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground italic">
                    Most Recent Released Feature
                  </span>
                )}
              </div>
            </div>
          </section>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            04 — RELATED CINEMA: THE WORLD OF THE FILMMAKER
            Explore the director's companions and thematic cousins.
           ───────────────────────────────────────────────────────────── */}
        {otherDirectorFilms.length ? (
          <section className="space-y-4 pt-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                  Auteur Oeuvre
                </span>
                <h3 className="font-display text-2xl sm:text-3xl text-foreground font-bold">
                  More Films by {m.director}
                </h3>
              </div>

              <Link
                to="/person/$id"
                params={{ id: String(m.directorId) }}
                className="font-mono text-xs text-gold hover:underline flex items-center gap-1"
              >
                <span>View All Directed</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {otherDirectorFilms.slice(0, 4).map((film) => (
                <Link
                  key={film.id}
                  to="/movie/$id"
                  params={{ id: String(film.id) }}
                  className="group flex flex-col gap-2"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 transition duration-300 group-hover:ring-gold/60 group-hover:shadow-lg">
                    {film.poster ? (
                      <img
                        src={film.poster}
                        alt={film.title}
                        loading="lazy"
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-sm text-foreground font-medium group-hover:text-gold truncate">
                      {film.title}
                    </div>
                    <div className="font-mono text-[0.65rem] text-muted-foreground flex items-center justify-between">
                      <span>{film.year}</span>
                      <span className="text-gold font-medium">★ {film.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            05 — THEMATIC COUSINS & ERA CONNECTIONS
           ───────────────────────────────────────────────────────────── */}
        {m.recommended.length ? (
          <div className="pt-4 border-t border-border/40">
            <PosterRail
              title={`Thematically Connected & ${eraDecade} Cinema`}
              subtitle={`Films sharing narrative rhythm, aesthetic atmosphere, or tone with ${m.title}`}
              items={m.recommended.slice(0, 10)}
            />
          </div>
        ) : null}

        {/* ─────────────────────────────────────────────────────────────
            06 — NATURAL DISCOVERY (THE RABBIT HOLE AS AN OPENING)
            Not a giant screaming block, but an organic prompt leading into
            the wider cinema universe.
           ───────────────────────────────────────────────────────────── */}
        <section className="pt-8 border-t border-border/40">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl border border-border/60 bg-gradient-to-r from-surface to-surface-2">
            <div className="space-y-1 max-w-xl">
              <span className="font-mono text-[0.65rem] uppercase tracking-widest text-gold font-semibold flex items-center gap-1.5">
                <Sparkles className="size-3" />
                <span>Continue the discovery thread</span>
              </span>
              <h4 className="font-display text-xl text-foreground font-bold">
                Follow the cinematic continuum of {m.title}
              </h4>
              <p className="font-serif text-xs text-muted-foreground">
                Discover related auteurs, regional movements, and hidden gems across global cinema archives.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {m.director && m.directorId ? (
                <Link
                  to="/person/$id"
                  params={{ id: String(m.directorId) }}
                  className="rounded-full border border-gold/50 bg-gold/15 px-4 py-2 font-mono text-xs text-gold hover:bg-gold/25 transition"
                >
                  Explore {m.director} →
                </Link>
              ) : null}
              <Link
                to="/discover"
                className="rounded-full border border-border/80 bg-surface px-4 py-2 font-mono text-xs text-muted-foreground hover:text-foreground transition"
              >
                Browse Archive →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
