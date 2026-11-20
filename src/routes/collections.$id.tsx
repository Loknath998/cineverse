import { createRoute } from "../lib/route";
import { Link } from "../lib/router";

import { MovieActions } from "../components/site/movie-actions";
import { SectionHeader, PosterPlaceholder } from "../components/site/media";
import { getCollection } from "../lib/tmdb.api";
import { fmtRuntime } from "../lib/tmdb-map";
import type { MovieCard } from "../lib/tmdb-map";
import { CURATED_ARCHIVES } from "./collections.index";

export const Route = createRoute({
  path: "/collections/$id",
  loader: async ({ params }): Promise<any> => {
    const rawId = params.id;
    const numId = Number(rawId);

    // 1. Check curated archives first (matches slugs or predefined collections)
    const curated = CURATED_ARCHIVES.find((a) => String(a.id) === String(rawId));
    if (curated && curated.films && curated.films.length > 0) {
      return {
        id: typeof curated.id === "number" ? curated.id : 999999,
        name: curated.name,
        overview: curated.overview,
        backdrop: curated.backdrop,
        poster: curated.poster,
        parts: curated.films,
        runtime: curated.films.reduce((s, f) => s + (f.runtime ?? 120), 0),
        average:
          Math.round(
            (curated.films.reduce((s, f) => s + (f.rating ?? 8.0), 0) / curated.films.length) * 10,
          ) / 10,
      };
    }

    // 2. If it's a numeric ID, fetch live collection from TMDB
    if (!isNaN(numId) && numId > 0) {
      try {
        const tmdbData = await getCollection({ data: { id: numId } });
        if (tmdbData && tmdbData.parts) return tmdbData;
      } catch (err) {
        console.warn("[CineVerse] TMDB collection fetch failed, checking fallback:", err);
      }
    }

    // 3. Fallback to curated metadata
    if (curated) {
      return {
        id: typeof curated.id === "number" ? curated.id : 999999,
        name: curated.name,
        overview: curated.overview,
        backdrop: curated.backdrop,
        poster: curated.poster,
        parts: curated.films || [],
        runtime: 0,
        average: 8.5,
      };
    }

    return null;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Collection unavailable — CineVerse" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.name} — CineVerse Collections`;
    const description =
      loaderData.overview?.slice(0, 155) ||
      `All ${loaderData.parts?.length ?? 0} films in ${loaderData.name}, in release order.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        ...(loaderData.backdrop
          ? [
              { property: "og:image", content: loaderData.backdrop },
              { name: "twitter:image", content: loaderData.backdrop },
            ]
          : []),
      ],
    };
  },
  component: CollectionDetail,
});

function CollectionDetail() {
  const c = Route.useLoaderData() as Awaited<ReturnType<typeof getCollection>> | null;

  if (!c) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Archive Unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">The requested film collection could not be loaded.</p>
        <div className="mt-6">
          <Link to="/collections" className="label-gold hover:text-gold">← Return to All Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        {c.backdrop ? (
          <img
            src={c.backdrop}
            alt=""
            className="absolute inset-0 z-0 size-full object-cover object-top opacity-30 dark:opacity-35"
          />
        ) : null}
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-background/95 via-background/68 to-background/20" />
        <div className="relative z-10 mx-auto max-w-[1400px] px-4 pt-10 pb-10 sm:px-8 sm:pt-14 sm:pb-12">
          <Link to="/collections" className="label-gold hover:text-gold">
            ← All collections
          </Link>
          <h1 className="mt-4 max-w-2xl font-display text-3xl leading-tight text-foreground sm:text-5xl">
            {c.name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-3 font-mono text-[0.65rem] tracking-wider text-muted-foreground">
            <span>{c.parts.length} films</span>
            <span className="opacity-40">·</span>
            <span>{fmtRuntime(c.runtime)} total</span>
            <span className="opacity-40">·</span>
            <span className="text-gold">{c.average.toFixed(1)} average</span>
          </div>
          {c.overview ? (
            <p className="mt-5 max-w-2xl font-sans text-sm leading-relaxed text-muted-foreground">
              {c.overview}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-[1400px] px-4 pb-10 sm:px-8">
        <SectionHeader title="The saga in order" subtitle="Chronological release order" />
        <ol className="space-y-5">
          {c.parts.map((m: MovieCard, i: number) => (
            <li
              key={m.id}
              className="grid gap-5 rounded-xl border border-border/60 bg-surface p-4 sm:grid-cols-[92px_1fr]"
            >
              <Link
                to="/movie/$id"
                params={{ id: String(m.id) }}
                className="block w-20 overflow-hidden rounded-xl ring-1 ring-border/60 sm:w-full aspect-[2/3] bg-surface-2"
              >
                {m.poster ? (
                  <img
                    src={m.poster}
                    alt={`${m.title} poster`}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                ) : (
                  <PosterPlaceholder title={m.title} year={m.year} genre={m.genres?.[0] ?? m.director} />
                )}
              </Link>
              <div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-[0.6rem] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Link
                    to="/movie/$id"
                    params={{ id: String(m.id) }}
                    className="font-display text-lg text-foreground hover:text-gold"
                  >
                    {m.title}
                  </Link>
                  <span className="font-mono text-[0.6rem] text-muted-foreground">
                    {m.year} · {fmtRuntime(m.runtime)} · {m.rating.toFixed(1)}
                  </span>
                </div>
                <p className="mt-2 max-w-3xl line-clamp-3 font-sans text-xs leading-relaxed text-muted-foreground">
                  {m.overview}
                </p>
                <div className="mt-4">
                  <MovieActions movie={m} />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
