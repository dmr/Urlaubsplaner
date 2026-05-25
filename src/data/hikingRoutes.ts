export interface HikingRoute {
  id: string;
  name: string;
  difficulty: "leicht" | "mittel" | "schwer";
  distance: string;
  duration: string;
  elevation: string;
  minAge: number;
  description: string;
  highlights: string[];
  warning?: string;
  path: [number, number][];
}

export const HIKING_ROUTES: HikingRoute[] = [
  {
    id: "gauchach-runde",
    name: "Gauchachschlucht Rundweg",
    difficulty: "mittel",
    distance: "10 km",
    duration: "3–4 h",
    elevation: "↑ 280 m",
    minAge: 5,
    description:
      "Wildromantische Schlucht mit Holzbrücken und Felsengalerien. Start an der Drei-Schluchten-Halle Bachheim.",
    highlights: ["Holzbrücken", "Felsengalerien", "Wildbach"],
    path: [
      [47.8732, 8.3385],
      [47.8710, 8.3350],
      [47.8685, 8.3290],
      [47.8660, 8.3220],
      [47.8640, 8.3150],
      [47.8620, 8.3100],
      [47.8605, 8.3050],
      [47.8620, 8.3020],
      [47.8650, 8.3060],
      [47.8680, 8.3120],
      [47.8700, 8.3200],
      [47.8720, 8.3300],
      [47.8732, 8.3385],
    ],
  },
  {
    id: "schluchsee-ufer",
    name: "Schluchsee Uferweg",
    difficulty: "leicht",
    distance: "7 km (Teilstrecke)",
    duration: "2 h",
    elevation: "↑ 50 m",
    minAge: 0,
    description:
      "Flacher Uferweg am Schluchsee, kinderwagentauglich. Mehrere Spielplätze und Badestellen.",
    highlights: ["Seeblick", "Spielplätze", "Badestellen", "Kinderwagen-ok"],
    path: [
      [47.8190, 8.1820],
      [47.8170, 8.1780],
      [47.8145, 8.1730],
      [47.8120, 8.1680],
      [47.8100, 8.1620],
      [47.8085, 8.1560],
      [47.8075, 8.1500],
      [47.8080, 8.1440],
      [47.8100, 8.1400],
      [47.8130, 8.1380],
      [47.8160, 8.1400],
    ],
  },
  {
    id: "feldberg-wichtelpfad",
    name: "Feldberg Wichtelpfad",
    difficulty: "leicht",
    distance: "2 km",
    duration: "1–1,5 h",
    elevation: "↑ 80 m",
    minAge: 0,
    description:
      "Kindgerechter Erlebnispfad am Feldberg mit Wichtel-Stationen. Bergstation der Seilbahn als Start.",
    highlights: ["Wichtel-Stationen", "Panoramablick", "Seilbahn"],
    path: [
      [47.8580, 8.0050],
      [47.8575, 8.0030],
      [47.8565, 8.0010],
      [47.8555, 7.9990],
      [47.8545, 7.9975],
      [47.8540, 7.9960],
      [47.8545, 7.9945],
      [47.8555, 7.9950],
      [47.8565, 7.9970],
      [47.8575, 7.9990],
      [47.8580, 8.0020],
      [47.8580, 8.0050],
    ],
  },
  {
    id: "loeffingen-orts",
    name: "Löffingen Ortsrundgang",
    difficulty: "leicht",
    distance: "3 km",
    duration: "1,5 h",
    elevation: "↑ 30 m",
    minAge: 0,
    description:
      "Gemütlicher Rundgang durch Löffingen: Hexenbrunnen, Mailänder Tor, Altstadt. Buggy-tauglich.",
    highlights: ["Hexenbrunnen", "Mailänder Tor", "Altstadt"],
    path: [
      [47.8840, 8.3430],
      [47.8835, 8.3415],
      [47.8825, 8.3400],
      [47.8820, 8.3420],
      [47.8815, 8.3445],
      [47.8820, 8.3470],
      [47.8830, 8.3480],
      [47.8840, 8.3460],
      [47.8840, 8.3430],
    ],
  },
  {
    id: "wutachschlucht-klassik",
    name: "Wutachschlucht (Klassik)",
    difficulty: "schwer",
    distance: "12 km",
    duration: "5–6 h",
    elevation: "↑ 450 m",
    minAge: 6,
    description:
      "Anspruchsvolle Schluchtenwanderung mit Stegen, Leitern und schmalen Pfaden. Nur für trittsichere Kinder ab 6.",
    highlights: ["Schluchtensteig", "Stege", "Leitern", "Wildwasser"],
    warning: "Nicht mit 3-Jährigem! Nur für ältere Kinder mit Erwachsenem.",
    path: [
      [47.8500, 8.3100],
      [47.8480, 8.3050],
      [47.8460, 8.2980],
      [47.8440, 8.2900],
      [47.8420, 8.2830],
      [47.8400, 8.2760],
      [47.8380, 8.2700],
      [47.8360, 8.2640],
      [47.8340, 8.2580],
      [47.8320, 8.2520],
      [47.8300, 8.2460],
    ],
  },
  {
    id: "triberg-wasserfaelle",
    name: "Triberger Wasserfälle Weg",
    difficulty: "leicht",
    distance: "4 km",
    duration: "1,5–2 h",
    elevation: "↑ 160 m",
    minAge: 0,
    description:
      "Gut ausgebauter Weg entlang der höchsten Wasserfälle Deutschlands. Unterer Eingang auch mit Kinderwagen.",
    highlights: ["163 m Fallhöhe", "Eichhörnchen", "Naturschauspiel"],
    path: [
      [48.1310, 8.2310],
      [48.1305, 8.2290],
      [48.1298, 8.2275],
      [48.1290, 8.2260],
      [48.1282, 8.2250],
      [48.1275, 8.2240],
      [48.1268, 8.2230],
      [48.1260, 8.2225],
      [48.1252, 8.2220],
    ],
  },
];
