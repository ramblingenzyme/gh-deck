import type { ReleaseItem } from "@/types";
import { Card, CardTitle, CardFooter } from "../ui/Card";
import styles from "./ReleaseCard.module.css";

interface ReleaseCardProps {
  item: ReleaseItem;
}

function stripTagPrefix(tag: string, name: string): string {
  const stripped = name.startsWith(tag) ? name.slice(tag.length).replace(/^[\s\-–—:]+/, "") : name;
  return stripped || name;
}

export const ReleaseCard = ({ item }: ReleaseCardProps) => {
  const subtitle = stripTagPrefix(item.tag, item.name);
  const hasSubtitle = subtitle !== item.tag;
  const stability = item.prerelease ? "prerelease" : "stable";

  return (
    <Card repo={item.repo} age={item.age} className={styles[stability]}>
      <CardTitle
        href={item.url}
        icon="tag"
        iconTooltip={item.prerelease ? "PRE-RELEASE" : "STABLE"}
      >
        {item.tag}
      </CardTitle>
      <CardFooter>{hasSubtitle && <span className={styles.subtitle}>{subtitle}</span>}</CardFooter>
    </Card>
  );
};
