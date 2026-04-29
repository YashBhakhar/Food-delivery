import { createServer } from "node:http";
import { createApp } from "./app.js";
import { initIo } from "./realtime.js";

const PORT = Number(process.env.PORT) || 3000;

function parseCorsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") return true;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return ["http://localhost:5173"];
  if (parts.length === 1) return parts[0]!;
  return parts;
}

const app = createApp();
const httpServer = createServer(app);
initIo(httpServer, parseCorsOrigin());

httpServer.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
