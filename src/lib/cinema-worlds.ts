export interface CinemaWorldDef {
  id: string;
  name: string;
  nativeOrSub: string;
  era: string;
  tagline: string;
  description: string;
  language?: string;
  originCountry?: string;
  genres?: number[];
  voteCountFloor?: number;
  keyDirectors: { id: number; name: string }[];
  accentColor?: string;
}

export const CINEMA_WORLDS_LIST: CinemaWorldDef[] = [
  {
    id: "hollywood",
    name: "Hollywood",
    nativeOrSub: "American Cinema",
    era: "1930–Present",
    tagline: "From studio Golden Age architecture to New Hollywood auteur grit and modern visionary blockbusters.",
    description:
      "American cinema shaped the classical narrative syntax of modern film. Explore the complete continuum: from Hitchcock's suspense machinery and Wilder's razor-sharp social satire to the 1970s New Hollywood director's renaissance (Scorsese, Coppola, Kubrick) and contemporary visionary world-building.",
    language: "en",
    originCountry: "US",
    voteCountFloor: 100,
    keyDirectors: [
      { id: 525, name: "Christopher Nolan" },
      { id: 1032, name: "Martin Scorsese" },
      { id: 240, name: "Stanley Kubrick" },
      { id: 7467, name: "David Fincher" },
      { id: 4762, name: "Paul Thomas Anderson" },
      { id: 2636, name: "Alfred Hitchcock" },
    ],
  },
  {
    id: "kollywood",
    name: "Kollywood",
    nativeOrSub: "Tamil Cinema · தமிழ் சினிமா",
    era: "1950–Present",
    tagline: "Sensory modernism, kinetic hyper-action universes, and raw subaltern realism.",
    description:
      "One of the world's most vibrant, formally audacious film industries. Tamil cinema bridges profound political and subaltern realism with staggering technical virtuosity — from Mani Ratnam's chiaroscuro visual poetry and Vetrimaaran's socio-political grit to Lokesh Kanagaraj's kinetic interconnected universes.",
    language: "ta",
    originCountry: "IN",
    voteCountFloor: 20,
    keyDirectors: [
      { id: 78747, name: "Mani Ratnam" },
      { id: 1592411, name: "Lokesh Kanagaraj" },
      { id: 550172, name: "Vetrimaaran" },
      { id: 1278235, name: "Pa. Ranjith" },
      { id: 120957, name: "Mysskin" },
      { id: 127448, name: "K. Balachander" },
    ],
  },
  {
    id: "mollywood",
    name: "Mollywood",
    nativeOrSub: "Malayalam Cinema · മലയാള സിനിമ",
    era: "1975–Present",
    tagline: "The world masterclass in understated social realism, moral ambiguity, and organic craft.",
    description:
      "Celebrated globally as an unrivaled bastion of narrative organicism and humanistic character studies. Malayalam cinema eschews sterile commercial formulas in favor of deeply rooted regional textures, psychological nuance, razor-sharp black comedy, and breathtaking aesthetic fearlessness.",
    language: "ml",
    originCountry: "IN",
    voteCountFloor: 15,
    keyDirectors: [
      { id: 1162630, name: "Lijo Jose Pellissery" },
      { id: 935843, name: "Adoor Gopalakrishnan" },
      { id: 1574334, name: "Dileesh Pothan" },
      { id: 1130914, name: "Jeethu Joseph" },
      { id: 1104831, name: "Padmarajan" },
      { id: 587720, name: "Amal Neerad" },
    ],
  },
  {
    id: "korean",
    name: "Korean Cinema",
    nativeOrSub: "Chungmuro · 한국 영화",
    era: "1990–Present",
    tagline: "Explosive genre subversion, operatic revenge tragedy, and ferocious social satire.",
    description:
      "The Korean Renaissance transformed 21st-century world cinema. Operating with extraordinary formal bravura, Korean filmmakers fuse visceral genre machinery with uncompromising social critiques of class, existential alienation, and moral consequence.",
    language: "ko",
    originCountry: "KR",
    voteCountFloor: 50,
    keyDirectors: [
      { id: 21684, name: "Bong Joon-ho" },
      { id: 10099, name: "Park Chan-wook" },
      { id: 96657, name: "Lee Chang-dong" },
      { id: 56983, name: "Kim Jee-woon" },
      { id: 73421, name: "Hong Sang-soo" },
    ],
  },
  {
    id: "japanese",
    name: "Japanese Cinema",
    nativeOrSub: "Nihon Eiga · 日本映画",
    era: "1930–Present",
    tagline: "From Kurosawa and Ozu's humanism to cyberpunk anime, J-horror, and contemporary melancholy.",
    description:
      "A titanic film culture defined by philosophical contemplation, sublime spatial geometry, and peerless atmospheric tension. Journey through Golden Age masterworks, Studio Ghibli's hand-drawn pastorals, New Wave radicalism, and modern existential dramas.",
    language: "ja",
    originCountry: "JP",
    voteCountFloor: 40,
    keyDirectors: [
      { id: 5026, name: "Akira Kurosawa" },
      { id: 608, name: "Hayao Miyazaki" },
      { id: 95501, name: "Yasujirō Ozu" },
      { id: 72007, name: "Masaki Kobayashi" },
      { id: 10839, name: "Takeshi Kitano" },
      { id: 119567, name: "Hirokazu Kore-eda" },
    ],
  },
  {
    id: "bollywood",
    name: "Bollywood",
    nativeOrSub: "Hindi Cinema · हिन्दी सिनेमा",
    era: "1950–Present",
    tagline: "From Golden Age socialist poetry and Shakespearean gangland sagas to grand visual rhapsodies.",
    description:
      "An evocative cinematic continuum encompassing Golden Age humanist classics, Shakespearean gangland epics, lush melodramas, and contemporary independent groundbreakers that redefine mainstream Indian cinema.",
    language: "hi",
    originCountry: "IN",
    voteCountFloor: 25,
    keyDirectors: [
      { id: 85670, name: "Anurag Kashyap" },
      { id: 87550, name: "Vishal Bhardwaj" },
      { id: 42804, name: "Sanjay Leela Bhansali" },
      { id: 125354, name: "Guru Dutt" },
      { id: 1034447, name: "Shoojit Sircar" },
    ],
  },
  {
    id: "tollywood",
    name: "Tollywood",
    nativeOrSub: "Telugu Cinema · తెలుగు సినిమా",
    era: "1980–Present",
    tagline: "Mythic visual scale, mass heroic storytelling, and breathtaking kinetic spectacle.",
    description:
      "The undisputed powerhouse of grand mythological canvas, operatic heroic grandeur, and kinetic mass cinema. Tollywood has captured global audiences with its unapologetic theatricality, emotional excess, and epic visual scale.",
    language: "te",
    originCountry: "IN",
    voteCountFloor: 20,
    keyDirectors: [
      { id: 147021, name: "S.S. Rajamouli" },
      { id: 237051, name: "Sukumar" },
      { id: 116923, name: "Trivikram Srinivas" },
      { id: 584327, name: "Singeetam Srinivasa Rao" },
    ],
  },
  {
    id: "french",
    name: "French Cinema",
    nativeOrSub: "Cinéma Français",
    era: "1930–Present",
    tagline: "Cradle of film grammar, Nouvelle Vague deconstruction, and provocative auteur modernism.",
    description:
      "From the birth of the medium with the Lumière brothers through Jean Renoir's poetic realism, the radical jump cuts of the French New Wave, to contemporary philosophical romance and transgressive auteur expressions.",
    language: "fr",
    originCountry: "FR",
    voteCountFloor: 40,
    keyDirectors: [
      { id: 3776, name: "Jean-Luc Godard" },
      { id: 1650, name: "François Truffaut" },
      { id: 6817, name: "Agnès Varda" },
      { id: 1533, name: "Robert Bresson" },
      { id: 107661, name: "Céline Sciamma" },
    ],
  },
  {
    id: "italian",
    name: "Italian Cinema",
    nativeOrSub: "Cinema Italiano",
    era: "1945–Present",
    tagline: "Neorealist street poetry, Felliniesque memory carnivals, and sensory Giallo stylization.",
    description:
      "Italian cinema rebuilt cinematic grammar after WWII. De Sica and Rossellini brought the camera to impoverished ruins; Fellini transformed cinema into a grand circus of memory; Leone and Antonioni reinvented silence, space, and time.",
    language: "it",
    originCountry: "IT",
    voteCountFloor: 30,
    keyDirectors: [
      { id: 4415, name: "Federico Fellini" },
      { id: 4808, name: "Sergio Leone" },
      { id: 10697, name: "Michelangelo Antonioni" },
      { id: 2341, name: "Vittorio De Sica" },
      { id: 2056, name: "Paolo Sorrentino" },
    ],
  },
  {
    id: "spanish",
    name: "Spanish & Latin Cinema",
    nativeOrSub: "Cine Español y Latinoamericano",
    era: "1960–Present",
    tagline: "Almodóvar's vibrant melodrama, magical realism, surrealism, and ferocious political thrillers.",
    description:
      "An intoxicating, emotionally charged tradition bridging Iberian auteur boldness with Latin America's urgent political realities and mythic magical realism across Spain, Mexico, Argentina, and Chile.",
    language: "es",
    voteCountFloor: 30,
    keyDirectors: [
      { id: 309, name: "Pedro Almodóvar" },
      { id: 10828, name: "Guillermo del Toro" },
      { id: 950, name: "Alfonso Cuarón" },
      { id: 1982, name: "Alejandro G. Iñárritu" },
      { id: 11116, name: "Luis Buñuel" },
    ],
  },
  {
    id: "german",
    name: "German Cinema",
    nativeOrSub: "Deutsches Kino",
    era: "1920–Present",
    tagline: "From Weimar Expressionist shadows and New German Cinema to rigorous contemporary realism.",
    description:
      "From the jagged shadows and psychological terror of Weimar Expressionism (Caligari, Metropolis) to the post-war soul-searching of Herzog, Wenders, and Fassbinder, and modern clinical dramas.",
    language: "de",
    originCountry: "DE",
    voteCountFloor: 25,
    keyDirectors: [
      { id: 7098, name: "Werner Herzog" },
      { id: 2303, name: "Wim Wenders" },
      { id: 6011, name: "Michael Haneke" },
      { id: 139, name: "Fritz Lang" },
      { id: 8254, name: "Rainer Werner Fassbinder" },
    ],
  },
  {
    id: "iranian",
    name: "Iranian Cinema",
    nativeOrSub: "Cinema of Iran · سینمای ایران",
    era: "1970–Present",
    tagline: "Lyrical poetic realism, humanist moral mazes, and metafictional docu-dramas.",
    description:
      "Celebrated as one of the most intellectually honest and deeply moving traditions in film history. Iranian cinema operates through sublime simplicity, children's fables, moral dilemmas, and gentle poetic humanism.",
    language: "fa",
    originCountry: "IR",
    voteCountFloor: 15,
    keyDirectors: [
      { id: 119294, name: "Abbas Kiarostami" },
      { id: 229931, name: "Asghar Farhadi" },
      { id: 119293, name: "Jafar Panahi" },
      { id: 119295, name: "Mohsen Makhmalbaf" },
    ],
  },
  {
    id: "chinese-hk",
    name: "Hong Kong & Sinophone",
    nativeOrSub: "Hong Kong, Taiwan & China · 華語電影",
    era: "1970–Present",
    tagline: "Wong Kar-wai's neon ache, kinetic martial arts ballet, and Taiwanese New Wave poetry.",
    description:
      "From Hong Kong's golden era of fluid action mechanics and neon-lit romantic longing to mainland Fifth Generation historical epics and Taiwan's quiet, architectural masterworks.",
    language: "zh|cn|yue",
    voteCountFloor: 30,
    keyDirectors: [
      { id: 12453, name: "Wong Kar-wai" },
      { id: 143035, name: "Edward Yang" },
      { id: 12454, name: "Hou Hsiao-hsien" },
      { id: 607, name: "Zhang Yimou" },
      { id: 1614, name: "John Woo" },
    ],
  },
  {
    id: "bengali-marathi",
    name: "Bengali & Marathi",
    nativeOrSub: "Indian Regional Masters",
    era: "1950–Present",
    tagline: "Satyajit Ray's humanist universalism and vibrant modern Marathi renaissance.",
    description:
      "The intellectual bedrock of Indian parallel cinema. From Satyajit Ray's Apu Trilogy and Ritwik Ghatak's partition grief to the fierce socio-realist renaissance of contemporary Marathi auteurs.",
    language: "bn|mr",
    voteCountFloor: 10,
    keyDirectors: [
      { id: 12160, name: "Satyajit Ray" },
      { id: 543652, name: "Ritwik Ghatak" },
      { id: 1086288, name: "Mrinal Sen" },
      { id: 1265981, name: "Nagraj Manjule" },
      { id: 1361809, name: "Chaitanya Tamhane" },
    ],
  },
  {
    id: "sandalwood",
    name: "Kannada Cinema",
    nativeOrSub: "Sandalwood · ಕನ್ನಡ ಚಿತ್ರರಂಗ",
    era: "1970–Present",
    tagline: "Rich literary roots, folklore epics, and bold indie boundary-pushing.",
    description:
      "Spanning classic literary adaptations and parallel new waves by Girish Kasaravalli to raw indigenous folklore epics and modern visual breakthroughs.",
    language: "kn",
    originCountry: "IN",
    voteCountFloor: 10,
    keyDirectors: [
      { id: 1752058, name: "Rishab Shetty" },
      { id: 2182258, name: "Prashanth Neel" },
      { id: 1086492, name: "Girish Kasaravalli" },
      { id: 2049187, name: "Pawan Kumar" },
    ],
  },
  {
    id: "european",
    name: "European Pan-Cinema",
    nativeOrSub: "Continental Auteur Cinema",
    era: "1940–Present",
    tagline: "Nordic existentialism, Slavic poetic sculpting in time, and Mediterranean passion.",
    description:
      "A vast continental panorama spanning Ingmar Bergman's soul-searching chambers, Andrei Tarkovsky's sculpting in time, Krzysztof Kieślowski's moral dilemmas, and modern Nordic noir.",
    originCountry: "FR|IT|ES|DE|GB|SE|DK|NO|PL|NL|BE|AT|CH",
    voteCountFloor: 35,
    keyDirectors: [
      { id: 6648, name: "Ingmar Bergman" },
      { id: 8452, name: "Andrei Tarkovsky" },
      { id: 1532, name: "Krzysztof Kieślowski" },
      { id: 42, name: "Lars von Trier" },
      { id: 2127, name: "Béla Tarr" },
    ],
  },
  {
    id: "animation",
    name: "Animation Artistry",
    nativeOrSub: "Hand-drawn, Stop-Motion & CGI Wonders",
    era: "1937–Present",
    tagline: "From Ghibli's hand-painted pastoral dreams to boundary-pushing avant-garde animation.",
    description:
      "Animation as pure, unbound cinematic language. Explore Studio Ghibli's pastoral masterworks, French impressionist shorts, claymation wonders, and modern anime masterpieces.",
    genres: [16],
    voteCountFloor: 50,
    keyDirectors: [
      { id: 608, name: "Hayao Miyazaki" },
      { id: 2542, name: "Isao Takahata" },
      { id: 14689, name: "Satoshi Kon" },
      { id: 64151, name: "Makoto Shinkai" },
      { id: 12890, name: "Pete Docter" },
    ],
  },
  {
    id: "scifi",
    name: "Sci-Fi & Speculative",
    nativeOrSub: "Cosmic, Dystopian & Temporal Visions",
    era: "1927–Present",
    tagline: "Temporal paradoxes, existential alien encounters, and cybernetic futures.",
    description:
      "The cinema of radical imagination and existential speculation. From Tarkovsky's Solaris and Kubrick's 2001 to cyberpunk dystopias, time-travel labyrinths, and philosophical cosmic contact.",
    genres: [878],
    voteCountFloor: 60,
    keyDirectors: [
      { id: 240, name: "Stanley Kubrick" },
      { id: 578, name: "Ridley Scott" },
      { id: 137427, name: "Denis Villeneuve" },
      { id: 525, name: "Christopher Nolan" },
    ],
  },
  {
    id: "horror",
    name: "Horror & Psychological Dread",
    nativeOrSub: "Atmospheric, Supernatural & Body Horror",
    era: "1922–Present",
    tagline: "Folk horror rituals, slow-burn atmospheric dread, and psychological decay.",
    description:
      "Cinema that confronts our deepest ancestral terrors. From German silent vampires and Italian Giallo blood ballets to Cronenbergian body horror and modern elevated folk dread.",
    genres: [27],
    voteCountFloor: 50,
    keyDirectors: [
      { id: 11770, name: "John Carpenter" },
      { id: 224, name: "David Cronenberg" },
      { id: 5602, name: "David Lynch" },
      { id: 1184497, name: "Ari Aster" },
      { id: 1373516, name: "Robert Eggers" },
    ],
  },
  {
    id: "deep_cuts",
    name: "Cult & Deep Cuts",
    nativeOrSub: "Hidden Masterpieces & Overlooked Cinema",
    era: "All Time",
    tagline: "High-rated, under-seen cinematic gems that bypass generic recommendation algorithms.",
    description:
      "Filtered specifically for exquisite craft and consensus critical acclaim, but without the millions of votes of mainstream blockbusters. The true cinephile's goldmine.",
    voteCountFloor: 50,
    keyDirectors: [],
  },
];

export function getCinemaWorld(id?: string): CinemaWorldDef | undefined {
  if (!id) return undefined;
  return CINEMA_WORLDS_LIST.find((w) => w.id.toLowerCase() === id.toLowerCase());
}

export interface CurationPreset {
  id: string;
  label: string;
  description: string;
}

export const CURATION_PRESETS: CurationPreset[] = [
  { id: "all", label: "All Films", description: "Standard comprehensive catalogue" },
  { id: "popular", label: "🔥 Popular", description: "Most watched and trending" },
  { id: "top_rated", label: "★ Consensus Masterpieces", description: "Highest rated by critical consensus" },
  { id: "deep_cuts", label: "✨ Deep Cuts & Gems", description: "High rating with under-seen vote volume" },
  { id: "classics", label: "⏳ Golden Age & Classics", description: "Pre-1985 restored and foundational cinema" },
  { id: "new_releases", label: "🆕 Recent Releases", description: "Films released recently" },
];
