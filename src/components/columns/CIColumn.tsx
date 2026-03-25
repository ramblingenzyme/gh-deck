import type { ColumnConfig, CIItem } from "@/types";
import { BaseColumn } from "@/components/BaseColumn";
import { CICard } from "@/components/cards/CICard";
import { RepoRequiredEmptyState } from "@/components/RepoRequiredEmptyState";
import styles from "./CIColumn.module.css";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: string) => void;
}

export const CIColumn = ({ col, onRemove }: ColumnProps) => (
  <BaseColumn
    accentClass={styles.accent}
    col={col}
    onRemove={onRemove}
    renderCard={(item) => <CICard key={item.id} item={item as CIItem} />}
    emptyState={
      !col.repos?.length
        ? (openSettings) => <RepoRequiredEmptyState onOpenSettings={openSettings} />
        : undefined
    }
  />
);
