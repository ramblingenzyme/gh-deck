# Refactor CSS constants into CSS modules

**Status: Complete**

## Context
`src/constants/index.ts` contained color/styling data (`LABEL_COLORS`, `LABEL_FALLBACK`, `CI_STATUS` color/bg fields, `COLUMN_TYPES` color field) applied as inline `style={}` props in components. Moved these colors into CSS modules to keep styling in CSS files and use idiomatic CSS module class imports.

`NOTIF_ICONS`, `ACTIVITY_ICONS`, `mkId`, `DEFAULT_COLUMNS`, and the `label`/`icon` fields of `CI_STATUS`/`COLUMN_TYPES` remain in constants.

---

## CSS modules created

### `src/components/Column.module.css`
One class per column type, each setting `--color-accent`. Cascades through `globals.css` consumers (`.col-badge` border, icon color).

### `src/components/cards/Label.module.css`
One class per label name + a `.fallback` class.

### `src/components/cards/CICard.module.css`
One class per CI status setting `--ci-color` and scoping `.badge` colors. `globals.css` line 382 uses `var(--ci-color)` for the left border.

---

## Files modified

| File | Change |
|------|--------|
| `src/constants/index.ts` | Removed `LABEL_COLORS`, `LABEL_FALLBACK`; removed `color`/`bg` from `CI_STATUS`; removed `color` from `COLUMN_TYPES` |
| `src/components/Column.tsx` | Import `Column.module.css`; use `styles[col.type]` class; removed inline `--color-accent` and icon `color` |
| `src/components/AddColumnModal.tsx` | Removed inline `color: cfg.color` on icon span |
| `src/components/cards/PRCard.tsx` | Import `Label.module.css`; use `labelStyles[l] ?? labelStyles.fallback` |
| `src/components/cards/IssueCard.tsx` | Same as PRCard |
| `src/components/cards/CICard.tsx` | Import `CICard.module.css`; use `styles[item.status]` on root, `styles.badge` on badge span |
| `src/vite-env.d.ts` | Created — `/// <reference types="vite/client" />` for CSS module type declarations |
| `tsconfig.node.json` | Added `skipLibCheck: true` (was missing; `tsconfig.app.json` already had it) |
