# Refactor CSS to Full CSS Modules

**Status: Complete**

## Context
The codebase mixed CSS module imports (for variant/dynamic styles) with raw string class names referencing `globals.css`. Moved all component class definitions into per-component CSS modules for IDE autocomplete, dead-code detection, and clear per-component ownership.

---

## CSS modules created / modified

### New shared card base: `src/components/cards/Card.module.css`
`.card`, `.cardTop`, `.cardRepo`, `.cardAge`, `.cardTitle`, `.cardMeta`, `.cardAuthor`, `.cardStat`, `.cardStats`

### New per-card modules
| File | Classes |
|---|---|
| `PRCard.module.css` | `.draftBadge`, `.labelList`, `.label` |
| `IssueCard.module.css` | `.labelList`, `.label` |
| `NotifCard.module.css` | `.notifIcon`, `.notifRef` |
| `ActivityCard.module.css` | `.activityIcon`, `.activitySha` |

### Extended existing modules
| File | Classes added |
|---|---|
| `CICard.module.css` | `.ciCard`, `.ciBadge` |
| `Column.module.css` | `.column`, `.colHeader`, `.colHeaderLeft`, `.colIcon`, `.colTitle`, `.colBadge`, `.colControls`, `.colBody`, `.colConfirmation`, `.colConfirmationText`, `.colConfirmationButtons`, `.btnIcon`, `.btn` |

### New component modules
| File | Classes |
|---|---|
| `App.module.css` | `.appRoot` |
| `Board.module.css` | `.board`, `.boardEmpty`, `.btn` |
| `Topbar.module.css` | `.topbar`, `.topbarLeft`, `.topbarLogo`, `.topbarStatus`, `.statusDot`, `.btn` |
| `AddColumnModal.module.css` | `.modalOverlay`, `.modal`, `.modalHeader`, `.modalTitle`, `.modalBody`, `.modalTypes`, `.modalField`, `.modalFieldLabel`, `.modalFooter`, `.btnModal`, `.btnModalPrimary`, `.typeBtn`, `.fieldInput`, `.colIcon`, `.active` |

---

## CSS naming convention
Kebab-case converted to camelCase: `card-top` → `.cardTop`, `btn-icon` → `.btnIcon`, etc.

## What stays in `globals.css`
Only `:root` CSS custom properties, CSS reset, and scrollbar styles.

## Notes
- `AddColumnModal` still imports `Column.module.css` as `colStyles` to access the `.prs`, `.issues`, `.ci`, `.notifications`, `.activity` color-accent classes for the type selector buttons.
- `Label.module.css` unchanged — label variant colors stay there.

---

## Files modified

| File | Change |
|------|--------|
| `src/globals.css` | Removed all component class definitions |
| `src/components/App.tsx` | Import `App.module.css`; use `styles.appRoot` |
| `src/components/Board.tsx` | Import `Board.module.css`; use module classes |
| `src/components/Topbar.tsx` | Import `Topbar.module.css`; use module classes |
| `src/components/Column.tsx` | Extended `Column.module.css` usage; all raw class strings replaced |
| `src/components/AddColumnModal.tsx` | Import `AddColumnModal.module.css`; keep `colStyles` from `Column.module.css` for type colors |
| `src/components/cards/PRCard.tsx` | Import `Card.module.css` + `PRCard.module.css` |
| `src/components/cards/IssueCard.tsx` | Import `Card.module.css` + `IssueCard.module.css` |
| `src/components/cards/CICard.tsx` | Import `Card.module.css`; use new `.ciCard`/`.ciBadge` classes |
| `src/components/cards/NotifCard.tsx` | Import `Card.module.css` + `NotifCard.module.css` |
| `src/components/cards/ActivityCard.tsx` | Import `Card.module.css` + `ActivityCard.module.css` |

---

# Plan: Refactor Inline Styles into CSS Classes

**Status: Complete (2026-03-17)**

## Context
After the full CSS modules migration above, 14 inline `style={{}}` props remained across 5 files. Migrated to named CSS classes for traceability, autocomplete, and consistency.

## Inline styles migrated

### `Board.tsx` — empty state container
| New class | Properties |
|---|---|
| `.boardEmptyInner` | `text-align: center` |
| `.boardEmptyIcon` | `font-size: 36px; margin-bottom: 12px` |
| `.boardEmptyText` | `font-size: 12px; margin-bottom: 16px` |
| `.boardEmptyBtn` | `font-size: 11px` (composed with `.btn`) |

### `Topbar.tsx` — add column button
`.btnAdd { font-size: 12px }` added to `Topbar.module.css`.

### `Column.tsx` — confirmation buttons
| New class | Properties |
|---|---|
| `.btnConfirmCancel` | `font-size: 10px; color: var(--text-muted); padding: 2px 6px` |
| `.btnConfirmDanger` | `font-size: 10px; color: var(--ci-failure); padding: 2px 6px` |

### `PRCard.tsx` — review stat colors
- Approved/neutral conditional → `cardStatApproved` / `cardStatNeutral` ternary
- Pending → `.cardStatPending`
- Comment count → `.cardStatNeutral`

### `IssueCard.tsx` — comment stat color
`style={{ color: "#6b7280" }}` → `.cardStatNeutral` from `Card.module.css`

### `CICard.tsx` — duration stat + badge wrapper
- Duration span → `.cardStatNeutral`
- Badge wrapper `marginTop: 6px` → `.ciBadgeWrapper` in `CICard.module.css`

## CSS variable aliases
- `#4ade80` = `var(--ci-success)`
- `#f87171` = `var(--ci-failure)`
- `#fbbf24` = `var(--ci-running)`
- `#6b7280` = `var(--text-muted)`

## Verification
- `npm run build` — passed
- `grep style={{` in `src/**/*.tsx` — zero results
