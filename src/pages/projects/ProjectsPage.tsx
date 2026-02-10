
import { ProjectsHeader } from "./ProjectHeader";
import { ProjectsTable } from "./ProjectsTable";
import { RecentIncidents } from "./RecentIncidents";

export function ProjectsPage() {
  return (
    <div className="page">
      <ProjectsHeader />

      <div className="table-container">
        <ProjectsTable />
      </div>
      
      {/* <RecentIncidents/> */}
    </div>
  );
}
