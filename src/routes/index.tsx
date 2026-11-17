import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Globe,
  Play,
  RotateCw,
  Shuffle,
  Sparkles,
  Star,
} from "lucide-react";

import { MovieActions } from "../components/site/movie-actions";
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
   CURATED DOMINANT MASTERPIECE POOL (10 Landmark Works)
   Each refresh or "Draw Another Work" click presents a new
   monumental film from a different tradition with bespoke
   curatorial notes and contextual contrasting dialogues.
   ───────────────────────────────────────────────────────────── */
interface MasterpieceFeature {
  id: number;
  title: string;
  year: string;
  director: string;
  directorId?: number;
  tradition: string;
  rating: number;
  runtime: number;
  genres: string[];
  poster: string;
  backdrop: string;
  quote: string;
  curatorNote: string;
  contextualTrio: {
    id: number;
    title: string;
    year: string;
    director: string;
    poster: string;
    dialogueReason: string;
  }[];
}

const CURATOR_MASTERPIECES: MasterpieceFeature[] = [
  {
    id: 29971,
    title: "Nayakan",
    year: "1987",
    director: "Mani Ratnam",
    directorId: 78747,
    tradition: "Tamil Cinema · தமிழ்",
    rating: 8.5,
    runtime: 156,
    genres: ["Crime", "Drama"],
    poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/u4iRTMD0oJPUP2kjmH3XIEhsDKF.jpg",
    quote: "A towering monument of Indian cinema that synthesized Coppola-scale operatic tragedy with the visceral pulse of Bombay's Dharavi.",
    curatorNote:
      "P.C. Sreeram's chiaroscuro shadows and Kamal Haasan's generational aging dismantled theatrical Indian cinema forever. A masterclass in moral decline.",
    contextualTrio: [
      {
        id: 238,
        title: "The Godfather",
        year: "1972",
        director: "Francis Ford Coppola",
        poster: "https://image.tmdb.org/t/p/w500/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
        dialogueReason: "The American family crime prototype translated into Indian communal solidarity.",
      },
      {
        id: 49032,
        title: "Iruvar",
        year: "1997",
        director: "Mani Ratnam",
        poster: "https://image.tmdb.org/t/p/w500/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        dialogueReason: "Mani Ratnam's later political peak examining how cinema created modern Tamil statehood.",
      },
      {
        id: 598,
        title: "City of God",
        year: "2002",
        director: "Fernando Meirelles",
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        dialogueReason: "Brazilian slum kineticism mirroring Dharavi's generational violence.",
      },
    ],
  },
  {
    id: 11423,
    title: "Memories of Murder",
    year: "2003",
    director: "Bong Joon-ho",
    directorId: 21684,
    tradition: "Chungmuro · 한국 영화",
    rating: 8.1,
    runtime: 132,
    genres: ["Crime", "Drama", "Mystery"],
    poster: "https://image.tmdb.org/t/p/w500/6Kn6qW3an3DkPl3MahWemTzrjCt.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/6Kn6qW3an3DkPl3MahWemTzrjCt.jpg",
    quote: "The definitive subversion of the detective procedural, where the killer is an invisible ghost birthed by military dictatorship.",
    curatorNote:
      "Golden rural rice fields contrasted against bottomless black railway tunnels. Song Kang-ho's final fourth-wall stare remains one of cinema's great endings.",
    contextualTrio: [
      {
        id: 807,
        title: "Se7en",
        year: "1995",
        director: "David Fincher",
        poster: "https://image.tmdb.org/t/p/w500/1kuz2w7h0iPdrGz72pSgM1G77s9.jpg",
        dialogueReason: "Fincher's rain-soaked procedural precision in dialogue with Korean political rot.",
      },
      {
        id: 670,
        title: "Oldboy",
        year: "2003",
        director: "Park Chan-wook",
        poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
        dialogueReason: "Park Chan-wook's operatic baroque vengeance released the same breakthrough year.",
      },
      {
        id: 12493,
        title: "High and Low",
        year: "1963",
        director: "Akira Kurosawa",
        poster: "https://image.tmdb.org/t/p/w500/5n3j1sL4d5R6zY7j6f8g9h1k4k7.jpg",
        dialogueReason: "Kurosawa's procedural blueprint mapping class divides across Yokohama.",
      },
    ],
  },
  {
    id: 346,
    title: "Seven Samurai",
    year: "1954",
    director: "Akira Kurosawa",
    directorId: 5026,
    tradition: "Nihon Eiga · 日本映画",
    rating: 8.5,
    runtime: 207,
    genres: ["Action", "Drama"],
    poster: "https://image.tmdb.org/t/p/w500/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
    quote: "The bedrock of modern action editing and cinematic ensemble storytelling. A heartbreaking humanist epic of collective survival.",
    curatorNote:
      "Kurosawa pioneered simultaneous three-camera setups, telephoto lens flattening, and torrential rain battles to capture pure kinetic exhaustion.",
    contextualTrio: [
      {
        id: 18148,
        title: "Tokyo Story",
        year: "1953",
        director: "Yasujirō Ozu",
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        dialogueReason: "The quiet domestic counterpoint to Kurosawa's kinetic outdoor fury.",
      },
      {
        id: 28,
        title: "Apocalypse Now",
        year: "1979",
        director: "Francis Ford Coppola",
        poster: "https://image.tmdb.org/t/p/w500/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
        dialogueReason: "The dissolution of military honor in the jungle, indebted to Kurosawa's mud.",
      },
      {
        id: 29811,
        title: "Thalapathi",
        year: "1991",
        director: "Mani Ratnam",
        poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
        dialogueReason: "Epic Indian warrior loyalty forged under torrential monsoon downpours.",
      },
    ],
  },
  {
    id: 579974,
    title: "Kumbalangi Nights",
    year: "2019",
    director: "Madhu C. Narayanan",
    tradition: "Mollywood · മലയാളം",
    rating: 8.2,
    runtime: 135,
    genres: ["Drama", "Comedy", "Romance"],
    poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
    quote: "A quiet revolution in Indian domestic drama, subverting toxic masculinity through luminous backwaters, fractured brothers, and organic empathy.",
    curatorNote:
      "Shyju Khalid's bioluminescent night waters and Fahadh Faasil's terrifying performative smile elevate a simple village family tale into world-class art.",
    contextualTrio: [
      {
        id: 1162630,
        title: "Jallikattu",
        year: "2019",
        director: "Lijo Jose Pellissery",
        poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
        dialogueReason: "The frenzied mob kineticism of Malayalam cinema contrasting Kumbalangi's tenderness.",
      },
      {
        id: 491584,
        title: "Burning",
        year: "2018",
        director: "Lee Chang-dong",
        poster: "https://image.tmdb.org/t/p/w500/qQEt2FqF8McryFBNX30dyDJKiEK.jpg",
        dialogueReason: "Quiet rural youth confronting modern class fractures with restrained poetry.",
      },
      {
        id: 1574334,
        title: "Maheshinte Prathikaaram",
        year: "2016",
        director: "Dileesh Pothan",
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        dialogueReason: "The modern Malayalam new-wave milestone of hyperlocal character irony.",
      },
    ],
  },
  {
    id: 843,
    title: "In the Mood for Love",
    year: "2000",
    director: "Wong Kar-wai",
    directorId: 12453,
    tradition: "Hong Kong Cinema",
    rating: 8.1,
    runtime: 98,
    genres: ["Drama", "Romance"],
    poster: "https://image.tmdb.org/t/p/w500/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    quote: "The pinnacle of sensory melancholy. A whisper of unconsummated desire framed in narrow corridors, qipaos, and rain-swept alleys.",
    curatorNote:
      "Christopher Doyle's step-printed frames and Shigeru Umebayashi's recurring waltz transform fleeting glances into indelible emotional monuments.",
    contextualTrio: [
      {
        id: 49032,
        title: "Iruvar",
        year: "1997",
        director: "Mani Ratnam",
        poster: "https://image.tmdb.org/t/p/w500/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
        dialogueReason: "Sensory step-printing and period glamour captured across Asian political transitions.",
      },
      {
        id: 25538,
        title: "Yi Yi",
        year: "2000",
        director: "Edward Yang",
        poster: "https://image.tmdb.org/t/p/w500/1kuz2w7h0iPdrGz72pSgM1G77s9.jpg",
        dialogueReason: "Taiwanese urban gentleness released the same year, exploring generational alienation.",
      },
      {
        id: 797,
        title: "Persona",
        year: "1966",
        director: "Ingmar Bergman",
        poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
        dialogueReason: "Close-up psychological projection between two entangled souls.",
      },
    ],
  },
  {
    id: 1398,
    title: "Stalker",
    year: "1979",
    director: "Andrei Tarkovsky",
    directorId: 8452,
    tradition: "Soviet / European Poetics",
    rating: 8.2,
    runtime: 162,
    genres: ["Sci-Fi", "Drama"],
    poster: "https://image.tmdb.org/t/p/w500/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
    quote: "Sculpting time on celluloid. A metaphysical journey into the overgrown 'Zone' where human desire confronts spiritual emptiness.",
    curatorNote:
      "Unbroken long-takes gliding over submerged industrial detritus, transitioning from sepia decay into shimmering radioactive green.",
    contextualTrio: [
      {
        id: 240,
        title: "2001: A Space Odyssey",
        year: "1968",
        director: "Stanley Kubrick",
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        dialogueReason: "Kubrick's sterile technological abyss versus Tarkovsky's organic spiritual soil.",
      },
      {
        id: 491584,
        title: "Burning",
        year: "2018",
        director: "Lee Chang-dong",
        poster: "https://image.tmdb.org/t/p/w500/qQEt2FqF8McryFBNX30dyDJKiEK.jpg",
        dialogueReason: "Modern existential void and enigmatic disappearances across borders.",
      },
      {
        id: 12160,
        title: "Pather Panchali",
        year: "1955",
        director: "Satyajit Ray",
        poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
        dialogueReason: "Pure poetic realism observing water striders and train smoke.",
      },
    ],
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
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
        aestheticNote: "Gordon Willis's warm golden shadow pools and Gordon Willis's top-lit eye sockets.",
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
        poster: "https://image.tmdb.org/t/p/w500/1kuz2w7h0iPdrGz72pSgM1G77s9.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/1kuz2w7h0iPdrGz72pSgM1G77s9.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/qvZ91FwMq6O47VViAr8vZNQz3WI.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/5n3j1sL4d5R6zY7j6f8g9h1k4k7.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/5n3j1sL4d5R6zY7j6f8g9h1k4k7.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
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
        poster: "https://image.tmdb.org/t/p/w500/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
        backdrop: "https://image.tmdb.org/t/p/w1280/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
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
    poster: "https://image.tmdb.org/t/p/w500/5n3j1sL4d5R6zY7j6f8g9h1k4k7.jpg",
    overview: "An executive at a Yokohama shoe company faces ruin when extortionists kidnap his chauffeur's son by mistake. A vertical study of moral class warfare.",
    curatorInsight: "Kurosawa's Tohoscope staging visually divides Yokohama between Olympian hilltop luxury and hellish drug dens.",
  },
  {
    id: 11466,
    title: "Cure",
    year: "1997",
    director: "Kiyoshi Kurosawa",
    poster: "https://image.tmdb.org/t/p/w500/rwf5SUTiEsmfkXAgy15R0UtJUtv.jpg",
    overview: "A wave of grisly murders is committed by ordinary citizens with an 'X' carved into their victims' throats, all linked to an amnesiac drifter.",
    curatorInsight: "A hypnotic, deeply terrifying masterclass in sound design and ambient existential dread. Bong Joon-ho's favorite film.",
  },
  {
    id: 406,
    title: "La Haine",
    year: "1995",
    director: "Mathieu Kassovitz",
    poster: "https://image.tmdb.org/t/p/w500/1kuz2w7h0iPdrGz72pSgM1G77s9.jpg",
    overview: "24 relentless hours in the lives of three young men in the Paris suburbs after a violent riot. A ticking time-bomb about social gravity.",
    curatorInsight: "Pierre Aïm's crisp black-and-white cinematography and the iconic rooftop DJ cut scratching KRS-One with Édith Piaf.",
  },
  {
    id: 576928,
    title: "Super Deluxe",
    year: "2019",
    director: "Thiagarajan Kumararaja",
    poster: "https://image.tmdb.org/t/p/w500/zmr611Q4JGZEDKvsT8tfuDLB4nG.jpg",
    overview: "Four disparate lives intersect in Chennai: an unfaithful wife, an estranged transgender parent, a disillusioned priest, and teenagers watching porn.",
    curatorInsight: "A fearless philosophical hyper-narrative exploring morality, alien contact, and cosmic absurdity in Tamil cinema.",
  },
  {
    id: 652,
    title: "The Battle of Algiers",
    year: "1966",
    director: "Gillo Pontecorvo",
    poster: "https://image.tmdb.org/t/p/w500/kGzFbGhp99zva6oZODW5atUtnqi.jpg",
    overview: "A gripping reenactment of the Algerian struggle for independence from French colonial rule in the winding maze of the Casbah.",
    curatorInsight: "Marcello Gatti's high-contrast newsreel grain was so convincing that American theaters posted disclaimers that zero documentary footage was used.",
  },
  {
    id: 25538,
    title: "Yi Yi",
    year: "2000",
    director: "Edward Yang",
    poster: "https://image.tmdb.org/t/p/w500/mGZY68Ab7QeVedY4jWZ6H2xeYaD.jpg",
    overview: "A tender, monumental portrait of a middle-class Taiwanese family navigating love, mid-life regrets, and childhood across three generations.",
    curatorInsight: "Yang's gentle 8-year-old protagonist Yang-Yang takes photos of people's backs 'to show them what they cannot see.'",
  },
  {
    id: 62206,
    title: "A Separation",
    year: "2011",
    director: "Asghar Farhadi",
    poster: "https://image.tmdb.org/t/p/w500/tSPT36ZKlP2WVHJLM4cQPLSzv3b.jpg",
    overview: "A married couple faced with a difficult decision to leave Iran or stay to care for an ailing parent spark a chain reaction of ethical dilemmas.",
    curatorInsight: "A Hitchcockian moral thriller constructed entirely around domestic courtrooms and conflicting human dignity.",
  },
  {
    id: 598,
    title: "City of God",
    year: "2002",
    director: "Fernando Meirelles",
    poster: "https://image.tmdb.org/t/p/w500/qJ6Z4aG2t7m42d7XJ2bB5g0b5yE.jpg",
    overview: "Two boys growing up in a violent Rio de Janeiro favela take different paths: one becomes a photographer, the other a ruthless drug kingpin.",
    curatorInsight: "César Charlone's blistering sun-drenched palette and Daniel Rezende's rhythmic syncopated editing redefined 21st-century action cinema.",
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
  } = Route.useLoaderData() as Awaited<ReturnType<typeof getHome>>;

  const heroList = useMemo(() => {
    if (heroes && heroes.length > 0) return heroes;
    return hero ? [hero] : [];
  }, [heroes, hero]);

  /* ─────────────────────────────────────────────────────────────
     Dynamic Seed & Anti-Stagnant Randomizer States
     On each refresh or session start, these pick unexpected
     selections so a cinephile is NEVER bored.
     ───────────────────────────────────────────────────────────── */
  const [vaultSeed, setVaultSeed] = useState(() => Math.floor(1000 + Math.random() * 9000));

  // 1. Hero projection index: randomized initial pick
  const [heroIndex, setHeroIndex] = useState(() =>
    heroList.length > 1 ? Math.floor(Math.random() * heroList.length) : 0,
  );
  const [isPaused, setIsPaused] = useState(false);

  const activeHero = heroList[heroIndex] || heroList[0];

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
      const img = new Image();
      img.src = nextHeroBackdrop;
    }
  }, [heroIndex, heroList]);

  const prevHero = () => {
    setHeroIndex((prev) => (prev - 1 + heroList.length) % heroList.length);
  };

  const nextHero = () => {
    setHeroIndex((prev) => (prev + 1) % heroList.length);
  };

  const spinRandomHero = () => {
    if (heroList.length <= 1) return;
    setHeroIndex((prev) => {
      let next = Math.floor(Math.random() * heroList.length);
      while (next === prev && heroList.length > 1) {
        next = Math.floor(Math.random() * heroList.length);
      }
      return next;
    });
  };

  // 2. Curatorial Dominant Feature Pick (Cycles across 10 monumental works)
  const [dominantIndex, setDominantIndex] = useState(() =>
    Math.floor(Math.random() * CURATOR_MASTERPIECES.length),
  );
  const activeMasterpiece = CURATOR_MASTERPIECES[dominantIndex] || CURATOR_MASTERPIECES[0];

  const drawNextMasterpiece = () => {
    setDominantIndex((prev) => (prev + 1) % CURATOR_MASTERPIECES.length);
  };

  // 3. Filmmaker of the Moment (Cycles across preloaded auteurs)
  const auteursPool: AuteurCard[] = useMemo(() => {
    if (featuredAuteurs && featuredAuteurs.length > 0) return featuredAuteurs;
    if (featuredAuteur) return [featuredAuteur];
    return [];
  }, [featuredAuteurs, featuredAuteur]);

  const [activeAuteurIdx, setActiveAuteurIdx] = useState(() =>
    auteursPool.length > 1 ? Math.floor(Math.random() * auteursPool.length) : 0,
  );
  const currentAuteur = auteursPool[activeAuteurIdx] || featuredAuteur;

  const cycleNextAuteur = () => {
    if (auteursPool.length <= 1) return;
    setActiveAuteurIdx((prev) => (prev + 1) % auteursPool.length);
  };

  // 4. Archive Projection Deck (Random opening movement + interactive shifts)
  const [activeMovementId, setActiveMovementId] = useState(() => {
    const randomMov = ARCHIVE_MOVEMENTS[Math.floor(Math.random() * ARCHIVE_MOVEMENTS.length)];
    return randomMov.id;
  });

  const currentMovement = useMemo(
    () => ARCHIVE_MOVEMENTS.find((m) => m.id === activeMovementId) || ARCHIVE_MOVEMENTS[0],
    [activeMovementId],
  );
  const [activeFilmIndex, setActiveFilmIndex] = useState(0);

  useEffect(() => {
    setActiveFilmIndex(0);
  }, [activeMovementId]);

  const activeDeckFilm = currentMovement.films[activeFilmIndex] || currentMovement.films[0];

  const surpriseDeckMovement = () => {
    const otherMovements = ARCHIVE_MOVEMENTS.filter((m) => m.id !== activeMovementId);
    const pick = otherMovements[Math.floor(Math.random() * otherMovements.length)];
    if (pick) setActiveMovementId(pick.id);
  };

  // 5. Curator's Deep Cut (Random initial pick + interactive unearth button)
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

  // 6. Master Vault Re-roll: Re-randomizes the entire page's active exhibition
  const spinEntireVault = useCallback(() => {
    setVaultSeed(Math.floor(1000 + Math.random() * 9000));
    spinRandomHero();
    setDominantIndex((prev) => (prev + 1 + Math.floor(Math.random() * 3)) % CURATOR_MASTERPIECES.length);
    if (auteursPool.length > 1) {
      setActiveAuteurIdx((prev) => (prev + 1) % auteursPool.length);
    }
    surpriseDeckMovement();
    setDeepCutIdx((prev) => (prev + 1 + Math.floor(Math.random() * 2)) % deepCutsPool.length);
  }, [heroList.length, auteursPool.length, deepCutsPool.length, activeMovementId]);

  return (
    <div className="space-y-32 sm:space-y-40 pb-32 overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          01. MASSIVE CINEMATIC HERO (75–85vh Auto-Crossfade Projections)
          Strong photographic visibility, natural gradients, movie presence.
          Randomized opening projection on every visit/refresh.
         ───────────────────────────────────────────────────────────── */}
      {activeHero ? (
        <section
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="relative isolate min-h-[660px] h-[84vh] max-h-[920px] w-full overflow-hidden bg-stone-950 text-stone-100"
        >
          {/* Stacked Backdrop Crossfade Layers with HIGH VISIBILITY (65-80%) */}
          <div className="absolute inset-0 z-0 select-none">
            {heroList.map((h, idx) => (
              <div
                key={h.id || idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  heroIndex === idx ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {h.backdrop ? (
                  <img
                    src={h.backdrop}
                    alt=""
                    aria-hidden="true"
                    className="size-full object-cover object-top opacity-65 dark:opacity-80 transition-transform duration-1000 ease-out scale-100"
                  />
                ) : null}
              </div>
            ))}

            {/* Natural Gradients: bottom falloff and gentle left reading gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/60 to-transparent lg:w-3/4" />
          </div>

          {/* Foreground Hero Information */}
          <div className="relative z-10 mx-auto flex h-full max-w-[1400px] flex-col justify-end px-4 pb-12 pt-16 sm:px-8 sm:pb-16">
            <div className="max-w-3xl space-y-4">
              {/* Dynamic Vault Badges & Spin Control */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/20 px-3.5 py-1 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gold ring-1 ring-gold/40 backdrop-blur-md">
                  <Sparkles className="size-3 text-gold" />
                  Tonight's Projection · Reel {String(heroIndex + 1).padStart(2, "0")} /{" "}
                  {String(heroList.length).padStart(2, "0")}
                </span>

                <button
                  type="button"
                  onClick={spinRandomHero}
                  aria-label="Spin to a random film projection"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface/70 px-3 py-1 font-mono text-[0.65rem] text-muted-foreground hover:text-gold hover:border-gold/60 backdrop-blur-md transition"
                >
                  <Shuffle className="size-2.5 text-gold" />
                  <span>Random Reel</span>
                </button>

                <button
                  type="button"
                  onClick={spinEntireVault}
                  aria-label="Re-roll all curated exhibitions across the homepage"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 font-mono text-[0.65rem] text-gold hover:bg-gold hover:text-background backdrop-blur-md transition"
                >
                  <RotateCw className="size-2.5" />
                  <span>Spin Entire Vault (Reel #{vaultSeed})</span>
                </button>

                {isPaused ? (
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground opacity-75">
                    Paused
                  </span>
                ) : null}
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[0.94] drop-shadow-md">
                {activeHero.title}
              </h1>

              {activeHero.director && activeHero.directorId ? (
                <p className="font-display text-lg italic text-gold-soft sm:text-xl">
                  A film by{" "}
                  <Link
                    to="/person/$id"
                    params={{ id: String(activeHero.directorId) }}
                    className="underline underline-offset-4 decoration-gold/40 hover:decoration-gold transition hover:text-gold"
                  >
                    {activeHero.director}
                  </Link>
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
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

              <p className="line-clamp-3 max-w-xl font-serif text-sm leading-relaxed text-foreground/90 sm:text-base">
                {activeHero.overview}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2 sm:gap-4">
                <Link
                  to="/movie/$id"
                  params={{ id: String(activeHero.id) }}
                  className="rounded-full bg-gold px-7 py-3 font-sans text-xs font-semibold tracking-wide text-background shadow-lg shadow-gold/20 transition-all hover:bg-gold-soft hover:scale-[1.02]"
                >
                  Explore Film →
                </Link>

                {activeHero.trailer ? (
                  <a
                    href={`https://www.youtube.com/watch?v=${encodeURIComponent(activeHero.trailer)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-surface/60 px-5 py-3 font-sans text-xs font-medium text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Watch Trailer</span>
                  </a>
                ) : null}

                <MovieActions movie={activeHero} />
              </div>
            </div>

            {/* Slide Navigation & Timing Progress Bar */}
            <div className="mt-8 flex items-center justify-between border-t border-border/30 pt-4">
              <div className="flex items-center gap-2 sm:gap-3">
                {heroList.map((h, idx) => (
                  <button
                    key={h.id || idx}
                    type="button"
                    onClick={() => setHeroIndex(idx)}
                    aria-label={`Jump to projection ${idx + 1}: ${h.title}`}
                    className="group relative flex flex-col items-start gap-1 py-1"
                  >
                    <div className="h-1.5 w-8 sm:w-12 rounded-full bg-foreground/20 overflow-hidden">
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
                  className="grid size-9 place-items-center rounded-full border border-border/60 bg-surface/70 text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={nextHero}
                  aria-label="Next film projection"
                  className="grid size-9 place-items-center rounded-full border border-border/60 bg-surface/70 text-foreground backdrop-blur-sm transition hover:border-gold/60 hover:text-gold"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─────────────────────────────────────────────────────────────
          02. THE DOMINANT EDITORIAL FEATURE ("Discover Something New")
          Dynamic Curatorial Selection: Rotates across 10 landmark works.
          Random on refresh + interactive "Draw Another Work" button.
         ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* LEFT: Massive Centerpiece Film (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[0.68rem] uppercase tracking-[0.25em] text-gold font-semibold">
                  Curator's Spotlight · The Dominant Work
                </span>
                <span className="font-mono text-[0.62rem] text-muted-foreground">
                  ({dominantIndex + 1} of {CURATOR_MASTERPIECES.length})
                </span>
              </div>

              <button
                type="button"
                onClick={drawNextMasterpiece}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 font-mono text-[0.65rem] text-muted-foreground hover:text-gold hover:border-gold transition shadow-sm"
              >
                <RotateCw className="size-2.5 text-gold" />
                <span>Draw Another Work ↺</span>
              </button>
            </div>

            <Link
              to="/movie/$id"
              params={{ id: String(activeMasterpiece.id) }}
              className="group block relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-3xl bg-surface-2 ring-1 ring-border/50 shadow-2xl transition-all duration-500 hover:ring-gold/60 hover:shadow-gold/10"
            >
              {activeMasterpiece.backdrop ? (
                <img
                  src={activeMasterpiece.backdrop}
                  alt={activeMasterpiece.title}
                  className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-80"
                />
              ) : null}

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

              <div className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-end">
                <span className="font-mono text-xs uppercase tracking-wider text-gold font-medium">
                  {activeMasterpiece.tradition} · {activeMasterpiece.year} · Directed by {activeMasterpiece.director}
                </span>
                <h3 className="mt-1 font-display text-3xl sm:text-5xl font-bold text-foreground leading-[0.98] group-hover:text-gold transition">
                  {activeMasterpiece.title}
                </h3>
              </div>
            </Link>

            <div className="space-y-4 pt-1 max-w-2xl">
              <p className="font-serif text-base sm:text-lg leading-relaxed text-foreground/90 italic">
                "{activeMasterpiece.quote}"
              </p>

              <p className="font-serif text-xs text-muted-foreground leading-relaxed">
                {activeMasterpiece.curatorNote}
              </p>

              <div className="flex items-center gap-4 pt-2">
                <Link
                  to="/movie/$id"
                  params={{ id: String(activeMasterpiece.id) }}
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 font-sans text-xs font-semibold text-background shadow-md hover:bg-gold-soft transition"
                >
                  <span>Enter the Film Experience</span>
                  <ArrowRight className="size-3.5" />
                </Link>
                <MovieActions
                  movie={{
                    id: activeMasterpiece.id,
                    title: activeMasterpiece.title,
                    year: activeMasterpiece.year,
                    rating: activeMasterpiece.rating,
                    poster: activeMasterpiece.poster,
                    backdrop: activeMasterpiece.backdrop,
                    genres: activeMasterpiece.genres,
                  } as MovieCard}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Asymmetric Contextual Trio (5 Columns) */}
          <div className="lg:col-span-5 space-y-8 lg:pl-6 lg:border-l lg:border-border/40">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">
                  In Dialogue
                </div>
                <h4 className="mt-1 font-display text-2xl font-bold text-foreground">
                  Contrasting Encounters
                </h4>
              </div>
            </div>

            <div className="space-y-6">
              {activeMasterpiece.contextualTrio.map((film, idx) => (
                <Link
                  key={film.id}
                  to="/movie/$id"
                  params={{ id: String(film.id) }}
                  className="group flex gap-4 items-center p-3 rounded-2xl transition hover:bg-surface/50"
                >
                  <div className="aspect-[2/3] w-20 shrink-0 overflow-hidden rounded-xl bg-surface-2 ring-1 ring-border/40 transition group-hover:ring-gold/60 group-hover:scale-105">
                    {film.poster ? (
                      <img
                        src={film.poster}
                        alt={film.title}
                        loading="lazy"
                        className="size-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="font-mono text-[0.62rem] uppercase tracking-wider text-gold font-medium">
                      Dialogue 0{idx + 1} · {film.year}
                    </div>
                    <h5 className="font-display text-lg font-bold text-foreground group-hover:text-gold transition truncate">
                      {film.title}
                    </h5>
                    <div className="font-serif text-xs text-muted-foreground line-clamp-2">
                      {film.dialogueReason}
                    </div>
                    <div className="font-mono text-[0.65rem] text-gold flex items-center gap-1 pt-0.5">
                      <span>Explore connection</span>
                      <ArrowRight className="size-2.5 transition group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="pt-2">
              <Link
                to="/discover"
                className="font-mono text-xs text-muted-foreground hover:text-gold transition flex items-center gap-1.5"
              >
                <span>View all curated thematic pathways</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03. FILMMAKER OF THE MOMENT (Immersive Auteur World)
          Dynamically rotates across 45+ world visionaries.
          Random on refresh + interactive "Explore Another Visionary" button.
         ───────────────────────────────────────────────────────────── */}
      {currentAuteur ? (
        <section className="mx-auto max-w-[1400px] px-4 sm:px-8">
          <div className="py-16 border-y border-border/40 space-y-12">
            {/* Header: Typographic Dominance & Spin Control */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-[0.25em] text-gold font-semibold">
                    Filmmaker of the Moment
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
                {(currentAuteur.knownFor || []).map((film: MovieCard, index: number) => (
                  <Link
                    key={film.id}
                    to="/movie/$id"
                    params={{ id: String(film.id) }}
                    className="group relative flex flex-col space-y-3"
                  >
                    <div className="aspect-[2/3] w-full overflow-hidden rounded-2xl bg-surface-2 ring-1 ring-border/40 transition duration-300 group-hover:-translate-y-2 group-hover:ring-gold/70 group-hover:shadow-2xl">
                      {film.poster ? (
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="size-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : null}
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
                ))}
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
          Deliberately varied formats: No 8-box identical grid!
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
          {/* World 1: Hollywood (Panoramic Frame & Industrial Scale) */}
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

          {/* World 2: Continental Modernism & East Asian Duo (Asymmetric 2-column) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* European Pan-Cinema: Typographic and Literary Focus (5 Columns) */}
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

            {/* East Asian Masterworks: Japanese Nihon Eiga & Korean Chungmuro (7 Columns) */}
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

          {/* World 3: The Great Indian Cinema Continuum (Kollywood, Mollywood, Tollywood, Bollywood) */}
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

          {/* Gateway Horizon to 20+ Archive Traditions */}
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
          05. SIGNATURE INTERACTION: THE ARCHIVE PROJECTION DECK
          "I'm moving through cinema" — layered interactive film deck
          shifting atmospheric mood, active film, and authorial grammar.
          Random movement on load + interactive jump button.
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
            {/* Ambient Background Glow from active movement */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentMovement.ambientTone} opacity-60 pointer-events-none transition-all duration-1000`}
            />

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

                    // Compute layered cascade styling
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
                        <img
                          src={film.poster}
                          alt={film.title}
                          className="size-full object-cover"
                        />
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
          06. DEEP CUT: Curated Under-seen Masterpiece Feature
          "YOU PROBABLY MISSED THIS" — Personal recommendation slip
          Pulls from 12+ genuine deep cuts with interactive shuffle.
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
                  src={activeDeepCut.poster}
                  alt={activeDeepCut.title}
                  className="size-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : null}
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
          07. THE FINAL HORIZON
          The archive has no boundary — an invitation into infinite cinema.
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
