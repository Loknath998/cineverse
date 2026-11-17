import React, { useState, useEffect } from "react";
import { createRoute } from "../lib/route";
import { Link, useNavigate } from "../lib/router";
import { PosterGrid, SectionHeader } from "../components/site/media";
import { discoverFilms, searchAll } from "../lib/tmdb.api";
import { GENRES } from "../lib/tmdb-map";
import { CINEMA_WORLDS_LIST, CURATION_PRESETS, getCinemaWorld } from "../lib/cinema-worlds";
import {
  Compass,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Loader2,
  Globe,
  X,
} from "lucide-react";
import type { MovieCard } from "../lib/tmdb-map";

type Search = {
  q?: string | undefined;
  world?: string | undefined;
  preset?: string | undefined;
  genre?: number | undefined;
  decade?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
};

const SORTS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "deep_cuts", label: "✨ Deep Cuts & Gems" },
  { value: "primary_release_date.desc", label: "Newest Releases" },
  { value: "primary_release_date.asc", label: "Earliest Classics" },
  { value: "revenue.desc", label: "Box Office" },
];

const DECADES = [
  { value: "2020", label: "2020s" },
  { value: "2010", label: "2010s" },
  { value: "2000", label: "2000s" },
  { value: "1990", label: "1990s" },
  { value: "1980", label: "1980s" },
  { value: "1970", label: "1970s" },
  { value: "1960", label: "1960s" },
  { value: "1950", label: "1950s" },
  { value: "pre1950", label: "Pre-1950" },
];

export const Route = createRoute({
  path: "/discover",
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(search["q"] ? { q: String(search["q"]) } : {}),
    ...(search["world"] ? { world: String(search["world"]) } : {}),
    ...(search["preset"] ? { preset: String(search["preset"]) } : {}),
    ...(search["genre"] ? { genre: Number(search["genre"]) } : {}),
    ...(search["decade"] ? { decade: String(search["decade"]) } : {}),
    ...(search["sort"] ? { sort: String(search["sort"]) } : {}),
    ...(search["page"] ? { page: Number(search["page"]) } : {}),
  }),
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    if (deps.q) {
      const results = await searchAll({ data: { q: deps.q } });
      return { mode: "search" as const, results, discover: null };
    }
    const discover = await discoverFilms({
      data: {
        world: deps.world,
        preset: deps.preset,
        genres: deps.genre ? [deps.genre] : undefined,
        decade: deps.decade,
        sort: deps.sort,
        page: deps.page ?? 1,
      },
    });
    return { mode: "discover" as const, results: null, discover };
  },
  head: () => ({
    meta: [
      { title: "Cinema Worlds & Archive Discovery — CineVerse" },
      {
        name: "description",
        content:
          "Explore full film catalogues across 20+ world cinema traditions: Hollywood, Kollywood, Mollywood, Korean, Japanese, French, and beyond.",
      },
      { property: "og:title", content: "Cinema Worlds & Archive Discovery — CineVerse" },
      {
        property: "og:description",
        content: "Explore thousands of films across world cinema traditions, movements, and eras.",
      },
    ],
  }),
  component: Discover,
});

