import type { IssueItem } from "@/types";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { LabelList } from "./LabelList";

interface IssueCardProps {
  item: IssueItem;
}

export const IssueCard = ({ item }: IssueCardProps) => {
  return (
    <div className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <div className={cardStyles.cardTitle}>
        #{item.number} {item.title}
      </div>
      <div className={cardStyles.cardMeta}>
        <span className={cardStyles.cardAuthor}>{item.assignee ? `→ ${item.assignee}` : "unassigned"}</span>
        <span className={cardStyles.cardStat}>
          💬{item.comments}
        </span>
      </div>
      <LabelList labels={item.labels} />
    </div>
  );
};
