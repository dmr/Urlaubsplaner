# CLAUDE.md — Hinweise für Claude Code

Diese Datei wird automatisch von Claude Code (https://claude.com/claude-code) eingelesen und liefert Projektkontext, Conventions und Roadmap. Hier nicht zu viel reinpacken — kurz und scharf halten.

## Was ist das?

Ein React-Browser-App-Prototyp für die Familienurlaubsplanung im Schwarzwald (Löffingen, 1.–7. Juni 2026). Alles client-side, Daten in `localStorage`.

## Tech-Stack — bitte beibehalten

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** mit Custom-Colors in `tailwind.config.js` (forest, moss, cream, amber, etc.)
- **lucide-react** für Icons
- **Keine** externen UI-Bibliotheken (kein MUI, kein shadcn, kein chakra) — der Look soll editorial-handcrafted bleiben
- **Keine Backend-Abhängigkeit** — nichts wird auf einen Server geschickt

## Design-Prinzipien

- **Editorial-Alpine-Aesthetik**: Tiefes Waldgrün, cremefarbene Karten, warmer Amber-Akzent. Kein generisches SaaS-Purple-Gradient.
- **Typografie**: Fraunces (italic, serif) für Display-Headings, DM Sans für Body. Nicht durch Inter/Roboto ersetzen.
- **Spacing großzügig**, Zeilenabstand 1.4–1.6 für Lesefluss.
- **Mobile-first** — die Familie nutzt das primär auf dem Handy. Cards müssen einspaltig funktionieren.

## Wo welche Logik liegt

- **State** lebt komplett in `App.tsx` (useState + useEffect Auto-Save).
- **Storage** ist in `src/lib/storage.ts` gekapselt. `localStorage` wird dort angesprochen — keinen direkten `localStorage`-Zugriff in Components einbauen.
- **Daten** (Angebote, Tage, Farben) liegen in `src/data/`. Wenn neue Angebote dazukommen, dort ergänzen — Format steht in `src/lib/types.ts`.
- **Helpers** für UI-Hilfen (`ageWarning`, `offerById`, `tagChip`) liegen in `src/lib/helpers.ts`.

## Wichtige fachliche Regeln

1. **Hochschwarzwald Card**: Manche Angebote sind 1× pro Aufenthalt gratis enthalten (`cardIncluded: true`). UI muss das deutlich kennzeichnen (Ticket-Icon + Farbe Amber).
2. **Altersbeschränkungen**: Der jüngste Reisende ist 3 Jahre alt. Angebote mit `minAge > 3` müssen eine Warnung anzeigen. Die Wutachschlucht ist explizit als unpassend markiert.
3. **Fronleichnam Donnerstag 4. Juni 2026** ist Feiertag in BW. Der Tag muss in der UI mit einem `AlertTriangle` markiert sein.
4. **Distanzangaben** sind grob (km von Löffingen) und dienen nur dem Filter — keine Routing-Engine einbauen.

## Roadmap / sinnvolle nächste Schritte

Geordnet nach Aufwand × Nutzen:

1. **Wetter-API anbinden** (Open-Meteo, kostenlos, kein API-Key) — pro Tag ein Wetter-Badge. Empfehlung im Code als TODO drin: `// TODO weather`.
2. **Multi-Device-Sync via Export/Import**: Button "Plan exportieren" → JSON-Datei. "Plan importieren" → File-Input. So können die 4 Erwachsenen den Plan teilen.
3. **Druckansicht** (CSS `@media print`) für eine Tagesübersicht zum Ausdrucken/Mitnehmen.
4. **Eigene Angebote anlegen** — das Datenmodell `customOffers` ist schon im State vorgesehen, UI fehlt noch.
5. **Geteilte Liste via einfachem Backend** (Supabase, Firebase) — Hochskalierung, nur wenn wirklich nötig.

## Was NICHT machen

- **Keine** Authentifizierung. Es ist eine private 7-Tage-Familien-App.
- **Keine** Map-Integration mit API-Keys (zu komplex für den Use Case).
- **Keine** Cloud-Storage. Daten bleiben im Browser.
- **Kein** Routing (`react-router`) — Single-Page reicht.
- **Keine** Animation-Library (framer-motion etc.) — CSS-Transitions sind genug.

## Code-Conventions

- **TypeScript strict mode** ist an. Keine `any` ohne Begründung.
- **Imports** absolut von `@/` (Vite-Alias zeigt auf `src/`).
- **Components** als Funktionen mit Default-Export.
- **Props-Typen** inline, kein separates `types.ts` pro Component (außer für globale Domain-Typen in `src/lib/types.ts`).
- **Kommentare** auf Deutsch okay, da der User-Kontext deutsch ist. Code-Identifier englisch.
- **Tests**: aktuell keine. Wenn welche dazukommen sollen → Vitest, nicht Jest.

## Bekannte offene Punkte

- Hochschwarzwald-Card-Inklusivleistungen wurden im Mai 2026 aus Web-Quellen kuratiert. Bitte vor Buchung auf https://www.hochschwarzwald.de/planen-buchen/hochschwarzwald-card/alle-spar-vorteile gegenchecken — Leistungen ändern sich saisonal.
- Sauschwänzlebahn-Fahrplan 2026: läuft Sa+So + ab Juni auch Do+Fr bis 25. September. Preise Diesel 17,50 € / Dampf 30,00 € (Stand: PDF-Fahrplan 2026).
- Preise als Tendenz (€/€€/€€€), keine harten Beträge gespeichert — bewusste Designentscheidung, damit Daten nicht veralten.

## Wenn ich (Claude) das Projekt weiterentwickle

Reihenfolge:
1. `RESEARCH.md` und `SPEC.md` lesen, dann `src/data/offers.ts` als Single Source of Truth.
2. Bei UI-Änderungen Mobile-Layout (≤ 400 px) zuerst.
3. Bei neuen Angeboten: TypeScript-Typ in `src/lib/types.ts` prüfen, dann in `src/data/offers.ts` ergänzen — kein neuer Code in Components nötig, die mappen automatisch.
4. Tailwind-Custom-Colors nicht durch arbitrary values (`bg-[#162820]`) ersetzen — Token-System nutzen.
