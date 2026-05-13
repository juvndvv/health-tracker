# Health Tracker — Product Design Document

- **Status:** Revised after visual design pass
- **Date:** 2026-05-13
- **Audience:** Single user (personal app)
- **Distribution:** Not published. Installed directly on the owner's device.
- **Visual reference:** `design/` — interactive HTML prototype (Claude Design bundle) and Yurest design system.

## 1. Purpose

A personal mobile app to track strength training and body progress over time. The owner needs a fast, frictionless way to:

- Execute structured gym routines and log the actual work performed.
- Record body weight and body measurements over time.
- Visualize progress per exercise (strength gains), per metric (body weight, measurements), and per training cadence (which days were trained).

The app replaces a spreadsheet / notes / generic gym apps that either store too little, too much, or are too cluttered for this user's workflow.

## 2. Non-goals

To keep scope tight, the following are explicitly **out** of v1:

- User accounts, authentication, multi-user, sharing.
- Cloud sync, backend, or remote storage.
- Pre-loaded exercise catalog or animated exercise demonstrations.
- Day-of-the-week routine scheduling (the user picks freely each session).
- Rest timer, set completion alerts, supersets.
- Suggested progression algorithms.
- Per-set notes or session journaling.
- Cardio, HIIT, mobility, yoga, or non-resistance training modalities.
- Nutrition, calorie, hydration, sleep, or step tracking.
- HealthKit / Health Connect integration.
- Wearable device sync.
- Push notifications and reminders.
- Localization (single locale: Spanish UI, English code/docs).
- Tablet-optimized layouts.

These can be revisited later but are not part of this design.

## 3. Users and Use Cases

### User profile

A single user, fluent with mobile apps, trains at the gym a few times per week with structured routines they've built themselves. Wants their training history persisted reliably on-device and visualized in a few key charts.

### Core use cases

1. **Pre-gym setup (rare):** Create or edit a routine template (e.g., "Push Day") with exercises and target sets/reps/weight.
2. **At the gym (frequent):** Pick a routine, see the target for each exercise plus what they did last time, execute, log actual sets.
3. **Daily/weekly (frequent):** Record body weight on the scale.
4. **Weekly/monthly (occasional):** Record body measurements (waist, arm, chest, etc.).
5. **Anytime (occasional):** Review progress charts — body weight curve, per-exercise progression, training calendar heatmap, measurement evolution.

## 4. Information Architecture

The app is organized around five top-level tabs (Spanish labels in the UI, English here in parentheses):

1. **Inicio** *(Home)* — dashboard: weekly activity rings, quick-actions (Entrenar / Peso / Medida / Racha), body-weight card with sparkline, last-session summary, 12-week cadence preview.
2. **Entrenar** *(Train)* — recommended routine for today (auto-suggested) plus the full routine list, all start a workout.
3. **Rutinas** *(Routines)* — list, create, edit, archive, and unarchive routine templates.
4. **Ejercicios** *(Exercises)* — list, create, edit, archive, and unarchive exercises; grouped by muscle group, searchable.
5. **Progreso** *(Progress)* — visualizations as a four-segment selector: **Peso**, **Ejerc.**, **Cadencia**, **Medidas**.

Inner screens (pushed over the active tab, not tabs themselves):

- **Workout in progress** — opened from Entrenar; the centerpiece logging screen.
- **Workout summary** — shown after finishing a workout; opens from the in-progress screen and is also reachable from Home / Progress when reviewing a past session.
- **Exercise detail** — chart + history for a single exercise; opens from Ejercicios and from Progreso > Ejerc.
- **Routine editor** — opens from Rutinas (new or existing).
- **Record weight** — opens from Inicio and from Progreso > Peso.
- **Record measurement** — opens from Inicio and from Progreso > Medidas.
- **Settings** — opens from Inicio (gear icon in the header). Holds owner name, weekly ring goals, theme, and (future) data export.

## 5. Core Concepts and Data Model

