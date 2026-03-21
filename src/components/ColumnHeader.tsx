import { useId, useState } from "preact/hooks";
import type { RefObject } from "preact";
import type { ColumnConfig } from "@/types";
import { COLUMN_TYPES } from "@/constants";
import { SvgIcon } from "./ui/SvgIcon";
import { Tooltip } from "./ui/Tooltip";
import styles from "./BaseColumn.module.css";
import headerStyles from "./ColumnHeader.module.css";

interface ColumnHeaderProps {
  col: ColumnConfig;
  handleRef: RefObject<HTMLButtonElement>;
  itemCount: number;
  isFetching: boolean;
  spinning: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onConfirmRemove: () => void;
  onOpenSettings: () => void;
}

function formatAge(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1m ago";
  return `${mins}m ago`;
}

export const ColumnHeader = ({
  col,
  handleRef,
  itemCount,
  isFetching,
  spinning,
  lastUpdated,
  onRefresh,
  onConfirmRemove,
  onOpenSettings,
}: ColumnHeaderProps) => {
  const cfg = COLUMN_TYPES[col.type];
  const itemLabel = itemCount === 1 ? cfg.itemLabel : `${cfg.itemLabel}s`;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const anchorName = `--col-menu-${menuId.replace(/:/g, "")}`;

  return (
    <header className={styles.colHeader}>
      {/* TODO: once Firefox fully supports popover="hint", the onToggle + menuOpen state
          can be removed — the browser will auto-dismiss hint popovers when a popover="auto"
          opens, making the conditional Tooltip unnecessary. */}
      {menuOpen ? (
        <button
          ref={handleRef}
          type="button"
          className={styles.dragHandle}
          aria-label="Column options"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          popovertarget={menuId}
          style={{ anchorName } as React.CSSProperties}
        >
          <SvgIcon name="grip" />
        </button>
      ) : (
        <Tooltip text="Drag to reorder · Click for settings" position="below">
          <button
            ref={handleRef}
            type="button"
            className={styles.dragHandle}
            aria-label="Column options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            popovertarget={menuId}
            style={{ anchorName } as React.CSSProperties}
          >
            <SvgIcon name="grip" />
          </button>
        </Tooltip>
      )}

      <menu
        id={menuId}
        popover="auto"
        onToggle={(e) => setMenuOpen((e as ToggleEvent).newState === "open")}
        className={headerStyles.dropMenu}
        style={{ positionAnchor: anchorName } as React.CSSProperties}
        role="menu"
      >
        <li role="none">
          <button
            type="button"
            role="menuitem"
            className={headerStyles.dropMenuItem}
            onClick={() => {
              (document.getElementById(menuId) as any)?.hidePopover();
              onOpenSettings();
            }}
          >
            Settings
          </button>
        </li>
      </menu>

      <div className={styles.colHeaderLeft}>
        <SvgIcon name={cfg.icon} className={styles.colIcon} />
        <Tooltip text={col.title} position="below" className={styles.colTitleTooltip}>
          <h2>{col.title}</h2>
        </Tooltip>
        <Tooltip text={`${itemCount} ${itemLabel}`} position="below">
          <output aria-label={`${itemCount} ${itemLabel}`}>{itemCount}</output>
        </Tooltip>
      </div>
      <div className={styles.colControls}>
        {lastUpdated && (
          <Tooltip text={lastUpdated.toLocaleTimeString()} position="below">
            <span className={styles.lastUpdated}>{formatAge(lastUpdated)}</span>
          </Tooltip>
        )}
        <Tooltip text="Refresh" position="below">
          <button
            className={`${styles.btnIcon} ${spinning || isFetching ? styles.btnIconSpinning : ""}`}
            onClick={onRefresh}
            aria-label="Refresh"
          >
            <SvgIcon name="refresh" />
          </button>
        </Tooltip>
        <Tooltip text="Remove column" position="below">
          <button className={styles.btnIcon} onClick={onConfirmRemove} aria-label="Remove column">
            <SvgIcon name="x" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
};
