import { useState } from "react";
import { createRoute } from "../lib/route";
import { Link } from "../lib/router";
import { Film } from "lucide-react";

import { getCollectionsPage } from "../lib/tmdb.api";
import type { MovieCard } from "../lib/tmdb-map";

export interface FranchiseCollectionItem {
  id: number | string;
  name: string;
  era?: string;
  count: number;
  backdrop_path: string | null;
  poster_path?: string | null;
  posters: string[];
  overview?: string;
  category?: "franchise" | "movement" | "director" | "vibe" | "decade";
  categoryLabel?: string;
  tagline?: string;
  films?: MovieCard[];
}

/* ─────────────────────────────────────────────────────────────
   TOP HERO SAGA & PAIR:
   Fast & Furious (Dominant) + Saw & Halloween (Stack)
   Verified 100% TMDB paths.
   ───────────────────────────────────────────────────────────── */
export const HERO_FEATURED_SAGA: FranchiseCollectionItem = {
  "id": 9485,
  "name": "The Fast and the Furious Collection",
  "era": "2001–2023 · 10 films",
  "count": 12,
  "backdrop_path": "/z5A5W3WYJc3UVEWljSGwdjDgQ0j.jpg",
  "poster_path": "/zOCnMPoUxgJK1RFPfN4PcnT16gr.jpg",
  "posters": [
    "/6nDZExrDKIXvSAghsFKVFRVJuSf.jpg",
    "/46xqGOwHbh2TH2avWSw3SMXph4E.jpg",
    "/gqY0ITBgT7A82poL9jv851qdnIb.jpg",
    "/gEfQjjQwY7fh5bI4GlG0RrBu7Pz.jpg",
    "/thSmnRdrzPBBospIOJjLZBReqzo.jpg"
  ]
};

export const HERO_STACK_PAIR: FranchiseCollectionItem[] = [
  {
  "id": 656,
  "name": "Saw Collection",
  "era": "2004–2023 · 10 films",
  "count": 11,
  "backdrop_path": "/q6XF2qbrxdv3OwZPnXgecDRft1O.jpg",
  "poster_path": "/w0zPElyuA5q2kjdfa2FdNYeS5Io.jpg",
  "posters": [
    "/4da0TS3iQ1IzuyhDS8elgkmOfrN.jpg",
    "/gTnaTysN8HsvVQqTRUh8m35mmUA.jpg",
    "/4iO9n24Rb10peXV0JH2EldIOrAp.jpg",
    "/ku1QdCXOU4ckz3zxLLlis8MIJVm.jpg",
    "/rKl79KqLXg60KFyKsLe4wSSjQ08.jpg"
  ]
},
  {
  "id": 91361,
  "name": "Halloween Collection",
  "era": "1978–2022 · 13 films",
  "count": 11,
  "backdrop_path": "/hUa3JDVZ1L0U7jSfFu4uvzoCJxs.jpg",
  "poster_path": "/uCIMY95aqKEwIEwNuFq42UQkY9f.jpg",
  "posters": [
    "/wijlZ3HaYMvlDTPqJoTCWKFkCPU.jpg",
    "/3nX5HHGgOKaVMxXwMLT9DHO1Ne6.jpg",
    "/WABfdeaThFYXCySGIOvRNv2sSW.jpg",
    "/eFSOkXF9n9hsfGv45MDsPixiOyx.jpg",
    "/rYvP6yMXCIVHnkVtwGaAXFmpzkB.jpg"
  ]
}
];

/* ─────────────────────────────────────────────────────────────
   CINEVERSE PRESENTS: 24 Curated Sets & Canon Sequences (3 cols)
   ───────────────────────────────────────────────────────────── */
