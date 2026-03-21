# CI/CD Status Left Border & Card Meta Gap

## Context

CI and Deployment cards communicated status solely through a coloured badge (icon + label + tinted background) in the card footer. A coloured left border is a more immediate, scannable signal. The badge background tint was removed as redundant once the border carries the status colour — the icon and label text remain for legibility.

A secondary issue: `.cardMeta` had no gap between its flex children, causing the left-side text and right-side badge to butt up against each other and wrap uncomfortably when the left content was long.

## What Was Built

### Left border on status classes

Both card types already apply a status class directly to the `<article>` via `Card`'s `className` prop, and each class sets a CSS custom property (`--ci-color` / `--deploy-color`). The border is added directly to those classes.

**`src/components/cards/CICard.module.css`**
- Added `border-left: 3px solid var(--ci-color)` to `.success`, `.failure`, `.running`
- Removed `background: color-mix(...)` from `.ciBadge`

**`src/components/cards/DeploymentCard.module.css`**
- Added `border-left: 3px solid var(--deploy-color)` to `.success`, `.failure`, `.pending`, `.in_progress`
- Removed `background: color-mix(...)` from `.deployBadge`

### Card meta gap

**`src/components/cards/Card.module.css`**
- Added `gap: 8px` to `.cardMeta` — ensures breathing room between the left-side text and right-side badge across all card types that use `CardMeta`

## Files Modified

| File | Change |
|------|--------|
| `src/components/cards/CICard.module.css` | `border-left` on status classes; removed badge background |
| `src/components/cards/DeploymentCard.module.css` | `border-left` on status classes; removed badge background |
| `src/components/cards/Card.module.css` | `gap: 8px` on `.cardMeta` |
