import type { ColumnConfig, IssueItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { IssueCard } from "@/components/cards/IssueCard";
import styles from "./IssueColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const IssueColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <IssueCard key={item.id} item={item as IssueItem} />}
  />
);
