import { getCinemaWorld, CinemaWorldDef } from "./cinema-worlds";
import { defineApi } from "./define-api";
import { z } from "zod";

import { tmdb } from "./tmdb";
import { img, mapMovie, GENRES } from "./tmdb-map";
import type {
  CollectionCard,
  DirectorCareerContext,
  MovieCard,
  MovieDetail,
  PersonCard,
  PersonDetail,
  Rail,
} from "./tmdb-map";

type List<T> = { results: T[]; total_results?: number; total_pages?: number };

function uniqueMovies<T extends { id: number }>(items: T[]): T[] {
  return [...new Map(items.filter(Boolean).map((item) => [item.id, item])).values()];
}

function uniqueMappedMovies(items: any[]): MovieCard[] {
  return uniqueMovies(items.filter((m) => m && m.id)).map(mapMovie);
}

function prioritizeWithPosters(items: any[], limit = 18): MovieCard[] {
  const mapped = (items || []).filter((m) => m && m.id).map(mapMovie);
  const withPosters = mapped.filter((m) => m.poster);
  const withoutPosters = mapped.filter((m) => !m.poster);
  return uniqueMovies([...withPosters, ...withoutPosters]).slice(0, limit);
}

export type CinemaPathway = {
  id: string;
  title: string;
  tagline: string;
  description: string;
  auteurs: { id: number; name: string; movement: string }[];
  films: MovieCard[];
};

export type HomeDecade = {
  decade: string;
  label: string;
  years: string;
};

