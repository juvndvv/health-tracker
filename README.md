# Health Tracker

A personal mobile app to track gym workouts, body weight, and body measurements. Single user, local-only data, dark-first UI in Spanish.

- **Platform:** iOS (Android works but visual polish targets iOS).
- **Stack:** Expo SDK + TypeScript + Expo Router + SQLite (Drizzle ORM) + Zustand + TanStack Query + Victory Native XL + Phosphor Icons.
- **Status:** v1 feature-complete and runnable via Expo Go or a sideloaded development build.

## Quick start

```bash
npm install
npx expo start          # opens Metro; scan QR with Expo Go
```

To install a standalone build on a physical iPhone (requires Xcode):

```bash
npx expo run:ios --device --configuration Release
```

## Repo layout

```
app/                          # Expo Router routes (screens + modals)
  (tabs)/                     # 5 main tabs: index, train, routines, exercises, progress
  workout/[sessionId].tsx     # in-progress workout screen
  workout-summary/[sessionId].tsx
  exercise/[id].tsx           # exercise detail with PR chart
  routine/edit.tsx            # routine editor
  routine/[id]/add-item.tsx
  record-weight.tsx
  record-measurement.tsx
  measurement-type/new.tsx
  settings.tsx
src/
  db/                         # Drizzle schema, migrations, client, seed
  features/                   # exercises, routines, sessions, body-weight, measurements, settings, progress
  ui/                         # primitives (Card, Button, Stepper, ...) + charts (LineChart, Heatmap, ActivityRing)
  theme/                      # tokens, palette (light/dark + ember accent), fonts
  lib/                        # date, color helpers
tests/                        # vitest — pure logic + drizzle queries against in-memory better-sqlite3
docs/superpowers/
  specs/                      # product design document
  plans/                      # implementation plan (45 tasks across 6 phases)
design/                       # interactive HTML prototype + Yurest design system bundle
```

## Common commands

| Command | What it does |
|---|---|
| `npm test` | Run the Vitest suite (~64 tests, ~400 ms). |
| `npx tsc --noEmit` | Type-check the whole project. |
| `npm run lint` | ESLint over the codebase. |
| `npm run format` | Prettier write. |
| `npx drizzle-kit generate` | Generate a new SQL migration after editing `src/db/schema.ts`. |
| `npx expo start --clear` | Start Metro with cleared caches (use after editing `metro.config.js` or `babel.config.js`). |

## Documentation

The full design contract lives in [`docs/superpowers/specs/2026-05-13-health-tracker-design.md`](docs/superpowers/specs/2026-05-13-health-tracker-design.md). The implementation plan that built it lives in [`docs/superpowers/plans/2026-05-13-health-tracker.md`](docs/superpowers/plans/2026-05-13-health-tracker.md).

The visual prototype — including the Yurest design system tokens and Geist fonts — is bundled under [`design/`](design). Treat `design/project/Health Tracker.html` as the visual reference of record; the React Native screens are 1:1 ports.

## Conventions

- **UI strings:** Spanish (`es-ES`). Code, comments, commit messages and docs: English.
- **Commits:** Conventional Commits, signed off with `Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>`. No `Co-Authored-By` trailer.
- **Data:** every user-facing action that writes to SQLite goes through a feature `queries.ts` factory (`makeXQueries(db)`) so the same code runs against expo-sqlite (production) and better-sqlite3 (tests).
- **Theme:** dark by default, ember accent `#FA114F`, persisted toggle to `light` or `system` via Settings.

## License

Personal use. Not published.
