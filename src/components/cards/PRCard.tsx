import type { PRItem } from "@/types";
import { Card, CardTitle, CardMeta } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import { LabelList } from "./LabelList";
import cardStyles from "./Card.module.css";
import styles from "./PRCard.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  return (
    <Card repo={item.repo} age={item.age}>
      <CardTitle href={item.url} prefix={`#${item.number}`}>
        {item.title}
      </CardTitle>
      <CardMeta>
        <span className={cardStyles.cardAuthor}>@{item.author}</span>
        <div className={cardStyles.cardStats}>
          {item.draft && <span className={styles.draftBadge}>DRAFT</span>}
          <span
            className={
              item.reviews.approved > 0 ? cardStyles.cardStatApproved : cardStyles.cardStat
            }
            aria-label={`${item.reviews.approved} approvals`}
          >
            <SvgIcon name="check" />
            {item.reviews.approved}
          </span>
          {item.reviews.requested > 0 && (
            <span
              className={cardStyles.cardStatPending}
              aria-label={`${item.reviews.requested} reviews requested`}
            >
              <SvgIcon name="refresh" />
              {item.reviews.requested}
            </span>
          )}
          <span className={cardStyles.cardStat} aria-label={`${item.comments} comments`}>
            <SvgIcon name="comment" />
            {item.comments}
          </span>
        </div>
      </CardMeta>
      <LabelList labels={item.labels} />
    </Card>
  );
};
