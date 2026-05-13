# Health Tracker — Product Design Document

- **Status:** Draft
- **Date:** 2026-05-13
- **Audience:** Single user (personal app)
- **Distribution:** Not published. Installed directly on the owner's device.

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

The app is organized around five top-level tabs:

1. **Home** — dashboard: current body weight, training streak, last session summary, quick-add buttons for weight and measurements.
2. **Train** — pick a routine and execute a workout session.
3. **Routines** — list, create, edit, and delete routine templates.
4. **Exercises** — list, create, edit, and delete exercises in the personal catalog.
5. **Progress** — visualizations, organized in sub-tabs: Body Weight, Exercise Progression, Training Calendar, Measurements.

A secondary screen, **Record entry**, is reachable from Home and from Progress for quickly logging a body weight or measurement value without going through the tab flow.

## 5. Core Concepts and Data Model

The data model uses five primary entities. All persisted in local SQLite via Drizzle ORM.

### 5.1 Exercise

A movement the user performs (e.g., "Bench Press", "Squat"). Created on demand — the catalog starts empty.

| Field | Type | Notes |
|---|---|---|
| `id` | integer PK | autoincrement |
| `name` | text | unique, required |
| `muscle_group` | text \| null | optional free-form tag (e.g., "Chest", "Back") |
| `created_at` | integer (epoch ms) | required |
| `archived_at` | integer \| null | soft-delete; archived exercises don't appear in pickers but historical sets remain |

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

### 5.9 Why template + snapshots

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

1. Train tab → list of routines.
2. Tap a routine → "Workout in progress" screen.
3. For each exercise in order, the screen shows:
   - Target (e.g., "3 × 8 @ 80 kg").
   - **Last time:** the last completed session's set summary for this exercise (e.g., "80 kg × 8, 80 kg × 7, 75 kg × 6 — 3 weeks ago"). Auto-fills the first set's weight and reps inputs.
4. User logs each set: confirms or edits weight/reps, taps "Done set" → set persisted, next set row prefilled with same values.
5. User can add an extra set beyond the target, skip remaining sets, or move to the next exercise at any time.
6. "Finish workout" closes the session (sets `finished_at`).
7. "Abandon" deletes the session and its sets after a confirm dialog (in-progress sessions only).

### 6.3 Record body weight

- Home → "+ Weight" → numeric input → date defaults to today → save.
- If an entry exists for that date, it is overwritten (with a confirm).

### 6.4 Record measurement

- Home → "+ Measurement" → pick type (or create new) → numeric input → save.
- Same one-per-day overwrite behavior as body weight.

### 6.5 View progress

- Progress tab → four sub-tabs:
  - **Body weight:** line chart, range selector (1M / 3M / 6M / 1Y / All).
  - **Exercises:** pick an exercise → line chart of (a) top-set weight per session and (b) total volume (sum of weight × reps) per session. Toggle between the two. PR markers on points that exceed all prior values.
  - **Calendar:** heatmap of the trailing 26 weeks (GitHub-style). Tap a day to see which routine was performed.
  - **Measurements:** pick a measurement → line chart with range selector.

## 7. Technical Stack

| Concern | Choice | Why |
|---|---|---|
| Runtime | Expo SDK (latest stable) | Fast iteration, OTA updates, can install on personal device via Expo Go or dev build |
| Language | TypeScript (strict) | Type safety end-to-end |
| Navigation | Expo Router (file-based) | Convention over config; deep linking for free |
| Persistence | `expo-sqlite` | Local, transactional, queryable |
| ORM | Drizzle ORM | Type-safe schemas + queries, lightweight, migrations |
| State (transient) | Zustand | Minimal boilerplate for in-progress session state, picker UI state |
| State (persisted) | Drizzle queries directly, wrapped in React Query | Caching + invalidation without manual store work |
| Charts | Victory Native XL | Skia-backed, smooth on mobile, good API for line + heatmap |
| Forms | React Hook Form + Zod | Validation for numeric inputs |
| Date handling | date-fns | Tree-shakeable |
| Lint / format | ESLint + Prettier (Expo defaults) | |
| Testing | Vitest for pure logic; React Native Testing Library for components | |

### Project layout (proposed)

```
src/
  app/                       # Expo Router routes
    (tabs)/
      index.tsx              # Home
      train/
      routines/
      exercises/
      progress/
    record-weight.tsx
    record-measurement.tsx
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
  ui/                        # shared components
  lib/                       # date utils, formatters
```

Each `features/<name>/` folder owns its queries, components, and screens, keeping vertical slices self-contained.

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
- Otherwise: archive (sets `archived_at`). Archived entities are hidden from pickers but appear (greyed) in their respective list screens with an "Unarchive" action.

## 9. Open Questions

To resolve during implementation planning or first review:

1. **Backup / export:** confirmed out of scope for v1, but a JSON export action ("share to Files") would be ~30 min and would mitigate the "lose phone = lose history" risk. Worth a follow-up plan.
2. **Volume calculation for bodyweight exercises (weight = null):** treat as reps-only progression, or require the user to log added weight (vest, belt)? **Decision:** v1 displays reps-only progression chart for any exercise that has any null-weight set; document this and revisit if it feels wrong.
3. **PR definition:** "top-set weight at any rep count" vs. "estimated 1RM". **Decision:** v1 uses heaviest weight lifted for any rep ≥ 1; estimated 1RM is a v2 add-on.
4. **Routine duplication:** is "duplicate routine" needed in v1 to bootstrap variants? **Decision:** yes — cheap and avoids re-creating similar routines from scratch.

## 10. Success Criteria

The design is successful if, after one month of use:

- The user logs at least 80% of their gym sessions in the app (vs. nothing / spreadsheet).
- Recording a set during a workout takes ≤ 3 taps.
- Pulling up the per-exercise progression chart for any exercise takes ≤ 4 taps from app launch.
- No data has been lost or corrupted across app restarts and OS updates.

## 11. Risks

| Risk | Mitigation |
|---|---|
| Local-only data → device loss = total loss | Add JSON export in follow-up phase; user manually saves to iCloud/Drive |
| Schema migrations breaking existing data | Drizzle migrations + a "DB version" check at launch; one-shot backup before applying |
| Chart library performance with large histories | Victory Native XL handles thousands of points; downsample if a single chart query returns > 1000 |
| Scope creep mid-build | This document plus the plan are the contract; new features go to a backlog |
