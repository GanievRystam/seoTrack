import type { CheckRun } from "../types/run";

// src/shared/api/projects.ts
const API_URL = import.meta.env.VITE_API_URL as string;

async function apiFetch(input: RequestInfo, init?: RequestInit) {

  const res = await fetch(input, { credentials: "include", ...init });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res;
}

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
  impactMs: number;
  impactDescription: string; 
};
export type Project = {
    id: string;
    name: string;
    status: ProjectStatus;
    description: string;
    alerts: number;
    lastIncident: string;
    owner: string;
    metrics: Metrics;
    scripts:ProjectScript[]
  };
  export type IncidentLevel = "warning" | "critical";

export type IncidentItem = {
  id: string;
  projectId: string | null;
  projectName: string;
  metric: string;
  level: IncidentLevel;
  timeText: string;
  createdAt: string;
};

export async function getProjects(): Promise<Project[]> {
  const res = await apiFetch(`${API_URL}/projects`);
  return res.json();
}
export async function getProject(id: string): Promise<Project> {
  const res = await apiFetch(`${API_URL}/projects/${encodeURIComponent(id)}`);
  return res.json();
}

export async function fetchProjects() {
  const res = await apiFetch(`${API_URL}/projects`);
  return (await res.json()) as Project[];
}

export async function fetchIncidents() {
  const res = await apiFetch(`${API_URL}/incidents`);
  return res.json();
}

export async function fetchCheckRuns(projectId: string): Promise<CheckRun[]> {
    const res = await apiFetch(`${API_URL}/projects/${projectId}/check-runs`);
    return res.json();
  }

export async function startCheckRun(projectId: string): Promise<{ ok: boolean; runId: string }> {
  const res = await apiFetch(`${API_URL}/projects/${projectId}/check-runs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return res.json();
}

export type ActiveCheckRun = {
  runId: string;
  projectId: string;
  projectName: string;
  status: "QUEUED" | "RUNNING" | "SUCCESS" | "FAIL";
  active: boolean;
  startedAt?: string | null;
  finishedAt?: string | null;
} | null;

export async function fetchActiveCheckRun(): Promise<ActiveCheckRun> {
  const res = await apiFetch(`${API_URL}/check-runs/active`);
  return res.json();
}

export async function createProject(input: {
  name: string;
  url: string;
}): Promise<Project> {
  const res = await apiFetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return res.json();
}
