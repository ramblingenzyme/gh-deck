# Context

Security alerts were returning 403 because the OAuth device flow requested the scope `"repo notifications read:user"`, which does not include `security_events` — required by the GitHub Dependabot alerts API (`/repos/{owner}/dependabot/alerts`). Investigation also revealed that `githubFetch` was throwing on non-2xx responses (preventing callers from inspecting status codes), and that several multi-repo query hooks silently swallowed per-repo fetch errors so failures never surfaced in the column UI.

## Changes

### 1. OAuth scope — `src/auth/deviceFlow.ts`
Added `security_events` to the requested scope string. Existing tokens lack this scope; users must log out and re-authenticate. The column error UI surfaces the resulting 403 automatically.

### 2. `githubFetch` — `src/store/githubClient.ts`
Made the wrapper thin: removed the generic type parameter, removed the `!res.ok` throw, returns `Promise<Response>` directly. Callers own response handling.

### 3. Call sites — `src/store/githubQueries.ts`
Each call site now checks `res.ok` and calls `res.json()` directly. Removed all silent `try/catch` blocks in the multi-repo fetchers (`useGetCIRuns`, `useGetReleases`, `useGetDeployments`, `useGetSecurityAlerts`) so errors propagate to SWR and surface in `BaseColumn`'s existing error UI.

Exception: the deployment status secondary fetch keeps a catch but falls back to `"unknown"` (not `"pending"`) to distinguish a failed status lookup from a genuinely queued deployment.

### 4. `"unknown"` deployment status
- `src/types/index.ts` — added `"unknown"` to `DeploymentStatus` union
- `src/constants/index.ts` — added `unknown` entry to `DEPLOYMENT_STATUS` record
- `src/components/cards/DeploymentCard.module.css` — added `.unknown` class (muted, same as `.pending`)

## Verification

1. `npm run build` — no TypeScript errors
2. `npm test` — all 282 tests pass
