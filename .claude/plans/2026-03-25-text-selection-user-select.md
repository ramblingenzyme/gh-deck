# Plan: Text selection color & user-select: none

## Context

The app had no custom `::selection` style, so text selection fell back to the browser default (usually blue), clashing with the dark OKLCH-based design. Several interactive UI elements also allowed text selection by default, which feels wrong when clicking/dragging chrome elements.

Two goals:

1. Add a custom `::selection` color that fits the palette.
2. Apply `user-select: none` to UI chrome that shouldn't be selectable.

---

## 1. Custom `::selection` color

**`src/globals.css`** — accent color at 35% opacity for the background:

```css
::selection {
  background-color: oklch(0.7 0.16 265 / 0.35);
  color: var(--text-primary);
}
```

Also added `text-decoration-color: var(--border-mid)` to `.cardTitle a:hover` in `Card.module.css` to prevent the underline from turning accent-colored when a hovered link is selected.

---

## 2. `user-select: none` — what got it and where

### Global reset (`src/globals.css`)

- `button` — all buttons are chrome, never prose

### Shared modal styles (`src/components/ui/Modal.module.css`)

- `.modal > header` — modal titles
- `.modal label` and `.fieldLabel` — field labels in all modals (uppercase metadata, not copyable content)

### Component-level

| File                         | Selector                       | Rationale                                  |
| ---------------------------- | ------------------------------ | ------------------------------------------ |
| `Topbar.module.css`          | `.topbar`                      | Entire topbar is chrome                    |
| `Board.module.css`           | `.boardEmpty`, `.boardLoading` | State messaging, not prose                 |
| `Card.module.css`            | `& header`, `& footer`         | Card chrome (repo name, stats, timestamps) |
| `cards/Label.module.css`     | `.label`                       | Decorative chips                           |
| `cards/CardParts.module.css` | `.cardRepo`                    | Repo name metadata                         |

### Already present (unchanged)

- `ColumnHeader.module.css` — column header
- `ui/RepoChipList.module.css` — chips and suggestions

### Not given `user-select: none`

- Card titles / PR titles / issue bodies — users may want to copy
- Modal text inputs — must stay selectable
- `<time>` and descriptive text in cards

---

## Verification

- Start dev server: `npm run dev`
- Select text in a card title — selection appears in accent-tinted color
- Hover a card title link while selecting — underline stays muted, not accent-colored
- Click rapidly on topbar, column header, card footer stats — no text selection highlight
- Open Add Column modal — title and field labels are not selectable; inputs are
- Run `npm test` — no failures expected (purely visual change)
