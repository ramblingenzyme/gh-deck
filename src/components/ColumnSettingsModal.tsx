import { useState } from "preact/hooks";
import type { ColumnConfig } from "@/types";
import { useLayoutStore } from "@/store/layoutStore";
import { Modal, ModalBody, ModalFooter, modalStyles } from "./ui/Modal";
import styles from "./ColumnSettingsModal.module.css";

interface ColumnSettingsModalProps {
  open: boolean;
  col: ColumnConfig;
  onClose: () => void;
}

export const ColumnSettingsModal = ({ open, col, onClose }: ColumnSettingsModalProps) => {
  const [title, setTitle] = useState(col.title);
  const [query, setQuery] = useState(col.query ?? "");
  const updateColumnTitle = useLayoutStore((s) => s.updateColumnTitle);
  const updateColumnQuery = useLayoutStore((s) => s.updateColumnQuery);

  // Sync local state when col changes (e.g. external update)
  const handleOpen = () => {
    setTitle(col.title);
    setQuery(col.query ?? "");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle) updateColumnTitle(col.id, trimmedTitle);
    updateColumnQuery(col.id, query.trim());
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Column Settings"
      titleId="column-settings-modal-title"
      onClose={onClose}
      onBackdropClick={onClose}
    >
      <form onSubmit={handleSave}>
        <ModalBody>
          <div className={styles.field}>
            <label htmlFor="col-settings-title">Title</label>
            <input
              id="col-settings-title"
              className={modalStyles.fieldInput}
              type="text"
              value={title}
              onFocus={handleOpen}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
              placeholder="Enter title…"
              required
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="col-settings-query">Filter Query</label>
            <input
              id="col-settings-query"
              className={modalStyles.fieldInput}
              type="text"
              value={query}
              onChange={(e) => setQuery((e.target as HTMLInputElement).value)}
              placeholder="repo:owner/repo label:bug is:open"
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" className={modalStyles.btnModal} onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className={`${modalStyles.btnModal} ${modalStyles.btnModalPrimary}`}
          >
            Save
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
};
