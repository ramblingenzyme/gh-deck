import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import styles from "./CICard.module.css";

interface CICardProps {
  item: CIItem;
}

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];

  return (
    <div className={`${cardStyles.card} ${styles.ciCard} ${styles[item.status]}`}>
      <CardTop repo={item.repo} age={item.age} />
      <div className={cardStyles.cardTitle}>{item.name}</div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.branch}</span>
        <span className={cardStyles.cardStat}>
          {item.duration}
        </span>
      </div>
      <div className={styles.ciBadgeWrapper}>
        <span className={styles.ciBadge}>
          {status.icon} {status.label}
        </span>
      </div>
    </div>
  );
};
