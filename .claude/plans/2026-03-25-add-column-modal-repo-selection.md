# Add Repo Selection to AddColumnModal

## Context

When adding a new column of a type that requires repos (CI, Releases, Deployments, Security), the user currently must open the column settings after creation to add repos. This is confusing UX. The modal should show a repo picker when the selected column type is in `MULTI_REPO_COLUMN_TYPES`. The modal was also redesigned from a single vertical layout to a two-column layout (type selector left, fields right) to prevent the centered modal from shifting up and down as content changes.

## Files Modified

1. **`src/store/layoutMutations.ts`** — extended `applyAdd` to accept optional `repos`
2. **`src/store/layoutStore.ts`** — extended `addColumn` signature to accept optional `repos`
3. **`src/components/App.tsx`** — passes `repos` through `handleAddColumn`
4. **`src/components/ui/Modal.tsx`** — added optional `className` prop to inner modal div; changed `width` to `min-width`
5. **`src/components/ui/Modal.module.css`** — changed `width: 380px` to `min-width: 380px`
6. **`src/components/AddColumnModal.tsx`** — two-column layout; repo state + `RepoChipList` when `isMultiRepo`; "Column Type" label above type selector
7. **`src/components/AddColumnModal.module.css`** — two-column grid layout; `.modal` width override (580px); shared `.fieldLabel` / `.modalField label` selector

## Reusable Utilities

- `MULTI_REPO_COLUMN_TYPES` from `src/constants/index.ts`
- `RepoChipList` from `src/components/ui/RepoChipList.tsx`
- `useGetUserRepos` from `src/store/githubQueries.ts`
- `useAuthStore` from `src/store/authStore.ts`

## Verification

1. Open "Add Column" modal, select a non-repo type (PRs, Issues, Activity) → no repo picker shown
2. Select CI, Releases, Deployments, or Security → repo picker appears
3. Add repos in the picker, click "Add Column" → column created with repos set
4. Open column settings → repos appear pre-filled
5. `npm test` — all 331 tests pass
