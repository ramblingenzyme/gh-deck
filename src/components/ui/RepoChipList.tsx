import { useId, useRef, useState } from "preact/hooks";
import { SvgIcon } from "./SvgIcon";
import { usePopoverToggle } from "./usePopoverToggle";
import { useChipKeyNav } from "./useChipKeyNav";
import { FOCUSABLE_SELECTOR } from "@/utils/focus";
import { cleanId } from "@/utils/id";
import styles from "./RepoChipList.module.css";

interface RepoChipListProps {
  repos: string[];
  suggestions?: string[];
  onAdd: (repo: string) => void;
  onRemove: (repo: string) => void;
}

export const RepoChipList = ({ repos, suggestions = [], onAdd, onRemove }: RepoChipListProps) => {
  const id = useId();
  const anchorName = `--repo-input-${cleanId(id)}`;
  const menuId = `repo-menu-${cleanId(id)}`;
  const menuRef = useRef<HTMLMenuElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipAreaRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(filter.toLowerCase()) && !repos.includes(s),
  );

  // Show a "create" entry when the typed value looks like owner/repo but isn't an exact suggestion
  const trimmedFilter = filter.trim();
  const createEntry =
    trimmedFilter.length > 0 && !repos.includes(trimmedFilter) && !filtered.includes(trimmedFilter)
      ? trimmedFilter
      : null;

  const allOptions = createEntry ? [...filtered, createEntry] : filtered;
  const showEmptyState = trimmedFilter.length > 0 && allOptions.length === 0;

  const { isOpen, open, close, justClosedRef } = usePopoverToggle({
    menuRef,
    anchorRef: chipAreaRef,
    inputRef,
    filteredCount: showEmptyState ? 1 : allOptions.length,
  });

  const openMenu = () => {
    open();
    if (!isOpen) {
      requestAnimationFrame(() => {
        menuRef.current?.querySelectorAll<HTMLElement>("button")[0]?.focus();
      });
    }
  };
  const closeMenu = () => {
    close();
    setActiveIndex(-1);
  };

  const { handleInputNavKeys, handleChipRemoveKeyDown } = useChipKeyNav({
    repoCount: repos.length,
    onRemove,
    inputRef,
    chipAreaRef,
    onLeaveField: closeMenu,
  });

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setFilter(value);
    // This is like the default, there should always be something visually selected even if it's not focused
    setActiveIndex(0);
    if (!isOpen) openMenu();
  };

  const handleFocus = () => {
    if (!justClosedRef.current && allOptions.length > 0) openMenu();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (handleInputNavKeys(e)) return;
    if (e.key === "Tab" && !e.shiftKey) {
      closeMenu();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) openMenu();
      menuRef.current?.querySelectorAll<HTMLElement>("button")[0]?.focus();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const first = allOptions[0];
      if (isOpen && first !== undefined) selectRepo(first);
    }
  };

  const selectRepo = (repo: string) => {
    onAdd(repo);
    setFilter("");
    if (inputRef.current) inputRef.current.value = "";
    closeMenu();
    inputRef.current?.focus();
  };

  const handleOptionKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      closeMenu();
      const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      const inputIdx = focusable.indexOf(inputRef.current!);
      focusable[inputIdx + 1]?.focus();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = (index + 1) % allOptions.length;
      menuRef.current?.querySelectorAll<HTMLElement>("button")[next]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const prev = (index - 1 + allOptions.length) % allOptions.length;
      menuRef.current?.querySelectorAll<HTMLElement>("button")[prev]?.focus();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const opt = allOptions[index];
      if (opt !== undefined) selectRepo(opt);
    } else if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      if (inputRef.current) {
        if (e.key === "Backspace") {
          inputRef.current.value = inputRef.current.value.slice(0, -1);
        } else if (e.key.length === 1) {
          inputRef.current.value += e.key;
        }
        setFilter(inputRef.current.value);
      }
      inputRef.current?.focus();
    }
  };

  return (
    <>
      <div
        ref={chipAreaRef}
        className={styles.chipArea}
        role="group"
        style={{ anchorName } as React.CSSProperties}
        data-open={isOpen || undefined}
        onPointerDown={() => {
          if (isOpen) closeMenu();
          else openMenu();
        }}
      >
        <ul className={styles.chipList} aria-label="Repositories">
          {repos.map((repo) => (
            <li key={repo} className={styles.chip}>
              <span>{repo}</span>
              <button
                type="button"
                className={styles.chipRemove}
                tabIndex={-1}
                aria-label={`Remove ${repo}`}
                onClick={() => onRemove(repo)}
                onKeyDown={(e) => handleChipRemoveKeyDown(e, repo)}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
        <input
          ref={inputRef}
          className={styles.input}
          role="combobox"
          type="text"
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={handleFocus}
          onPointerDown={(e) => e.stopPropagation()}
          placeholder={repos.length === 0 ? "owner/repo" : ""}
          aria-label="Add repository"
          aria-autocomplete="list"
          aria-controls={menuId}
          aria-expanded={isOpen}
          aria-activedescendant={
            isOpen && activeIndex >= 0 && allOptions[activeIndex]
              ? `${menuId}-option-${cleanId(allOptions[activeIndex])}`
              : undefined
          }
        />
        <button
          type="button"
          className={styles.chevron}
          tabIndex={-1}
          aria-hidden="true"
          data-testid="chevron"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => {
            if (isOpen) closeMenu();
            else openMenu();
          }}
          data-open={isOpen || undefined}
        >
          <SvgIcon name="chevronDown" />
        </button>
      </div>
      <menu
        ref={menuRef}
        id={menuId}
        popover="manual"
        tabIndex={-1}
        className={styles.suggestions}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
        role="listbox"
      >
        {showEmptyState ? (
          <p className={styles.emptyState}>No options</p>
        ) : (
          allOptions.map((s, i) => (
            <li key={s} role="none">
              <button
                type="button"
                id={`${menuId}-option-${cleanId(s)}`}
                role="option"
                aria-selected={activeIndex === i}
                className={styles.suggestion}
                onClick={() => selectRepo(s)}
                onMouseEnter={(e) =>
                  (e.currentTarget as HTMLElement).focus({ preventScroll: true })
                }
                onFocus={() => setActiveIndex(i)}
                onBlur={(e) => {
                  if (!menuRef.current?.contains(e.relatedTarget as Node)) setActiveIndex(-1);
                }}
                onKeyDown={(e) => handleOptionKeyDown(e, i)}
              >
                {s === createEntry ? `Create "${s}"` : s}
              </button>
            </li>
          ))
        )}
      </menu>
    </>
  );
};
