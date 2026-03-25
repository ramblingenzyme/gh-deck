# Fix TypeScript Build Errors

## Context

`npm run build` was failing with `noUncheckedIndexedAccess`-style errors across two source files and one test file. Array index accesses (`arr[n]`) return `T | undefined` under strict TS settings, but the code was treating them as `T` directly.

## Files Modified

- `src/components/ui/RepoChipList.tsx` — two sites where `allOptions[index]` was passed directly to `selectRepo`
- `src/components/ui/useChipKeyNav.ts` — three sites where indexed `NodeList`/array elements had `.focus()` called on them
- `test/components/ui/RepoChipList.test.tsx` — several array index accesses on `getAllByRole` results

## Approach

- **Source files**: used the safest fix for each call shape:
  - `.focus()` call sites → optional chaining (`arr[n]?.focus()`) — no assertion needed, degrades safely
  - Value-passing sites (`selectRepo(arr[n])`) → local variable + `undefined` guard (`const x = arr[n]; if (x !== undefined) fn(x)`)
- **Test file**: used non-null assertions (`arr[n]!`) — `getAllByRole` throws if no elements are found, so the array is guaranteed non-empty at that point; `!` correctly documents that invariant

## Verification

`npm run build` passes cleanly after changes.
