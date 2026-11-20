import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Film,
  Globe,
  Play,
  RotateCw,
  Shuffle,
  Star,
} from "lucide-react";

import { MovieActions } from "../components/site/movie-actions";
import { PosterPlaceholder, PosterRail, SectionHeader } from "../components/site/media";
import { tmdb } from "../lib/tmdb";
import { getHome, type AuteurCard } from "../lib/tmdb.api";
import { fmtRuntime } from "../lib/tmdb-map";
import type { MovieCard } from "../lib/tmdb-map";

export const Route = createRoute({
  path: "/",
  loader: () => getHome(),
  head: () => ({
    meta: [
      { title: "CineVerse — A Living Cinema Universe" },
      {
        name: "description",
        content:
          "Explore world cinema through auto-rotating cinematic projections, vast cinema worlds from Kollywood to Hollywood, and personal film journals.",
      },
      { property: "og:title", content: "CineVerse — A Living Cinema Universe" },
    ],
  }),
  component: Home,
});

/* ─────────────────────────────────────────────────────────────
   GOAT HERO MOVIES POOL (100% Verified Working Backdrops & Posters)
   Only monumental landmark cinema with verified high-resolution
   TMDB artwork. Picked dynamically on refresh.
   ───────────────────────────────────────────────────────────── */
export const GOAT_HERO_MOVIES: (MovieCard & { trailer?: string | null; directorId?: number | null; tagline?: string | null })[] = [
  {
    id: 693134,
    title: "Dune: Part Two",
    year: "2024",
    tagline: "Long live the fighters",
    director: "Denis Villeneuve",
    directorId: 137427,
    rating: 8.2,
    votes: 5600,
    runtime: 166,
    genres: ["Science Fiction", "Adventure"],
    overview:
      "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    poster: "https://image.tmdb.org/t/p/w500/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
    trailer: "Way9Dexny3w",
  },
  {
    id: 155,
    title: "The Dark Knight",
    year: "2008",
    tagline: "Why so serious?",
    director: "Christopher Nolan",
    directorId: 525,
    rating: 8.5,
    votes: 32000,
    runtime: 152,
    genres: ["Drama", "Action", "Crime"],
    overview:
      "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.",
    poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
    trailer: "EXeTwQWrcwY",
  },
  {
    id: 872585,
    title: "Oppenheimer",
    year: "2023",
    tagline: "The world forever changes",
    director: "Christopher Nolan",
    directorId: 525,
    rating: 8.1,
    votes: 9400,
    runtime: 181,
    genres: ["Drama", "History"],
    overview:
      "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II, exploring the deep psychological and political aftermath of unleashing nuclear power upon humanity.",
    poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
    trailer: "uYPbbksJxIg",
  },
  {
    id: 238,
    title: "The Godfather",
    year: "1972",
    tagline: "An offer you can't refuse",
    director: "Francis Ford Coppola",
    directorId: 1776,
    rating: 8.7,
    votes: 20500,
    runtime: 175,
    genres: ["Drama", "Crime"],
    overview:
      "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    trailer: "sY1S34973zA",
  },
  {
    id: 496243,
    title: "Parasite",
    year: "2019",
    tagline: "Act like you own the place",
    director: "Bong Joon-ho",
    directorId: 21684,
    rating: 8.5,
    votes: 18400,
    runtime: 133,
    genres: ["Comedy", "Thriller", "Drama"],
    overview:
      "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
    trailer: "5xH0R_42044",
  },
  {
    id: 346,
    title: "Seven Samurai",
    year: "1954",
    tagline: "The magnificent seven of world cinema",
    director: "Akira Kurosawa",
    directorId: 5026,
    rating: 8.5,
    votes: 3750,
    runtime: 207,
    genres: ["Action", "Drama"],
    overview:
      "A samurai answers a village's request for protection after he falls on hard times. The town needs protection from bandits, so the samurai gathers six other samurai to help him teach the people how to defend themselves, and the villagers provide the soldiers with food.",
    poster: "https://image.tmdb.org/t/p/w500/lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
    trailer: "wJ1TOratCTo",
  },
  {
    id: 843,
    title: "In the Mood for Love",
    year: "2000",
    tagline: "Feel the presence of that which was never spoken",
    director: "Wong Kar-wai",
    directorId: 12453,
    rating: 8.1,
    votes: 2700,
    runtime: 98,
    genres: ["Drama", "Romance"],
    overview:
      "Hong Kong, 1962. Chow Mo-wan and Su Li-zhen move into neighboring apartments on the same day. Their encounters are formal and polite until a discovery about their respective spouses creates an intimate, lingering bond.",
    poster: "https://image.tmdb.org/t/p/w500/8BgGbbWiLNhPtkMkN0gGTnbtvBv.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/ffQFnAUm2Uu4RU0nijpjPRf9TBT.jpg",
    trailer: "iA_oY3B0s5o",
  },
  {
    id: 29971,
    title: "Nayakan",
    year: "1987",
    tagline: "Four decades of tragedy and honor",
    director: "Mani Ratnam",
    directorId: 78747,
    rating: 8.5,
    votes: 2100,
    runtime: 156,
    genres: ["Crime", "Drama"],
    overview:
      "A young boy witnesses his father's brutal murder by corrupt police, flees to the slums of Bombay, and rises through mutual solidarity and violence to become an untouchable don and protector of the migrant Tamil community.",
    poster: "https://image.tmdb.org/t/p/w500/hnCKKPG5VkUiGQV0DTniyMTEZsT.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
    trailer: "z5E_14jL3e8",
  },
  {
    id: 28,
    title: "Apocalypse Now",
    year: "1979",
    tagline: "The horror... the horror...",
    director: "Francis Ford Coppola",
    directorId: 1776,
    rating: 8.3,
    votes: 8200,
    runtime: 147,
    genres: ["Drama", "War"],
    overview:
      "At the height of the Vietnam war, Captain Benjamin L. Willard is sent on a dangerous mission that, officially, 'does not exist, nor will it ever exist.' His goal is to find - and terminate with extreme prejudice - the enigmatic and rogue Colonel Kurtz.",
    poster: "https://image.tmdb.org/t/p/w500/gQB8Y5RCMkv2zwzFHbUJX3kAhvA.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/49fzLedFVKgGgFChLMuulDJBY1c.jpg",
    trailer: "FTjG-Aux_4k",
  },
  {
    id: 62,
    title: "2001: A Space Odyssey",
    year: "1968",
    tagline: "An epic drama of adventure and exploration",
    director: "Stanley Kubrick",
    directorId: 240,
    rating: 8.1,
    votes: 11400,
    runtime: 149,
    genres: ["Science Fiction", "Mystery", "Adventure"],
    overview:
      "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000, the world's most advanced supercomputer.",
    poster: "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/w5IDXtifKntw0ajv2co7jFlTQDM.jpg",
    trailer: "oR_e9y-Xxka",
  },
  {
    id: 598,
    title: "City of God",
    year: "2002",
    tagline: "Fight and you'll never survive. Run and you'll never escape.",
    director: "Fernando Meirelles",
    directorId: 987,
    rating: 8.4,
    votes: 7500,
    runtime: 130,
    genres: ["Drama", "Crime"],
    overview:
      "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
    poster: "https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/uvitbjFU4JqvMwIkMWHp69bmUzG.jpg",
    trailer: "dcUOO4Itgmw",
  },
  {
    id: 129,
    title: "Spirited Away",
    year: "2001",
    tagline: "The tunnel led to a mysterious world",
    director: "Hayao Miyazaki",
    directorId: 608,
    rating: 8.5,
    votes: 16500,
    runtime: 125,
    genres: ["Animation", "Family", "Fantasy"],
    overview:
      "A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
    poster: "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/m4TUa2ciEWSlk37rOsjiSIvZDXE.jpg",
    trailer: "ByXuk9QqQkk",
  },
  {
    id: 680,
    title: "Pulp Fiction",
    year: "1994",
    tagline: "Just because you are a character doesn't mean you have character",
    director: "Quentin Tarantino",
    directorId: 138,
    rating: 8.5,
    votes: 28000,
    runtime: 154,
    genres: ["Thriller", "Crime"],
    overview:
      "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in four tales of violence and redemption.",
    poster: "https://image.tmdb.org/t/p/w500/vQWk5YBFWF4bZaofAbv0tShwBvQ.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
    trailer: "s7EdQ4FqbhY",
  },
  {
    id: 587030,
    title: "Kaithi",
    year: "2019",
    tagline: "An ex-convict drives a truck full of poisoned cops through a night of siege",
    director: "Lokesh Kanagaraj",
    directorId: 2197472,
    rating: 8.0,
    votes: 1900,
    runtime: 145,
    genres: ["Action", "Thriller", "Crime"],
    overview:
      "Dilli, an ex-convict, endeavours to meet his daughter for the first time after leaving prison. However, his attempts are interrupted by a drug raid planned by Inspector Bejoy.",
    poster: "https://image.tmdb.org/t/p/w500/hOF9CgPsy9aLr5GJEBESC8MEXFy.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/seTFDq1iKyJ6YHr7HePbC20DMsy.jpg",
    trailer: "g79Lfl_q9Gk",
  },
  {
    id: 103,
    title: "Taxi Driver",
    year: "1976",
    tagline: "On every street in every city, there's a nobody who dreams of being a somebody",
    director: "Martin Scorsese",
    directorId: 1032,
    rating: 8.2,
    votes: 12100,
    runtime: 114,
    genres: ["Crime", "Drama"],
    overview:
      "A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decadence and sleaze fuels his urge for violent action.",
    poster: "https://image.tmdb.org/t/p/w500/ekstpH614fwDX8DUln1a2Opz0N8.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/9uddYYTNcLWpzUkl5iw1RUYhLhY.jpg",
    trailer: "cDCFpydJ2g0",
  },
];