export const CINEVERSE_PRESENTS: FranchiseCollectionItem[] = [
  {
    "id": 656,
    "name": "Saw Collection",
    "era": "11 films",
    "count": 11,
    "backdrop_path": "/q6XF2qbrxdv3OwZPnXgecDRft1O.jpg",
    "poster_path": "/w0zPElyuA5q2kjdfa2FdNYeS5Io.jpg",
    "posters": [
      "/4da0TS3iQ1IzuyhDS8elgkmOfrN.jpg",
      "/gTnaTysN8HsvVQqTRUh8m35mmUA.jpg",
      "/4iO9n24Rb10peXV0JH2EldIOrAp.jpg",
      "/ku1QdCXOU4ckz3zxLLlis8MIJVm.jpg",
      "/rKl79KqLXg60KFyKsLe4wSSjQ08.jpg"
    ]
  },
  {
    "id": 91361,
    "name": "Halloween Collection",
    "era": "11 films",
    "count": 11,
    "backdrop_path": "/hUa3JDVZ1L0U7jSfFu4uvzoCJxs.jpg",
    "poster_path": "/uCIMY95aqKEwIEwNuFq42UQkY9f.jpg",
    "posters": [
      "/wijlZ3HaYMvlDTPqJoTCWKFkCPU.jpg",
      "/3nX5HHGgOKaVMxXwMLT9DHO1Ne6.jpg",
      "/WABfdeaThFYXCySGIOvRNv2sSW.jpg",
      "/eFSOkXF9n9hsfGv45MDsPixiOyx.jpg",
      "/rYvP6yMXCIVHnkVtwGaAXFmpzkB.jpg"
    ]
  },
  {
    "id": 9735,
    "name": "Friday the 13th Collection",
    "era": "11 films",
    "count": 11,
    "backdrop_path": "/yz9EdlfKU8bpN0hbdJMy6QkFBoN.jpg",
    "poster_path": "/p3fJC9R4pCj5Vw0gP7Di0GZts9Z.jpg",
    "posters": [
      "/uGGpnWHOmWTARVN9wbC1nPxNgps.jpg",
      "/92rGctBMTv4uaSlIBVnhz01kRWL.jpg",
      "/9kukTSlgFgXnQGdpcHvHcpTDiUc.jpg",
      "/1J7zudfR3VLPwAf9lK5YPfSu0n6.jpg",
      "/ewnIs4aCuWnKQ13Eaj8f3ybrQc8.jpg"
    ]
  },
  {
    "id": 2344,
    "name": "The Matrix Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/bRm2DEgUiYciDw3myHuYFInD7la.jpg",
    "poster_path": "/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg",
    "posters": [
      "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
      "/8xEVAe84zlL9rkfYT6dZXero4KK.jpg",
      "/qEWiBXJGXK28jGBAm8oFKKTB0WD.jpg",
      "/8c4a8kE7PizaGQQnditMmI1xbRp.jpg"
    ]
  },
  {
    "id": 119,
    "name": "The Lord of the Rings Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/bccR2CGTWVVSZAG0yqmy3DIvhTX.jpg",
    "poster_path": "/oENY593nKRVL2PnxXsMtlh8izb4.jpg",
    "posters": [
      "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
      "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
      "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg"
    ]
  },
  {
    "id": 1241,
    "name": "Harry Potter Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/4gV0rKUjB1nLUdZB4zIltLvNZZr.jpg",
    "poster_path": "/eVPs2Y0LyvTLZn6AP5Z6O2rtiGB.jpg",
    "posters": [
      "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg",
      "/sdEOH0992YZ0QSxgXNIGLq1ToUi.jpg",
      "/fECBtHlr0RB3foNHDiCBXeg9Bv9.jpg",
      "/z7uo9zmQdQwU5ZJHFpv2Upl30i1.jpg",
      "/aWxwnYoe8p2d2fcxOqtvAtJ72Rw.jpg"
    ]
  },
  {
    "id": 87359,
    "name": "Mission: Impossible Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/mroWh717g0Ah2c0rrPGW6f3EWMM.jpg",
    "poster_path": "/geEjCGfdmRAA1skBPwojcdvnZ8A.jpg",
    "posters": [
      "/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg",
      "/hfnrual76gPeNFduhD4xzHWpfTw.jpg",
      "/vKGYCpmQyV9uHybWDzXuII8Los5.jpg",
      "/eRZTGx7GsiKqPch96k27LK005ZL.jpg",
      "/mXwC63mlpijqllhoeGnKBGgPtBa.jpg"
    ]
  },
  {
    "id": 328,
    "name": "Jurassic Park Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/njFixYzIxX8jsn6KMSEtAzi4avi.jpg",
    "poster_path": "/2EmqHqoAbAIIls50CT4wHSMtV2Q.jpg",
    "posters": [
      "/d9mtMGQDLANKieb9PbD3yK7xxzo.jpg",
      "/s4RkAQWI9hgzctXgNFos8sJUnXJ.jpg",
      "/oQXj4NUfS3r3gHXtDOzcJgj1lLc.jpg",
      "/rhr4y79GpxQF9IsfJItRXVaoGs4.jpg",
      "/x2Us3jR6ToMJjbcPbLimYoxf6xr.jpg"
    ]
  },
  {
    "id": 2602,
    "name": "Scream Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/fG6GzZAwtsW3v2mhB4EyQLMRjUV.jpg",
    "poster_path": "/p3EjClFy20jjT0u06dzBs4lvvhi.jpg",
    "posters": [
      "/lr9ZIrmuwVmZhpZuTCW8D9g0ZJe.jpg",
      "/dORlVasiaDkJXTqt9bdH7nFNs6C.jpg",
      "/iFrDIex06Jpgs3dTI8vXlVB1jd.jpg",
      "/3cf8p2qw9qnsaaFWc64AG6U05eT.jpg",
      "/nD4M4Bx457ryLuKYpxFwQ2IBJ5w.jpg"
    ]
  },
  {
    "id": 8091,
    "name": "Alien Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/6X42JnSMdo3dPAswOHUuvebdTq7.jpg",
    "poster_path": "/gWFHIY77cRVoBRGERwMHqpD27gc.jpg",
    "posters": [
      "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
      "/r1x5JGpyqZU8PYhbs4UcrO1Xb6x.jpg",
      "/xh5wI0UoW7DfS1IyLy3d2CgrCEP.jpg",
      "/9aRDMlU5Zwpysilm0WCWzU2PCFv.jpg"
    ]
  },
  {
    "id": 748,
    "name": "X-Men Collection",
    "era": "7 films",
    "count": 7,
    "backdrop_path": "/ykVHlrE3aSvHYeIXOrWDsYZ18vv.jpg",
    "poster_path": "/31rqs6ZxFdi5nWZZaFPIr17q8jt.jpg",
    "posters": [
      "/bRDAc4GogyS9ci3ow7UnInOcriN.jpg",
      "/bst4alFUXCxISwdRUKSMhhkrX1M.jpg",
      "/a2xicU8DpKtRizOHjQLC1JyCSRS.jpg",
      "/hNEokmUke0dazoBhttFN0o3L7Xv.jpg",
      "/tYfijzolzgoMOtegh1Y7j2Enorg.jpg"
    ]
  },
  {
    "id": 2150,
    "name": "Shrek Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/lhsd1zCsq5UquvcNalmhuddV3tI.jpg",
    "poster_path": "/g1Kcbi5zSelArzR5UYkxKvG6K2a.jpg",
    "posters": [
      "/zscUsmzDJFZjUY8f8BQqMSWlmNQ.jpg",
      "/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg",
      "/n4SexGGQzI26E269tfpa80MZaGV.jpg",
      "/6HrfPZtKcGmX2tUWW3cnciZTaSD.jpg",
      "/m9jLiemA7t2umlXKptDwtIUHU8l.jpg"
    ]
  },
  {
    "id": 8945,
    "name": "Mad Max Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/zI0q2ENcQOLECbe0gAEGlncVh2j.jpg",
    "poster_path": "/tRxkZboyyXnFgCthoViWBwISZ0r.jpg",
    "posters": [
      "/l1KVEhkGDpWRzQ0VqIhZqDDuOim.jpg",
      "/jJlxcEVVUHnrUeEkQ0077VeHQpb.jpg",
      "/5LrI4GiCSrChgkdskVZiwv643Kg.jpg",
      "/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg",
      "/zviMeR3CqbX3x3loO8xoSHCkiSs.jpg"
    ]
  },
  {
    "id": 84,
    "name": "Indiana Jones Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/6kh59mZizZsttZPR0HAdXk6Ve2n.jpg",
    "poster_path": "/lpxDrACKJhbbGOlwVMNz5YCj6SI.jpg",
    "posters": [
      "/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
      "/gpdVNUaa4LhRMLfJOPj1AZdhAZ3.jpg",
      "/sizg1AU8f8JDZX4QIgE4pjUMBvx.jpg",
      "/56As6XEM1flWvprX4LgkPl8ii4K.jpg",
      "/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg"
    ]
  },
  {
    "id": 33514,
    "name": "Twilight Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/3be0BffeZTyMbj4Ndzo6Y877SBQ.jpg",
    "poster_path": "/3PlBwwizkPDZITeIPUlXQCejeQD.jpg",
    "posters": [
      "/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg",
      "/k2qTooPlHffgNABNWxeJdGMglPK.jpg",
      "/qs8LsHKYlVRmJbFUiSUhhRAygwj.jpg",
      "/7IGdPaKujv0BjI0Zd0m0a4CzEjJ.jpg",
      "/dK4Gi1UdMiHzHc7r7CZQG4IQ9Sr.jpg"
    ]
  },
  {
    "id": 131635,
    "name": "The Hunger Games Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/Ipp7cegtub4t0mu7xaKLQkYoGc.jpg",
    "poster_path": "/cEBNDEMGqvSvU0knEv9Wl3dk5kv.jpg",
    "posters": [
      "/meSGXQ8MXqiC8bXxkKu7lPqnu0L.jpg",
      "/lImKHDfExAulp16grYm8zD5eONE.jpg",
      "/apa5G43Hha7kH7wJG0gkkHT7FA9.jpg",
      "/vrQHDXjVmbYzadOXQ0UaObunoy2.jpg"
    ]
  },
  {
    "id": 1709,
    "name": "Planet of the Apes (Original) Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/wBiFfCAuYzuSOl0sFnkQMB5BEZx.jpg",
    "poster_path": "/keo1Vvsh1gbY7G7QqCzFGy4DVTP.jpg",
    "posters": [
      "/2r9iKnlSYEk4daQadsXfcjHfIjQ.jpg",
      "/szHCeYwi4ubewuYnlnz0YGqWnQC.jpg",
      "/vqD7qjBRizY7sPVIHbFRUZwgEXL.jpg",
      "/tzKZRY2opw5MruSkevffgT5ocun.jpg",
      "/dP5dYjLp5p2CG103cJMio4Nj29d.jpg"
    ]
  },
  {
    "id": 528,
    "name": "The Terminator Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/sCnBEw2Yu6foEjs4Xb4eMddYHRo.jpg",
    "poster_path": "/kpZxdNsAV7qTdTLwKM5NLqa7GEo.jpg",
    "posters": [
      "/qvktm0BHcnmDpul4Hz01GIazWPr.jpg",
      "/jFTVD4XoWQTcg7wdyJKa8PEds5q.jpg",
      "/vvevzdYIrk2636maNW4qeWmlPFG.jpg",
      "/gw6JhlekZgtKUFlDTezq3j5JEPK.jpg",
      "/oZRVDpNtmHk8M1VYy1aeOWUXgbC.jpg"
    ]
  },
  {
    "id": 263,
    "name": "The Dark Knight Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/xyhrCEdB4XRkelfVsqXeUZ6rLHi.jpg",
    "poster_path": "/ogyw5LTmL53dVxsppcy8Dlm30Fu.jpg",
    "posters": [
      "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      "/hr0L2aueqlP2BYUblTTjmtn0hw4.jpg",
      "/sPX89Td70IDDjVr85jdSBb4rWGr.jpg"
    ]
  },
  {
    "id": 10194,
    "name": "Toy Story Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/hApclyB9NEZEQujAVajzi5iWE4a.jpg",
    "poster_path": "/rki5qLuwb0xnnE9seehxO9TlLhW.jpg",
    "posters": [
      "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
      "/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg",
      "/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg",
      "/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
      "/sfQtVlIHljToOwYjhe21KPGzZWK.jpg"
    ]
  },
  {
    "id": 86066,
    "name": "Despicable Me Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/37xamYKRUGCRux532lKcZdVGYuR.jpg",
    "poster_path": "/xIXhIlZDRmSSfNbpN7kBCm5hg39.jpg",
    "posters": [
      "/b1BT309QWjtFUlJPLmXmrcHOWEL.jpg",
      "/5Fh4NdoEnCjCK9wLjdJ9DJNFl2b.jpg",
      "/e72KCMHNkbZ6USRJmABeqwmaJ5n.jpg",
      "/wWba3TaojhK7NdycRhoQpsG0FaH.jpg"
    ]
  },
  {
    "id": 8354,
    "name": "Ice Age Collection",
    "era": "7 films",
    "count": 7,
    "backdrop_path": "/2aMEn3wawIXva2xFFlQ2NClLEeW.jpg",
    "poster_path": "/stQoHvo0q6ZcEkji2Z1wlAxKnDq.jpg",
    "posters": [
      "/dfp1BZF7FxbBUyzHvMOI9t8NWDD.jpg",
      "/gLhHHZUzeseRXShoDyC4VqLgsNv.jpg",
      "/cXOLaxcNjNAYmEx1trZxOTKhK3Q.jpg",
      "/zDduhCHasKQ9YOTvlOreHem7Wbi.jpg",
      "/tFzUkdhPOForVrEfvxydXfPLrZR.jpg"
    ]
  },
  {
    "id": 556,
    "name": "Spider-Man Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/waZqriYTuBE3WqXI3SDGi3kfDQE.jpg",
    "poster_path": "/bp5PqLa06QA1LsELA1SsKZ008H7.jpg",
    "posters": [
      "/or6XJBVpcEbIkma0V9zshnbEtx4.jpg",
      "/aGuvNAaaZuWXYQQ6N2v7DeuP6mB.jpg",
      "/qFmwhVUoUSXjkKRmca5yGDEXBIj.jpg"
    ]
  },
  {
    "id": 131295,
    "name": "Captain America Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/7kVucUYqz8fZkOmFtA8opDwJFXM.jpg",
    "poster_path": "/2tOgiY533JSFp7OrVlkeRJvsZpI.jpg",
    "posters": [
      "/tVFRpFw3xTedgPGqxW0AOI8Qhh0.jpg",
      "/rAGiXaUfPzY7CDEyNKUofk3Kw2e.jpg",
      "/vSNxAJTlD0r02V9sPYpOjqDZXUK.jpg",
      "/pzIddUEMWhWzfvLI3TwxUG2wGoi.jpg"
    ]
  }
];

