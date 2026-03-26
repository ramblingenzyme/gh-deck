# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (http://localhost:5173)
npm run typecheck  # TypeScript type check only (no emit)
npm run build    # TypeScript check + Vite build
npm run lint     # Lint with oxlint
npm run format   # Format with oxfmt (2-space indent, 100-char line width, single quotes)
npm run preview  # Preview production build
npm test         # Run tests (vitest)
npm run test:watch  # Run tests in watch mode
```

## Tech Stack

This project uses TypeScript, CSS Modules, and OKLCH color space for design tokens. When working with colors, use oklch relative color syntax with alpha — not color-mix or solid oklch mixing which produces washed-out results.

## Architecture

**Octodeck** is a TweetDeck-style GitHub dashboard (prototype with mock data). React 19 + TypeScript + Vite, state via Zustand.

### Key data flow

- `src/types/index.ts` — `ColumnType` discriminated union (`prs | issues | ci | notifications | activity`) and item types
- `src/constants/index.ts` — `COLUMN_TYPES` config (labels/icons per type), `DEFAULT_COLUMNS`, `mkId()`
- `src/store/configApi.ts` — RTK Query API for column layout mutations (add, remove, move); persists to `localStorage` via `layoutStorage.ts`
- `test/fixtures/mock.ts` — Mock data arrays (`MOCK_PRS`, `MOCK_ISSUES`, etc.)

### Component tree

```
App.tsx (Redux + modal state)
├── Topbar.tsx
├── Board.tsx → Column.tsx (switch on col.type → card component)
│   └── cards/{PRCard,IssueCard,CICard,NotifCard,ActivityCard}.tsx
│       └── CardParts.tsx (CardContainer, CardHeader, CardBody, CardFooter)
└── AddColumnModal.tsx
```

`Column.tsx` uses an exhaustive switch on `col.type` to render the correct card — TypeScript enforces this at compile time via the discriminated union.

### Philosophy: HTML + CSS + Browser APIs first

Prefer native platform capabilities over JS implementations. Reach for JS only when HTML, CSS, or a browser API cannot handle it.

- **Semantic HTML**: use the element that matches the content — `<menu>`, `<output>`, `<dialog>`, `<details>`, `<time>`, etc. Do not replace semantic elements with `<div>` or `<span>`.
- **Browser APIs**: use the Popover API for overlays/tooltips, `<dialog>` for modals, `FormData` for form reads, `popover="auto"` for light-dismiss — not JS re-implementations.
- **Reusable components**: prefer writing small reusable components when UI elements get repeated. Write them in their own file if they'll be used across multiple files, either now or in the future. Otherise, define them within the same file and do not export them.
- **Uncontrolled inputs**: prefer `defaultValue` + `FormData` over controlled `value` + `useState` where live validation or derived UI is not needed.
- **CSS over JS for dynamic styling**: use CSS custom properties, `:has()`, `@container`, `data-*` attributes, and element/state selectors (`:checked`, `:open`, `:popover-open`) to drive visual state. Avoid computing styles in JS.
- **Element selectors in CSS**: style by element type (`button`, `input`, `h2`) within a component scope rather than adding wrapper classes everywhere.
- **`popover="hint"`**: fine to use. Firefox falls back to `popover="manual"` behaviour (no auto-dismiss when another popover opens), but this degrades gracefully. CSS anchor positioning is fine in all modern browsers.

### CSS

- All design tokens in CSS custom properties on `:root` in `globals.css`
- Each component has a companion `*.module.css` file
- No CSS-in-JS, no inline styles
- Per-column accent color set via `--color-accent` CSS variable

### Explicit over implicit

Prefer code that is correct by construction over code that relies on implicit guarantees that aren't visible at the call site. For example:

- **State resets**: when an action resets state, explicitly set every field to its reset value — don't rely on fields already being at their default. The action should be self-contained and correct regardless of what state preceded it.

### Fetch wrappers

Keep fetch wrappers thin — they should return `Response` directly and not throw on non-2xx status codes. Callers are responsible for checking `res.ok` and handling error cases themselves. Do not add a wrapper that re-centralises error throwing, as this defeats the purpose.

### Module structure

- No barrel files (`index.ts` that re-export other modules) — import directly by path.

### Path alias

`@/` maps to `src/` (configured in `vite.config.ts`).

## Code Style

Do not introduce new abstractions, helpers, or wrappers unless explicitly asked. When simplifying code, remove complexity — don't replace it with different complexity. If a user asks to remove a pattern, do not reintroduce an equivalent pattern under a different name.

## UI & Styling

When making UI/styling changes, make minimal targeted fixes. Do not over-engineer solutions (e.g., adding truncation when wrapping was fine). If something was working before, preserve that behavior unless explicitly told to change it.

## Debugging

When fixing bugs, identify the actual root cause before implementing a fix. Do not cycle through wrong hypotheses — read the error context carefully, check permissions/scopes, and verify assumptions before proposing solutions.

## Plans

Persist plans to `.claude/plans/YYYY-MM-DD-<description>.md`.

- Name example: `.claude/plans/2026-03-21-add-filter-tokens.md`
- Start with a **Context** section (why the change is needed), then list files to modify, reusable utilities, and a verification section.

## Tests

Tests live in `test/` mirroring `src/` structure (e.g. `src/utils/foo.ts` → `test/utils/foo.test.ts`).

- **Framework**: Vitest with `happy-dom` environment
- **Component tests**: `@testing-library/preact` — always call `afterEach(cleanup)`
- **Imports**: `describe`, `it`, `expect`, `vi` from `vitest`; `render`, `screen`, `userEvent` from `@testing-library/preact`
- **Fixtures**: shared mock data in `test/fixtures/mock.ts` (`MOCK_PRS`, `MOCK_ISSUES`, etc.)
- **Mocks**: `vi.fn()` for callbacks; prefer `vi.spyOn` over module-level mocks
- **Assertions**: test via semantic roles (`role="article"`, `role="button"`) not implementation details
- **Coverage**: `npm test -- --coverage`
- **After changes**: always run `npm run typecheck` to check for type errors, then `npm test` to check for failures; update existing tests that break due to interface changes and write new tests for new behaviour

Run a single test file: `npm test -- test/utils/queryFilter.test.ts`

## Working With Me

When the user gives feedback or a correction, apply it precisely to the thing they're referencing. Do not generalize the feedback to other parts of the code or make additional unrequested changes. Ask for clarification if the scope is ambiguous.

Don't assume that changes made inbetween messages are from the linter. They are almost certainly changes made by the user.
