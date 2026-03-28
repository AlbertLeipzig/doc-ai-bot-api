import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { apiConfig } from "../../apiConfig.ts";
/* const {cookieOptions} = apiConfig.server */

console.log("AUTH CONTROLLER")

const cookieOptions = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: apiConfig.server.mode === "production",
  maxAge: 24 * 60 * 60 * 1000,
};

const _login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "username and password are required" });
      return;
    }

    if (
      username !== apiConfig.server.adminUser ||
      password !== apiConfig.server.adminPassword
    ) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ username }, apiConfig.server.jwtSecret, {
      expiresIn: "24h",
    });

    res.cookie("token", token, cookieOptions);
    res.status(200).json({ message: "Login successful" });
  } catch (e) {
    next(e);
  }
};

const _logout = (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  res.status(200).json({ message: "Logout successful" });
};

const _verify = (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  try {
    const decoded = jwt.verify(token, apiConfig.server.jwtSecret);
    res.status(200).json({ user: decoded });
  } catch {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

export const authController = { _login, _logout, _verify };