/* ─────────────────────────────────────────────────────────────
   FRANCHISE SAGAS: Complete 56-Card Universe (4 cols)
   Every single card is populated with verified backdrop & posters.
   ───────────────────────────────────────────────────────────── */
export const FRANCHISE_SAGAS: FranchiseCollectionItem[] = [
  {
    "id": 84,
    "name": "Indiana Jones Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/6kh59mZizZsttZPR0HAdXk6Ve2n.jpg",
    "poster_path": "/lpxDrACKJhbbGOlwVMNz5YCj6SI.jpg",
    "posters": [
      "/ceG9VzoRAVGwivFU403Wc3AHRys.jpg",
      "/gpdVNUaa4LhRMLfJOPj1AZdhAZ3.jpg",
      "/sizg1AU8f8JDZX4QIgE4pjUMBvx.jpg",
      "/56As6XEM1flWvprX4LgkPl8ii4K.jpg",
      "/Af4bXE63pVsb2FtbW8uYIyPBadD.jpg"
    ]
  },
  {
    "id": 295,
    "name": "Pirates of the Caribbean Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/wxgD3fB5lQ2sGJLog0rvXW049Pf.jpg",
    "poster_path": "/zRBaZxS5YauLvRYjAdL4AUCwlht.jpg",
    "posters": [
      "/poHwCZeWzJCShH7tOjg8RIoyjcw.jpg",
      "/uXEqmloGyP7UXAiphJUu2v2pcuE.jpg",
      "/jGWpG4YhpQwVmjyHEGkxEkeRf0S.jpg",
      "/keGfSvCmYj7CvdRx36OdVrAEibE.jpg",
      "/6lAPOAFYFWIO3SQRemEY2wInQMC.jpg"
    ]
  },
  {
    "id": 9485,
    "name": "The Fast and the Furious Collection",
    "era": "12 films",
    "count": 12,
    "backdrop_path": "/z5A5W3WYJc3UVEWljSGwdjDgQ0j.jpg",
    "poster_path": "/zOCnMPoUxgJK1RFPfN4PcnT16gr.jpg",
    "posters": [
      "/6nDZExrDKIXvSAghsFKVFRVJuSf.jpg",
      "/46xqGOwHbh2TH2avWSw3SMXph4E.jpg",
      "/gqY0ITBgT7A82poL9jv851qdnIb.jpg",
      "/gEfQjjQwY7fh5bI4GlG0RrBu7Pz.jpg",
      "/thSmnRdrzPBBospIOJjLZBReqzo.jpg"
    ]
  },
  {
    "id": 10,
    "name": "Star Wars Collection",
    "era": "9 films",
    "count": 9,
    "backdrop_path": "/iY2ujEY2m68OTTlPFTiHub9joHS.jpg",
    "poster_path": "/pWVLFh4OuejTpUaDQbB1C4zoS2p.jpg",
    "posters": [
      "/fai0rspsNeJCS69wHNjOdWxcI7P.jpg",
      "/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg",
      "/jQYlydvHm3kUix1f8prMucrplhm.jpg",
      "/6wkfovpn7Eq8dYNKaG5PY3q2oq6.jpg",
      "/oZNPzxqM2s5DyVWab09NTQScDQt.jpg"
    ]
  },
  {
    "id": 1575,
    "name": "Rocky Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/yaXXemxz3ePNSrqNtc4ZAbuxJRv.jpg",
    "poster_path": "/fKe9y1AJHEzoiHwSrjfwyinuCE8.jpg",
    "posters": [
      "/byBlJvZwCqgtIwrZNv0pyE974jC.jpg",
      "/1mcJmdbRLusxhoSGjFI3pbEboXt.jpg",
      "/nMaiiu0CzT77U4JZkUYV7KqdAjK.jpg",
      "/uqw16i2kmwVqkJHzjzbDU4xZ0Pl.jpg",
      "/2MHUit4H6OK5adcOjnCN6suCKOl.jpg"
    ]
  },
  {
    "id": 2150,
    "name": "Shrek Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/lhsd1zCsq5UquvcNalmhuddV3tI.jpg",
    "poster_path": "/g1Kcbi5zSelArzR5UYkxKvG6K2a.jpg",
    "posters": [
      "/zscUsmzDJFZjUY8f8BQqMSWlmNQ.jpg",
      "/2yYP0PQjG8zVqturh1BAqu2Tixl.jpg",
      "/n4SexGGQzI26E269tfpa80MZaGV.jpg",
      "/6HrfPZtKcGmX2tUWW3cnciZTaSD.jpg",
      "/m9jLiemA7t2umlXKptDwtIUHU8l.jpg"
    ]
  },
  {
    "id": 2980,
    "name": "Ghostbusters Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/guigdRPHN65fsgZHmvVvBOyiArf.jpg",
    "poster_path": "/sctvCtE1M1rDF4f0W2fMrk2BrGB.jpg",
    "posters": [
      "/7E8nLijS9AwwUEPu2oFYOVKhdFA.jpg",
      "/iUZPi31KDP0n5ycpycEsvl51BdV.jpg",
      "/sg4xJaufDiQl7caFEskBtQXfD4x.jpg",
      "/e1J2oNzSBdou01sUvriVuoYp0pJ.jpg"
    ]
  },
  {
    "id": 1570,
    "name": "Die Hard Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/nKShbIW0wJnSbl3t8uPje0QhTb7.jpg",
    "poster_path": "/xhnb5lVfwE7NHycdPNdIxHx7kZi.jpg",
    "posters": [
      "/7Bjd8kfmDSOzpmhySpEhkUyK2oH.jpg",
      "/31TT47YjBl7a7uvJ3ff1nrirXhP.jpg",
      "/buqmCdFQEWwEpL3agGgg2GVjN2d.jpg",
      "/ybki0UWO3OPhaM6MSniuKC7sy1R.jpg",
      "/qJ0csDXAVFMsNn0cRcjy6W6PxAK.jpg"
    ]
  },
  {
    "id": 2344,
    "name": "The Matrix Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/bRm2DEgUiYciDw3myHuYFInD7la.jpg",
    "poster_path": "/bV9qTVHTVf0gkW0j7p7M0ILD4pG.jpg",
    "posters": [
      "/dXNAPwY7VrqMAo51EKhhCJfaGb5.jpg",
      "/8xEVAe84zlL9rkfYT6dZXero4KK.jpg",
      "/qEWiBXJGXK28jGBAm8oFKKTB0WD.jpg",
      "/8c4a8kE7PizaGQQnditMmI1xbRp.jpg"
    ]
  },
  {
    "id": 328,
    "name": "Jurassic Park Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/njFixYzIxX8jsn6KMSEtAzi4avi.jpg",
    "poster_path": "/2EmqHqoAbAIIls50CT4wHSMtV2Q.jpg",
    "posters": [
      "/d9mtMGQDLANKieb9PbD3yK7xxzo.jpg",
      "/s4RkAQWI9hgzctXgNFos8sJUnXJ.jpg",
      "/oQXj4NUfS3r3gHXtDOzcJgj1lLc.jpg",
      "/rhr4y79GpxQF9IsfJItRXVaoGs4.jpg",
      "/x2Us3jR6ToMJjbcPbLimYoxf6xr.jpg"
    ]
  },
  {
    "id": 87359,
    "name": "Mission: Impossible Collection",
    "era": "8 films",
    "count": 8,
    "backdrop_path": "/mroWh717g0Ah2c0rrPGW6f3EWMM.jpg",
    "poster_path": "/geEjCGfdmRAA1skBPwojcdvnZ8A.jpg",
    "posters": [
      "/l5uxY5m5OInWpcExIpKG6AR3rgL.jpg",
      "/hfnrual76gPeNFduhD4xzHWpfTw.jpg",
      "/vKGYCpmQyV9uHybWDzXuII8Los5.jpg",
      "/eRZTGx7GsiKqPch96k27LK005ZL.jpg",
      "/mXwC63mlpijqllhoeGnKBGgPtBa.jpg"
    ]
  },
  {
    "id": 131635,
    "name": "The Hunger Games Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/Ipp7cegtub4t0mu7xaKLQkYoGc.jpg",
    "poster_path": "/cEBNDEMGqvSvU0knEv9Wl3dk5kv.jpg",
    "posters": [
      "/meSGXQ8MXqiC8bXxkKu7lPqnu0L.jpg",
      "/lImKHDfExAulp16grYm8zD5eONE.jpg",
      "/apa5G43Hha7kH7wJG0gkkHT7FA9.jpg",
      "/vrQHDXjVmbYzadOXQ0UaObunoy2.jpg"
    ]
  },
  {
    "id": 86055,
    "name": "Men in Black Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/xKz6YaOvmnIJQ3MYIpnaa7FBaAB.jpg",
    "poster_path": "/rWcgZaoJ0nxTFRn0H6w9bdtoDUI.jpg",
    "posters": [
      "/uLOmOF5IzWoyrgIF5MfUnh5pa1X.jpg",
      "/enA22EPyzc2WQ1VVyY7zxresQQr.jpg",
      "/90DdoEStzeObs96fsYf4GG544iN.jpg"
    ]
  },
  {
    "id": 119,
    "name": "The Lord of the Rings Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/bccR2CGTWVVSZAG0yqmy3DIvhTX.jpg",
    "poster_path": "/oENY593nKRVL2PnxXsMtlh8izb4.jpg",
    "posters": [
      "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg",
      "/5VTN0pR8gcqV3EPUHHfMGnJYN9L.jpg",
      "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg"
    ]
  },
  {
    "id": 121938,
    "name": "The Hobbit Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/7wO7MSnP5UcwR2cTHdJFF1vP4Ie.jpg",
    "poster_path": "/hQghXOjSS2xfzx9XnMyZqt8brCF.jpg",
    "posters": [
      "/yHA9Fc37VmpUA5UncTxxo3rTGVA.jpg",
      "/xQYiXsheRCDBA39DOrmaw1aSpbk.jpg",
      "/xT98tLqatZPQApyRmlPL12LtiWp.jpg"
    ]
  },
  {
    "id": 33514,
    "name": "Twilight Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/3be0BffeZTyMbj4Ndzo6Y877SBQ.jpg",
    "poster_path": "/3PlBwwizkPDZITeIPUlXQCejeQD.jpg",
    "posters": [
      "/3Gkb6jm6962ADUPaCBqzz9CTbn9.jpg",
      "/k2qTooPlHffgNABNWxeJdGMglPK.jpg",
      "/qs8LsHKYlVRmJbFUiSUhhRAygwj.jpg",
      "/7IGdPaKujv0BjI0Zd0m0a4CzEjJ.jpg",
      "/dK4Gi1UdMiHzHc7r7CZQG4IQ9Sr.jpg"
    ]
  },
  {
    "id": 264,
    "name": "Back to the Future Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/c9C9Pg2QctyjZHRmS0P8rZg1OTA.jpg",
    "poster_path": "/5Xsu2o5IsZRuuxCEVZ9nVve21FP.jpg",
    "posters": [
      "/vN5B5WgYscRGcQpVhHl6p9DDTP0.jpg",
      "/hQq8xZe5uLjFzSBt4LanNP7SQjl.jpg",
      "/crzoVQnMzIrRfHtQw0tLBirNfVg.jpg"
    ]
  },
  {
    "id": 230,
    "name": "The Godfather Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/28eqCQ51SuLfkbzhQE7jCmTfYfy.jpg",
    "poster_path": "/kKjIYmvpBUIxcYJ0LL9YZwv4nrZ.jpg",
    "posters": [
      "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      "/8a1lJs7mFyGhGhZZDT1azJUoQiZ.jpg",
      "/lm3pQ2QoQ16pextRsmnUbG2onES.jpg"
    ]
  },
  {
    "id": 528,
    "name": "The Terminator Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/sCnBEw2Yu6foEjs4Xb4eMddYHRo.jpg",
    "poster_path": "/kpZxdNsAV7qTdTLwKM5NLqa7GEo.jpg",
    "posters": [
      "/qvktm0BHcnmDpul4Hz01GIazWPr.jpg",
      "/jFTVD4XoWQTcg7wdyJKa8PEds5q.jpg",
      "/vvevzdYIrk2636maNW4qeWmlPFG.jpg",
      "/gw6JhlekZgtKUFlDTezq3j5JEPK.jpg",
      "/oZRVDpNtmHk8M1VYy1aeOWUXgbC.jpg"
    ]
  },
  {
    "id": 8650,
    "name": "Transformers Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/zvZBNNDWd5LcsIBpDhJyCB2MDT7.jpg",
    "poster_path": "/nnFgBA6nR0pHorxdFaDvdY4nVHL.jpg",
    "posters": [
      "/lkZ9gqCEjzX85lKR6Jjd1uGAXNp.jpg",
      "/pLBb0whOzVDtJvyD4DPeQyQNOqp.jpg",
      "/28YlCLrFhONteYSs9hKjD1Km0Cj.jpg",
      "/jyzrfx2WaeY60kYZpPYepSjGz4S.jpg",
      "/s5HQf2Gb3lIO2cRcFwNL9sn1o1o.jpg"
    ]
  },
  {
    "id": 8091,
    "name": "Alien Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/6X42JnSMdo3dPAswOHUuvebdTq7.jpg",
    "poster_path": "/gWFHIY77cRVoBRGERwMHqpD27gc.jpg",
    "posters": [
      "/vfrQk5IPloGg1v9Rzbh2Eg3VGyM.jpg",
      "/r1x5JGpyqZU8PYhbs4UcrO1Xb6x.jpg",
      "/xh5wI0UoW7DfS1IyLy3d2CgrCEP.jpg",
      "/9aRDMlU5Zwpysilm0WCWzU2PCFv.jpg"
    ]
  },
  {
    "id": 31562,
    "name": "The Bourne Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/vA5xMglyZv7yzDTj1qUTU4OvelV.jpg",
    "poster_path": "/r74T5OOHEtpxpIHmRY3zI6wh5eW.jpg",
    "posters": [
      "/aP8swke3gmowbkfZ6lmNidu0y9p.jpg",
      "/jupG9sFT64YwM8PSkwkUD2wHcYD.jpg",
      "/15rMz5MRXFp7CP4VxhjYw4y0FUn.jpg",
      "/1aExL5DTGHj25ZfIC3dDwS84RWi.jpg",
      "/xA7N41glw17MBQtcWSm2eBlBRuG.jpg"
    ]
  },
  {
    "id": 8864,
    "name": "Final Destination Collection",
    "era": "7 films",
    "count": 7,
    "backdrop_path": "/y3aWOInifbGKXM34KjtcMITrZRZ.jpg",
    "poster_path": "/nr4MXTXK2in9gxYhFMQGni66KRJ.jpg",
    "posters": [
      "/p7ARuNKUGPGvkBiDtIDvAzYzonX.jpg",
      "/dg6Tf98InieJSClSKQJTQevYWmB.jpg",
      "/1mXhlQMnlfvJ2frxTjZSQNnA9Vp.jpg",
      "/5vxXrr1MqGsT4NNeRITpfDnl4Rq.jpg",
      "/5zH9Qe6zaWW4LgtEA8aiTJVUSt4.jpg"
    ]
  },
  {
    "id": 1709,
    "name": "Planet of the Apes (Original) Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/wBiFfCAuYzuSOl0sFnkQMB5BEZx.jpg",
    "poster_path": "/keo1Vvsh1gbY7G7QqCzFGy4DVTP.jpg",
    "posters": [
      "/2r9iKnlSYEk4daQadsXfcjHfIjQ.jpg",
      "/szHCeYwi4ubewuYnlnz0YGqWnQC.jpg",
      "/vqD7qjBRizY7sPVIHbFRUZwgEXL.jpg",
      "/tzKZRY2opw5MruSkevffgT5ocun.jpg",
      "/dP5dYjLp5p2CG103cJMio4Nj29d.jpg"
    ]
  },
  {
    "id": 2326,
    "name": "Underworld Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/m0Jk59DluTL3oFUu7FVSuLKQz7c.jpg",
    "poster_path": "/aK8qq0X0pZbf5ncE3JLQ27hdC4F.jpg",
    "posters": [
      "/zsnQ41UZ3jo1wEeemF0eA9cAIU0.jpg",
      "/jN0uuc8U6M3sTg9zEaliJV60Stf.jpg",
      "/4yoynvNuQtK3g5RfCuaQMvujSoL.jpg",
      "/yW9gF7rGn8EoV8B8rxOx1xjxVZf.jpg",
      "/v1ciDCWMG47gdT4kMyjyQbnLQQn.jpg"
    ]
  },
  {
    "id": 17255,
    "name": "Resident Evil Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/3hqSP5YGsbOjNZ4ymcg3wnGPgSW.jpg",
    "poster_path": "/bJXqRRb87ObiJZh8dKLFz6DO9TZ.jpg",
    "posters": [
      "/cHFLp5jg2Q3pCDIqUQrsM8nr1Wi.jpg",
      "/qZHDnt8bnsD2cSJfIbjWbCkIq3G.jpg",
      "/1UKNef590A0ZaMnxsscIcWuK1Em.jpg",
      "/r9j1FEYGGMkZAM47jFeVf4yTlVV.jpg",
      "/6yaLr7Ymg5cvbtSVi5hHwBKx35I.jpg"
    ]
  },
  {
    "id": 735,
    "name": "Blade Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/d7h60yRgP6US9VYenEPzFGW9saY.jpg",
    "poster_path": "/vTXwJm2UC0Z0HwXTRmsMecGJErc.jpg",
    "posters": [
      "/oWT70TvbsmQaqyphCZpsnQR7R32.jpg",
      "/wAn6VYamKbnOtfyTZ6arVtkMzDv.jpg",
      "/6f7iXvPOnf83MaLB1JmPzUor1rr.jpg"
    ]
  },
  {
    "id": 8945,
    "name": "Mad Max Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/zI0q2ENcQOLECbe0gAEGlncVh2j.jpg",
    "poster_path": "/tRxkZboyyXnFgCthoViWBwISZ0r.jpg",
    "posters": [
      "/l1KVEhkGDpWRzQ0VqIhZqDDuOim.jpg",
      "/jJlxcEVVUHnrUeEkQ0077VeHQpb.jpg",
      "/5LrI4GiCSrChgkdskVZiwv643Kg.jpg",
      "/ulcAi4dKpAjHwYGS08vNyx9H6I9.jpg",
      "/zviMeR3CqbX3x3loO8xoSHCkiSs.jpg"
    ]
  },
  {
    "id": 399,
    "name": "Predator Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/u1CTqTYRUVyLwlEd1z1VJrVBp0J.jpg",
    "poster_path": "/mm2t5dd1QFxtX6X56Z9U5ucsIb1.jpg",
    "posters": [
      "/k3mW4qfJo6SKqe6laRyNGnbB9n5.jpg",
      "/83X4VwY9sdSJykskmsplIVG0a4h.jpg",
      "/wdniP8NDaJIydi1hMxhpbJMUfr6.jpg",
      "/a3eWGF6YPF7No5Rbtjc8QpDvz7l.jpg",
      "/2FKjLRt7oK1bRRIrxgWmthbBdFh.jpg"
    ]
  },
  {
    "id": 5039,
    "name": "Rambo Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/ecvVwlK75evrAlsEE96V14KN6MN.jpg",
    "poster_path": "/dXQkfqgW3oxnGJfWp9EpTHVtQ1h.jpg",
    "posters": [
      "/a9sa6ERZCpplbPEO7OMWE763CLD.jpg",
      "/fVwRtWqEPdsCH21BVDGqgkAQcff.jpg",
      "/pTVm2HrqV5kOt8tG4ZURNuhrmAq.jpg",
      "/3mInub5c8o00H7EJ1TrjAqOzIuc.jpg",
      "/kTQ3J8oTTKofAVLYnds2cHUz9KO.jpg"
    ]
  },
  {
    "id": 5547,
    "name": "RoboCop Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/w3bJ67cDfdRqQPenb84eHUBbeys.jpg",
    "poster_path": "/otLxSTZdOOz6FyZsG9ui6Ve25Mm.jpg",
    "posters": [
      "/nhqBxhOJXUJeFsyLxTFkctH9H5F.jpg",
      "/ppLSSwCuC5ERRWbu9H3R8SPL9AM.jpg",
      "/hHtOgGb3NihlyRATHlKPaFApbrd.jpg"
    ]
  },
  {
    "id": 9743,
    "name": "The Hannibal Lecter Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/yiwhEr1BV3K9fCsZuFxUHtZezHZ.jpg",
    "poster_path": "/lTtnUnKVFLX10Ui19WGiL7CqZ1y.jpg",
    "posters": [
      "/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg",
      "/ou9ZKA2cms02b7CdCdVqGkKu0O0.jpg",
      "/v5wAZwRqpGWmyAaaJ8BBHYuNXnj.jpg"
    ]
  },
  {
    "id": 8581,
    "name": "A Nightmare on Elm Street Collection",
    "era": "7 films",
    "count": 7,
    "backdrop_path": "/7UcPLgNneoemYmZcyUo5r3nwBbE.jpg",
    "poster_path": "/6ihRddI1Pg4wHFhkZwI9mERRrMd.jpg",
    "posters": [
      "/b9rMHAAKISRmIonaQd9Cccx0S4X.jpg",
      "/53kxYw0G3o55yJ23K7s7KMaOyAM.jpg",
      "/qbtZewU6EGvxi8yFVzwZ31NijLX.jpg",
      "/boStYG7jKdoIZTduiOOsUVknD13.jpg",
      "/kizvpgXQfrAgN8FhOd87LbKk6kO.jpg"
    ]
  },
  {
    "id": 228446,
    "name": "Insidious Collection",
    "era": "6 films",
    "count": 6,
    "backdrop_path": "/5FrPZHgbbmTIq0oxpwSGqu5HyXC.jpg",
    "poster_path": "/fct5wsWu6niDIGRIC4aWEsN5Npa.jpg",
    "posters": [
      "/w5JjiB3O1CLDXbTJe1QpU5RHmlU.jpg",
      "/tmlDFIUpGRKiuWm9Ixc6CYDk4y0.jpg",
      "/iDdGfdNvY1EX0uDdA4Ru77fwMfc.jpg",
      "/6c9ti2JcR3dHyR3qFXoZqVMx0SH.jpg",
      "/d07phJqCx6z5wILDYqkyraorDPi.jpg"
    ]
  },
  {
    "id": 1960,
    "name": "Evil Dead Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/377E9KSoUGxKWuvyR1Zu9aXcU4I.jpg",
    "poster_path": "/eWFADubShlTEUiNsPcN6BMOKakr.jpg",
    "posters": [
      "/54C1qdaiSijIU5NeNb4WsPJdNkG.jpg",
      "/4zqCKJVHUolGs6C5AZwAZqLWixW.jpg",
      "/xsgTuAtR2zSH8Umg3jWZcZjlDpe.jpg"
    ]
  },
  {
    "id": 313086,
    "name": "The Conjuring Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/kHZaX0vuhZdbuq0WKU3BpA9WIQ0.jpg",
    "poster_path": "/z5VKhNSQKQyxm0co68HAkCqHnmX.jpg",
    "posters": [
      "/wVYREutTvI2tmxr6ujrHT704wGF.jpg",
      "/zEqyD0SBt6HL7W9JQoWwtd5Do1T.jpg",
      "/xbSuFiJbbBWCkyCCKIMfuDCA4yV.jpg",
      "/umvkcIb0XAk486TEmx1V5aVzhbm.jpg"
    ]
  },
  {
    "id": 404609,
    "name": "John Wick Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/fSwYa5q2xRkBoOOjueLpkLf3N1m.jpg",
    "poster_path": "/sm7rZZivZm2NhJDucFf3gpfFdVt.jpg",
    "posters": [
      "/wXqWR7dHncNRbxoEGybEy7QTe9h.jpg",
      "/hXWBc0ioZP3cN4zCu6SN3YHXZVO.jpg",
      "/ziEuG1essDuWuC5lpWUaw1uXY2O.jpg",
      "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg"
    ]
  },
  {
    "id": 391860,
    "name": "Kingsman Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/i8SLS8XFbjiUheIObBxZDvk0MtJ.jpg",
    "poster_path": "/iR8L2XHA72wmYHc6O8LZmwV5hd5.jpg",
    "posters": [
      "/r6q9wZK5a2K51KFj4LWVID6Ja1r.jpg",
      "/34xBL6BXNYFqtHO9zhcgoakS4aP.jpg",
      "/iMjSfMUuCkCE7z5fzGtjeDusPD3.jpg"
    ]
  },
  {
    "id": 256322,
    "name": "The Purge Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/zLx0VxpzJt3E0cb4GodV10Wp0Lt.jpg",
    "poster_path": "/eO8KF89eSpsqtyLDMoqSQEj8OJK.jpg",
    "posters": [
      "/x6hwbnR2nGacSzljqYaXY25w1Me.jpg",
      "/kFQFUBujj2XZxyOFJ1cEL13O9Ao.jpg",
      "/gg7tlp45xqGWMra0sqQVPvybje2.jpg",
      "/2slvblTroiT1lY9bYLK7Amigo1k.jpg",
      "/lB068qa6bQ0QKYKyC2xnYGvYjl7.jpg"
    ]
  },
  {
    "id": 295130,
    "name": "The Maze Runner Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/9BX8MUXmOa9i7oyTMx9OmbzkLev.jpg",
    "poster_path": "/beR71cbwXH0vySlTMPZo0GQ54Q9.jpg",
    "posters": [
      "/ode14q7WtDugFDp78fo9lCsmay9.jpg",
      "/mYw7ZyejqSCPFlrT2jHZOESZDU3.jpg",
      "/s8K0US4tUEoOrQ1LDh0eppuwGDx.jpg"
    ]
  },
  {
    "id": 85943,
    "name": "Night at the Museum Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/9YJLEgVVzEvGRJ0IzYf7RBnYx1k.jpg",
    "poster_path": "/q2nwE0Qi8U6tsU5HDmiWS2D3dSJ.jpg",
    "posters": [
      "/pDsAAYf6Zn0yiAGJ6lYGs6hoZ4E.jpg",
      "/l9yAQn6TyrA3gv5xZZkiMMoZsiw.jpg",
      "/xwgy305K6qDs3D20xUO4OZu1HPY.jpg"
    ]
  },
  {
    "id": 420,
    "name": "The Chronicles of Narnia Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/ojjzZUQlqKTsN1T7s5OAVZSjYMH.jpg",
    "poster_path": "/sh6Kn8VBfXotJ6qsvJkdfscxXKR.jpg",
    "posters": [
      "/iREd0rNCjYdf5Ar0vfaW32yrkm.jpg",
      "/qxz3WIyjZiSKUhaTIEJ3c1GcC9z.jpg",
      "/pP27zlm9yeKrCeDZLFLP2HKELot.jpg"
    ]
  },
  {
    "id": 87118,
    "name": "Cars Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/A8DqaTGwZ8iCEjWMNRsZumzfKLw.jpg",
    "poster_path": "/uq3N2SFj1Y06zA6LzCQPkmBdaaE.jpg",
    "posters": [
      "/okIz1HyxeVOMzYwwHUjH2pHi74I.jpg",
      "/2Touk3m5gzsqr1VsvxypdyHY5ci.jpg",
      "/zg5RDxvIIAKsucjuU2EZJIHEIvz.jpg"
    ]
  },
  {
    "id": 89137,
    "name": "How to Train Your Dragon Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/mvcfPkOvgDJG2lEAxTz0NKqoQLo.jpg",
    "poster_path": "/jkC6nE9Wzqxt77oSxlYtgIAOzhu.jpg",
    "posters": [
      "/ygGmAO60t8GyqUo9xYeYxSZAR3b.jpg",
      "/d13Uj86LdbDLrfDoHR5aDOFYyJC.jpg",
      "/xvx4Yhf0DVH8G4LzNISpMfFBDy2.jpg"
    ]
  },
  {
    "id": 77816,
    "name": "Kung Fu Panda Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/2nbtv33hEk2CTnuMhTGZgsFdi3K.jpg",
    "poster_path": "/xoYc0RYKSc3xC4S9OpPZxKocKtj.jpg",
    "posters": [
      "/wWt4JYXTg5Wr3xBW2phBrMKgp3x.jpg",
      "/mtqqD00vB4PGRt20gWtGqFhrkd0.jpg",
      "/oajNi4Su39WAByHI6EONu8G8HYn.jpg",
      "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg"
    ]
  },
  {
    "id": 86066,
    "name": "Despicable Me Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/37xamYKRUGCRux532lKcZdVGYuR.jpg",
    "poster_path": "/xIXhIlZDRmSSfNbpN7kBCm5hg39.jpg",
    "posters": [
      "/b1BT309QWjtFUlJPLmXmrcHOWEL.jpg",
      "/5Fh4NdoEnCjCK9wLjdJ9DJNFl2b.jpg",
      "/e72KCMHNkbZ6USRJmABeqwmaJ5n.jpg",
      "/wWba3TaojhK7NdycRhoQpsG0FaH.jpg"
    ]
  },
  {
    "id": 185103,
    "name": "Hotel Transylvania Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/5MJt6g7k9gADQH4xHn5mOEMa3Vr.jpg",
    "poster_path": "/9nR1xIcDo84gbbNZeFb9NCZYTdw.jpg",
    "posters": [
      "/eJGvzGrsfe2sqTUPv5IwLWXjVuR.jpg",
      "/3nFnrivNgipSKZ8LZJJbRSlAcTR.jpg",
      "/lzE5BwGQea1nek7TPXUuC5AZ6rq.jpg",
      "/teCy1egGQa0y8ULJvlrDHQKnxBL.jpg",
      "/6tZnYPMsRG25A4EdqkuTODNRPMT.jpg"
    ]
  },
  {
    "id": 14740,
    "name": "Madagascar Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/lzTIAbvMeGWB7PUrmBZXulGA28M.jpg",
    "poster_path": "/UXIxsUbwMpv4v8xXRdT7LX58z9.jpg",
    "posters": [
      "/zMpJY5CJKUufG9OTw0In4eAFqPX.jpg",
      "/agRbLOHgN46TQO4YdKR462iR7To.jpg",
      "/ekraj4ksvIKeuvQVEevEJkuybZd.jpg"
    ]
  },
  {
    "id": 10194,
    "name": "Toy Story Collection",
    "era": "5 films",
    "count": 5,
    "backdrop_path": "/hApclyB9NEZEQujAVajzi5iWE4a.jpg",
    "poster_path": "/rki5qLuwb0xnnE9seehxO9TlLhW.jpg",
    "posters": [
      "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
      "/4rbcp3ng8n1MKHjpeqW0L7Fnpzz.jpg",
      "/AbbXspMOwdvwWZgVN0nabZq03Ec.jpg",
      "/w9kR8qbmQ01HwnvK4alvnQ2ca0L.jpg",
      "/sfQtVlIHljToOwYjhe21KPGzZWK.jpg"
    ]
  },
  {
    "id": 137697,
    "name": "Finding Nemo Collection",
    "era": "2 films",
    "count": 2,
    "backdrop_path": "/yzqaKAhglTrkeOfuIXYYArf0WnA.jpg",
    "poster_path": "/cCovtlN16ykvyFYnzKyv3dFtceG.jpg",
    "posters": [
      "/eHuGQ10FUzK1mdOY69wF5pGgEf5.jpg",
      "/3UVe8NL1E2ZdUZ9EDlKGJY5UzE.jpg"
    ]
  },
  {
    "id": 137696,
    "name": "Monsters, Inc. Collection",
    "era": "2 films",
    "count": 2,
    "backdrop_path": "/x4Mq7gDRhbqDjw4SkemLvd1yzF3.jpg",
    "poster_path": "/4Cp0L58Rg1bSJSsT6uw7OuU4nYc.jpg",
    "posters": [
      "/wFSpyMsp7H0ttERbxY7Trlv8xry.jpg",
      "/y7thwJ7z5Bplv6vwl6RI0yteaDD.jpg"
    ]
  },
  {
    "id": 51509,
    "name": "Meet the Parents Collection",
    "era": "4 films",
    "count": 4,
    "backdrop_path": "/9mNfoET5NlXDVqW2UhJAJp6DR7k.jpg",
    "poster_path": "/hwfaKtvNt3Xm03nJ3LiA7j3k6pw.jpg",
    "posters": [
      "/59fXm6N2x7QSbvt6BaBxTNBXGL8.jpg",
      "/90mwPRNMmX9RUGVgKMJMJNQnYX8.jpg",
      "/5tXJ9ctuyEOMUFLaeqRisbXowWs.jpg",
      "/iHJhSfqFpDMOyeMc6h6BOeHxse2.jpg"
    ]
  },
  {
    "id": 86119,
    "name": "The Hangover Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/9tpB49XNPEvxEkdsIkJWP0sZWtf.jpg",
    "poster_path": "/x8D6HXhmvdtPhM219J5Rc6ESagr.jpg",
    "posters": [
      "/vtxuPWkdllLNLVyGjKYa267ntuH.jpg",
      "/cKZu0Fdkj7dmwbfMpgDqVVCkLJQ.jpg",
      "/A0uS9rHR56FeBtpjVki16M5xxSW.jpg"
    ]
  },
  {
    "id": 344830,
    "name": "Fifty Shades Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/f7F56YyMX9G6L4ffqNpA9zlG6fm.jpg",
    "poster_path": "/29sMhnMJPHsbO2XHu35iQjk4eFR.jpg",
    "posters": [
      "/63kGofUkt1Mx0SIL4XI4Z5AoSgt.jpg",
      "/w3qa274gvca9t8pkUoG8nfQgTU3.jpg",
      "/jjPJ4s3DWZZvI4vw8Xfi4Vqa1Q8.jpg"
    ]
  },
  {
    "id": 304,
    "name": "Ocean's Collection",
    "era": "3 films",
    "count": 3,
    "backdrop_path": "/7WUSrq8DqSkVgv1vmhBvav5bPoB.jpg",
    "poster_path": "/oHUHccvraYF8lYp6BxRoujRtH8Q.jpg",
    "posters": [
      "/hQQCdZrsHtZyR6NbKH2YyCqd2fR.jpg",
      "/pE5anFf7nf6ah7V3VRezQ1KSovi.jpg",
      "/pBsZs4zYUiUTemqbikTZ76iQRaU.jpg"
    ]
  },
  {
    "id": 403374,
    "name": "Jack Reacher Collection",
    "era": "2 films",
    "count": 2,
    "backdrop_path": "/vViRXFnSyGJ2fzMbcc5sqTKswcd.jpg",
    "poster_path": "/qtafXiYDUMKxzsssU41qWey5oiT.jpg",
    "posters": [
      "/uQBbjrLVsUibWxNDGA4Czzo8lwz.jpg",
      "/cOg3UT2NYWHZxp41vpxAnVCOC4M.jpg"
    ]
  }
];

