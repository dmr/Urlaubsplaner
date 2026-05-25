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
  parking?: {
    name: string;
    address: string;
    coords: [number, number];
    cost: string;
    notes?: string;
  };
  elevationProfile?: {
    start: number;
    max: number;
    totalAscent: number;
    totalDescent: number;
    waypoints: { name: string; elevation: number; km: number }[];
  };
  surface: string;
  facilities: string[];
  photoSpots: string[];
  strollerFriendly: boolean;
}

export const HIKING_ROUTES: HikingRoute[] = [
  {
    id: "gauchach-runde",
    name: "Gauchachschlucht Rundweg",
    difficulty: "mittel",
    distance: "10 km",
    duration: "3–4 h",
    elevation: "↑ 280 m ↓ 280 m",
    minAge: 5,
    description:
      "Wildromantische Schlucht mit Holzbrücken und Felsengalerien. Start an der Drei-Schluchten-Halle Bachheim. Rundweg über Gauchach- und Wutachschlucht.",
    highlights: ["Holzbrücken", "Felsengalerien", "Wildbach", "Wutach-Mündung"],
    surface: "Waldwege, teils felsig, Holzstege, Treppen. Letzte 2 km Feldweg zurück.",
    facilities: ["Parkplatz Drei-Schluchten-Halle", "WC am Start", "Grillstelle Wutachmühle", "Gasthof Schattenmühle (an der Wutach)"],
    photoSpots: [
      "Holzbrücken über die Gauchach (besonders morgendliches Licht)",
      "Felsengalerien mit Moos und Farnen",
      "Zusammenfluss Gauchach/Wutach — dramatische Felskulisse",
      "Wasserfall am unteren Gauchach-Eingang",
    ],
    strollerFriendly: false,
    parking: {
      name: "Parkplatz Drei-Schluchten-Halle",
      address: "Bachheim, 79843 Löffingen",
      coords: [47.8732, 8.3385],
      cost: "Gratis",
      notes: "Ca. 30 Stellplätze. Am Wochenende früh kommen.",
    },
    elevationProfile: {
      start: 720,
      max: 780,
      totalAscent: 280,
      totalDescent: 280,
      waypoints: [
        { name: "Drei-Schluchten-Halle", elevation: 720, km: 0 },
        { name: "Einstieg Gauchachschlucht", elevation: 680, km: 1.2 },
        { name: "Holzbrücke 1", elevation: 620, km: 2.5 },
        { name: "Felsengalerie", elevation: 580, km: 3.5 },
        { name: "Mündung Wutach", elevation: 540, km: 5 },
        { name: "Wutachmühle", elevation: 560, km: 6 },
        { name: "Aufstieg Wald", elevation: 680, km: 8 },
        { name: "Zurück Bachheim", elevation: 720, km: 10 },
      ],
    },
    path: [
      [47.8732, 8.3385], [47.8710, 8.3350], [47.8685, 8.3290],
      [47.8660, 8.3220], [47.8640, 8.3150], [47.8620, 8.3100],
      [47.8605, 8.3050], [47.8620, 8.3020], [47.8650, 8.3060],
      [47.8680, 8.3120], [47.8700, 8.3200], [47.8720, 8.3300],
      [47.8732, 8.3385],
    ],
  },
  {
    id: "schluchsee-ufer",
    name: "Schluchsee Uferweg",
    difficulty: "leicht",
    distance: "7 km (Teilstrecke)",
    duration: "2 h",
    elevation: "↑ 50 m ↓ 50 m",
    minAge: 0,
    description:
      "Flacher Uferweg am Schluchsee, kinderwagentauglich. Mehrere Spielplätze und Badestellen. Empfehlung: Ort bis Staumauer und mit Boot zurück.",
    highlights: ["Seeblick", "Spielplätze", "Badestellen", "Staumauer"],
    surface: "Asphalt und fester Kiesweg, durchgehend breit. Kinderwagen-tauglich.",
    facilities: [
      "WC an der Staumauer und am Strandbad",
      "Kiosk Aqua Fun Strandbad",
      "Restaurant Schluchsee Stüble am Ort",
      "Mehrere Bänke mit Seeblick",
      "Spielplatz am Strandbad und am Seeblick",
    ],
    photoSpots: [
      "Staumauer — Panorama über den gesamten See",
      "Sonnenuntergang vom westlichen Uferweg",
      "Tretboote mit Bergkulisse",
      "Spielplatz am See — Kinder mit Bergpanorama",
    ],
    strollerFriendly: true,
    parking: {
      name: "Parkplatz Schluchsee Ort",
      address: "Fischbacher Str., 79859 Schluchsee",
      coords: [47.8190, 8.1820],
      cost: "2 €/Tag (Parkuhr)",
      notes: "Alternativ: P am Strandbad (näher zum Wasser).",
    },
    elevationProfile: {
      start: 930,
      max: 945,
      totalAscent: 50,
      totalDescent: 50,
      waypoints: [
        { name: "Schluchsee Ort", elevation: 935, km: 0 },
        { name: "Strandbad Aqua Fun", elevation: 930, km: 1.5 },
        { name: "Uferweg Aussicht", elevation: 935, km: 3 },
        { name: "Staumauer", elevation: 930, km: 5 },
        { name: "Bootsanleger", elevation: 930, km: 7 },
      ],
    },
    path: [
      [47.8190, 8.1820], [47.8170, 8.1780], [47.8145, 8.1730],
      [47.8120, 8.1680], [47.8100, 8.1620], [47.8085, 8.1560],
      [47.8075, 8.1500], [47.8080, 8.1440], [47.8100, 8.1400],
      [47.8130, 8.1380], [47.8160, 8.1400],
    ],
  },
  {
    id: "feldberg-wichtelpfad",
    name: "Feldberg Wichtelpfad",
    difficulty: "leicht",
    distance: "2 km",
    duration: "1–1,5 h",
    elevation: "↑ 80 m ↓ 80 m",
    minAge: 0,
    description:
      "Kindgerechter Erlebnispfad am Feldberg mit Wichtel-Stationen. Bergstation der Seilbahn als Start. In der Trage auch für 3-Jährige gut.",
    highlights: ["Wichtel-Stationen", "Panoramablick", "Seilbahn", "Feldbergturm"],
    surface: "Breiter Waldweg, teilweise Holzbohlen. Buggy schwierig (Wurzeln), Trage empfohlen.",
    facilities: [
      "WC an der Bergstation",
      "Feldbergturm (Aussicht, Card-inkl.)",
      "Haus der Natur (Ausstellung)",
      "Gasthaus Feldberger Hof (unten)",
      "Feldberg Bistro an der Bergstation",
    ],
    photoSpots: [
      "Feldbergturm — 360°-Panorama bis zu den Alpen (bei klarer Sicht)",
      "Wichtel-Figuren mit Kindern",
      "Seilbahn-Kabine mit Bergpanorama",
      "Feldsee-Blick vom oberen Weg (kleine Abzweigung)",
    ],
    strollerFriendly: false,
    warning: "Wetter kippt oben schnell — warme Jacke auch im Juni!",
    parking: {
      name: "Parkplatz Feldbergbahn Talstation",
      address: "Dr.-Pilet-Spur 11, 79868 Feldberg",
      coords: [47.8580, 8.0050],
      cost: "Gratis mit Card (sonst 5 €/Tag)",
      notes: "Seilbahn Card-inkl. (Hin+Rück). Erste Bahn 9:00.",
    },
    elevationProfile: {
      start: 1450,
      max: 1493,
      totalAscent: 80,
      totalDescent: 80,
      waypoints: [
        { name: "Bergstation Seilbahn", elevation: 1450, km: 0 },
        { name: "Wichtelpfad Start", elevation: 1460, km: 0.2 },
        { name: "Feldbergturm", elevation: 1493, km: 0.8 },
        { name: "Aussichtspunkt", elevation: 1480, km: 1.2 },
        { name: "Zurück Bergstation", elevation: 1450, km: 2 },
      ],
    },
    path: [
      [47.8580, 8.0050], [47.8575, 8.0030], [47.8565, 8.0010],
      [47.8555, 7.9990], [47.8545, 7.9975], [47.8540, 7.9960],
      [47.8545, 7.9945], [47.8555, 7.9950], [47.8565, 7.9970],
      [47.8575, 7.9990], [47.8580, 8.0020], [47.8580, 8.0050],
    ],
  },
  {
    id: "loeffingen-orts",
    name: "Löffingen Ortsrundgang",
    difficulty: "leicht",
    distance: "3 km",
    duration: "1,5 h",
    elevation: "↑ 30 m ↓ 30 m",
    minAge: 0,
    description:
      "Gemütlicher Rundgang durch Löffingen: Hexenbrunnen, Mailänder Tor, Altstadt. Buggy-tauglich. PDF-Rallye bei der Tourist-Info.",
    highlights: ["Hexenbrunnen", "Mailänder Tor", "Altstadt", "Stadtkirche"],
    surface: "Gepflastert und asphaltiert. Durchgehend buggy-/rollstuhltauglich.",
    facilities: [
      "Tourist-Info am Rathaus",
      "Mehrere Cafés und Bäckereien",
      "Öffentliche WCs am Rathaus",
      "Spielplatz am Stadtrand",
      "Eisdiele in der Altstadt",
    ],
    photoSpots: [
      "Hexenbrunnen — markantes Wahrzeichen",
      "Mailänder Tor — historisches Stadttor",
      "Fachwerkhäuser in der Altstadt",
    ],
    strollerFriendly: true,
    parking: {
      name: "Parkplatz Dittishauser Straße",
      address: "Dittishauser Str., 79843 Löffingen",
      coords: [47.8840, 8.3430],
      cost: "Gratis",
      notes: "Zentral, 2 Min. zur Altstadt.",
    },
    elevationProfile: {
      start: 800,
      max: 815,
      totalAscent: 30,
      totalDescent: 30,
      waypoints: [
        { name: "Parkplatz", elevation: 800, km: 0 },
        { name: "Mailänder Tor", elevation: 805, km: 0.5 },
        { name: "Hexenbrunnen", elevation: 810, km: 1 },
        { name: "Stadtkirche", elevation: 815, km: 1.5 },
        { name: "Zurück", elevation: 800, km: 3 },
      ],
    },
    path: [
      [47.8840, 8.3430], [47.8835, 8.3415], [47.8825, 8.3400],
      [47.8820, 8.3420], [47.8815, 8.3445], [47.8820, 8.3470],
      [47.8830, 8.3480], [47.8840, 8.3460], [47.8840, 8.3430],
    ],
  },
  {
    id: "wutachschlucht-klassik",
    name: "Wutachschlucht (Klassik)",
    difficulty: "schwer",
    distance: "12 km",
    duration: "5–6 h",
    elevation: "↑ 450 m ↓ 450 m",
    minAge: 6,
    description:
      "Anspruchsvolle Schluchtenwanderung mit Stegen, Leitern und schmalen Pfaden. Nur für trittsichere Kinder ab 6. Der 3-Jährige kann hier NICHT mit.",
    highlights: ["Schluchtensteig", "Stege & Leitern", "Wildwasser", "Wutachmühle"],
    warning: "Nicht mit 3-Jährigem! Nur für ältere Kinder mit Erwachsenem. Feste Wanderschuhe Pflicht.",
    surface: "Schmale Pfade, Fels, Leitern (teils 3–5 m), Drahtseilsicherungen. Rutschig bei Nässe!",
    facilities: [
      "Parkplatz Schattenmühle (Start)",
      "Gasthof Schattenmühle (Einkehr)",
      "Wutachmühle (Grillstelle + WC)",
      "Keine Einkehr zwischen Start und Wutachmühle (5 km)",
    ],
    photoSpots: [
      "Wutach-Canyon — tiefe Schlucht mit türkisem Wasser",
      "Leitern-Passagen — dramatische Tiefblicke",
      "Wutachflühen — markante Felsformationen",
      "Schattenmühle — historische Mühle am Wasser",
    ],
    strollerFriendly: false,
    parking: {
      name: "Wanderparkplatz Schattenmühle",
      address: "Schattenmühle, 79837 Bonndorf",
      coords: [47.8500, 8.3100],
      cost: "3 €/Tag",
      notes: "Früh kommen! Am Wochenende ab 9 Uhr voll. Alternativ: Bus KONUS-Card.",
    },
    elevationProfile: {
      start: 620,
      max: 780,
      totalAscent: 450,
      totalDescent: 450,
      waypoints: [
        { name: "Schattenmühle", elevation: 620, km: 0 },
        { name: "Einstieg Schlucht", elevation: 600, km: 1 },
        { name: "Erste Leiterpassage", elevation: 560, km: 3 },
        { name: "Wutachflühen", elevation: 540, km: 5 },
        { name: "Wutachmühle", elevation: 560, km: 7 },
        { name: "Aufstieg", elevation: 720, km: 9 },
        { name: "Höhenweg", elevation: 780, km: 10 },
        { name: "Abstieg Schattenmühle", elevation: 620, km: 12 },
      ],
    },
    path: [
      [47.8500, 8.3100], [47.8480, 8.3050], [47.8460, 8.2980],
      [47.8440, 8.2900], [47.8420, 8.2830], [47.8400, 8.2760],
      [47.8380, 8.2700], [47.8360, 8.2640], [47.8340, 8.2580],
      [47.8320, 8.2520], [47.8300, 8.2460],
    ],
  },
  {
    id: "triberg-wasserfaelle",
    name: "Triberger Wasserfälle Weg",
    difficulty: "leicht",
    distance: "4 km",
    duration: "1,5–2 h",
    elevation: "↑ 160 m ↓ 160 m",
    minAge: 0,
    description:
      "Gut ausgebauter Weg entlang der höchsten Wasserfälle Deutschlands (163 m). Drei Zugänge — unterer Eingang für Kinderwagen geeignet.",
    highlights: ["163 m Fallhöhe", "Zahme Eichhörnchen", "7 Kaskaden", "Waldkulisse"],
    surface: "Hauptweg: breite Treppen und Kies. Unterer Eingang: asphaltiert, buggy-ok bis zur 1. Kaskade.",
    facilities: [
      "WC an allen drei Eingängen",
      "Restaurants/Cafés am Haupteingang (Stadtmitte)",
      "Kiosk am unteren Eingang",
      "Bänke an den Aussichtspunkten",
      "Schwarzwaldmuseum oben (separate Attraktion)",
    ],
    photoSpots: [
      "Hauptfall (1. Kaskade) — beeindruckendste Stelle",
      "Brücke über den mittleren Fall — Gischtnebel-Effekt",
      "Eichhörnchen auf der Hand (Nüsse mitbringen!)",
      "Gesamtansicht vom unteren Eingang bei Sonnenschein",
    ],
    strollerFriendly: true,
    parking: {
      name: "Parkhaus Innenstadt / P Haupteingang",
      address: "Hauptstr., 78098 Triberg",
      coords: [48.1310, 8.2310],
      cost: "Eintritt ~7 €/Erw., Kinder 1,50 €. Parkhaus 1 €/h.",
      notes: "Unterer Eingang (Scheffelstr.) ist ruhiger und buggy-freundlich.",
    },
    elevationProfile: {
      start: 600,
      max: 760,
      totalAscent: 160,
      totalDescent: 160,
      waypoints: [
        { name: "Unterer Eingang", elevation: 600, km: 0 },
        { name: "1. Kaskade (Hauptfall)", elevation: 640, km: 0.5 },
        { name: "Brücke mittlerer Fall", elevation: 680, km: 1 },
        { name: "Oberer Wasserfall", elevation: 730, km: 1.5 },
        { name: "Oberer Eingang/Wendepunkt", elevation: 760, km: 2 },
        { name: "Rückweg (selber Weg)", elevation: 600, km: 4 },
      ],
    },
    path: [
      [48.1310, 8.2310], [48.1305, 8.2290], [48.1298, 8.2275],
      [48.1290, 8.2260], [48.1282, 8.2250], [48.1275, 8.2240],
      [48.1268, 8.2230], [48.1260, 8.2225], [48.1252, 8.2220],
    ],
  },
  {
    id: "lotenbachklamm",
    name: "Lotenbachklamm",
    difficulty: "mittel",
    distance: "3 km",
    duration: "1–1,5 h",
    elevation: "↑ 120 m ↓ 120 m",
    minAge: 4,
    description:
      "Kurze, aber eindrucksvolle Klammwanderung als Seitenarm der Wutachschlucht. Weniger anspruchsvoll als die Hauptschlucht, aber trotzdem wild und spannend.",
    highlights: ["Enge Klamm", "Wasserfall", "Moosige Felsen", "Holzstege"],
    surface: "Schmale Pfade, Holzstege, einige Stufen. Feste Schuhe nötig.",
    facilities: [
      "Parkplatz an der Schattenmühle",
      "Gasthof Schattenmühle (Einkehr)",
      "Keine Einrichtungen in der Klamm selbst",
    ],
    photoSpots: [
      "Lotenbachfall — kleiner Wasserfall in moosiger Klamm",
      "Enge Felspassage — dramatische Perspektiven",
      "Holzstege über dem Bach — Kinder auf der Brücke",
    ],
    strollerFriendly: false,
    parking: {
      name: "Wanderparkplatz Schattenmühle",
      address: "Schattenmühle, 79837 Bonndorf",
      coords: [47.830, 8.340],
      cost: "3 €/Tag",
      notes: "Gleicher Parkplatz wie Wutachschlucht. 5 Min. Fußweg zum Klamm-Einstieg.",
    },
    elevationProfile: {
      start: 620,
      max: 720,
      totalAscent: 120,
      totalDescent: 120,
      waypoints: [
        { name: "Schattenmühle", elevation: 620, km: 0 },
        { name: "Klamm-Einstieg", elevation: 630, km: 0.3 },
        { name: "Lotenbachfall", elevation: 680, km: 1 },
        { name: "Oberer Aussichtspunkt", elevation: 720, km: 1.5 },
        { name: "Rückweg", elevation: 620, km: 3 },
      ],
    },
    path: [
      [47.830, 8.340], [47.828, 8.338], [47.826, 8.335],
      [47.824, 8.332], [47.823, 8.330], [47.824, 8.328],
      [47.826, 8.330], [47.828, 8.335], [47.830, 8.340],
    ],
  },
  {
    id: "ravennaschlucht-runde",
    name: "Ravennaschlucht",
    difficulty: "mittel",
    distance: "4 km",
    duration: "2–2,5 h",
    elevation: "↑ 200 m ↓ 200 m",
    minAge: 4,
    description:
      "Spektakuläre Schlucht im Höllental mit dem berühmten 37 m hohen Eisenbahnviadukt, zwei Wasserfällen, Stegen und Brücken.",
    highlights: ["37-m-Viadukt", "Zwei Wasserfälle", "Stege & Brücken", "Höllental"],
    surface: "Waldweg, steinige Abschnitte, Holzstege, einige Leitern/Stufen. Rutschig bei Regen.",
    facilities: [
      "Parkplatz Ravennaschlucht (Höllsteig)",
      "Gasthof Hofgut Sternen (berühmt, am Eingang)",
      "Glashütte am Hofgut (Glasblasvorführung)",
      "WC am Hofgut Sternen",
    ],
    photoSpots: [
      "Ravennaviadukt — das ikonische Schwarzwald-Foto (bes. wenn Zug drüberfährt!)",
      "Großer Ravenna-Wasserfall — 16 m Fallhöhe",
      "Kleiner Ravenna-Wasserfall — idyllisch mit Moos",
      "Blick durch die Schlucht nach oben — dramatisches Licht",
    ],
    strollerFriendly: false,
    parking: {
      name: "Parkplatz Hofgut Sternen / Höllsteig",
      address: "Höllsteig 76, 79874 Breitnau",
      coords: [47.894, 8.074],
      cost: "Gratis",
      notes: "Am Weihnachtsmarkt (November) überfüllt. Im Sommer genug Platz.",
    },
    elevationProfile: {
      start: 550,
      max: 750,
      totalAscent: 200,
      totalDescent: 200,
      waypoints: [
        { name: "Hofgut Sternen", elevation: 550, km: 0 },
        { name: "Viadukt (von unten)", elevation: 560, km: 0.3 },
        { name: "Großer Wasserfall", elevation: 620, km: 1 },
        { name: "Kleiner Wasserfall", elevation: 680, km: 1.8 },
        { name: "Oberer Wendepunkt", elevation: 750, km: 2.5 },
        { name: "Rückweg (Waldweg)", elevation: 550, km: 4 },
      ],
    },
    path: [
      [47.894, 8.074], [47.892, 8.072], [47.890, 8.070],
      [47.888, 8.068], [47.886, 8.066], [47.885, 8.064],
      [47.886, 8.062], [47.888, 8.064], [47.890, 8.068],
      [47.892, 8.072], [47.894, 8.074],
    ],
  },
];
