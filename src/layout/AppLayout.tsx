import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar/Sidebar";
import styles from "./AppLayout.module.css";
import "./AppLayout.css";
import { AuthProvider } from "../shared/auth/AuthContext";

export function AppLayout() {
  return (
    <AuthProvider>
      <div className={styles.app}>
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
            <span>В© {new Date().getFullYear()} Perf Monitor</span>
            <span className={styles.footerSep}>В·</span>
            <span>Status: MVP</span>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