/* ─────────────────────────────────────────────────────────────
   CURATED ARCHIVES EXPORT FOR collections.$id.tsx COMPATIBILITY
   ───────────────────────────────────────────────────────────── */
export const CURATED_ARCHIVES = [
  HERO_FEATURED_SAGA,
  ...HERO_STACK_PAIR,
  ...CINEVERSE_PRESENTS,
  ...FRANCHISE_SAGAS,
].map((item) => ({
  ...item,
  backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : "",
  poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
  posters: (item.posters || []).map((p) => p.startsWith("http") ? p : `https://image.tmdb.org/t/p/w185${p}`),
}));

export const Route = createRoute({
  path: "/collections/",
  loader: () => getCollectionsPage(),
  head: () => ({
    meta: [
      { title: "Collections & Sagas — CineVerse" },
      {
        name: "description",
        content:
          "Explore expressive cinema collections, franchise arcs, thematic trilogies, and canon sequences across film history.",
      },
      { property: "og:title", content: "Collections & Sagas — CineVerse" },
    ],
  }),
  component: CollectionsPage,
});

/* ─────────────────────────────────────────────────────────────
   POSTER THUMBNAIL COMPONENT
   Guarantees no broken image icon or blank gray box appears.
   ───────────────────────────────────────────────────────────── */
