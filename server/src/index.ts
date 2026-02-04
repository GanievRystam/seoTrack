import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

const PORT = Number(process.env.PORT ?? 4000);
app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
