const http = require("node:http");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");

const ROOT_DIR = __dirname;
const PORT = Number(process.env.PORT || 8080);
const DATA_DIR = process.env.OFFSITE_DATA_DIR || path.join(ROOT_DIR, "data");
const SEED_PATH = path.join(DATA_DIR, "offsite26-seed.json");
const STATE_PATH = path.join(DATA_DIR, "offsite26-schedule.json");
const BODY_LIMIT_BYTES = 128 * 1024;

const DAYS = new Set([
  "2026-06-29",
  "2026-06-30",
  "2026-07-01",
  "2026-07-02",
  "2026-07-03",
  "2026-07-04",
  "2026-07-05"
]);

const CATEGORIES = new Set(["food", "work", "travel", "creative", "sport", "social"]);
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function send(res, status, body, contentType = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload), "application/json; charset=utf-8");
}

async function ensureScheduleFile() {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  try {
    await fsp.access(STATE_PATH, fs.constants.F_OK);
  } catch {
    const seed = await fsp.readFile(SEED_PATH, "utf8");
    await fsp.writeFile(STATE_PATH, seed, "utf8");
  }
}

async function readSchedule() {
  await ensureScheduleFile();
  const raw = await fsp.readFile(STATE_PATH, "utf8");
  return JSON.parse(raw);
}

async function resetSchedule() {
  const raw = await fsp.readFile(SEED_PATH, "utf8");
  const parsed = JSON.parse(raw);
  parsed.updatedAt = new Date().toISOString();
  await fsp.writeFile(STATE_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return parsed;
}

async function readBody(req) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) {
    size += chunk.length;
    if (size > BODY_LIMIT_BYTES) {
      throw Object.assign(new Error("Payload too large"), { status: 413 });
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

function asCleanText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function isQuarterHour(value) {
  return Number.isInteger(value) && value % 15 === 0;
}

function sanitizeEvent(input) {
  if (!input || typeof input !== "object") {
    throw new Error("Event must be an object");
  }

  const id = asCleanText(input.id, 64);
  const title = asCleanText(input.title, 80);
  const day = asCleanText(input.day, 10);
  const category = asCleanText(input.category, 24);
  const start = Number(input.start);
  const duration = Number(input.duration);

  if (!id || !title) throw new Error("Event id and title are required");
  if (!DAYS.has(day)) throw new Error(`Unsupported day: ${day}`);
  if (!CATEGORIES.has(category)) throw new Error(`Unsupported category: ${category}`);
  if (!isQuarterHour(start) || start < 480 || start > 1425) {
    throw new Error(`Invalid start time for ${id}`);
  }
  if (!isQuarterHour(duration) || duration < 15 || duration > 480 || start + duration > 1440) {
    throw new Error(`Invalid duration for ${id}`);
  }

  const event = {
    id,
    title,
    day,
    start,
    duration,
    category,
    location: asCleanText(input.location, 80),
    description: asCleanText(input.description, 220)
  };

  const link = asCleanText(input.link, 240);
  if (link) event.link = link;

  return event;
}

function sanitizeSchedule(input) {
  if (!input || !Array.isArray(input.events)) {
    throw new Error("Schedule must contain events array");
  }
  if (input.events.length < 1 || input.events.length > 60) {
    throw new Error("Schedule must contain 1-60 events");
  }

  const ids = new Set();
  const events = input.events.map(sanitizeEvent);

  for (const event of events) {
    if (ids.has(event.id)) throw new Error(`Duplicate event id: ${event.id}`);
    ids.add(event.id);
  }

  return {
    updatedAt: new Date().toISOString(),
    events
  };
}

async function saveSchedule(req, res) {
  try {
    const raw = await readBody(req);
    const parsed = JSON.parse(raw);
    const schedule = sanitizeSchedule(parsed);
    await fsp.writeFile(STATE_PATH, `${JSON.stringify(schedule, null, 2)}\n`, "utf8");
    sendJson(res, 200, schedule);
  } catch (error) {
    sendJson(res, error.status || 400, { error: error.message || "Invalid schedule" });
  }
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/offsite26/events" && req.method === "GET") {
    sendJson(res, 200, await readSchedule());
    return true;
  }

  if (pathname === "/api/offsite26/events" && req.method === "PUT") {
    await saveSchedule(req, res);
    return true;
  }

  if (pathname === "/api/offsite26/reset" && req.method === "POST") {
    sendJson(res, 200, await resetSchedule());
    return true;
  }

  if (pathname.startsWith("/api/")) {
    sendJson(res, 404, { error: "Not found" });
    return true;
  }

  return false;
}

function resolveStaticPath(pathname) {
  const safePath = decodeURIComponent(pathname).replace(/^\/+/, "");
  const basePath = safePath ? path.join(ROOT_DIR, safePath) : path.join(ROOT_DIR, "index.html");
  const normalized = path.normalize(basePath);

  if (!normalized.startsWith(ROOT_DIR)) {
    return null;
  }

  if (fs.existsSync(normalized) && fs.statSync(normalized).isDirectory()) {
    return path.join(normalized, "index.html");
  }

  if (fs.existsSync(normalized)) {
    return normalized;
  }

  if (!path.extname(normalized)) {
    const htmlPath = `${normalized}.html`;
    if (fs.existsSync(htmlPath)) {
      return htmlPath;
    }
  }

  return null;
}

async function serveStatic(res, pathname) {
  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    send(res, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN"
  };

  if ([".css", ".js", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".ico"].includes(ext)) {
    headers["Cache-Control"] = "public, max-age=604800, immutable";
  }

  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host || "localhost"}`);
    const handledApi = await handleApi(req, res, pathname);
    if (handledApi) return;

    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "Method not allowed", "text/plain; charset=utf-8");
      return;
    }

    await serveStatic(res, pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`Suite server listening on http://localhost:${PORT}`);
});
