
import { listMyProjects } from "../../shared/storage/projectStore";
import { PROJECT_METRICS } from "../../shared/lib/projectMetrics";
import styles from './ProjectTable.module.css'
import { Link } from "react-router-dom";
export function ProjectsTable() {
  const UserProjects = listMyProjects();
    return (
        <table className={styles.table}>
          <thead>
            <tr className={styles.tableHeader}>
              <th>Project</th>
              <th>Status</th>
              {/* <th>Description</th> */}
              <th>Alerts</th>
              <th>Last incident</th>
              {PROJECT_METRICS.map((metric) => (
                <th key={metric.key}>{metric.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UserProjects.map((project) => (
                 <tr key={project.id}>
                 <td className={styles.tableRowName}>
                   <Link to={`/projects/${project.id}`} className="table__link">
                     <div className="table__project-name">{project.name}</div>
                     {/* <div className="muted">{project.owner}</div> */}
                   </Link>
                 </td>
                 <td>
                   <span className={`status status--${project.status}`}>{project.status}</span>
                 </td>
                 {/* <td>
                   <span className="muted">{project.description}</span>
                 </td> */}
                 <td>{project.alerts}</td>
                 <td>
                   <span className="muted">{project.lastIncident}</span>
                 </td>
                 {PROJECT_METRICS.map((metric) => (
                   <td key={metric.key}>{project.metrics[metric.key] ?? "-"}</td>
                 ))}
               </tr>
            ))}
          </tbody>
        </table>
    )
}
