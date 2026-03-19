# Plan: Remove user from authSlice

## Context

`authSlice` currently stores `user: AuthUser | null` alongside auth machine state (`status`, `token`). This duplicates data that RTK Query already holds in its own cache via the `getUser` endpoint. The duplication is bridged by a `useEffect` in `App.tsx` that watches `userData` from RTK Query and dispatches `userLoaded` into the slice — a known anti-pattern that creates a stale-state risk.

The fix is to remove `user` from `authSlice` so it owns only pure auth machine state (`status`, `token`, device flow fields, `error`), and have consumers read user profile directly from the RTK Query cache.

The second minor issue (all 5 `useGet*Query` hooks mounting per column regardless of type) is not worth addressing — RTK Query deduplicates network requests and the hook-slot cost is negligible for this app.

## Changes

### 1. `src/store/authSlice.ts`
- Remove `user: AuthUser | null` from `AuthState`
- Remove `userLoaded` reducer
- Remove `user: null` from `initialState` and `logOut` reducer
- Keep `AuthUser` type exported (still used as `getUser` return type in `githubApi.ts`)

### 2. `src/store/githubApi.ts`
- Move `AuthUser` definition here instead of importing from `authSlice` — co-locating with `getUser` is cleaner
- Export `AuthUser` for any consumers

### 3. `src/components/App.tsx`
- Remove `userLoaded` import
- Remove the `useEffect` that dispatches `userLoaded(userData)`
- Remove the `useGetUserQuery` call (no longer needed here)

### 4. `src/components/Topbar.tsx`
- Replace `useAppSelector((s) => s.auth)` + `auth.user` reads with:
  - Keep `useAppSelector` for `auth.status` only
  - Add `const { data: user } = useGetUserQuery(undefined, { skip: status !== 'authed' })`
  - Replace all `auth.user!.xxx` → `user.xxx` (narrowed via `authed` guard)
  - Update `authed` guard: `status === 'authed' && user`

### 5. `src/hooks/useColumnData.ts`
- Replace `useAppSelector((s) => s.auth.user?.login ?? "")` with:
  - `const { data: user } = useGetUserQuery(undefined, { skip: demo || !token })`
  - `const login = user?.login ?? ""`

## Files modified
- `src/store/authSlice.ts`
- `src/store/githubApi.ts`
- `src/components/App.tsx`
- `src/components/Topbar.tsx`
- `src/hooks/useColumnData.ts`

## Status: Implemented ✓

Build and all 68 tests pass.
