# Fix: CSS Modules nested class names resolving to `undefined`

## Problem

CSS Modules only exports top-level class selectors. Classes defined via `&Suffix` nesting (e.g. `&Spinning` inside `.btnIcon`) are not exported, so `styles.btnIconSpinning` resolves to `undefined` at runtime. This caused the refresh button animation to never apply, and the Add Column modal's primary button to lose its styles.

## Root cause

The "Refactor to use CSS nesting" commit introduced SASS-style `&Suffix` concatenation (e.g. `.btnIcon { &Spinning { ... } }`). This is valid in SASS/LESS but CSS Modules only exports identifiers that appear as standalone top-level selectors.

## Files changed

- `src/components/BaseColumn.module.css` — extracted `&Spinning` → `.btnIconSpinning`, `&Active` → `.btnIconActive`
- `src/components/ui/Modal.module.css` — extracted `&Primary` → `.btnModalPrimary`, `&Danger` → `.btnModalDanger`
- `src/hooks/useRefreshSpinner.ts` — added fallback timer so the spinner stops in demo mode (where `isFetching` never transitions)
- `src/components/BaseColumn.module.css` — changed `rotate: 360deg` → `transform: rotate(360deg)` in `@keyframes spin` for consistent SVG support

## Rule going forward

Never define CSS Module class names via `&Suffix` nesting. Only `&:pseudo`, `& >`, `& +` etc. (combinators and pseudo-classes) are safe to nest. New class names must be standalone top-level selectors.
