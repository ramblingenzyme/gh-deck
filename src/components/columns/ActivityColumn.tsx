import type { ColumnConfig, ActivityItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { ActivityCard } from "@/components/cards/ActivityCard";
import styles from "./ActivityColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const ActivityColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <ActivityCard key={item.id} item={item as ActivityItem} />}
  />
);
