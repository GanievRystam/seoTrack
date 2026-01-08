import { readJson, writeJson } from "./storage";
import { uid } from "../lib/id";
import { getSessionUser } from "./authStore";
import type { Project } from "../types/project";
import type { CheckRun } from "../types/run";

const CHECK_RUNS_KEY = "pm_check_runs_v1";
const PROJECTS_KEY = "pm_projects_v1";

function loadAll(): Project[] {
  
  return readJson<Project[]>(PROJECTS_KEY, []);
}

function saveAll(items: Project[]) {
  writeJson(PROJECTS_KEY, items);
}
function loadRuns(): CheckRun[] {
  return readJson<CheckRun[]>(CHECK_RUNS_KEY, []);
}
export function getCheckRunByProjectId(projectId: string): CheckRun[] {

  return loadRuns().filter((run) => run.projectId === projectId);
}
export function listMyProjects(): Project[] {
  const user = getSessionUser();
  if (!user) return [];
  return loadAll().filter((p) => p.owner === user.id);
}
export function getProjectById(id: string): Project | undefined {
  const userProjects = listMyProjects();
  return userProjects.find((p) => p.id === id);
}


export function createProject(input: { name: string; url: string }): Project {
  const user = getSessionUser();
  if (!user) throw new Error("No session");

  const all = loadAll();

  const project: Project = {
    id: uid("proj"),
    name: input.name.trim(),
    status: "ok",

    description: input.url.trim(),
    alerts: 0,
    lastIncident: "-",
    owner: user.id,

    metrics: {
      lcp: "-",
      cls: "-",
      inp: "-",
      ttfb: "-",
      seoScore: `${Math.floor(60 + Math.random() * 41)}/100`,
    },
  };

  all.unshift(project);
  saveAll(all);
  return project;
}