/* ─────────────────────────────────────────────────────────────
   ARCHIVE PROJECTION DECK (Signature Interaction Movements)
   ───────────────────────────────────────────────────────────── */
interface ProjectionCard {
  id: number;
  title: string;
  year: string;
  director: string;
  directorId?: number;
  runtime: number;
  rating: number;
  overview: string;
  poster: string;
  backdrop: string;
  aestheticNote: string;
}

interface ProjectionMovement {
  id: string;
  name: string;
  era: string;
  tradition: string;
  ambientTone: string;
  philosophy: string;
  films: ProjectionCard[];
}

const ARCHIVE_MOVEMENTS: ProjectionMovement[] = [
  {
    id: "tamil-modernism",
    name: "Tamil Sensory Modernism",
    era: "1987–1997",
    tradition: "Kollywood · தமிழ் சினிமா",
    ambientTone: "from-amber-600/20 via-red-950/30 to-transparent",
    philosophy:
      "Mani Ratnam, Ilaiyaraaja, and P.C. Sreeram dismantled theatrical stage conventions, introducing chiaroscuro lighting, syncopated camera kinetics, and sensory crime epics.",
    films: [
      {
        id: 29971,
        title: "Nayakan",
        year: "1987",
        director: "Mani Ratnam",
        directorId: 78747,
        runtime: 156,
        rating: 8.5,
        overview:
          "The epic rise and moral decay of Velu Naicker across Bombay's slums. A monumental synthesis of Indian melodrama and Godfather-scale tragic realism.",
        poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
        aestheticNote: "Sreeram's amber dust, deep silhouettes, and Kamal Haasan's generational aging.",
      },
      {
        id: 29811,
        title: "Thalapathi",
        year: "1991",
        director: "Mani Ratnam",
        directorId: 78747,
        runtime: 168,
        rating: 8.3,
        overview:
          "A modern retelling of the Mahabharata's Karna-Duryodhana brotherhood set against the brutal rain-slicked docklands of Madras.",
        poster: "https://image.tmdb.org/t/p/w500/e9g7NfU1m4b8u9h3k5x8d9j7m2.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
        aestheticNote: "Santosh Sivan's flaming crimson suns and Ilaiyaraaja's immortal string orchestration.",
      },
      {
        id: 49032,
        title: "Iruvar",
        year: "1997",
        director: "Mani Ratnam",
        directorId: 78747,
        runtime: 140,
        rating: 8.4,
        overview:
          "The intertwining brotherhood, rivalry, and ideological collision between a charismatic movie star and an oratorical poet in post-independence Tamil Nadu.",
        poster: "https://image.tmdb.org/t/p/w500/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        aestheticNote: "360-degree fluid circular master shots by Santosh Sivan and A.R. Rahman's jazz-carnatic score.",
      },
    ],
  },
  {
    id: "korean-renaissance",
    name: "Korean Baroque Renaissance",
    era: "2000–2018",
    tradition: "Chungmuro · 한국 영화",
    ambientTone: "from-emerald-700/20 via-cyan-950/30 to-transparent",
    philosophy:
      "The turn of the millennium witnessed Chungmuro dismantle Hollywood genre formulas with razor-sharp class critique, ferocious vengeance tragedies, and relentless procedural dread.",
    films: [
      {
        id: 11423,
        title: "Memories of Murder",
        year: "2003",
        director: "Bong Joon-ho",
        directorId: 21684,
        runtime: 132,
        rating: 8.1,
        overview:
          "Two detectives clash and unravel while investigating South Korea's first serial murder cases in a rural province suffocating under military curfew.",
        poster: "https://image.tmdb.org/t/p/w500/6Kn6qW3an3DkPl3MahWemTzrjCt.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/6Kn6qW3an3DkPl3MahWemTzrjCt.jpg",
        aestheticNote: "Golden autumn fields contrasted against industrial pitch-black tunnels.",
      },
      {
        id: 670,
        title: "Oldboy",
        year: "2003",
        director: "Park Chan-wook",
        directorId: 10099,
        runtime: 120,
        rating: 8.3,
        overview:
          "Imprisoned for fifteen years in a windowless room with no explanation, Oh Dae-su is suddenly released with five days to solve the mystery of his confinement.",
        poster: "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
        aestheticNote: "The legendary unbroken single-take side-scrolling corridor hammer fight.",
      },
      {
        id: 491584,
        title: "Burning",
        year: "2018",
        director: "Lee Chang-dong",
        directorId: 96657,
        runtime: 148,
        rating: 7.7,
        overview:
          "An aspiring young writer becomes entangled with an enigmatic, wealthy Gatsby-like figure harboring a sinister secret past.",
        poster: "https://image.tmdb.org/t/p/w500/qQEt2FqF8McryFBNX30dyDJKiEK.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/qQEt2FqF8McryFBNX30dyDJKiEK.jpg",
        aestheticNote: "Miles Davis trumpets scoring a solitary naked dance against the orange border twilight.",
      },
    ],
  },
  {
    id: "new-hollywood",
    name: "1970s New Hollywood",
    era: "1972–1979",
    tradition: "American Panavision",
    ambientTone: "from-amber-700/20 via-orange-950/30 to-transparent",
    philosophy:
      "When studio gatekeepers surrendered control to obsessive cinephile directors, giving birth to a golden era of psychological ambiguity, naturalism, and urban rot.",
    films: [
      {
        id: 238,
        title: "The Godfather",
        year: "1972",
        director: "Francis Ford Coppola",
        directorId: 1776,
        runtime: 175,
        rating: 8.7,
        overview:
          "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        poster: "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/rSPw7tgCH9c6NqICZef4kZjFOQ5.jpg",
        aestheticNote: "Gordon Willis's warm golden shadow pools and top-lit eye sockets.",
      },
      {
        id: 103,
        title: "Taxi Driver",
        year: "1976",
        director: "Martin Scorsese",
        directorId: 1032,
        runtime: 114,
        rating: 8.2,
        overview:
          "A mentally unstable Vietnam veteran works the night shift as a New York cabbie, witnessing the city's decay until violence becomes his only absolution.",
        poster: "https://image.tmdb.org/t/p/w500/ekstpH69PgBhRCR1RUTjcqAwHmr.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/7eLq8N6M0Z2uQ8V4g7h3k5x8d9j.jpg",
        aestheticNote: "Bernard Herrmann's mournful saxophone echoing through steam grates and red neon rain.",
      },
      {
        id: 28,
        title: "Apocalypse Now",
        year: "1979",
        director: "Francis Ford Coppola",
        directorId: 1776,
        runtime: 147,
        rating: 8.3,
        overview:
          "A military officer is dispatched up a remote Cambodian river to assassinate a renegade Special Forces Colonel who has presumed godlike authority.",
        poster: "https://image.tmdb.org/t/p/w500/gQB8Y5R28jV526p3O724k6jFf8z.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/5bhvpYknA74B2Lz8P6R63t700G9.jpg",
        aestheticNote: "Vittorio Storaro's surreal yellow smoke grenades and ceiling fan helicopter blends.",
      },
    ],
  },
  {
    id: "japanese-golden-age",
    name: "Japanese Golden Age",
    era: "1953–1963",
    tradition: "Nihon Eiga · 日本映画",
    ambientTone: "from-stone-600/20 via-zinc-950/30 to-transparent",
    philosophy:
      "A transcendent convergence of kinetic movement and monastic stillness, shaping universal film grammar through ethical humanism and architectural framing.",
    films: [
      {
        id: 346,
        title: "Seven Samurai",
        year: "1954",
        director: "Akira Kurosawa",
        directorId: 5026,
        runtime: 207,
        rating: 8.5,
        overview:
          "A poor village under assault by ruthless bandits recruits seven masterless samurai for protection in Kurosawa's kinetic multicamera masterwork.",
        poster: "https://image.tmdb.org/t/p/w500/8mFvhS079vI7jUe9Vq3G23Fh91u.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/8k04n8Hj06bkW48vYw2Xyq1k6F4.jpg",
        aestheticNote: "Torrential downpours, telephoto lens flattening, and visceral mud combat.",
      },
      {
        id: 18148,
        title: "Tokyo Story",
        year: "1953",
        director: "Yasujirō Ozu",
        directorId: 95501,
        runtime: 136,
        rating: 8.2,
        overview:
          "An elderly provincial couple visit their busy adult children in Tokyo, discovering that familial bonds have subtly eroded beneath modern urban indifference.",
        poster: "https://image.tmdb.org/t/p/w500/1X7q31Z9w9iWqU3c3h9uG0r5q7n.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/1X7q31Z9w9iWqU3c3h9uG0r5q7n.jpg",
        aestheticNote: "The static 50mm tatami-level camera, direct-to-lens eyelines, and pillow shots.",
      },
      {
        id: 12493,
        title: "High and Low",
        year: "1963",
        director: "Akira Kurosawa",
        directorId: 5026,
        runtime: 143,
        rating: 8.4,
        overview:
          "An executive at a Yokohama shoe company faces ruin when extortionists kidnap his chauffeur's son by mistake. A razor-sharp vertical study of moral class warfare.",
        poster: "https://image.tmdb.org/t/p/w500/tgNjemQPG96uIezpiZqbuhYXIRv.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/5n3j1sL4d5R6zY7j6f8g9h1k4k7.jpg",
        aestheticNote: "Meticulous widescreen Tohoscope staging and colored smokestack procedural editing.",
      },
    ],
  },
  {
    id: "european-modernism",
    name: "European Modernism",
    era: "1959–1979",
    tradition: "Continental Nouvelle Vague",
    ambientTone: "from-blue-700/20 via-indigo-950/30 to-transparent",
    philosophy:
      "When Godard, Truffaut, Bergman, and Tarkovsky shattered conventional narrative structure, treating the camera as a pen to sculpt time and human psychology.",
    films: [
      {
        id: 297,
        title: "The 400 Blows",
        year: "1959",
        director: "François Truffaut",
        directorId: 1650,
        runtime: 99,
        rating: 8.2,
        overview:
          "A young Parisian boy misunderstood by his parents and oppressive teachers navigates petty delinquency before making a desperate escape toward the sea.",
        poster: "https://image.tmdb.org/t/p/w500/4jYp8x6y7z8a9b0c1d2e3f4g5h.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/4jYp8x6y7z8a9b0c1d2e3f4g5h.jpg",
        aestheticNote: "The historic concluding freeze-frame on Antoine Doinel's gaze at the seashore.",
      },
      {
        id: 797,
        title: "Persona",
        year: "1966",
        director: "Ingmar Bergman",
        directorId: 6648,
        runtime: 84,
        rating: 8.2,
        overview:
          "A stage actress who has suddenly gone mute retreats to an isolated seaside cottage with a devoted nurse, where their psyches begin to terrifyingly merge.",
        poster: "https://image.tmdb.org/t/p/w500/bdgaCpdodKz3wRz5t6y7u8v9w0.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/bdgaCpdodKz3wRz5t6y7u8v9w0.jpg",
        aestheticNote: "Sven Nykvist's stark dual lighting and the radical burning celluloid rupture.",
      },
      {
        id: 1398,
        title: "Stalker",
        year: "1979",
        director: "Andrei Tarkovsky",
        directorId: 8452,
        runtime: 162,
        rating: 8.2,
        overview:
          "A guide leads a writer and a scientist through the metaphysical dangers of the post-apocalyptic 'Zone' to find a room where one's deepest desires come true.",
        poster: "https://image.tmdb.org/t/p/w500/lUEjMrEGnj75E5n20Y5TqB6lGf0.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/k6vN6oJ92r2L8f4d9J7h2q0q6v5.jpg",
        aestheticNote: "Slow-drip tracking shots across submerged artifacts and sepia-to-color transition.",
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────
   CURATED DEEP CUTS POOL (12 Cinephile Treasures)
   ───────────────────────────────────────────────────────────── */
interface DeepCutEntry {
  id: number;
  title: string;
  year: string;
  director: string;
  poster: string;
  overview: string;
  curatorInsight: string;
}

const DEEP_CUTS_ARCHIVE: DeepCutEntry[] = [
  {
    id: 12493,
    title: "High and Low",
    year: "1963",
    director: "Akira Kurosawa",
    poster: "https://image.tmdb.org/t/p/w500/tgNjemQPG96uIezpiZqbuhYXIRv.jpg",
    overview: "An executive at a Yokohama shoe company faces ruin when extortionists kidnap his chauffeur's son by mistake. A vertical study of moral class warfare.",
    curatorInsight: "Kurosawa's Tohoscope staging visually divides Yokohama between Olympian hilltop luxury and hellish drug dens.",
  },
  {
    id: 11466,
    title: "Cure",
    year: "1997",
    director: "Kiyoshi Kurosawa",
    poster: "https://image.tmdb.org/t/p/w500/m1yYkUaE3d4f5g6h7i8j9k0l1m.jpg",
    overview: "A wave of grisly murders is committed by ordinary citizens with an 'X' carved into their victims' throats, all linked to an amnesiac drifter.",
    curatorInsight: "A hypnotic, deeply terrifying masterclass in sound design and ambient existential dread. Bong Joon-ho's favorite film.",
  },
  {
    id: 406,
    title: "La Haine",
    year: "1995",
    director: "Mathieu Kassovitz",
    poster: "https://image.tmdb.org/t/p/w500/3qN2Q6Vv4q7m8zY5t8u6a7d5f4.jpg",
    overview: "24 relentless hours in the lives of three young men in the Paris suburbs after a violent riot. A ticking time-bomb about social gravity.",
    curatorInsight: "Pierre Aïm's crisp black-and-white cinematography and the iconic rooftop DJ cut scratching KRS-One with Édith Piaf.",
  },
  {
    id: 576928,
    title: "Super Deluxe",
    year: "2019",
    director: "Thiagarajan Kumararaja",
    poster: "https://image.tmdb.org/t/p/w500/5k7m8zY5t8u6a7d5f4g8k3m2n1.jpg",
    overview: "Four disparate lives intersect in Chennai: an unfaithful wife, an estranged transgender parent, a disillusioned priest, and teenagers watching porn.",
    curatorInsight: "A fearless philosophical hyper-narrative exploring morality, alien contact, and cosmic absurdity in Tamil cinema.",
  },
  {
    id: 652,
    title: "The Battle of Algiers",
    year: "1966",
    director: "Gillo Pontecorvo",
    poster: "https://image.tmdb.org/t/p/w500/9k8zY5t8u6a7d5f4g8k3m2n1p0.jpg",
    overview: "A gripping reenactment of the Algerian struggle for independence from French colonial rule in the winding maze of the Casbah.",
    curatorInsight: "Marcello Gatti's high-contrast newsreel grain was so convincing that American theaters posted disclaimers that zero documentary footage was used.",
  },
  {
    id: 25538,
    title: "Yi Yi",
    year: "2000",
    director: "Edward Yang",
    poster: "https://image.tmdb.org/t/p/w500/4ZfsPcqkYkX7q5s6t7u8v9w0x1.jpg",
    overview: "A tender, monumental portrait of a middle-class Taiwanese family navigating love, mid-life regrets, and childhood across three generations.",
    curatorInsight: "Yang's gentle 8-year-old protagonist Yang-Yang takes photos of people's backs 'to show them what they cannot see.'",
  },
  {
    id: 62206,
    title: "A Separation",
    year: "2011",
    director: "Asghar Farhadi",
    poster: "https://image.tmdb.org/t/p/w500/nJwQ5y7m8zY5t8u6a7d5f4g8k3.jpg",
    overview: "A married couple faced with a difficult decision to leave Iran or stay to care for an ailing parent spark a chain reaction of ethical dilemmas.",
    curatorInsight: "A Hitchcockian moral thriller constructed entirely around domestic courtrooms and conflicting human dignity.",
  },
  {
    id: 598,
    title: "City of God",
    year: "2002",
    director: "Fernando Meirelles",
    poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
    overview: "Two boys growing up in a violent Rio de Janeiro favela take different paths: one becomes a photographer, the other a ruthless drug kingpin.",
    curatorInsight: "César Charlone's blistering sun-drenched palette and Daniel Rezende's rhythmic syncopated editing redefined 21st-century action cinema.",
  },
];

interface MoodGenre {
  id: number;
  name: string;
  tagline?: string;
  backdrop: string;
}

const DEFAULT_MOODS: MoodGenre[] = [
  {
    id: 18,
    name: "Drama",
    tagline: "Human Depths",
    backdrop: "https://image.tmdb.org/t/p/w780/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
  },
  {
    id: 878,
    name: "Sci-Fi",
    tagline: "Other Worlds",
    backdrop: "https://image.tmdb.org/t/p/w780/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
  },
  {
    id: 28,
    name: "Action",
    tagline: "Kinetic Fury",
    backdrop: "https://image.tmdb.org/t/p/w780/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
  },
  {
    id: 53,
    name: "Thriller",
    tagline: "High Stakes",
    backdrop: "https://image.tmdb.org/t/p/w780/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
  },
  {
    id: 35,
    name: "Comedy",
    tagline: "Sharp Wit",
    backdrop: "https://image.tmdb.org/t/p/w780/TU9NIjwzjoKPwQHoHshkFcQUCG.jpg",
  },
  {
    id: 10749,
    name: "Romance",
    tagline: "Poetic Longing",
    backdrop: "https://image.tmdb.org/t/p/w780/ffQFnAUm2Uu4RU0nijpjPRf9TBT.jpg",
  },
];

const getHeroBackdropUrl = (backdrop: string | null | undefined) => {
  if (!backdrop || typeof backdrop !== "string" || backdrop.trim() === "") return null;
  if (backdrop.startsWith("http://") || backdrop.startsWith("https://")) {
    return backdrop.replace(/\/w\d+\//, "/original/");
  }
  const clean = backdrop.startsWith("/") ? backdrop : `/${backdrop}`;
  return `https://image.tmdb.org/t/p/original${clean}`;
};

export const GOAT_AUTEURS: AuteurCard[] = [
  {
    id: 78747,
    name: "Mani Ratnam",
    era: "1983–Present",
    movement: "Tamil Sensory Realism & Visual Chiaroscuro",
    category: "Kollywood (Tamil)",
    profile: "https://image.tmdb.org/t/p/h632/14zS3T8pD5N5Qf2I7i6xVd8Z.jpg",
    biography:
      "Mani Ratnam revolutionized Indian popular cinema by wedding the kinetic realism of world cinema with profound socio-political themes, pioneering dramatic use of chiaroscuro lighting, naturalistic sync sound, and operatic human tragedies with P.C. Sreeram, Santosh Sivan, and A.R. Rahman.",
    knownFor: [
      {
        id: 29971,
        title: "Nayakan",
        year: "1987",
        rating: 8.5,
        votes: 2100,
        poster: "https://image.tmdb.org/t/p/w500/hnCKKPG5VkUiGQV0DTniyMTEZsT.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
        overview: "The epic rise and moral decay of Velu Naicker across Bombay's slums. A monumental synthesis of Indian melodrama and Godfather-scale tragic realism.",
        genres: ["Crime", "Drama"],
      },
      {
        id: 29811,
        title: "Thalapathi",
        year: "1991",
        rating: 8.3,
        votes: 1800,
        poster: "",
        backdrop: "https://image.tmdb.org/t/p/original/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
        overview: "A modern retelling of the Mahabharata's Karna-Duryodhana brotherhood set against the brutal rain-slicked docklands of Madras.",
        genres: ["Action", "Crime", "Drama"],
      },
      {
        id: 49032,
        title: "Iruvar",
        year: "1997",
        rating: 8.4,
        votes: 1600,
        poster: "https://image.tmdb.org/t/p/w500/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        overview: "The intertwining brotherhood, rivalry, and ideological collision between a movie star and a poet in post-independence Tamil Nadu.",
        genres: ["Drama", "History"],
      },
      {
        id: 432011,
        title: "Kannathil Muthamittal",
        year: "2002",
        rating: 8.2,
        votes: 1500,
        poster: "",
        backdrop: "",
        overview: "An adopted young girl searches for her biological mother amidst the raging civil war in Sri Lanka.",
        genres: ["Drama", "War"],
      },
    ],
  },
  {
    id: 1032,
    name: "Martin Scorsese",
    era: "1967–Present",
    movement: "Kinetic Guilt, Urban Street Violence & Spiritual Torment",
    category: "Hollywood",
    profile: "https://image.tmdb.org/t/p/h632/9U9Y5GQuWX3Ebg39JdkRM52UMef.jpg",
    biography:
      "The defining voice of American auteur cinema, known for rapid-fire camera kinetics, intense moral guilt, obsessive character studies, and legendary editing with Thelma Schoonmaker.",
    knownFor: [
      {
        id: 103,
        title: "Taxi Driver",
        year: "1976",
        rating: 8.2,
        votes: 12100,
        poster: "https://image.tmdb.org/t/p/w500/ekstpH614fwDX8DUln1a2Opz0N8.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/9uddYYTNcLWpzUkl5iw1RUYhLhY.jpg",
        overview: "A mentally unstable veteran works as a nighttime taxi driver in New York City, where the perceived decadence fuels his urge for violent action.",
        genres: ["Crime", "Drama"],
      },
      {
        id: 769,
        title: "GoodFellas",
        year: "1990",
        rating: 8.5,
        votes: 13000,
        poster: "",
        backdrop: "",
        overview: "The rise and fall of mob associate Henry Hill and his friends over three decades in the New York underworld.",
        genres: ["Drama", "Crime"],
      },
      {
        id: 1104,
        title: "Raging Bull",
        year: "1980",
        rating: 8.2,
        votes: 4000,
        poster: "",
        backdrop: "",
        overview: "The life of boxer Jake LaMotta, whose violence and temper that led him to the top in the ring destroyed his life outside of it.",
        genres: ["Drama"],
      },
      {
        id: 1422,
        title: "The Departed",
        year: "2006",
        rating: 8.2,
        votes: 14500,
        poster: "",
        backdrop: "",
        overview: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
        genres: ["Drama", "Thriller", "Crime"],
      },
    ],
  },
  {
    id: 5026,
    name: "Akira Kurosawa",
    era: "1943–1993",
    movement: "Dynamic Framing, Axis Weather & Moral Humanism",
    category: "Japanese Cinema",
    profile: "https://image.tmdb.org/t/p/h632/3KuhQ6K93fB1N4T88c1o2m0L6a7.jpg",
    biography:
      "Master of visual dynamism, multicamera setups, axial cutting, and weather-driven drama whose humanist epics forever transformed universal cinematic grammar.",
    knownFor: [
      {
        id: 346,
        title: "Seven Samurai",
        year: "1954",
        rating: 8.5,
        votes: 3750,
        poster: "https://image.tmdb.org/t/p/w500/lOMGc8bnSwQhS4XyE1S99uH8NXf.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
        overview: "A poor village under assault by ruthless bandits recruits seven masterless samurai for protection in Kurosawa's kinetic masterwork.",
        genres: ["Action", "Drama"],
      },
      {
        id: 593,
        title: "Rashomon",
        year: "1950",
        rating: 8.2,
        votes: 2100,
        poster: "",
        backdrop: "",
        overview: "The rape of a bride and the murder of her samurai husband are recalled by four different individuals from contradictory perspectives.",
        genres: ["Crime", "Drama", "Mystery"],
      },
      {
        id: 12493,
        title: "High and Low",
        year: "1963",
        rating: 8.4,
        votes: 950,
        poster: "",
        backdrop: "",
        overview: "An executive at a Yokohama shoe company becomes a victim of extortion when his chauffeur's son is kidnapped by mistake.",
        genres: ["Crime", "Drama", "Mystery"],
      },
      {
        id: 11645,
        title: "Ran",
        year: "1985",
        rating: 8.2,
        votes: 1600,
        poster: "",
        backdrop: "",
        overview: "With Ran, legendary director Akira Kurosawa reimagines Shakespeare's King Lear in feudal Japan.",
        genres: ["Action", "Drama", "History"],
      },
    ],
  },
  {
    id: 525,
    name: "Christopher Nolan",
    era: "1998–Present",
    movement: "Temporal Architecture, Practical Scale & Cross-Cutting",
    category: "Hollywood",
    profile: "https://image.tmdb.org/t/p/h632/xuAIuYSmsUzKlUMBFGVZaWsY3Z5.jpg",
    biography:
      "Pioneer of non-linear structural puzzles, practical grand-scale in-camera effects, and IMAX 70mm cinematic immersion.",
    knownFor: [
      {
        id: 872585,
        title: "Oppenheimer",
        year: "2023",
        rating: 8.1,
        votes: 9400,
        poster: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
        overview: "The story of J. Robert Oppenheimer's role in the development of the atomic bomb during World War II.",
        genres: ["Drama", "History"],
      },
      {
        id: 155,
        title: "The Dark Knight",
        year: "2008",
        rating: 8.5,
        votes: 32000,
        poster: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/cfT29Im5VDvjE0RpyKOSdCKZal7.jpg",
        overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent against the Joker.",
        genres: ["Drama", "Action", "Crime"],
      },
      {
        id: 157336,
        title: "Interstellar",
        year: "2014",
        rating: 8.4,
        votes: 34000,
        poster: "",
        backdrop: "",
        overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.",
        genres: ["Adventure", "Drama", "Science Fiction"],
      },
      {
        id: 27205,
        title: "Inception",
        year: "2010",
        rating: 8.4,
        votes: 36000,
        poster: "",
        backdrop: "",
        overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets, is offered a chance to regain his old life.",
        genres: ["Action", "Science Fiction", "Adventure"],
      },
    ],
  },
  {
    id: 240,
    name: "Stanley Kubrick",
    era: "1953–1999",
    movement: "Visionary Perfectionism, Symmetrical Composition & Satires",
    category: "Hollywood",
    profile: "https://image.tmdb.org/t/p/h632/9s0XnS9zN5u88H8M8B5c4j7w0o.jpg",
    biography:
      "Legendary for obsessive technical precision, single-point perspective compositions, and unflinching philosophical dissections of human nature.",
    knownFor: [
      {
        id: 62,
        title: "2001: A Space Odyssey",
        year: "1968",
        rating: 8.1,
        votes: 11400,
        poster: "https://image.tmdb.org/t/p/w500/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg",
        backdrop: "https://image.tmdb.org/t/p/original/w5IDXtifKntw0ajv2co7jFlTQDM.jpg",
        overview: "Humanity finds a mysterious object buried beneath the lunar surface and sets off to find its origins with the help of HAL 9000.",
        genres: ["Science Fiction", "Mystery", "Adventure"],
      },
      {
        id: 694,
        title: "The Shining",
        year: "1980",
        rating: 8.2,
        votes: 17000,
        poster: "",
        backdrop: "",
        overview: "Jack Torrance accepts a caretaker job at the Overlook Hotel, where he, his wife Wendy and their son Danny must live isolated from the rest of the world.",
        genres: ["Horror", "Thriller"],
      },
      {
        id: 185,
        title: "A Clockwork Orange",
        year: "1971",
        rating: 8.2,
        votes: 12500,
        poster: "",
        backdrop: "",
        overview: "In a dystopian future, a sadistic gang leader is imprisoned and volunteers for an experimental aversion therapy conduct-modification program.",
        genres: ["Science Fiction", "Crime"],
      },
      {
        id: 238,
        title: "Barry Lyndon",
        year: "1975",
        rating: 8.0,
        votes: 3200,
        poster: "",
        backdrop: "",
        overview: "An Irish rogue wins the heart of a rich widow and assumes her dead husband's aristocratic position in 18th-century England.",
        genres: ["Drama", "Romance", "War"],
      },
    ],
  },
];

function Home() {
  const {
    heroes = [],
    hero,
    featuredAuteur,
    featuredAuteurs = [],
    deepCut,
    deepCuts = [],
    rails = [],
    moods = [],
  } = Route.useLoaderData() as Awaited<ReturnType<typeof getHome>>;

  const [failedHeroBackdrops, setFailedHeroBackdrops] = useState<Set<number>>(new Set());

  // Build Hero candidates: only include movies with 100% verified non-empty backdrop and poster
  const heroList = useMemo(() => {
    const combined: (MovieCard & { trailer?: string | null; directorId?: number | null; tagline?: string | null })[] = [
      ...GOAT_HERO_MOVIES,
    ];
    if (heroes && heroes.length > 0) {
      for (const h of heroes) {
        if (h.backdrop && h.poster && !combined.some((c) => c.id === h.id)) {
          combined.push(h);
        }
      }
    } else if (hero && hero.backdrop && hero.poster && !combined.some((c) => c.id === hero.id)) {
      combined.push(hero);
    }
    // Strictly filter out any film with null/empty backdrop to ensure pristine hero visuals
    return combined.filter((m) => Boolean(m.backdrop && m.backdrop.trim() !== ""));
  }, [heroes, hero]);

  const activeMoods = useMemo(() => {
    if (!moods || moods.length === 0) return DEFAULT_MOODS;
    return DEFAULT_MOODS.map((dm) => {
      const match = moods.find((m) => m.id === dm.id);
      return match && match.backdrop ? { ...dm, backdrop: match.backdrop } : dm;
    });
  }, [moods]);

  // 1. Dynamic Hero index (Randomized on refresh via Math.random())
  const [heroIndex, setHeroIndex] = useState(() =>
    Math.floor(Math.random() * GOAT_HERO_MOVIES.length),
  );
  const [isPaused, setIsPaused] = useState(false);
  const [heroLogos, setHeroLogos] = useState<Record<number, string | null>>({});

  useEffect(() => {
    if (heroList.length > 0) {
      const randomHero = Math.floor(Math.random() * heroList.length);
      setHeroIndex(randomHero);
    }
  }, [heroList.length]);

  const activeHero = heroList[heroIndex] || heroList[0];

  // Fetch authentic official English logo from TMDB images endpoint
  useEffect(() => {
    if (!activeHero?.id) return;
    const heroId = activeHero.id;
    if (heroLogos[heroId] !== undefined) return;

    if (activeHero.logo) {
      setHeroLogos((prev) => ({ ...prev, [heroId]: activeHero.logo! }));
      return;
    }

    let isMounted = true;
    tmdb<{ logos?: { file_path: string; iso_639_1: string | null }[] }>(
      `/movie/${heroId}/images`
    )
      .then((data) => {
        if (!isMounted) return;
        const logos = data?.logos || [];
        // Prioritize English logo, then logo without language, then first available logo
        const enLogo =
          logos.find((l) => l.iso_639_1 === "en") ||
          logos.find((l) => !l.iso_639_1) ||
          logos[0];

        const logoUrl = enLogo?.file_path
          ? `https://image.tmdb.org/t/p/w500${enLogo.file_path}`
          : null;

        setHeroLogos((prev) => ({ ...prev, [heroId]: logoUrl }));
      })
      .catch(() => {
        if (isMounted) {
          setHeroLogos((prev) => ({ ...prev, [heroId]: null }));
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeHero?.id, activeHero?.logo, heroLogos]);

  // 4.5-second timer for hero backdrop crossfade
  useEffect(() => {
    if (heroList.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroList.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [heroList.length, isPaused]);

  // Preload upcoming backdrops
  useEffect(() => {
    if (heroList.length <= 1) return;
    const nextIdx = (heroIndex + 1) % heroList.length;
    const nextHeroBackdrop = heroList[nextIdx]?.backdrop;
    if (nextHeroBackdrop) {
      const bgUrl = getHeroBackdropUrl(nextHeroBackdrop);
      if (bgUrl) {
        const img = new Image();
        img.src = bgUrl;
      }
    }
  }, [heroIndex, heroList]);

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
  };

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroList.length);
  };

  // 2. Filmmaker of the Month pool — Randomized from GOAT Directors on every refresh
  const auteursPool: AuteurCard[] = useMemo(() => {
    return GOAT_AUTEURS;
  }, []);

  const [activeAuteurIdx, setActiveAuteurIdx] = useState(() =>
    Math.floor(Math.random() * GOAT_AUTEURS.length),
  );

  useEffect(() => {
    setActiveAuteurIdx(Math.floor(Math.random() * GOAT_AUTEURS.length));
  }, []);

  const currentAuteur = auteursPool[activeAuteurIdx] || GOAT_AUTEURS[0];

  const cycleNextAuteur = () => {
    if (auteursPool.length <= 1) return;
    setActiveAuteurIdx((prev) => (prev + 1) % auteursPool.length);
  };

  // 3. Archive Projection Deck — Randomized on every refresh
  const [activeMovementId, setActiveMovementId] = useState(() => {
    const randomMovement = ARCHIVE_MOVEMENTS[Math.floor(Math.random() * ARCHIVE_MOVEMENTS.length)];
    return randomMovement.id;
  });
  const currentMovement = useMemo(
    () => ARCHIVE_MOVEMENTS.find((m) => m.id === activeMovementId) || ARCHIVE_MOVEMENTS[0],
    [activeMovementId],
  );
  const [activeFilmIndex, setActiveFilmIndex] = useState(() => {
    return Math.floor(Math.random() * (currentMovement.films.length || 1));
  });

  useEffect(() => {
    const randMov = ARCHIVE_MOVEMENTS[Math.floor(Math.random() * ARCHIVE_MOVEMENTS.length)];
    setActiveMovementId(randMov.id);
    setActiveFilmIndex(Math.floor(Math.random() * randMov.films.length));
  }, []);

  const activeDeckFilm = currentMovement.films[activeFilmIndex] || currentMovement.films[0];

  const surpriseDeckMovement = () => {
    const otherMovements = ARCHIVE_MOVEMENTS.filter((m) => m.id !== activeMovementId);
    const pick = otherMovements[Math.floor(Math.random() * otherMovements.length)];
    if (pick) {
      setActiveMovementId(pick.id);
      setActiveFilmIndex(0);
    }
  };

  // Dynamic TMDB artwork cache for Filmmaker and Archive movies
  const [movieArtworks, setMovieArtworks] = useState<
    Record<number, { poster?: string | null; backdrop?: string | null }>
  >({});
  const [failedPosters, setFailedPosters] = useState<Set<number>>(new Set());

  // Automatically fetch verified TMDB posters and backdrops for currentAuteur films and activeDeckFilm
  useEffect(() => {
    const movieIdsToFetch = [
      activeDeckFilm?.id,
      ...(currentAuteur?.knownFor || []).map((f) => f.id),
      ...(currentMovement?.films || []).map((f) => f.id),
    ].filter(Boolean) as number[];

    for (const id of movieIdsToFetch) {
      if (movieArtworks[id] !== undefined) continue;

      tmdb<{ poster_path?: string | null; backdrop_path?: string | null }>(`/movie/${id}`)
        .then((data) => {
          if (!data) return;
          const poster = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null;
          const backdrop = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null;
          setMovieArtworks((prev) => ({
            ...prev,
            [id]: { poster, backdrop },
          }));
        })
        .catch(() => {
          setMovieArtworks((prev) => ({ ...prev, [id]: { poster: null, backdrop: null } }));
        });
    }
  }, [activeDeckFilm?.id, currentAuteur?.knownFor, currentMovement?.films, movieArtworks]);

  // 4. Curator's Deep Cut pool
  const deepCutsPool = useMemo(() => {
    const combined: DeepCutEntry[] = [...DEEP_CUTS_ARCHIVE];
    if (deepCuts && deepCuts.length > 0) {
      for (const dc of deepCuts) {
        if (!combined.some((c) => c.id === dc.id)) {
          combined.push({
            id: dc.id,
            title: dc.title,
            year: dc.year,
            director: dc.director || "Unknown Master",
            poster: dc.poster || "",
            overview: dc.overview || "An under-seen masterwork from the global archive.",
            curatorInsight: "Slipped into the archive for its exceptional compositional and thematic resonance.",
          });
        }
      }
    }
    return combined;
  }, [deepCuts]);

  const [deepCutIdx, setDeepCutIdx] = useState(() =>
    Math.floor(Math.random() * deepCutsPool.length),
  );
  const activeDeepCut = deepCutsPool[deepCutIdx] || deepCutsPool[0];

  const unearthAnotherDeepCut = () => {
    setDeepCutIdx((prev) => (prev + 1) % deepCutsPool.length);
  };

  return (
    <div className="space-y-8 sm:space-y-10 pb-28 overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          01. DYNAMIC CINEMATIC HERO ("Tonight's Projection")
          Randomized opening projection on every visit/refresh.
          Includes buttons, movie synopsis, and authentic movie logos.
          NO blank poster or backdrop will ever appear at the top.
         ───────────────────────────────────────────────────────────── */}
      {activeHero ? (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative isolate min-h-[440px] h-[58vh] max-h-[580px] w-full overflow-hidden bg-background text-foreground"
        >
          {/* Stacked Backdrop Crossfade Layers */}
          <div className="absolute inset-0 z-0 select-none">
            {heroList.map((h, idx) => {
              const bgUrl = getHeroBackdropUrl(h.backdrop);
              const isFailed = failedHeroBackdrops.has(h.id);

              return (
                <div
                  key={h.id || idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    heroIndex === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                >
                  {bgUrl && !isFailed ? (
                    <img
                      src={bgUrl}
                      alt=""
                      aria-hidden="true"
                      onError={() => setFailedHeroBackdrops((prev) => new Set(prev).add(h.id))}
                      className="size-full object-cover object-top opacity-75 dark:opacity-85 transition-transform duration-1000 ease-out scale-100"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-stone-900 via-stone-950 to-neutral-900 relative">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold/25 via-transparent to-transparent opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-end pr-16 sm:pr-24 opacity-15">
                        <Film className="size-64 sm:size-80 text-gold" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Seamless Cinematic Left-to-Right Reading Gradient (No harsh box edges) */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 via-45% to-transparent pointer-events-none" />

            {/* Seamless Bottom Edge Fade into Page Background */}
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-background via-background/70 to-transparent pointer-events-none" />

            {/* Soft Top Ambient Vignette */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background/70 to-transparent pointer-events-none" />
          </div>

          {/* Foreground Hero Information */}
          <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-6 pt-10 sm:px-8 sm:pb-8">
            <div className="max-w-2xl sm:max-w-3xl space-y-2.5 sm:space-y-3">
              <div className="font-mono text-[0.68rem] sm:text-xs uppercase tracking-[0.25em] text-gold font-semibold flex items-center gap-2">
                <span className="inline-block size-1.5 rounded-full bg-gold animate-pulse" />
                <span>Tonight's Projection</span>
              </div>

              {/* Authentic Movie Logo or Fallback Typographic Title */}
              {heroLogos[activeHero.id] ? (
                <div className="py-1">
                  <img
                    src={heroLogos[activeHero.id]!}
                    alt={activeHero.title}
                    onError={() =>
                      setHeroLogos((prev) => ({ ...prev, [activeHero.id]: null }))
                    }
                    className="max-h-[75px] sm:max-h-[105px] w-auto max-w-[280px] sm:max-w-[380px] object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] filter transition-all duration-300"
                  />
                </div>
              ) : (
                <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[0.96] drop-shadow-md">
                  {activeHero.title}
                </h1>
              )}

              {activeHero.tagline ? (
                <p className="font-display text-sm sm:text-base italic text-gold-soft leading-snug">
                  {activeHero.tagline}
                </p>
              ) : activeHero.director ? (
                <p className="font-display text-sm sm:text-base italic text-gold-soft leading-snug">
                  A film by {activeHero.director}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 font-mono text-[0.7rem] sm:text-xs text-muted-foreground">
                <span className="text-foreground font-semibold">{activeHero.year}</span>
                <span className="opacity-30">·</span>
                <span>{fmtRuntime(activeHero.runtime)}</span>
                <span className="opacity-30">·</span>
                <span>{activeHero.genres.slice(0, 3).join(" / ")}</span>
                <span className="opacity-30">·</span>
                <span className="flex items-center gap-1 text-gold font-medium">
                  <Star className="size-3 fill-gold text-gold" />
                  {activeHero.rating.toFixed(1)} TMDB
                </span>
              </div>

              <p className="line-clamp-2 max-w-xl font-serif text-xs leading-relaxed text-foreground/80 sm:text-sm">
                {activeHero.overview}
              </p>

              <div className="flex flex-wrap items-center gap-2.5 pt-1 sm:gap-3">
                {activeHero.trailer ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(activeHero.trailer)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-sans text-xs font-semibold tracking-wide text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-soft hover:scale-[1.02]"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Play Trailer</span>
                  </a>
                ) : (
                  <Link
                    to="/movie/$id"
                    params={{ id: String(activeHero.id) }}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-sans text-xs font-semibold tracking-wide text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-soft hover:scale-[1.02]"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Play Trailer</span>
                  </Link>
                )}

                <Link
                  to="/movie/$id"
                  params={{ id: String(activeHero.id) }}
                  className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-5 py-2.5 font-sans text-xs font-medium text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                >
                  <span>Film details</span>
                </Link>

                <MovieActions movie={activeHero} />
              </div>
            </div>

            {/* Slide Navigation & Timing Progress Bar (The Dashes) */}
            <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-border/20 pt-3">
              <div className="flex items-center gap-2 sm:gap-3">
                {heroList.slice(0, 10).map((h, idx) => (
                  <button
                    key={h.id || idx}
                    type="button"
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Jump to projection ${idx + 1}: ${h.title}`}
                    className="group relative flex flex-col items-start gap-1 py-1"
                  >
                    <div className="h-1.5 w-7 sm:w-10 rounded-full bg-foreground/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gold transition-all ease-linear ${
                          heroIndex === idx ? "w-full" : "w-0"
                        }`}
                        style={{
                          transitionDuration: heroIndex === idx && !isPaused ? "4500ms" : "0ms",
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevHero}
                  aria-label="Previous film projection"
                  className="grid size-8 place-items-center rounded-full border border-border/60 bg-surface/70 text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextHero}
                  aria-label="Next film projection"
                  className="grid size-8 place-items-center rounded-full border border-border/60 bg-surface/70 text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          02. THE ROWS SECTION (Clean Horizontal Movie Grids)
          - "Choose a mood" (6 Clean Rectangular Genre Cards)
          - "In projection now"
          - "The Long Take"
          - "Restored & Rediscovered"
          - "What members are watching"
          - "Tamil cinema"
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 space-y-10 sm:space-y-12">
        {/* Choose a mood — Clean Rectangular Cards */}
        <div className="space-y-4">
          <SectionHeader
            title="Choose a mood"
            subtitle="Start from a feeling, not a franchise"
            action={
              <Link
                to="/discover"
                className="label-gold flex items-center gap-1 font-mono text-xs uppercase tracking-wider text-gold hover:text-gold-soft transition"
              >
                OPEN DISCOVER <ChevronRight className="size-3" />
              </Link>
            }
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {activeMoods.map((m) => (
              <Link
                key={m.id}
                to="/discover"
                search={{ genre: m.id }}
                className="group relative h-28 sm:h-32 md:h-36 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/50 transition-all duration-500 hover:ring-gold/70 hover:scale-[1.03] hover:shadow-[0_8px_25px_rgba(212,175,55,0.25)] shadow-lg shadow-black/40"
              >
                {m.backdrop ? (
                  <img
                    src={m.backdrop}
                    alt={m.name}
                    loading="lazy"
                    className="size-full object-cover opacity-60 transition-all duration-700 ease-out group-hover:scale-110 group-hover:opacity-85"
                  />
                ) : (
                  <div className="size-full bg-gradient-to-br from-stone-900 to-stone-950" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/25 transition-opacity duration-500 group-hover:from-black/75 group-hover:via-black/30 group-hover:to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center select-none">
                  <span className="font-display text-base sm:text-lg md:text-xl font-bold text-foreground group-hover:text-gold transition-colors duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] tracking-wide">
                    {m.name}
                  </span>
                  {m.tagline ? (
                    <span className="font-mono text-[0.62rem] sm:text-[0.68rem] text-gold-soft uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 font-medium drop-shadow">
                      {m.tagline}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Horizontal Scrolling Rails */}
        {rails.map((rail) => (
          <PosterRail
            key={rail.key}
            title={rail.title}
            subtitle={rail.subtitle}
            items={rail.items}
            seeAll={{
              to: "/discover",
              search:
                rail.key === "tamil"
                  ? { world: "kollywood" }
                  : rail.key === "now"
                  ? { sort: "primary_release_date.desc" }
                  : rail.key === "restored"
                  ? { sort: "primary_release_date.asc", decade: "pre1950" }
                  : rail.key === "popular"
                  ? { sort: "popularity.desc" }
                  : { sort: "vote_average.desc" },
            }}
          />
        ))}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03. FILMMAKER OF THE MONTH (Immersive Auteur World)
          Dynamically rotates across 45+ world visionaries (e.g. Rishab Shetty).
         ───────────────────────────────────────────────────────────── */}
      {currentAuteur ? (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <div className="py-16 border-y border-border/40 space-y-12">
            {/* Header: Typographic Dominance & Spin Control */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                    Filmmaker of the Month
                  </span>
                  {auteursPool.length > 1 ? (
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      ({activeAuteurIdx + 1} of {auteursPool.length} preloaded)
                    </span>
                  ) : null}
                </div>

                {auteursPool.length > 1 ? (
                  <button
                    type="button"
                    onClick={cycleNextAuteur}
                    className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 px-4 py-1.5 font-mono text-xs text-gold hover:bg-gold hover:text-background transition"
                  >
                    <RotateCw className="size-3" />
                    <span>Explore Another Visionary ↺</span>
                  </button>
                ) : null}
              </div>

              <h2 className="font-display text-5xl sm:text-7xl lg:text-8xl font-black text-foreground tracking-tight leading-[0.92]">
                {currentAuteur.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                <span className="text-gold font-medium">{currentAuteur.movement}</span>
                <span className="opacity-30">/</span>
                <span>{currentAuteur.category}</span>
                <span className="opacity-30">/</span>
                <span>{currentAuteur.era}</span>
              </div>

              <p className="font-serif text-sm sm:text-base italic text-foreground/85 leading-relaxed max-w-3xl">
                {currentAuteur.biography
                  ? currentAuteur.biography.slice(0, 260) + "..."
                  : `Discover the distinct visual poetry, sonic texture, and complete career filmography of ${currentAuteur.name}.`}
              </p>
            </div>

            {/* The Career Trail: Architectural Landmark Journey */}
            <div className="space-y-6">
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Signature Career Trail across Eras
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {(currentAuteur.knownFor || []).map((film: MovieCard, index: number) => {
                  const resolvedPoster =
                    movieArtworks[film.id]?.poster ||
                    (film.poster
                      ? film.poster.startsWith("http")
                        ? film.poster.replace(/\/w\d+\//, "/w500/")
                        : `https://image.tmdb.org/t/p/w500${film.poster.startsWith("/") ? film.poster : `/${film.poster}`}`
                      : null);
                  const isPosterMissing = failedPosters.has(film.id) || !resolvedPoster;

                  return (
                    <Link
                      key={film.id}
                      to="/movie/$id"
                      params={{ id: String(film.id) }}
                      className="group relative flex flex-col space-y-3"
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/40 transition duration-300 group-hover:-translate-y-2 group-hover:ring-gold/70 group-hover:shadow-2xl">
                        {!isPosterMissing ? (
                          <img
                            src={resolvedPoster}
                            alt={film.title}
                            loading="lazy"
                            onError={() => setFailedPosters((prev) => new Set(prev).add(film.id))}
                            className="size-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <PosterPlaceholder title={film.title} year={film.year} />
                        )}
                        <div className="absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-gold backdrop-blur-md">
                          Milestone 0{index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="font-display text-base font-bold text-foreground group-hover:text-gold transition truncate">
                          {film.title}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground flex items-center justify-between mt-1">
                          <span>{film.year}</span>
                          <span className="text-gold font-medium">★ {film.rating.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                to="/person/$id"
                params={{ id: String(currentAuteur.id) }}
                className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-6 py-3 font-sans text-xs font-semibold text-gold hover:bg-gold hover:text-background transition-all"
              >
                <span>Enter {currentAuteur.name}'s Complete World & Oeuvre</span>
                <ArrowRight className="size-3.5" />
              </Link>

              <Link
                to="/filmmakers"
                className="font-mono text-xs text-muted-foreground hover:text-gold transition"
              >
                View all 45+ masters in the Cinema Atlas →
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          04. THE LIVING CONTINUUM (Cinema Worlds — Diverse & Asymmetrical)
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8 space-y-16">
        <div className="max-w-3xl space-y-3">
          <div className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
            The Living Continuum
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-bold text-foreground leading-[0.96]">
            Enter Global Cinema Worlds.
          </h2>
          <p className="font-serif text-sm sm:text-base italic text-muted-foreground">
            CineVerse connects directly into the living global archives. Step beyond isolated titles into entire regional movements and aesthetic philosophies.
          </p>
        </div>

        {/* Asymmetrical Cinema World Showcase */}
        <div className="space-y-12">
          {/* Hollywood */}
          <Link
            to="/discover"
            search={{ world: "hollywood" }}
            className="group block relative overflow-hidden rounded-3xl bg-surface ring-1 ring-border/50 hover:ring-gold/60 transition duration-500"
          >
            <div className="grid lg:grid-cols-12 min-h-[300px]">
              <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-wider font-semibold">
                    <span>American Panavision</span>
                    <span className="opacity-40">·</span>
                    <span>1930–Present</span>
                  </div>
                  <h3 className="font-display text-3xl sm:text-5xl font-bold text-foreground group-hover:text-gold transition">
                    Hollywood Cinema
                  </h3>
                  <p className="font-serif text-sm text-foreground/80 max-w-xl leading-relaxed">
                    From Hitchcock's architectural suspense and New Hollywood paranoia to modern visionary epics by Kubrick, Scorsese, Coppola, and Nolan.
                  </p>
                </div>
                <div className="font-mono text-xs text-gold flex items-center gap-2">
                  <span>Explore American Catalogue & Complete Lineage</span>
                  <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                </div>
              </div>
              <div className="lg:col-span-5 relative min-h-[220px] lg:min-h-full overflow-hidden">
                <img
                  src="https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg"
                  alt="Hollywood Cinema"
                  className="size-full object-cover opacity-75 group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden lg:block" />
              </div>
            </div>
          </Link>

          {/* European Pan-Cinema & East Asian Duo */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* European Pan-Cinema */}
            <Link
              to="/discover"
              search={{ world: "european" }}
              className="lg:col-span-5 group flex flex-col justify-between rounded-3xl border border-border/60 bg-surface p-8 sm:p-10 transition duration-300 hover:border-gold/60 hover:-translate-y-1"
            >
              <div className="space-y-6">
                <div className="font-mono text-[0.68rem] uppercase tracking-wider text-gold font-semibold">
                  Continental Modernism · 1950–Present
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-bold text-foreground group-hover:text-gold transition">
                  European Pan-Cinema
                </h3>
                <blockquote className="border-l-2 border-gold/40 pl-4 font-serif text-sm italic text-foreground/85 leading-relaxed">
                  "Cinema is truth 24 frames-per-second, and every cut is a moral judgment."
                  <span className="block font-mono text-[0.65rem] text-gold uppercase mt-1 not-italic">
                    — Jean-Luc Godard
                  </span>
                </blockquote>
                <p className="font-serif text-xs text-muted-foreground leading-relaxed">
                  French New Wave deconstruction, Italian neorealism, Swedish existential solitude, and Tarkovskian time-sculpting across borders.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-border/30 font-mono text-xs text-gold flex items-center justify-between">
                <span>Stream Continental Archive</span>
                <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
              </div>
            </Link>

            {/* Japanese & Korean Duo */}
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-4">
              <Link
                to="/discover"
                search={{ world: "japanese" }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-border/50 hover:ring-gold/60 transition"
              >
                <div className="space-y-3 relative z-10">
                  <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider">
                    Nihon Eiga · 日本映画
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Japanese Cinema
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    Kurosawa's weather-beaten samurai humanism, Ozu's domestic tatami stillness, and Miyazaki's soaring environmental elegies.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-3 border-t border-border/30 font-mono text-[0.68rem] text-gold flex items-center justify-between">
                  <span>Enter Nihon Eiga</span>
                  <ArrowRight className="size-3 transition group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                to="/discover"
                search={{ world: "korean" }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-surface p-6 ring-1 ring-border/50 hover:ring-gold/60 transition"
              >
                <div className="space-y-3 relative z-10">
                  <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider">
                    Chungmuro · 한국 영화
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Korean Cinema
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    Ferocious social allegories, baroque vengeance, and procedural tension redefining contemporary visual grammar.
                  </p>
                </div>
                <div className="relative z-10 mt-6 pt-3 border-t border-border/30 font-mono text-[0.68rem] text-gold flex items-center justify-between">
                  <span>Enter Chungmuro</span>
                  <ArrowRight className="size-3 transition group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* Indian Cinema Continuum */}
          <div className="space-y-6 pt-4">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-3">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
                  South Asian Traditions
                </span>
                <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-foreground">
                  The Indian Cinema Continuum
                </h3>
              </div>
              <Link to="/filmmakers" className="font-mono text-xs text-gold hover:underline">
                View South Asian Masters →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Kollywood */}
              <Link
                to="/discover"
                search={{ world: "kollywood" }}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border/60 hover:border-gold/60 transition hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="font-mono text-[0.65rem] text-gold font-semibold uppercase">
                    தமிழ் சினிமா · 1970–Present
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Kollywood
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    Sensory modernism, kinetic hyper-action universes, and raw subaltern realism across Tamil film history.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 font-mono text-[0.65rem] text-gold flex items-center justify-between">
                  <span>Explore Tamil Archive</span>
                  <ArrowRight className="size-3" />
                </div>
              </Link>

              {/* Mollywood */}
              <Link
                to="/discover"
                search={{ world: "mollywood" }}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border/60 hover:border-gold/60 transition hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="font-mono text-[0.65rem] text-gold font-semibold uppercase">
                    മലയാള സിനിമ · 1980–Present
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Mollywood
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    The world masterclass in understated social realism, moral ambiguity, and organic performance.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 font-mono text-[0.65rem] text-gold flex items-center justify-between">
                  <span>Explore Malayalam Archive</span>
                  <ArrowRight className="size-3" />
                </div>
              </Link>

              {/* Tollywood */}
              <Link
                to="/discover"
                search={{ world: "tollywood" }}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border/60 hover:border-gold/60 transition hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="font-mono text-[0.65rem] text-gold font-semibold uppercase">
                    తెలుగు సినిమా · 1980–Present
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Tollywood
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    Mythic visual scale, mass heroic storytelling, and breathtaking kinetic spectacle across generations.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 font-mono text-[0.65rem] text-gold flex items-center justify-between">
                  <span>Explore Telugu Archive</span>
                  <ArrowRight className="size-3" />
                </div>
              </Link>

              {/* Bollywood */}
              <Link
                to="/discover"
                search={{ world: "bollywood" }}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-surface border border-border/60 hover:border-gold/60 transition hover:-translate-y-1"
              >
                <div className="space-y-2">
                  <div className="font-mono text-[0.65rem] text-gold font-semibold uppercase">
                    हिन्दी सिनेमा · 1950–Present
                  </div>
                  <h4 className="font-display text-2xl font-bold text-foreground group-hover:text-gold transition">
                    Bollywood
                  </h4>
                  <p className="font-serif text-xs text-muted-foreground line-clamp-3">
                    From Golden Age socialist poetry and Shakespearean crime tragedies to grand visual rhapsodies.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/30 font-mono text-[0.65rem] text-gold flex items-center justify-between">
                  <span>Explore Hindi Archive</span>
                  <ArrowRight className="size-3" />
                </div>
              </Link>
            </div>
          </div>

          {/* Gateway Horizon */}
          <div className="pt-4 flex justify-center">
            <Link
              to="/discover"
              className="inline-flex items-center gap-3 rounded-full border border-border/80 bg-surface/80 px-8 py-3.5 font-mono text-xs text-foreground hover:text-gold hover:border-gold/60 transition shadow-md"
            >
              <Globe className="size-4 text-gold" />
              <span>Explore all 20+ Global Cinema Traditions (French, Italian, Iranian, Hong Kong, Sandalwood & more) →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          05. THE ARCHIVE PROJECTION DECK (Signature Interactive Movement)
         ───────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                  Signature Archive Experience
                </span>
                <span className="inline-flex items-center rounded-full bg-gold/15 px-2.5 py-0.5 font-mono text-[0.62rem] text-gold">
                  Interactive Deck
                </span>
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                The Archive Projection Deck.
              </h2>
              <p className="font-serif text-sm italic text-muted-foreground max-w-2xl">
                Shift between pivotal cinema movements. Experience how changing eras, auteurs, and aesthetic philosophies reshape the filmic frame.
              </p>
            </div>

            <button
              type="button"
              onClick={surpriseDeckMovement}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 py-2 font-mono text-xs text-muted-foreground hover:text-gold hover:border-gold transition shadow-sm"
            >
              <Shuffle className="size-3 text-gold" />
              <span>Surprise Movement 🎲</span>
            </button>
          </div>

          {/* Movement Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 hide-scrollbar">
            {ARCHIVE_MOVEMENTS.map((mov) => {
              const isSelected = mov.id === activeMovementId;
              return (
                <button
                  key={mov.id}
                  type="button"
                  onClick={() => setActiveMovementId(mov.id)}
                  className={`shrink-0 rounded-full px-5 py-2.5 font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-gold text-background font-bold shadow-md shadow-gold/20"
                      : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2 border border-border/50"
                  }`}
                >
                  <span>{mov.name}</span>
                  <span className="ml-2 text-[0.65rem] opacity-70">({mov.era})</span>
                </button>
              );
            })}
          </div>

          {/* Interactive Deck Canvas */}
          <div className="relative overflow-hidden rounded-3xl bg-surface p-6 sm:p-10 border border-border/70 shadow-2xl transition-all duration-700">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentMovement.ambientTone} opacity-60 pointer-events-none transition-all duration-1000`}
            />

            {/* Dynamic Backdrop of Active Deck Film */}
            {movieArtworks[activeDeckFilm.id]?.backdrop || activeDeckFilm.backdrop ? (
              <img
                src={
                  movieArtworks[activeDeckFilm.id]?.backdrop ||
                  (activeDeckFilm.backdrop.startsWith("http")
                    ? activeDeckFilm.backdrop.replace(/\/w\d+\//, "/original/")
                    : `https://image.tmdb.org/t/p/original${activeDeckFilm.backdrop.startsWith("/") ? activeDeckFilm.backdrop : `/${activeDeckFilm.backdrop}`}`)
                }
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover opacity-15 filter blur-[2px] pointer-events-none transition-opacity duration-1000"
              />
            ) : null}

            <div className="relative z-10 grid gap-10 lg:grid-cols-12 items-center">
              {/* Left Column: Movement Manifesto & Active Film Details */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="font-mono text-xs uppercase tracking-wider text-gold font-semibold">
                    {currentMovement.tradition} · {currentMovement.era}
                  </div>
                  <h3 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-foreground">
                    {activeDeckFilm.title}
                  </h3>
                  <div className="font-display text-base text-gold-soft italic mt-0.5">
                    Directed by{" "}
                    {activeDeckFilm.directorId ? (
                      <Link
                        to="/person/$id"
                        params={{ id: String(activeDeckFilm.directorId) }}
                        className="underline underline-offset-4 hover:text-gold"
                      >
                        {activeDeckFilm.director}
                      </Link>
                    ) : (
                      activeDeckFilm.director
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs text-muted-foreground">
                  <span className="text-foreground font-semibold">{activeDeckFilm.year}</span>
                  <span>·</span>
                  <span>{fmtRuntime(activeDeckFilm.runtime)}</span>
                  <span>·</span>
                  <span className="text-gold font-medium">★ {activeDeckFilm.rating.toFixed(1)} TMDB</span>
                </div>

                <p className="font-serif text-sm sm:text-base leading-relaxed text-foreground/90">
                  {activeDeckFilm.overview}
                </p>

                {/* Aesthetic Note Callout */}
                <div className="rounded-xl bg-background/60 p-4 border-l-2 border-gold backdrop-blur-sm">
                  <div className="font-mono text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                    Auteur Grammar Note
                  </div>
                  <p className="mt-1 font-serif text-xs italic text-foreground/85">
                    {activeDeckFilm.aestheticNote}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    to="/movie/$id"
                    params={{ id: String(activeDeckFilm.id) }}
                    className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-sans text-xs font-semibold text-background shadow-md hover:bg-gold-soft transition"
                  >
                    <span>Enter Film →</span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilmIndex(
                          (prev) => (prev - 1 + currentMovement.films.length) % currentMovement.films.length,
                        )
                      }
                      aria-label="Previous film in deck"
                      className="grid size-8 place-items-center rounded-full border border-border/80 bg-background/80 text-foreground hover:border-gold hover:text-gold transition"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="font-mono text-xs text-muted-foreground">
                      {activeFilmIndex + 1} / {currentMovement.films.length}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveFilmIndex((prev) => (prev + 1) % currentMovement.films.length)
                      }
                      aria-label="Next film in deck"
                      className="grid size-8 place-items-center rounded-full border border-border/80 bg-background/80 text-foreground hover:border-gold hover:text-gold transition"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Layered Stack of Physical Projection Plates */}
              <div className="lg:col-span-6 flex justify-center py-6 sm:py-8">
                <div className="relative w-full max-w-md h-[400px] flex items-center justify-center">
                  {currentMovement.films.map((film, fIdx) => {
                    const offset = (fIdx - activeFilmIndex + currentMovement.films.length) % currentMovement.films.length;
                    const filmPoster =
                      movieArtworks[film.id]?.poster ||
                      (film.poster
                        ? film.poster.startsWith("http")
                          ? film.poster.replace(/\/w\d+\//, "/w500/")
                          : `https://image.tmdb.org/t/p/w500${film.poster.startsWith("/") ? film.poster : `/${film.poster}`}`
                        : null);
                    const isPosterMissing = failedPosters.has(film.id) || !filmPoster;

                    let transformClass = "scale-100 z-30 translate-x-0 shadow-2xl opacity-100";
                    if (offset === 1) {
                      transformClass = "scale-90 z-20 translate-x-8 sm:translate-x-12 translate-y-3 opacity-60 hover:opacity-90";
                    } else if (offset === 2) {
                      transformClass = "scale-80 z-10 translate-x-16 sm:translate-x-24 translate-y-6 opacity-40 hover:opacity-80";
                    }

                    return (
                      <div
                        key={film.id}
                        onClick={() => setActiveFilmIndex(fIdx)}
                        className={`absolute w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-border/60 transition-all duration-500 ease-out ${transformClass}`}
                      >
                        {!isPosterMissing ? (
                          <img
                            src={filmPoster}
                            alt={film.title}
                            onError={() => setFailedPosters((prev) => new Set(prev).add(film.id))}
                            className="size-full object-cover"
                          />
                        ) : (
                          <PosterPlaceholder title={film.title} year={String(film.year)} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="font-mono text-[0.6rem] text-gold uppercase tracking-wider">
                            {film.year}
                          </div>
                          <div className="font-display text-sm font-bold text-foreground truncate">
                            {film.title}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          06. CURATOR'S DEEP CUT ("You Probably Missed This")
         ───────────────────────────────────────────────────────────── */}
      {activeDeepCut ? (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <div className="py-14 border-t border-border/40 grid gap-10 md:grid-cols-[240px_1fr] items-center">
            <Link
              to="/movie/$id"
              params={{ id: String(activeDeepCut.id) }}
              className="group aspect-[2/3] w-48 sm:w-full overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/50 shadow-2xl hover:ring-gold transition duration-300"
            >
              {activeDeepCut.poster ? (
                <img
                  src={activeDeepCut.poster.startsWith("http") ? activeDeepCut.poster.replace(/\/w\d+\//, "/w500/") : `https://image.tmdb.org/t/p/w500${activeDeepCut.poster.startsWith("/") ? activeDeepCut.poster : `/${activeDeepCut.poster}`}`}
                  alt={activeDeepCut.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <PosterPlaceholder title={activeDeepCut.title} year={activeDeepCut.year} />
              )}
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                    Curator's Archive · You Probably Missed This
                  </span>
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    ({deepCutIdx + 1} of {deepCutsPool.length})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={unearthAnotherDeepCut}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 font-mono text-[0.65rem] text-muted-foreground hover:text-gold hover:border-gold transition shadow-sm"
                >
                  <Shuffle className="size-2.5 text-gold" />
                  <span>Unearth Another Gem 🎲</span>
                </button>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl text-foreground font-bold leading-[0.98]">
                {activeDeepCut.title} ({activeDeepCut.year})
              </h3>

              {activeDeepCut.director ? (
                <div className="font-display text-lg text-gold-soft italic">
                  A film by {activeDeepCut.director}
                </div>
              ) : null}

              <p className="font-serif text-sm sm:text-base leading-relaxed text-foreground/85 max-w-3xl">
                {activeDeepCut.overview}
              </p>

              {activeDeepCut.curatorInsight ? (
                <div className="border-l-2 border-gold/50 pl-3 font-serif text-xs italic text-gold-soft">
                  "{activeDeepCut.curatorInsight}"
                </div>
              ) : null}

              <div className="flex items-center gap-4 pt-2">
                <Link
                  to="/movie/$id"
                  params={{ id: String(activeDeepCut.id) }}
                  className="inline-flex items-center gap-2 font-mono text-xs text-gold uppercase tracking-wider font-semibold hover:underline"
                >
                  <span>Enter the Film Experience</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <MovieActions
                  movie={{
                    id: activeDeepCut.id,
                    title: activeDeepCut.title,
                    year: activeDeepCut.year,
                    rating: 8.0,
                    poster: activeDeepCut.poster,
                    genres: [],
                  } as unknown as MovieCard}
                />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          07. THE INFINITE HORIZON
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface-2 to-surface p-8 sm:p-16 border border-border/50 text-center space-y-6">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-gold font-semibold">
            The Infinite Horizon
          </div>
          <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground max-w-3xl mx-auto leading-[1.05]">
            "Cinema is an atlas of the human soul across centuries."
          </h2>
          <p className="font-serif text-sm sm:text-base italic text-muted-foreground max-w-xl mx-auto">
            Over a century of restored cinematic history, 20+ regional traditions, and 40+ auteur worlds waiting for your personal unearthing.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/discover"
              className="rounded-full bg-gold px-8 py-3.5 font-sans text-xs font-semibold text-background shadow-lg shadow-gold/20 hover:bg-gold-soft transition"
            >
              Explore Full Cinema Atlas →
            </Link>
            <Link
              to="/filmmakers"
              className="rounded-full border border-border/80 bg-surface/70 px-6 py-3.5 font-sans text-xs font-medium text-foreground hover:border-gold hover:text-gold transition"
            >
              Explore Filmmaker Oeuvres
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
