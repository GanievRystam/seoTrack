import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cron from "node-cron";
import { prisma } from "./db/prisma";

const app = express();
app.use(express.json());
app.use(cookieParser());

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";
app.use(
  cors({
    origin: [CLIENT_ORIGIN],
    credentials: true,
  })
);

const SESSION_COOKIE = "pm_session";
const JWT_SECRET = process.env.JWT_SECRET ?? "dev_secret";
const SESSION_TTL = "7d";
const PAGESPEED_API_KEY = process.env.PAGESPEED_API_KEY ?? "";

type AuthTokenPayload = {
  userId: string;
  email: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function setSessionCookie(res: express.Response, payload: AuthTokenPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: SESSION_TTL });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
}

type AuditKey =
  | "largest-contentful-paint"
  | "cumulative-layout-shift"
  | "interaction-to-next-paint"
  | "server-response-time";

type Strategy = "mobile" | "desktop";

function pickMetric(audits: Record<string, any>, key: AuditKey): number {
  const v = audits?.[key]?.numericValue;
  return typeof v === "number" ? Math.round(v) : 0;
}

function normalizeMetrics(lhr: any) {
  const audits = lhr?.audits ?? {};
  const scoreRaw = lhr?.categories?.performance?.score;
  const performanceScore = typeof scoreRaw === "number" ? Math.round(Number((scoreRaw * 100).toFixed(2))) : 0;

  return {
    lcp: pickMetric(audits, "largest-contentful-paint"),
    cls: pickMetric(audits, "cumulative-layout-shift"),
    inp: pickMetric(audits, "interaction-to-next-paint"),
    ttfb: pickMetric(audits, "server-response-time"),
    seoScore: performanceScore,
  };
}

function countAlerts(metrics: { lcp: number; cls: number; inp: number; ttfb: number }) {
  let alerts = 0;
  if (metrics.lcp > 4000) alerts += 1;
  if (metrics.cls > 0.25) alerts += 1;
  if (metrics.inp > 500) alerts += 1;
  if (metrics.ttfb > 1800) alerts += 1;
  return alerts;
}

async function runPageSpeed(url: string, strategy: Strategy) {
  if (!PAGESPEED_API_KEY) throw new Error("PAGESPEED_API_KEY is not set");
  const endpoint = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("strategy", strategy);
  endpoint.searchParams.set("key", PAGESPEED_API_KEY);

  const res = await fetch(endpoint);
  
  if (!res.ok) {
    throw new Error(`PageSpeed error: ${res.status}`);
  }
  return res.json();
}

const sseClients = new Map<string, Set<express.Response>>();

