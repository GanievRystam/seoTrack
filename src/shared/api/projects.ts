import type { CheckRun } from "../types/run";

// src/shared/api/projects.ts
const API_URL = import.meta.env.VITE_API_URL as string;

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
  metric: string;         // можно потом сделать union: "TTFB" | "LCP" | ...
  level: IncidentLevel;
  timeText: string;
  createdAt: string;      // ISO строка
};

export async function getProjects(userEmail: string): Promise<Project[]> {
  const res = await fetch(
    `${API_URL}/projects?userEmail=${encodeURIComponent(userEmail)}`
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}

export async function fetchProjects(userEmail: string) {
    const res = await fetch(
      `${API_URL}/projects?userEmail=${encodeURIComponent(userEmail)}`
    );
  
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as Project[];
  }

export async function fetchIncidents(params:string) {
  const res = await fetch(
    `${API_URL}/incidents?userEmail=${encodeURIComponent('demo@demo.com')}`
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

  export async function fetchCheckRuns(projectId: string): Promise<CheckRun[]> {
    const res = await fetch(`${API_URL}/projects/${projectId}/check-runs`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

export async function createProject(input: {
  userEmail: string;
  name: string;
  url: string;
}): Promise<Project> {
  const res = await fetch(`${API_URL}/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}