The data model uses five primary entities. All persisted in local SQLite via Drizzle ORM.

### 5.1 Exercise

A movement the user performs (e.g., "Press banca", "Sentadilla"). Created on demand — the catalog starts empty.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | autoincrement |
| `name` | text | unique, required |
| `muscle_group` | text (enum) | **required**. One of: `Pecho`, `Espalda`, `Pierna`, `Hombro`, `Brazo`, `Core`, `Otros`. Enforced via CHECK constraint. |
| `created_at` | integer (epoch ms) | required |
| `archived_at` | integer \| null | soft-delete; archived exercises don't appear in pickers but historical sets remain |

Rationale for required+enum: the design groups exercises by muscle group in the catalog and uses it as a dimension in the cadence breakdown. A closed set keeps the groupings clean without inventing onboarding flows.

### 5.2 Routine template

A reusable workout plan (e.g., "Push Day") composed of an ordered list of exercises, each with a target prescription.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `name` | text | unique, required |
| `created_at` | integer | |
| `archived_at` | integer \| null | soft-delete |

### 5.3 Routine exercise (template item)

The prescribed work for one exercise within a routine template.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `routine_id` | FK → routine_templates | |
| `exercise_id` | FK → exercises | |
| `position` | integer | order within the routine |
| `target_sets` | integer | e.g., 3 |
| `target_reps` | integer | e.g., 8 |
| `target_weight_kg` | real \| null | optional (bodyweight exercises) |

Uniqueness: `(routine_id, position)`.

### 5.4 Workout session

A single executed gym visit. Created when the user starts training. Persists until they explicitly finish or abandon it.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `routine_id` | FK → routine_templates \| null | null if the routine was deleted afterward |
| `routine_name_snapshot` | text | denormalized name at execution time (history survives routine deletion) |
| `started_at` | integer | |
| `finished_at` | integer \| null | null while in progress |

### 5.5 Session set

One executed set within a session. There may be more or fewer than the template prescribed (override semantics).

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `session_id` | FK → workout_sessions | |
| `exercise_id` | FK → exercises | |
| `exercise_name_snapshot` | text | denormalized for history |
| `position` | integer | order of this set among sets for this exercise in this session |
| `weight_kg` | real \| null | actual weight used |
| `reps` | integer | actual reps performed |
| `completed_at` | integer | when the set was logged |

### 5.6 Body weight entry

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `recorded_on` | text (ISO date `YYYY-MM-DD`) | unique — one entry per day; re-entering overwrites |
| `weight_kg` | real | required |
| `created_at` | integer | |

### 5.7 Measurement type

User-defined measurement labels (e.g., "Waist", "Right arm"). Created on demand.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `name` | text | unique |
| `unit` | text | "cm" or "%" (only two supported in v1) |
| `archived_at` | integer \| null | |

### 5.8 Measurement entry

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | |
| `measurement_type_id` | FK → measurement_types | |
| `recorded_on` | text (ISO date) | |
| `value` | real | required |
| `created_at` | integer | |

Uniqueness: `(measurement_type_id, recorded_on)` — one entry per day per measurement type. Re-entering overwrites the existing row.

### 5.9 Settings (key-value)

A single-row "preferences" table. Holds owner-configurable values that don't fit anywhere else.

| Key | Type | Default | Notes |
|---|---|---|---|
| `owner_name` | text \| null | `null` | Shown on Home (`Hola, <name>`). Blank → "Hola" alone. |
| `weekly_goal_sessions` | integer | `4` | Outer activity ring target. |
| `weekly_goal_minutes` | integer | `240` | Middle activity ring target. |
| `weekly_goal_volume_kg` | integer | `18000` | Inner activity ring target (sum of weight × reps for the week, in kg). |
| `theme` | text | `dark` | One of `light`, `dark`, `system`. |
| `accent` | text | `#FA114F` | Fixed in v1; field reserved for future custom accent. |

