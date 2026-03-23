# Element Selectors & Semantic HTML Plan

## Context

The codebase already uses good semantic HTML in many places (`<article>`, `<header>`, `<section>`, `<time>`, `<output>`, `<dialog>`, `<hr>`). The goal is to extend this: where a class is applied to a semantically meaningful element and can be unambiguously targeted by element type within a scoped parent class, replace it with an element selector. This removes noise from TSX and makes the CSS more expressive.

**Scope rule:** Element selectors in CSS Modules must be anchored to a parent class (which gets hashed) to remain scoped. Bare element selectors like `textarea {}` without a parent class would leak globally and are not allowed.

---

## Changes

### 1. `Card.tsx` + `Card.module.css`

**Semantic state:** `<article>` (`.card`) contains `<header>` (`.cardTop`), `<time>` (`.cardAge`), `<p>` (`.cardTitle`), `<footer>` (`.cardMeta`/`.cardFooter`).

**Changes:**

| Class removed    | CSS selector     | TSX change                                                            |
| ---------------- | ---------------- | --------------------------------------------------------------------- |
| `.cardTop`       | `.card > header` | Remove `className={styles.cardTop}` from `CardTop` in `CardParts.tsx` |
| `.cardAge`       | `.card time`     | Remove `className={styles.cardAge}` from `CardParts.tsx`              |
| `.cardTitleLink` | `.cardTitle > a` | Remove `className={styles.cardTitleLink}` from `Card.tsx`             |

`.cardTitle`, `.cardMeta`, and `.cardFooter` keep their classes — they have distinct styles and `cardMeta`/`cardFooter` share the same element type (`<footer>`) so cannot be distinguished by type alone.

---

### 2. `Modal.tsx` + `Modal.module.css`

**Semantic change:** `<div className={styles.modalHeader}>` → `<header>` (no class needed).
**Also:** `ModalBody` renders `<div>` → `<section>`. `ModalFooter` renders `<div>` → `<footer>`.

| Class removed  | CSS selector         | TSX change                                          |
| -------------- | -------------------- | --------------------------------------------------- |
| `.modalHeader` | `.modal > header`    | `<div className={styles.modalHeader}>` → `<header>` |
| `.modalTitle`  | `.modal > header h2` | Remove `className={styles.modalTitle}`              |
| `.modalBody`   | `.modal section`     | `ModalBody`: `<div>` → `<section>`                  |
| `.modalFooter` | `.modal footer`      | `ModalFooter`: `<div>` → `<footer>`                 |

---

### 3. `ColumnHeader.tsx` + `BaseColumn.module.css`

The header already uses `<header className={styles.colHeader}>`. Inside it, `.colTitle` is on `<h2>` and `.colBadge` is on `<output>` — both uniquely-typed within the header.

| Class removed | CSS selector        | TSX change                           |
| ------------- | ------------------- | ------------------------------------ |
| `.colTitle`   | `.colHeader h2`     | Remove `className={styles.colTitle}` |
| `.colBadge`   | `.colHeader output` | Remove `className={styles.colBadge}` |

---

### 4. `Tooltip.tsx` + `Tooltip.module.css`

The tooltip element already has `role="tooltip"`. Use the ARIA attribute as the selector instead of the class. Tooltip styles moved inside `.wrapper` scope.

| Class removed | CSS selector                | TSX change                                                                            |
| ------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `.tooltip`    | `.wrapper [role="tooltip"]` | Remove `className={styles.tooltip}` from the span; keep `styles.above`/`styles.below` |

The `.above` and `.below` position classes stay since there's no element-based way to express position.

---

### 5. `AddColumnModal.tsx` + `AddColumnModal.module.css`

`.modalFieldLabel` is always on a `<label>` within `.modalField`.

| Class removed      | CSS selector        | TSX change                                              |
| ------------------ | ------------------- | ------------------------------------------------------- |
| `.modalFieldLabel` | `.modalField label` | Remove `className={styles.modalFieldLabel}` from labels |

---

## Summary of classes removed

`cardTop`, `cardAge`, `cardTitleLink`, `modalHeader`, `modalTitle`, `modalBody`, `modalFooter`, `colTitle`, `colBadge`, `tooltip`, `modalFieldLabel` — 11 classes total.

---

## Status

**Completed 2026-03-21.** All changes applied. Build passes, 272/272 tests pass.
