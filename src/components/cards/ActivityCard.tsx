import type { ActivityItem } from "@/types";
import { ACTIVITY_KINDS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import styles from "./ActivityCard.module.css";

interface ActivityCardProps {
  item: ActivityItem;
}

export const ActivityCard = ({ item }: ActivityCardProps) => {
  const kind = ACTIVITY_KINDS[item.kind];

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.kind]}>
      <CardTitle href={item.url} icon={kind.icon} iconTooltip={kind.label}>
        {item.text}
      </CardTitle>
      {item.ref && (
        <CardFooter className={styles.activityFooter}>
          <a className={styles.activityRef} href={item.url} target="_blank" rel="noreferrer">
            {item.ref}
          </a>
        </CardFooter>
      )}
    </Card>
  );
};