Single row enforced by a `PRIMARY KEY id = 1` constraint. Updates use `UPSERT`.

### 5.10 Why template + snapshots

The hybrid target/override approach requires that:

- Editing a routine after the fact does **not** retroactively alter history.
- Deleting an exercise or routine does **not** corrupt past sessions.

This is achieved by snapshotting names into sessions/sets at execution time and by soft-deleting (archiving) instead of hard-deleting referenced entities. Hard delete is only allowed for entities with zero historical references.

## 6. Key Flows

### 6.1 Create a routine

1. Routines tab → "New routine".
2. Enter name → empty routine appears.
3. Add exercise → exercise picker (search by name; "Create new" if missing).
4. For each exercise, set target sets / reps / weight (weight optional).
5. Reorder via drag handles.
6. Save.

### 6.2 Start a workout

1. **Entrenar** tab → shows a **"Recomendado hoy"** card on top (auto-suggested routine, see 8.7) plus the full routine list.
2. Tap a routine → **"Workout in progress"** screen, organized as one card per exercise ("block"), in routine order.
3. Each block shows:
   - Muscle group (small uppercase) + exercise name.
   - **Target** (e.g., "Objetivo: 3 × 8 @ 80 kg").
   - **Última vez** chip: the last completed session's set summary for this exercise (e.g., "120×5 · 120×5 · 120×5 · 120×4 — hace 2 días"). Auto-fills the first set's inputs from the first set of that last session, or from the routine target if no prior session exists.
   - One row per prescribed set (steppered weight/reps + "Hecho" button).
4. The user logs each set with "Hecho" → set persisted, set marker turns into a checkmark; the **next set within the block is prefilled with the same weight/reps** the user just confirmed.
5. Per-block actions:
   - **Saltar**: marks all unlogged sets in this block as skipped (not persisted as sets, just advances to the next block). Visible until the block is fully logged.
   - **Añadir serie**: appends an extra set beyond the prescribed count.
6. Header shows running elapsed time and a progress bar (logged sets / total prescribed). An **X** button opens the "Abandonar entrenamiento?" confirm sheet.
7. **Terminar entrenamiento** opens a confirm sheet ("N series · X t · MM:SS") and on confirm:
   - Persists `finished_at` on the session.
   - Routes to **Workout summary** (see 6.6).
8. **Abandon** discards the session and its sets after a confirm sheet (in-progress sessions only).

### 6.3 Record body weight

- Inicio → tile "Peso" → opens **Record weight** sheet.
- Numeric input with a custom pad: large value display in the center, ± stepper buttons on the sides (step 0.1), and quick-adjust chips (`−1 / −0.5 / +0.5 / +1`). Date defaults to today.
- "Hace 7 días" reference label below the input.
- Save (header action) persists; if an entry exists for that date, it is overwritten (with a confirm).

### 6.4 Record measurement

- Inicio → tile "Medida" → opens **Record measurement** sheet.
- Pill row of measurement types (or `+` to create new); same numeric pad as 6.3.
- Same one-per-day overwrite behavior.

### 6.5 View progress

- **Progreso** tab → segment selector with four views:
  - **Peso:** body-weight line chart with range buttons (`1M / 3M / 6M / 1A / Todo`); KPI header with current value and signed delta over the range; "Últimos registros" list below.
  - **Ejerc.:** horizontal exercise chips selector → KPI header (current top-set + PR badge + session count); line chart with PR markers (a ring around each point that exceeds all prior values); **Top set ↔ Volumen** toggle (segmented control); "Últimas sesiones" list below. Tapping an item opens **Exercise detail** (6.7).
  - **Cadencia:** three "BigStat" cards (sesiones totales, sesiones/semana, horas totales) + GitHub-style heatmap of the trailing ~26 weeks. Tap any day with sessions to expand details (routine name, sets, duration). Below the heatmap: a "Por grupo muscular (12 sem)" list showing each muscle group as a horizontal bar (sessions touching that group, normalized to the busiest group).
  - **Medidas:** horizontal measurement-type chips selector → KPI header with delta vs the first entry in range → line chart → "Historial" list below.

