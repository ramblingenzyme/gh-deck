# Context

Triage and resolve actionable TODO comments across the codebase. Several TODOs were deemed not worth implementing: icon tree-shaking (Vite handles it statically), ColumnSettingsModal perf (micro-optimisation on a prototype), design token semantic audit (too vague), popover="hint" Firefox cleanup (waiting on browser support), globals.css focus-visible (`:focus-visible` and `*:focus-visible` are identical — no change needed). Those comments were left in place.

All implemented groups passed `npm run build` and `npm test` after each step.

---

## Group 1: Remove stale TODO comment

- `src/globals.css` — removed TODO asking whether `:focus-visible` should be `*:focus-visible` (they are equivalent).

---

## Group 2: Small, self-contained fixes

### CSS migration into ColumnHeader.module.css

**Files:** `src/components/ColumnHeader.tsx`, `src/components/ColumnHeader.module.css`, `src/components/BaseColumn.module.css`

Moved classes that were only used by `ColumnHeader.tsx` out of `BaseColumn.module.css`:

- `.colHeaderLeft`, `.colIcon`, `.colControls`, `.lastUpdated`
- `.btnIcon`, `.btnIconSpinning`, `@keyframes spin` (were already duplicated into ColumnHeader.module.css)

Removed the now-redundant `import styles from "./BaseColumn.module.css"` from `ColumnHeader.tsx`.

### Faded outline on InlineEdit when unfocused

**File:** `src/components/ui/InlineEdit.module.css`

Added `outline: 1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)` as the base state on the textarea, keeping the full `var(--color-accent)` outline on `:focus`.

---

## Group 3: IconName derived from ICON_MAP

**Files:** `src/components/ui/SvgIcon.tsx`, `src/types/index.ts`

`IconName` was a manually maintained union in `types/index.ts`. Now derived automatically:

```ts
// SvgIcon.tsx
export type IconName = keyof typeof ICON_MAP;
```

`types/index.ts` re-exports it for existing import sites:

```ts
export type { IconName } from "@/components/ui/SvgIcon";
```

---

## Group 4: GHEvent discriminated union + split mapEvent + FallbackCard wiring

**Files:** `src/types/github.ts`, `src/store/githubMappers.ts`, `src/types/index.ts`, `src/store/githubQueries.ts`, `src/components/columns/ActivityColumn.tsx`

### GHEvent discriminated union

Replaced the single `GHEvent` interface (with `type: string` and all-optional payload) with a union of 9 specific event types:

```ts
export type GHEvent =
  | GHPushEvent
  | GHPullRequestEvent
  | GHIssueCommentEvent
  | GHPRReviewCommentEvent
  | GHPRReviewEvent
  | GHIssuesEvent
  | GHCreateEvent
  | GHForkEvent
  | GHWatchEvent;
```

Each has a literal `type` field and a typed `payload`. No `GHUnknownEvent` in the union — a catch-all type can't have `type: string` without breaking switch narrowing.

### Split mapEvent into individual mappers

Each case branch now calls a dedicated function (`mapPushEvent`, `mapPullRequestEvent`, etc.). TypeScript narrows correctly. The `default` branch is unreachable to TS but handles runtime unknown event types by returning a `FallbackItem`.

### FallbackItem + FallbackCard wiring

`FallbackItem` gained a `type: "fallback"` discriminator. Unknown events from the GitHub API (hitting the `default` branch) are mapped to `FallbackItem` with the raw event type as `title`.

`useGetActivity` return type updated to `(ActivityItem | FallbackItem)[]`. `ActivityColumn` dispatches on `i.type === "fallback"` to render `FallbackCard` vs `ActivityCard`.

---

## Verification

- `npm run build` — clean TypeScript + Vite build
- `npm test` — 260/260 tests passing (updated 2 tests: one for PullRequestEvent fixture, one for unsupported event type now returning FallbackItem)
