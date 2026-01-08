import { ProjectRow } from "./ProjectRow";
import { listMyProjects } from "../../shared/storage/projectStore";
import { PROJECT_METRICS } from "../../shared/lib/projectMetrics";

export function ProjectsTable() {
  const UserProjects = listMyProjects();
    return (
        <table className="table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Status</th>
              <th>Description</th>
              <th>Alerts</th>
              <th>Last incident</th>
              {PROJECT_METRICS.map((metric) => (
                <th key={metric.key}>{metric.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {UserProjects.map((project) => (
                <ProjectRow key={project.id} project={project} />
            ))}
          </tbody>
        </table>
    )
}
