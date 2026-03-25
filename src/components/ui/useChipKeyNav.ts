import { useCallback } from "preact/hooks";
import type { RefObject } from "preact";
import { FOCUSABLE_SELECTOR } from "@/utils/focus";

interface Options {
  repoCount: number;
  onRemove: (repo: string) => void;
  inputRef: RefObject<HTMLInputElement>;
  chipAreaRef: RefObject<HTMLElement>;
  onLeaveField: () => void;
}

export const useChipKeyNav = ({
  repoCount,
  onRemove,
  inputRef,
  chipAreaRef,
  onLeaveField,
}: Options) => {
  const getRemoveButtons = () =>
    chipAreaRef.current?.querySelectorAll<HTMLElement>("[aria-label^='Remove']");

  const focusLastChip = () => {
    const buttons = getRemoveButtons();
    buttons?.[buttons.length - 1]?.focus();
  };

  // Returns true if the key was handled (so the caller can skip its own handling)
  const handleInputNavKeys = useCallback(
    (e: KeyboardEvent): boolean => {
      if (e.key === "Tab" && e.shiftKey && repoCount > 0) {
        e.preventDefault();
        focusLastChip();
        return true;
      }
      if (e.key === "Backspace" && (e.target as HTMLInputElement).value === "" && repoCount > 0) {
        e.preventDefault();
        focusLastChip();
        return true;
      }
      return false;
    },
    [repoCount],
  );

  const handleChipRemoveKeyDown = useCallback(
    (e: KeyboardEvent, repo: string) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const buttons = getRemoveButtons();
        const idx = Array.from(buttons ?? []).indexOf(e.currentTarget as HTMLElement);
        if (!e.shiftKey) {
          if (buttons && idx < buttons.length - 1) {
            buttons[idx + 1]?.focus();
          } else {
            inputRef.current?.focus();
          }
        } else if (idx > 0) {
          buttons![idx - 1]?.focus();
        } else {
          onLeaveField();
          const focusable = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
          const chipAreaIdx = focusable.findIndex((el) => chipAreaRef.current?.contains(el));
          if (chipAreaIdx > 0) focusable[chipAreaIdx - 1]?.focus();
        }
      } else if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        onRemove(repo);
        inputRef.current?.focus();
      }
    },
    [onRemove, onLeaveField],
  );

  return { handleInputNavKeys, handleChipRemoveKeyDown };
};
