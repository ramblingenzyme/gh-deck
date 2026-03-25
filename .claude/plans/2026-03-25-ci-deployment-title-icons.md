# Add Status Icon to CICard & DeploymentCard Title Prefix

## Context

PRCard, IssueCard, ReleaseCard all communicate status via a colored icon in the title prefix + tooltip. CICard and DeploymentCard currently use a text badge in the footer instead. This makes them inconsistent. The change moves the status icon to the title prefix (matching the established pattern) and removes the footer badge. DeploymentCard also has a stale `border-left` shorthand instead of the `--card-border-left` custom property pattern — this fixes that too.

---

## CICard (`src/components/cards/CICard.tsx`)

- Import `Tooltip`
- Add prefixed title with Tooltip-wrapped icon
- Remove the `<span className={styles.ciBadge}>` from the footer

## CICard CSS (`src/components/cards/CICard.module.css`)

- Remove `.ciBadge`
- Add `.statusIcon` with `color: var(--ci-color)` and alignment

---

## DeploymentCard (`src/components/cards/DeploymentCard.tsx`)

- Import `Tooltip`
- Add prefixed title with Tooltip-wrapped icon
- Remove `<span className={styles.deployBadge}>` from footer

## DeploymentCard CSS (`src/components/cards/DeploymentCard.module.css`)

- Replace `border-left: 3px solid` with `--card-border-left` pattern
- Remove `.deployBadge`
- Add `.statusIcon`

## Files modified

- `src/components/cards/CICard.tsx`
- `src/components/cards/CICard.module.css`
- `src/components/cards/DeploymentCard.tsx`
- `src/components/cards/DeploymentCard.module.css`
