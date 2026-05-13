# Health Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the personal mobile Health Tracker app described in `docs/superpowers/specs/2026-05-13-health-tracker-design.md` — Expo + React Native, local-only SQLite, Spanish UI, dark-first theme with ember accent, five tabs (Inicio / Entrenar / Rutinas / Ejercicios / Progreso) plus seven inner screens.

**Architecture:** Single-user Expo SDK app with file-based routing (Expo Router), local SQLite via Drizzle ORM, transient UI state in Zustand, persisted reads cached via TanStack Query, charts on Victory Native XL + custom react-native-svg primitives. Visual reference of record is the HTML prototype bundled at `design/project/Health Tracker.html` — every screen should match it 1:1 in dark mode with the ember accent.

**Tech Stack:** Expo SDK (latest), TypeScript (strict), Expo Router, expo-sqlite, Drizzle ORM + drizzle-kit, Zustand, TanStack Query, react-native-svg, Victory Native XL, phosphor-react-native, expo-font (Geist + Open Sauce One), date-fns (es locale), Vitest, React Native Testing Library.

---

## Table of Contents

- [Pre-reading](#pre-reading)
- [File structure](#file-structure)
- [Phase A — Foundation (T1–T11)](#phase-a--foundation)
- [Phase B — UI primitives (T12–T22)](#phase-b--ui-primitives)
- [Phase C — Library features (T23–T31)](#phase-c--library-features)
- [Phase D — Workout flow (T32–T36)](#phase-d--workout-flow)
- [Phase E — Home & Progress (T37–T43)](#phase-e--home--progress)
- [Phase F — Verification (T44–T45)](#phase-f--verification)

---

## Pre-reading

Before starting, read these in order:

1. `docs/superpowers/specs/2026-05-13-health-tracker-design.md` — the spec. The whole thing.
2. `design/README.md` — the design handoff bundle.
3. `design/project/Health Tracker.html` — the prototype entry point.
4. `design/project/ds/colors_and_type.css` — token names you will mirror in `theme/tokens.ts`.
5. `design/project/components.jsx` — primitives. Each one needs an RN translation. Treat the visual style as binding; the implementation pattern (CSS-in-JS) is web-only — port to RN `StyleSheet.create()`.
6. `design/project/app.jsx`, `screens-home.jsx`, `screens-train.jsx`, `screens-library.jsx`, `screens-progress.jsx` — the five screens worth of code. Use them as visual contracts.

**The prototype is React-DOM with CSS-in-JS strings.** You are building React Native. Translate every `style={{ ... }}` into RN-friendly equivalents — `display: 'flex'` is implicit, `gap` is supported in modern RN, `background` → `backgroundColor`, `color-mix(in oklab, X 18%, transparent)` → precomputed RGBA, `grid` and CSS variables don't exist; use props + theme context instead.

**All UI strings live in Spanish.** Code, comments, commits, and docs are English (per the user's CLAUDE.md).

**Commits:** Conventional Commits format, signed with `Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>`. No `Co-Authored-By` trailer.

---

## File structure

```
health-tracker/
├── app/                          # Expo Router routes
│   ├── _layout.tsx               # Root: providers (theme, query, db)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar
│   │   ├── index.tsx             # Inicio
│   │   ├── train.tsx             # Entrenar
│   │   ├── routines.tsx          # Rutinas
│   │   ├── exercises.tsx         # Ejercicios
│   │   └── progress.tsx          # Progreso
│   ├── workout/[sessionId].tsx   # Workout in progress
│   ├── workout-summary/[sessionId].tsx
│   ├── exercise/[id].tsx         # Exercise detail
│   ├── routine/edit.tsx          # Routine editor (new + existing)
│   ├── record-weight.tsx
│   ├── record-measurement.tsx
│   └── settings.tsx
├── src/
│   ├── db/
│   │   ├── client.ts             # SQLite + Drizzle init
│   │   ├── schema.ts             # All tables
│   │   ├── migrations/           # drizzle-kit output
│   │   └── seed.ts               # First-run default measurement types
│   ├── features/
│   │   ├── exercises/queries.ts
│   │   ├── routines/queries.ts
│   │   ├── sessions/queries.ts
│   │   ├── sessions/state.ts     # Zustand: in-progress session state
│   │   ├── body-weight/queries.ts
│   │   ├── measurements/queries.ts
│   │   ├── settings/queries.ts
│   │   ├── settings/store.ts     # Zustand: theme override mirror
│   │   └── progress/derived.ts   # streak, heatmap, muscle stats, suggested routine
│   ├── ui/
│   │   ├── primitives/
│   │   │   ├── Card.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Segment.tsx
│   │   │   ├── Stepper.tsx
│   │   │   ├── NumericPad.tsx
│   │   │   ├── ScreenHeader.tsx
│   │   │   ├── PageTitle.tsx
│   │   │   ├── Confirm.tsx
│   │   │   └── Empty.tsx
│   │   ├── charts/
│   │   │   ├── Sparkline.tsx
│   │   │   ├── LineChart.tsx
│   │   │   ├── ActivityRing.tsx
│   │   │   └── Heatmap.tsx
│   │   └── workout/
│   │       ├── ExerciseBlock.tsx
│   │       ├── SetCard.tsx
│   │       └── RoutineBadge.tsx
│   ├── theme/
│   │   ├── tokens.ts             # Spacing, radii, type scale
│   │   ├── palette.ts            # Light + dark colors + ember accent
│   │   ├── ThemeProvider.tsx
│   │   ├── useTheme.ts
│   │   └── fonts.ts              # expo-font registration
│   └── lib/
│       ├── date.ts               # fmtDayShort, fmtRelative, ymd, parseYmd
│       ├── units.ts              # kg formatting, half-step rounding
│       └── icons.ts              # phosphor icon name aliases
├── drizzle.config.ts
├── app.json
├── tsconfig.json
├── package.json
└── tests/                        # Vitest for pure logic
    ├── lib/
    ├── features/
    └── theme/
```

Each `features/<name>/queries.ts` exports typed functions backed by Drizzle. `derived.ts` contains pure helpers that take rows and produce dashboard values. Screens consume both via TanStack Query.

---

## Phase A — Foundation

Ten tasks. Ends with a runnable app showing five empty tabs in dark mode, theme persisted, fonts loaded, schema migrated.

### Task 1: Scaffold Expo project

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json`, `.gitignore` (already present — extend), `app/_layout.tsx`, `app/(tabs)/_layout.tsx`, `app/(tabs)/index.tsx`

- [ ] **Step 1: Scaffold with `create-expo-app`**

Run:
```bash
cd /Users/jotadev/dev/jotadev/health-tracker
npx create-expo-app@latest . --template default --name health-tracker
```

If the directory already has files (`design/`, `docs/`, `.git/`), accept overwrite for new files only; do NOT delete existing folders. If the CLI refuses, scaffold into `/tmp/ht-scaffold/` and copy `app/`, `package.json`, `tsconfig.json`, `app.json` over manually.

- [ ] **Step 2: Switch to strict TypeScript**

Edit `tsconfig.json` to extend `expo/tsconfig.base` and set `strict: true`:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 3: Configure `app.json` for iOS-first**

In `app.json`, set:
```json
{
  "expo": {
    "name": "Health Tracker",
    "slug": "health-tracker",
    "scheme": "healthtracker",
    "orientation": "portrait",
    "userInterfaceStyle": "automatic",
    "ios": { "supportsTablet": false },
    "plugins": ["expo-router", "expo-font", "expo-sqlite"]
  }
}
```

- [ ] **Step 4: Verify it boots**

Run: `npx expo start --ios` (or `--android`). Expected: default Expo Router template page renders. Quit the dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: scaffold expo router project with strict typescript

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 2: Add ESLint, Prettier, Vitest

**Files:**
- Create: `.eslintrc.cjs`, `.prettierrc`, `vitest.config.ts`, `tests/.gitkeep`

- [ ] **Step 1: Install dev deps**

Run:
```bash
npm install --save-dev eslint eslint-config-expo prettier vitest @testing-library/react-native @testing-library/jest-native
```

- [ ] **Step 2: Create `.eslintrc.cjs`**

```js
module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

- [ ] **Step 3: Create `.prettierrc`**

```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": true
}
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
  resolve: {
    alias: { '@': new URL('./src/', import.meta.url).pathname },
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
"scripts": {
  "start": "expo start",
  "ios": "expo start --ios",
  "lint": "eslint .",
  "format": "prettier --write .",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 6: Verify**

Run: `npm run lint && npm test`. Expected: lint passes with no errors, vitest reports "no test files found" (warning is fine).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: configure eslint, prettier, vitest

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 3: Install runtime dependencies

**Files:** `package.json` (modified)

- [ ] **Step 1: Install**

```bash
npx expo install expo-sqlite expo-font react-native-svg react-native-reanimated
npm install drizzle-orm @tanstack/react-query zustand date-fns phosphor-react-native
npm install --save-dev drizzle-kit @types/react
```

Victory Native XL requires Skia:
```bash
npx expo install @shopify/react-native-skia victory-native
```

- [ ] **Step 2: Verify build still works**

Run: `npx expo start --ios`. Expected: app boots, no module-resolution errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "$(cat <<'EOF'
chore: add runtime dependencies (drizzle, query, svg, charts, icons)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 4: Drizzle schema for all tables

**Files:**
- Create: `src/db/schema.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Write `src/db/schema.ts`**

Mirror §5 of the spec exactly. Use `integer().primaryKey({ autoIncrement: true })` and `text().notNull()` from `drizzle-orm/sqlite-core`:

```ts
import { sqliteTable, integer, text, real, uniqueIndex, check } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const MUSCLE_GROUPS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazo', 'Core', 'Otros'] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const exercises = sqliteTable(
  'exercises',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull().unique(),
    muscleGroup: text('muscle_group').notNull(),
    createdAt: integer('created_at').notNull(),
    archivedAt: integer('archived_at'),
  },
  (t) => ({
    muscleCheck: check(
      'muscle_group_enum',
      sql`${t.muscleGroup} IN ('Pecho','Espalda','Pierna','Hombro','Brazo','Core','Otros')`,
    ),
  }),
);

export const routines = sqliteTable('routines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  archivedAt: integer('archived_at'),
});

export const routineItems = sqliteTable(
  'routine_items',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    routineId: integer('routine_id').notNull().references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
    position: integer('position').notNull(),
    targetSets: integer('target_sets').notNull(),
    targetReps: integer('target_reps').notNull(),
    targetWeightKg: real('target_weight_kg'),
  },
  (t) => ({
    posIdx: uniqueIndex('routine_items_pos').on(t.routineId, t.position),
  }),
);

export const workoutSessions = sqliteTable('workout_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  routineId: integer('routine_id').references(() => routines.id, { onDelete: 'set null' }),
  routineNameSnapshot: text('routine_name_snapshot').notNull(),
  startedAt: integer('started_at').notNull(),
  finishedAt: integer('finished_at'),
});

export const sessionSets = sqliteTable('session_sets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: integer('session_id').notNull().references(() => workoutSessions.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  exerciseNameSnapshot: text('exercise_name_snapshot').notNull(),
  position: integer('position').notNull(),
  weightKg: real('weight_kg'),
  reps: integer('reps').notNull(),
  completedAt: integer('completed_at').notNull(),
});

export const bodyWeights = sqliteTable(
  'body_weights',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    recordedOn: text('recorded_on').notNull().unique(),
    weightKg: real('weight_kg').notNull(),
    createdAt: integer('created_at').notNull(),
  },
);

export const measurementTypes = sqliteTable('measurement_types', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  unit: text('unit').notNull(),
  archivedAt: integer('archived_at'),
});

export const measurements = sqliteTable(
  'measurements',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    measurementTypeId: integer('measurement_type_id').notNull().references(() => measurementTypes.id),
    recordedOn: text('recorded_on').notNull(),
    value: real('value').notNull(),
    createdAt: integer('created_at').notNull(),
  },
  (t) => ({
    perDayIdx: uniqueIndex('measurements_per_day').on(t.measurementTypeId, t.recordedOn),
  }),
);

export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey(),                  // always 1
  ownerName: text('owner_name'),
  weeklyGoalSessions: integer('weekly_goal_sessions').notNull().default(4),
  weeklyGoalMinutes: integer('weekly_goal_minutes').notNull().default(240),
  weeklyGoalVolumeKg: integer('weekly_goal_volume_kg').notNull().default(18000),
  theme: text('theme').notNull().default('dark'),  // 'light' | 'dark' | 'system'
  accent: text('accent').notNull().default('#FA114F'),
});
```

- [ ] **Step 2: Create `drizzle.config.ts`**

```ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo',
} satisfies Config;
```

- [ ] **Step 3: Generate the initial migration**

Run: `npx drizzle-kit generate`
Expected: `src/db/migrations/0000_*.sql` is created, plus `src/db/migrations/meta/_journal.json`.

- [ ] **Step 4: Commit**

```bash
git add src/db/ drizzle.config.ts package.json
git commit -m "$(cat <<'EOF'
feat(db): add drizzle schema for all 9 tables

Mirrors §5 of the spec: exercises with muscle_group CHECK, routines and
items, sessions with name snapshots, sets, body weights, measurement
types and entries, and a single-row settings table.

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 5: DB client + migration runner + seed

**Files:**
- Create: `src/db/client.ts`
- Create: `src/db/seed.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Write `src/db/client.ts`**

```ts
import { openDatabaseSync } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from './migrations/migrations';
import * as schema from './schema';

export const sqlite = openDatabaseSync('health-tracker.db', { enableChangeListener: true });
export const db = drizzle(sqlite, { schema });

export function useDbReady() {
  const { success, error } = useMigrations(db, migrations);
  return { ready: success, error };
}
```

If `migrations/migrations.js` doesn't exist after `drizzle-kit generate`, run `npx drizzle-kit generate --custom` once and confirm the import path Drizzle gave you.

- [ ] **Step 2: Write `src/db/seed.ts`** — runs once if settings row missing.

```ts
import { db } from './client';
import { settings, measurementTypes } from './schema';
import { eq } from 'drizzle-orm';

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.select().from(settings).where(eq(settings.id, 1));
  if (existing.length > 0) return;

  await db.insert(settings).values({ id: 1 });
  // Default measurement types — easy to delete in Settings later.
  await db.insert(measurementTypes).values([
    { name: 'Cintura', unit: 'cm' },
    { name: 'Brazo derecho', unit: 'cm' },
    { name: 'Pecho', unit: 'cm' },
    { name: 'Grasa corporal', unit: '%' },
  ]);
}
```

- [ ] **Step 3: Wire migrations + seed in `app/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useDbReady } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';

const queryClient = new QueryClient();

export default function RootLayout() {
  const { ready, error } = useDbReady();
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (ready && !seeded) {
      seedIfEmpty().then(() => setSeeded(true));
    }
  }, [ready, seeded]);

  if (error) throw error;
  if (!ready || !seeded) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npx expo start --ios`. Expected: app boots, no DB errors in console. The `health-tracker.db` is created on the simulator.

- [ ] **Step 5: Commit**

```bash
git add src/db/client.ts src/db/seed.ts app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(db): wire migrations + first-run seed (settings row, default measurement types)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 6: Theme tokens

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/theme/palette.ts`

- [ ] **Step 1: Write `src/theme/tokens.ts`** — mirror §9.3 + §9.2.

```ts
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64, 20: 80 } as const;

export const radius = { xs: 4, sm: 6, md: 8, lg: 12, xl: 18, '2xl': 24, full: 9999 } as const;

export const fontFamily = {
  sans: 'OpenSauceOne',
  numeric: 'Geist',
  display: 'BowlbyOneSC',
} as const;

export const type = {
  displayLg:    { size: 64, line: 76, weight: '500' as const },
  displayMd:    { size: 40, line: 52, weight: '500' as const },
  headlineLg:   { size: 40, line: 52, weight: '700' as const },
  headlineMd:   { size: 32, line: 40, weight: '600' as const },
  headlineSm:   { size: 24, line: 32, weight: '600' as const },
  titleLg:      { size: 18, line: 26, weight: '600' as const },
  titleMd:      { size: 16, line: 24, weight: '600' as const },
  titleSm:      { size: 14, line: 20, weight: '600' as const },
  bodyMd:       { size: 16, line: 24, weight: '400' as const },
  bodySm:       { size: 14, line: 22, weight: '400' as const },
  labelLg:      { size: 14, line: 20, weight: '500' as const },
  labelMd:      { size: 12, line: 16, weight: '500' as const },
  labelSm:      { size: 10, line: 16, weight: '500' as const },
} as const;

export const motion = {
  durFast: 120,
  dur: 180,
  durSlow: 260,
  easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)', // for libs that accept the string
} as const;
```

- [ ] **Step 2: Write `src/theme/palette.ts`** — mirror §9.1.

```ts
export const ember = {
  primary:        '#FA114F',
  primaryDark:    '#D90033',
  primaryLight:   '#FFD8E1',
  primaryLighter: '#FFEBF0',
} as const;

export type ThemeName = 'light' | 'dark';

export const palettes: Record<ThemeName, {
  bg: string; surface: string; surface2: string;
  text: string; text2: string; text3: string;
  border: string;
  success: string; info: string; warning: string; error: string;
  accent: typeof ember;
}> = {
  dark: {
    bg: '#000000', surface: '#161616', surface2: '#1F1F1F',
    text: '#FFFFFF', text2: 'rgba(255,255,255,0.6)', text3: 'rgba(255,255,255,0.4)',
    border: 'rgba(255,255,255,0.08)',
    success: '#10B981', info: '#3B82F6', warning: '#F59E0B', error: '#ED5A46',
    accent: ember,
  },
  light: {
    bg: '#F5F5F7', surface: '#FFFFFF', surface2: '#FAFAFA',
    text: '#1F1F1F', text2: '#666666', text3: '#8F8F8F',
    border: '#EBEBEB',
    success: '#10B981', info: '#3B82F6', warning: '#F59E0B', error: '#ED5A46',
    accent: ember,
  },
};

export type Palette = (typeof palettes)['dark'];
```

- [ ] **Step 3: Commit**

```bash
git add src/theme/
git commit -m "$(cat <<'EOF'
feat(theme): add token and palette modules (dark default, ember accent)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 7: Register fonts

**Files:**
- Create: `src/theme/fonts.ts`
- Copy: `design/project/ds/fonts/Geist-*.woff2` is the web format — fetch the matching `.ttf` versions from https://fonts.google.com/specimen/Geist into `assets/fonts/` instead. For Open Sauce One, fetch the family from Google Fonts.
- Create: `assets/fonts/` with these `.ttf` files: `Geist-Regular.ttf`, `Geist-Medium.ttf`, `Geist-SemiBold.ttf`, `Geist-Bold.ttf`, `OpenSauceOne-Regular.ttf`, `OpenSauceOne-Medium.ttf`, `OpenSauceOne-SemiBold.ttf`, `OpenSauceOne-Bold.ttf`, `OpenSauceOne-ExtraBold.ttf`. (Display font Bowlby One SC optional; not used in v1.)

- [ ] **Step 1: Download .ttf fonts**

Manual: download from Google Fonts. Place in `assets/fonts/`. (Web `.woff2` files in `design/project/ds/fonts/` are reference only — RN needs `.ttf` or `.otf`.)

- [ ] **Step 2: Write `src/theme/fonts.ts`**

```ts
import { useFonts } from 'expo-font';

export function useAppFonts() {
  return useFonts({
    'Geist-Regular':            require('../../assets/fonts/Geist-Regular.ttf'),
    'Geist-Medium':             require('../../assets/fonts/Geist-Medium.ttf'),
    'Geist-SemiBold':           require('../../assets/fonts/Geist-SemiBold.ttf'),
    'Geist-Bold':               require('../../assets/fonts/Geist-Bold.ttf'),
    'OpenSauceOne-Regular':     require('../../assets/fonts/OpenSauceOne-Regular.ttf'),
    'OpenSauceOne-Medium':      require('../../assets/fonts/OpenSauceOne-Medium.ttf'),
    'OpenSauceOne-SemiBold':    require('../../assets/fonts/OpenSauceOne-SemiBold.ttf'),
    'OpenSauceOne-Bold':        require('../../assets/fonts/OpenSauceOne-Bold.ttf'),
    'OpenSauceOne-ExtraBold':   require('../../assets/fonts/OpenSauceOne-ExtraBold.ttf'),
  });
}

// Resolve the right Postscript name for a weight. RN doesn't honour
// `fontWeight: '700'` when a custom family is used; you must pick the
// concrete family.
export function fontVariant(family: 'sans' | 'numeric', weight: 400 | 500 | 600 | 700 | 800): string {
  const base = family === 'sans' ? 'OpenSauceOne' : 'Geist';
  const w =
    weight === 400 ? 'Regular' :
    weight === 500 ? 'Medium' :
    weight === 600 ? 'SemiBold' :
    weight === 700 ? 'Bold' : 'ExtraBold';
  // Geist doesn't have ExtraBold; fall back to Bold.
  if (base === 'Geist' && w === 'ExtraBold') return 'Geist-Bold';
  return `${base}-${w}`;
}
```

- [ ] **Step 3: Wire into root layout**

Modify `app/_layout.tsx`: call `useAppFonts()` and block rendering until loaded.

```tsx
const [fontsLoaded] = useAppFonts();
// ...
if (!ready || !seeded || !fontsLoaded) {
  return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
}
```

- [ ] **Step 4: Verify**

Run: `npx expo start --ios`. Expected: no font-warning in console; the default text now renders in Open Sauce One.

- [ ] **Step 5: Commit**

```bash
git add assets/fonts/ src/theme/fonts.ts app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(theme): register Geist and Open Sauce One via expo-font

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 8: ThemeProvider + useTheme

**Files:**
- Create: `src/theme/ThemeProvider.tsx`
- Create: `src/theme/useTheme.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Write the provider**

```tsx
// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, type Palette, type ThemeName } from './palette';

type Ctx = { palette: Palette; isDark: boolean; resolved: ThemeName };
const ThemeContext = createContext<Ctx | null>(null);

export function ThemeProvider({
  children,
  preference,
}: {
  children: React.ReactNode;
  preference: 'light' | 'dark' | 'system';
}) {
  const system = useColorScheme();
  const resolved: ThemeName = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
  const value = useMemo(
    () => ({ palette: palettes[resolved], isDark: resolved === 'dark', resolved }),
    [resolved],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeCtx() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
```

- [ ] **Step 2: Convenience hook**

```ts
// src/theme/useTheme.ts
import { useThemeCtx } from './ThemeProvider';
export const useTheme = () => useThemeCtx().palette;
export const useIsDark = () => useThemeCtx().isDark;
```

- [ ] **Step 3: Wrap root with `ThemeProvider`** — read `theme` from settings (next task) or default to `'dark'` for now.

```tsx
// app/_layout.tsx (excerpt)
<ThemeProvider preference="dark">
  <QueryClientProvider client={queryClient}>
    <Stack screenOptions={{ headerShown: false }} />
  </QueryClientProvider>
</ThemeProvider>
```

- [ ] **Step 4: Commit**

```bash
git add src/theme/ThemeProvider.tsx src/theme/useTheme.ts app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(theme): add ThemeProvider with light/dark/system resolution

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 9: Date utilities (Spanish locale)

**Files:**
- Create: `src/lib/date.ts`
- Create: `tests/lib/date.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// tests/lib/date.test.ts
import { describe, it, expect } from 'vitest';
import { ymd, parseYmd, fmtDayShort, fmtRelative } from '@/lib/date';

describe('ymd / parseYmd', () => {
  it('roundtrips a date', () => {
    const d = new Date(2026, 4, 13);
    expect(ymd(d)).toBe('2026-05-13');
    expect(parseYmd('2026-05-13').getTime()).toBe(d.getTime());
  });
});

describe('fmtDayShort', () => {
  it('formats Spanish short day', () => {
    expect(fmtDayShort(new Date(2026, 4, 13))).toBe('mié 13 may');
  });
});

describe('fmtRelative', () => {
  const today = new Date(2026, 4, 13);
  it('returns hoy for today', () => {
    expect(fmtRelative(today, today)).toBe('hoy');
  });
  it('returns ayer for yesterday', () => {
    const y = new Date(2026, 4, 12);
    expect(fmtRelative(y, today)).toBe('ayer');
  });
  it('returns "hace N días" for 2-6 days', () => {
    expect(fmtRelative(new Date(2026, 4, 10), today)).toBe('hace 3 días');
  });
  it('returns "hace 1 semana" for 7-13 days', () => {
    expect(fmtRelative(new Date(2026, 4, 5), today)).toBe('hace 1 semana');
  });
  it('returns "hace N semanas" for 14-29 days', () => {
    expect(fmtRelative(new Date(2026, 3, 29), today)).toBe('hace 2 semanas');
  });
  it('returns "hace 1 mes" for 30-59 days', () => {
    expect(fmtRelative(new Date(2026, 3, 1), today)).toBe('hace 1 mes');
  });
});
```

- [ ] **Step 2: Verify fail**

Run: `npm test -- date`. Expected: ENOENT for `@/lib/date`.

- [ ] **Step 3: Implement**

```ts
// src/lib/date.ts
const DAYS = ['dom','lun','mar','mié','jue','vie','sáb'];
const MONTHS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

export function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYmd(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function fmtDayShort(d: Date): string {
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function fmtRelative(d: Date, now: Date = new Date()): string {
  const t0 = new Date(now); t0.setHours(0, 0, 0, 0);
  const d0 = new Date(d); d0.setHours(0, 0, 0, 0);
  const days = Math.round((t0.getTime() - d0.getTime()) / 86400000);
  if (days <= 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  if (days < 14) return 'hace 1 semana';
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  if (days < 60) return 'hace 1 mes';
  return `hace ${Math.floor(days / 30)} meses`;
}
```

- [ ] **Step 4: Verify pass**

Run: `npm test -- date`. Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/lib/date.ts tests/lib/date.test.ts
git commit -m "$(cat <<'EOF'
feat(lib): add Spanish date formatters with unit tests

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 10: Settings queries + Zustand mirror

**Files:**
- Create: `src/features/settings/queries.ts`
- Create: `src/features/settings/store.ts`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Write `queries.ts`**

```ts
import { db } from '@/db/client';
import { settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type SettingsRow = typeof settings.$inferSelect;
export type SettingsPatch = Partial<Omit<SettingsRow, 'id'>>;

export async function getSettings(): Promise<SettingsRow> {
  const rows = await db.select().from(settings).where(eq(settings.id, 1));
  if (rows.length === 0) throw new Error('Settings row missing — seed did not run');
  return rows[0];
}

export async function updateSettings(patch: SettingsPatch): Promise<SettingsRow> {
  await db.update(settings).set(patch).where(eq(settings.id, 1));
  return getSettings();
}
```

- [ ] **Step 2: Zustand store mirroring the relevant subset** (theme + name + goals; the store is hydrated from DB once and writes go through `updateSettings` then back into the store)

```ts
// src/features/settings/store.ts
import { create } from 'zustand';
import { SettingsRow, getSettings, updateSettings, SettingsPatch } from './queries';

type State = {
  loaded: boolean;
  data: SettingsRow | null;
  load: () => Promise<void>;
  patch: (p: SettingsPatch) => Promise<void>;
};

export const useSettingsStore = create<State>((set) => ({
  loaded: false,
  data: null,
  async load() {
    const data = await getSettings();
    set({ data, loaded: true });
  },
  async patch(p) {
    const data = await updateSettings(p);
    set({ data });
  },
}));
```

- [ ] **Step 3: Hydrate at root + feed into ThemeProvider**

```tsx
// app/_layout.tsx (excerpt)
const settingsLoaded = useSettingsStore((s) => s.loaded);
const themePref = useSettingsStore((s) => s.data?.theme ?? 'dark');
const load = useSettingsStore((s) => s.load);

useEffect(() => { if (ready && seeded) load(); }, [ready, seeded, load]);
// gate render until settingsLoaded too
// Then:
<ThemeProvider preference={themePref as 'light' | 'dark' | 'system'}>...</ThemeProvider>
```

- [ ] **Step 4: Commit**

```bash
git add src/features/settings/ app/_layout.tsx
git commit -m "$(cat <<'EOF'
feat(settings): add queries and zustand store; wire theme from settings

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

### Task 11: Tab bar layout

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/train.tsx`, `routines.tsx`, `exercises.tsx`, `progress.tsx`

- [ ] **Step 1: Tab layout with 5 tabs** — mirror `design/project/app.jsx` TabBar component visually (dark backdrop with blur, ember accent on active, label below icon).

```tsx
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { House, Play, List, Barbell, ChartLine } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';

export default function TabsLayout() {
  const p = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: p.bg,
          borderTopColor: p.border,
        },
        tabBarActiveTintColor: p.accent.primary,
        tabBarInactiveTintColor: p.text3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Inicio',     tabBarIcon: ({ color, size }) => <House     color={color} size={size}/> }}/>
      <Tabs.Screen name="train"     options={{ title: 'Entrenar',   tabBarIcon: ({ color, size }) => <Play      color={color} size={size}/> }}/>
      <Tabs.Screen name="routines"  options={{ title: 'Rutinas',    tabBarIcon: ({ color, size }) => <List      color={color} size={size}/> }}/>
      <Tabs.Screen name="exercises" options={{ title: 'Ejercicios', tabBarIcon: ({ color, size }) => <Barbell   color={color} size={size}/> }}/>
      <Tabs.Screen name="progress"  options={{ title: 'Progreso',   tabBarIcon: ({ color, size }) => <ChartLine color={color} size={size}/> }}/>
    </Tabs>
  );
}
```

- [ ] **Step 2: Placeholder tab screens** — each one a centered `<Text>` with the screen name, themed background.

```tsx
// app/(tabs)/index.tsx (and analogous for train.tsx, routines.tsx, etc.)
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function Home() {
  const p = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: p.bg }}>
      <Text style={{ color: p.text, fontFamily: 'OpenSauceOne-SemiBold', fontSize: 18 }}>Inicio</Text>
    </View>
  );
}
```

- [ ] **Step 3: Verify** — Run the simulator, tap each tab. Expected: dark background, ember-tinted active tab, all 5 names visible.

- [ ] **Step 4: Commit**

```bash
git add app/
git commit -m "$(cat <<'EOF'
feat(nav): add 5-tab bar with phosphor icons and ember accent

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
```

---

**Phase A is done.** You now have a themed, navigable shell with persistent settings and an empty database.

---

## Phase B — UI primitives

Eleven tasks. Each one ports a primitive from `design/project/components.jsx` to React Native. End state: a primitives catalog ready to compose screens.

### Task 12: Card primitive

**Files:** Create `src/ui/primitives/Card.tsx`

- [ ] **Step 1: Implement**

```tsx
import { View, ViewProps, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius, space } from '@/theme/tokens';

type Props = ViewProps & {
  onPress?: () => void;
  dense?: boolean;
  style?: ViewStyle | ViewStyle[];
};

export function Card({ onPress, dense, style, children, ...rest }: Props) {
  const p = useTheme();
  const base: ViewStyle = {
    backgroundColor: p.surface,
    borderColor: p.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: dense ? space[3] : space[5],
  };
  if (onPress) {
    return <Pressable onPress={onPress} style={[base, style]} {...rest}>{children}</Pressable>;
  }
  return <View style={[base, style]} {...rest}>{children}</View>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/primitives/Card.tsx
git commit -m "feat(ui): add Card primitive

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 13: Button primitive

**Files:** Create `src/ui/primitives/Button.tsx`

- [ ] **Step 1: Implement** — port from `design/project/components.jsx::Button`.

```tsx
import { Pressable, Text, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/theme/tokens';
import { fontVariant } from '@/theme/fonts';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

export function Button({
  children, variant = 'primary', size = 'md', icon, onPress, full, disabled,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  onPress?: () => void;
  full?: boolean;
  disabled?: boolean;
}) {
  const p = useTheme();
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const padX = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  const rad = size === 'lg' ? radius.xl - 2 : radius.lg;
  const styleByVariant: Record<Variant, { bg: string; color: string; border?: string }> = {
    primary: { bg: disabled ? '#F0F0F0' : p.accent.primary, color: disabled ? p.text3 : '#fff' },
    outline: { bg: 'transparent', color: p.text, border: p.border },
    ghost:   { bg: p.surface2,   color: p.text },
    dark:    { bg: '#1F1F1F',    color: '#fff' },
  };
  const v = styleByVariant[variant];
  const style: ViewStyle = {
    height: h, paddingHorizontal: padX, borderRadius: rad,
    backgroundColor: v.bg, borderWidth: v.border ? 1 : 0, borderColor: v.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, alignSelf: full ? 'stretch' : 'flex-start',
  };
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={style}>
      {icon}
      <Text style={{ color: v.color, fontFamily: fontVariant('sans', 600), fontSize: size === 'lg' ? 17 : 15 }}>
        {children}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/primitives/Button.tsx
git commit -m "feat(ui): add Button primitive (4 variants, 3 sizes)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 14: Tag, Segment, ScreenHeader, PageTitle, Empty, Confirm

These primitives are small enough to land together in one task.

**Files:** Create
- `src/ui/primitives/Tag.tsx`
- `src/ui/primitives/Segment.tsx`
- `src/ui/primitives/ScreenHeader.tsx`
- `src/ui/primitives/PageTitle.tsx`
- `src/ui/primitives/Empty.tsx`
- `src/ui/primitives/Confirm.tsx`

- [ ] **Step 1: Tag** — port `components.jsx::Tag`. Pill with `bg + matching saturated text`, 6 px radius.

```tsx
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export function Tag({ children, color, bg }: { children: React.ReactNode; color?: string; bg?: string }) {
  const p = useTheme();
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: bg ?? p.accent.primaryLighter }}>
      <Text style={{ color: color ?? p.accent.primary, fontFamily: 'OpenSauceOne-SemiBold', fontSize: 11 }}>{children}</Text>
    </View>
  );
}
```

- [ ] **Step 2: Segment** — port `components.jsx::Segment`. Three-button group with pill background.

```tsx
import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

type Opt<V extends string> = { value: V; label: string };

export function Segment<V extends string>({
  options, value, onChange, size = 'md',
}: { options: Opt<V>[]; value: V; onChange: (v: V) => void; size?: 'sm' | 'md' }) {
  const p = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: p.surface2, padding: 3, borderRadius: 12 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1, height: size === 'sm' ? 28 : 34,
              backgroundColor: active ? '#fff' : 'transparent',
              borderRadius: 9, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              color: active ? '#1F1F1F' : p.text2,
              fontFamily: fontVariant('sans', 600), fontSize: size === 'sm' ? 12 : 13,
            }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
```

- [ ] **Step 3: ScreenHeader** — back chevron + title + right slot. Pattern from `design/project/app.jsx::ScreenHeader`.

```tsx
import { View, Pressable, Text } from 'react-native';
import { CaretLeft } from 'phosphor-react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';

export function ScreenHeader({ title, onBack, right }: {
  title: string; onBack?: () => void; right?: ReactNode;
}) {
  const p = useTheme();
  return (
    <View style={{
      paddingTop: 52, paddingBottom: 12, paddingHorizontal: 16,
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderBottomWidth: 1, borderBottomColor: p.border, backgroundColor: p.bg,
    }}>
      {onBack && (
        <Pressable onPress={onBack}>
          <CaretLeft size={24} color={p.accent.primary} />
        </Pressable>
      )}
      <Text style={{ flex: 1, color: p.text, fontFamily: 'OpenSauceOne-SemiBold', fontSize: 17 }}>{title}</Text>
      {right}
    </View>
  );
}
```

- [ ] **Step 4: PageTitle** — Apple-style large title at the top of tab screens. Port `design/project/app.jsx::PageTitle`.

- [ ] **Step 5: Empty** — illustrated empty state with optional CTA. Port `screens-library.jsx::Empty`.

- [ ] **Step 6: Confirm** — iOS-style action sheet at the bottom. Port `screens-train.jsx::Confirm`. Use a `Modal` with `transparent` + `animationType="slide"` plus an absolutely-positioned bottom group.

- [ ] **Step 7: Commit**

```bash
git add src/ui/primitives/
git commit -m "feat(ui): add Tag, Segment, ScreenHeader, PageTitle, Empty, Confirm primitives

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 15: Stepper primitive

**Files:** Create `src/ui/primitives/Stepper.tsx`. Port `screens-train.jsx::Stepper`. The visual is `[ − ] value/label [ + ]` aligned horizontally.

- [ ] **Step 1: Implement**

```tsx
import { View, Pressable, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';

export function Stepper({
  label, value, step, onChange, disabled,
}: {
  label: string;
  value: number | null;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const p = useTheme();
  const display = value == null ? '—' : step < 1 ? value.toFixed(1) : String(value);
  const dec = () => !disabled && value != null && value > 0 && onChange(Math.round((value - step) * 10) / 10);
  const inc = () => !disabled && onChange(Math.round(((value ?? 0) + step) * 10) / 10);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
      <Pressable onPress={dec} style={btn(p, disabled)}><Text style={btnText(p)}>−</Text></Pressable>
      <View style={{ alignItems: 'center', flex: 1 }}>
        <Text style={{
          fontFamily: fontVariant('numeric', 600),
          fontSize: 17, color: p.text, letterSpacing: -0.5, includeFontPadding: false,
        }}>{display}</Text>
        <Text style={{
          fontFamily: fontVariant('sans', 600),
          fontSize: 9, color: p.text3, marginTop: 1, letterSpacing: 1, textTransform: 'uppercase',
        }}>{label}</Text>
      </View>
      <Pressable onPress={inc} style={btn(p, disabled)}><Text style={btnText(p)}>+</Text></Pressable>
    </View>
  );
}

const btn = (p: ReturnType<typeof useTheme>, disabled?: boolean) => ({
  width: 24, height: 24, borderRadius: 999,
  backgroundColor: 'rgba(255,255,255,0.1)',
  alignItems: 'center' as const, justifyContent: 'center' as const,
  opacity: disabled ? 0.4 : 1,
});
const btnText = (p: ReturnType<typeof useTheme>) => ({
  color: p.text, fontSize: 16, fontFamily: 'OpenSauceOne-SemiBold',
});
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/primitives/Stepper.tsx
git commit -m "feat(ui): add Stepper with half-step weight support

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 16: NumericPad primitive

**Files:** Create `src/ui/primitives/NumericPad.tsx`. Port `screens-library.jsx::NumericPad`. Big display + ± buttons + quick-adjust chips.

- [ ] **Step 1: Implement** (signature):
  ```ts
  function NumericPad({ value, onChange, suffix, step }: { value: number; onChange: (v: number) => void; suffix: string; step: number; }): JSX.Element
  ```
  Layout: vertical stack — (a) center row with `−` (52px circle), big numeric display + suffix, `+` (52px circle); (b) row of quick-adjust pills `[-1] [-0.5] [+0.5] [+1]`.

- [ ] **Step 2: Commit**

```bash
git add src/ui/primitives/NumericPad.tsx
git commit -m "feat(ui): add NumericPad for record-entry sheets

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 17: Sparkline

**Files:** Create `src/ui/charts/Sparkline.tsx`. Port `components.jsx::Sparkline` using `react-native-svg`.

- [ ] **Step 1: Implement** — input is `{ values: number[]; width: number; height: number; color: string; fill?: string }`. Render an `<Svg>` with `<Path>` for line + optional `<Path>` for area-fill. Math identical to the prototype: linear map to width, invert Y.

- [ ] **Step 2: Commit**

```bash
git add src/ui/charts/Sparkline.tsx
git commit -m "feat(ui): add Sparkline component (svg)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 18: LineChart

**Files:** Create `src/ui/charts/LineChart.tsx`. Port `components.jsx::LineChart` using `react-native-svg`. Match all features: gradient fill, grid lines, terminal-point dot, PR ring markers, sparse X-tick labels.

- [ ] **Step 1: Implement**

Signature:
```ts
type Point = { x: number; y: number; raw?: unknown };
export function LineChart(props: {
  points: Point[]; width: number; height: number;
  color: string; dark?: boolean; prIdxs?: number[];
  yFormat?: (v: number) => string;
  xFormat?: (p: Point) => string;
}): JSX.Element
```

Use `<Defs><LinearGradient>` for the fill, `<Path d=linePath>` for the line (round caps/joins), `<Circle>` for PR rings (white-stroked, accent-filled inner dot) and the terminal point.

- [ ] **Step 2: Commit**

```bash
git add src/ui/charts/LineChart.tsx
git commit -m "feat(ui): add LineChart with PR markers and gradient fill

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 19: ActivityRing

**Files:** Create `src/ui/charts/ActivityRing.tsx`. Port `components.jsx::Ring`. Single ring with `value / goal`; the home screen composes three of them stacked.

- [ ] **Step 1: Implement**

```tsx
import Svg, { Circle } from 'react-native-svg';

export function ActivityRing({
  size, stroke, value, goal, color, trackColor,
}: {
  size: number; stroke: number; value: number; goal: number; color: string; trackColor: string;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  const offset = C * (1 - pct);
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size/2} cy={size/2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size/2} cy={size/2} r={r}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeLinecap="round" strokeDasharray={`${C}`} strokeDashoffset={offset}
      />
    </Svg>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/ui/charts/ActivityRing.tsx
git commit -m "feat(ui): add ActivityRing for Home screen rings

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 20: Heatmap

**Files:** Create `src/ui/charts/Heatmap.tsx`. Port `screens-progress.jsx::CalendarTab` heatmap rendering (the 7-row × ~27-col grid with optional day-tap callback).

- [ ] **Step 1: Implement**

Signature:
```ts
type HeatDay = { date: Date; intensity?: number; future?: boolean; sessions?: unknown[] };
export function Heatmap(props: {
  weeks: HeatDay[][];               // 27 weeks × 7 days
  accent: string;
  isDark: boolean;
  onDayPress?: (day: HeatDay) => void;
  selectedDate?: Date | null;
}): JSX.Element
```

Cell size: `12 px` square, gap `3 px`. Intensity → bg color via the prototype formula:
```ts
const bg =
  day.future ? 'transparent'
  : (day.intensity ?? 0) === 0 ? (isDark ? 'rgba(255,255,255,0.06)' : '#F0F0F0')
  : mixOklab(accent, isDark ? '#000' : '#fff', 22 + (day.intensity ?? 0) * 18);
```

`mixOklab(a, b, pctA)` is a helper that returns an RGB string (RN doesn't have `color-mix`). Implement in `src/lib/color.ts` with srgb→oklab→mix→srgb conversion. A simple linear-RGB mix is a tolerable approximation for v1.

- [ ] **Step 2: Add `src/lib/color.ts`** with a linear-RGB mix helper plus a Vitest unit test (`tests/lib/color.test.ts`) that checks `mix('#FF0000','#000000', 50)` returns `#800000`.

- [ ] **Step 3: Commit**

```bash
git add src/ui/charts/Heatmap.tsx src/lib/color.ts tests/lib/color.test.ts
git commit -m "feat(ui): add Heatmap and oklab-style color mix helper

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 21: RoutineBadge

**Files:** Create `src/ui/workout/RoutineBadge.tsx`. Square 16 px radius, accent-tinted, big first-letter of the routine.

- [ ] **Step 1: Implement** — port `screens-home.jsx::RoutineBadge`.

- [ ] **Step 2: Commit**

```bash
git add src/ui/workout/RoutineBadge.tsx
git commit -m "feat(ui): add RoutineBadge

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 22: SetCard + ExerciseBlock (workout pieces — cards pattern only)

**Files:**
- Create `src/ui/workout/SetCard.tsx`
- Create `src/ui/workout/ExerciseBlock.tsx`

Port `screens-train.jsx::SetCard` and `ExerciseBlock` — but only the `cards` log-pattern (the other two from the prototype are out of scope for v1).

- [ ] **Step 1: Implement `SetCard`** — three columns: set number bubble, two `Stepper`s (kg, reps), "Hecho" button. Done state: pink check + tint background.

- [ ] **Step 2: Implement `ExerciseBlock`** — header (muscle small-caps + exercise name + target + "Saltar"), "Última vez" chip, a stack of `SetCard`s, "+ Añadir serie" dashed button.

- [ ] **Step 3: Render in a Storybook-style harness** — for visual verification: add `app/_dev/sandbox.tsx` (under a `_dev` group not exposed in the tab bar) that renders one `ExerciseBlock` with mock data. Push it from a quick navigation link in any tab placeholder.

- [ ] **Step 4: Verify** — open the simulator, open the sandbox, confirm it visually matches `design/project/screenshots/02-light.png` (in dark mode) for the "Peso muerto" exercise.

- [ ] **Step 5: Commit**

```bash
git add src/ui/workout/ app/_dev/sandbox.tsx
git commit -m "feat(ui): add SetCard and ExerciseBlock (cards log pattern)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

**Phase B is done.** You can compose any screen by combining these primitives.

---

## Phase C — Library features

Nine tasks. Each one ships a CRUD slice end-to-end (query + screen) so you can manually exercise it from the running app.

### Task 23: Exercises queries + tests

**Files:**
- Create `src/features/exercises/queries.ts`
- Create `tests/features/exercises.test.ts`

- [ ] **Step 1: Write failing tests** for: `listExercises`, `listActive`, `createExercise`, `archiveExercise`, `restoreExercise`. Use a test SQLite DB (Drizzle's in-memory driver via better-sqlite3) — write a helper in `tests/setup-db.ts` that instantiates a fresh Drizzle instance per test.

```ts
// tests/setup-db.ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from '@/db/schema';

export function makeTestDb() {
  const sqlite = new Database(':memory:');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: 'src/db/migrations' });
  return { db, sqlite };
}
```

Install `better-sqlite3` as a dev dep: `npm install --save-dev better-sqlite3 @types/better-sqlite3`.

- [ ] **Step 2: Implement `queries.ts`**

```ts
import { db } from '@/db/client';
import { exercises, type MuscleGroup } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

export type Exercise = typeof exercises.$inferSelect;

export async function listActive(): Promise<Exercise[]> {
  return db.select().from(exercises).where(isNull(exercises.archivedAt)).orderBy(exercises.name);
}

export async function listAll(): Promise<Exercise[]> {
  return db.select().from(exercises).orderBy(exercises.name);
}

export async function createExercise(name: string, muscleGroup: MuscleGroup): Promise<Exercise> {
  const [row] = await db.insert(exercises).values({
    name, muscleGroup, createdAt: Date.now(),
  }).returning();
  return row;
}

export async function archiveExercise(id: number): Promise<void> {
  await db.update(exercises).set({ archivedAt: Date.now() }).where(eq(exercises.id, id));
}

export async function restoreExercise(id: number): Promise<void> {
  await db.update(exercises).set({ archivedAt: null }).where(eq(exercises.id, id));
}
```

The queries take an optional `db` param in real life — for tests, refactor to:
```ts
export function makeExerciseQueries(db: DrizzleDb) { return { listActive: () => ..., ... }; }
```
…OR have the test override `client.ts`'s `db` via a setup hook. Pick one; the simpler path is to factor each file as `makeQueries(db)` and instantiate against the prod `db` in a barrel `index.ts`.

- [ ] **Step 3: Verify pass**

Run: `npm test`. All exercise tests green.

- [ ] **Step 4: Commit**

```bash
git add src/features/exercises/ tests/features/exercises.test.ts tests/setup-db.ts
git commit -m "feat(exercises): add typed CRUD queries with unit tests

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 24: Ejercicios screen

**Files:**
- Modify `app/(tabs)/exercises.tsx`
- Create `app/exercise/new.tsx` (modal route for "create exercise")
- Create `src/features/exercises/hooks.ts` (TanStack Query wrappers)

- [ ] **Step 1: Hooks**

```ts
// src/features/exercises/hooks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listActive, createExercise, archiveExercise, restoreExercise } from './queries';

export const exercisesKey = ['exercises'] as const;

export function useExercises() {
  return useQuery({ queryKey: exercisesKey, queryFn: listActive });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, muscleGroup }: { name: string; muscleGroup: any }) => createExercise(name, muscleGroup),
    onSuccess: () => qc.invalidateQueries({ queryKey: exercisesKey }),
  });
}

export function useArchiveExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: archiveExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: exercisesKey }),
  });
}
```

- [ ] **Step 2: Build the screen** — port `screens-library.jsx::ExercisesScreen`:
  - `PageTitle` "Ejercicios" with header action `+` → `router.push('/exercise/new')`.
  - Search input filtering on `name.toLowerCase().includes(...)`.
  - Group filtered list by `muscle_group` and render each group as a card with rows inside.
  - Each row: name + "Mejor: NN kg" subline (placeholder until Phase E) + sparkline placeholder + chevron.
  - Empty state: `<Empty icon="dumbbell" title="Catálogo vacío" body="Añade los ejercicios que sueles hacer. Aparecerán al editar rutinas." cta="Nuevo ejercicio"/>`.

- [ ] **Step 3: Build the create modal** — `app/exercise/new.tsx`:
  - `ScreenHeader` "Nuevo ejercicio" with right slot "Guardar" pressable.
  - Two fields: name (TextInput), muscle group (picker — 7 chips from `MUSCLE_GROUPS`).
  - On save → call `useCreateExercise().mutate({ name, muscleGroup })` then `router.back()`.

- [ ] **Step 4: Verify** — start the simulator, add 3 exercises across different muscle groups, see them grouped on the list screen.

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/exercises.tsx app/exercise/ src/features/exercises/hooks.ts
git commit -m "feat(exercises): build list and create screens

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 25: Routines queries + tests

**Files:**
- Create `src/features/routines/queries.ts`
- Create `tests/features/routines.test.ts`

- [ ] **Step 1: Test scaffolding** — same `makeTestDb` pattern as Task 23.

- [ ] **Step 2: Implement queries** — same pattern as exercises plus:

```ts
export async function getRoutineWithItems(routineId: number) {
  const r = await db.select().from(routines).where(eq(routines.id, routineId)).get();
  if (!r) return null;
  const items = await db
    .select({
      id: routineItems.id, position: routineItems.position,
      targetSets: routineItems.targetSets, targetReps: routineItems.targetReps, targetWeightKg: routineItems.targetWeightKg,
      exerciseId: exercises.id, exerciseName: exercises.name, muscleGroup: exercises.muscleGroup,
    })
    .from(routineItems)
    .leftJoin(exercises, eq(routineItems.exerciseId, exercises.id))
    .where(eq(routineItems.routineId, routineId))
    .orderBy(routineItems.position);
  return { ...r, items };
}

export async function createRoutine(name: string) { /* insert + return */ }
export async function addItem(routineId: number, exerciseId: number, position: number, sets: number, reps: number, weight: number | null) { /* insert */ }
export async function reorderItems(routineId: number, ids: number[]) { /* update positions in a transaction */ }
export async function duplicateRoutine(routineId: number, newName: string) { /* insert routine + clone items */ }
export async function archiveRoutine(routineId: number) { /* set archivedAt */ }
```

- [ ] **Step 3: Verify pass**

Run: `npm test -- routines`. All green.

- [ ] **Step 4: Commit**

```bash
git add src/features/routines/ tests/features/routines.test.ts
git commit -m "feat(routines): add typed CRUD queries with duplicate + reorder

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 26: Rutinas screen + Routine editor

**Files:**
- Modify `app/(tabs)/routines.tsx`
- Create `app/routine/edit.tsx` (search param `id`; absent = new)
- Create `app/routine/[id]/add-item.tsx` (modal for adding an exercise to the routine)
- Create `src/features/routines/hooks.ts`

- [ ] **Step 1: Hooks** — `useRoutines`, `useRoutine(id)`, `useCreateRoutine`, `useDuplicateRoutine`, `useArchiveRoutine`, `useUpdateItem`, `useAddItem`, `useRemoveItem`, `useReorderItems`.

- [ ] **Step 2: List screen** — port `screens-library.jsx::RoutinesScreen`:
  - `PageTitle "Rutinas"` + `+` header action → `router.push('/routine/edit')`.
  - For each routine: `RoutineBadge` + name + "N ejercicios · M series" + chevron.
  - "Archivadas" section below with restore action.

- [ ] **Step 3: Editor screen** — port `screens-library.jsx::RoutineEditor`:
  - Reads `id` from route params; if absent, starts blank.
  - Name input + ordered list of items, each row: drag handle (visual only in v1 — actual reorder uses up/down arrows), exercise name + muscle, `N×R · Wkg`, chevron → opens an "Edit item" sheet (Stepper-based).
  - "+ Añadir ejercicio" → opens the picker modal that lists exercises from `useExercises()`. Picking one inserts a new item with defaults `(3 sets, 8 reps, weight=null)` and pushes to the routine.
  - "Archivar rutina" destructive button at the bottom.

- [ ] **Step 4: Verify** — create a routine "Empuje" with 4 exercises and target sets/reps/weights; quit and relaunch, confirm it persisted.

- [ ] **Step 5: Commit**

```bash
git add app/(tabs)/routines.tsx app/routine/ src/features/routines/hooks.ts
git commit -m "feat(routines): add list, editor, and item picker screens

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 27: Body weight queries + screen

**Files:**
- Create `src/features/body-weight/queries.ts` + tests
- Create `src/features/body-weight/hooks.ts`
- Create `app/record-weight.tsx`

- [ ] **Step 1: Queries** — `listWeights(rangeDays?: number)`, `upsertWeight({ recordedOn, weightKg })`, `deleteWeight(id)`, `lastWeight()`.

- [ ] **Step 2: Tests** — upsert overwrites same-day entry; list orders ascending.

- [ ] **Step 3: Hooks** — same pattern.

- [ ] **Step 4: Record screen** — port `screens-library.jsx::RecordWeight`:
  - `ScreenHeader "Peso corporal"` with right "Guardar".
  - Subtitle: `fmtDayShort(today)`.
  - `<NumericPad value={kg} onChange={setKg} suffix="kg" step={0.1}/>`.
  - "Hace 7 días: NN kg" reference label.
  - "Guardar" → `useUpsertWeight().mutate({ recordedOn: ymd(today), weightKg: kg })` then `router.back()`.
  - If upsert detects an existing same-day row, show a `Confirm` action sheet before overwriting.

- [ ] **Step 5: Verify** — record a weight, see it in the database (use Flipper or just log the query result on Home placeholder).

- [ ] **Step 6: Commit**

```bash
git add src/features/body-weight/ app/record-weight.tsx tests/features/body-weight.test.ts
git commit -m "feat(body-weight): add queries and record screen with daily upsert

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 28: Measurements queries + screen

**Files:**
- Create `src/features/measurements/queries.ts` + tests
- Create `src/features/measurements/hooks.ts`
- Create `app/record-measurement.tsx`

- [ ] **Step 1: Queries** — `listMeasurementTypes()`, `createMeasurementType({ name, unit })`, `archiveMeasurementType(id)`, `listMeasurements(typeId, rangeDays?)`, `upsertMeasurement({ typeId, recordedOn, value })`.

- [ ] **Step 2: Tests** — upsert per `(typeId, recordedOn)` pair.

- [ ] **Step 3: Record screen** — port `screens-library.jsx::RecordMeasurement`:
  - `ScreenHeader "Medida"` with right "Guardar".
  - Pill row of measurement types (current types + `+` chip → opens "New measurement type" sub-modal: name + unit `cm | %`).
  - `<NumericPad value={v} onChange={setV} suffix={type.unit} step={0.1}/>`.
  - Save flow same as weight.

- [ ] **Step 4: Commit**

```bash
git add src/features/measurements/ app/record-measurement.tsx
git commit -m "feat(measurements): add queries and record screen with type picker

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 29: Settings screen

**Files:**
- Modify `app/(tabs)/index.tsx` (add gear icon → route)
- Create `app/settings.tsx`

- [ ] **Step 1: Build settings screen** — sections:
  1. **Perfil** — input "Tu nombre".
  2. **Metas semanales** — three steppered fields: sesiones, minutos, volumen (kg). Use the existing `Stepper`.
  3. **Apariencia** — `Segment` `Claro / Oscuro / Sistema`.
  4. **Datos** (future placeholder) — disabled button "Exportar JSON".
  - Wire to `useSettingsStore().patch({...})` on every change (debounce 300 ms for the name input).

- [ ] **Step 2: Verify** — toggle theme to Light, see the entire app re-theme; toggle back. Set goals and re-open the screen: persisted.

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/index.tsx app/settings.tsx
git commit -m "feat(settings): build settings screen with theme + goals + name

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 30: Wire theme toggle end-to-end

**Files:**
- Modify `app/_layout.tsx` to react to `useSettingsStore().data.theme`.

- [ ] **Step 1: Make ThemeProvider's `preference` reactive.**

```tsx
const themePref = useSettingsStore((s) => s.data?.theme ?? 'dark') as 'light' | 'dark' | 'system';
<ThemeProvider preference={themePref}>...</ThemeProvider>
```

- [ ] **Step 2: Verify** — light/dark/system all work. With `system`, switching the simulator appearance flips the app.

- [ ] **Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(theme): drive ThemeProvider from settings store (live)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 31: Empty states pass on the four tabs

**Files:** small edits across `app/(tabs)/index.tsx`, `train.tsx`, `routines.tsx`, `exercises.tsx`, `progress.tsx`.

- [ ] **Step 1: Inicio empty** — if `routines` and `weights` and `measurements` are all empty: render `<Empty title="¡Hola!" body="Crea tu primera rutina o registra tu peso para empezar."/>`.
- [ ] **Step 2: Entrenar empty** — if `routines` empty: render the "No tienes rutinas" card from `screens-train.jsx`.
- [ ] **Step 3: Rutinas empty** — render `Empty` with CTA "Nueva rutina".
- [ ] **Step 4: Ejercicios empty** — render `Empty` with CTA "Nuevo ejercicio".
- [ ] **Step 5: Progreso empty** — render `Empty` icon `chart-line`, "Aún no hay datos".
- [ ] **Step 6: Commit**

```bash
git add app/(tabs)/
git commit -m "feat(empty): render empty-state CTAs across all tabs

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

**Phase C is done.** You can now configure the app end-to-end: create exercises, routines, log weight, log measurements, set goals and theme.

---

## Phase D — Workout flow

Five tasks. End state: you can start a routine, log sets, finish, see the summary, and the session persists.

### Task 32: Sessions queries + Zustand in-progress state

**Files:**
- Create `src/features/sessions/queries.ts` + tests
- Create `src/features/sessions/state.ts` (Zustand store for in-progress session)
- Create `src/features/sessions/hooks.ts`

- [ ] **Step 1: Queries**

Implement: `startSession(routineId, routineName)`, `appendSet({ sessionId, exerciseId, exerciseName, position, weightKg, reps })`, `finishSession(sessionId)`, `abandonSession(sessionId)`, `lastSessionForExercise(exerciseId)`, `listSessions({ since? })`, `getSessionWithSets(sessionId)`.

`abandonSession` performs `DELETE FROM workout_sessions WHERE id = ?` (cascade removes sets).

- [ ] **Step 2: Tests** — `startSession` writes a row with `routineNameSnapshot`; `appendSet` writes one row; `finishSession` updates `finishedAt`; `abandonSession` removes rows.

- [ ] **Step 3: In-progress state** — Zustand store holding only the *un-persisted* draft state during the workout (set stepper values per row, active index). The actual writes happen on "Hecho" via `appendSet`.

```ts
// src/features/sessions/state.ts
import { create } from 'zustand';

export type DraftSet = {
  exerciseId: number;
  exerciseName: string;
  muscleGroup: string;
  targetReps: number;
  targetWeight: number | null;
  weight: number | null;
  reps: number;
  completed: boolean;
};

type State = {
  sessionId: number | null;
  routineId: number | null;
  routineName: string | null;
  sets: DraftSet[];
  activeIdx: number;
  startedAt: number | null;

  init: (init: { sessionId: number; routineId: number; routineName: string; sets: DraftSet[] }) => void;
  update: (idx: number, patch: Partial<DraftSet>) => void;
  complete: (idx: number) => void;
  setActive: (idx: number) => void;
  appendSetAt: (idx: number) => void;          // duplicate the previous row of the same exercise
  clear: () => void;
};

export const useWorkoutDraft = create<State>((set, get) => ({
  sessionId: null, routineId: null, routineName: null,
  sets: [], activeIdx: 0, startedAt: null,
  init: (i) => set({ ...i, activeIdx: 0, startedAt: Date.now() }),
  update: (idx, patch) =>
    set((s) => ({ sets: s.sets.map((x, i) => (i === idx ? { ...x, ...patch } : x)) })),
  complete: (idx) =>
    set((s) => {
      const next = s.sets.findIndex((x, i) => i > idx && !x.completed);
      const sets = s.sets.map((x, i) => {
        if (i === idx) return { ...x, completed: true };
        if (i === next && x.exerciseId === s.sets[idx].exerciseId) {
          return { ...x, weight: s.sets[idx].weight, reps: s.sets[idx].reps };
        }
        return x;
      });
      return { sets, activeIdx: next === -1 ? idx : next };
    }),
  setActive: (idx) => set({ activeIdx: idx }),
  appendSetAt: (idx) =>
    set((s) => {
      const last = s.sets[idx];
      return { sets: [...s.sets.slice(0, idx + 1), { ...last, completed: false }, ...s.sets.slice(idx + 1)] };
    }),
  clear: () => set({ sessionId: null, routineId: null, routineName: null, sets: [], activeIdx: 0, startedAt: null }),
}));
```

- [ ] **Step 4: Commit**

```bash
git add src/features/sessions/ tests/features/sessions.test.ts
git commit -m "feat(sessions): add queries, hooks, and zustand draft store

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 33: Entrenar screen (suggested + list)

**Files:**
- Modify `app/(tabs)/train.tsx`
- Add `src/features/progress/derived.ts::suggestedRoutine(routines, sessions)` + Vitest tests

- [ ] **Step 1: TDD `suggestedRoutine`**

```ts
export function suggestedRoutine(
  routines: { id: number; archivedAt: number | null }[],
  lastUsedAt: Record<number, number>, // routineId → ms; 0 if never
): number | null {
  const active = routines.filter((r) => !r.archivedAt);
  if (active.length === 0) return null;
  return active
    .map((r) => ({ id: r.id, lu: lastUsedAt[r.id] ?? 0 }))
    .sort((a, b) => a.lu - b.lu || a.id - b.id)[0].id;
}
```

Tests cover: zero routines → null; all unused → smallest id wins; one used recently → other one wins; ties → smallest id.

- [ ] **Step 2: Build the screen** — port `screens-train.jsx::TrainScreen`:
  - `PageTitle "Entrenar"` + subtitle "Elige una rutina para empezar".
  - "Recomendado hoy" hero card with the suggested routine (gradient bg using `accent.primary → accent.primaryDark`, big name, "N ejercicios · Última vez …", "Empezar" button → `router.push(/workout/start?routineId=…)`).
  - "Todas las rutinas" list with each row → tap-anywhere starts the workout.

- [ ] **Step 3: "Start workout" route**

Add `app/workout/start.tsx` as a tiny intermediate that:
1. Reads `routineId` from search params.
2. Calls `startSession(routineId, routine.name)` → returns `sessionId`.
3. Builds the `DraftSet[]` (for each routine item, push `targetSets` draft rows, prefilled from `lastSessionForExercise`).
4. `useWorkoutDraft.getState().init({ sessionId, ..., sets })`.
5. `router.replace(\`/workout/\${sessionId}\`)`.

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/train.tsx app/workout/start.tsx src/features/progress/derived.ts tests/features/derived.test.ts
git commit -m "feat(train): add Entrenar screen with LRU-suggested routine

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 34: Workout in-progress screen

**Files:**
- Create `app/workout/[sessionId].tsx`

- [ ] **Step 1: Build the screen** — port `screens-train.jsx::WorkoutScreen` minus the pattern-switch (use `cards` only).

Top sticky header:
- `X` button → `Confirm` "¿Abandonar entrenamiento?" → `abandonSession(sessionId)` + `router.replace('/(tabs)/train')` + `clear()`.
- "En curso" eyebrow + routine name + elapsed `mm:ss` ticking from `startedAt`.
- Progress bar `completedSets / totalSets`.

Body: group `useWorkoutDraft().sets` into blocks (consecutive same `exerciseId` indices) and render an `<ExerciseBlock>` per block. Wire `updateSet`, `logSet`, `skipBlock`, `addSet` to the draft store.

When `logSet(idx)` fires:
1. `useWorkoutDraft.getState().complete(idx)`.
2. Call `appendSet(...)` to persist immediately.

Footer button: "Terminar entrenamiento" (disabled if no completed sets) → `Confirm` "¿Terminar?" with stats → `finishSession(sessionId)` → `router.replace(/workout-summary/${sessionId})`.

- [ ] **Step 2: Verify** — start a workout from Entrenar, log 3 sets across 2 exercises, finish, land on Summary.

- [ ] **Step 3: Commit**

```bash
git add app/workout/
git commit -m "feat(workout): build in-progress screen with cards pattern

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 35: Workout summary screen

**Files:**
- Create `app/workout-summary/[sessionId].tsx`

- [ ] **Step 1: Build the screen** — port `screens-train.jsx::WorkoutSummary`:
  - `getSessionWithSets(sessionId)` for the data.
  - Hero (big check-circle + "¡Sesión completa!" + routine name + date).
  - Three stat cards: Series, Volumen, Duración.
  - "Por ejercicio" — group sets by `exerciseId` and render each as a card with the set sequence (`120×5 · 120×5 · 120×4`).
  - "Volver al inicio" button → `router.replace('/(tabs)')`.

- [ ] **Step 2: Commit**

```bash
git add app/workout-summary/
git commit -m "feat(workout): add post-finish summary screen

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 36: Last-time recall (cross-session autofill)

**Files:**
- Verify `app/workout/start.tsx` correctly prefills from `lastSessionForExercise`.
- Add a Vitest covering: given a previous session of an exercise with sets `[(120,5),(120,5),(120,5),(120,4)]`, a new session for the same routine prefills the first set's stepper with `(120, 5)`.

- [ ] **Step 1: Test**
- [ ] **Step 2: Fix logic** if needed.
- [ ] **Step 3: Commit**

```bash
git add tests/features/sessions.test.ts app/workout/start.tsx
git commit -m "feat(sessions): verify last-time autofill at workout start

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

**Phase D is done.** Full workout flow works end-to-end and persists.

---

## Phase E — Home & Progress

Seven tasks. End state: the dashboard and all four progress sub-tabs render real data, plus exercise detail screen.

### Task 37: Derived queries

**Files:**
- Modify `src/features/progress/derived.ts`
- Add tests `tests/features/derived.test.ts`

Implement (TDD where it's cheap):

- [ ] `currentStreak(sessionsByYmd: Set<string>, today: Date, weeksMax = 26): number` — see §8.8.
- [ ] `thisWeekStats(sessions: SessionLite[], today: Date, goals): { sessions; minutes; volume; ...Goal }` — see §8.9. Week = Monday to Sunday.
- [ ] `exerciseHistory(sessions: SessionLite[], exerciseId: number): { date: Date; topSet: SetLite; volume: number; sets: number }[]` — sorted ascending.
- [ ] `prIndices(history: {y: number}[]): number[]` — rolling-max indexes.
- [ ] `heatmapWeeks(sessions: SessionLite[], today: Date): HeatDay[][]` — 26-week window, intensity `Math.ceil(volume/1500)` clamped to 4.
- [ ] `muscleVolumeStats(sessions: SessionLite[], today: Date, days = 84): { name; sessions; pct }[]` — for the Cadencia bars.
- [ ] `suggestedRoutineId(routines, sessions)` — already in Task 33; verify here as well.

Each function gets its own test block with at least one positive and one edge-case test.

- [ ] **Commit**

```bash
git add src/features/progress/derived.ts tests/features/derived.test.ts
git commit -m "feat(progress): add derived helpers (streak, stats, heatmap, muscle)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 38: Inicio dashboard

**Files:** Modify `app/(tabs)/index.tsx`. Port `screens-home.jsx::HomeScreen`.

- [ ] **Step 1: Layout** — top to bottom:
  1. `PageTitle "Hola[, name]"` subtitle `fmtDayShort(today)`. Right action: gear icon → `router.push('/settings')`.
  2. Activity rings card: three `ActivityRing` stacked centered (sizes `112 / 86 / 60`, strokes `11 / 10 / 9`). Sessions on the outside (ember), minutes middle (`#10B981`), volume inside (`#3B82F6`). Left side: "ESTA SEMANA" eyebrow + big numeric `{sessions} / {goal}` + "sesiones · meta semanal" sub. Below: legend row with three `RingLegend`s.
  3. Quick tiles grid 2×2: Entrenar (ember filled), Peso (`{lastKg} kg · {relative}`), Medida ("Cintura, brazo…"), Racha (`{streak} semanas en racha`).
  4. SectionTitle "PESO CORPORAL" with "Ver" action → `router.push('/(tabs)/progress?sub=weight')`.
  5. Weight card: big numeric + delta (`−4.5 kg · 6 meses`) + 30-day `Sparkline`.
  6. SectionTitle "ÚLTIMO ENTRENAMIENTO" with "Historial" action.
  7. Last session card: `RoutineBadge` + name + `fmtRelative(startedAt)` + duration + chevron → opens `workout-summary/{id}`. Three metrics row (series, volumen, duración).
  8. SectionTitle "CADENCIA".
  9. Heatmap last 12 weeks — reuse the same `Heatmap` component, passing `weeks.slice(-12)` and a slightly smaller cell size (10 px). Add an optional `cellSize` prop to `Heatmap` in this task if you didn't in T20.

- [ ] **Step 2: Wire data** — TanStack Query for `lastWeight()`, `lastSession()`, `listSessions({ since })`, `thisWeekStats`.

- [ ] **Step 3: Verify** — record some workouts, weights, see the dashboard light up.

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/index.tsx src/ui/charts/Heatmap.tsx
git commit -m "feat(home): build Inicio dashboard (rings, tiles, weight, last session, cadence)

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 39: Progreso > Peso

**Files:**
- Modify `app/(tabs)/progress.tsx`

- [ ] **Step 1: Tab container** — `Segment` with 4 options `Peso / Ejerc. / Cadencia / Medidas`. Sub-route state is local (no URL nesting needed).

- [ ] **Step 2: BodyWeightTab** — port `screens-progress.jsx::BodyWeightTab`:
  - KPI header: current kg + signed delta over selected range.
  - `<LineChart>` with body weight points.
  - Range buttons `1M / 3M / 6M / 1A / Todo`.
  - "Últimos registros" — last 6 entries, tap to edit (push `record-weight?id=N` with prefill).

- [ ] **Step 3: Commit**

```bash
git add app/(tabs)/progress.tsx
git commit -m "feat(progress): add Peso sub-tab with range selector

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 40: Progreso > Ejerc.

**Files:** Same `app/(tabs)/progress.tsx`.

- [ ] **Step 1: ExercisesTab** — port `screens-progress.jsx::ExercisesTab`:
  - Horizontal chips of `EXERCISES.slice(0,8)` (sorted by most-recently-used). Selected one wins.
  - KPI header (current top-set or volume) + PR badge + sessions count.
  - `<LineChart>` with `prIdxs` markers. Toggle `Top set ↔ Volumen` via `<Segment>`.
  - "Últimas sesiones" list, last 5.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/progress.tsx
git commit -m "feat(progress): add Ejerc. sub-tab with PR markers

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 41: Progreso > Cadencia

**Files:** Same `app/(tabs)/progress.tsx`.

- [ ] **Step 1: CalendarTab** — port `screens-progress.jsx::CalendarTab`:
  - Three `BigStat` cards: total sesiones, sesiones/semana (totalSessions/26), horas totales.
  - Heatmap (full 26 weeks). Tap day → expand a card showing the routines/sets/duration.
  - "Por grupo muscular (12 sem)" — `muscleVolumeStats` as horizontal bars.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/progress.tsx
git commit -m "feat(progress): add Cadencia sub-tab with heatmap and muscle bars

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 42: Progreso > Medidas

**Files:** Same `app/(tabs)/progress.tsx`.

- [ ] **Step 1: MeasuresTab** — port `screens-progress.jsx::MeasuresTab`:
  - Horizontal chips of `measurementTypes`.
  - KPI header with delta + range.
  - `<LineChart>` of that type's values.
  - "Historial" list, last 6.

- [ ] **Step 2: Commit**

```bash
git add app/(tabs)/progress.tsx
git commit -m "feat(progress): add Medidas sub-tab

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

### Task 43: Exercise detail screen

**Files:** Create `app/exercise/[id].tsx`. Port `screens-library.jsx::ExerciseDetail`. Reached from Ejercicios row tap or from a future "Ver detalle" affordance in Progreso > Ejerc.

- [ ] **Step 1: Build the screen**

- [ ] **Step 2: Verify** — tap an exercise from the catalog, see chart + history + PR tags.

- [ ] **Step 3: Commit**

```bash
git add app/exercise/[id].tsx
git commit -m "feat(exercises): add exercise detail screen with chart and PRs

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>"
```

---

**Phase E is done.** All five tabs render real data with the visual match against the prototype.

---

## Phase F — Verification

Two tasks. End state: app passes the §11 success criteria manually.

### Task 44: End-to-end UAT pass on device

- [ ] **Step 1: Manual test plan** — execute on an iPhone 15 Pro simulator (or a physical device via Expo Go):
  1. **Cold start:** app opens, dark, ember accent, fonts loaded, no errors.
  2. **Onboarding-equivalent:** Settings → set owner name → Inicio shows "Hola, X".
  3. **Catalog:** add 5 exercises across ≥3 muscle groups. Confirm grouping.
  4. **Routine:** create "Empuje" with 4 exercises and targets. Save.
  5. **First workout:** Entrenar → Empuje is suggested (LRU = never used). Start. Log all 12 sets (4 exercises × 3 sets). Verify the second set autofills from the first. Finish. Land on Summary. Hit "Volver al inicio".
  6. **Second workout, another day** — Tirón. Verify "Última vez" recall now shows previous values for any shared exercise.
  7. **Body weight:** record today's weight. Reopen, edit it. Confirm the chart in Progreso > Peso shows the point.
  8. **Measurements:** record cintura. Confirm Progreso > Medidas updates.
  9. **Theme toggle:** Settings → Claro. Confirm every screen re-themes correctly. Back to Oscuro.
  10. **Persistence:** kill the app, relaunch. All data intact.
  11. **Empty states:** uninstall + reinstall (`expo r -c` is not enough — delete the simulator app or wipe data). Verify the empty states across all tabs are clean and consistent.

- [ ] **Step 2: Fix issues found** — each issue gets its own commit with `fix(<scope>):` prefix.

- [ ] **Step 3: Commit any fixes**

---

### Task 45: Coverage check against the spec

- [ ] **Step 1: Walk the spec section by section** and confirm each functional requirement is implemented:

| Spec § | Requirement | Where in app |
|---|---|---|
| 4 | 5 tabs + 7 inner screens | `app/(tabs)/*.tsx` + `app/<inner>` |
| 5.1 | Exercise with muscle CHECK | `db/schema.ts` |
| 5.2-5.3 | Routine + items + uniqueness | `db/schema.ts` |
| 5.4-5.5 | Session + sets with snapshots | `db/schema.ts` |
| 5.6 | Body weight per-day unique | `db/schema.ts` |
| 5.7-5.8 | Measurement type + entry | `db/schema.ts` |
| 5.9 | Settings single-row | `db/schema.ts` |
| 6.1-6.7 | All flows | Phase B + C + D |
| 8.5 | Cross-session autofill | T36 |
| 8.6 | Archive vs hard-delete | Queries in T23–T28 |
| 8.7 | Suggested routine | T33 |
| 8.8 | Streak | T37 |
| 8.9 | Rings | T38 |
| 8.10 | Theme toggle persisted | T29-T30 |
| 8.11 | In-session autofill | T34 |
| 9 | Visual design | Phase B (primitives) + Phase D/E (screens) |

If anything is missing, add a follow-up task.

- [ ] **Step 2: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore: pin versions and tag v1.0

Signed-off-by: Juan Daniel Forner Garriga <dani@jotade.io>
EOF
)"
git tag v1.0
```

---

## Notes for the engineer

- **When in doubt about visuals, open the prototype.** `design/project/Health Tracker.html` rendered in any browser (Safari, Chrome) is the closest you'll get to "what this should look like in dark mode with the ember accent". Compare side by side with the simulator.
- **Don't over-engineer.** This is a personal app. If TanStack Query feels like overkill for a specific screen, plain `useEffect + setState` is fine. Drizzle queries are cheap, so over-fetching is a non-issue.
- **One day, one workout, one routine.** The spec assumes that a session is started and finished in one go. There is no "resume yesterday's session". If the user kills the app mid-workout, the partial session is still on disk (with `finishedAt = null`) — at the next launch, treat such a session as abandoned silently (delete it) so the Train screen doesn't get confused. Add this in a small fix during T44 if it comes up.
- **iOS first.** Android works too because Expo, but visual polish targets iOS — corner radii, font rendering, and the tab bar blur are tuned there.

---

## Self-review notes (filled in after writing)

- All §5 entities have a table + queries + tests by end of Phase C/D.
- All §6 flows have a screen by end of Phase E.
- All §8 derivations have a tested helper by T37.
- All §9 visual tokens land in T6 + T7 + T8; primitives in Phase B.
- All §10 decisions are reflected in code: muscle enum (T4), settings defaults (T4), streak (T37), LRU suggested routine (T33), theme toggle (T29-T30), owner name (T29).
- No `TBD`, `TODO`, or "implement later" in any task above.
