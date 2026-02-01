import { readJson, writeJson } from "./storage";
import type { Project, ProjectScript } from "../types/project";
import type { CheckRun } from "../types/run";

const PROJECTS_KEY = "pm_projects_v1";
const CHECK_RUNS_KEY = "pm_check_runs_v1";


const scripts: ProjectScript[] = [
  {
    url: "https://www.googletagmanager.com/gtm.js",
    domain: "googletagmanager.com",
    type: "third-party",
    impactMs: 220,
    impactDescription: "Может задерживать отображение страницы из-за загрузки стороннего контейнера, особенно если интернет медленный."
  },
  {
    url: "https://connect.facebook.net/en_US/fbevents.js",
    domain: "facebook.net",
    type: "third-party",
    impactMs: 170,
    impactDescription: "Добавляет отслеживание от Facebook, может негативно влиять на метрику FCP при медленном соединении."
  },
  {
    url: "https://cdn.somewidget.com/widget.js",
    domain: "somewidget.com",
    type: "third-party",
    impactMs: 140,
    impactDescription: "Виджет может блокировать thread и увеличить время реагирования страницы и загрузку героев."
  }
];

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
        desc: {
          lcp: 2500,
          cls: 0.07,
          inp: 120,
          ttfb: 140,
          seoScore: 78,
        },
        mob: {
          lcp: 3110,
          cls: 0.18,
          inp: 220,
          ttfb: 1190,
          seoScore: 72,
        }
      },
      scripts: scripts
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
        desc: {
          lcp: 1700,
          cls: 0.02,
          inp: 90,
          ttfb: 160,
          seoScore: 84,
        },
        mob: {
          lcp: 1340,
          cls: 0.09,
          inp: 70,
          ttfb: 840,
          seoScore: 79,
        }
      },
      scripts: scripts
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
        desc: {
          lcp: 2950,
          cls: 0.19,
          inp: 233,
          ttfb: 270,
          seoScore: 63,
        },
        mob: {
          lcp: 3680,
          cls: 0.28,
          inp: 440,
          ttfb: 1480,
          seoScore: 58,
        }
      },
      scripts: scripts
    },
  ];

  const seedRuns: CheckRun[] = [
    {
      id: "checkRun1",
      projectId: "proj_6501f60678a0c_19b9d5beca6",
      checkedAt: "12.08.2025 16:07",
      status: "ok",
      metrics: {
        desc: {
          lcp: 2420,
          cls: 0.06,
          inp: 112,
          ttfb: 130,
          pageWeightKb: 1030,
        },
        mob: {
          lcp: 2890,
          cls: 0.13,
          inp: 100,
          ttfb: 980,
          pageWeightKb: 242,
        }
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1000, nextKb: 1030 },
      ],
    },
    {
      id: "checkRun2",
      projectId: "aurora-store",
      checkedAt: "12.09.2025 18:07",
      status: "warning",
      metrics: {
        desc: {
          lcp: 2600,
          cls: 0.11,
          inp: 140,
          ttfb: 180,
          pageWeightKb: 1021,
        },
        mob: {
          lcp: 3450,
          cls: 0.24,
          inp: 310,
          ttfb: 1320,
          pageWeightKb: 251,
        }
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1030, nextKb: 1021 },
      ],
    },
    {
      id: "checkRun3",
      projectId: "aurora-store",
      checkedAt: "12.10.2025 11:07",
      status: "critical",
      metrics: {
        desc: {
          lcp: 3240,
          cls: 0.17,
          inp: 188,
          ttfb: 200,
          pageWeightKb: 985,
        },
        mob: {
          lcp: 3874,
          cls: 0.36,
          inp: 590,
          ttfb: 1400,
          pageWeightKb: 267,
        }
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 1021, nextKb: 985 },
      ],
    },
    {
      id: "checkRun4",
      projectId: "aurora-store",
      checkedAt: "12.11.2025 11:07",
      status: "critical",
      metrics: {
        desc: {
          lcp: 2340,
          cls: 0.09,
          inp: 159,
          ttfb: 165,
          pageWeightKb: 995,
        },
        mob: {
          lcp: 3090,
          cls: 0.21,
          inp: 260,
          ttfb: 1250,
          pageWeightKb: 239,
        }
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 985, nextKb: 995 },
      ],
    },
    {
      id: "checkRun5",
      projectId: "aurora-store",
      checkedAt: "12.12.2025 11:07",
      status: "critical",
      metrics: {
        desc: {
          lcp: 2175,
          cls: 0.13,
          inp: 153,
          ttfb: 158,
          pageWeightKb: 1043,
        },
        mob: {
          lcp: 2942,
          cls: 0.19,
          inp: 174,
          ttfb: 1197,
          pageWeightKb: 248,
        }
      },
      scriptChanges: [
        { type: "added", src: "https://www.google.com/js/v1/api.js" },
        { type: "removed", src: "https://www.google.com/js/v1/api.js" },
        { type: "weightChanged", src: "https://www.google.com/js/v1/api.js", prevKb: 995, nextKb: 1043 },
      ],
    },
  ];

  writeJson(PROJECTS_KEY, seedProjects);
  writeJson(CHECK_RUNS_KEY, seedRuns);
}
