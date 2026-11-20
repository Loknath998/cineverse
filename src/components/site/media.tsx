import { Link } from "../../lib/router";
import { ChevronRight, Film, Star } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

import type { MovieCard } from "../../lib/tmdb-map";

export function Score({ value, className = "" }: { value: number; className?: string }) {
  return (
    <span className={`font-mono text-[0.7rem] text-gold ${className}`}>
      {value ? value.toFixed(1) : "—"}
    </span>
  );
}

export function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string | undefined;
  action?: ReactNode | undefined;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? (
          <p className="mt-1 font-sans text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PosterPlaceholder({
  title,
  year,
  genre,
  className = "",
}: {
  title: string;
  year?: string;
  genre?: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex size-full flex-col justify-between overflow-hidden bg-gradient-to-br from-stone-900 via-stone-950 to-neutral-900 p-4 text-center ring-1 ring-gold/40 border border-gold/25 select-none shadow-xl ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/20 via-transparent to-transparent opacity-80" />
      <div className="relative z-10 flex items-center justify-between text-[0.62rem] font-mono uppercase tracking-widest text-gold font-semibold">
        <span>CINEVERSE</span>
        <span>{year || "ARCHIVE"}</span>
      </div>
      <div className="relative z-10 my-auto flex flex-col items-center justify-center gap-2.5 py-3">
        <div className="grid size-10 place-items-center rounded-full bg-gold/10 border border-gold/30 shadow-sm">
          <Film className="size-5 text-gold stroke-[1.75]" />
        </div>
        <span className="font-display text-sm font-bold leading-snug text-foreground/95 drop-shadow line-clamp-3">
          {title}
        </span>
      </div>
      <div className="relative z-10 border-t border-gold/20 pt-2 text-[0.62rem] font-mono text-gold-soft uppercase tracking-wider truncate font-medium">
        {genre || "Feature Film"}
      </div>
    </div>
  );
}

export function PosterCard({
  movie,
  width = "w-52 sm:w-56 md:w-60 lg:w-[228px]",
}: {
  movie: MovieCard;
  width?: string;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [movie.poster, movie.id]);

  // Ensure proper TMDB w500 base URL
  let posterUrl: string | null = null;
  if (!imgError && movie.poster && movie.poster.trim() !== "") {
    if (movie.poster.startsWith("http://") || movie.poster.startsWith("https://")) {
      posterUrl = movie.poster.replace(/\/w\d+\//, "/w500/");
    } else {
      const clean = movie.poster.startsWith("/") ? movie.poster : `/${movie.poster}`;
      posterUrl = `https://image.tmdb.org/t/p/w500${clean}`;
    }
  }

  return (
    <Link
      to="/movie/$id"
      params={{ id: String(movie.id) }}
      className={`group block shrink-0 ${width} focus:outline-none`}
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/50 shadow-lg shadow-black/20 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-[1.02] group-hover:ring-gold/70 group-hover:shadow-2xl group-hover:shadow-black/50">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={() => setImgError(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <PosterPlaceholder
            title={movie.title}
            year={movie.year}
            genre={movie.genres?.[0] ?? movie.director}
          />
        )}
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10"
          data-overlay-bg="true"
        >
          <div
            data-overlay-text="true"
            className="font-display text-[0.88rem] font-bold leading-tight text-white line-clamp-2 drop-shadow"
          >
            {movie.title}
          </div>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 font-mono text-[0.65rem] tracking-wider text-muted-foreground">
        <span className="font-semibold text-foreground/85">{movie.year}</span>
        <span className="opacity-40">·</span>
        <span className="truncate">{movie.director ?? movie.genres?.[0] ?? "Film"}</span>
        <Score value={movie.rating} className="ml-auto" />
      </div>
    </Link>
  );
}

export function PosterRail({
  title,
  subtitle,
  items,
  seeAll,
}: {
  title: string;
  subtitle?: string;
  items: MovieCard[];
  seeAll?: { to: string; search?: Record<string, unknown> };
}) {
  if (!items.length) return null;
  return (
    <section className="mb-14 sm:mb-16">
      <SectionHeader
        title={title}
        subtitle={subtitle}
        action={
          seeAll ? (
            <Link
              to={seeAll.to as never}
              search={seeAll.search as never}
              className="label-gold flex items-center gap-1 font-mono text-xs uppercase tracking-wider hover:text-gold"
            >
              See all <ChevronRight className="size-3" />
            </Link>
          ) : null
        }
      />
      <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 hide-scrollbar">
        {items.map((m) => (
          <PosterCard key={m.id} movie={m} />
        ))}
      </div>
    </section>
  );
}

export function PosterGrid({ items }: { items: MovieCard[] }) {
  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((m) => (
        <PosterCard key={m.id} movie={m} width="w-full" />
      ))}
    </div>
  );
}

export function StarRating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1 font-mono text-[0.65rem] text-gold">
      <Star className="size-3 fill-gold text-gold" />
      {value.toFixed(1)}
    </span>
  );
}
