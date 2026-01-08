import { readJson, writeJson } from "./storage";
import type { Project } from "../types/project";
import type { CheckRun } from "../types/run";

const PROJECTS_KEY = "pm_projects_v1";
const CHECK_RUNS_KEY = "pm_check_runs_v1";

export function seedProjectsOnce() {
  const existingProjects = readJson<Project[]>(PROJECTS_KEY, []);
  const existingRuns = readJson<CheckRun[]>(CHECK_RUNS_KEY, []);
  if (existingProjects.length > 0 || existingRuns.length > 0) return;

  const seedProjects: Project[] = [
    {
      id: "aurora-store",
      name: "Aurora Storefront",
      status: "warning",
      description: "Core Web Vitals are fluctuating after the latest release. Monitoring SEO crawl budget weekly.",
      alerts: 3,
      lastIncident: "2 hours ago",
      owner: "user_seed_1",
      metrics: {
        lcp: "3.1s",
        cls: "0.04",
        inp: "120ms",
        ttfb: "420ms",
        seoScore: "82/100",
      },
    },
    {
      id: "nova-mobile",
      name: "Nova Mobile",
      status: "ok",
      description: "Mobile-only catalog with aggressive caching. Monitoring for sudden TTFB regressions.",
      alerts: 0,
      lastIncident: "6 days ago",
      owner: "user_seed_1",
      metrics: {
        lcp: "2.5s",
        cls: "0.02",
        inp: "95ms",
        ttfb: "310ms",
        seoScore: "91/100",
      },
    },
    {
      id: "orion-b2b",
      name: "Orion B2B Portal",
      status: "error",
      description: "Checkout funnel under investigation after latency spikes. SEO pages slowly re-indexing.",
      alerts: 7,
      lastIncident: "43 minutes ago",
      owner: "user_seed_1",
      metrics: {
        lcp: "4.6s",
        cls: "0.18",
        inp: "420ms",
        ttfb: "980ms",
        seoScore: "68/100",
      },
    },
  ];

  const seedRuns: CheckRun[] = [
    {
      id: "checkRun1",
      projectId: "proj_6501f60678a0c_19b9d5beca6",
      checkedAt: "2025-08-12T16:07:00Z",
      status: "ok",
      metrics: {
        lcp: 2500,
        cls: 0.04,
        inp: 100,
        ttfb: 100,
        pageWeightKb: 1000,
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1000, nextKb: 1000 },
      ],
    },
    {
      id: "checkRun2",
      projectId: "proj_6501f60678a0c_19b9d5beca6",
      checkedAt: "2025-09-12T16:07:00Z",
      status: "warning",
      metrics: {
        lcp: 3500,
        cls: 0.2,
        inp: 250,
        ttfb: 400,
        pageWeightKb: 777,
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1000, nextKb: 1000 },
      ],
    },
    {
      id: "checkRun3",
      projectId: "aurora-store",
      checkedAt: "2025-10-12T16:07:00Z",
      status: "critical",
      metrics: {
        lcp: 4500,
        cls: 0.4,
        inp: 650,
        ttfb: 2100,
        pageWeightKb: 2200,
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1000, nextKb: 1000 },
      ],
    },
  ];

  writeJson(PROJECTS_KEY, seedProjects);
  writeJson(CHECK_RUNS_KEY, seedRuns);
}