function Discover() {
  const data = Route.useLoaderData() as {
    mode: "search" | "discover";
    results: Awaited<ReturnType<typeof searchAll>> | null;
    discover: Awaited<ReturnType<typeof discoverFilms>> | null;
  };
  const search = Route.useSearch() as Search;
  const navigate = useNavigate();

  const activeWorld = getCinemaWorld(search.world);

  // Dynamic continuous load more state
  const [loadedFilms, setLoadedFilms] = useState<MovieCard[]>(data.discover?.items ?? []);
  const [currentPage, setCurrentPage] = useState<number>(data.discover?.page ?? (search.page ?? 1));
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(
    data.discover ? (data.discover.page < data.discover.pages) : false,
  );

  // Synchronize with loader updates when search params change
  useEffect(() => {
    if (data.discover) {
      setLoadedFilms(data.discover.items);
      setCurrentPage(data.discover.page);
      setHasMore(data.discover.page < data.discover.pages);
    }
  }, [data.discover]);

  const set = (patch: Partial<Search>) =>
    navigate({
      search: (prev: Search) =>
        ({
          ...prev,
          ...patch,
          page: undefined, // Reset page on filter change
        }) as Search,
    });

  const resetAllFilters = () => {
    navigate({
      search: search.world ? { world: search.world } : {},
    });
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !data.discover) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const res = await discoverFilms({
        data: {
          world: search.world,
          preset: search.preset,
          genres: search.genre ? [search.genre] : undefined,
          decade: search.decade,
          sort: search.sort,
          page: nextPage,
        },
      });

      setLoadedFilms((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const fresh = res.items.filter((m) => !existingIds.has(m.id));
        return [...prev, ...fresh];
      });
      setCurrentPage(nextPage);
      setHasMore(nextPage < res.pages);
    } catch (err) {
      console.error("Failed to fetch next cinema page:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const hasExtraFilters = !!(search.genre || search.decade || search.sort || search.preset);

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 sm:py-12">
      {/* ─────────────────────────────────────────────────────────────
          1. CINEMA WORLDS HORIZONTAL STRIP (Dynamic World Switcher)
         ───────────────────────────────────────────────────────────── */}
      <section className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-gold font-semibold">
            <Globe className="size-3.5" />
            <span>Select Cinema World</span>
          </div>
          <span className="font-mono text-[0.62rem] text-muted-foreground">
            {CINEMA_WORLDS_LIST.length} Living Traditions
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => set({ world: undefined, q: undefined })}
            className={`rounded-full border px-4 py-2 font-mono text-xs tracking-wider transition whitespace-nowrap ${
              !search.world
                ? "border-gold bg-gold/20 text-gold shadow-sm ring-1 ring-gold/40 font-semibold"
                : "border-border/70 bg-surface text-muted-foreground hover:border-gold/40 hover:text-foreground"
            }`}
          >
            ALL WORLDS
          </button>
          {CINEMA_WORLDS_LIST.map((w) => {
            const isSelected = search.world?.toLowerCase() === w.id.toLowerCase();
            return (
              <button
                key={w.id}
                onClick={() => set({ world: w.id, q: undefined })}
                className={`rounded-full border px-4 py-2 font-mono text-xs tracking-wider transition whitespace-nowrap ${
                  isSelected
                    ? "border-gold bg-gold/20 text-gold shadow-sm ring-1 ring-gold/40 font-semibold"
                    : "border-border/70 bg-surface text-muted-foreground hover:border-gold/40 hover:text-foreground"
                }`}
              >
                {w.name.toUpperCase()}
              </button>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HEADER OR EDITORIAL CINEMA WORLD SHOWCASE BANNER
         ───────────────────────────────────────────────────────────── */}
      {data.mode === "search" ? (
        <div className="mb-8">
          <div className="label-gold">Search results</div>
          <h1 className="mt-2 font-display text-3xl sm:text-5xl text-foreground font-bold">
            “{search.q}”
          </h1>
        </div>
      ) : activeWorld ? (
        <section className="mb-10 relative overflow-hidden rounded-3xl border border-border/80 bg-surface-2 p-6 sm:p-10 shadow-xl">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                {activeWorld.nativeOrSub}
              </span>
              <span className="font-mono text-[0.68rem] text-muted-foreground">·</span>
              <span className="rounded-full bg-surface px-2.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground ring-1 ring-border/60">
                {activeWorld.era}
              </span>
              {data.discover?.total ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-0.5 font-mono text-[0.65rem] font-semibold text-gold ring-1 ring-gold/30">
                  <Sparkles className="size-3" />
                  {data.discover.total.toLocaleString()} Films Available in Live Archive
                </span>
              ) : null}
            </div>

            <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight text-foreground leading-[0.98]">
              {activeWorld.name}
            </h1>

            <p className="font-serif text-base sm:text-lg italic text-gold-soft font-light">
              “{activeWorld.tagline}”
            </p>

            <p className="font-sans text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-3xl">
              {activeWorld.description}
            </p>

            {/* Key Auteurs Quick Jumps */}
            {activeWorld.keyDirectors.length > 0 ? (
              <div className="pt-3 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
                  Key Auteurs:
                </span>
                {activeWorld.keyDirectors.map((d) => (
                  <Link
                    key={d.id}
                    to="/person/$id"
                    params={{ id: String(d.id) }}
                    className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-surface px-2.5 py-1 font-display text-xs text-foreground hover:border-gold/60 hover:text-gold transition"
                  >
                    <span>{d.name}</span>
                    <ArrowRight className="size-2.5 opacity-60" />
                  </Link>
                ))}
              </div>
            ) : null}
          </div>

          <div className="absolute right-4 top-4">
            <button
              onClick={() => set({ world: undefined })}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-surface/80 px-3 py-1 font-mono text-[0.65rem] text-muted-foreground hover:text-foreground transition"
            >
              <span>View All Worlds</span>
              <X className="size-3" />
            </button>
          </div>
        </section>
      ) : (
        <section className="mb-8 space-y-2">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            GLOBAL CINEMA ARCHIVE
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h1 className="font-display text-3xl sm:text-5xl font-bold text-foreground">
              The Living Film Universe.
            </h1>
            {data.discover?.total ? (
              <span className="font-mono text-xs text-gold">
                {data.discover.total.toLocaleString()} Films Accessible
              </span>
            ) : null}
          </div>
          <p className="font-serif text-sm italic text-muted-foreground max-w-2xl">
            Explore thousands of films across international cinema traditions, movements, and eras. No limited catalogue — every film streams directly from the TMDB database.
          </p>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. CURATION PRESETS STRIP
         ───────────────────────────────────────────────────────────── */}
      {data.mode === "discover" ? (
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-border/40 pb-4">
          <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground mr-1">
            Browse Presets:
          </span>
          {CURATION_PRESETS.map((p) => {
            const isActive = (!search.preset && p.id === "all") || search.preset === p.id;
            return (
              <button
                key={p.id}
                onClick={() => set({ preset: p.id === "all" ? undefined : p.id, q: undefined })}
                className={`rounded-lg border px-3 py-1.5 font-mono text-[0.68rem] tracking-wider transition ${
                  isActive
                    ? "border-gold bg-gold/20 text-gold font-semibold"
                    : "border-border/60 bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          4. GRANULAR FILTERS: DECADE, GENRE & SORT
         ───────────────────────────────────────────────────────────── */}
      {data.mode === "discover" ? (
        <div className="mb-8 space-y-4 rounded-2xl border border-border/60 bg-surface/60 p-4 sm:p-5">
          {/* Decades */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono mr-1">Decade:</span>
            <button
              onClick={() => set({ decade: undefined })}
              className={`font-mono text-xs px-2.5 py-1 rounded transition ${
                !search.decade
                  ? "bg-gold/15 text-gold font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Eras
            </button>
            {DECADES.map((d) => (
              <button
                key={d.value}
                onClick={() => set({ decade: search.decade === d.value ? undefined : d.value })}
                className={`font-mono text-xs px-2.5 py-1 rounded transition ${
                  search.decade === d.value
                    ? "bg-gold/20 text-gold font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/30">
            <span className="label-mono mr-1">Genre:</span>
            <button
              onClick={() => set({ genre: undefined })}
              className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wider transition ${
                !search.genre
                  ? "border-gold bg-gold/15 text-gold font-semibold"
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              ALL
            </button>
            {Object.entries(GENRES)
              .filter(([id]) => id !== "10770")
              .map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => set({ genre: search.genre === Number(id) ? undefined : Number(id) })}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[0.62rem] tracking-wider transition ${
                    search.genre === Number(id)
                      ? "border-gold bg-gold/15 text-gold font-semibold"
                      : "border-border/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {name.toUpperCase()}
                </button>
              ))}
          </div>

          {/* Sort & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/30">
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono mr-1">Sort:</span>
              {SORTS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => set({ sort: s.value })}
                  className={`font-mono text-[0.65rem] tracking-wider px-2 py-0.5 rounded transition ${
                    (search.sort ?? "popularity.desc") === s.value
                      ? "text-gold font-semibold underline underline-offset-4"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {hasExtraFilters ? (
              <button
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-gold hover:underline"
              >
                <RotateCcw className="size-3" />
                <span>Reset Filters</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          5. SEARCH RESULTS VIEW (Mode = "search")
         ───────────────────────────────────────────────────────────── */}
      {data.mode === "search" && data.results ? (
        <div className="mt-8 space-y-12">
          {data.results.people.length ? (
            <section>
              <SectionHeader title="People" subtitle={`${data.results.people.length} matches`} />
              <div className="flex gap-5 overflow-x-auto pb-2 hide-scrollbar">
                {data.results.people.map((p) => (
                  <Link
                    key={p.id}
                    to="/person/$id"
                    params={{ id: String(p.id) }}
                    className="group w-28 shrink-0 text-center"
                  >
                    <div className="aspect-square overflow-hidden rounded-full bg-surface-2 ring-1 ring-border/60 group-hover:ring-gold/60">
                      {p.profile ? (
                        <img
                          src={p.profile}
                          alt={p.name}
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="mt-2 font-display text-xs text-foreground truncate">{p.name}</div>
                    <div className="label-mono">{p.role}</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {data.results.collections.length ? (
            <section>
              <SectionHeader title="Collections" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.results.collections.map((c) => (
                  <Link
                    key={c.id}
                    to="/collections/$id"
                    params={{ id: String(c.id) }}
                    className="group relative aspect-[16/7] overflow-hidden rounded-xl ring-1 ring-border/50 hover:ring-gold/60"
                  >
                    {c.backdrop ? (
                      <img
                        src={c.backdrop}
                        alt=""
                        loading="lazy"
                        className="size-full object-cover opacity-50 group-hover:opacity-70"
                      />
                    ) : null}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
                      data-overlay-bg="true"
                    />
                    <span
                      data-overlay-text="true"
                      className="absolute inset-x-0 bottom-0 p-4 font-display text-sm text-white font-medium"
                    >
                      {c.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionHeader
              title="Films"
              subtitle={`${data.results.films.length} results matching “${search.q}”`}
            />
            {data.results.films.length ? (
              <PosterGrid items={data.results.films} />
            ) : (
              <p className="font-sans text-sm text-muted-foreground">
                Nothing matched. Try searching by another title, filmmaker or actor.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          6. DISCOVERY VIEW: GRID + LOAD MORE CONTINUOUS STREAM
         ───────────────────────────────────────────────────────────── */}
      {data.mode === "discover" && data.discover ? (
        <div className="mt-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                {activeWorld
                  ? `${activeWorld.name} Films`
                  : search.genre
                  ? `${GENRES[search.genre]} Cinema`
                  : "Catalogue"}
              </h2>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Displaying {loadedFilms.length} of {data.discover.total.toLocaleString()} films in archive · Page {currentPage} of {data.discover.pages}
              </p>
            </div>

            {hasMore ? (
              <span className="font-mono text-[0.68rem] text-gold">
                Continuous stream enabled ↓
              </span>
            ) : null}
          </div>

          {loadedFilms.length > 0 ? (
            <PosterGrid items={loadedFilms} />
          ) : (
            <div className="py-20 text-center space-y-4 rounded-2xl border border-dashed border-border/70 p-8">
              <Compass className="size-10 text-gold/60 mx-auto" />
              <h3 className="font-display text-xl text-foreground">No films found in this section</h3>
              <p className="font-sans text-xs text-muted-foreground max-w-md mx-auto">
                No films matched this specific filter configuration. Try broadening your decade or genre selection.
              </p>
              <button
                onClick={resetAllFilters}
                className="rounded-full border border-gold/60 bg-gold/10 px-4 py-2 font-mono text-xs text-gold hover:bg-gold/20 transition"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Load More Continuous Button */}
          {hasMore ? (
            <div className="mt-14 text-center space-y-3">
              <button
                disabled={isLoadingMore}
                onClick={handleLoadMore}
                className="group inline-flex items-center gap-2.5 rounded-2xl border border-gold/50 bg-gold/10 px-8 py-3.5 font-mono text-xs uppercase tracking-widest text-gold shadow-lg shadow-black/20 hover:bg-gold/20 hover:border-gold transition-all duration-300 disabled:opacity-50"
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-gold" />
                    <span>Loading TMDB Stream...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Films</span>
                    <span className="font-sans text-[0.7rem] opacity-70">
                      (Page {currentPage + 1} of {data.discover.pages})
                    </span>
                    <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="font-mono text-[0.65rem] text-muted-foreground">
                Showing {loadedFilms.length} of {data.discover.total.toLocaleString()} total films
              </div>
            </div>
          ) : loadedFilms.length > 0 ? (
            <div className="mt-12 text-center py-6 border-t border-border/40">
              <p className="font-serif text-sm italic text-muted-foreground">
                You have reached the end of this cinema stream ({loadedFilms.length} films).
              </p>
            </div>
          ) : null}

          {/* Classic Page Jumper / Direct Page Pagination */}
          <div className="mt-12 flex items-center justify-center gap-4 pt-6 border-t border-border/30">
            <button
              disabled={(search.page ?? 1) <= 1}
              onClick={() =>
                navigate({
                  search: (prev: Search) => ({ ...prev, page: (prev.page ?? 1) - 1 }),
                })
              }
              className="rounded-xl border border-border px-4 py-2 font-mono text-[0.65rem] tracking-wider text-muted-foreground disabled:opacity-30 hover:text-foreground transition"
            >
              PREVIOUS PAGE
            </button>
            <span className="label-mono">
              PAGE {search.page ?? 1} / {data.discover.pages}
            </span>
            <button
              disabled={(search.page ?? 1) >= data.discover.pages}
              onClick={() =>
                navigate({
                  search: (prev: Search) => ({ ...prev, page: (prev.page ?? 1) + 1 }),
                })
              }
              className="rounded-xl border border-border px-4 py-2 font-mono text-[0.65rem] tracking-wider text-muted-foreground disabled:opacity-30 hover:text-foreground transition"
            >
              NEXT PAGE
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
