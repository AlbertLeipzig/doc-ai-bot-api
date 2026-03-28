import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { appState } from "../services/appStateService.ts";

const _health = async (req: Request, res: Response, next: NextFunction) => {
  try {
    return res.status(200).json({ status: "ok" });
  } catch (e) {
    next(e);
  }
};

/* This Must be Coordinated with the Central Message Service */

const _ready = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (appState.isShuttingDown()) {
      return res.status(503).json({
        status: "not_ready",
        checks: {
          app: "shutting_down",
          db: mongoose.connection.readyState === 1 ? "up" : "down",
        },
      });
    }

    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      return res.status(503).json({
        status: "not_ready",
        checks: {
          db: "down",
        },
      });
    }

    return res.status(200).json({
      status: "ready",
      checks: {
        db: "up",
      },
    });
  } catch (e) {
    next(e);
  }
};

export const health = {
  _health,
  _ready,
};
