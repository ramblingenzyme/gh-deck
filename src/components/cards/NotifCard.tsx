import type { NotifItem } from "@/types";
import { NOTIF_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import styles from "./NotifCard.module.css";

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <div className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <div className={cardStyles.cardTitle}>
        <span className={cardStyles.cardIcon}>{icon}</span>
        {item.text}
      </div>
      <span className={styles.notifRef}>{item.ref}</span>
    </div>
  );
};
