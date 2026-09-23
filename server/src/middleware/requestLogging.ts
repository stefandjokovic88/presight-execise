import type { NextFunction, Request, Response } from "express";

/**
 * Logs API/health requests with status + duration (same idea as Java RequestLoggingFilter).
 * Works for local `yarn start:server` and Docker — both read the same stdout.
 */
export function requestLogging(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  if (!(path.startsWith("/api") || path === "/health")) {
    next();
    return;
  }

  const started = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - started;
    const uri = req.originalUrl;
    const line = `${req.method} ${uri} -> ${res.statusCode} (${ms} ms)`;

    if (res.statusCode >= 500) {
      console.error(line);
    } else if (res.statusCode >= 400) {
      console.warn(line);
    } else {
      console.log(line);
    }
  });

  next();
}
