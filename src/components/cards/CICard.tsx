import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { SvgIcon } from "../ui/SvgIcon";
import styles from "./CICard.module.css";

interface CICardProps {
  item: CIItem;
}

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.status]}>
      <CardTitle href={item.url}>{item.name}</CardTitle>
      <CardFooter>
        <span className={styles.ciBranchMeta}>
          <a
            href={`https://github.com/${item.repo}/tree/${item.branch}`}
            target="_blank"
            rel="noreferrer"
          >
            {item.branch}
          </a>
          {" · "}
          {item.duration}
        </span>
        <span className={styles.ciBadge}>
          <SvgIcon name={status.icon} /> {status.label}
        </span>
      </CardFooter>
    </Card>
  );
};
