import type { MetricKey } from "../types/run";
import { METRIC_THRESHOLDS, type MetricLevel } from "./metricThresholds";

export function evaluateMetric(
  key: MetricKey,
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