### 6.6 Workout summary

Shown after the user confirms "Terminar entrenamiento" and reachable from Home / Progress when reviewing past sessions.

1. Big check-circle hero + "¡Sesión completa!" headline + routine name and date.
2. Three stat cards: **Series** (count), **Volumen** (in tonnes), **Duración** (minutes).
3. "Por ejercicio" list: each card lists an exercise and the comma-separated set log (`120×5 · 120×5 · 120×4`).
4. **Volver al inicio** primary button → pops back and switches to Inicio.

When reached from history (not just-finished), the layout is the same but the "Volver al inicio" button becomes a back chevron in the header.

### 6.7 Exercise detail

Reachable from Ejercicios (tap any row) and from Progreso > Ejerc. (potentially "Ver detalle" affordance).

1. Header with exercise name + back chevron.
2. Muscle group label + KPI (current top-set or total volume depending on toggle) + PR + session count.
3. **Top set ↔ Volumen** segmented toggle.
4. Line chart (same as Progress > Ejerc.) with PR ring markers.
5. "Historial" list of the last sessions touching this exercise, with top-set highlight and a **PR** tag where applicable.

## 7. Technical Stack

| Concern | Choice | Why |
|---|---|---|
| Runtime | Expo SDK (latest stable) | Fast iteration, OTA updates, can install on personal device via Expo Go or dev build |
| Language | TypeScript (strict) | Type safety end-to-end |
| Navigation | Expo Router (file-based) | Convention over config; deep linking for free |
| Persistence | `expo-sqlite` | Local, transactional, queryable |
| ORM | Drizzle ORM | Type-safe schemas + queries, lightweight, migrations |
| State (transient) | Zustand | In-progress session state, theme preference, picker UI state |
| State (persisted) | Drizzle queries directly, wrapped in React Query | Caching + invalidation without manual store work |
| Charts | Victory Native XL | Skia-backed, smooth on mobile, good API for line + custom markers (PR rings) |
| Forms | React Hook Form + Zod | Validation for numeric inputs |
| Date handling | date-fns | Tree-shakeable; Spanish locale (`es`) |
| Fonts | `expo-font` + Geist (variable) + Open Sauce One (Google Fonts) | See §12 |
| Icons | Phosphor Icons via `@phosphor-icons/react-native` (or `react-native-svg` + inline paths) | See §12 |
| Lint / format | ESLint + Prettier (Expo defaults) | |
| Testing | Vitest for pure logic; React Native Testing Library for components | |

### Project layout (proposed)

```
src/
  app/                       # Expo Router routes
    (tabs)/
      _layout.tsx            # Tab bar + theme provider
      index.tsx              # Inicio (Home)
      train.tsx              # Entrenar
      routines.tsx           # Rutinas
      exercises.tsx          # Ejercicios
      progress.tsx           # Progreso
    workout/[sessionId].tsx  # Workout in progress
    workout-summary/[sessionId].tsx
    exercise/[id].tsx        # Exercise detail
    routine/edit.tsx         # Routine editor (new or edit)
    record-weight.tsx
    record-measurement.tsx
    settings.tsx
  db/
    schema.ts                # Drizzle schema
    client.ts                # SQLite + Drizzle init
    migrations/
  features/
    exercises/
    routines/
    sessions/
    body-weight/
    measurements/
    progress/
    settings/
  ui/
    primitives/              # Card, Button, Tag, Segment, Note, Icon
    charts/                  # LineChart, Sparkline, ActivityRing, Heatmap
    workout/                 # SetCard, ExerciseBlock, Stepper, RoutineBadge
  theme/
    tokens.ts                # Spacing, radii, type scale (from Yurest DS)
    palette.ts               # Light + dark color sets + ember accent
    fonts.ts                 # expo-font registration
  lib/
    date.ts                  # fmtDayShort, fmtRelative (Spanish)
    units.ts                 # kg formatting, half-step rounding
    derived.ts               # streak, weekly stats, exercise history, heatmap
```

