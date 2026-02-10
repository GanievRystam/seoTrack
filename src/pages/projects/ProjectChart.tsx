import { useEffect, useMemo, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { MetricKey, Metrics } from "../../shared/types/run";

type ProjectChartProps = {
  checkRuns: Array<{
    finishedAt: string;
    metrics: Metrics;
  }>;
  metricView: "desc" | "mob";
};

const TABS: { key: MetricKey; label: string }[] = [
  { key: "lcp", label: "LCP" },
  { key: "cls", label: "CLS" },
  { key: "inp", label: "INP" },
  { key: "ttfb", label: "TTFB" },
];

const METRIC_COLOR: Record<MetricKey, { stroke: string; fill: string }> = {
  lcp: { stroke: "rgba(59,130,246,0.85)", fill: "rgba(59,130,246,0.16)" },
  cls: { stroke: "rgba(168,85,247,0.85)", fill: "rgba(168,85,247,0.16)" },
  inp: { stroke: "rgba(245,158,11,0.85)", fill: "rgba(245,158,11,0.14)" },
  ttfb: { stroke: "rgba(20,184,166,0.85)", fill: "rgba(20,184,166,0.14)" },
  pageWeightKb: {
    stroke: "",
    fill: ""
  }
};

export function ProjectChart({ checkRuns, metricView = "desc" }: ProjectChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("lcp");
  const sortedRuns = useMemo(
    () =>
      [...checkRuns].sort(
        (a, b) => new Date(a.finishedAt).getTime() - new Date(b.finishedAt).getTime()
      ),
    [checkRuns]
  );
  const labels = useMemo(
    () =>
      sortedRuns.map((r) => {
        const d = new Date(r.finishedAt);
        return `${d
          .toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })} ${d
          .toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;
      }),
    [sortedRuns]
  );
  const data = useMemo(
    () => sortedRuns.map((r) => r.metrics[metricView][selectedMetric]),
    [sortedRuns, metricView, selectedMetric]
  );

  useEffect(() => {
    if (!chartRef.current) return;
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const { stroke, fill } = METRIC_COLOR[selectedMetric];
    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: selectedMetric.toUpperCase(),
            data,
            borderColor: stroke,
            backgroundColor: fill,
            fill: true,
            tension: 0.35,

            // points
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHitRadius: 14,
            pointBackgroundColor: stroke,
            pointBorderColor: "rgba(15,23,42,0.9)", // под твой dark bg
            pointBorderWidth: 2,

            // line
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false, // важно: высоту задаём через CSS

        interaction: {
          mode: "index",
          intersect: false,
        },

        plugins: {
          legend: { display: false },

          tooltip: {
            enabled: true,
            displayColors: false,
            padding: 10,
            backgroundColor: "rgba(17,24,39,0.95)",
            titleColor: "rgba(229,231,235,0.95)",
            bodyColor: "rgba(229,231,235,0.95)",
            borderColor: "rgba(255,255,255,0.10)",
            borderWidth: 1,
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                // без форматтера — просто красиво:
                return ` ${selectedMetric.toUpperCase()}: ${Number.isFinite(v) ? v : "-"}`;
              },
            },
          },
        },

        scales: {
          x: {
            grid: {
              color: "rgba(255,255,255,0.06)",
            },
            border: {
              width: 0,
            },
            ticks: {
              color: "rgba(156,163,175,0.9)",
              maxTicksLimit: 7,
            },
          },
          y: {
            grid: {
              color: "rgba(255,255,255,0.06)",
            },
            border: {
              width: 0,
            },
            ticks: {
              color: "rgba(156,163,175,0.9)",
            },
          },
        },
        
      },
    });

    return () => chartInstance.destroy();
  }, [labels, data, selectedMetric]);

  return (
    <div className="panel-chart">
      
      <div className="panel-chart__tabs">
        {TABS.map((t) => (
          <div
            key={t.key}
            className={
              `${selectedMetric === t.key
                ? "panel-chart__tab panel-chart__tab--active"
                : "panel-chart__tab"} panel-chart__tab-${t.label}`
            }
            onClick={() => setSelectedMetric(t.key)}
            role="button"
            tabIndex={0}
          >
            {t.label}
          </div>
        ))}
      </div>
      <div className="panel-chart__canvas">
        <canvas ref={chartRef} height={260}/>
      </div>

    </div>
  );
}
