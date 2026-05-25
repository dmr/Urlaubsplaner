# Schwarzwald Planner — Löffingen, Pfingsten 2026

Eine Browser-App zur Planung eines einwöchigen Familienurlaubs im Hochschwarzwald rund um Löffingen. Daten werden lokal im Browser gespeichert (`localStorage`).

**Reisedaten:** Mo 1. – So 7. Juni 2026
**Familie:** 4 Erwachsene + 3 Kinder (7, 6, 3 Jahre)

## Features

- 7-Tage-Übersicht mit Wechsel zwischen Tagen
- 16 kuratierte Angebote rund um Löffingen (Hochschwarzwald)
- Per Klick einem Tag zuordnen / entfernen
- Filter nach Hochschwarzwald-Card-Vorteil, Indoor/Outdoor, Wasser, Tiere, Wandern, Action, Schlechtwetter
- Distanz-Slider (Max-Fahrtkilometer)
- Notiz pro Tag
- Altershinweise (Warnung bei Min-Alter > 3 wegen des 3-jährigen Kindes)
- Markierung Feiertag (Fronleichnam Do 4. Juni)
- Auto-Save in `localStorage`
- Reset-Button

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS
- lucide-react Icons
- Fonts: Fraunces (Serif) + DM Sans (Sans) via Google Fonts
- Keine Backend-Abhängigkeit — alles client-side

## Quickstart

```bash
npm install
npm run dev
```

Dann im Browser `http://localhost:5173` öffnen.

Produktion bauen:

```bash
npm run build
npm run preview
```

## Projektstruktur

```
src/
├── App.tsx                  # Hauptkomponente, State-Management
├── main.tsx                 # React-Einstiegspunkt
├── index.css                # Tailwind-Basis + globale Styles
├── data/
│   ├── offers.ts            # 16 kuratierte Angebote
│   ├── tripDays.ts          # 7 Reisetage
│   └── colors.ts            # Farb-Palette
├── lib/
│   ├── storage.ts           # localStorage-Wrapper
│   ├── types.ts             # TypeScript-Typen
│   └── helpers.ts           # ageWarning, offerById etc.
└── components/
    ├── Header.tsx
    ├── HochschwarzwaldHint.tsx
    ├── TopoBackground.tsx
    ├── DayStrip.tsx         # 7-Tage-Auswahl
    ├── DayDetail.tsx        # Aktiver Tag mit Plan + Notiz
    ├── PlannedItem.tsx      # Einzelnes geplantes Angebot
    ├── OfferCard.tsx        # Angebot-Karte im Katalog
    ├── FilterBar.tsx        # Filter-Chips + Distanz-Slider
    └── Footer.tsx
```

## Weitere Dokumente

- [`SPEC.md`](./SPEC.md) — Funktionale Anforderungen, Datenmodell, Roadmap
- [`RESEARCH.md`](./RESEARCH.md) — Recherche-Quellen (Hochschwarzwald Card, Sauschwänzlebahn-Fahrplan, Attraktionen, mit Datum)
- [`CLAUDE.md`](./CLAUDE.md) — Hinweise für Claude Code / Entwicklung mit KI

## Lizenz

Privates Projekt, keine Lizenz vergeben.
