import type { ActivityItem } from "@/types";
import { ACTIVITY_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const icon = ACTIVITY_ICONS[item.type];

  return (
    <div className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <div className={cardStyles.cardTitle}>
        <span className={cardStyles.cardIcon}>{icon}</span>
        {item.text}
      </div>
      {item.sha && <span className={styles.activitySha}>{item.sha}</span>}
    </div>
  );
};
