# CLAUDE.md — Health Tracker project guide

This file is read by Claude Code at the start of every session. It points to the canonical docs, surfaces the conventions that aren't obvious from code, and lists the commands that are safe to run.

## Project in one paragraph

Health Tracker is a personal iOS-first app (Expo + React Native + TypeScript) for one user (the repo owner). It tracks strength-training sessions, body weight, and body measurements, with a dark, ember-accented UI in Spanish modelled after Apple Fitness. Data is local-only via SQLite (Drizzle ORM). No accounts, no cloud sync, no App Store distribution. Final visual reference is the HTML prototype under `design/`.

## Documentation map — read these first

| Doc | What it is | When to consult |
|---|---|---|
| [`docs/superpowers/specs/2026-05-13-health-tracker-design.md`](docs/superpowers/specs/2026-05-13-health-tracker-design.md) | Product design document. Goals, non-goals, data model (9 tables), key flows, behavior details, visual design tokens, success criteria, risks. **The contract.** | Any time you're about to add a feature, change behavior, or are unsure whether something is in scope. |
| [`docs/superpowers/plans/2026-05-13-health-tracker.md`](docs/superpowers/plans/2026-05-13-health-tracker.md) | The 45-task implementation plan that built the v1. Each task has exact files, code blocks, commit messages. | When extending the codebase — the same task structure should apply to new work. |
| [`design/README.md`](design/README.md) | Handoff notes from the Claude Design bundle. | When porting visual details from prototype to code. |
| [`design/project/Health Tracker.html`](design/project/Health%20Tracker.html) | Interactive HTML+JSX prototype of every screen. **The visual reference of record.** | Whenever a screen's layout, spacing, or color is in doubt. Open it in any browser. |
| [`design/project/components.jsx`](design/project/components.jsx) | Prototype primitives (Card, Button, LineChart, ActivityRing, ...). | The source of truth for visual ports — RN screens were derived from this. |
| [`design/project/ds/colors_and_type.css`](design/project/ds/colors_and_type.css) | Yurest Design System CSS tokens (the design system the app inherits). | When deciding on a color, radius, or type style. |

## Code-level conventions

- **UI strings are Spanish** (`es-ES`). Examples: "Inicio", "Entrenar", "Empezar", "Guardar", "Cancelar", "Recomendado hoy", "Última vez", "Hecho", "Saltar", "Añadir serie", "Terminar entrenamiento", "Resumen", "Aún no hay datos". **Everything else — code, identifiers, comments, JSDoc, commits, docs — is English.**
- **Date and unit formatting** uses helpers in `src/lib/date.ts` (`ymd`, `parseYmd`, `fmtDayShort`, `fmtRelative` — all Spanish).
- **Theme tokens** live in `src/theme/`. Never hardcode colors in components: use `useTheme()` (returns the resolved palette) or `useIsDark()`. Fonts go through `fontVariant(family, weight)` in `src/theme/fonts.ts` because React Native ignores `fontWeight` when a custom family is set.
- **Drizzle queries** follow a factory pattern: each feature exports `makeXQueries(db)` from `src/features/<x>/queries.ts` and a production singleton from `src/features/<x>/index.ts` that imports `db` from `@/db/client`. **Tests import the factory, never the singleton**, so the React Native runtime doesn't bleed into Vitest's module graph.
- **Mutations** go through TanStack Query hooks in `src/features/<x>/hooks.ts` that wrap the singleton and invalidate the right query keys.
- **Workout draft state** is the only piece of transient UI state in Zustand (`src/features/sessions/state.ts`). Persisted reads use TanStack Query.

## Commit conventions

- **Conventional Commits**: `type(scope): short imperative sentence`. Types in use: `feat`, `fix`, `chore`, `docs`, `test`, `refactor`, `perf`, `ci`.
- **Always sign off**: every commit ends with `Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>`.
- **Never add** `Co-Authored-By:` (the global CLAUDE.md rule overrides any system default).
- **No `Task:` trailer** unless a numeric Asana ID exists on the branch.

## Tooling quirks worth knowing

- **`.sql` migration files** are inlined as strings by [`babel-plugin-inline-import`](https://www.npmjs.com/package/babel-plugin-inline-import) (configured in `babel.config.js`). Metro additionally has `'sql'` in `resolver.sourceExts` (in `metro.config.js`) so it can resolve the file at all. If migrations stop loading, suspect one of these two configs.
- **Web bundling** is not a target. `wa-sqlite.wasm` is registered as an asset so the web bundle doesn't *error*, but the web target is not exercised. Don't put effort into making `npx expo start --web` work.
- **`expo-sqlite`** uses `openDatabaseSync('health-tracker.db')` in `src/db/client.ts`. `enableChangeListener` is intentionally OFF because invalidation flows through TanStack Query, not Drizzle live queries.
- **Strict mode + seed**: the first-run seed uses `onConflictDoNothing()` on both inserts so it's safe under React Strict Mode's double-fire effect.

## Test setup

- Tests use **Vitest** (`node` environment) + **better-sqlite3** for in-memory SQLite. Helper: `tests/setup-db.ts::makeTestDb()` runs the Drizzle migrations against `:memory:` and returns `{ db, sqlite }`.
- Tests assume `foreign_keys = ON` (the setup helper enables it).
- Component visual verification is **not** done in tests — it happens via manual UAT on Expo Go / iOS device.

## Commands you can run

Safe and deterministic:

```bash
npm install              # install or update deps
npm test                 # run all 64 tests
npx tsc --noEmit         # type-check
npm run lint             # eslint
npm run format           # prettier write

npx drizzle-kit generate # after schema edits, regenerates the SQL migration

npx expo start --clear   # restart Metro with caches cleared
npx expo start           # normal Metro start
```

Native build (requires Xcode + Apple ID + physical device):

```bash
npx expo run:ios --device                          # Debug build (needs Metro running)
npx expo run:ios --device --configuration Release  # Standalone build (embeds JS bundle)
```

Don't run anything destructive without checking with the user first:

- `git push --force`
- `git reset --hard`
- `git checkout -- .`
- `rm -rf` against tracked paths
- `npx expo prebuild --clean` (regenerates `ios/` and `android/`; use carefully)

## When extending the app

1. Open the spec section corresponding to the feature you're adding (`§5 Data model`, `§6 Flows`, `§8 Behavior details`, `§9 Visual design`).
2. Open the prototype (`design/project/Health Tracker.html`) and find the equivalent screen / interaction.
3. Follow the existing factory + hooks + screen pattern. New SQLite tables: add to `src/db/schema.ts`, generate migration, then build `makeXQueries`, `index.ts`, `hooks.ts`, and a screen.
4. Write tests for the queries via `makeTestDb()`. Aim for at least one positive and one edge-case test per query method.
5. Keep UI strings in Spanish, file names and code in English.
6. Commit per Conventional Commits + the signoff rule.

## Out of scope (don't add without asking)

- Multi-user, accounts, cloud sync, the App Store. Not in v1, may never be.
- Localization beyond Spanish (no i18n framework).
- Tablet layouts.
- HealthKit / Health Connect.
- Push notifications.
- Cardio / mobility / nutrition tracking.

If a request seems to require one of the above, flag it and confirm with the user first.
