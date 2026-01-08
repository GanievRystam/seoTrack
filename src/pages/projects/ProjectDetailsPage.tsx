import { Link, useParams } from "react-router-dom";
import { getCheckRunByProjectId, getProjectById } from "../../shared/storage/projectStore";
import { ProjectChart } from "./ProjectChart";
import type { CheckRun, MetricKey } from "../../shared/types/run";
import { evaluateMetric } from "../../shared/lib/evaluateMetric";
import { getIssues } from "../../shared/lib/metricThresholds";
import { RecentChecks } from "./RecentChecks";
import { PROJECT_METRICS } from "../../shared/lib/projectMetrics";

export function ProjectDetailsPage() {
  const { id, historyId } = useParams();
  const project = id ? getProjectById(id) : undefined;
  const checkRun = id ? getCheckRunByProjectId(id) : undefined;
  const currentCheckRun: CheckRun | undefined = id ? (() => {    
    if (!checkRun || checkRun.length === 0) return undefined;
    if (historyId) {
      return checkRun.find((run: CheckRun) => run.id === historyId);
    }
    return checkRun.reduce((latest, current) => {
      const getTimestamp = (run: CheckRun) => {
        const ts = Date.parse(run.checkedAt);
        return isNaN(ts) ? run.checkedAt : ts;
      };
      return getTimestamp(current) > getTimestamp(latest) ? current : latest;
    }, checkRun[0]);
  })() : undefined;

  const checkRunIssue = currentCheckRun ? getIssues(currentCheckRun.metrics) : undefined;
  if (!project) {
    return (
      <div className="page">
        <div className="panel">
          <div className="page__header">
            <h1 className="page__title">Project not found</h1>
          </div>
          <p className="page__subtitle">The requested project could not be located.</p>
          <Link to="/projects" className="button button--primary">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>

    <div className="page">
      <Link to="/projects" className="backlink">
        ← Back to projects
      </Link>
      {checkRun && historyId == undefined && checkRun.length > 1 && (
       <ProjectChart checkRun={checkRun} />
      )}
      
      <div className="panel">
        <div className="page__header">
          <div>
            <h1 className="page__title">{project.name}</h1>
            <p className="page__subtitle">{project.description}</p>
          </div>
          <span className={`status status--${project.status}`}>{project.status}</span>
        </div>

        <div className="project-details__meta">
          <span className="pill">Owner: {project.owner}</span>
          <span className="pill">Open alerts: {project.alerts}</span>
          <span className="pill">Last incident: {project.lastIncident}</span>
        </div>

        <div className="grid project-details__grid">
          {PROJECT_METRICS.map((metric) => (
            <div key={metric.key} className="panel panel--sub">
              <div className="metric__label">{metric.label}</div>
              <div className="metric__value metric__value--large">
                {project.metrics[metric.key] ?? "-"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    {currentCheckRun && (
      <div className="panel">
        <div className="page__header">
          <h2 className="page__title">Check Run</h2>
          <span className={`status status--${currentCheckRun.status}`}>{currentCheckRun.status}</span>
        </div>
        <div className="project-details__meta">
          <span className="pill">Checked at: {currentCheckRun.checkedAt}</span>
        </div>
        <div className="grid project-details__grid">
          {Object.entries(currentCheckRun.metrics).map(([key, value]) => (
            <div key={key} className={`panel panel--sub ${evaluateMetric(key as MetricKey, value)}`}>
              <div className="metric__label">{key} </div>
              <div className="metric__value metric__value--large">{value}</div>
            </div>
          ))}
        </div>
        <div className="grid project-details__grid">
          {currentCheckRun.scriptChanges.map((change) => (
            <div key={change.src} className="panel panel--sub">
              <div className="metric__label">{change.type} 
              {change.type === 'weightChanged' && (
                <span>{change.prevKb} -{">"} {change.nextKb} KB</span>
              )}
              </div>
              <div className="metric__value metric__value--large">{change.src}</div>
            </div>
          ))}
        </div>
      </div>
    )}
    {checkRunIssue && (
      <div className="panel">
      <div className="page__header">
        <h2 className="page__title">Проблемы</h2>
      </div>
      <ul className="project-details__rows">
          {checkRunIssue.map((item) => (
            <li key={item.key} className={`issues-list__item issues-list__item--${item.level}`}>
              <div className="issues-list__metric">
                <span className="issues-list__key">{item.key.toUpperCase()}</span>
                <span className={`issues-list__level issues-list__level--${item.level}`}>
                  <span className="issues-list__level-symbol">{item.level === "warning" ? "⚠️" : "❗"}</span> {item.level}
                </span>
              </div>
              <div className="issues-list__details">
                <span className="issues-list__value">Значение: <b>{item.value}</b></span>
                <span className="issues-list__threshold">
                  Порог: <b>{item.threshold}</b>
                </span>
              </div>
            </li>
          ))}
      </ul>

    </div>
    )}
    {checkRunIssue &&(
      <RecentChecks runs={checkRun}/>
    )}
    </>
  );
}