Each `features/<name>/` folder owns its queries, components, and screens, keeping vertical slices self-contained. Shared visual primitives live in `ui/`; theme tokens in `theme/`.

## 8. Behavior Details

### 8.1 Empty states

- First launch: Home shows "No data yet — record your weight or create a routine to start." Routines/Exercises tabs show empty-state CTAs.
- Train tab with zero routines: redirects (with a link) to Routines.

### 8.2 Units

- Body weight: kilograms (`kg`). One decimal.
- Exercise weight: kilograms. Half-kilogram resolution (`0.5` steps).
- Measurements: `cm` or `%`. One decimal.

No unit toggle in v1.

### 8.3 Dates and time zones

All dates are stored in the device's local time zone. `recorded_on` for body weight and measurements is a local-date string (`YYYY-MM-DD`) to avoid time-zone drift across sessions.

### 8.4 Editing history

- **In-progress session:** any logged set can be edited or deleted until the session is finished. Adding extra sets, changing weight/reps, removing a wrong entry — all allowed.
- **Finished workout sessions:** read-only in v1 except for "delete session" (hard delete with confirm; cascades to its sets). Individual set edits on past sessions are out of scope.
- **Past body weight / measurement entries:** editable (value only) and deletable.

### 8.5 Last-time auto-fill

For each `(exercise_id)`, "last time" = the most recent completed session containing at least one set for that exercise. The summary lists every set from that session in order. The first set of the current session auto-fills weight/reps from the **first** set of the last session.

If there is no prior session for the exercise, the target weight/reps from the routine template fill the input.

### 8.6 Archiving vs deleting

- Exercise / routine / measurement type with **zero** historical references: hard delete.
- Otherwise: archive (sets `archived_at`). Archived entities are hidden from pickers but appear (greyed) in their respective list screens with an "Restaurar" action.

### 8.7 Suggested routine ("Recomendado hoy")

Train tab shows one routine as the recommended pick. Selection algorithm (deterministic, runs at render):

1. Filter to non-archived routines.
2. For each routine, compute `last_used = max(workout_sessions.started_at WHERE routine_id = r.id)`. Routines never used get `last_used = 0`.
3. Pick the routine with the **smallest** `last_used` (least recently used). Ties broken by routine `id` ascending.
4. If there are zero routines, the suggestion card is hidden and the empty state explains how to create one.

Suggestion is informational — the user is free to pick any routine from the list below.

### 8.8 Streak ("racha")

A consecutive-weeks counter shown on the Inicio quick-action tile. Algorithm:

- Walk backwards from the current week (Mon–Sun). For each week, count sessions; if `>= 3`, increment streak and continue. Otherwise, stop.
- Cap inspection at 26 weeks to keep the query bounded.
- Display: `<N> semanas en racha` (or `1 semana en racha` for the singular form).

The current week always counts: a streak of `1` means "this week so far has at least 3 sessions".

### 8.9 Weekly activity rings

Three nested rings on the Home card, each showing progress against a configurable weekly goal (Mon–Sun window). Defaults from `settings`:

| Ring | Metric | Default goal | Color |
|---|---|---|---|
| Outer | Completed sessions this week | 4 | accent (ember) |
| Middle | Total minutes this week | 240 | `#10B981` (green) |
| Inner | Total volume kg this week | 18 000 | `#3B82F6` (blue) |

Goals are editable in **Settings**. Rings cap fill at 100% visually but can overflow to 150% to communicate "exceeded" (extra-thick arc).

### 8.10 Theme toggle

User-controllable theme stored in `settings.theme` (`light` / `dark` / `system`). Default: `dark`. The toggle lives in Settings. `system` follows the OS appearance via `useColorScheme`. The toggle is persisted across launches.

### 8.11 Recommended set prefill within a session

