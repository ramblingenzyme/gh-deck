# Topbar UI Improvements

## Context
The topbar showed redundant auth info (username in both left status area and right user profile), had a nearly-invisible background (#0a0a0a vs root #080808), and exposed sign-out as an inline button. The goal was to clean up the layout, add a proper avatar dropdown, and make the header visually distinct.

## Changes

### 1. Removed left-side status area
- Deleted the `.topbarStatus` div (dot + "connected · username" text) from `Topbar.tsx`
- Removed associated CSS classes: `.topbarStatus`, `.statusDot`
- Kept the logo on the left

### 2. Avatar dropdown (authed state)
- Used the native **Popover API**: `<button popoverTarget="user-menu">` (avatar trigger) + `<div id="user-menu" popover="auto">` (dropdown panel)
- Browser handles light-dismiss (click outside) natively, renders in the top layer — zero JS state needed
- Dropdown panel contents:
  - Username: `@login` in primary text color
  - `<hr>` divider
  - "Sign out" button (calls `onSignOut`, then closes popover via `.hidePopover()`)
- Avatar button moved to far right (after "+ Add Column")
- Avatar shows a `2px solid transparent` border that transitions to `var(--text-muted)` on hover

### 3. Dropdown positioning — CSS Anchor Positioning
- `anchor-name: --avatar-btn` on the avatar button
- `position-anchor: --avatar-btn`, `position-area: end`, `top: calc(anchor(bottom) + 6px)` on the menu
- Menu hugs the bottom-right corner of the topbar: `border-radius: 0 0 0 var(--radius-md)` (bottom-left corner only)

### 4. Demo / unauthenticated state
- Demo mode: `Demo` badge + "Sign in" button (no avatar dropdown)
- Not connected: "Sign in" button only

### 5. Header background color
- Updated `--bg-topbar` in `globals.css`: `#0a0a0a` → `#111827`

## Files modified
- `src/components/Topbar.tsx`
- `src/components/Topbar.module.css`
- `src/globals.css`
