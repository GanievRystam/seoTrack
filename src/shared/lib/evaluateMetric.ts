import type { ProjectMetricKey } from "../types/metrics";
import { METRIC_THRESHOLDS, type MetricLevel } from "./metricThresholds";

export function evaluateMetric(
  key: ProjectMetricKey,
  value: number
): MetricLevel {
  const t = METRIC_THRESHOLDS;
  if (!t) return "good";
  const thresholds = t[key];
  if (!thresholds) return "good";
  if (value <= thresholds.good) return "good";
  if (value <= thresholds.warning) return "warning";
  return "critical";
}