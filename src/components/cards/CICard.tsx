import type { CIItem } from "@/types";
import { CI_STATUS } from "@/constants";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import { RefLink } from "../ui/RefLink";
import styles from "./CICard.module.css";

interface CICardProps {
  item: CIItem;
}

const TRIGGER_LABELS: Record<string, string> = {
  push: "push",
  pull_request: "PR",
  release: "release",
};

export const CICard = ({ item }: CICardProps) => {
  const status = CI_STATUS[item.status];
  const triggerLabel = TRIGGER_LABELS[item.triggered] ?? item.triggered;

  return (
    <Card repo={item.repo} age={item.age} className={styles[item.status]}>
      <CardTitle href={item.url} icon={status.icon} iconTooltip={status.label}>
        {item.name}
      </CardTitle>
      <CardFooter>
        <span className={styles.ciBranchMeta}>
          <RefLink repo={item.repo} gitRef={item.branch} />
          {" · "}
          {item.duration}
          {" · "}
          {triggerLabel}
        </span>
      </CardFooter>
    </Card>
  );
};
