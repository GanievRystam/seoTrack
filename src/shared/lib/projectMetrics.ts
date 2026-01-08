import type { ProjectMetricKey } from "../types/project";

export type ProjectMetricConfig = {
  key: ProjectMetricKey;
  label: string;
};

export const PROJECT_METRICS: ProjectMetricConfig[] = [
  { key: "lcp", label: "LCP" },
  { key: "cls", label: "CLS" },
  { key: "inp", label: "INP" },
  { key: "ttfb", label: "TTFB" },
  { key: "seoScore", label: "SEO score" },
];
