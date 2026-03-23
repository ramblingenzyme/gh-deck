# Plan: CSS Cleanup — Global Button Reset, Token Gaps, Shared Card Icon

## Context

Three independent CSS smells remain after the cascade cleanup:

1. **`.btn` + `.btn:disabled` are copy-pasted into three component CSS modules** (`Board`, `Topbar`, `Column`) with identical rules — and `Column.module.css` has it as dead code (never referenced in `Column.tsx`). Every `<button>` in the app uses `all: unset`, so a global reset in `globals.css` eliminates the duplication entirely.

2. **Hardcoded hex values that should be tokens.** Two categories:
   - `#4ade80` in `Topbar.module.css` (`.statusDot`) — same value as the existing `--ci-success` token.
   - `#2a2a2a` appears in `AddColumnModal.module.css` (`.modal` border, `.typeBtn:hover` border) and `globals.css` (scrollbar thumb) — a mid-range border shade between the existing `--border-structural` (`#1a1a1a`) and `--border-card` (`#1f1f1f`). Needs a new token.

3. **`.notifIcon` and `.activityIcon` are identical rules** (`color: var(--text-muted); margin-right: 4px;`) duplicated in `NotifCard.module.css` and `ActivityCard.module.css`. They belong in `Card.module.css` as a shared `.cardIcon` class, just like `cardRepo`, `cardAge`, etc.

## Changes

### 1. Global `button` reset in `globals.css`

Add after the `* { box-sizing }` reset block:

```css
button {
  all: unset;
  box-sizing: border-box;
  cursor: pointer;
}
button:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}
```

**CSS modules — remove now-redundant declarations:**

- `Board.module.css`: delete `.btn` + `.btn:disabled`
- `Topbar.module.css`: delete `.btn` + `.btn:disabled`
- `Column.module.css`: delete `.btn` + `.btn:disabled`; strip `all: unset; box-sizing: border-box; cursor: pointer;` from `.btnIcon`; delete `.btnIcon:disabled` (global handles it)
- `AddColumnModal.module.css`: strip `all: unset; box-sizing: border-box; cursor: pointer;` from `.btnModal` and `.typeBtn`

**TSX — remove now-spurious `styles.btn` from classNames:**

- `Board.tsx`: `${styles.btn} ${styles.boardEmptyBtn}` → `${styles.boardEmptyBtn}`
- `Topbar.tsx`: `${styles.btn} ${styles.btnAdd}` → `${styles.btnAdd}`
- (`Column.tsx` and `AddColumnModal.tsx` never referenced `.btn` directly — no TSX change needed)

### 2. Token-ize remaining hardcoded hex values

**`globals.css` — add to `:root`:**

```css
--border-mid: #2a2a2a;
```

**Replace raw hex values:**

- `Topbar.module.css` `.statusDot`: `background: #4ade80` → `background: var(--ci-success)`
- `AddColumnModal.module.css` `.modal`: `border: 1px solid #2a2a2a` → `var(--border-mid)`
- `AddColumnModal.module.css` `.typeBtn:hover`: `border-color: #2a2a2a` → `var(--border-mid)`
- `globals.css` scrollbar thumb: `background: #2a2a2a` → `var(--border-mid)`

(`#161616` in `.typeBtn:hover background` and `#13131f` in `.typeBtn.active background` are one-off interactive tints with no token equivalent — leave them.)

### 3. Consolidate `.notifIcon` / `.activityIcon` → `.cardIcon`

**`Card.module.css`** — add:

```css
.cardIcon {
  color: var(--text-muted);
  margin-right: 4px;
}
```

**`NotifCard.module.css`** — remove `.notifIcon` (file retains only `.notifRef`)

**`ActivityCard.module.css`** — remove `.activityIcon` (file retains only `.activitySha`)

**`NotifCard.tsx`**: `styles.notifIcon` → `cardStyles.cardIcon`

**`ActivityCard.tsx`**: `styles.activityIcon` → `cardStyles.cardIcon`

## Files modified

- `src/globals.css`
- `src/components/Board.module.css` + `Board.tsx`
- `src/components/Topbar.module.css` + `Topbar.tsx`
- `src/components/Column.module.css`
- `src/components/AddColumnModal.module.css`
- `src/components/cards/Card.module.css`
- `src/components/cards/NotifCard.module.css` + `NotifCard.tsx`
- `src/components/cards/ActivityCard.module.css` + `ActivityCard.tsx`

## Status: COMPLETED 2026-03-17

Build: zero errors. All verification checks passed.