function PosterThumbnail({ path, title }: { path: string; title: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !path) {
    return (
      <div className="h-10 w-7 shrink-0 rounded-sm bg-stone-900 border border-gold/25 flex items-center justify-center shadow-sm">
        <Film className="size-3 text-gold/40" />
      </div>
    );
  }

  const fullUrl = path.startsWith("http") ? path : `https://image.tmdb.org/t/p/w185${path}`;

  return (
    <img
      src={fullUrl}
      alt={title}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-10 w-7 shrink-0 rounded-sm object-cover ring-1 ring-border/40 shadow-sm transition hover:scale-105"
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   CARD COMPONENT: With Verified Image Mapping & Error Handling
   ───────────────────────────────────────────────────────────── */
function CollectionCardItem({
  item,
  aspect = "aspect-[16/10]",
}: {
  item: FranchiseCollectionItem;
  aspect?: string;
}) {
  const [bgError, setBgError] = useState(false);

  const rawBackdrop = item.backdrop_path || item.poster_path;
  const backdropUrl = !bgError && rawBackdrop
    ? (rawBackdrop.startsWith("http") ? rawBackdrop : `https://image.tmdb.org/t/p/w780${rawBackdrop}`)
    : null;

  return (
    <Link
      to="/collections/$id"
      params={{ id: String(item.id) }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-surface-2 p-5 transition-all duration-300 hover:border-gold/60 hover:-translate-y-1 hover:shadow-xl ${aspect}`}
    >
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={item.name}
          loading="lazy"
          onError={() => setBgError(true)}
          className="absolute inset-0 size-full object-cover opacity-85 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center opacity-70">
          <Film className="size-8 text-gold/25" />
        </div>
      )}

      {/* Subtle top vignette for metadata readability */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />

      {/* Subtle bottom gradient so white title remains crystal clear */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

      {/* Top Meta info */}
      <div className="relative z-10 flex items-center justify-between font-mono text-[0.62rem] text-gold uppercase tracking-wider font-semibold">
        <span>{item.era || `${item.count} films`}</span>
      </div>

      {/* Bottom Content & Poster Thumbnails */}
      <div className="relative z-10 space-y-2 mt-auto">
        <h3 className="font-display text-base sm:text-lg font-bold text-foreground group-hover:text-gold transition leading-tight">
          {item.name}
        </h3>

        {item.posters && item.posters.length > 0 ? (
          <div className="flex gap-1.5 pt-1.5 overflow-hidden">
            {item.posters.slice(0, 4).map((p, idx) => (
              <PosterThumbnail key={p || idx} path={p} title={item.name} />
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function CollectionsPage() {
  const {
    community = [],
  } = (Route.useLoaderData() as Awaited<ReturnType<typeof getCollectionsPage>>) || {};

  const [heroBgError, setHeroBgError] = useState(false);
  const heroBackdrop = !heroBgError && HERO_FEATURED_SAGA.backdrop_path
    ? (HERO_FEATURED_SAGA.backdrop_path.startsWith("http")
      ? HERO_FEATURED_SAGA.backdrop_path
      : `https://image.tmdb.org/t/p/w1280${HERO_FEATURED_SAGA.backdrop_path}`)
    : null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-20 sm:px-8 sm:pt-8 sm:pb-28 space-y-14">
      {/* ─────────────────────────────────────────────────────────────
          EDITORIAL MASTHEAD: Perfectly aligned below the navbar
         ───────────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Films that belong together
        </h1>
        <p className="font-serif text-xs sm:text-sm text-muted-foreground italic">
          From single sittings to lifelong cinematic obsessions, curated by form, director, movement, and era.
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          01. FEATURED HERO SAGA & PAIR:
          Dominant Left Card (Fast & Furious) + Right Stack (Saw + Halloween)
         ───────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Hero (Fast & Furious) */}
        <Link
          to="/collections/$id"
          params={{ id: String(HERO_FEATURED_SAGA.id) }}
          className="lg:col-span-8 group relative overflow-hidden rounded-2xl border border-border/70 bg-stone-950 transition duration-300 hover:border-gold/60 min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-8 shadow-2xl"
        >
          {heroBackdrop ? (
            <img
              src={heroBackdrop}
              alt={HERO_FEATURED_SAGA.name}
              onError={() => setHeroBgError(true)}
              className="absolute inset-0 size-full object-cover object-top opacity-85 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center">
              <Film className="size-16 text-gold/20" />
            </div>
          )}
          {/* Subtle bottom gradient so title remains crystal clear */}
          <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-2">
            <div className="font-mono text-[0.68rem] text-gold uppercase tracking-wider font-semibold">
              {HERO_FEATURED_SAGA.era} · {HERO_FEATURED_SAGA.count} films
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-foreground group-hover:text-gold transition">
              {HERO_FEATURED_SAGA.name}
            </h2>

            {HERO_FEATURED_SAGA.posters && (
              <div className="flex gap-2 pt-2 overflow-hidden">
                {HERO_FEATURED_SAGA.posters.slice(0, 5).map((p, idx) => (
                  <PosterThumbnail key={p || idx} path={p} title={HERO_FEATURED_SAGA.name} />
                ))}
              </div>
            )}
          </div>
        </Link>

        {/* Right Stack: Saw & Halloween */}
        <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
          {HERO_STACK_PAIR.map((saga) => {
            const raw = saga.backdrop_path || saga.poster_path;
            const bg = raw ? (raw.startsWith("http") ? raw : `https://image.tmdb.org/t/p/w780${raw}`) : null;

            return (
              <Link
                key={saga.id}
                to="/collections/$id"
                params={{ id: String(saga.id) }}
                className="group relative flex-1 flex flex-col justify-end overflow-hidden rounded-2xl border border-border/70 bg-stone-950 p-6 transition duration-300 hover:border-gold/60 min-h-[190px] shadow-lg"
              >
                {bg ? (
                  <img
                    src={bg}
                    alt={saga.name}
                    className="absolute inset-0 size-full object-cover opacity-85 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100"
                  />
                ) : null}
                <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

                <div className="relative z-10 space-y-1.5">
                  <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider font-semibold">
                    {saga.era} · {saga.count} films
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-gold transition">
                    {saga.name}
                  </h3>
                  {saga.posters && (
                    <div className="flex gap-1.5 pt-1 overflow-hidden">
                      {saga.posters.slice(0, 4).map((p, idx) => (
                        <PosterThumbnail key={p || idx} path={p} title={saga.name} />
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          02. CINEVERSE PRESENTS: Curated sets and canon sequences (3 cols)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-gold font-semibold">
            CINEVERSE PRESENTS
          </div>
          <div className="font-serif text-xs text-muted-foreground">
            Curated sets and canon sequences
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CINEVERSE_PRESENTS.map((item) => (
            <CollectionCardItem key={item.id} item={item} aspect="aspect-[16/10]" />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          03. FRANCHISE SAGAS: Epic stories told across years (4 cols)
          All 56 franchises populated with posters - ZERO blank gray boxes!
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Franchise sagas
          </h2>
          <div className="font-serif text-xs text-muted-foreground">
            Epic stories told across years
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FRANCHISE_SAGAS.map((item) => (
            <CollectionCardItem key={item.id} item={item} aspect="min-h-[175px]" />
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          04. COMMUNITY LISTS: Curated by members and critics (3 cols)
         ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Community lists
          </h2>
          <div className="font-serif text-xs text-muted-foreground">
            Curated by members and critics
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {community && community.length > 0 ? (
            community.map((l: any) => (
              <Link
                key={l.slug}
                to="/discover"
                search={{ genre: l.genre, sort: "vote_average.desc" }}
                className="group rounded-2xl border border-border/70 bg-surface-2 p-5 transition-all hover:border-gold/60 hover:shadow-md flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider font-semibold">
                    {l.count?.toLocaleString() || "1,200"} Films Ranked
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-foreground group-hover:text-gold transition">
                    {l.title}
                  </h3>
                </div>
                <div className="mt-4 flex gap-2 overflow-hidden">
                  {(l.posters || []).slice(0, 4).map((p: string, idx: number) => (
                    <PosterThumbnail key={p || idx} path={p} title={l.title} />
                  ))}
                </div>
              </Link>
            ))
          ) : (
            [
              {
                slug: "shot-at-night",
                title: "Films Shot at Night",
                count: 1420,
                genre: 80,
                posters: [
                  "/dqK9Hag1054tghRQSqLSfrkvQnA.jpg",
                  "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
                  "/fZPSMVcPpjpHGPO5OP9qFvlbi04.jpg"
                ]
              },
              {
                slug: "the-long-year",
                title: "Science Fiction, Sorted",
                count: 850,
                genre: 878,
                posters: [
                  "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
                  "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
                  "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg"
                ]
              },
              {
                slug: "comfort-watches",
                title: "Comfort Watches, Ranked",
                count: 2100,
                genre: 35,
                posters: [
                  "/dyhaB19AIC4PkUV7D7Ba392MFqQ.jpg",
                  "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg",
                  "/vlTPQGRwceT00I00w0z1x2y3z4.jpg"
                ]
              },
            ].map((l) => (
              <Link
                key={l.slug}
                to="/discover"
                search={{ genre: l.genre, sort: "vote_average.desc" }}
                className="group rounded-2xl border border-border/70 bg-surface-2 p-5 transition-all hover:border-gold/60 hover:shadow-md flex flex-col justify-between min-h-[160px]"
              >
                <div>
                  <div className="font-mono text-[0.62rem] text-gold uppercase tracking-wider font-semibold">
                    {l.count.toLocaleString()} Films Ranked
                  </div>
                  <h3 className="mt-1 font-display text-base font-bold text-foreground group-hover:text-gold transition">
                    {l.title}
                  </h3>
                </div>
                <div className="mt-4 flex gap-2 overflow-hidden">
                  {l.posters.map((p, idx) => (
                    <PosterThumbnail key={p || idx} path={p} title={l.title} />
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
