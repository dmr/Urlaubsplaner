# SPEC.md — Funktionale Anforderungen & Datenmodell

## Zweck

Eine Familie (4 Erwachsene + 3 Kinder im Alter von 7, 6 und 3 Jahren) plant einen einwöchigen Urlaub im Hochschwarzwald rund um Löffingen (Pfingsten 2026, Mo 1. – So 7. Juni). Sie braucht ein Werkzeug, um Aktivitäten zu sichten und konkret einem Wochentag zuzuordnen.

## Anforderungen

### Funktional

| # | Anforderung | Priorität |
|---|-------------|-----------|
| F1 | Persistente Speicherung im Browser ohne Backend | MUST |
| F2 | 7 fixe Reisetage (1.–7. Juni 2026) als Hauptnavigation | MUST |
| F3 | Vorab kuratierte Liste von Angeboten (Attraktionen, Wanderungen, Bäder etc.) | MUST |
| F4 | Angebot per Klick einem Tag zuordnen | MUST |
| F5 | Angebot wieder vom Tag entfernen | MUST |
| F6 | Anzeige Altershinweis bei Min-Alter > 3 | MUST |
| F7 | Markierung Feiertag (Fronleichnam Do 4. Juni) | MUST |
| F8 | Filter nach Hochschwarzwald-Card-Vorteil | MUST |
| F9 | Filter nach Tags (Outdoor, Indoor, Wandern, Wasser, Tiere, Action, Schlechtwetter) | SHOULD |
| F10 | Filter nach Max-Distanz (Slider in km) | SHOULD |
| F11 | Notizfeld pro Tag (Reservierungen, Brotzeit-Memo etc.) | SHOULD |
| F12 | Reset-Funktion (alle Daten löschen) | SHOULD |
| F13 | Export / Import des Plans als JSON | NICE-TO-HAVE |
| F14 | Eigene Angebote anlegen | NICE-TO-HAVE |
| F15 | Wetter-Vorschau pro Tag | NICE-TO-HAVE |
| F16 | Druckbare Tagesübersicht | NICE-TO-HAVE |

### Nicht-funktional

| # | Anforderung |
|---|-------------|
| NF1 | Mobile-first (primäre Nutzung am Handy) |
| NF2 | Funktioniert offline nach erstem Laden |
| NF3 | Keine Login-Pflicht, kein Tracking, keine Cookies |
| NF4 | Lädt in < 2 s auf 4G |
| NF5 | Distinkter, nicht-generischer "AI-Slop"-Look — editorial-alpine |

## Datenmodell

### `Offer` (Angebot)

```ts
type OfferTag = 'outdoor' | 'indoor' | 'mix' | 'water' | 'animals'
              | 'hike' | 'train' | 'thrill' | 'badWeather';

type Price = '€' | '€€' | '€€€' | 'Gratis';

interface Offer {
  id: string;                    // 'tatzmania', 'sauschwaenzle', ...
  name: string;                  // Anzeigename
  sub: string;                   // Untertitel ("Zoo + Freizeitpark")
  location: string;              // "Löffingen (0 km)"
  distance: number;              // km von Löffingen
  duration: string;              // "Ganztags", "Halbtags", "2–3 h"
  minAge: number;                // 0 wenn keine Beschränkung
  tags: OfferTag[];
  price: Price;
  cardIncluded: boolean;         // Hochschwarzwald Card 1x gratis
  cardDiscount?: string;         // Optional, z.B. "30 % auf 4h-Ticket"
  description: string;           // 1–2 Sätze
  pro?: string;                  // Kurzes Pro-Argument
  con?: string;                  // Kurzes Contra-Argument
  warning?: string;              // Z.B. "Nicht mit 3-Jährigem"
  url?: string;                  // Offizielle Website
}
```

### `TripDay`

```ts
interface TripDay {
  date: string;     // 'YYYY-MM-DD'
  weekday: string;  // 'Mo'
  full: string;     // 'Montag'
  day: number;      // 1..7
  holiday?: string; // 'Fronleichnam — überfüllt!'
}
```

### `AppState`

```ts
interface AppState {
  plan: Record<string, string[]>;     // date -> [offerId]
  notes: Record<string, string>;      // date -> note
  customOffers: Offer[];              // user-defined (UI noch nicht implementiert)
}
```

### Storage

Ein einziger Key in `localStorage`:

```
schwarzwald-loeffingen-2026-v1
```

Wert: `JSON.stringify(AppState)`.