function publishSse(projectId: string, payload: unknown) {
  const clients = sseClients.get(projectId);
  if (!clients) return;
  const data = `event: check-run\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

async function runCheckForProject(project: { id: string; url: string }, runId: string) {
  try {
    const [mobileJson, desktopJson] = await Promise.all([
      runPageSpeed(project.url, "mobile"),
      runPageSpeed(project.url, "desktop"),
    ]);

    const mobLhr = mobileJson?.lighthouseResult;
    const descLhr = desktopJson?.lighthouseResult;
    const mob = normalizeMetrics(mobLhr);
    const desc = normalizeMetrics(descLhr);

    const rawJson = {
      mob,
      desc,
      rawJson: {
        mobile: mob,
        desktop: desc,
      },
    };
    await prisma.metricSnapshot.create({
      data: {
        checkRunId: runId,
        rawJson,
      },
    });

    const finishedAt = new Date();
    await prisma.checkRun.update({
      where: { id: runId },
      data: { status: "SUCCESS", finishedAt },
    });

    const totalAlerts = countAlerts(mob) + countAlerts(desc);
    await prisma.project.update({
      where: { id: project.id },
      data: {
        metrics: { mob, desc },
        alerts: totalAlerts,
        lastIncidentAt: totalAlerts > 0 ? finishedAt : null,
      },
    });

    publishSse(project.id, { runId, status: "SUCCESS", finishedAt });
  } catch (e: any) {
    await prisma.checkRun.update({
      where: { id: runId },
      data: { status: "FAIL", finishedAt: new Date(), error: String(e?.message ?? e) },
    });
    publishSse(project.id, { runId, status: "FAIL" });
  }
}

async function enqueueCheckRun(project: { id: string; url: string }) {
  const run = await prisma.checkRun.create({
    data: {
      projectId: project.id,
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  void runCheckForProject(project, run.id);
  return run;
}

async function getUserFromRequest(req: express.Request): Promise<AuthUser | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name };
  } catch {
    return null;
  }
}

async function requireAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized", code: "NO_SESSION" });
  req.user = user;
  next();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/auth/register", async (req, res) => {
  const { email, password, name } = req.body as {
    email?: string;
    password?: string;
    name?: string;
  };

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Name is required", code: "VALIDATION" });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email", code: "VALIDATION" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password too short", code: "VALIDATION" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ error: "Email taken", code: "EMAIL_TAKEN" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email: normalizedEmail, name: name.trim(), passwordHash },
    });

    setSessionCookie(res, { userId: user.id, email: user.email });
    return res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required", code: "VALIDATION" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials", code: "INVALID_CREDENTIALS" });
    }

    setSessionCookie(res, { userId: user.id, email: user.email });
    return res.json({ id: user.id, email: user.email, name: user.name });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/auth/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", secure: false });
  res.json({ ok: true });
});

app.get("/auth/me", async (req, res) => {
  const user = await getUserFromRequest(req);
  if (!user) return res.status(401).json({ error: "Unauthorized", code: "NO_SESSION" });
  return res.json(user);
});

app.post("/projects", requireAuth, async (req, res) => {
  const { name, url } = req.body as {
    name?: string;
    url?: string;
  };

  if (!name || !url) {
    return res.status(400).json({ error: "name and url are required" });
  }

  try {
    const project = await prisma.project.create({
      data: { userId: req.user!.id, name, url },
    });

    return res.status(201).json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/projects", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(projects);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.post("/projects/:id/check-runs", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "project id is required" });

  try {
    const project = await prisma.project.findFirst({
      where: { id, userId: req.user!.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const run = await enqueueCheckRun({ id: project.id, url: project.url });
    res.status(202).json({ ok: true, runId: run.id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/projects/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "project id is required" });

  try {
    const project = await prisma.project.findFirst({
      where: { id: id, userId: req.user!.id },
      include: {
        user: true,
      },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/projects/:id/check-runs/stream", requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).end();

  const project = await prisma.project.findFirst({
    where: { id, userId: req.user!.id },
    select: { id: true },
  });
  if (!project) return res.status(404).end();

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const set = sseClients.get(id) ?? new Set<express.Response>();
  set.add(res);
  sseClients.set(id, set);

  req.on("close", () => {
    set.delete(res);
    if (set.size === 0) sseClients.delete(id);
  });
});

app.get("/projects/:projectId/check-runs", requireAuth, async (req, res) => {
  const { projectId } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: req.user!.id },
      select: { id: true },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const runs = await prisma.checkRun.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { metrics: true, scripts: true },
    });
    const normalized = runs.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      status: r.status,
      createdAt: r.createdAt,
      startedAt: r.startedAt,
      finishedAt: r.finishedAt,
      error: r.error,
      metrics: r.metrics?.rawJson ?? null,
      scripts: r.scripts?.scripts ?? [],
    }));

    res.json(normalized);
  } catch (e: any) {
    console.error("CHECK RUNS ERROR:", e);
    return res.status(500).json({
      error: "Failed to load check runs",
      details: e?.message ?? String(e),
    });
  }
});

app.get("/check-runs/active", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      select: { id: true },
    });
    const projectIds = projects.map((p) => p.id);
    if (projectIds.length === 0) return res.json(null);

    const latestRun = await prisma.checkRun.findFirst({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: { createdAt: "desc" },
      include: { project: { select: { name: true } } },
    });

    if (!latestRun) return res.json(null);
    const active = latestRun.status === "QUEUED" || latestRun.status === "RUNNING";

    return res.json({
      runId: latestRun.id,
      projectId: latestRun.projectId,
      projectName: latestRun.project?.name ?? "",
      status: latestRun.status,
      active,
      startedAt: latestRun.startedAt,
      finishedAt: latestRun.finishedAt,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load active check runs" });
  }
});

app.get("/incidents", requireAuth, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.id },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);
    if (projectIds.length === 0) return res.json([]);

    const incidents = await prisma.incident.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: [{ createdAt: "desc" }],
    });

    const priority = (lvl: string) => (lvl === "critical" ? 2 : 1);

    incidents.sort((a, b) => {
      return priority(b.level) - priority(a.level) || +new Date(b.createdAt) - +new Date(a.createdAt);
    });

    res.json(
      incidents.map((i) => ({
        id: i.id,
        projectId: i.projectId,
        projectName: i.projectName,
        metric: i.metric,
        level: i.level,
        timeText: i.timeText,
        createdAt: i.createdAt,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to load incidents" });
  }
});

cron.schedule("0 * * * *", async () => {
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, url: true },
    });
    console.log(projects)
    for (const project of projects) {
      const active = await prisma.checkRun.findFirst({
        where: {
          projectId: project.id,
          status: { in: ["QUEUED", "RUNNING"] },
        },
        select: { id: true },
      });
      if (active) continue;
      await enqueueCheckRun(project);
    }
  } catch (e) {
    console.error("CRON CHECK RUN ERROR:", e);
  }
});

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
