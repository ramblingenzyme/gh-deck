import type { ColumnConfig, PRItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { PRCard } from "@/components/cards/PRCard";
import styles from "./PRColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const PRColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <PRCard key={item.id} item={item as PRItem} />}
  />
);
