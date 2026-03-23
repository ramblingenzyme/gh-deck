# HubDeck — Scaffold & Refactor Plan

## Context

The prototype is a single `src/index.tsx` file (~600 lines) with no build tooling, no types, all inline styles, and mock data hardcoded alongside components. This plan scaffolds Vite + React + TypeScript tooling and refactors the prototype into a maintainable multi-file structure. No functional changes — mock data is preserved, real API calls and auth are deferred.

---

## Target File Structure

```
gh-deck/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── oxlint.json
└── src/
    ├── main.tsx
    ├── globals.css
    ├── types/
    │   └── index.ts
    ├── constants/
    │   └── index.ts
    ├── data/
    │   └── mock.ts
    ├── components/
    │   ├── App.tsx
    │   ├── Topbar.tsx
    │   ├── Board.tsx
    │   ├── Column.tsx
    │   ├── AddColumnModal.tsx
    │   └── cards/
    │       ├── PRCard.tsx
    │       ├── IssueCard.tsx
    │       ├── CICard.tsx
    │       ├── NotifCard.tsx
    │       └── ActivityCard.tsx
    └── hooks/
        └── useColumns.ts
```

---

## Config Files

### `package.json`

```json
{
  "name": "hubdeck",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "oxlint src",
    "format": "oxfmt src"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "oxlint": "latest",
    "oxfmt": "latest",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.4.1",
    "typescript": "^5.8.2",
    "vite": "^6.3.1"
  }
}
```

### `tsconfig.app.json` (strict mode)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

### `oxlint.json`

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": resolve(__dirname, "./src") } },
});
```

### `index.html`

Move Google Fonts `<link>` tags here (from the injected `<style>` in the prototype). Mount point `<div id="root">`.

---

## Types — `src/types/index.ts`

```ts
export type ColumnType = "prs" | "issues" | "ci" | "notifications" | "activity";
export type CIStatus = "success" | "failure" | "running";
export type NotifType = "review_requested" | "mention" | "assigned" | "approved" | "comment";
export type ActivityType = "commit" | "comment" | "pr_opened" | "review" | "issue_closed";