When a set is marked "Hecho" with values `(w, r)`, the **next un-logged set in the same exercise block** is pre-populated with the same `(w, r)` so the user only has to confirm or tweak. This is the in-session companion to the cross-session "Última vez" autofill described in 8.5.

## 9. Visual Design

The app inherits the **Yurest Design System** (coral/neutral palette, Open Sauce body type, Geist numerics, Phosphor icons, 4 pt spacing grid). A full prototype lives at `design/project/Health Tracker.html` and should be treated as the visual reference of record. Token file: `design/project/ds/colors_and_type.css`.

### 9.1 Color system

Default theme is **dark**; **light** is a complete alternative palette controlled via the theme toggle (8.10).

Brand accent overrides the DS coral with **ember red** `#FA114F` (the design's final pick):

```ts
accent = {
  primary:        '#FA114F',
  primary_dark:   '#D90033',
  primary_light:  '#FFD8E1',
  primary_lighter:'#FFEBF0',
}
```

App surfaces:

| Token | Dark | Light |
|---|---|---|
| `--app-bg` | `#000000` | `#F5F5F7` |
| `--app-surface` | `#161616` | `#FFFFFF` |
| `--app-surface-2` | `#1F1F1F` | `#FAFAFA` |
| `--app-text` | `#FFFFFF` | `#1F1F1F` |
| `--app-text-2` | `rgba(255,255,255,0.6)` | `#666666` |
| `--app-text-3` | `rgba(255,255,255,0.4)` | `#8F8F8F` |
| `--app-border` | `rgba(255,255,255,0.08)` | `#EBEBEB` |

Semantic colors (used in metric deltas, charts, status badges) reuse Yurest tokens: `--success #10B981`, `--info #3B82F6`, `--warning #F59E0B`, `--error #ED5A46`.

### 9.2 Typography

| Family | Use |
|---|---|
| **Open Sauce One** (400/500/600/700/800) | Body, UI labels, headings |
| **Geist** (variable) | All numeric values: weights, reps, KPIs, chart axes, durations. `font-feature-settings: "tnum" 1` for tabular figures |

Type scale (Yurest tokens, lifted into `theme/tokens.ts`):

- Display: 30 / 40 / 64 px (only the largest used in v1, for KPI numbers).
- Headline: 24 / 32 / 40 px.
- Title: 14 / 16 / 18 px (`semibold` 600).
- Body: 14 / 16 / 18 px.
- Label: 10 / 12 / 14 px (`medium` 500). Uppercase + 0.08-0.12 em tracking for section captions.

### 9.3 Spacing & radii

4 pt grid: `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64 / 80`. Corner radii:

- Cards / sections: **18 px**, **20-22 px**, or **24 px** (decreasing nesting).
- Small chips, tooltips, tags: **6-8 px**.
- Stepper buttons, pill chips, badges: **999** (full pill).
- Workout "Hecho" / numeric pad buttons: **10-14 px**.

### 9.4 Iconography

**Phosphor Icons** outline weight, 24 × 24, foreground colour matches container. The prototype ships inline-SVG copies of the ~30 icons actually used in `design/project/components.jsx`. Production should import from `@phosphor-icons/react-native` or `react-native-svg` with the same path set.

### 9.5 Components

Recurring primitives, all defined in `ui/primitives/`:

- **Card** — surface + 1 px border + 18-24 px radius + 14-20 padding.
- **Button** — variants: `primary` (filled, ember accent), `outline`, `ghost`, `dark`. Sizes: `sm 36` / `md 44` / `lg 52` px.
- **Tag** — colored pill (6 px radius, lighter-tint background + matching saturated text).
- **Segment** — segmented control (used for Top set ↔ Volumen, theme toggle, etc.).
- **Stepper** — `[−] value/label [+]`, rounded full buttons, half-kg step for weight.
- **ActivityRing** — three-stacked SVG ring (sessions / minutes / volume).
- **Sparkline** — 1.8 px stroke + 18% area fill, used in tiles.
- **LineChart** — single-series line with gradient fill, optional PR markers (concentric circle), terminal-point dot, sparse X-axis labels.
- **Heatmap** — 26-week grid, 7 rows; intensity bucketed by session volume (0…4).
- **RoutineBadge** — square 16 px radius with the routine name's first letter in `Bowlby One SC`-style display weight.

### 9.6 Motion

Subtle, restrained:

- Tab/inner-screen transitions: 240-280 ms ease-out (opacity + 4% scale-in on the new view).
- Progress bar and ring animations: 320-600 ms cubic-bezier(0.16, 1, 0.3, 1).
- Buttons: 180 ms ease-out color transitions only. No scale-on-press.
- Sheet/confirm: slide-up 280 ms.

### 9.7 Language

Spanish (es-ES) throughout the UI. Casing: **sentence case** for labels, buttons, headers. Section captions: ALL-CAPS + tracking, only in tiny `--type-label-md` sizes. Relative dates: `hoy`, `ayer`, `hace 3 días`, `hace 1 semana`, `hace 2 meses` (see `lib/date.ts`).

### 9.8 Reference prototype

`design/project/Health Tracker.html` contains a fully interactive HTML+React prototype of the entire app (5 tabs + workout + summary + record sheets), with a tweaks panel covering: light/dark, accent palette, density, populated/empty data, design commentary overlays, and three alternative workout-log patterns (cards, list, focus). **Cards** is the chosen pattern for v1. The other prototype-only knobs are not v1 features.

## 10. Open Questions

Decided during initial brainstorm and design pass (kept here as audit trail):

1. **Backup / export:** out of scope for v1. JSON export remains a follow-up; documented as the main mitigation for local-only-data risk (§12).
2. **Volume calculation for bodyweight exercises (weight = null):** v1 shows reps-only progression for any exercise that has any null-weight set. Revisit if it feels wrong.
3. **PR definition:** heaviest weight lifted for any rep ≥ 1. Estimated 1RM deferred to v2.
4. **Routine duplication:** v1 supports "Duplicar rutina" — cheap and avoids re-creating variants by hand.
5. **`muscle_group` cardinality:** required, closed enum (`Pecho`, `Espalda`, `Pierna`, `Hombro`, `Brazo`, `Core`, `Otros`). Free-text rejected to keep cadence breakdowns clean.
6. **Weekly ring goals:** three rings (sessions, minutes, volume) with editable defaults (4 / 240 / 18 000). Edited from Settings.
7. **Streak:** consecutive weeks with ≥ 3 sessions (week = Mon–Sun, capped at 26 weeks back).
8. **Recommended routine:** least-recently-used; ties broken by routine id. No day-of-week scheduling.
9. **Theme:** dark by default, with a persisted `light/dark/system` toggle in Settings. Accent fixed at ember `#FA114F` for v1.
10. **Owner name:** configurable in Settings; blank → Inicio shows "Hola" alone.

Still open (decide during implementation):

- **Settings screen depth:** v1 surfaces only the keys in §5.9. Adding archived-items management here vs. in each list screen — defer to plan phase.

## 11. Success Criteria

The design is successful if, after one month of use:

- The user logs at least 80% of their gym sessions in the app (vs. nothing / spreadsheet).
- Recording a set during a workout takes ≤ 3 taps.
- Pulling up the per-exercise progression chart for any exercise takes ≤ 4 taps from app launch.
- No data has been lost or corrupted across app restarts and OS updates.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Local-only data → device loss = total loss | Add JSON export in follow-up phase; user manually saves to iCloud/Drive |
| Schema migrations breaking existing data | Drizzle migrations + a "DB version" check at launch; one-shot backup before applying |
| Chart library performance with large histories | Victory Native XL handles thousands of points; downsample if a single chart query returns > 1000 |
| Scope creep mid-build | This document plus the plan are the contract; new features go to a backlog |
