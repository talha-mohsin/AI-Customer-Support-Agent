import { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { env } from "../config/env";

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 11000) {
    res.status(409).json({ message: "Duplicate value violates a unique constraint" });
    return;
  }

  if (err instanceof Error && err.name === "ValidationError") {
    res.status(400).json({ message: err.message });
    return;
  }

  console.error("[unhandled error]", err);

  res.status(500).json({
    message: "Something went wrong. Please try again.",
    ...(env.nodeEnv === "development" && err instanceof Error ? { detail: err.message } : {}),
  });
}
