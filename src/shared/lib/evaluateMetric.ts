import type { MetricKey } from "../types/run";
import { METRIC_THRESHOLDS, type MetricLevel } from "./metricThresholds";

export function evaluateMetric(
  key: MetricKey,
  value: number
): MetricLevel {
  const t = METRIC_THRESHOLDS[key];

  if (value <= t.good) return "good";
  if (value <= t.warning) return "warning";
  return "critical";
}