export interface ColumnConfig {
  id: number;
  type: ColumnType;
  title: string;
}
export interface PRItem {
  id: number;
  title: string;
  repo: string;
  author: string;
  number: number;
  reviews: { approved: number; requested: number };
  comments: number;
  draft: boolean;
  age: string;
  labels: string[];
}
export interface IssueItem {
  id: number;
  title: string;
  repo: string;
  number: number;
  labels: string[];
  assignee: string | null;
  comments: number;
  age: string;
  state: "open" | "closed";
}
export interface CIItem {
  id: number;
  name: string;
  repo: string;
  branch: string;
  status: CIStatus;
  duration: string;
  age: string;
  triggered: "push" | "pull_request" | "release";
}
export interface NotifItem {
  id: number;
  type: NotifType;
  text: string;
  repo: string;
  ref: string;
  age: string;
}
export interface ActivityItem {
  id: number;
  type: ActivityType;
  text: string;
  repo: string;
  age: string;
  sha?: string;
}
```

---

## Constants — `src/constants/index.ts`

Typed versions of `LABEL_COLORS`, `CI_STATUS`, `NOTIF_ICONS`, `ACTIVITY_ICONS`, `COLUMN_TYPES`, `DEFAULT_COLUMNS`.

Key additions:

- `LABEL_FALLBACK: { bg: string; text: string }` — used as `LABEL_COLORS[label] ?? LABEL_FALLBACK` to satisfy `noUncheckedIndexedAccess`
- `mkId(): number` — ID generator for new columns

---

## CSS Architecture — `src/globals.css`

Three sections:

1. **Design tokens at `:root`**: `--bg-root`, `--bg-topbar`, `--bg-column`, `--bg-card`, `--border-structural`, `--border-card`, text scale, accent per column type, CI status colors, font families
2. **Global resets**: box-sizing, scrollbar (4px, dark), `.btn { all: unset; box-sizing: border-box; cursor: pointer; font-family: var(--font-mono); }`, `.btn-icon`, `.type-btn`, `.field-input`
3. **Layout/component classes**: `.app-root`, `.topbar`, `.board`, `.column`, `.col-header`, `.col-body`, `.col-title`, `.card`, `.card-top`, `.card-title`, `.card-meta`, `.card-repo`, `.card-age`, `.label-list`, `.label`, `.ci-card`, `.draft-badge`, `.modal-overlay`, `.modal`, `.board-empty`

**`--color-accent` pattern**: `Column` sets `style={{ '--color-accent': col.color } as React.CSSProperties}` on its root div. `.col-header` reads `border-bottom: 1px solid color-mix(in srgb, var(--color-accent) 13%, transparent)` and `.col-title` reads `color: var(--color-accent)`.

**Label colors stay inline**: label `bg`/`color` are dynamic data-driven values from `LABEL_COLORS` — `style={{ background: ..., color: ... }}` on the label `<span>` is correct.

**CI border color**: `CICard` sets `style={{ '--ci-color': s.color } as React.CSSProperties}` on its root; `.ci-card { border-left: 2px solid var(--ci-color, var(--border-card)); }`.

---

## Component Responsibilities

| Component            | State                  | Notes                                                             |
| -------------------- | ---------------------- | ----------------------------------------------------------------- |
| `App.tsx`            | `columns`, `showModal` | Mounts `useColumns`, renders Topbar + Board + Modal               |
| `Topbar.tsx`         | none                   | Props: `onAddColumn`                                              |
| `Board.tsx`          | none                   | Props: columns + handlers; renders scroll container + empty state |
| `Column.tsx`         | `confirming`           | Sets `--color-accent`; dispatches to card components by type      |
| `AddColumnModal.tsx` | `type`, `title`        | Props: `onAdd`, `onClose`, `existing` (unused now, needed later)  |
| `cards/*.tsx`        | none                   | Pure presentational; each typed to its item interface             |

### `src/hooks/useColumns.ts`

Extracts `addCol`, `removeCol`, `moveLeft`, `moveRight` from App. Returns `{ columns, addCol, removeCol, moveLeft, moveRight }`. Only imports are `useState` and types.

---

## Implementation Sequence

**Phase 1 — Scaffold**

1. Create `index.html`, `package.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `oxlint.json`
2. Create `src/main.tsx` (temporarily mount original export)
3. Run `npm install`

**Phase 2 — Types & constants** 4. `src/types/index.ts` 5. `src/constants/index.ts`

**Phase 3 — Mock data** 6. `src/data/mock.ts` — named typed exports (`MOCK_PRS`, `MOCK_ISSUES`, etc.)

**Phase 4 — CSS** 7. `src/globals.css` — full token/reset/component class extraction

**Phase 5 — Card components** 8. `src/components/cards/PRCard.tsx` 9. `IssueCard.tsx`, `CICard.tsx`, `NotifCard.tsx`, `ActivityCard.tsx`

**Phase 6 — Column, modal, hook** 10. `src/hooks/useColumns.ts` 11. `src/components/Column.tsx` 12. `src/components/AddColumnModal.tsx`

**Phase 7 — App shell** 13. `src/components/Topbar.tsx` 14. `src/components/Board.tsx` 15. `src/components/App.tsx` 16. Update `main.tsx` to import from `@/components/App` 17. Delete `src/index.tsx`

**Phase 8 — Validate** 18. `tsc -b && vite build` — zero type errors 19. `oxlint src` + `oxfmt src` 20. `npm run dev` — visual check against original prototype

---

## Strict-Mode Issues to Fix

- `LABEL_COLORS[label]` → `LABEL_COLORS[label] ?? LABEL_FALLBACK`
- `document.getElementById('root')` → null guard before `createRoot`
- Array swap in `moveLeft`/`moveRight` → bounds-checked via `isFirst`/`isLast` at call site; use non-null assertion with comment at the swap site
- All component props untyped → add explicit prop interfaces
- Unused `useRef` import in prototype → removed

---

## Critical Files

- `/var/home/ramb/src/gh-deck/src/index.tsx` — source of truth for all component logic, mock data, styles
- `src/types/index.ts` — must exist before any other src file is written
- `src/globals.css` — replaces entire inline `styles` object; `--color-accent` and `.btn` are the most critical additions
- `src/components/Column.tsx` — most complex migration; owns `--color-accent`, `confirming` state, dynamic card dispatch

---

## Verification

1. `npm run dev` — app loads, all 5 default columns render, mock data displays correctly
2. Add column modal opens, type selector works, new column appends
3. Move left/right buttons work; first column has no left arrow, last has no right arrow
4. Remove with confirmation works
5. `npm run build` — clean build, zero TS errors
6. `oxlint src` — zero lint errors; `oxfmt --check src` — no format drift
7. Visual comparison against original prototype: same dark aesthetic, same fonts, same accent colors per column
