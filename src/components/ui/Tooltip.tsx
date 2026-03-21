import { useId, useRef } from "preact/hooks";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "above" | "below";
  className?: string;
}

export const Tooltip = ({ text, children, position = "above", className }: TooltipProps) => {
  const id = useId();
  const popoverRef = useRef<HTMLSpanElement>(null);
  const anchorName = `--tooltip-${id.replace(/:/g, "")}`;

  const show = () => (popoverRef.current as any)?.showPopover?.();
  const hide = () => (popoverRef.current as any)?.hidePopover?.();

  return (
    <span
      className={`${styles.wrapper}${className ? ` ${className}` : ""}`}
      aria-describedby={id}
      style={{ anchorName } as React.CSSProperties}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusIn={show}
      onBlurCapture={hide}
    >
      {children}
      <span
        ref={popoverRef}
        role="tooltip"
        id={id}
        popover="hint"
        className={styles[position]}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
      >
        {text}
      </span>
    </span>
  );
};
