import type { MovieDetail, PersonCard } from "./tmdb-map";

/** A person who appears in both films, with what they did on each side. */
export type SharedPerson = {
  id: number;
  name: string;
  profile: string | null;
  roleA: string;
  roleB: string;
};

export type Comparison = {
  sameDirector: boolean;
  sharedCast: SharedPerson[];
  sharedCrew: SharedPerson[];
  sharedWriters: string[];
  sharedGenres: string[];
  sharedKeywords: string[];
  sameCollection: { id: number; name: string } | null;
  sameLanguage: boolean;
  sameCountry: boolean;
  cinematographerA: string | null;
  cinematographerB: string | null;
  sameCinematographer: boolean;
  composerA: string | null;
  composerB: string | null;
  sameComposer: boolean;
  editorA: string | null;
  editorB: string | null;
  yearGap: number;
  runtimeGapMinutes: number;
  longer: "a" | "b" | "tie";
  ratingWinner: "a" | "b" | "tie";
  ratingGap: number;
};

function crewMember(m: MovieDetail, job: string): string | null {
  return m.crew.find((c) => c.role === job)?.name ?? null;
}

function intersectPeople(a: PersonCard[], b: PersonCard[]): SharedPerson[] {
  const byId = new Map(b.map((p) => [p.id, p]));
  const out: SharedPerson[] = [];
  for (const p of a) {
    const match = byId.get(p.id);
    if (!match) continue;
    out.push({
      id: p.id,
      name: p.name,
      profile: p.profile ?? match.profile ?? null,
      roleA: p.character || p.role,
      roleB: match.character || match.role,
    });
  }
  return out;
}

function intersectStrings(a: string[], b: string[]): string[] {
  const norm = new Set(b.map((s) => s.toLowerCase()));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of a) {
    const key = s.toLowerCase();
    if (norm.has(key) && !seen.has(key)) {
      seen.add(key);
      out.push(s);
    }
  }
  return out;
}

export function buildComparison(a: MovieDetail, b: MovieDetail): Comparison {
  const cinematographerA = crewMember(a, "Director of Photography");
  const cinematographerB = crewMember(b, "Director of Photography");
  const composerA = crewMember(a, "Original Music Composer");
  const composerB = crewMember(b, "Original Music Composer");

  const yearA = Number(a.year) || 0;
  const yearB = Number(b.year) || 0;
  const runtimeA = a.runtime ?? 0;
  const runtimeB = b.runtime ?? 0;

  return {
    sameDirector: Boolean(a.directorId && a.directorId === b.directorId),
    sharedCast: intersectPeople(a.cast, b.cast),
    sharedCrew: intersectPeople(a.crew, b.crew),
    sharedWriters: intersectStrings(a.writers, b.writers),
    sharedGenres: intersectStrings(a.genres, b.genres),
    sharedKeywords: intersectStrings(a.keywords, b.keywords),
    sameCollection:
      a.collection && b.collection && a.collection.id === b.collection.id
        ? { id: a.collection.id, name: a.collection.name }
        : null,
    sameLanguage: Boolean(a.language && a.language === b.language),
    sameCountry: Boolean(a.countries[0] && a.countries[0] === b.countries[0]),
    cinematographerA,
    cinematographerB,
    sameCinematographer: Boolean(
      cinematographerA && cinematographerB && cinematographerA === cinematographerB,
    ),
    composerA,
    composerB,
    sameComposer: Boolean(composerA && composerB && composerA === composerB),
    editorA: crewMember(a, "Editor"),
    editorB: crewMember(b, "Editor"),
    yearGap: Math.abs(yearA - yearB),
    runtimeGapMinutes: Math.abs(runtimeA - runtimeB),
    longer: runtimeA === runtimeB ? "tie" : runtimeA > runtimeB ? "a" : "b",
    ratingWinner: a.rating === b.rating ? "tie" : a.rating > b.rating ? "a" : "b",
    ratingGap: Math.abs(a.rating - b.rating),
  };
}