export const getHome = defineApi({ method: "GET" }).handler(async (): Promise<{
  heroes: MovieDetail[];
  hero: MovieDetail;
  recentReleases: MovieCard[];
  indianSpotlight: MovieCard[];
  featuredAuteur: AuteurCard | null;
  featuredAuteurs: AuteurCard[];
  cinemaPathways: CinemaPathway[];
  deepCut: MovieCard | null;
  deepCuts: MovieCard[];
  decades: HomeDecade[];
  rails: Rail[];
  moods: { id: number; name: string; backdrop: string | null }[];
}> => {
  const [
    trending,
    nowPlaying,
    nowPlayingP2,
    topRated,
    topRatedP2,
    classics,
    classicsP2,
    popular,
    popularP2,
    tamil,
    tamilP2,
  ] = await Promise.all([
    tmdb<List<any>>("/trending/movie/week"),
    tmdb<List<any>>("/movie/now_playing", { page: 1 }),
    tmdb<List<any>>("/movie/now_playing", { page: 2 }).catch(() => ({ results: [] })),
    tmdb<List<any>>("/movie/top_rated", { page: 1 }),
    tmdb<List<any>>("/movie/top_rated", { page: 2 }).catch(() => ({ results: [] })),
    tmdb<List<any>>("/discover/movie", {
      "primary_release_date.lte": "1985-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": 600,
      page: 1,
    }),
    tmdb<List<any>>("/discover/movie", {
      "primary_release_date.lte": "1985-12-31",
      sort_by: "vote_average.desc",
      "vote_count.gte": 300,
      page: 2,
    }).catch(() => ({ results: [] })),
    tmdb<List<any>>("/movie/popular", { page: 1 }),
    tmdb<List<any>>("/movie/popular", { page: 2 }).catch(() => ({ results: [] })),
    tmdb<List<any>>("/discover/movie", {
      with_original_language: "ta",
      sort_by: "popularity.desc",
      "vote_count.gte": 15,
      region: "IN",
      page: 1,
    }),
    tmdb<List<any>>("/discover/movie", {
      with_original_language: "ta",
      sort_by: "vote_average.desc",
      "vote_count.gte": 20,
      region: "IN",
      page: 1,
    }).catch(() => ({ results: [] })),
  ]);

  // 1. Multi-Hero: Dynamic cross-archive rotation from trending, top-rated, classics & Indian landmarks
  const rawTrendingIds = (trending.results || [])
    .filter((m: any) => m && m.backdrop_path && m.poster_path)
    .map((m: any) => m.id);
  const rawTopRatedIds = (topRated.results || [])
    .filter((m: any) => m && m.backdrop_path && m.poster_path)
    .map((m: any) => m.id);
  const rawClassicsIds = (classics.results || [])
    .filter((m: any) => m && m.backdrop_path && m.poster_path)
    .map((m: any) => m.id);
  const curatedLandmarkIds = [29971, 743563, 587030, 49032, 29811, 238, 346, 670, 11423, 843, 103, 1398, 491584, 576928, 579974];

  // Shuffled selection so every session / refresh brings a fresh projection reel
  const shuffledCandidates = [
    ...rawTrendingIds.sort(() => Math.random() - 0.5).slice(0, 3),
    ...rawTopRatedIds.sort(() => Math.random() - 0.5).slice(0, 2),
    ...rawClassicsIds.sort(() => Math.random() - 0.5).slice(0, 2),
    ...curatedLandmarkIds.sort(() => Math.random() - 0.5).slice(0, 3),
  ].sort(() => Math.random() - 0.5);

  const candidateHeroIds = Array.from(new Set(shuffledCandidates)).slice(0, 8);

  const heroDetailsRaw = await Promise.all(
    candidateHeroIds.map((id: number) =>
      tmdb<any>(`/movie/${id}`, {
        append_to_response: "videos,credits",
      }).catch(() => null)
    )
  );

  const heroes: MovieDetail[] = heroDetailsRaw
    .filter(Boolean)
    .map((heroRaw: any) => {
      const heroDirector = heroRaw.credits?.crew?.find((c: any) => c.job === "Director");
      return {
        ...mapMovie(heroRaw),
        director: heroDirector?.name ?? "",
        directorId: heroDirector?.id ?? undefined,
        tagline: heroRaw.tagline ?? "",
        release: heroRaw.release_date ?? "",
        language: (heroRaw.original_language ?? "").toUpperCase(),
        trailer:
          heroRaw.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")?.key ??
          null,
      } as MovieDetail;
    });

  const hero = heroes[0] || ({} as MovieDetail);

  // 2. Recent in Cinema rail (Now Playing)
  const recentReleases: MovieCard[] = uniqueMappedMovies(nowPlaying.results || []).slice(0, 10);

  // 3. Indian & Tamil Cinema Curated Spotlight
  const indianFilmIds = [949229, 743563, 587030, 29971, 410331, 432011, 117691, 5801, 855400, 579974, 576928, 49032, 29811];
  const shuffledIndianIds = [...indianFilmIds].sort(() => Math.random() - 0.5);
  const indianMoviesRaw = await Promise.all(
    shuffledIndianIds.map((id) =>
      tmdb<any>(`/movie/${id}`, { append_to_response: "credits" }).catch(() => null)
    )
  );
  const indianSpotlight: MovieCard[] = indianMoviesRaw
    .filter(Boolean)
    .map((m: any) => ({
      ...mapMovie(m),
      director: m.credits?.crew?.find((c: any) => c.job === "Director")?.name ?? "—",
    }));

  // 4. Featured Auteurs Pool (Preloads Rishab Shetty + diverse auteurs across world traditions)
  const rishabSeed = AUTEUR_SPOTLIGHT.find((a) => a.id === 1752058);
  const otherAuteurs = AUTEUR_SPOTLIGHT.filter((a) => a.id !== 1752058).sort(() => Math.random() - 0.5);
  const selectedSeeds = rishabSeed ? [rishabSeed, ...otherAuteurs.slice(0, 5)] : otherAuteurs.slice(0, 6);

  const featuredAuteurs: AuteurCard[] = (
    await Promise.all(
      selectedSeeds.map(async (seed) => {
        try {
          const p = await tmdb<any>(`/person/${seed.id}`, { append_to_response: "movie_credits" });
          const directed = (p.movie_credits?.crew ?? []).filter((c: any) => c.job === "Director");
          const allCredits = [...directed, ...(p.movie_credits?.cast ?? [])];
          const candidateCredits = directed.length >= 4 ? directed : allCredits;
          const topFilms = uniqueMovies(candidateCredits)
            .sort((a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
            .slice(0, 4)
            .map(mapMovie);
          return {
            id: p.id,
            name: p.name,
            era: seed.era,
            movement: seed.movement,
            category: seed.category,
            profile: img(p.profile_path, "h632"),
            biography: p.biography ?? "",
            knownFor: topFilms,
          } as AuteurCard;
        } catch {
          return null;
        }
      })
    )
  ).filter(Boolean) as AuteurCard[];

  const featuredAuteur = featuredAuteurs[0] || null;

  // Curated Cinema Pathways: Rabbit-hole pathways connecting filmmakers & movements
  const pathwayFilmsRaw = await Promise.all([
    tmdb<any>("/movie/77").catch(() => null),     // Memento
    tmdb<any>("/movie/807").catch(() => null),    // Se7en
    tmdb<any>("/movie/949").catch(() => null),    // Heat
    tmdb<any>("/movie/11423").catch(() => null),  // Memories of Murder
    tmdb<any>("/movie/670").catch(() => null),    // Oldboy
    tmdb<any>("/movie/491584").catch(() => null), // Burning
  ]);

  const cinemaPathways: CinemaPathway[] = [
    {
      id: "tension-scale",
      title: "The Architecture of Tension & Scale",
      tagline: "Precision plotting, procedural obsession, and kinetic urban atmosphere",
      description:
        "Trace the direct cinematic lineage from Michael Mann's neon-drenched procedural realism into David Fincher's geometric obsession and Christopher Nolan's temporal mazes.",
      auteurs: [
        { id: 525, name: "Christopher Nolan", movement: "Temporal Architecture" },
        { id: 7467, name: "David Fincher", movement: "Clinical Precision" },
        { id: 6388, name: "Michael Mann", movement: "Urban Neo-Noir Realism" },
      ],
      films: pathwayFilmsRaw.slice(0, 3).filter(Boolean).map(mapMovie),
    },
    {
      id: "korean-renaissance",
      title: "Golden Age of Korean Auteurs",
      tagline: "Social allegories, baroque tragedy, and explosive genre subversion",
      description:
        "The turn-of-the-millennium explosion of Korean cinema redefined global film language through ferocious social satire, operatic revenge epics, and profound existential mystery.",
      auteurs: [
        { id: 21684, name: "Bong Joon-ho", movement: "Subversive Social Genre" },
        { id: 21685, name: "Park Chan-wook", movement: "Baroque Elegance & Vengeance" },
        { id: 24458, name: "Lee Chang-dong", movement: "Literary Existentialism" },
      ],
      films: pathwayFilmsRaw.slice(3, 6).filter(Boolean).map(mapMovie),
    },
  ];

  // 5. Curated Deep Cuts Pool (20 cinephile underground masterworks)
  const DEEP_CUT_POOL_IDS = [
    12493,  // High and Low (1963)
    11466,  // Cure (1997)
    579974, // Kumbalangi Nights (2019)
    406,    // La Haine (1995)
    576928, // Super Deluxe (2019)
    843,    // In the Mood for Love (2000)
    652,    // The Battle of Algiers (1966)
    491584, // Burning (2018)
    25538,  // Yi Yi (2000)
    62206,  // A Separation (2011)
    1398,   // Stalker (1979)
    598,    // City of God (2002)
    11104,  // Chungking Express (1994)
    11423,  // Memories of Murder (2003)
    49032,  // Iruvar (1997)
    5156,   // Bicycle Thieves (1948)
    18148,  // Tokyo Story (1953)
    621947, // Jallikattu (2019)
    5801,   // Aparajito (1956)
    29971,  // Nayakan (1987)
  ];

  const pickedDeepIds = [...DEEP_CUT_POOL_IDS].sort(() => Math.random() - 0.5).slice(0, 5);
  const deepCutsRaw = await Promise.all(
    pickedDeepIds.map((id) => tmdb<any>(`/movie/${id}`, { append_to_response: "credits" }).catch(() => null))
  );

  const deepCuts: MovieCard[] = deepCutsRaw.filter(Boolean).map((dc) => ({
    ...mapMovie(dc),
    director: dc.credits?.crew?.find((c: any) => c.job === "Director")?.name ?? "—",
  }));

  const deepCut = deepCuts[0] || null;

  // Cinema by Era Decades
  const decades: HomeDecade[] = [
    { decade: "1950s", label: "Golden Age & Classic Hollywood", years: "1950–1959" },
    { decade: "1960s", label: "Global New Waves & Modernism", years: "1960–1969" },
    { decade: "1970s", label: "New Hollywood Renaissance", years: "1970–1979" },
    { decade: "1980s", label: "Auteur Blockbusters & Synth", years: "1980–1989" },
    { decade: "1990s", label: "Indie Revolution & Neo-Noir", years: "1990–1999" },
    { decade: "2000s", label: "Modern Global Cinema", years: "2000–2009" },
    { decade: "2010s", label: "Contemporary Visionaries", years: "2010–2019" },
    { decade: "2020s", label: "The Present Horizon", years: "2020–Present" },
  ];

  const moodGenres = [18, 878, 35, 53, 80, 10749];
  const usedBackdrops = new Set<string>();
  const moods: { id: number; name: string; backdrop: string | null }[] = [];
  for (const id of moodGenres) {
    const r = await tmdb<List<any>>("/discover/movie", {
      with_genres: id,
      sort_by: "vote_count.desc",
      without_genres: moodGenres.filter((g) => g !== id).join("|"),
    });
    const pick = r.results.find(
      (m: any) => m.backdrop_path && !usedBackdrops.has(m.backdrop_path),
    );
    if (pick?.backdrop_path) usedBackdrops.add(pick.backdrop_path);
    moods.push({
      id,
      name: GENRES[id] ?? "Film",
      backdrop: img(pick?.backdrop_path, "w780"),
    });
  }

  const rails: Rail[] = [
    {
      key: "now",
      title: "In projection now",
      subtitle: "Playing in theatres this week",
      items: prioritizeWithPosters([...(nowPlaying.results || []), ...(nowPlayingP2.results || [])], 18),
    },
    {
      key: "long-take",
      title: "The Long Take",
      subtitle: "Highest-rated and classic films in discussion",
      items: prioritizeWithPosters([...(topRated.results || []), ...(topRatedP2.results || [])], 18),
    },
    {
      key: "restored",
      title: "Restored & Rediscovered",
      subtitle: "Pre-1985, cared for frame by frame",
      items: prioritizeWithPosters([...(classics.results || []), ...(classicsP2.results || [])], 18),
    },
    {
      key: "popular",
      title: "What members are watching",
      subtitle: "Most logged films right now",
      items: prioritizeWithPosters([...(popular.results || []), ...(popularP2.results || [])], 18),
    },
    {
      key: "tamil",
      title: "Tamil cinema",
      subtitle: "Stories from Tamil film",
      items: prioritizeWithPosters([...(tamil.results || []), ...(tamilP2.results || [])], 18),
    },
  ];

  return {
    heroes,
    hero,
    recentReleases,
    indianSpotlight,
    featuredAuteur,
    featuredAuteurs,
    cinemaPathways,
    deepCut,
    deepCuts,
    decades,
    rails,
    moods,
  };
});

export const getMovie = defineApi({ method: "GET" })
  .inputValidator((d: { id: number }) => z.object({ id: z.number() }).parse(d))
  .handler(async ({ data }): Promise<MovieDetail> => {
    const m = await tmdb<any>(`/movie/${data.id}`, {
      append_to_response: "credits,similar,recommendations,images,videos,reviews,watch/providers,keywords,external_ids",
      include_image_language: "en,null",
    });

    const crew: any[] = m.credits?.crew ?? [];
    const directorPerson = crew.find((c) => c.job === "Director");
    const providersRaw = m["watch/providers"]?.results?.IN ?? m["watch/providers"]?.results?.US ?? {};
    const providers = [
      ...(providersRaw.flatrate ?? []).map((p: any) => ({ ...p, kind: "Streaming" })),
      ...(providersRaw.rent ?? []).map((p: any) => ({ ...p, kind: "Rent" })),
      ...(providersRaw.buy ?? []).map((p: any) => ({ ...p, kind: "Buy" })),
    ]
      .slice(0, 4)
      .map((p: any) => ({
        name: p.provider_name,
        logo: img(p.logo_path, "w92"),
        kind: p.kind,
      }));

    let directorCareer: DirectorCareerContext | null = null;
    if (directorPerson?.id) {
      try {
        const dCredits = await tmdb<any>(`/person/${directorPerson.id}/movie_credits`);
        const directed = (dCredits.crew ?? [])
          .filter((c: any) => c.job === "Director" && c.release_date)
          .sort((a: any, b: any) => (a.release_date ?? "").localeCompare(b.release_date ?? ""));
        const uniqueDirected = uniqueMovies(directed).map(mapMovie);
        const currIdx = uniqueDirected.findIndex((f) => f.id === m.id);
        if (currIdx !== -1) {
          directorCareer = {
            directorName: directorPerson.name,
            directorId: directorPerson.id,
            before: currIdx > 0 ? uniqueDirected[currIdx - 1] : null,
            currentNumber: currIdx + 1,
            totalFilms: uniqueDirected.length,
            after: currIdx < uniqueDirected.length - 1 ? uniqueDirected[currIdx + 1] : null,
            allDirected: uniqueDirected.slice(0, 10),
          };
        }
      } catch {
        /* fallback gracefully */
      }
    }

    return {
      ...mapMovie(m),
      tagline: m.tagline ?? "",
      status: m.status ?? "",
      release: m.release_date ?? "",
      language: (m.original_language ?? "").toUpperCase(),
      languages: (m.spoken_languages ?? []).map((l: any) => l.english_name),
      countries: (m.production_countries ?? []).map((c: any) => c.name),
      budget: m.budget ?? 0,
      revenue: m.revenue ?? 0,
      homepage: m.homepage ?? "",
      keywords: (m.keywords?.keywords ?? []).slice(0, 12).map((k: any) => k.name),
      externalIds: m.external_ids ?? {},
      imdb: m.imdb_id ?? null,
      director: directorPerson?.name ?? "Unknown",
      directorId: directorPerson?.id ?? null,
      directorCareer,
      writers: [
        ...new Set(crew.filter((c) => c.department === "Writing").map((c) => c.name as string)),
      ].slice(0, 4),
      cast: (m.credits?.cast ?? []).slice(0, 12).map((c: any) => ({
        id: c.id,
        name: c.name,
        role: c.known_for_department ?? "Acting",
        character: c.character ?? "",
        profile: img(c.profile_path, "w300"),
      })) as PersonCard[],
      crew: crew
        .filter((c) =>
          ["Director", "Screenplay", "Writer", "Director of Photography", "Original Music Composer", "Editor", "Producer"].includes(
            c.job,
          ),
        )
        .slice(0, 10)
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          role: c.job,
          profile: img(c.profile_path, "w300"),
        })) as PersonCard[],
      similar: uniqueMappedMovies(m.similar?.results ?? []).slice(0, 12),
      recommended: uniqueMappedMovies(m.recommendations?.results ?? []).slice(0, 12),
      logo: img(m.images?.logos?.find((l: any) => l.iso_639_1 === "en" || l.iso_639_1 === null)?.file_path, "w500"),
      images: (m.images?.backdrops ?? [])
        .slice(0, 8)
        .map((i: any) => img(i.file_path, "w780"))
        .filter(Boolean) as string[],
      trailer:
        m.videos?.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube")?.key ??
        null,
      collection: m.belongs_to_collection
        ? {
            id: m.belongs_to_collection.id,
            name: m.belongs_to_collection.name,
            backdrop: img(m.belongs_to_collection.backdrop_path, "w780"),
          }
        : null,
      reviews: (m.reviews?.results ?? []).slice(0, 3).map((r: any) => ({
        id: r.id,
        author: r.author,
        content: r.content,
        rating: r.author_details?.rating ?? null,
        date: r.created_at,
      })),
      reviewCount: m.reviews?.total_results ?? 0,
      providers,
    };
  });

