import styles from "./Topbar.module.css";

interface TopbarProps {
  onAddColumn: () => void;
}

export const Topbar = ({ onAddColumn }: TopbarProps) => {
  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.topbarLogo}>HubDeck</div>
        <div className={styles.topbarStatus}>
          <div className={styles.statusDot} aria-hidden="true" />
          <span>connected · mock data</span>
        </div>
      </div>
      <button className={styles.btnAdd} onClick={onAddColumn}>
        + Add Column
      </button>
    </header>
  );
};
