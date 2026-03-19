# Octodeck

TweetDeck for GitHub — monitor PRs, issues, CI, and activity across your repos from one configurable dashboard.

## What it does

- Multi-column dashboard (like TweetDeck) for GitHub activity
- Column types: Pull Requests, Issues, CI/CD, Notifications, Activity
- Drag to reorder, add/remove columns, per-column filter queries
- GitHub OAuth via device flow
- Dark theme with per-column accent colors

## Status

Working prototype — currently runs on mock data. Real GitHub API integration is scaffolded and ready.

## Quick Start

```bash
npm install && npm run dev  # → http://localhost:5173
```

## Commands

```bash
npm run dev      # Start dev server
npm run build    # TypeScript check + Vite build
npm run lint     # Lint with oxlint
npm run format   # Format with oxfmt
npm test         # Run tests
npm run preview  # Preview production build
```
