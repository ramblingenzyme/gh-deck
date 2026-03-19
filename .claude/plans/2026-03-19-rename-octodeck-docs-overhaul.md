# Rename to Octodeck + Documentation Overhaul

## Context

The app was called "HubDeck". Renamed to "Octodeck" — a nod to GitHub's Octocat and the TweetDeck-style deck format. Docs were stale (README listed implemented features as deferred, SETUP.md duplicated README, CLAUDE.md duplicated architecture). Goal: a README focused on *what and why*, a lean CLAUDE.md with only Claude-specific guidance, and consistent "Octodeck" branding everywhere. A SVG logo mark was also added to the topbar.

## Changes

### Rename: HubDeck → Octodeck

| File | Change |
|------|--------|
| `package.json` | `"name": "octodeck"` |
| `index.html` | `<title>Octodeck</title>` |
| `src/components/Topbar.tsx` | Logo text → `Octodeck` |
| `CLAUDE.md` | Updated branding, corrected mock data path |
| `README.md` | Full rewrite |

### Deleted

- `SETUP.md` — duplicated README content, stale

### README rewrite

Human-readable project overview: what it is, what it does, current status, quick start, commands. No component tree, no CSS architecture, no type details.

### CLAUDE.md trim

Removed stale "deferred features" and architecture content now covered by README. Corrected mock data path to `src/test/fixtures/mock.ts`. Updated branding to "Octodeck".

### SVG logo

- New component: `src/components/OctodeckLogo.tsx` — geometric octopus mark (circle head, dot eyes, 4 tentacles), renders in `currentColor`
- Rendered at 29px in the topbar, 2px gap before the wordmark
- Topbar logo CSS updated to `display: flex; align-items: center`
