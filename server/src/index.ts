import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./db/prisma";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:5173"],
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/projects", async (req, res) => {
  const { userEmail, name, url } = req.body as {
    userEmail?: string;
    name?: string;
    url?: string;
  };

  if (!userEmail || !name || !url) {
    return res.status(400).json({ error: "userEmail, name, url are required" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { email: userEmail },
      update: {},
      create: { email: userEmail },
    });

    const project = await prisma.project.create({
      data: { userId: user.id, name, url },
    });

    return res.status(201).json(project);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/projects", async (req, res) => {
  const userEmail = req.query.userEmail as string | undefined;
  if (!userEmail) return res.status(400).json({ error: "userEmail is required" });

  try {
    const user = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!user) return res.json([]);

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json(projects);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal error" });
  }
});

app.get("/projects/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "project id is required" });

  try {
    const project = await prisma.project.findUnique({
      where: { id: id },
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
app.get("/projects/:projectId/check-runs", async (req, res) => {
  const { projectId } = req.params;

  try {
    const runs = await prisma.checkRun.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      include: { metrics: true, scripts: true, },
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


app.get("/incidents", async (req, res) => {
  const userEmail = req.query.userEmail as string | undefined;
  if (!userEmail) return res.status(400).json({ error: "userEmail is required" });

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: { id: true },
    });
    if (!user) return res.json([]);

    // Берём проекты пользователя
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    const projectIds = projects.map((p) => p.id);
    if (projectIds.length === 0) return res.json([]);

    // Тянем инциденты только по проектам пользователя
    const incidents = await prisma.incident.findMany({
      where: {
        projectId: { in: projectIds },
      },
      orderBy: [
        // Prisma не умеет сортировать по кастомному приоритету enum/text напрямую,
        // поэтому сортируем ниже вручную
        { createdAt: "desc" },
      ],
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
