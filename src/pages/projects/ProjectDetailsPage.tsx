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
        <div className="panel panel-mainText">
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
      {checkRun && checkRun.length > 1 && (
        <div className="panel panel-mainText">
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
          
          <div className="project-details__flex">
            {PROJECT_METRICS.map((metric) => (
              <div className="metric-panel-wrap">
                <div key={metric.key} className={`panel panel--sub metric-panel metric-panel-${metric.key}`}>
                  <div className="metric-panel__content">
                    <div className="metric__progress-circle">
                      <svg width="99" height="99" viewBox="0 0 99 99">
                        <circle
                          cx="49.5"
                          cy="49.5"
                          r="42.5"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle 
                          className="metric-panel-fill"
                          cx="49.5"
                          cy="49.5"
                          r="42.5"
                          stroke="#2778f7"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 42.5}
                          strokeDashoffset='22'
                          strokeLinecap="round"
                          style={{
                            transition: 'stroke-dashoffset 0.6s cubic-bezier(.25,.8,.25,1)'
                          }}
                          transform="rotate(-90 49.5 49.5)" // Добавлено вращение, чтобы заполнение начиналось с 12 часов
                        />
                      </svg>
                      <div className="metric__value metric__value--large metric__value--progress">
                        {project.metrics[metric.key] ?? "-"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="metric__label">{metric.label}</div>
              </div>
            ))}
          </div>
          
        </div>
        )}
        {checkRun && historyId === undefined ? (
          checkRun.length > 1 ? (
            <ProjectChart checkRun={checkRun} />
          ) : (
            <div className="panel panel--empty panel--first-run">
              <div className="panel__content">
                <h2 className="panel__title">Сделай свой первый запуск для {project.name}</h2>
                <p className="panel__subtitle">Для отображения графика истории метрик нужно хотя бы два запуска проверки. Запустите проверку проекта, чтобы начать сбор статистики!</p>
                <button className="button">Запустить проверку</button>
              </div>
            </div>
          )
        ) : null}


      </div>

      {checkRunIssue && (
        <div className="panel">
            <h2 className="section__header">Проблемы</h2>
          
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
      {checkRunIssue && (
        <RecentChecks runs={checkRun} />
      )}
    </>
  );
}
