import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { appState } from "../services/appStateService.ts";
import { createResponse } from "../utils/createResponse.ts";

const _health = async (req: Request, res: Response, next: NextFunction) => {
  try {
    createResponse({ res, messageCode: "health" });
  } catch (e) {
    next(e);
  }
};

const _ready = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (appState.isShuttingDown()) {
      createResponse({
        res,
        data: {
          checks: {
            app: "shutting_down",
            db: mongoose.connection.readyState === 1 ? "up" : "down",
          },
        },
      });
      return;
    }

    const isDbReady = mongoose.connection.readyState === 1;

    if (!isDbReady) {
      createResponse({
        res,
        data: {
          status: "not_ready",
          checks: {
            db: "down",
          },
        },
      });
      return;
    }

    createResponse({ res, messageCode: "ready" });
    return;
  } catch (e) {
    next(e);
  }
};

export const health = {
  _health,
  _ready,
};
