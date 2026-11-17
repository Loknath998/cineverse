import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Search } from "lucide-react";

import { getFilmmakers } from "../lib/tmdb.api";
import type { AuteurCard } from "../lib/tmdb.api";
import { useLibrary } from "../lib/library";

export const Route = createRoute({
  path: "/filmmakers",
  loader: () => getFilmmakers(),
  head: () => ({
    meta: [
      { title: "The Cinema Atlas — International & Indian Filmmakers — CineVerse" },
      {
        name: "description",
        content:
          "Explore filmmakers through their cinematic traditions: International Cinema (Hollywood, Europe, Japan, Korea) and Indian Cinema (Kollywood, Mollywood, Tollywood, Bollywood).",
      },
      { property: "og:title", content: "The Cinema Atlas — International & Indian Filmmakers — CineVerse" },
    ],
  }),
  component: FilmmakersPage,
});

// Structural grouping definitions
const INTERNATIONAL_WORLDS = [
  {
    key: "Hollywood",
    title: "Hollywood & American Auteurs",
    native: "American Cinema",
    worldSlug: "hollywood",
    description: "From classical studio suspense and New Hollywood paranoia to contemporary visionary world-builders.",
  },
  {
    key: "European Cinema",
    title: "European Pan-Cinema",
    native: "Continental Auteur Modernism",
    worldSlug: "european",
    description: "Existential chamber drama, French New Wave jump cuts, Italian memory carnivals, and poetic sculpting in time.",
  },
  {
    key: "Japanese Cinema",
    title: "Japanese Cinema",
    native: "Nihon Eiga · 日本映画",
    worldSlug: "japanese",
    description: "Weather-beaten humanist epics, tatami domestic stillness, and Studio Ghibli's hand-painted ecological grace.",
  },
  {
    key: "Korean Cinema",
    title: "Korean Cinema",
    native: "Chungmuro · 한국 영화",
    worldSlug: "korean",
    description: "Ferocious social allegories, baroque vengeance, and procedural tension redefining modern film grammar.",
  },
  {
    key: "Asian & World Cinema",
    title: "Asian & World Traditions",
    native: "Sinophone, Iranian & Latin",
    worldSlug: "chinese-hk",
    description: "Neon-lit Hong Kong melancholy, poetic Iranian humanism, and Taiwanese generational observation.",
  },
  {
    key: "Genre & Cult",
    title: "Genre & Cult Visionaries",
    native: "Subversive Masterminds",
    worldSlug: "horror",
    description: "Radical filmmakers who dismantle genre machinery through surrealism, body horror, and atmospheric dread.",
  },
];

const INDIAN_WORLDS = [
  {
    key: "Kollywood (Tamil)",
    title: "Kollywood",
    native: "Tamil Cinema · தமிழ் சினிமா",
    worldSlug: "kollywood",
    description: "Sensory modernism, chiaroscuro lighting, kinetic hyper-action universes, and raw subaltern realism.",
  },
  {
    key: "Mollywood (Malayalam)",
    title: "Mollywood",
    native: "Malayalam Cinema · മലയാള സിനിമ",
    worldSlug: "mollywood",
    description: "The global masterclass in understated social realism, moral ambiguity, and organic performance.",
  },
  {
    key: "Tollywood & South",
    title: "Telugu & Kannada Cinema",
    native: "Tollywood & Sandalwood · తెలుగు & ಕನ್ನಡ",
    worldSlug: "tollywood",
    description: "Mythic visual scale, mass heroic storytelling, folklore animism, and breathtaking kinetic spectacle.",
  },
  {
    key: "Bollywood (Hindi)",
    title: "Bollywood",
    native: "Hindi Cinema · हिन्दी सिनेमा",
    worldSlug: "bollywood",
    description: "From Golden Age socialist poetry and Shakespearean gangland sagas to grand visual rhapsodies.",
  },
  {
    key: "Bengali & Marathi Cinema",
    title: "Bengali & Marathi Traditions",
    native: "Indian Regional Masters · বাংলা & मराठी",
    worldSlug: "bengali-marathi",
    description: "Satyajit Ray's humanist universalism, partition grief, and the fierce modern Marathi indie renaissance.",
  },
];

