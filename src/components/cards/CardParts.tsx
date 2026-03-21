import type { IconName } from "@/types";
import { SvgIcon } from "../ui/SvgIcon";
import styles from "./Card.module.css";

interface CardTopProps {
  repo: string;
  age: string;
}

export const CardTop = ({ repo, age }: CardTopProps) => (
  <header>
    <span className={styles.cardRepo}>{repo}</span>
    <time>{age}</time>
  </header>
);

interface CardTypeIconProps {
  icon: IconName;
}

export const CardTypeIcon = ({ icon }: CardTypeIconProps) => (
  <SvgIcon name={icon} className={styles.cardIcon} />
);
