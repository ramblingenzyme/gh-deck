import type { NotifItem } from "@/types";
import { NOTIF_ICONS } from "@/constants";
import cardStyles from "./Card.module.css";
import { CardTop } from "./CardParts";
import { Icon } from "../Icon";
import styles from "./NotifCard.module.css";

interface NotifCardProps {
  item: NotifItem;
}

export const NotifCard = ({ item }: NotifCardProps) => {
  const icon = NOTIF_ICONS[item.type];

  return (
    <article className={cardStyles.card}>
      <CardTop repo={item.repo} age={item.age} />
      <p className={cardStyles.cardTitle}>
        <Icon className={cardStyles.cardIcon}>{icon}</Icon>
        {item.text}
      </p>
      <span className={styles.notifRef}>{item.ref}</span>
    </article>
  );
};
