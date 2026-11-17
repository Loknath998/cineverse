import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useMemo } from "react";
import {
  Calendar,
  Clock,
  Film,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { SectionHeader } from "../components/site/media";
import { useLibrary } from "../lib/library";
import { useLibraryFilms } from "../components/site/library-list";

export const Route = createRoute({
  path: "/library/stats",
  component: StatsPage,
});

function StatsPage() {
  const { ready, watched, watchlist, favorites, ratings, diary } = useLibrary();
  const { films: watchedFilms } = useLibraryFilms("watched");

  // 1. Runtime calculation
  const totalRuntimeMinutes = useMemo(() => {
    return watchedFilms.reduce((sum, f) => sum + (f.runtime || 105), 0);
  }, [watchedFilms]);

  const runtimeDisplay = useMemo(() => {
    const hours = Math.floor(totalRuntimeMinutes / 60);
    const days = (hours / 24).toFixed(1);
    return { hours, days };
  }, [totalRuntimeMinutes]);

  // 2. Average rating
  const ratingValues = useMemo(() => Object.values(ratings), [ratings]);
  const avgRating = useMemo(() => {
    if (!ratingValues.length) return "—";
    return (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1);
  }, [ratingValues]);

  // 3. Rating Distribution (1 to 10)
  const ratingData = useMemo(() => {
    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 };
    for (const r of ratingValues) {
      const rounded = Math.min(10, Math.max(1, Math.round(r)));
      dist[rounded] = (dist[rounded] || 0) + 1;
    }
    return Object.entries(dist).map(([star, count]) => ({
      score: `★${star}`,
      count,
    }));
  }, [ratingValues]);

  // 4. Decade Distribution
  const decadeData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of watched) {
      if (!f.year || f.year === "—") continue;
      const dec = `${f.year.slice(0, 3)}0s`;
      counts.set(dec, (counts.get(dec) || 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([decade, count]) => ({ decade, count }));
  }, [watched]);

  // 5. Genre Breakdown
  const genreData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of watchedFilms) {
      for (const g of f.genres || []) {
        counts.set(g, (counts.get(g) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [watchedFilms]);

  // 6. Top Directors
  const topDirectors = useMemo(() => {
    const counts = new Map<string, number>();
    for (const f of watchedFilms) {
      if (f.director && f.director !== "Unknown" && f.director !== "—") {
        counts.set(f.director, (counts.get(f.director) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [watchedFilms]);

  // 7. CineTaste Personality Engine
  const personality = useMemo(() => {
    if (watched.length < 3) {
      return {
        title: "The Emerging Cinephile",
        tagline: "Your cinema journey is beginning.",
        description:
          "Log more films to reveal your dominant cinematic eras, preferred auteur patterns, and viewing habits.",
      };
    }

    const pre80s = watched.filter((f) => f.year && parseInt(f.year) < 1980).length;
    const classicRatio = pre80s / watched.length;
    const avgNum = parseFloat(avgRating) || 7.0;

    if (classicRatio > 0.45) {
      return {
        title: "The Archive Preservationist",
        tagline: "Devoted to the classic canon and film history.",
        description:
          `Over ${Math.round(classicRatio * 100)}% of your library comes from pre-1980 cinema. You value historical weight, celluloid texture, and the foundational masters.`,
      };
    }

    if (topDirectors.length && topDirectors[0][1] >= 3) {
      return {
        title: "The Auteur Devotee",
        tagline: "Cinema explored through the eyes of visionary directors.",
        description:
          `You gravitate toward complete filmographies, with frequent returns to ${topDirectors[0][0]} and signature masterworks.`,
      };
    }

    if (avgNum >= 8.5) {
      return {
        title: "The Discerning Connoisseur",
        tagline: "High standards, deeply treasured masterworks.",
        description:
          `With an average rating of ★${avgRating}, you reserve your highest praise for cinema that truly transcends.`,
      };
    }

    return {
      title: "The Eclectic Film Explorer",
      tagline: "Curious across styles, eras, and borders.",
      description:
        "Your viewing spans multiple decades and genres, seeking out fresh narratives across global cinema.",
    };
  }, [watched, avgRating, topDirectors]);

  if (!ready) return <div className="label-mono">Loading CineStats…</div>;

  return (
    <div className="space-y-12">
      {/* Editorial Overview Header */}
      <div>
        <h2 className="section-title">Personal CineStats</h2>
        <p className="mt-1 font-sans text-xs text-muted-foreground">
          Analytics calculated in real time from your actual logged films and ratings
        </p>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <div className="label-mono flex items-center gap-1">
            <Film className="size-3 text-gold" />
            <span>Films Logged</span>
          </div>
          <div className="mt-2 font-display text-3xl text-foreground font-semibold">
            {watched.length}
          </div>
          <div className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
            {diary.length} diary entries
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <div className="label-mono flex items-center gap-1">
            <Clock className="size-3 text-gold" />
            <span>Screen Time</span>
          </div>
          <div className="mt-2 font-display text-3xl text-foreground font-semibold">
            {runtimeDisplay.hours}h
          </div>
          <div className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
            ≈ {runtimeDisplay.days} days of cinema
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <div className="label-mono flex items-center gap-1">
            <Star className="size-3 text-gold" />
            <span>Average Rating</span>
          </div>
          <div className="mt-2 font-display text-3xl text-gold font-semibold">
            ★ {avgRating}
          </div>
          <div className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
            {ratingValues.length} rated titles
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4">
          <div className="label-mono flex items-center gap-1">
            <Heart className="size-3 text-gold" />
            <span>Favourites</span>
          </div>
          <div className="mt-2 font-display text-3xl text-foreground font-semibold">
            {favorites.length}
          </div>
          <div className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
            hall of fame
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-surface p-4 col-span-2 sm:col-span-1">
          <div className="label-mono flex items-center gap-1">
            <Calendar className="size-3 text-gold" />
            <span>Watchlist</span>
          </div>
          <div className="mt-2 font-display text-3xl text-foreground font-semibold">
            {watchlist.length}
          </div>
          <div className="mt-1 font-mono text-[0.6rem] text-muted-foreground">
            queued up next
          </div>
        </div>
      </div>

      {/* CineTaste & Film Personality Spotlight */}
      <section className="rounded-2xl border border-gold/40 bg-gold/5 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="label-gold flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              <span>CineVerse Film Personality</span>
            </div>
            <h3 className="mt-1 font-display text-2xl sm:text-3xl text-foreground font-semibold">
              {personality.title}
            </h3>
            <p className="mt-1 font-display italic text-gold-soft text-sm sm:text-base">
              “{personality.tagline}”
            </p>
            <p className="mt-3 max-w-2xl font-sans text-xs sm:text-sm leading-relaxed text-muted-foreground">
              {personality.description}
            </p>
          </div>

          <Link
            to="/discover"
            search={{ sort: "deep_cuts" }}
            className="self-start sm:self-center shrink-0 rounded-full bg-gold px-5 py-2.5 font-sans text-xs font-medium text-background hover:bg-gold-soft transition shadow-sm"
          >
            Explore tailored deep cuts →
          </Link>
        </div>
      </section>

      {/* Visual Analytics Grid: Decades & Ratings Histogram */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Rating Distribution Histogram */}
        <section className="rounded-2xl border border-border/60 bg-surface p-6">
          <SectionHeader
            title="Rating Distribution"
            subtitle="Frequency of your personal star ratings"
          />
          {ratingValues.length ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData}>
                  <XAxis dataKey="score" stroke="currentColor" className="text-[0.65rem] text-muted-foreground" />
                  <YAxis allowDecimals={false} stroke="currentColor" className="text-[0.65rem] text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Bar dataKey="count" fill="oklch(var(--gold))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="font-sans text-xs text-muted-foreground py-10 text-center">
              Rate a few films to see your rating curve.
            </p>
          )}
        </section>

        {/* Decade Distribution Bar Chart */}
        <section className="rounded-2xl border border-border/60 bg-surface p-6">
          <SectionHeader
            title="Eras Explored"
            subtitle="Distribution of logged films across decades"
          />
          {decadeData.length ? (
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={decadeData}>
                  <XAxis dataKey="decade" stroke="currentColor" className="text-[0.65rem] text-muted-foreground" />
                  <YAxis allowDecimals={false} stroke="currentColor" className="text-[0.65rem] text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "0.75rem",
                    }}
                  />
                  <Bar dataKey="count" fill="oklch(var(--gold-soft))" radius={[4, 4, 0, 0]}>
                    {decadeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "oklch(var(--gold))" : "oklch(var(--gold-soft))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="font-sans text-xs text-muted-foreground py-10 text-center">
              Log films to map your chronological journey.
            </p>
          )}
        </section>
      </div>

      {/* Genres & Directors Section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Dominant Genres */}
        <section className="rounded-2xl border border-border/60 bg-surface p-6">
          <SectionHeader
            title="Preferred Genres"
            subtitle="The narrative wavelengths you return to most often"
          />
          {genreData.length ? (
            <ul className="divide-y divide-border/40">
              {genreData.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between py-3">
                  <div className="font-display text-sm text-foreground">{name}</div>
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-muted-foreground">{count} logged</span>
                    <Link
                      to="/discover"
                      className="text-gold hover:underline text-[0.62rem]"
                    >
                      Explore →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-xs text-muted-foreground py-8 text-center">
              Genre patterns will emerge as you add films.
            </p>
          )}
        </section>

        {/* Most-Watched Directors */}
        <section className="rounded-2xl border border-border/60 bg-surface p-6">
          <SectionHeader
            title="Most-Watched Auteurs"
            subtitle="Filmmakers whose work anchors your library"
          />
          {topDirectors.length ? (
            <ul className="divide-y divide-border/40">
              {topDirectors.map(([name, count]) => (
                <li key={name} className="flex items-center justify-between py-3">
                  <div className="font-display text-sm text-foreground font-medium">{name}</div>
                  <div className="font-mono text-xs text-gold">
                    {count} {count === 1 ? "film" : "films"} watched
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-sans text-xs text-muted-foreground py-8 text-center">
              Auteur affinities will appear once multiple films are logged.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
