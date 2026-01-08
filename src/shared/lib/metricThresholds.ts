import type { MetricKey } from "../types/run";

import { evaluateMetric } from "./evaluateMetric";
export type MetricLevel = "good" | "warning" | "critical";
type Threshold = {
    good: number;
    warning: number;
}
export const METRIC_THRESHOLDS: Record<MetricKey, Threshold> = {
    lcp: { good: 2500, warning: 4000 },
    cls: { good: 0.1, warning: 0.25 },
    inp: { good: 200, warning: 500 },
    ttfb: { good: 800, warning: 1800 },
    pageWeightKb: { good: 1000, warning: 2000 },
  };


export type Issue = {
  key: MetricKey;
  level: "warning" | "critical";
  value: number;
  threshold: number; // warning threshold для warning, иначе warning threshold? (см. ниже)
};

export function getIssues(metrics: Record<MetricKey, number>): Issue[] {
  const keys = Object.keys(metrics) as MetricKey[];
    
  return keys
    .map((key) => {
      const value = metrics[key];
      const level = evaluateMetric(key, value);
      if (level === "good") return null;

      const t = METRIC_THRESHOLDS[key];
      const threshold = level === "warning" ? t.good : t.warning;

      return { key, level, value, threshold };
    })
    .filter(Boolean) as Issue[];
}
