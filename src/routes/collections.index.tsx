import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { ArrowRight, Film, Sparkles } from "lucide-react";

import { getCollectionsPage } from "../lib/tmdb.api";

export const Route = createRoute({
  path: "/collections/",
  loader: () => getCollectionsPage(),
  head: () => ({
    meta: [
      { title: "Collections & Sagas — CineVerse" },
      {
        name: "description",
        content:
          "Explore expressive cinema collections, franchise arcs, thematic trilogies, and regional movements across world film history.",
      },
      { property: "og:title", content: "Collections & Sagas — CineVerse" },
    ],
  }),
  component: CollectionsPage,
});

function CollectionsPage() {
  const {
    featured,
    cinematicBanners = [],
    posterClusters = [],
    textLedWorlds = [],
    community = [],
  } = Route.useLoaderData() as Awaited<ReturnType<typeof getCollectionsPage>>;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-12 space-y-16">
      {/* Editorial Masthead */}
      <div className="max-w-3xl space-y-2">
        <div className="font-mono text-xs text-gold uppercase tracking-[0.25em] font-semibold">
          THE CINEMA ARCHIVE
        </div>
        <h1 className="font-display text-4xl sm:text-6xl text-foreground font-bold tracking-tight">
          COLLECTIONS
        </h1>
        <p className="font-display text-xl sm:text-2xl text-gold-soft italic">
          Films that belong together.
        </p>
        <p className="font-serif text-xs sm:text-sm leading-relaxed text-muted-foreground pt-1">
          Sagas, thematic trilogies, and curated regional movements. Explore complete cinematic arcs preserved in chronological and authorial continuity.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          1. HUGE FEATURED SAGA: Dominant Visual Moment
         ───────────────────────────────────────────────────────────── */}
      {featured ? (
        <section className="relative isolate overflow-hidden rounded-3xl border border-border/70 bg-stone-950 text-stone-100 shadow-2xl">
          {featured.backdrop ? (
            <div className="absolute inset-0 z-0 select-none">
              <img
                src={featured.backdrop}
                alt={featured.name}
                className="size-full object-cover opacity-35 transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent lg:w-2/3" />
            </div>
          ) : null}

          <div className="relative z-10 flex flex-col justify-end p-6 sm:p-10 lg:p-14 min-h-[420px] sm:min-h-[480px]">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-3.5 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-gold font-semibold backdrop-blur-sm ring-1 ring-gold/30">
                <Sparkles className="size-3" />
                <span>Featured Saga · {featured.count} Films</span>
              </div>

              <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1]">
                {featured.name}
              </h2>

              <p className="font-serif text-sm sm:text-base leading-relaxed text-foreground/85 line-clamp-3">
                {featured.overview || "Experience one of cinema's defining narrative continuums from beginning to conclusion."}
              </p>

              {featured.posters && featured.posters.length ? (
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  {featured.posters.slice(0, 5).map((p, idx) => (
                    <div
                      key={p || idx}
                      className="aspect-[2/3] w-14 sm:w-16 overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border/50 shadow-md"
                    >
                      <img src={p} alt="" className="size-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="pt-4">
                <Link
                  to="/collections/$id"
                  params={{ id: String(featured.id) }}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3 font-sans text-xs font-semibold tracking-wide text-background shadow-lg shadow-gold/20 transition hover:bg-gold-soft hover:scale-[1.02]"
                >
                  <span>Explore Complete Arc</span>
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          2. CINEMATIC BANNERS: Wide Sagas & Trilogies
         ───────────────────────────────────────────────────────────── */}
      {cinematicBanners.length ? (
        <section className="space-y-6">
          <div className="border-b border-border/40 pb-3 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                Major Continuums
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                Cinematic Sagas & Arcs
              </h2>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {cinematicBanners.length} Signature Sagas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cinematicBanners.map((c) => (
              <Link
                key={c.id}
                to="/collections/$id"
                params={{ id: String(c.id) }}
                className="group relative overflow-hidden rounded-2xl border border-border/70 bg-surface transition-all duration-300 hover:border-gold/60 hover:-translate-y-1 hover:shadow-xl aspect-[16/9] flex flex-col justify-end p-6"
              >
                {c.backdrop ? (
                  <img
                    src={c.backdrop}
                    alt={c.name}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover opacity-40 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-55"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                <div className="relative z-10 space-y-2">
                  <div className="font-mono text-[0.65rem] text-gold uppercase tracking-wider font-semibold">
                    {c.count} Films
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground group-hover:text-gold transition">
                    {c.name}
                  </h3>
                  <p className="font-serif text-xs italic text-foreground/80 line-clamp-2">
                    {c.overview || c.tagline}
                  </p>
                  {c.posters && c.posters.length ? (
                    <div className="flex gap-2 pt-1">
                      {c.posters.slice(0, 4).map((p, idx) => (
                        <img
                          key={p || idx}
                          src={p}
                          alt=""
                          loading="lazy"
                          className="h-12 w-8 rounded-md object-cover ring-1 ring-border/40 shadow-sm"
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          3. POSTER CLUSTERS & THEMATIC MOVEMENT WORLDS
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="border-b border-border/40 pb-3">
          <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
            Thematic Movements
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Regional Traditions & Cult Universes
          </h2>
        </div>

        {/* Varied Weights: Poster Clusters and Text-Led Portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posterClusters.map((c) => (
            <Link
              key={c.id}
              to="/collections/$id"
              params={{ id: String(c.id) }}
              className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-surface p-5 transition-all duration-300 hover:border-gold/60 hover:-translate-y-1 hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[0.62rem] uppercase tracking-wider text-gold font-semibold">
                      {c.count} Chapter Arc
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-foreground group-hover:text-gold transition">
                      {c.name}
                    </h3>
                  </div>
                  <Film className="size-4 text-gold shrink-0 mt-1" />
                </div>
                <p className="mt-2 font-serif text-xs text-muted-foreground line-clamp-2">
                  {c.overview || "Curated film continuum preserved frame by frame."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/40">
                <div className="grid grid-cols-4 gap-2">
                  {c.posters.slice(0, 4).map((p, idx) => (
                    <div
                      key={p || idx}
                      className="aspect-[2/3] overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border/40"
                    >
                      <img src={p} alt="" loading="lazy" className="size-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {/* Text-Led Cinema Worlds */}
          {textLedWorlds.map((w) => {
            const worldSearch =
              w.slug === "malayalam-new-wave"
                ? { world: "mollywood" }
                : w.slug === "tamil-cinema-continuum"
                ? { world: "kollywood" }
                : w.slug === "korean-baroque-thrillers"
                ? { world: "korean", genre: 53 }
                : w.slug === "90s-indie-revolution"
                ? { decade: "1990", sort: "deep_cuts" }
                : w.slug === "japanese-golden-age"
                ? { world: "japanese", decade: "1950" }
                : {};

            return (
              <Link
                key={w.slug}
                to="/discover"
                search={worldSearch}
                className="group flex flex-col justify-between rounded-2xl border border-gold/40 bg-gold/5 p-6 transition-all duration-300 hover:border-gold hover:bg-gold/10 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-wider text-gold font-semibold">
                    <span>{w.era}</span>
                    <span>Stream Archive →</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    {w.title}
                  </h3>
                  <p className="font-serif text-xs leading-relaxed text-foreground/85 italic">
                    "{w.subtitle}"
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-gold/20 flex items-center justify-between font-mono text-xs text-gold font-medium">
                  <span>Enter Tradition</span>
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. COMMUNITY CURATIONS: Ranked Member Themes
         ───────────────────────────────────────────────────────────── */}
      {community.length ? (
        <section className="space-y-6 pt-4 border-t border-border/40">
          <div className="border-b border-border/40 pb-3 flex items-baseline justify-between">
            <div>
              <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                Member & Critic Programmes
              </div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                Thematic Film Programs
              </h2>
            </div>
            <Link
              to="/discover"
              className="font-mono text-xs text-muted-foreground hover:text-gold transition flex items-center gap-1"
            >
              <span>Explore all in Discover</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {community.map((l) => (
              <Link
                key={l.slug}
                to="/discover"
                search={{ genre: l.genre, sort: "vote_average.desc" }}
                className="group rounded-2xl border border-border/70 bg-surface p-5 transition-all hover:border-gold/60 hover:shadow-md"
              >
                <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider font-semibold">
                  {l.count.toLocaleString()} Films Ranked
                </div>
                <h3 className="mt-1 font-display text-base font-bold text-foreground group-hover:text-gold transition">
                  {l.title}
                </h3>
                <div className="mt-4 flex gap-2">
                  {l.posters.map((p, idx) => (
                    <img
                      key={p || idx}
                      src={p}
                      alt=""
                      loading="lazy"
                      className="h-16 w-11 rounded-lg object-cover ring-1 ring-border/40 shadow-sm"
                    />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
