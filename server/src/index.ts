import cors from "cors";
import express from "express";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import { eventsRouter } from "./routes/events.js";
import { memoriesRouter } from "./routes/memories.js";
import { store } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

app.get("/api/users", (_req, res) => res.json(store.users));
app.use("/api/events/:id/memories", memoriesRouter);
app.use("/api/events", eventsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// In production this server also serves the built client, so the whole app is one URL/one
// Render service — no cross-origin API base URL to configure. In local dev the client runs
// under its own Vite dev server instead, and this directory won't exist, so it's a no-op.
const clientDist = path.join(__dirname, "../../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (_req, res) => res.sendFile(path.join(clientDist, "index.html")));
}

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  console.log(`pie-memories API listening on http://localhost:${port}`);
});
