import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { apiConfig } from "../../apiConfig.ts";
import { createResponse } from "@utils";
const { cookieOptions } = apiConfig.server;

const _login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      createResponse({ res, messageCode: "login_no_credentials" });
      /* res.status(400).json({ error: "username and password are required" }); */
      return;
    }

    if (
      username !== apiConfig.server.adminUser ||
      password !== apiConfig.server.adminPassword
    ) {
      createResponse({ res, messageCode: "login_wrong_credentials" });
      /* res.status(401).json({ error: "Invalid credentials" }); */
      return;
    }

    const token = jwt.sign({ username }, apiConfig.server.jwtSecret, {
      expiresIn: "24h",
    });

    res.cookie("token", token, cookieOptions);
    createResponse({ res, messageCode: "login" });
    /* res.status(200).json({ message: "Login successful" }); */
  } catch (e) {
    next(e);
  }
};

const _logout = (_req: Request, res: Response) => {
  res.clearCookie("token", cookieOptions);
  createResponse({ res, messageCode: "logout" });
  /*   res.status(200).json({ message: "Logout successful" }); */
};

const _verify = (req: Request, res: Response) => {
  const token = req.cookies?.token;
  if (!token) {
    createResponse({ res, messageCode: "verify_no_token" });
    /* res.status(401).json({ error: "Not authenticated" }); */
    return;
  }
  try {
    const decoded = jwt.verify(token, apiConfig.server.jwtSecret);
    createResponse({ res, messageCode: "verify", data: { user: decoded } });
    /* res.status(200).json({ user: decoded }); */
  } catch {
    createResponse({ res, messageCode: "verify_wrong_token" });
    /* res.status(403).json({ error: "Invalid or expired token" }); */
  }
};

export const authController = { _login, _logout, _verify };
