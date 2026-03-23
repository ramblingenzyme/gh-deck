# Auto-refresh / Polling & Manual Refresh

## Goal

Users should not have to reload the page to see fresh data. Each column should poll automatically and expose a manual refresh button.

## What was implemented

### Auto-polling (`src/hooks/useColumnData.ts`)

Added `pollingInterval: 5 * 60 * 1000` (5 minutes) to all RTK Query hooks:

- `useGetPRsQuery`
- `useGetIssuesQuery`
- `useGetNotificationsQuery`
- `useGetCIRunsQuery`
- `useGetActivityQuery`

Also exposed `isFetching` and `refetch` from the active query in `UseColumnDataResult`.

### Manual refresh button (`src/components/Column.tsx`)

Added a ↻ button to each column header (left of ⚙). On click:

- Calls `refetch()` on the column's active RTK Query.
- Sets local `spinning` state for 800ms to guarantee at least one full icon rotation.
- The icon also spins while `isFetching` is true (e.g. during auto-poll or slower requests).

### Spin animation (`src/components/Column.module.css`)

Added `.btnIconSpinning` class that applies a `spin` keyframe animation to the `Icon` child element (not the button itself, to avoid the hover background rectangle rotating with the icon). The accent color is preserved on hover while spinning via `.btnIconSpinning:hover`.

## Decisions & notes

- **GitHub events API (activity column)**: The `/users/{login}/events` endpoint uses ETags and returns `304 Not Modified` on repeat requests. RTK Query respects this cached response — `isFetching` resolves instantly. The 800ms minimum spin on click means the button still gives clear feedback regardless.
- The spin animation targets `> *` (the inner `<span>` from `Icon`) so the button's rectangular hover background stays static.
