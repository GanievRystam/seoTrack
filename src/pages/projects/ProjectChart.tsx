import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import type { MetricKey } from "../../shared/types/run";

type ProjectChartProps = {
  checkRun: Array<{
    checkedAt: string;
    metrics: Record<MetricKey, number>;
  }>;
};
const TABS: { key: MetricKey; label: string }[] = [
  { key: "lcp", label: "LCP" },
  { key: "cls", label: "CLS" },
  { key: "inp", label: "INP" },
  { key: "ttfb", label: "TTFB" },
];


export function ProjectChart({ checkRun }: ProjectChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("lcp");
  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    const getData = checkRun.map(run => run.metrics[selectedMetric]);
    const labels = checkRun.map(run => run.checkedAt);

    const chartInstance = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: getData,
            borderColor: "rgba(59,130,246,0.7)",
            backgroundColor: "rgba(59,130,246,0.13)",
            fill: true,
            tension: 0.2,
          }
          
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [checkRun, selectedMetric]);

  return (
    <div className="panel-chart">
      <canvas ref={chartRef}></canvas>
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
    </div>
  );
}