function FilmmakersPage() {
  const data = Route.useLoaderData() as Awaited<ReturnType<typeof getFilmmakers>>;
  const { watched } = useLibrary();
  const [q, setQ] = useState("");
  const [activeBranch, setActiveBranch] = useState<"all" | "international" | "indian">("all");

  const watchedIds = useMemo(() => new Set(watched.map((w) => w.id)), [watched]);

  // Group filmmakers by category
  const auteursByCategory = useMemo(() => {
    const map = new Map<string, AuteurCard[]>();
    for (const auteur of data.all) {
      const list = map.get(auteur.category) || [];
      list.push(auteur);
      map.set(auteur.category, list);
    }
    return map;
  }, [data.all]);

  const searchResults = useMemo(() => {
    if (!q.trim()) return null;
    const query = q.toLowerCase();
    return data.all.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.movement.toLowerCase().includes(query) ||
        a.category.toLowerCase().includes(query),
    );
  }, [data.all, q]);

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-8 sm:py-12 space-y-16">
      {/* ─────────────────────────────────────────────────────────────
          1. EDITORIAL MASTHEAD & HIERARCHICAL NAVIGATION
          World Cinema → International Cinema → Indian Cinema
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="font-mono text-xs text-gold uppercase tracking-[0.25em] font-semibold">
            THE CINEMA ATLAS
          </div>
          <h1 className="font-display text-4xl sm:text-6xl text-foreground font-bold tracking-tight">
            FILMMAKERS
          </h1>
          <p className="font-display text-xl sm:text-2xl text-gold-soft italic">
            Discovered through the worlds they built.
          </p>
          <p className="font-serif text-xs sm:text-sm leading-relaxed text-muted-foreground pt-1">
            Filmmakers are not isolated cards in a database. They belong to regional traditions, political eras, and aesthetic movements. Explore over 55+ masters across World and Indian Cinema.
          </p>
        </div>

        {/* Search Bar & Branch Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-y border-border/50 py-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground mr-1">
              Tradition:
            </span>
            <button
              onClick={() => setActiveBranch("all")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${
                activeBranch === "all"
                  ? "bg-gold text-background font-semibold shadow-sm"
                  : "border border-border/70 bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              ALL CINEMA
            </button>
            <button
              onClick={() => setActiveBranch("international")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${
                activeBranch === "international"
                  ? "bg-gold text-background font-semibold shadow-sm"
                  : "border border-border/70 bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              INTERNATIONAL CINEMA
            </button>
            <button
              onClick={() => setActiveBranch("indian")}
              className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${
                activeBranch === "indian"
                  ? "bg-gold text-background font-semibold shadow-sm"
                  : "border border-border/70 bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              INDIAN CINEMA
            </button>
          </div>

          <div className="relative min-w-[260px]">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search filmmaker or movement..."
              className="w-full rounded-full border border-border/70 bg-surface py-2 pl-9 pr-4 font-sans text-xs text-foreground placeholder:text-muted-foreground focus:border-gold/70 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH RESULTS VIEW (When query active)
         ───────────────────────────────────────────────────────────── */}
      {searchResults ? (
        <section className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
            <h2 className="font-display text-2xl text-foreground font-bold">
              Search Results ({searchResults.length})
            </h2>
            <button
              onClick={() => setQ("")}
              className="font-mono text-xs text-gold hover:underline"
            >
              Clear search
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((a) => (
              <FilmmakerClusterCard key={a.id} auteur={a} watchedIds={watchedIds} />
            ))}
          </div>
        </section>
      ) : (
        <div className="space-y-24">
          {/* ─────────────────────────────────────────────────────────────
              3. BRANCH I: INTERNATIONAL CINEMA
              Broad world-cinema layer: Hollywood, Europe, Japan, Korea, etc.
             ───────────────────────────────────────────────────────────── */}
          {(activeBranch === "all" || activeBranch === "international") && (
            <section className="space-y-16">
              <div className="border-b-2 border-gold/40 pb-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold font-bold">
                  PART I · THE GLOBAL CANON
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold tracking-tight mt-1">
                  International Cinema
                </h2>
                <p className="font-serif text-sm italic text-muted-foreground max-w-3xl mt-2">
                  Continental lineages, formal breakthroughs, and visionary blockbusters that redefined cinematic expression across the Americas, Europe, and East Asia.
                </p>
              </div>

              {/* Loop through International Traditions */}
              {INTERNATIONAL_WORLDS.map((world, idx) => {
                const auteurs = auteursByCategory.get(world.key) || [];
                if (!auteurs.length) return null;
                const featuredAuteur = auteurs[0];
                const restAuteurs = auteurs.slice(1);

                return (
                  <div key={world.key} className="space-y-8">
                    {/* World Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                          <span>{world.native}</span>
                          <span className="opacity-40">·</span>
                          <span>{auteurs.length} Auteurs</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-4xl text-foreground font-bold mt-0.5">
                          {world.title}
                        </h3>
                        <p className="font-serif text-xs italic text-muted-foreground mt-1 max-w-2xl">
                          "{world.description}"
                        </p>
                      </div>

                      <Link
                        to="/discover"
                        search={{ world: world.worldSlug }}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-gold hover:underline whitespace-nowrap"
                      >
                        <span>Explore full TMDB catalogue →</span>
                      </Link>
                    </div>

                    {/* Asymmetric Composition: Featured Master Showcase + Editorial Roster */}
                    <div className="space-y-8">
                      {/* Featured Master of this tradition */}
                      <FeaturedAuteurShowcase auteur={featuredAuteur} watchedIds={watchedIds} />

                      {/* Editorial Cluster Cards for the rest of the tradition */}
                      {restAuteurs.length ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                          {restAuteurs.map((a) => (
                            <FilmmakerClusterCard key={a.id} auteur={a} watchedIds={watchedIds} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* ─────────────────────────────────────────────────────────────
              4. BRANCH II: INDIAN CINEMA
              Subcontinental mastery: Kollywood, Mollywood, Tollywood, Bollywood, Regional
             ───────────────────────────────────────────────────────────── */}
          {(activeBranch === "all" || activeBranch === "indian") && (
            <section className="space-y-16 pt-8 border-t border-border/40">
              <div className="border-b-2 border-gold/40 pb-4">
                <span className="font-mono text-xs uppercase tracking-[0.3em] text-gold font-bold">
                  PART II · THE LIVING ARCHIPELAGO
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-foreground font-bold tracking-tight mt-1">
                  Indian Cinema
                </h2>
                <p className="font-serif text-sm italic text-muted-foreground max-w-3xl mt-2">
                  Not a single monolith. An exhilarating continuum of distinct linguistic cultures, mythic visual scales, social realisms, and hyper-kinetic genre subversions.
                </p>
              </div>

              {/* Loop through Indian Cinema Traditions */}
              {INDIAN_WORLDS.map((world) => {
                const auteurs = auteursByCategory.get(world.key) || [];
                if (!auteurs.length) return null;
                const featuredAuteur = auteurs[0];
                const restAuteurs = auteurs.slice(1);

                return (
                  <div key={world.key} className="space-y-8">
                    {/* World Header */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                          <span>{world.native}</span>
                          <span className="opacity-40">·</span>
                          <span>{auteurs.length} Auteurs</span>
                        </div>
                        <h3 className="font-display text-2xl sm:text-4xl text-foreground font-bold mt-0.5">
                          {world.title}
                        </h3>
                        <p className="font-serif text-xs italic text-muted-foreground mt-1 max-w-2xl">
                          "{world.description}"
                        </p>
                      </div>

                      <Link
                        to="/discover"
                        search={{ world: world.worldSlug }}
                        className="inline-flex items-center gap-1.5 font-mono text-xs text-gold hover:underline whitespace-nowrap"
                      >
                        <span>Explore full TMDB catalogue →</span>
                      </Link>
                    </div>

                    {/* Asymmetric Composition */}
                    <div className="space-y-8">
                      {/* Featured Master */}
                      <FeaturedAuteurShowcase auteur={featuredAuteur} watchedIds={watchedIds} />

                      {/* Editorial Cluster Cards */}
                      {restAuteurs.length ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-2">
                          {restAuteurs.map((a) => (
                            <FilmmakerClusterCard key={a.id} auteur={a} watchedIds={watchedIds} />
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FEATURED AUTEUR SHOWCASE (Large Visual Weight, Not a Tiny Card)
// ─────────────────────────────────────────────────────────────
function FeaturedAuteurShowcase({
  auteur,
  watchedIds,
}: {
  auteur: AuteurCard;
  watchedIds: Set<number>;
}) {
  const userLoggedCount = auteur.knownFor.filter((f) => watchedIds.has(f.id)).length;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-surface p-6 sm:p-10 shadow-xl transition-all duration-300 hover:border-gold/50">
      <div className="grid gap-8 lg:grid-cols-12 items-center">
        {/* Left: Portrait, Manifesto & Bio */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-gold uppercase tracking-wider font-semibold">
              Tradition Anchor · {auteur.era}
            </span>
            {userLoggedCount > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-[0.62rem] text-gold ring-1 ring-gold/30">
                <Check className="size-2.5" />
                {userLoggedCount} logged in journal
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {auteur.profile ? (
              <div className="size-20 sm:size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/50 shadow-md">
                <img src={auteur.profile} alt={auteur.name} className="size-full object-cover" />
              </div>
            ) : null}
            <div>
              <h4 className="font-display text-3xl sm:text-4xl font-bold text-foreground leading-[1]">
                {auteur.name}
              </h4>
              <p className="font-mono text-xs text-gold font-medium mt-1">
                {auteur.movement}
              </p>
            </div>
          </div>

          <p className="font-serif text-sm leading-relaxed text-foreground/85 italic max-w-md">
            {auteur.biography
              ? auteur.biography.slice(0, 220) + "..."
              : `Explore the distinct aesthetic grammar and complete career filmography of ${auteur.name}.`}
          </p>

          <div>
            <Link
              to="/person/$id"
              params={{ id: String(auteur.id) }}
              className="inline-flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-wider font-semibold hover:underline"
            >
              <span>Enter filmmaker's world</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Signature Masterpiece Posters */}
        <div className="lg:col-span-7">
          <div className="space-y-2">
            <span className="font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
              Signature Works
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {auteur.knownFor.slice(0, 4).map((film) => (
                <Link
                  key={film.id}
                  to="/movie/$id"
                  params={{ id: String(film.id) }}
                  className="group flex flex-col gap-1.5"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 transition duration-300 group-hover:ring-gold/60 group-hover:scale-105 group-hover:shadow-md">
                    {film.poster ? (
                      <img
                        src={film.poster}
                        alt={film.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="grid size-full place-items-center p-2 text-center text-[0.65rem] text-muted-foreground">
                        {film.title}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-xs text-foreground group-hover:text-gold font-medium truncate">
                      {film.title}
                    </div>
                    <div className="font-mono text-[0.62rem] text-muted-foreground">
                      {film.year} · ★ {film.rating.toFixed(1)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPACT CLUSTER CARD FOR OTHER FILMMAKERS IN THE TRADITION
// ─────────────────────────────────────────────────────────────
function FilmmakerClusterCard({
  auteur,
  watchedIds,
}: {
  auteur: AuteurCard;
  watchedIds: Set<number>;
}) {
  const userLoggedCount = auteur.knownFor.filter((f) => watchedIds.has(f.id)).length;

  return (
    <div className="group flex flex-col justify-between rounded-2xl border border-border/60 bg-surface/70 p-5 transition-all duration-300 hover:border-gold/60 hover:bg-surface hover:-translate-y-1 hover:shadow-lg">
      <div className="space-y-3">
        <div className="flex items-start gap-3.5">
          {auteur.profile ? (
            <div className="size-14 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 shadow-sm">
              <img src={auteur.profile} alt={auteur.name} className="size-full object-cover" />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <span className="font-mono text-[0.62rem] text-muted-foreground">
                {auteur.era}
              </span>
              {userLoggedCount > 0 ? (
                <span className="font-mono text-[0.6rem] text-gold font-medium">
                  {userLoggedCount} logged
                </span>
              ) : null}
            </div>
            <Link
              to="/person/$id"
              params={{ id: String(auteur.id) }}
              className="font-display text-lg font-bold text-foreground group-hover:text-gold transition truncate block"
            >
              {auteur.name}
            </Link>
            <p className="font-mono text-[0.65rem] text-gold/90 line-clamp-1">
              {auteur.movement}
            </p>
          </div>
        </div>

        {/* 3 Signature Posters */}
        {auteur.knownFor.length ? (
          <div className="grid grid-cols-3 gap-2 pt-1">
            {auteur.knownFor.slice(0, 3).map((film) => (
              <Link
                key={film.id}
                to="/movie/$id"
                params={{ id: String(film.id) }}
                className="group/poster block"
              >
                <div className="aspect-[2/3] overflow-hidden rounded-lg bg-surface-2 ring-1 ring-border/30 group-hover/poster:ring-gold/60 transition">
                  {film.poster ? (
                    <img src={film.poster} alt="" loading="lazy" className="size-full object-cover" />
                  ) : null}
                </div>
                <div className="mt-1 font-mono text-[0.58rem] text-muted-foreground truncate">
                  {film.year}
                </div>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between font-mono text-[0.65rem] text-gold font-medium">
        <Link
          to="/person/$id"
          params={{ id: String(auteur.id) }}
          className="hover:underline flex items-center gap-1"
        >
          <span>View Oeuvre</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
