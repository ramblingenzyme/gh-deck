import type { PRItem } from "@/types";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { LabelList } from "./LabelList";
import styles from "./PRCard.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <div className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <div className={cardStyles.cardTitle}>
        {item.draft && <span className={styles.draftBadge}>DRAFT</span>}#{item.number} {item.title}
      </div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>@{item.author}</span>
        <div className={cardStyles.cardStats}>
          <span className={item.reviews.approved > 0 ? cardStyles.cardStatApproved : cardStyles.cardStat}>
            ✓{item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span className={cardStyles.cardStatPending}>
              ⟳{item.reviews.requested}
            </span>
          )}
          <span className={cardStyles.cardStat}>
            💬{item.comments}
          </span>
        </div>
      </div>
      <LabelList labels={item.labels} />
    </div>
  );
};
