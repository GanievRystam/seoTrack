import { Link } from "react-router-dom";
import type { Project } from "../../shared/types/project";
import { PROJECT_METRICS } from "../../shared/lib/projectMetrics";

export function ProjectRow({ project }: { project: Project }) {
    return (
        <tr key={project.id}>
                <td>
                  <Link to={`/projects/${project.id}`} className="table__link">
                    <div className="table__project-name">{project.name}</div>
                    <div className="muted">{project.owner}</div>
                  </Link>
                </td>
                <td>
                  <span className={`status status--${project.status}`}>{project.status}</span>
                </td>
                <td>
                  <span className="muted">{project.description}</span>
                </td>
                <td>{project.alerts}</td>
                <td>
                  <span className="muted">{project.lastIncident}</span>
                </td>
                {PROJECT_METRICS.map((metric) => (
                  <td key={metric.key}>{project.metrics[metric.key] ?? "-"}</td>
                ))}
              </tr>
    )
}
