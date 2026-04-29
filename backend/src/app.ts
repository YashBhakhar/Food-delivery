import cors from "cors";
import express from "express";
import { errorHandler, notFound, requestLogger } from "./middleware/index.js";
import { menuRouter } from "./routes/menu.js";
import { ordersRouter } from "./routes/orders.js";

function parseCorsOrigin(): boolean | string | string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw || raw === "*") return true;
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length === 0) return ["http://localhost:5173"];
  if (parts.length === 1) return parts[0]!;
  return parts;
}

export function createApp(): express.Express {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);
  app.use(
    cors({
      origin: parseCorsOrigin(),
      credentials: true,
    }),
  );
  app.use("/api/menu", menuRouter);
  app.use("/api/orders", ordersRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
