
export type ProjectStatus = "ok" | "warning" | "error";

export type ProjectMetricKey = "lcp" | "cls" | "inp" | "ttfb" | "seoScore";

export type Project = {
    id: string;
    name: string;
    status: ProjectStatus;
    description: string;
    alerts: number;
    lastIncident: string;
    owner: string;
    metrics: Record<ProjectMetricKey, string>;
  };
