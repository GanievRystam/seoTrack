import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  return (
    <div className={styles.sidebarWrap}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>PM</div>
        <div className={styles.brandText}>
          <div className={styles.brandName}>Perf Monitor</div>
          <div className={styles.brandTag}>E-commerce performance alerts</div>
        </div>
      </div>

      <div className={styles.sectionTitle}>Workspace</div>
      <nav className={styles.nav}>
        <NavLink
          to="/projects"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Projects
        </NavLink>
        <NavLink
          to="/projects/add"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Add project
        </NavLink>
      </nav>

    

      <div className={styles.footer}>  <div className={styles.sectionTitle}>Account</div>
      <nav className={styles.nav}>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Login
        </NavLink>
        <NavLink
          to="/register"
          className={({ isActive }) =>
            isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
          }
        >
          Register
        </NavLink>
      </nav>
      </div>
    </aside>
    </div>
  );
}
