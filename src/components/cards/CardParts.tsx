import styles from "./Card.module.css";

interface CardTopProps {
  repo: string;
  age: string;
}

export const CardTop = ({ repo, age }: CardTopProps) => (
  <header className={styles.cardTop}>
    <span className={styles.cardRepo}>{repo}</span>
    <span className={styles.cardAge}>{age}</span>
  </header>
);
