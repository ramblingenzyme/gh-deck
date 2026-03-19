# Plan: Lighter Dark Mode

## Context

The original dark palette (`#080808` root, `#0d0d0d` columns, `#111111` cards) was too dark — near-black backgrounds reduced contrast and made the UI feel oppressive. The goal was to raise background brightness, improve text contrast ratios to WCAG AAA where possible, and make border visibility meet WCAG Non-Text Contrast (1.4.11) at meaningful levels.

## Changes made

All changes are in `src/globals.css` only. No component, layout, or CSS module changes were needed.

### Background tokens

| Token | Old | New |
|---|---|---|
| `--bg-root` | `#080808` | `#13131a` |
| `--bg-topbar` | `#111827` | `#1a1f2e` |
| `--bg-column` | `#0d0d0d` | `#16161f` |
| `--bg-card` | `#111111` | `#1c1c28` |
| `--bg-hover` | `#161616` | `#20202e` |

### Text tokens

`--text-faint` was consolidated into `--text-ghost` (the two tokens were only ~1.07:1 apart — imperceptibly different). All usages migrated to `--text-ghost`.

All text tokens now meet WCAG AAA (7:1) on `--bg-card`:

| Token | Old | New | Ratio on bg-card |
|---|---|---|---|
| `--text-muted` | `#8a95a5` | `#a8b8cb` | ~8.3:1 |
| `--text-ghost` | `#6e7f90` | `#93adc2` | ~7.2:1 |
| ~~`--text-faint`~~ | `#748291` | removed | — |

`--text-primary` (`#e5e7eb`, 13.6:1) and `--text-secondary` (`#d1d5db`, ~11.5:1) were already AAA — left unchanged.

### Border tokens

Borders are seen against `--bg-column` (L≈0.008). Targeting WCAG 1.4.11 Non-Text Contrast (3:1) for interactive/prominent borders, with structural borders kept subtler:

| Token | Old | New | Ratio on bg-column |
|---|---|---|---|
| `--border-structural` | `#1a1a1a` | `#565670` | ~2.5:1 |
| `--border-card` | `#1f1f1f` | `#585870` | ~2.5:1 |
| `--border-mid` | `#2a2a2a` | `#626278` | ~3.0:1 |
| `--border-hover` | `#3a3a3a` | `#7a7a9a` | ~3.9:1 |

Structural and card borders were intentionally kept at 2.5:1 (subtle outlines); mid and hover borders meet the 3:1 non-text contrast threshold.

### Files changed

- `src/globals.css` — all token values above
- `src/components/Topbar.module.css` — `--text-faint` → `--text-ghost`
- `src/components/cards/Card.module.css` — `--text-faint` → `--text-ghost`
- `src/components/AuthModal.module.css` — `--text-faint` → `--text-ghost`
