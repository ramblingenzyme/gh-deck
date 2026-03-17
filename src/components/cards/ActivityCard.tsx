import type { ActivityItem } from "@/types";
import { ACTIVITY_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { Icon } from "../Icon";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>
        <Icon className={cardStyles.cardIcon}>{icon}</Icon>
        {item.text}
      </p>
      {item.sha && <span className={styles.activitySha}>{item.sha}</span>}
    </article>
  );
};
