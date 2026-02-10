import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./sidebar/Sidebar";
import styles from "./AppLayout.module.css";
import "./AppLayout.css";
import { AuthProvider } from "../shared/auth/AuthContext";
import { StoreProvider } from "../app/providers/StoreProvider";
import { CheckRunPopup } from "../shared/ui/checkRunPopup/CheckRunPopup";
import { fetchActiveCheckRun, type ActiveCheckRun } from "../shared/api/projects";

export function AppLayout() {
  const [activeRun, setActiveRun] = useState<ActiveCheckRun>(null);
  const lastShownRunId = useRef<string | null>(
    localStorage.getItem("checkRunLastShownId")
  );
  const dismissedRunId = useRef<string | null>(
    localStorage.getItem("checkRunDismissedId")
  );
  const [popup, setPopup] = useState<{
    open: boolean;
    status: "idle" | "running" | "success" | "fail";
    title: string;
    subtitle?: string;
    message?: string;
  }>({
    open: false,
    status: "idle",
    title: "Проверка проекта",
  });

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchActiveCheckRun();
        if (active) setActiveRun(data);
      } catch {
        if (active) setActiveRun(null);
      }
    };

    void load();
    const timer = setInterval(load, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!activeRun) {
      setPopup((prev) => ({ ...prev, open: false }));
      return;
    }

    if (dismissedRunId.current && dismissedRunId.current !== activeRun.runId) {
      dismissedRunId.current = null;
      localStorage.removeItem("checkRunDismissedId");
    }

    if (activeRun.active) {
      if (dismissedRunId.current === activeRun.runId) {
        setPopup((prev) => ({ ...prev, open: false }));
        return;
      }
      setPopup({
        open: true,
        status: "running",
        title: "Проверка проекта",
        subtitle: activeRun.projectName ? `Проект: ${activeRun.projectName}` : undefined,
        message: "Проверка выполняется…",
      });
      return;
    }

    if (activeRun.runId !== lastShownRunId.current) {
      lastShownRunId.current = activeRun.runId;
      localStorage.setItem("checkRunLastShownId", activeRun.runId);
      if (dismissedRunId.current === activeRun.runId) {
        dismissedRunId.current = null;
        localStorage.removeItem("checkRunDismissedId");
      }
      const isSuccess = activeRun.status === "SUCCESS";
      setPopup({
        open: true,
        status: isSuccess ? "success" : "fail",
        title: "Проверка завершена",
        subtitle: activeRun.projectName ? `Проект: ${activeRun.projectName}` : undefined,
        message: isSuccess ? "Готово. Данные обновлены." : "Ошибка при проверке.",
      });
      const timer = setTimeout(() => {
        setPopup((prev) => ({ ...prev, open: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [activeRun]);

  return (
    <StoreProvider>
      <AuthProvider>
        <div className={styles.app}>
          <CheckRunPopup
            open={popup.open}
            status={popup.status}
            title={popup.title}
            subtitle={popup.subtitle}
            message={popup.message}
            onClose={() => {
              if (activeRun?.runId && activeRun.active) {
                dismissedRunId.current = activeRun.runId;
                localStorage.setItem("checkRunDismissedId", activeRun.runId);
              } else if (activeRun?.runId) {
                lastShownRunId.current = activeRun.runId;
                localStorage.setItem("checkRunLastShownId", activeRun.runId);
              }
              setPopup((prev) => ({ ...prev, open: false }));
            }}
          />
          <main className={styles.main}>
            <Sidebar />
            <div className={styles.mainContent}>
              <div className={styles.container}>
                <Outlet />
              </div>
            </div>
          </main>

          <footer className={styles.footer}>
            <div className={`${styles.footerInner} ${styles.container}`}>
              <span>© {new Date().getFullYear()} Perf Monitor</span>
              <span className={styles.footerSep}>·</span>
              <span>Status: MVP</span>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </StoreProvider>
  );
}
