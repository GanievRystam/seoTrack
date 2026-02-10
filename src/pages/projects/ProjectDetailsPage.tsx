import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { ProjectChart } from "./ProjectChart";
import type { CheckRun } from "../../shared/types/run";
import { getIssues } from "../../shared/lib/metricThresholds";
import { RecentChecks } from "./RecentChecks";
import { PROJECT_METRICS } from "../../shared/lib/projectMetrics";
import { useGetProjectQuery, useGetCheckRunsQuery, useStartCheckRunMutation } from "../../entities/project/api/projectsApi";
export function ProjectDetailsPage() {
  const { id, historyId } = useParams();
  const [startCheckRun] = useStartCheckRunMutation();
  const {
    data: projectData,
    error: projectError,
    isLoading: isProjectLoading,
    isFetching: isProjectFetching,
  } = useGetProjectQuery(id as string, { skip: !id });

  const {
    data: checkRunsData,
    error: checkRunsError,
    refetch: checkRunsRefetch,
    isLoading: isCheckRunsLoading,
    isFetching: isCheckRunsFetching,
  } = useGetCheckRunsQuery(id as string, { skip: !id });

  const project = projectData;
  const checkRuns = checkRunsData;
  const currentCheckRun: CheckRun | undefined = id
  ? (() => {
      if (!checkRuns || checkRuns.length === 0) return undefined;
      if (historyId) {
        return checkRuns.find((run: CheckRun) => run.id === historyId);
      }

      if (!Array.isArray(checkRuns) || checkRuns.length === 0) {
        return undefined;
      }
      return checkRuns.reduce((latest, current) => {
        const getTimestamp = (run: CheckRun) => {
          const ts = Date.parse(run.createdAt);
          return isNaN(ts) ? run.createdAt : ts;
        };
        return getTimestamp(current) > getTimestamp(latest) ? current : latest;
      }, checkRuns[0]);
    })()
  : undefined;
  const [isStarting, setIsStarting] = useState(false);
  const isPending =
    currentCheckRun?.status === "RUNNING" || currentCheckRun?.status === "QUEUED";


  const [metricView, setMetricView] = useState<"desc" | "mob">("desc");

  const safeCurrentMetrics =
    currentCheckRun && currentCheckRun.metrics && typeof currentCheckRun.metrics === "object"
      ? currentCheckRun.metrics[metricView] || {}
      : {};

  const checkRunIssue =
    currentCheckRun && safeCurrentMetrics
      ? getIssues(safeCurrentMetrics)
      : undefined;

  const chartRuns =
    Array.isArray(checkRuns)
      ? checkRuns.filter((run: CheckRun) => run?.metrics?.[metricView])
      : [];

  const metricPercents: Record<string, { good: number; betterToBeLower: boolean }> = {
    lcp: { good: 2500, betterToBeLower: true },
    cls: { good: 0.1, betterToBeLower: true },
    inp: { good: 200, betterToBeLower: true },
    ttfb: { good: 800, betterToBeLower: true },
    seoScore: { good: 100, betterToBeLower: false },
  };

  const radius = 42.5;
  const circumference = 2 * Math.PI * radius;

  // Defensive: for metrics panel, allow for empty/undefined metrics in project/selected run
  const safeProjectMetrics =
    project && project.metrics && typeof project.metrics === "object"
      ? project.metrics[metricView] || {}
      : {};

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

        {checkRuns && (
          <div className="panel panel-mainText">
            <div className="page__header">
              <div>
                <h1 className="page__title">{project.name}</h1>
                <p className="page__subtitle">{project.description}</p>
              </div>
              <button
                className="button button--primary"
                type="button"
                disabled={isStarting || isPending}
                onClick={async () => {
                  if (!id) return;
                  setIsStarting(true);
                  try {
                    await  startCheckRun(id).unwrap();
                  } finally {
                    setIsStarting(false);
                  }
                }}
              >
                {isStarting
                  ? "Запускаем..."
                  : isPending
                  ? "Ожидайте"
                  : "Запустить проверку"}
              </button>
            </div>

            <div className="project-details__meta">
              <span className="pill">Owner: {project.user?.email ?? "-"}</span>
              <span className="pill">Open alerts: {project.alerts ?? 0}</span>
              <span className="pill">
                Last incident:
                {currentCheckRun?.finishedAt && project.lastIncidentAt
                  ? new Date(project.lastIncidentAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "N/A"}
              </span>
            </div>
            <div className="switch-type-data">
              <button
                className="button button--secondary"
                type="button"
                aria-pressed={metricView === "desc"}
                onClick={() => setMetricView("desc")}
              >
                Десктоп
              </button>
              <button
                className="button button--secondary"
                type="button"
                aria-pressed={metricView === "mob"}
                onClick={() => setMetricView("mob")}
              >
                Мобайл
              </button>
            </div>
            <div className="project-details__flex">
              {PROJECT_METRICS.map((metric) => {
                // Defensive: get for each metric value from safeProjectMetrics
                const value = safeProjectMetrics?.[metric.key];
                const config =
                  metricPercents[metric.key as string] || {
                    good: 1,
                    betterToBeLower: false,
                  };
                let percentFilled = 0;

                if (typeof value === "number" && config.good > 0) {
                  if (config.betterToBeLower) {
                    percentFilled = Math.max(0, Math.min(1, config.good / value));
                  } else {
                    percentFilled = Math.max(0, Math.min(1, value / config.good));
                  }
                }
                percentFilled = Math.min(percentFilled, 1);
                const strokeDashoffset = circumference * (1 - percentFilled);

                return (
                  <div className="metric-panel-wrap" key={metric.key}>
                    <div
                      className={`panel panel--sub metric-panel metric-panel-${metric.key}`}
                    >
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
                            {typeof value === "number" && (
                              <circle
                                className="metric-panel-fill"
                                cx="49.5"
                                cy="49.5"
                                r={radius}
                                stroke="#2778f7"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{
                                  transition:
                                    "stroke-dashoffset 0.6s cubic-bezier(.25,.8,.25,1)",
                                }}
                                transform="rotate(-90 49.5 49.5)"
                              />
                            )}
                          </svg>
                          <div className="metric__value metric__value--large metric__value--progress">
                            {typeof value === "number" ? value : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="metric__label">{metric.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {checkRuns && historyId === undefined ? (
          chartRuns.length > 1 ? (
            <ProjectChart checkRuns={chartRuns} metricView={metricView} />
          ) : (
            <div className="panel panel--empty panel--first-run">
              <div className="panel__content">
                {checkRuns.length === 0 ? (
                  <h2 className="panel__title">
                    Сделай свой первый запуск для {project.name}
                  </h2>
                ) : (
                  <h2 className="panel__title">
                    Слишком мало данных для {project.name}
                  </h2>
                )}
                <p className="panel__subtitle">
                  Для отображения графика истории метрик нужно хотя бы два запуска проверки. Запустите проверку проекта, чтобы начать сбор статистики!
                </p>
                <button
                  className="button"
                  type="button"
                  disabled={isStarting || isPending}
                  onClick={async () => {
                    if (!id) return;
                    setIsStarting(true);
                    try {
                      await startCheckRun(id).unwrap();
                    } finally {
                      setIsStarting(false);
                    }
                  }}
                >
                  {isStarting
                    ? "Запускаем..."
                    : isPending
                    ? "Ожидайте..."
                    : "Запустить проверку"}
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>
      {/* Список скриптов (script list) */}
      <div className="panel">
        <h2 className="section__header">Сторонние и внутренние скрипты</h2>
        {Array.isArray(currentCheckRun?.scripts) && currentCheckRun.scripts.length > 0 ? (
          <ul className="scripts-list project-details__rows">
            {currentCheckRun.scripts.map((script: any, idx: number) => (
              <li key={script.url ?? idx} className="scripts-list__item">
                <div className="issues-list__item">
                  <div className="scripts-list__domain">
                    <b>{script.domain}</b>
                  </div>
                  <div className="scripts-list__main issues-list__key">
                    <span
                      className={`scripts-list__type scripts-list__type--${script.type}`}
                      title={
                        script.type === "third-party" ? "Сторонний" : "Внутренний"
                      }
                    >
                      {script.type === "third-party" ? "Сторонний" : "Внутренний"}
                    </span>
                  </div>
                  <div className="scripts-list__desc">
                    <span className="scripts-list__impact">
                      <b>+{script.impactMs} мс</b>
                    </span>
                  </div>
                </div>
                <div className="scripts-list__impact-desc">
                  {script.impactDescription}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel__empty">Нет подключённых скриптов.</div>
        )}
      </div>
      {checkRunIssue && (
        <div className="panel">
          <h2 className="section__header">Проблемы</h2>
          <ul className="project-details__rows">
            {checkRunIssue.map((item) => (
              <li
                key={item.key}
                className={`issues-list__item issues-list__item--${item.level}`}
              >
                <div className="issues-list__metric">
                  <span className="issues-list__key">{item.key.toUpperCase()}</span>
                  <span
                    className={`issues-list__level issues-list__level--${item.level}`}
                  >
                    <span className="issues-list__level-symbol">
                      {item.level === "warning" ? "⚠️" : "❗"}
                    </span>{" "}
                    {item.level}
                  </span>
                </div>
                <div className="issues-list__details">
                  <span className="issues-list__value">
                    Значение: <b>{item.value}</b>
                  </span>
                  <span className="issues-list__threshold">
                    Порог: <b>{item.threshold}</b>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      {checkRunIssue && <RecentChecks runs={chartRuns} metricView={metricView} />}
    </>
  );
}