Bei einem Schema-Breaking-Change → neuer Key mit hochgezähltem Suffix (`-v2`).

## User Flows

### Flow 1: Tag planen

1. Nutzer wählt Tag in der oberen Day-Strip → Tag wird hervorgehoben.
2. Tag-Detail-Bereich zeigt: bisherige Pläne (leer am Anfang), Notizfeld, ggf. Feiertagswarnung.
3. Nutzer scrollt zu Katalog, filtert ggf.
4. Klick auf "An Tag hinzufügen" auf einer Angebot-Karte → 7 Mini-Day-Buttons erscheinen → Nutzer wählt Tag.
5. Angebot erscheint sofort im Tag-Detail.

### Flow 2: Notiz schreiben

1. Tag ist ausgewählt.
2. Nutzer tippt in Notiz-Textarea.
3. Auto-Save 400 ms nach letzter Eingabe (visueller Hinweis oben rechts).

### Flow 3: Zurücksetzen

1. Footer → "Alles zurücksetzen" → `window.confirm()` → State auf Defaults.

## UI / Layout

### Sektionen (top → bottom)

1. **Header** — Hero, Familie, Zeitraum
2. **Hochschwarzwald-Card-Hinweis** — Cream-Box mit Kreditkarten-Icon
3. **Day Strip** — 7 Tag-Buttons horizontal, scrollbar auf Mobile
4. **Day Detail** — Aktiver Tag mit Plänen + Notiz
5. **Katalog** — Filter-Bar + Distanz-Slider + Cards-Grid (`auto-fill, minmax(280px, 1fr)`)
6. **Footer** — Auto-Save-Hinweis + Reset

### Breakpoints

- Mobile: < 640 px — 1 Spalte
- Tablet: 640–1024 px — 2 Spalten Katalog
- Desktop: > 1024 px — 3+ Spalten

## Inhalt: 16 kuratierte Angebote

Vollständige Quellen siehe `RESEARCH.md`. Distanzen sind grob (Straße, Google-Maps-Schätzung).

| ID | Name | Distanz | Min-Alter | Card-inkl. |
|----|------|---------|-----------|------------|
| `tatzmania` | Tatzmania Löffingen | 0 km | 0 | ✓ |
| `waldbad` | Waldbad Löffingen | 0 km | 0 | ✓ |
| `hallenbad-dittis` | Hallenbad Dittishausen | 3 km | 0 | ✓ |
| `sauschwaenzle` | Sauschwänzlebahn | 20 km | 0 | – |
| `schluchsee` | Schluchsee + Schiff | 18 km | 0 | ✓ |
| `titisee` | Titisee Promenade | 22 km | 0 | – |
| `badeparadies` | Badeparadies Schwarzwald | 22 km | 0 | – (30 % Rabatt) |
| `feldberg` | Feldberg + Seilbahn | 28 km | 0 | ✓ |
| `gauchach` | Gauchachschlucht | 8 km | 5 | – |
| `wutachschlucht` | Wutachschlucht | 15 km | 6 | – |
| `steinwasen` | Steinwasen-Park | 52 km | 0 | – |
| `hasenhorn` | Hasenhorn-Coaster | 55 km | 3 | – |
| `triberg` | Triberger Wasserfälle | 45 km | 0 | – |
| `blackforestline` | Blackforestline Hängebrücke | 55 km | 4 | ✓ |
| `ortsrallye` | Ortsrallye Löffingen | 0 km | 4 | – |
| `house-of-senses` | Black Forest House of Senses | 60 km | 5 | ✓ |

## Erwartete Vorbereitung durch Nutzer (außerhalb der App)

- Hochschwarzwald Card beim Vermieter aktivieren (falls Unterkunft mitmacht — ab 2 Übernachtungen kostenlos).
- Sauschwänzlebahn-Reservierung wenn Wochenende, da Sitzplätze nicht garantiert sind bei kurzfristiger Buchung.
- Badeparadies via Card-Portal `mein.hochschwarzwald.de` mit 30 % Rabatt buchen.
- Wetter am Vorabend checken, ggf. Schlechtwetter-Plan (Hallenbad / Badeparadies) ziehen.

## Out of Scope

- Routing / Navigation
- Hotel- oder Restaurant-Buchung
- Live-Preise
- Push-Benachrichtigungen
- Sharing mit anderen Nutzern (möglich später via JSON-Export)
- Mehrsprachigkeit (nur Deutsch)
