import styles from "./BaseColumn.module.css";

interface Props {
  onOpenSettings: () => void;
}

export const RepoRequiredEmptyState = ({ onOpenSettings }: Props) => (
  <div className={styles.emptyStatePrompt}>
    <p>No repos configured</p>
    <button onClick={onOpenSettings}>Add repos in settings</button>
  </div>
);
