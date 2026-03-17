# Plan: Use the Cascade

## Context
The codebase fights the cascade rather than using it. The main symptom: `font-family: var(--font-mono)` is explicitly redeclared on every button and input, even though `all: unset` for *inherited* CSS properties resolves to `inherit` (not `initial`). Since `font-family` is inherited and `.appRoot` already sets `font-family: var(--font-mono)`, any descendant using `all: unset` already inherits the right font-family — the explicit declarations are noise.

Additionally, `.cardStat` and `.cardStatNeutral` in `Card.module.css` are identical — a leftover duplicate from the inline style migration.

And `.labelList` / `.label` are defined verbatim in both `PRCard.module.css` and `IssueCard.module.css` — they should live once in `Label.module.css`, which both cards already import.

## Changes

### 1. Remove redundant `font-family` declarations from button/input classes
`all: unset` sets inherited properties to `inherit`. `font-family` is inherited. `.appRoot` sets `font-family: var(--font-mono)`. Therefore all descendants already inherit it.

Remove `font-family: var(--font-mono)` from:
- `.btn` in `Board.module.css`
- `.btn` in `Topbar.module.css`
- `.btn` in `Column.module.css`
- `.btnModal` in `AddColumnModal.module.css`
- `.typeBtn` in `AddColumnModal.module.css`
- `.fieldInput` in `AddColumnModal.module.css`

### 2. Remove `.cardStatNeutral` from `Card.module.css`
Identical to `.cardStat` (`color: var(--text-muted)`). Delete it and replace all usages with `.cardStat`:
- `PRCard.tsx` — 2 occurrences (neutral branch of ternary + comment span)
- `IssueCard.tsx` — 1 occurrence
- `CICard.tsx` — 1 occurrence

### 3. Consolidate `.labelList` and `.label` into `Label.module.css`
Both are duplicated verbatim in `PRCard.module.css` and `IssueCard.module.css`. Move them to `Label.module.css` (already imported as `labelStyles` by both cards).

- Add `.labelList` and `.label` to `Label.module.css`
- Remove them from `PRCard.module.css`
- Remove them from `IssueCard.module.css` (file becomes empty — delete it)
- Update `PRCard.tsx`: `styles.labelList` / `styles.label` → `labelStyles.labelList` / `labelStyles.label`
- Update `IssueCard.tsx`: same swap; remove the `IssueCard.module.css` import

## Files to modify
- `src/globals.css` or `App.module.css` — no changes needed (`.appRoot` already sets `font-family`)
- `src/components/Board.module.css`
- `src/components/Topbar.module.css`
- `src/components/Column.module.css`
- `src/components/AddColumnModal.module.css`
- `src/components/cards/Card.module.css`
- `src/components/cards/PRCard.tsx` + `PRCard.module.css`
- `src/components/cards/IssueCard.tsx`
- `src/components/cards/IssueCard.module.css` — delete
- `src/components/cards/CICard.tsx`
- `src/components/cards/Label.module.css`

## Verification
1. `npm run build` — zero TS/CSS errors
2. Grep `font-family` in `src/components/**/*.css` — only `.appRoot`, `.topbarLogo`, `.colTitle`, `.modalTitle`, `.activitySha`, `.ciBadge` should remain (semantic overrides, not restatements of the default)
3. Grep `cardStatNeutral` — zero results
4. Grep `IssueCard.module.css` — zero results
