# Implement fetching of review counts for PR cards

## Context

PR cards showed hardcoded `reviews: { approved: 0, requested: 0 }` because the GitHub Search API (`/search/issues`) does not return review data. Two additional per-PR API endpoints are needed:

- `GET /repos/{owner}/{repo}/pulls/{number}/reviews` → count reviews with `state === "APPROVED"` for `approved`
- `GET /repos/{owner}/{repo}/pulls/{number}/requested_reviewers` → `users.length + teams.length` for `requested`

Both calls run in parallel per PR after the initial search fetch, using `Promise.allSettled`. When a call fails, the fallback is `REVIEW_COUNT_UNKNOWN` (`'?'`) — the literal render value — so there's no null-checking in display code; the value encodes "unknown" directly.

## Files modified

- `src/types/index.ts` — `REVIEW_COUNT_UNKNOWN` constant + `ReviewCount = number | typeof REVIEW_COUNT_UNKNOWN` type; `PRItem.reviews` uses `ReviewCount`
- `src/types/github.ts` — `GHPRReview` and `GHPRRequestedReviewers` interfaces
- `src/store/githubMappers.ts` — mapper default changed from `{ approved: 0, requested: 0 }` to `REVIEW_COUNT_UNKNOWN` for both fields
- `src/store/githubQueries.ts` — `enrichPRWithReviews(pr)` function fetches both endpoints with `Promise.allSettled`, falls back to `REVIEW_COUNT_UNKNOWN` per field; `useGetPRs` applies it via outer `Promise.allSettled`
- `src/components/cards/CardParts.tsx` — `CardStat.count` accepts `ReviewCount`
- `src/components/cards/PRCard.tsx` — variant/visibility logic checks `!== REVIEW_COUNT_UNKNOWN` before numeric comparison
- `test/store/githubMappers.test.ts` — updated to assert `REVIEW_COUNT_UNKNOWN` defaults
- `test/store/githubQueries.test.ts` — updated PR tests with enrichment mocks; added fallback tests

## Key patterns used

- `enrichPRWithReviews` follows the per-item follow-up fetch pattern from `useGetDeployments`
- Outer `Promise.allSettled` in `useGetPRs` falls back to the mapper-initialized PR (with `REVIEW_COUNT_UNKNOWN`) if enrichment throws unexpectedly
- Inline `type` keyword style for imports: `import { type Foo, value } from "..."`
