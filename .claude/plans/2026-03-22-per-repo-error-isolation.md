# Plan: Per-repo error isolation with dismissable warnings

## Context

Four multi-repo query hooks (`useGetCIRuns`, `useGetReleases`, `useGetDeployments`, `useGetSecurityAlerts`) used `Promise.all` — a single repo failure (e.g. 403 on a public repo where the user lacks write access) would throw and fail the entire column. Dependabot alerts in particular require write access to the repo; no OAuth scope grants access to repos you don't own.

The fix: switch to `Promise.allSettled` so repos that succeed still render, surface per-repo failures as a dismissable warning banner below the column header, and show actionable error messages keyed to HTTP status codes.

## Files modified

- `src/store/githubQueries.ts` — extracted `repoFetchError(repo, res)` for human-readable status messages and `fetchPerRepo<T>(repos, fetcher)` helper using `Promise.allSettled`; changed SWR return type from `T[]` to `{ items: T[]; fetchErrors: string[] }` for the 4 multi-repo hooks
- `src/hooks/useColumnData.ts` — added `warnings: string[]` to `UseColumnDataResult`; added `toMultiResult()` helper that unwraps `{ items, fetchErrors }`; wired the 4 multi-repo column types through `toMultiResult`
- `src/components/BaseColumn.tsx` — added `warnDismissed` state; renders a warning banner (`role="alert"`) between the header and card list when `warnings.length > 0 && !warnDismissed`, with a dismiss `×` button
- `src/components/BaseColumn.module.css` — added `.warningBanner` using `--ci-running` (orange) colour token

## Key decisions

- `fetchPerRepo` slices to 5 repos and maps the fetcher — the `repos.slice(0, 5)` cap that existed before is preserved inside the helper
- Deployment status fetches (the second-level `Promise.all` per deployment) are unchanged — they already fall back to `"unknown"` on failure and don't throw
- Single-repo columns (PRs, issues, notifications, activity) are unaffected and return `warnings: []`
- Warning dismissal is local component state — re-mounts or repo config changes reset it; no persistence needed
