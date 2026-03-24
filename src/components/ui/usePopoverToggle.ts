import { useRef, useState, useEffect } from "preact/hooks";
import type { RefObject } from "preact";

interface Options {
  menuRef: RefObject<HTMLElement>;
  anchorRef: RefObject<HTMLElement>;
  inputRef: RefObject<HTMLInputElement>;
  filteredCount: number;
}

export const usePopoverToggle = ({ menuRef, anchorRef, inputRef, filteredCount }: Options) => {
  const [isOpen, setIsOpen] = useState(false);
  // Prevents the input's focus handler from immediately reopening the menu after a close
  const justClosedRef = useRef(false);

  const open = () => {
    if (filteredCount === 0) return;
    (menuRef.current as any)?.showPopover?.();
    setIsOpen(true);
  };

  const close = () => {
    (menuRef.current as any)?.hidePopover?.();
    setIsOpen(false);
    justClosedRef.current = true;
    requestAnimationFrame(() => {
      justClosedRef.current = false;
    });
  };

  useEffect(() => {
    if (filteredCount === 0 && isOpen) {
      close();
      inputRef.current?.focus();
    }
  }, [filteredCount]);

  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (
        !menuRef.current?.contains(e.target as Node) &&
        !anchorRef.current?.contains(e.target as Node)
      ) {
        close();
      }
    };
    // Intercept Escape in capture phase before the modal's native cancel handler fires
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && menuRef.current?.matches(":popover-open")) {
        e.stopPropagation();
        e.preventDefault();
        close();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, []);

  return { isOpen, open, close, justClosedRef };
};
