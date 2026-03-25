import { useEffect, useRef } from "preact/hooks";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  onBackdropClick?: () => void;
  preventCancel?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const Modal = ({
  open,
  title,
  titleId,
  onClose,
  onBackdropClick,
  preventCancel,
  className,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      tabIndex={-1}
      onClose={onClose}
      onCancel={
        preventCancel
          ? (e) => e.preventDefault()
          : (e) => {
              e.preventDefault();
              onClose();
            }
      }
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- <dialog> has native keyboard accessibility via onCancel/Escape; backdrop click is a pointer-only affordance
      onClick={
        onBackdropClick
          ? (e) => {
              if (e.target === e.currentTarget) onBackdropClick();
            }
          : undefined
      }
      aria-labelledby={titleId}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- not an interaction point; stopPropagation prevents backdrop-click from firing on modal content clicks */}
      <div
        className={`${styles.modal}${className ? ` ${className}` : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h1 id={titleId}>{title}</h1>
        </header>
        {children}
      </div>
    </dialog>
  );
};

export const ModalBody = ({ children }: { children: React.ReactNode }) => (
  <section>{children}</section>
);

export const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <footer>{children}</footer>
);

export { styles as modalStyles };
