export type ProjectMetricKey = "lcp" | "cls" | "inp" | "ttfb" | "seoScore";

export type Metrics = {
  mob: Record<ProjectMetricKey, number>;
  desc: Record<ProjectMetricKey, number>;
};

export type MetricView = "desc" | "mob";