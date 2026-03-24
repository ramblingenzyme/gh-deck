# Context

We want to review all uses of `opacity`, `transparent`, and `color-mix()` in the CSS, understand what each is actually doing, and determine whether the right technique is being used for each purpose.

---

## What the code is actually doing

### `opacity` — correct in all cases

`opacity` expresses **"this element is less present"** — it dims the element as a whole, including all its colours, borders, shadows, and children, uniformly. It is the right property when the intent is to communicate a state about the element's existence or prominence, not to change the colour of anything inside it.

The 16 uses all fall cleanly into this category:

| Use                                       | Semantics                                                                                                                |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `button:disabled { opacity: 0.25 }`       | The button is unavailable. Dimming the whole control communicates "not interactable" without touching its colour scheme. |
| `.columnDragging { opacity: 0.5 }`        | The column is being dragged. The semi-transparent "ghost" communicates "in motion, not in its final position".           |
| Skeleton pulse (`0.4 → 0.8`)              | The placeholder card is breathing in/out to signal loading. The animation is about presence, not colour.                 |
| Warning banner dismiss button (`0.7 → 1`) | The button is secondary to the message; it fades in on hover to invite interaction.                                      |
| Drag handle (`0.2 → 0.5 → 1`)             | The handle is hidden until you look for it, then revealed progressively.                                                 |
| Hover dimming on buttons (`0.85–0.9`)     | Slight darkening on hover to acknowledge the interaction without changing the button's colour.                           |
| Pencil icon (`0 → 0.8`)                   | The icon is invisible until the row is focused/hovered, then revealed.                                                   |
| Tooltip (`0 → 1`)                         | Show/hide transition — the tooltip's presence is what changes, not its colour.                                           |

In every case, `opacity` is changing how _present_ an element appears, not what colour it is. That is exactly the right use of the property.

### `rgba(0,0,0,N)` and box-shadows — correct

The five `rgba` uses are for modal backdrops and box-shadows against a known black. These are correct.

### `background: transparent` / `border: ... transparent` — correct

Literal "no background" and placeholder border spacing. Both correct.

### `color-mix(in srgb, color X%, transparent)` — **not what it looks like**

This is the pattern used for all tinted backgrounds and borders (17 instances). The intent in each case is clearly a subtle tint of the accent/status/label colour — a common design pattern for badges, banners, and focus outlines.

**What it actually does:** `transparent` in CSS is `rgba(0, 0, 0, 0)`. Mixing in sRGB without premultiplied alpha means _both_ the RGB channels and the alpha channel are interpolated linearly. So:

```
color-mix(in srgb, #f87171 12%, transparent)
  → rgba(0.12 × 248, 0.12 × 113, 0.12 × 113, 0.12)
  → rgba(29.8, 13.6, 13.6, 0.12)
```

When composited over `--bg-card` (`#1c1c28` = rgb(28, 28, 40)):

```
final ≈ 0.12 × rgb(29.8, 13.6, 13.6) + 0.88 × rgb(28, 28, 40)
      ≈ rgb(28.2, 26.2, 36.8)   ← barely reddish
```

**What "12% opacity of the colour" would look like** using `rgb(from #f87171 r g b / 0.12)`:

```
final ≈ 0.12 × rgb(248, 113, 113) + 0.88 × rgb(28, 28, 40)
      ≈ rgb(54.4, 38.2, 48.8)   ← noticeably reddish
```

The current approach gives ~8× less colour contribution than the percentage implies. The numbers are slightly tuned to compensate, but the result is still more washed-out than intended.

---

## Correct approaches for tinted backgrounds

**Option A — relative colour syntax (semi-transparent)**

```css
/* colour at X% opacity, composited over whatever is behind it */
rgb(from var(--color-accent) r g b / 0.12)
oklch(from var(--label-color) l c h / 0.18)  /* preserves hue better */
```

Pros: portable, adapts to any background.
Cons: colour varies slightly depending on stacking context.

**Option B — mix with the background colour (solid)**

```css
/* blended solid colour — perceptually uniform, no compositing issues */
color-mix(in oklch, var(--color-accent) 12%, var(--bg-card))
```

Pros: solid colour, predictable, no stacking-context dependency. Works well for badges/banners sitting on a known background.
Cons: couples the tint to a specific background variable.

Given that this is a fixed dark theme where every component's background is a known CSS variable, **Option B is the better fit**. It produces solid, predictable colours and is more in line with the project's "explicit over implicit" philosophy.

For `--label-color` (which can be any arbitrary colour, and whose background is always `--bg-card`), Option B also works and is preferred over Option A, using `oklch` for perceptually uniform mixing.

---

## Plan

### Changes

Replace all `color-mix(in srgb, var(--x) N%, transparent)` and `color-mix(in oklch, var(--x) N%, transparent)` calls with `color-mix(in oklch, var(--x) N%, <background-var>)`, using the appropriate background CSS variable for each context.

Background variable mapping:

- `.colQuery`, `.repoCount`, `.btnConfirmDanger`, `.warningBanner`, `.errorState` (BaseColumn) → `var(--bg-column)`
- `.ColumnHeader` border → `var(--bg-column)`
- `InlineEdit` outline → `var(--bg-card)` (sits inside a card)
- `RepoChipList` suggestion chip → `var(--bg-card)`
- `Label` (colored + fallback) → `var(--bg-card)`
- `ReleaseCard` / `SecurityCard` badges → `var(--bg-card)`

Use `in oklch` throughout for perceptually uniform mixing (oklch is already used in Label.module.css).

### Percentage values

The existing percentages were likely bumped up to partially compensate for the weakened effect. After switching to solid mixing, visually review and re-tune them — expect they'll need to come down somewhat (e.g. 12% may become 8–10%).

### Files to modify

1. `src/components/BaseColumn.module.css` — 10 occurrences
2. `src/components/ColumnHeader.module.css` — 1 occurrence
3. `src/components/ui/RepoChipList.module.css` — 1 occurrence
4. `src/components/ui/InlineEdit.module.css` — 1 occurrence
5. `src/components/cards/Label.module.css` — 3 occurrences
6. `src/components/cards/ReleaseCard.module.css` — 1 occurrence
7. `src/components/cards/SecurityCard.module.css` — 1 occurrence

---

## Verification

1. `npm run build` — passes
2. `npm run dev` — visual inspection:
   - Column query bar has subtle accent tint
   - Warning banner has amber tint
   - Error/danger states have red tint
   - Labels have coloured tinted backgrounds
   - Severity and pre-release badges are tinted correctly
   - InlineEdit focus outline shows accent tint
3. `npm test` — all tests pass
