
export type ProjectStatus = "ok" | "warning" | "error";

export type ProjectMetricKey = "lcp" | "cls" | "inp" | "ttfb" | "seoScore";

export type Metrics = {
  mob: Record<ProjectMetricKey, number>;
  desc: Record<ProjectMetricKey, number>;
};
export type ProjectScript = {
  url: string;
  domain: string;
  type: string;
  impactMs: number; // Насколько сильно замедляет, в миллисекундах
  impactDescription: string; // Описание влияния
};
export type Project = {
    id: string;
    name: string;
    status: ProjectStatus;
    description: string;
    alerts: number;
    lastIncidentAt: string;
    user: {
      id: string,
      email: string,
      createAt:string,
      name: string
    };
    metrics: Metrics;
    scripts:ProjectScript[]
  };
