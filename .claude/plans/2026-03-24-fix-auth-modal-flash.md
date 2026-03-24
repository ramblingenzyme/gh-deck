# Fix auth modal flash on load when logged in

## Context

On initial load, `authStatus` started as `"idle"`, causing the auth modal to open immediately (`useModal(!isDemoMode && authStatus === "idle")` evaluated to `true`). The `useEffect` then asynchronously called `fetchSession()`, and if the user had a valid session cookie, `authSuccess()` fired and closed the modal — creating a brief flash for logged-in users. Additionally, all auth logic lived directly in `App.tsx`.

The fix introduces a `"loading"` status ("we don't know yet"), extracts all auth logic into a `useAuth` hook, and adds a loading UI while the session check is in flight.

## Files modified

- `src/store/authStore.ts` — added `"loading"` to `AuthStatus`, changed initial status to `"loading"`, added `authFailed()` (resets to idle, explicitly clears `sessionId` and `error`)
- `src/hooks/useAuth.ts` — new hook encapsulating session bootstrap, modal state, sign-out, and SWR error handling
- `src/components/App.tsx` — simplified to use `useAuth()`; removed auth imports
- `src/components/Board.tsx` — added `loading` prop that renders a spinner in place of the board
- `src/components/Board.module.css` — added `.boardLoading`, `.spinner`, `@keyframes spin`
- `src/components/Topbar.tsx` — removed the non-demo "Sign in" button (modal handles auth; button only flashed and was never reachable when needed)

## Key decisions

- `"loading"` is distinct from `"idle"` — `"idle"` means definitively unauthenticated; `"loading"` means unknown
- In demo mode, `authFailed()` is called immediately so the board renders without waiting
- `authFailed()` explicitly resets all three fields (`status`, `sessionId`, `error`) rather than relying on them being null at call time
- The "Sign in" button in the topbar is kept only for demo mode, where it lets users switch to real auth
