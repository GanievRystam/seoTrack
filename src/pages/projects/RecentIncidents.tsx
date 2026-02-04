import { useEffect, useState } from "react";
import styles from "./RecentIncidents.module.css";
import { fetchIncidents } from "../../shared/api/projects";

type IncidentLevel = "warning" | "critical";

type IncidentItem = {
  id: string;
  projectName: string;
  metric: string;
  level: IncidentLevel;
  timeText: string;
};


const DEFAULT_ITEMS: IncidentItem[] = [
  { id: "1", projectName: "Orion B2B Portal", metric: "TTFB", level: "critical", timeText: "43 minutes ago" },
  { id: "2", projectName: "Aurora Storefront", metric: "CLS", level: "warning", timeText: "2 hours ago" },
  { id: "3", projectName: "Nova Mobile", metric: "INP", level: "warning", timeText: "6 days ago" },
];

export function RecentIncidents() {
  const [incidentItems, setIncidentItems] = useState<IncidentItem[]>([]);

  useEffect(() => {
    fetchIncidents()
      .then((data) => setIncidentItems(data))
      .catch((e) => console.error("INCIDENTS ERROR:", e));
  }, []);
  return (
    <section className={styles.root}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Recent incidents</h3>
          <p className={styles.subtitle}>Latest alerts across your watchlist.</p>
        </div>

        {/* оставляем глобальные кнопки */}
        <button className="button button--ghost" type="button">
          View all
        </button>
      </div>

      <ul className={styles.list}>
        {incidentItems.map((it) => {
          const levelClass =
            it.level === "critical" ? styles.levelCritical : styles.levelWarning;

          return (
            <li key={it.id} className={styles.row}>
              <div>
                <div className={styles.project}>{it.projectName}</div>
                <div className={styles.meta}>
                  <span className={styles.badge}>{it.metric}</span>
                  <span className={`${styles.level} ${levelClass}`}>{it.level}</span>
                </div>
              </div>

              <div className={styles.time}>{it.timeText}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
