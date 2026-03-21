import type { ColumnConfig } from "@/types";
import styles from "./BaseColumn.module.css";

interface ColumnConfirmDeleteProps {
  col: ColumnConfig;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ColumnConfirmDelete = ({ col, onCancel, onConfirm }: ColumnConfirmDeleteProps) => (
  <div className={styles.colConfirmation} role="alertdialog" aria-labelledby="confirm-remove-label">
    <span id="confirm-remove-label" className={styles.colConfirmationText}>
      Remove &quot;{col.title}&quot;?
    </span>
    <div className={styles.colConfirmationButtons}>
      <button className={styles.btnConfirmCancel} onClick={onCancel}>
        No
      </button>
      <button className={styles.btnConfirmDanger} onClick={onConfirm}>
        Yes, remove
      </button>
    </div>
  </div>
);
