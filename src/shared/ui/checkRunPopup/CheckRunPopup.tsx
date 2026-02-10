import styles from "./CheckRunPopup.module.css";
import type { CheckRunStatus } from "../../../features/checkRun/model/checkRunSlice";

type CheckRunPopupProps = {
  open: boolean;
  status: CheckRunStatus;
  title: string;
  subtitle?: string;
  message?: string;
  onClose: () => void;
};

const statusLabel: Record<CheckRunStatus, string> = {
  idle: "Ожидание",
  running: "Проверка выполняется",
  success: "Проверка завершена",
  fail: "Ошибка проверки",
};

export function CheckRunPopup({
  open,
  status,
  title,
  subtitle,
  message,
  onClose,
}: CheckRunPopupProps) {
  if (!open) return null;

  return (
    <div className={styles.checkRunPopup}>
      <div className={styles.checkRunPopup__overlay} onClick={onClose} />
      <div className={styles.checkRunPopup__window}>
        <button className={styles.checkRunPopup__close} type="button" onClick={onClose}>
          Г—
        </button>
        <div className={styles.checkRunPopup__header}>
          <h2 className={styles.checkRunPopup__title}>{title}</h2>
          {subtitle && <div className={styles.checkRunPopup__subtitle}>{subtitle}</div>}
        </div>
        <div className={styles.checkRunPopup__content}>
          <div>{statusLabel[status]}</div>
          {message && <div>{message}</div>}
        </div>
        <div className={styles.checkRunPopup__actions}>
          <button className={styles.button} type="button" onClick={onClose}>
            ОК
          </button>
        </div>
      </div>
    </div>
  );
}
