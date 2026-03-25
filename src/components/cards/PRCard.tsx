import { type PRItem, REVIEW_COUNT_UNKNOWN } from "@/types";
import { PR_STATUS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { LabelList } from "./LabelList";
import { CardStat } from "./CardParts";
import { SvgIcon } from "../ui/SvgIcon";
import { Tooltip } from "../ui/Tooltip";
import { UserLink } from "../ui/UserLink";
import cardStyles from "../ui/Card.module.css";
import styles from "./PRCard.module.css";

interface PRCardProps {
  item: PRItem;
}

export const PRCard = ({ item }: PRCardProps) => {
  const prStatus = PR_STATUS[item.status];
  const prefix = (
    <>
      <Tooltip position="below" text={item.status.toUpperCase()}>
        <span className={styles.statusIconWrap}>
          <SvgIcon name={prStatus.icon} className={styles.statusIcon} />
        </span>
      </Tooltip>
      #{item.number}
    </>
  );

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.status]}>
      <CardTitle href={item.url} prefix={prefix}>
        {item.title}
      </CardTitle>
      <LabelList labels={item.labels} repo={item.repo} />
      <CardFooter>
        <UserLink username={item.author} />
        <div className={cardStyles.cardStats}>
          <CardStat
            icon="check"
            count={item.reviews.approved}
            tooltip={`${item.reviews.approved} approvals`}
            variant={
              item.reviews.approved !== REVIEW_COUNT_UNKNOWN && item.reviews.approved > 0
                ? "approved"
                : "default"
            }
          />
          {item.reviews.requested !== REVIEW_COUNT_UNKNOWN && item.reviews.requested > 0 && (
            <CardStat
              icon="refresh"
              count={item.reviews.requested}
              tooltip={`${item.reviews.requested} reviews requested`}
              variant="pending"
            />
          )}
          <CardStat icon="comment" count={item.comments} tooltip={`${item.comments} comments`} />
        </div>
      </CardFooter>
    </Card>
  );
};
