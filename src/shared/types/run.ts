export type RunStatus = "ok" | "warning" | "critical";

export type MetricKey = "lcp" | "cls" | "inp" | "ttfb" | "pageWeightKb";

export type ScriptChange =
  | { type: "added"; src: string }
  | { type: "removed"; src: string }
  | { type: "weightChanged"; src: string; prevKb: number; nextKb: number };

export type CheckRun = {
  id: string;
  projectId: string;
  checkedAt: string;
  status: RunStatus;
  metrics: Record<MetricKey, number>;
  scriptChanges: ScriptChange[];
};
