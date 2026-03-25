# Context

`matchesTokens` in `src/utils/queryFilter.ts` was written when only PRItem, IssueItem, and CIItem existed. Since then `ReleaseItem`, `DeploymentItem`, and `ActivityItem` were added but the filter function was never updated. Splitting into per-type functions eliminates unsafe casts. Adding a `type` discriminant to each item type enables a clean `switch` dispatch.

## Step 1 — Types (`src/types/index.ts`)

Add `type` discriminant to each item interface:

```ts
interface PRItem         { type: 'pr';         ... }
interface IssueItem      { type: 'issue';       ... }
interface CIItem         { type: 'ci';          ... }
interface ReleaseItem    { type: 'release';     ... }
interface DeploymentItem { type: 'deployment';  ... }
```

`ActivityItem` already has `type: ActivityType` (with values like `"commit"`, `"star"`, etc.), which conflicts. Rename that field to `kind: ActivityType`, and add the discriminant `type: 'activity'`.

Also make mapper/filter improvements:

**Add to `PRItem`:**

- `state: IssueState` — available from `GHSearchItem.state`, currently discarded
- `assignees: string[] | null` — available from `GHSearchItem.assignees[0]`, currently discarded for PRs

**Expand `CITrigger`:**
Unknown trigger events silently fall back to `"push"` in the mapper. Expand `CITrigger` to include an `"other"` catch-all so the data is accurately represented:

```ts
export type CITrigger = "push" | "pull_request" | "release" | "other";
```

## Step 2 — Mappers (`src/store/githubMappers.ts`)

- `mapSearchItemToPR`: add `state: item.state as IssueState`, `assignees: item.assignees?.map(a => a.login) ?? null`
- `mapWorkflowRun`: change `triggerMap[run.event] ?? "push"` to `triggerMap[run.event] ?? "other"`
- All mapper functions: add the `type` literal field to every returned object
- `mapPushEvent` etc. (ActivityItem): rename `type:` field to `kind:` in all activity mappers

## Step 3 — Refactor `src/utils/queryFilter.ts`

Replace the single `matchesTokens` with per-type functions + dispatcher:

```ts
function matchesPR(item: PRItem, tokens): boolean;
function matchesIssue(item: IssueItem, tokens): boolean;
function matchesCI(item: CIItem, tokens): boolean;
function matchesActivity(item: ActivityItem, tokens): boolean;
function matchesRelease(item: ReleaseItem, tokens): boolean;
function matchesDeployment(item: DeploymentItem, tokens): boolean;

export function matchesTokens(item: KnownItem, tokens): boolean {
  switch (item.type) {
    case "pr":
      return matchesPR(item, tokens);
    case "issue":
      return matchesIssue(item, tokens);
    case "ci":
      return matchesCI(item, tokens);
    case "activity":
      return matchesActivity(item, tokens);
    case "release":
      return matchesRelease(item, tokens);
    case "deployment":
      return matchesDeployment(item, tokens);
  }
}
```

**`is:` unknown values → `false`** in all per-type functions.

## Supported filters per type

| Type           | Supported filters                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| PRItem         | `repo:`, `author:`, `assignee:`, `label:`, `is:draft`, `is:open`, `is:closed`, `is:pr`, `is:pull-request` |
| IssueItem      | `repo:`, `assignee:`, `label:`, `is:open`, `is:closed`, `is:issue`                                        |
| CIItem         | `repo:`, `status:`, `branch:`, `triggered:`                                                               |
| ActivityItem   | `repo:`, `ref:` (substring), `type:` (exact match on `kind` field, e.g. `type:commit`)                    |
| ReleaseItem    | `repo:`, `tag:` (exact), `is:prerelease`                                                                  |
| DeploymentItem | `repo:`, `status:`, `environment:`, `creator:`, `ref:` (substring)                                        |

Bare text searches `getItemDisplayText(item)` in all types.
All unrecognised keys → `false`.

## Step 4 — Mock data (`src/demo/mock.ts`)

Add `type` discriminant to all mock items. Rename `type` → `kind` in MOCK_ACTIVITY items.

## Step 5 — Tests

Update all affected test fixtures:

- **`test/utils/queryFilter.test.ts`**: add `type` to existing `basePR`/`baseIssue`/`baseCI`; rename `type` → `kind` in any activity fixtures; add `baseActivity`, `baseRelease`, `baseDeployment`; add tests for all new filters; update `"is:unknown returns true"` to expect `false`
- **`test/utils/getItemDisplayText.test.ts`**: add `type` to all 6 fixtures; rename `type` → `kind` in activity fixture
- **`test/store/githubMappers.test.ts`**: update expected output shapes if snapshots are used

## Verification

- `npm test` — all tests pass