export const getPerson = defineApi({ method: "GET" })
  .inputValidator((d: { id: number }) => z.object({ id: z.number() }).parse(d))
  .handler(async ({ data }): Promise<PersonDetail> => {
    const p = await tmdb<any>(`/person/${data.id}`, {
      append_to_response: "combined_credits,images",
    });

    const isDirecting = p.known_for_department === "Directing";

    // Filter raw credits to movies only
    const rawCast = (p.combined_credits?.cast ?? []).filter((c: any) => c && c.id && c.media_type === "movie");
    const rawCrew = (p.combined_credits?.crew ?? []).filter((c: any) => c && c.id && c.media_type === "movie");

    // Strict deduplication by movie ID
    const uniqueCast = uniqueMovies(rawCast);
    
    // For directors, prioritize entries where job is 'Director'
    const directJobs = rawCrew.filter((c: any) => c.job === "Director");
    const otherCrewJobs = rawCrew.filter((c: any) => c.job !== "Director");
    // Place Director jobs first so uniqueMovies keeps the Director role
    const uniqueCrew = uniqueMovies(isDirecting && directJobs.length ? [...directJobs, ...otherCrewJobs] : rawCrew);

    const primaryMovies = isDirecting ? (directJobs.length ? uniqueMovies(directJobs) : uniqueCrew) : uniqueCast;

    // Filter films with valid release dates and sort chronologically (descending for credits list)
    const cleanPrimary = uniqueMovies(primaryMovies.filter((c: any) => c.release_date))
      .sort((a: any, b: any) => (b.release_date ?? "").localeCompare(a.release_date ?? ""));

    const allCredits = uniqueMovies([...uniqueCast, ...uniqueCrew])
      .filter((c: any) => c.release_date)
      .sort((a: any, b: any) => (b.release_date ?? "").localeCompare(a.release_date ?? ""))
      .map(mapMovie);

    const knownFor = uniqueMovies(primaryMovies)
      .sort((a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
      .slice(0, 6)
      .map(mapMovie);

    const rated = primaryMovies.filter((c: any) => c.vote_count > 30);
    const averageRating = rated.length
      ? Math.round(
          (rated.reduce((s: number, c: any) => s + (c.vote_average ?? 0), 0) / rated.length) * 10,
        ) / 10
      : 0;

    const tally = new Map<number, PersonCard & { count: number }>();
    const topFilms = knownFor.slice(0, 5);
    const creditSets = await Promise.all(
      topFilms.map((f) => tmdb<any>(`/movie/${f.id}/credits`).catch(() => null)),
    );
    for (const set of creditSets) {
      if (!set) continue;
      const people = [
        ...(set.cast ?? []).slice(0, 8),
        ...(set.crew ?? []).filter((c: any) =>
          ["Director", "Director of Photography", "Original Music Composer", "Editor"].includes(
            c.job,
          ),
        ),
      ];
      for (const person of people) {
        if (!person || person.id === p.id) continue;
        const existing = tally.get(person.id);
        if (existing) existing.count += 1;
        else
          tally.set(person.id, {
            id: person.id,
            name: person.name,
            role: person.job ?? person.known_for_department ?? "Acting",
            profile: img(person.profile_path, "w185"),
            count: 1,
          });
      }
    }

    const years = cleanPrimary
      .map((c: any) => (c.release_date ?? "").slice(0, 4))
      .filter(Boolean)
      .sort();

    return {
      id: p.id,
      name: p.name,
      biography: p.biography ?? "",
      birthday: p.birthday ?? null,
      deathday: p.deathday ?? null,
      place: p.place_of_birth ?? null,
      department: p.known_for_department ?? "Acting",
      profile: img(p.profile_path, "h632"),
      popularity: Math.round(p.popularity ?? 0),
      knownFor,
      credits: allCredits,
      crewCredits: cleanPrimary.map(mapMovie),
      images: (p.images?.profiles ?? [])
        .slice(0, 6)
        .map((i: any) => img(i.file_path, "w300"))
        .filter(Boolean) as string[],
      collaborators: [...tally.values()].sort((a, b) => b.count - a.count).slice(0, 8),
      averageRating,
      creditCount: cleanPrimary.length,
      firstYear: years[0] ?? "—",
    };
  });

export const searchAll = defineApi({ method: "GET" })
  .inputValidator((d: { q: string }) => z.object({ q: z.string() }).parse(d))
  .handler(
    async ({
      data,
    }): Promise<{
      films: MovieCard[];
      people: PersonCard[];
      collections: CollectionCard[];
      total: number;
    }> => {
      const q = data.q.trim();
      if (!q) return { films: [], people: [], collections: [], total: 0 };
      const [movies, people, collections] = await Promise.all([
        tmdb<List<any>>("/search/movie", { query: q, include_adult: "false" }),
        tmdb<List<any>>("/search/person", { query: q, include_adult: "false" }),
        tmdb<List<any>>("/search/collection", { query: q }),
      ]);
      return {
        films: uniqueMappedMovies(movies.results),
        people: people.results.slice(0, 8).map((p: any) => ({
          id: p.id,
          name: p.name,
          role: p.known_for_department ?? "Acting",
          profile: img(p.profile_path, "w185"),
          count: (p.known_for ?? []).length,
        })),
        collections: collections.results.slice(0, 6).map((c: any) => ({
          id: c.id,
          name: c.name,
          overview: c.overview ?? "",
          poster: img(c.poster_path, "w342"),
          backdrop: img(c.backdrop_path, "w780"),
          count: 0,
          posters: [],
        })),
        total: (movies.total_results ?? 0) + (people.total_results ?? 0),
      };
    },
  );

export const searchMovies = defineApi({ method: "GET" })
  .inputValidator((d: { q: string }) => z.object({ q: z.string() }).parse(d))
  .handler(async ({ data }): Promise<MovieCard[]> => {
    const q = data.q.trim();
    if (!q) return [];
    const r = await tmdb<List<any>>("/search/movie", { query: q, include_adult: "false" });
    return uniqueMappedMovies(r.results).slice(0, 8);
  });

export const discoverFilms = defineApi({ method: "GET" })
  .inputValidator(
    (d: {
      genres?: number[];
      decade?: string;
      sort?: string;
      page?: number;
      maxRuntime?: number;
      country?: string;
      world?: string;
      preset?: string;
      language?: string;
    }) =>
      z
        .object({
          genres: z.array(z.number()).optional(),
          decade: z.string().optional(),
          sort: z.string().optional(),
          page: z.number().optional(),
          maxRuntime: z.number().optional(),
          country: z.string().optional(),
          world: z.string().optional(),
          preset: z.string().optional(),
          language: z.string().optional(),
        })
        .parse(d),
  )
  .handler(
    async ({
      data,
    }): Promise<{
      items: MovieCard[];
      total: number;
      pages: number;
      page: number;
      worldDef?: CinemaWorldDef;
    }> => {
      const worldDef = getCinemaWorld(data.world);
      const isDeepCuts = data.preset === "deep_cuts" || data.sort === "deep_cuts";
      const isClassics = data.preset === "classics";
      const isNewReleases = data.preset === "new_releases";
      const isTopRated = data.preset === "top_rated" || data.sort === "vote_average.desc";

      let sortBy = data.sort || "popularity.desc";
      if (isDeepCuts) {
        sortBy = "vote_average.desc";
      } else if (isTopRated) {
        sortBy = "vote_average.desc";
      } else if (isNewReleases && !data.sort) {
        sortBy = "primary_release_date.desc";
      }

      // Base vote floor adjusted for the regional cinema volume
      const baseFloor = worldDef?.voteCountFloor ?? 30;
      let minVotes = 0;
      let maxVotes: number | undefined = undefined;

      if (isDeepCuts) {
        minVotes = Math.max(15, Math.floor(baseFloor * 0.7));
        maxVotes = worldDef?.id === "hollywood" ? 4500 : 1800;
      } else if (isTopRated) {
        minVotes = baseFloor;
      } else if (isClassics) {
        minVotes = Math.max(10, Math.floor(baseFloor * 0.4));
      } else if (isNewReleases) {
        minVotes = 5;
      }

      const params: Record<string, string | number | undefined> = {
        sort_by: sortBy,
        page: data.page ?? 1,
        include_adult: "false",
      };

      if (minVotes > 0) {
        params["vote_count.gte"] = minVotes;
      }
      if (maxVotes !== undefined) {
        params["vote_count.lte"] = maxVotes;
      }
      if (isDeepCuts) {
        params["vote_average.gte"] = 7.0;
      }

      // World specific filters
      if (worldDef?.language) {
        params["with_original_language"] = worldDef.language;
      }
      if (worldDef?.originCountry) {
        params["with_origin_country"] = worldDef.originCountry;
      }
      if (worldDef?.id === "kollywood" || worldDef?.id === "mollywood" || worldDef?.id === "tollywood" || worldDef?.id === "bollywood" || worldDef?.id === "sandalwood") {
        params["region"] = "IN";
      } else if (worldDef?.id === "korean") {
        params["region"] = "KR";
      } else if (worldDef?.id === "japanese") {
        params["region"] = "JP";
      }

      // Explicit overrides
      if (data.language) params["with_original_language"] = data.language;
      if (data.country) params["with_origin_country"] = data.country;

      // Combine genres from world definition and user selection
      const combinedGenres = Array.from(
        new Set([...(worldDef?.genres ?? []), ...(data.genres ?? [])]),
      );
      if (combinedGenres.length > 0) {
        params["with_genres"] = combinedGenres.join(",");
      }

      // Decades
      if (isClassics && !data.decade) {
        params["primary_release_date.lte"] = "1985-12-31";
      } else if (data.decade === "pre1950") {
        params["primary_release_date.lte"] = "1949-12-31";
      } else if (data.decade) {
        params["primary_release_date.gte"] = `${data.decade}-01-01`;
        params["primary_release_date.lte"] = `${Number(data.decade) + 9}-12-31`;
      }

      if (isNewReleases) {
        const today = new Date().toISOString().slice(0, 10);
        params["primary_release_date.lte"] = today;
      }

      if (data.maxRuntime) params["with_runtime.lte"] = data.maxRuntime;

      const r = await tmdb<List<any>>("/discover/movie", params);
      return {
        items: uniqueMappedMovies(r.results || []),
        total: r.total_results ?? 0,
        pages: Math.min(r.total_pages ?? 1, 500),
        page: data.page ?? 1,
        worldDef,
      };
    },
  );

export type CollectionCuration = {
  id: number;
  name: string;
  tagline: string;
  overview: string;
  backdrop: string | null;
  poster: string | null;
  count: number;
  posters: string[];
  tradition?: string;
};

export const getCollectionsPage = defineApi({ method: "GET" }).handler(async (): Promise<{
  featured: CollectionCard;
  cinematicBanners: CollectionCuration[];
  posterClusters: CollectionCuration[];
  textLedWorlds: { slug: string; title: string; subtitle: string; era: string; count: number; posters: string[] }[];
  sagas: CollectionCard[];
  community: { slug: string; title: string; genre: number; count: number; posters: string[] }[];
}> => {
  // 1. Curated Key TMDB Collections (Lord of the Rings, Godfather, Dark Knight, Dune, Matrix, Before, Mad Max, Baahubali, Blade Runner)
  const priorityIds = [119, 230, 263, 726871, 2344, 123800, 8945, 350309, 422837, 404609, 244500, 787649, 10];
  const fetched = await Promise.all(
    priorityIds.map(async (id) => {
      try {
        const c = await tmdb<any>(`/collection/${id}`);
        if (!c || !c.name || !Array.isArray(c.parts)) return null;
        return {
          id: c.id,
          name: c.name.replace(/\s*Collection\s*$/i, "").replace(/\s*Trilogy\s*$/i, " Trilogy"),
          tagline: c.overview ? c.overview.slice(0, 100) + "..." : "Defining cinematic continuum.",
          overview: c.overview ?? "",
          backdrop: img(c.backdrop_path, "w1280"),
          poster: img(c.poster_path, "w500"),
          count: c.parts.length,
          posters: (c.parts ?? [])
            .slice(0, 6)
            .map((p: any) => img(p.poster_path, "w342"))
            .filter(Boolean) as string[],
        } as CollectionCuration;
      } catch {
        return null;
      }
    })
  );

  const validPriority = fetched.filter(Boolean) as CollectionCuration[];

  // Featured Saga: The Lord of the Rings or The Godfather
  const featuredCuration = validPriority.find((c) => c.id === 119) || validPriority[0] || ({
    id: 119,
    name: "The Lord of the Rings",
    tagline: "The monumental fantasy epic that redefined modern cinema scale.",
    overview: "Peter Jackson's legendary adaptation shot simultaneously in New Zealand.",
    backdrop: null,
    poster: null,
    count: 3,
    posters: [],
  });

  const featured: CollectionCard = {
    id: featuredCuration.id,
    name: featuredCuration.name,
    overview: featuredCuration.overview,
    poster: featuredCuration.poster,
    backdrop: featuredCuration.backdrop,
    count: featuredCuration.count,
    posters: featuredCuration.posters,
  };

  // Wide Cinematic Banners (Dune, Dark Knight, Blade Runner, Mad Max, Before)
  const cinematicBanners = validPriority.filter((c) => [726871, 263, 422837, 8945, 123800].includes(c.id));

  // Poster Clusters (Godfather, Matrix, Baahubali, John Wick, Gangs of Wasseypur)
  const posterClusters = validPriority.filter((c) => [230, 2344, 350309, 404609, 244500, 787649].includes(c.id));

  // 2. Text-Led Cinema Worlds (Expressive typographic collection portals)
  const textLedWorlds = [
    {
      slug: "malayalam-new-wave",
      title: "Malayalam New Wave",
      subtitle: "The masterclass in understated social realism, moral ambiguity, and organic performance.",
      era: "2010–Present",
      count: 28,
      posters: [
        "https://image.tmdb.org/t/p/w185/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
        "https://image.tmdb.org/t/p/w185/fYXqpgPmHMphSF2W30GbTeJVIa5.jpg",
      ],
    },
    {
      slug: "tamil-cinema-continuum",
      title: "Tamil Modernism & LCU",
      subtitle: "From Mani Ratnam's sensory lighting to Lokesh Kanagaraj's kinetic interconnected universes.",
      era: "1987–Present",
      count: 34,
      posters: [],
    },
    {
      slug: "korean-baroque-thrillers",
      title: "Korean Baroque Thrillers",
      subtitle: "Operatic vengeance, surgical framing, and existential tension in modern Seoul.",
      era: "1999–Present",
      count: 22,
      posters: [],
    },
    {
      slug: "90s-indie-revolution",
      title: "90s Indie Revolution & Neo-Noir",
      subtitle: "The decade when independent visionaries shattered studio formulas with pulp dialogue and gritty film grain.",
      era: "1990–1999",
      count: 45,
      posters: [],
    },
    {
      slug: "japanese-golden-age",
      title: "Japanese Golden Age & Humanist Epics",
      subtitle: "Dynamic weather, tatami stillness, and moral gravity across mid-century masterpieces.",
      era: "1950–1969",
      count: 30,
      posters: [],
    },
  ];

  // Sagas collection cards
  const sagas: CollectionCard[] = validPriority.map((c) => ({
    id: c.id,
    name: c.name,
    overview: c.overview,
    poster: c.poster,
    backdrop: c.backdrop,
    count: c.count,
    posters: c.posters,
  }));

  // Community lists
  const communityGenres = [
    { slug: "shot-at-night", title: "Films Shot at Night", genre: 80 },
    { slug: "the-long-year", title: "Science Fiction, Sorted", genre: 878 },
    { slug: "comfort-watches", title: "Comfort Watches, Ranked", genre: 35 },
  ];
  const community = await Promise.all(
    communityGenres.map(async (g) => {
      const r = await tmdb<List<any>>("/discover/movie", {
        with_genres: g.genre,
        sort_by: "vote_average.desc",
        "vote_count.gte": 1000,
      });
      return {
        ...g,
        count: r.total_results ?? 0,
        posters: r.results
          .slice(0, 5)
          .map((m: any) => img(m.poster_path, "w185"))
          .filter(Boolean) as string[],
      };
    }),
  );

  return {
    featured,
    cinematicBanners,
    posterClusters,
    textLedWorlds,
    sagas,
    community,
  };
});

export const getCollection = defineApi({ method: "GET" })
  .inputValidator((d: { id: number }) => z.object({ id: z.number() }).parse(d))
  .handler(
    async ({
      data,
    }): Promise<{
      id: number;
      name: string;
      overview: string;
      backdrop: string | null;
      poster: string | null;
      parts: MovieCard[];
      runtime: number;
      average: number;
    }> => {
      const c = await tmdb<any>(`/collection/${data.id}`);
      const parts: MovieCard[] = uniqueMappedMovies(c.parts ?? [])
        .sort((a: MovieCard, b: MovieCard) => a.year.localeCompare(b.year));
      const details = await Promise.all(
        parts.slice(0, 12).map((p) => tmdb<any>(`/movie/${p.id}`).catch(() => null)),
      );
      const runtime = details.reduce((s, d) => s + (d?.runtime ?? 0), 0);
      const withRuntime = parts.map((p, i) => ({
        ...p,
        ...(details[i]?.runtime ? { runtime: details[i].runtime } : {}),
        director:
          details[i]?.credits?.crew?.find?.((x: any) => x.job === "Director")?.name ?? undefined,
      }));
      const rated = parts.filter((p) => p.votes > 20);
      return {
        id: c.id,
        name: c.name,
        overview: c.overview ?? "",
        backdrop: img(c.backdrop_path, "w1280"),
        poster: img(c.poster_path, "w500"),
        parts: withRuntime,
        runtime,
        average: rated.length
          ? Math.round((rated.reduce((s, p) => s + p.rating, 0) / rated.length) * 10) / 10
          : 0,
      };
    },
  );

export const getMoviesByIds = defineApi({ method: "POST" })
  .inputValidator((d: { ids: number[] }) => z.object({ ids: z.array(z.number()) }).parse(d))
  .handler(async ({ data }): Promise<MovieCard[]> => {
    const unique = [...new Set(data.ids)].slice(0, 60);
    const results = await Promise.all(
      unique.map((id) =>
        tmdb<any>(`/movie/${id}`, { append_to_response: "credits" }).catch(() => null),
      ),
    );
    return results.filter(Boolean).map((m: any) => ({
      ...mapMovie(m),
      director: m.credits?.crew?.find((c: any) => c.job === "Director")?.name ?? "—",
    }));
  });

export const getListFilms = defineApi({ method: "GET" })
  .inputValidator((d: { genre: number }) => z.object({ genre: z.number() }).parse(d))
  .handler(async ({ data }): Promise<MovieCard[]> => {
    const r = await tmdb<List<any>>("/discover/movie", {
      with_genres: data.genre,
      sort_by: "vote_average.desc",
      "vote_count.gte": 1000,
    });
    return uniqueMappedMovies(r.results);
  });

export const AUTEUR_SPOTLIGHT = [
  // 1. Kollywood (Tamil Cinema)
  { id: 78747, name: "Mani Ratnam", era: "1983–Present", movement: "Sensory Modernism, Political Rhapsody & The Modern Epic", category: "Kollywood (Tamil)" },
  { id: 1592411, name: "Lokesh Kanagaraj", era: "2017–Present", movement: "Kinetic Hyper-Action, Darkness & Interconnected Universes", category: "Kollywood (Tamil)" },
  { id: 550172, name: "Vetrimaaran", era: "2007–Present", movement: "Raw Social Realism, Caste Politics & Subaltern Epics", category: "Kollywood (Tamil)" },
  { id: 120953, name: "Gautham Vasudev Menon", era: "2001–Present", movement: "Lyrical Urban Romance, Voiceover & Stylized Procedurals", category: "Kollywood (Tamil)" },
  { id: 1278235, name: "Pa. Ranjith", era: "2012–Present", movement: "Subaltern Resistance, Working-Class Dignity & Dalit Poetics", category: "Kollywood (Tamil)" },
  { id: 120957, name: "Mysskin", era: "2006–Present", movement: "Yellow Light Aesthetics, Low-Angle Despair & Dostoevskian Noir", category: "Kollywood (Tamil)" },
  { id: 127448, name: "K. Balachander", era: "1965–2014", movement: "Progressive Social Drama & Interpersonal Provocation", category: "Kollywood (Tamil)" },

  // 2. Mollywood (Malayalam Cinema)
  { id: 1162630, name: "Lijo Jose Pellissery", era: "2010–Present", movement: "Frenzied Mob Kineticism, Spiritual Chaos & Carnivalesque Realism", category: "Mollywood (Malayalam)" },
  { id: 935843, name: "Adoor Gopalakrishnan", era: "1972–Present", movement: "Syllabic Stillness, Feudal Decay & Humanist Art Cinema", category: "Mollywood (Malayalam)" },
  { id: 1574334, name: "Dileesh Pothan", era: "2016–Present", movement: "Organic Everyday Realism, Hyper-Specific Human Irony", category: "Mollywood (Malayalam)" },
  { id: 1130914, name: "Jeethu Joseph", era: "2006–Present", movement: "Procedural Suspense Architecture & Domestic Dread", category: "Mollywood (Malayalam)" },
  { id: 1104831, name: "P. Padmarajan", era: "1979–1991", movement: "Sensual Melancholy, Psychological Depths & Poetic Tragedy", category: "Mollywood (Malayalam)" },
  { id: 587720, name: "Amal Neerad", era: "2007–Present", movement: "High-Stylized Gun Noir, Slo-Mo Elegance & Atmospheric Crime", category: "Mollywood (Malayalam)" },

  // 3. Tollywood & South (Telugu & Kannada)
  { id: 147021, name: "S. S. Rajamouli", era: "2001–Present", movement: "Mythic Visual Scale, Hyperbolic Drama & Emotional Gravity", category: "Tollywood & South" },
  { id: 237051, name: "Sukumar", era: "2004–Present", movement: "Psychological Character Complexity & Gritty Rural Crime", category: "Tollywood & South" },
  { id: 116923, name: "Trivikram Srinivas", era: "2002–Present", movement: "Philosophical Dialogue, Familial Bonds & Sharp Wit", category: "Tollywood & South" },
  { id: 584327, name: "Singeetam Srinivasa Rao", era: "1972–Present", movement: "Experimental Genre Mastery & Silent Comedy Modernism", category: "Tollywood & South" },
  { id: 2182258, name: "Prashanth Neel", era: "2014–Present", movement: "Monochromatic Heroic Elevation & Industrial Scale", category: "Tollywood & South" },
  { id: 1752058, name: "Rishab Shetty", era: "2016–Present", movement: "Folkloric Animism, Sacred Rituals & Tribal Roots", category: "Tollywood & South" },
  { id: 1086492, name: "Girish Kasaravalli", era: "1977–Present", movement: "New Wave Humanism, Ethical Stillness & Social Critique", category: "Tollywood & South" },

  // 4. Bollywood (Hindi Cinema)
  { id: 85670, name: "Anurag Kashyap", era: "2003–Present", movement: "Raw Indie Neo-Noir, Kinetic Editing & Gangland Sagas", category: "Bollywood (Hindi)" },
  { id: 87550, name: "Vishal Bhardwaj", era: "2002–Present", movement: "Shakespearean Crime Tragedies, Literary Atmosphere & Soulful Scores", category: "Bollywood (Hindi)" },
  { id: 42804, name: "Sanjay Leela Bhansali", era: "1996–Present", movement: "Grand Visual Splendor, Saturated Color & Operatic Tragedy", category: "Bollywood (Hindi)" },
  { id: 125354, name: "Guru Dutt", era: "1951–1964", movement: "Existential Melancholy, Poetic Light & Cinephilic Despair", category: "Bollywood (Hindi)" },
  { id: 544996, name: "Raj Kapoor", era: "1948–1988", movement: "The Tramp Persona, Socialist Optimism & Visual Showmanship", category: "Bollywood (Hindi)" },
  { id: 35770, name: "Yash Chopra", era: "1959–2012", movement: "Lyrical Romantic Grandeur, Velvet Melodrama & Swiss Vistas", category: "Bollywood (Hindi)" },
  { id: 1034447, name: "Shoojit Sircar", era: "2005–Present", movement: "Quiet Domestic Realism, Emotional Warmth & Fragility", category: "Bollywood (Hindi)" },

  // 5. Bengali & Marathi Cinema
  { id: 12160, name: "Satyajit Ray", era: "1955–1991", movement: "Humanist Lyricism, The Apu Trilogy & Sublime Quietude", category: "Bengali & Marathi Cinema" },
  { id: 543652, name: "Ritwik Ghatak", era: "1952–1976", movement: "Partition Trauma, Epic Brechtian Melodrama & Myth", category: "Bengali & Marathi Cinema" },
  { id: 1086288, name: "Mrinal Sen", era: "1955–2002", movement: "Political Agitation, Urban Alienation & New Wave Boldness", category: "Bengali & Marathi Cinema" },
  { id: 52264, name: "Rituparno Ghosh", era: "1992–2013", movement: "Intimate Chamber Drama, Queer Identity & Tagore Adaptations", category: "Bengali & Marathi Cinema" },
  { id: 1265981, name: "Nagraj Manjule", era: "2013–Present", movement: "Raw Dalit Assertion, Realistic Teenage Love & Rural Fury", category: "Bengali & Marathi Cinema" },
  { id: 1361809, name: "Chaitanya Tamhane", era: "2014–Present", movement: "Contemplative Institutional Absurdity & Indian Classical Poetics", category: "Bengali & Marathi Cinema" },

  // 6. Japanese Cinema
  { id: 5026, name: "Akira Kurosawa", era: "1943–1993", movement: "Dynamic Framing, Axis Weather & Moral Humanism", category: "Japanese Cinema" },
  { id: 608, name: "Hayao Miyazaki", era: "1979–Present", movement: "Studio Ghibli Animated Poetics, Flight & Ecological Grace", category: "Japanese Cinema" },
  { id: 95501, name: "Yasujirō Ozu", era: "1929–1962", movement: "Tatami Shot Precision, Domestic Stillness & Mono no Aware", category: "Japanese Cinema" },

  // 7. Korean Cinema
  { id: 21684, name: "Bong Joon-ho", era: "2000–Present", movement: "Subversive Social Satire, Class Allegory & Genre Inversion", category: "Korean Cinema" },
  { id: 10099, name: "Park Chan-wook", era: "1992–Present", movement: "Baroque Elegance, The Vengeance Trilogy & Formal Precision", category: "Korean Cinema" },
  { id: 96657, name: "Lee Chang-dong", era: "1997–Present", movement: "Literary Existentialism, Moral Ambiguity & Deep Grief", category: "Korean Cinema" },

  // 8. Hollywood / American Cinema
  { id: 240, name: "Stanley Kubrick", era: "1953–1999", movement: "Visionary Perfectionism, Symmetrical Composition & Satires", category: "Hollywood" },
  { id: 2636, name: "Alfred Hitchcock", era: "1922–1976", movement: "Master of Pure Cinema, Suspense Architecture & Voyeurism", category: "Hollywood" },
  { id: 1776, name: "Francis Ford Coppola", era: "1963–Present", movement: "American Operatic Tragedy, Shadow & Epic Grandeur", category: "Hollywood" },
  { id: 1032, name: "Martin Scorsese", era: "1967–Present", movement: "Kinetic Guilt, Urban Street Violence & Spiritual Torment", category: "Hollywood" },
  { id: 525, name: "Christopher Nolan", era: "1998–Present", movement: "Temporal Architecture, Practical Scale & Cross-Cutting", category: "Hollywood" },
  { id: 138, name: "Quentin Tarantino", era: "1992–Present", movement: "Postmodern Dialogue, Nonlinear Storytelling & Cinephilic Pastiche", category: "Hollywood" },
  { id: 7467, name: "David Fincher", era: "1992–Present", movement: "Clinical Precision, Procedural Obsession & Green-Amber Noir", category: "Hollywood" },
  { id: 488, name: "Steven Spielberg", era: "1971–Present", movement: "Blockbuster Wonder, Visual Storytelling & Historical Empathy", category: "Hollywood" },
  { id: 4762, name: "Paul Thomas Anderson", era: "1996–Present", movement: "American Character Panoramas, Rhapsody & Kinetic Tracking Shots", category: "Hollywood" },
  { id: 137427, name: "Denis Villeneuve", era: "1998–Present", movement: "Atmospheric Monumentalism, Sound Design & Speculative Dread", category: "Hollywood" },
  { id: 5655, name: "Wes Anderson", era: "1996–Present", movement: "Diorama Symmetry, Pastel Color Wheels & Melancholic Wit", category: "Hollywood" },

  // 9. European Cinema
  { id: 6648, name: "Ingmar Bergman", era: "1946–2003", movement: "Existential Chamber Drama, Close-Up Faith & Spiritual Silence", category: "European Cinema" },
  { id: 4415, name: "Federico Fellini", era: "1950–1990", movement: "Carnivalesque Italian Reverie, Circus Nostalgia & Memory", category: "European Cinema" },
  { id: 3776, name: "Jean-Luc Godard", era: "1954–2018", movement: "French New Wave, Jump Cuts & Cinematic Deconstruction", category: "European Cinema" },
  { id: 6817, name: "Agnès Varda", era: "1955–2019", movement: "Feminist Playfulness, Cinécriture & Documentary Intimacy", category: "European Cinema" },
  { id: 309, name: "Pedro Almodóvar", era: "1978–Present", movement: "Vibrant Color Melodrama, Camp Emotion & Transgressive Love", category: "European Cinema" },
  { id: 8452, name: "Andrei Tarkovsky", era: "1962–1986", movement: "Sculpting in Time, Long Takes & Transcendental Poetics", category: "European Cinema" },
  { id: 6011, name: "Michael Haneke", era: "1989–Present", movement: "Clinical Bourgeois Unsettling & Glaciation of Feeling", category: "European Cinema" },
  { id: 1650, name: "François Truffaut", era: "1959–1984", movement: "Autobiographical Lyricism & Irrepressible Love of Film", category: "European Cinema" },
  { id: 15189, name: "Michelangelo Antonioni", era: "1950–2004", movement: "Modernist Ennui, Architecture of Desolation & Alienation", category: "European Cinema" },

  // 10. Asian & World Cinema
  { id: 12453, name: "Wong Kar-wai", era: "1988–Present", movement: "Sensory Melancholy, Step-Printing & Fleeting Love", category: "Asian & World Cinema" },
  { id: 119294, name: "Abbas Kiarostami", era: "1970–2016", movement: "Poetic Iranian Realism, Automotive Conversations & Blurred Fiction", category: "Asian & World Cinema" },
  { id: 229931, name: "Asghar Farhadi", era: "2003–Present", movement: "Moral Fracture, Bourgeois Ethics & Psychological Interrogation", category: "Asian & World Cinema" },
  { id: 143035, name: "Edward Yang", era: "1981–2000", movement: "Taipei Urban Transitions, Generational Epics & Gentle Observation", category: "Asian & World Cinema" },
  { id: 607, name: "Zhang Yimou", era: "1987–Present", movement: "Fifth Generation Color Saturation, Martial Grace & Historical Grief", category: "Asian & World Cinema" },

  // 11. Genre & Cult
  { id: 5602, name: "David Lynch", era: "1977–Present", movement: "American Surrealism, Industrial Nightmares & Dream Logic", category: "Genre & Cult" },
  { id: 11770, name: "John Carpenter", era: "1974–Present", movement: "Minimalist Panavision Dread, Synthesizer Scores & Cold Survival", category: "Genre & Cult" },
  { id: 224, name: "David Cronenberg", era: "1969–Present", movement: "Visceral Body Horror, Psychological Decay & New Flesh", category: "Genre & Cult" },
  { id: 10828, name: "Guillermo del Toro", era: "1993–Present", movement: "Gothic Dark Fantasy, Clockwork Mechanisms & Monster Compassion", category: "Genre & Cult" },
  { id: 578, name: "Ridley Scott", era: "1977–Present", movement: "Atmospheric World-Building, Industrial Sci-Fi & Painterly Light", category: "Genre & Cult" },
];

export type AuteurCard = {
  id: number;
  name: string;
  era: string;
  movement: string;
  category: string;
  profile: string | null;
  biography: string;
  knownFor: MovieCard[];
};

export const getFilmmakers = defineApi({ method: "GET" }).handler(
  async (): Promise<{ categories: string[]; featured: AuteurCard[]; all: AuteurCard[] }> => {
    const list = await Promise.all(
      AUTEUR_SPOTLIGHT.map(async (seed) => {
        try {
          const p = await tmdb<any>(`/person/${seed.id}`, { append_to_response: "movie_credits" });
          const crew = (p.movie_credits?.crew ?? []).filter((c: any) => c.job === "Director");
          const topFilms = uniqueMovies(crew)
            .sort((a: any, b: any) => (b.vote_count ?? 0) - (a.vote_count ?? 0))
            .slice(0, 4)
            .map(mapMovie);
          return {
            id: p.id,
            name: p.name,
            era: seed.era,
            movement: seed.movement,
            category: seed.category,
            profile: img(p.profile_path, "h632"),
            biography: p.biography ?? "",
            knownFor: topFilms,
          } as AuteurCard;
        } catch {
          return {
            id: seed.id,
            name: seed.name,
            era: seed.era,
            movement: seed.movement,
            category: seed.category,
            profile: null,
            biography: "",
            knownFor: [],
          } as AuteurCard;
        }
      }),
    );

    const categories = [
      "All Worlds",
      "Kollywood (Tamil)",
      "Mollywood (Malayalam)",
      "Tollywood & South",
      "Bollywood (Hindi)",
      "Bengali & Marathi Cinema",
      "Hollywood",
      "Korean Cinema",
      "Japanese Cinema",
      "European Cinema",
      "Asian & World Cinema",
      "Genre & Cult",
    ];

    return {
      categories,
      featured: list.slice(0, 6),
      all: list,
    };
  },
);

