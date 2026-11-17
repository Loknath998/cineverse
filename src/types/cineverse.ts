export type MediaType = 'movie' | 'person' | 'collection';

export interface Movie {
  id: number;
  title: string;
  original_title?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count?: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  tagline?: string;
  status?: string;
  director?: string;
  cast?: Person[];
  similar?: Movie[];
  trailer_key?: string;
  collection_id?: number;
}

export interface Person {
  id: number;
  name: string;
  profile_path: string;
  known_for_department?: string;
  biography?: string;
  birthday?: string;
  place_of_birth?: string;
  known_for?: Movie[];
  character?: string;
}

export interface Collection {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  parts: Movie[];
}

export interface AppState {
  watchlist: number[];
  favorites: number[];
  watched: number[];
  profile: { name: string; location: string };
}
