import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { apiConfig } from "../../apiConfig.ts";

const PUBLIC_ROUTES = ["/auth/login"];

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.method === "GET") return next();
  if (PUBLIC_ROUTES.includes(req.path)) return next();

  console.log(req.path, req.method);

  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const decoded = jwt.verify(token, apiConfig.server.jwtSecret);
    (req as any).user = decoded;
    next();
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};
