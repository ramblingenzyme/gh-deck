import { useId } from "preact/hooks";
import styles from "./Tooltip.module.css";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: "above" | "below";
  className?: string;
}

export const Tooltip = ({ text, children, position = "above", className }: TooltipProps) => {
  const id = useId();
  return (
    <span className={`${styles.wrapper}${className ? ` ${className}` : ""}`} aria-describedby={id}>
      {children}
      <span role="tooltip" id={id} className={`${styles.tooltip} ${styles[position]}`}>
        {text}
      </span>
    </span>
  );
};
