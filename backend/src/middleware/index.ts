import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${ms}ms`);
  });
  next();
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: "Not found", path: req.originalUrl });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation failed", details: err.flatten() });
    return;
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}
