import { formatDate } from "../../../../shared/lib/formatDate";

type  ProjectDetailsMetaProps = {
    pageId: string | null;
    email: string;
    status: string  | undefined;
    alerts: number;
    lastIncidentAt: string;

}
export function ProjectDetailsMeta({pageId, email, status, alerts,  lastIncidentAt} : ProjectDetailsMetaProps) {
    return (
        <div className="project-details__meta">
            <span className="pill">Owner: {email}</span>
            <span className="pill">Scope: {pageId ? "Additional page" : "Main page"}</span>
            <span className="pill">Status: {status ?? "-"}</span>
            <span className="pill">Open alerts: {alerts ?? 0}</span>
            <span className="pill">Last incident: {formatDate(lastIncidentAt)}</span>
        </div>
    )
}