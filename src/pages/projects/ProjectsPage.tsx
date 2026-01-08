
import { ProjectsHeader } from "./ProjectHeader";
import { ProjectsTable } from "./ProjectsTable";

export function ProjectsPage() {
  return (
    <div className="page">
      <ProjectsHeader />

      <div className="table-container">
        <ProjectsTable />
      </div>
    </div>
  );
}
