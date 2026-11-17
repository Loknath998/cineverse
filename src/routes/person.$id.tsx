import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Film,
  Sparkles,
} from "lucide-react";

import { PosterCard, SectionHeader } from "../components/site/media";
import { getPerson } from "../lib/tmdb.api";
import type { MovieCard } from "../lib/tmdb-map";
import { useLibrary } from "../lib/library";

export const Route = createRoute({
  path: "/person/$id",
  loader: ({ params }) => getPerson({ data: { id: Number(params.id) } }),
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Person unavailable — CineVerse" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} — Career World & Timeline — CineVerse`;
    const description =
      loaderData.biography.slice(0, 155) ||
      `${loaderData.name}: ${loaderData.creditCount} film credits in ${loaderData.department}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.profile
          ? [
              { property: "og:image", content: loaderData.profile },
              { name: "twitter:image", content: loaderData.profile },
            ]
          : []),
      ],
    };
  },
  component: PersonPage,
});

type EraGroup = {
  label: string;
  decade: string;
  years: string;
  count: number;
  avgRating: number;
  films: MovieCard[];
};

function PersonPage() {
  const p = Route.useLoaderData() as Awaited<ReturnType<typeof getPerson>>;
  const { watched } = useLibrary();
  const [activeTab, setActiveTab] = useState<"explorer" | "eras" | "timeline" | "deepcuts">("explorer");
  const isDirector = p.department === "Directing";
  const primaryCredits = isDirector && p.crewCredits.length ? p.crewCredits : p.credits;

  // Personal history tracking
  const watchedIds = useMemo(() => new Set(watched.map((w) => w.id)), [watched]);

  // Strict deduplication by movie ID
  const deduplicatedFilmography = useMemo(() => {
    const seen = new Set<number>();
    const list: MovieCard[] = [];
    for (const film of primaryCredits) {
      if (!film || !film.id || seen.has(film.id)) continue;
      seen.add(film.id);
      list.push(film);
    }
    // Sort chronologically ascending (earliest to latest)
    return list.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
  }, [primaryCredits]);

  const watchedCount = useMemo(() => {
    return deduplicatedFilmography.filter((f) => watchedIds.has(f.id)).length;
  }, [deduplicatedFilmography, watchedIds]);

  const completionPct =
    deduplicatedFilmography.length > 0
      ? Math.round((watchedCount / deduplicatedFilmography.length) * 100)
      : 0;

  // Selected project for the "Previous / Next Project Experience"
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number>(() => {
    // Default to a notable mid/recent film or the latest
    return Math.max(0, deduplicatedFilmography.length - 1);
  });

  const currentProject = deduplicatedFilmography[selectedProjectIndex] || deduplicatedFilmography[0];
  const prevProject = selectedProjectIndex > 0 ? deduplicatedFilmography[selectedProjectIndex - 1] : null;
  const nextProject =
    selectedProjectIndex < deduplicatedFilmography.length - 1
      ? deduplicatedFilmography[selectedProjectIndex + 1]
      : null;

  // Compute Meaningful Career Eras (Early, Breakthrough, Peak, Recent)
  const eras: EraGroup[] = useMemo(() => {
    const map = new Map<string, MovieCard[]>();
    for (const film of deduplicatedFilmography) {
      if (!film.year || film.year === "—") continue;
      const decade = `${film.year.slice(0, 3)}0s`;
      if (!map.has(decade)) map.set(decade, []);
      map.get(decade)!.push(film);
    }

    const sortedDecades = Array.from(map.keys()).sort();
    return sortedDecades.map((decade, idx) => {
      const films = map.get(decade)!.sort((a, b) => (a.year || "").localeCompare(b.year || ""));
      const rated = films.filter((f) => f.votes > 10);
      const avg = rated.length
        ? Math.round((rated.reduce((s, f) => s + f.rating, 0) / rated.length) * 10) / 10
        : 0;
      const years = films.map((f) => f.year).filter(Boolean).sort();
      const span = years.length ? `${years[0]}–${years[years.length - 1]}` : decade;

      let eraLabel = `The ${decade} Era`;
      if (idx === 0 && sortedDecades.length > 1) {
        eraLabel = "Early Works & Debut";
      } else if (idx === 1 && sortedDecades.length > 2) {
        eraLabel = "Breakthrough & Rise";
      } else if (idx === sortedDecades.length - 1 && sortedDecades.length > 1) {
        eraLabel = "Recent & Contemporary Work";
      } else {
        eraLabel = "Peak & Defining Chapter";
      }

      return {
        label: eraLabel,
        decade,
        years: span,
        count: films.length,
        avgRating: avg,
        films,
      };
    });
  }, [deduplicatedFilmography]);

  // "Start Here" Curated Entry Path (3 accessible masterworks)
  const startHereFilms = useMemo(() => {
    return p.knownFor.slice(0, 3);
  }, [p.knownFor]);

  // Deep cuts & hidden gems: good rating with under-seen vote volume
  const deepCuts = useMemo(() => {
    return deduplicatedFilmography
      .filter((f) => f.rating >= 6.8 && f.votes >= 20 && f.votes <= 3500)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 12);
  }, [deduplicatedFilmography]);

  const stats: [string, string][] = [
    ["Department", p.department],
    ["Active Since", p.firstYear],
    ["Unique Credits", String(deduplicatedFilmography.length)],
    ["Career Average", p.averageRating ? `★ ${p.averageRating.toFixed(1)}` : "—"],
  ];

  const heroBackdrop = useMemo(() => {
    return p.knownFor.find((f) => f.backdrop)?.backdrop || deduplicatedFilmography.find((f) => f.backdrop)?.backdrop || null;
  }, [p.knownFor, deduplicatedFilmography]);

  return (
    <div className="relative isolate min-h-screen pb-16">
      {heroBackdrop ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[480px] sm:h-[580px] overflow-hidden select-none z-0">
          <img
            src={heroBackdrop}
            alt=""
            aria-hidden="true"
            className="size-full object-cover object-top opacity-30 dark:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>
      ) : null}

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-12 space-y-12">
      {/* ─────────────────────────────────────────────────────────────
          1. FILMMAKER MASTHEAD: Entering the Filmmaker's World
         ───────────────────────────────────────────────────────────── */}
      <section className="grid gap-8 md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
        {/* Left Column: Portrait, Quick Stats, Journal History */}
        <div>
          <div className="overflow-hidden rounded-3xl ring-1 ring-border/60 shadow-2xl bg-surface-2">
            {p.profile ? (
              <img src={p.profile} alt={p.name} className="size-full object-cover aspect-[2/3]" />
            ) : (
              <div className="grid aspect-[2/3] place-items-center font-display text-muted-foreground">
                {p.name}
              </div>
            )}
          </div>

          <dl className="mt-5 divide-y divide-border/50 rounded-2xl border border-border/60 bg-surface p-3">
            {stats.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between px-2 py-2 text-xs">
                <dt className="font-mono text-[0.62rem] text-muted-foreground">{k}</dt>
                <dd className="font-sans text-xs text-foreground font-medium">{v}</dd>
              </div>
            ))}
          </dl>

          {/* Personal History with this Filmmaker */}
          <div className="mt-4 rounded-2xl border border-amber-600/30 bg-amber-500/10 p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-[0.62rem] uppercase tracking-wider text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                <BookOpen className="size-3 text-gold" />
                <span>Your Film Journal</span>
              </span>
              <span className="font-mono text-[0.68rem] text-amber-800 dark:text-amber-300 font-bold">
                {watchedCount} / {deduplicatedFilmography.length} watched
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full bg-gold transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="text-[0.6rem] font-mono text-muted-foreground text-right">
              {completionPct}% of filmography explored
            </div>
          </div>
        </div>

        {/* Right Column: Title, Bio, Start Here Entry Path */}
        <div className="space-y-6">
          <div>
            <div className="label-gold flex items-center gap-1.5">
              <Film className="size-3" />
              <span>{isDirector ? "Auteur & Director" : p.department}</span>
            </div>

            <h1 className="mt-2 font-display text-4xl leading-tight text-foreground sm:text-6xl lg:text-7xl font-bold tracking-tight">
              {p.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              {p.birthday ? <span>Born {p.birthday}</span> : null}
              {p.deathday ? <span>· Died {p.deathday}</span> : null}
              {p.place ? <span>· {p.place}</span> : null}
            </div>
          </div>

          {p.biography ? (
            <div className="border-t border-border/50 pt-5">
              <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold mb-2">
                Biography & Artistic Philosophy
              </div>
              <p className="max-w-3xl font-serif text-xs sm:text-sm leading-relaxed text-foreground/85 whitespace-pre-line">
                {p.biography}
              </p>
            </div>
          ) : null}

          {/* "Start Here" Curated Entry Path */}
          {startHereFilms.length >= 2 ? (
            <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                  <Compass className="size-3.5 text-gold" />
                  <span className="font-display text-sm font-semibold">
                    New to {p.name}? Recommended Entry Path
                  </span>
                </div>
                <span className="font-mono text-[0.6rem] text-muted-foreground">
                  3 signature works to begin your exploration
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {startHereFilms.map((film, index) => {
                  const isLogged = watchedIds.has(film.id);
                  return (
                    <Link
                      key={film.id}
                      to="/movie/$id"
                      params={{ id: String(film.id) }}
                      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-surface p-2.5 transition hover:border-gold/60 hover:-translate-y-0.5"
                    >
                      <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border/40">
                        {film.poster ? (
                          <img src={film.poster} alt={film.title} className="size-full object-cover" />
                        ) : null}
                        {isLogged ? (
                          <div className="absolute top-0.5 right-0.5 grid size-3.5 place-items-center rounded-full bg-gold text-[0.45rem] font-bold text-background">
                            ✓
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-mono text-[0.55rem] text-gold uppercase tracking-wider font-semibold">
                          Step {index + 1}
                        </div>
                        <div className="truncate font-display text-xs text-foreground group-hover:text-gold font-medium">
                          {film.title}
                        </div>
                        <div className="font-mono text-[0.6rem] text-muted-foreground">
                          {film.year} · ★ {film.rating.toFixed(1)}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. PREVIOUS / NEXT PROJECT EXPERIENCE
          Smooth interactive career navigation without page reloading.
         ───────────────────────────────────────────────────────────── */}
      {deduplicatedFilmography.length > 1 && currentProject ? (
        <section className="border-t border-border/60 pt-10 space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border/40 pb-3">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                Interactive Career Navigator
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Move Through {p.name}'s Filmography
              </h2>
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              Film <strong className="text-gold">{selectedProjectIndex + 1}</strong> of{" "}
              {deduplicatedFilmography.length}
            </div>
          </div>

          {/* Previous ← Current Project → Next Controller */}
          <div className="rounded-3xl border border-border/70 bg-surface/80 p-6 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_260px_1fr] lg:grid-cols-[1fr_300px_1fr] items-center">
              {/* Previous Project Button */}
              <div className="flex justify-start">
                {prevProject ? (
                  <button
                    type="button"
                    onClick={() => setSelectedProjectIndex((i) => Math.max(0, i - 1))}
                    className="group flex flex-col items-start gap-1 text-left rounded-2xl border border-border/60 bg-surface p-4 transition hover:border-gold hover:shadow-md max-w-xs w-full"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground group-hover:text-gold">
                      <ChevronLeft className="size-3.5" />
                      <span>Previous Film ({prevProject.year})</span>
                    </div>
                    <div className="font-display text-base font-bold text-foreground group-hover:text-gold truncate w-full">
                      {prevProject.title}
                    </div>
                    <div className="font-mono text-[0.62rem] text-muted-foreground">
                      Film #{selectedProjectIndex}
                    </div>
                  </button>
                ) : (
                  <div className="font-mono text-xs text-muted-foreground italic px-4">
                    First Directed Film
                  </div>
                )}
              </div>

              {/* Center Stage: Active Selected Film */}
              <div className="flex flex-col items-center text-center space-y-3">
                <Link
                  to="/movie/$id"
                  params={{ id: String(currentProject.id) }}
                  className="group relative aspect-[2/3] w-48 sm:w-56 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/50 shadow-2xl transition hover:ring-gold hover:scale-[1.02]"
                >
                  {currentProject.poster ? (
                    <img
                      src={currentProject.poster}
                      alt={currentProject.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center p-3 text-xs text-muted-foreground">
                      {currentProject.title}
                    </div>
                  )}
                  {watchedIds.has(currentProject.id) ? (
                    <div className="absolute top-2 right-2 rounded-full bg-gold px-2 py-0.5 font-mono text-[0.6rem] font-bold text-background shadow flex items-center gap-0.5">
                      <Check className="size-2.5" />
                      <span>Logged</span>
                    </div>
                  ) : null}
                </Link>

                <div>
                  <div className="font-mono text-[0.65rem] text-gold uppercase tracking-wider font-semibold">
                    Film #{selectedProjectIndex + 1} · {currentProject.year}
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    <Link to="/movie/$id" params={{ id: String(currentProject.id) }} className="hover:text-gold">
                      {currentProject.title}
                    </Link>
                  </h3>
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">
                    ★ {currentProject.rating.toFixed(1)} TMDB
                  </div>
                </div>

                <Link
                  to="/movie/$id"
                  params={{ id: String(currentProject.id) }}
                  className="rounded-full bg-gold px-5 py-2 font-sans text-xs font-semibold text-background hover:bg-gold-soft transition shadow"
                >
                  Enter This Film →
                </Link>
              </div>

              {/* Next Project Button */}
              <div className="flex justify-end">
                {nextProject ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedProjectIndex((i) => Math.min(deduplicatedFilmography.length - 1, i + 1))
                    }
                    className="group flex flex-col items-end gap-1 text-right rounded-2xl border border-border/60 bg-surface p-4 transition hover:border-gold hover:shadow-md max-w-xs w-full"
                  >
                    <div className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground group-hover:text-gold">
                      <span>Next Film ({nextProject.year})</span>
                      <ChevronRight className="size-3.5" />
                    </div>
                    <div className="font-display text-base font-bold text-foreground group-hover:text-gold truncate w-full">
                      {nextProject.title}
                    </div>
                    <div className="font-mono text-[0.62rem] text-muted-foreground">
                      Film #{selectedProjectIndex + 2}
                    </div>
                  </button>
                ) : (
                  <div className="font-mono text-xs text-muted-foreground italic px-4">
                    Latest Film
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Scrubbing Track */}
            <div className="mt-8 pt-6 border-t border-border/40 flex items-center justify-between gap-1 overflow-x-auto hide-scrollbar">
              {deduplicatedFilmography.map((film, idx) => (
                <button
                  key={film.id}
                  type="button"
                  onClick={() => setSelectedProjectIndex(idx)}
                  className={`group flex flex-col items-center gap-1 py-1 px-1.5 transition ${
                    selectedProjectIndex === idx ? "opacity-100 scale-110" : "opacity-40 hover:opacity-80"
                  }`}
                >
                  <div
                    className={`size-2.5 rounded-full transition ${
                      selectedProjectIndex === idx
                        ? "bg-gold ring-2 ring-gold/40"
                        : watchedIds.has(film.id)
                        ? "bg-amber-500"
                        : "bg-muted-foreground"
                    }`}
                  />
                  <span className="font-mono text-[0.58rem] text-muted-foreground group-hover:text-foreground">
                    {film.year || "—"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          3. CAREER TABS: Eras vs Chronological vs Deep Cuts
         ───────────────────────────────────────────────────────────── */}
      <section className="border-t border-border/60 pt-10">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Complete Career Filmography
            </h2>
            <p className="mt-1 font-sans text-xs text-muted-foreground">
              {deduplicatedFilmography.length} unique titles ordered chronologically with zero duplicates
            </p>
          </div>

          <div className="flex rounded-full border border-border/70 bg-surface p-1 text-xs">
            <button
              onClick={() => setActiveTab("eras")}
              className={`rounded-full px-4 py-1.5 font-sans transition-colors ${
                activeTab === "eras"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Career Eras ({eras.length})
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`rounded-full px-4 py-1.5 font-sans transition-colors ${
                activeTab === "timeline"
                  ? "bg-gold text-background font-medium shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Chronological ({deduplicatedFilmography.length})
            </button>
            {deepCuts.length ? (
              <button
                onClick={() => setActiveTab("deepcuts")}
                className={`rounded-full px-4 py-1.5 font-sans transition-colors ${
                  activeTab === "deepcuts"
                    ? "bg-gold text-background font-medium shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Deep Cuts ({deepCuts.length})
              </button>
            ) : null}
          </div>
        </div>

        {/* Tab 1: Career Eras */}
        {activeTab === "eras" ? (
          <div className="space-y-12">
            {eras.map((era) => (
              <div key={era.decade} className="rounded-2xl border border-border/60 bg-surface/60 p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-3 mb-5">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-xl text-foreground font-bold">
                      {era.label}
                    </span>
                    <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[0.62rem] text-muted-foreground">
                      {era.years}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-muted-foreground">{era.count} films</span>
                    {era.avgRating ? (
                      <span className="text-gold font-medium">★ {era.avgRating.toFixed(1)} era avg</span>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {era.films.map((film) => {
                    const isLogged = watchedIds.has(film.id);
                    return (
                      <div key={film.id} className="relative group">
                        <PosterCard movie={film} width="w-full" />
                        {isLogged ? (
                          <div className="absolute top-2 right-2 rounded-full bg-gold px-1.5 py-0.5 text-[0.55rem] font-bold text-background shadow font-mono flex items-center gap-0.5">
                            <Check className="size-2.5" />
                            <span>Logged</span>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Tab 2: Full Chronological Timeline */}
        {activeTab === "timeline" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {deduplicatedFilmography.map((film, index) => {
                const isLogged = watchedIds.has(film.id);
                return (
                  <div key={film.id} className="relative group flex flex-col">
                    <div className="mb-1 font-mono text-[0.6rem] text-gold font-medium">
                      Film #{index + 1} ({film.year})
                    </div>
                    <PosterCard movie={film} width="w-full" />
                    {isLogged ? (
                      <div className="absolute top-6 right-2 rounded-full bg-gold px-1.5 py-0.5 text-[0.55rem] font-bold text-background shadow font-mono flex items-center gap-0.5">
                        <Check className="size-2.5" />
                        <span>Logged</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Tab 3: Deep Cuts */}
        {activeTab === "deepcuts" ? (
          <div>
            <div className="mb-6 rounded-2xl border border-gold/30 bg-gold/5 p-4 text-xs font-sans text-muted-foreground flex items-center gap-3">
              <Sparkles className="size-5 text-gold shrink-0" />
              <span>
                Critically acclaimed works in {p.name}'s career that receive less mainstream attention. Perfect for cinephile exploration.
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {deepCuts.map((film) => {
                const isLogged = watchedIds.has(film.id);
                return (
                  <div key={film.id} className="relative group">
                    <PosterCard movie={film} width="w-full" />
                    {isLogged ? (
                      <div className="absolute top-2 right-2 rounded-full bg-gold px-1.5 py-0.5 text-[0.55rem] font-bold text-background shadow font-mono flex items-center gap-0.5">
                        <Check className="size-2.5" />
                        <span>Logged</span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. FREQUENT COLLABORATIONS MATRIX
         ───────────────────────────────────────────────────────────── */}
      {p.collaborators.length ? (
        <section className="border-t border-border/60 pt-10">
          <SectionHeader
            title="Frequent Collaborations"
            subtitle="The actors, cinematographers, composers, and craftspeople who formed their creative circle"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {p.collaborators.map((c) => (
              <Link
                key={c.id}
                to="/person/$id"
                params={{ id: String(c.id) }}
                className="group flex flex-col items-center rounded-2xl border border-border/70 bg-surface p-4 text-center transition-all hover:border-gold/60 hover:-translate-y-0.5"
              >
                <div className="size-16 overflow-hidden rounded-full bg-surface-2 ring-1 ring-border/50 group-hover:ring-gold/60 shadow-sm">
                  {c.profile ? (
                    <img src={c.profile} alt={c.name} className="size-full object-cover" />
                  ) : (
                    <div className="grid size-full place-items-center font-display text-sm text-muted-foreground">
                      {c.name[0]}
                    </div>
                  )}
                </div>
                <div className="mt-3 truncate font-display text-xs text-foreground font-medium group-hover:text-gold w-full">
                  {c.name}
                </div>
                <div className="mt-0.5 font-mono text-[0.58rem] text-muted-foreground truncate w-full">
                  {c.role}
                </div>
                <div className="mt-2 rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[0.55rem] text-gold font-medium">
                  {c.count} shared films
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      </div>
    </div>
  );
}
