import { useState } from "react";
import type { ColumnConfig } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import styles from "./Column.module.css";
import { MOCK_PRS, MOCK_ISSUES, MOCK_CI, MOCK_NOTIFS, MOCK_ACTIVITY } from "@/data/mock";
import { Icon } from "./Icon";
import { PRCard } from "./cards/PRCard";
import { IssueCard } from "./cards/IssueCard";
import { CICard } from "./cards/CICard";
import { NotifCard } from "./cards/NotifCard";
import { ActivityCard } from "./cards/ActivityCard";

interface ColumnProps {
  col: ColumnConfig;
  onRemove: (id: number) => void;
  onMoveLeft: (id: number) => void;
  onMoveRight: (id: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const DATA_MAP = {
  prs: MOCK_PRS,
  issues: MOCK_ISSUES,
  ci: MOCK_CI,
  notifications: MOCK_NOTIFS,
  activity: MOCK_ACTIVITY,
};

export const Column = ({
  col,
  onRemove,
  onMoveLeft,
  onMoveRight,
  isFirst,
  isLast,
}: ColumnProps) => {
  const [confirming, setConfirming] = useState(false);
  const cfg = COLUMN_TYPES[col.type];

  // Type-safe card rendering by discriminated union
  const renderCard = (item: (typeof DATA_MAP)[typeof col.type][number]) => {
    switch (col.type) {
      case "prs":
        return <PRCard key={item.id} item={item as (typeof MOCK_PRS)[number]} />;
      case "issues":
        return <IssueCard key={item.id} item={item as (typeof MOCK_ISSUES)[number]} />;
      case "ci":
        return <CICard key={item.id} item={item as (typeof MOCK_CI)[number]} />;
      case "notifications":
        return <NotifCard key={item.id} item={item as (typeof MOCK_NOTIFS)[number]} />;
      case "activity":
        return <ActivityCard key={item.id} item={item as (typeof MOCK_ACTIVITY)[number]} />;
    }
  };

  const data = DATA_MAP[col.type];

  return (
    <section className={`${styles.column} ${styles[col.type]}`} aria-label={col.title}>
      <header className={styles.colHeader}>
        <div className={styles.colHeaderLeft}>
          <Icon className={styles.colIcon}>{cfg.icon}</Icon>
          <h2 className={styles.colTitle}>{col.title}</h2>
          <div className={styles.colBadge} aria-label={`${data.length} items`}>{data.length}</div>
        </div>
        <div className={styles.colControls}>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveLeft(col.id)}
            disabled={isFirst}
            aria-label="Move left"
          >
            <Icon>←</Icon>
          </button>
          <button
            className={styles.btnIcon}
            onClick={() => onMoveRight(col.id)}
            disabled={isLast}
            aria-label="Move right"
          >
            <Icon>→</Icon>
          </button>
          <button className={styles.btnIcon} onClick={() => setConfirming(true)} aria-label="Remove column">
            <Icon>✕</Icon>
          </button>
        </div>
      </header>

      {confirming && (
        <div className={styles.colConfirmation} role="alert">
          <span className={styles.colConfirmationText}>Remove "{col.title}"?</span>
          <div className={styles.colConfirmationButtons}>
            <button
              className={styles.btnConfirmCancel}
              onClick={() => setConfirming(false)}
            >
              No
            </button>
            <button
              className={styles.btnConfirmDanger}
              onClick={() => {
                onRemove(col.id);
              }}
            >
              Yes, remove
            </button>
          </div>
        </div>
      )}

      <div className={styles.colBody}>{data.map((item) => renderCard(item))}</div>
    </section>
  );
};
