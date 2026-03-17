import styles from "./Topbar.module.css";

interface TopbarProps {
  onAddColumn: () => void;
}

export const Topbar = ({ onAddColumn }: TopbarProps) => {
  return (
    <div className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.topbarLogo}>HubDeck</div>
        <div className={styles.topbarStatus}>
          <div className={styles.statusDot} />
          <span>connected · mock data</span>
        </div>
      </div>
      <button className={`${styles.btn} ${styles.btnAdd}`} onClick={onAddColumn}>
        + Add Column
      </button>
    </div>
  );
};
