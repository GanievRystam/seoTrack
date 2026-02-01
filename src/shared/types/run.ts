export type RunStatus = "ok" | "warning" | "critical";

export type MetricKey = "lcp" | "cls" | "inp" | "ttfb" | "pageWeightKb";

export type Metrics = {
  rawJson: any;
  mob: Record<MetricKey, number>;
  desc: Record<MetricKey, number>;
};
export type ScriptChange =
  | { type: "added"; src: string }
  | { type: "removed"; src: string }
  | { type: "weightChanged"; src: string; prevKb: number; nextKb: number };

export type ScriptInfo = {
  domain: string;
  impactDescription: string;
  impactMs: number;
  sizeKb: number;
  type: "third-party" | "internal";
  url: string;
};

export type CheckRun = {
  id: string;
  projectId: string;
  finishedAt: string;
  status: RunStatus;
  metrics: Metrics;
  scriptChanges: ScriptChange[];
  scripts: ScriptInfo[];
};
