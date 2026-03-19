import { useAppSelector } from "@/store";
import { useGetUserQuery } from "@/store/githubApi";
import { isDemoMode } from "@/env";
import styles from "./Topbar.module.css";

interface TopbarProps {
  onAddColumn: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
}

export const Topbar = ({ onAddColumn, onSignIn, onSignOut }: TopbarProps) => {
  const status = useAppSelector((s) => s.auth.status);
  const { data: user } = useGetUserQuery(undefined, { skip: status !== 'authed' });
  const authed = status === 'authed' && user;

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <div className={styles.topbarLogo}>HubDeck</div>
        <div className={styles.topbarStatus}>
          <div className={styles.statusDot} aria-hidden="true" />
          {authed ? (
            <span>connected · {user.login}</span>
          ) : isDemoMode ? (
            <span>demo mode</span>
          ) : (
            <span>not connected</span>
          )}
        </div>
      </div>

      <div className={styles.topbarRight}>
        {authed ? (
          <div className={styles.userProfile}>
            <img
              className={styles.userAvatar}
              src={user.avatarUrl}
              alt={user.login}
              width={24}
              height={24}
            />
            <span className={styles.userLogin}>@{user.login}</span>
            <button className={styles.btnSignOut} onClick={onSignOut}>
              Sign out
            </button>
          </div>
        ) : isDemoMode ? (
          <div className={styles.userProfile}>
            <span className={styles.demoBadge}>Demo mode</span>
            <button className={styles.btnSignIn} onClick={onSignIn}>
              Sign in
            </button>
          </div>
        ) : null}
        <button className={styles.btnAdd} onClick={onAddColumn}>
          + Add Column
        </button>
      </div>
    </header>
  );
};
