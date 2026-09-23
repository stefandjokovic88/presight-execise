import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ensureDatabaseSeeded } from "./db/seed.js";
import { requestLogging } from "./middleware/requestLogging.js";
import { apiRouter } from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const CLIENT_DIST =
  process.env.CLIENT_DIST ?? path.resolve(__dirname, "../../client/dist");

ensureDatabaseSeeded();

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogging);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", apiRouter);

// Unknown /api/* routes → JSON 404 response shaped like API errors
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
});

if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }
    if (req.path.startsWith("/api") || req.path === "/health") {
      next();
      return;
    }
    res.sendFile(path.join(CLIENT_DIST, "index.html"), (error) => {
      if (error) next(error);
    });
  });
  console.log(`Serving client from ${CLIENT_DIST}`);
} else {
  console.log(
    `Client build not found at ${CLIENT_DIST} (API-only mode; run Vite for the UI)`,
  );
}

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
