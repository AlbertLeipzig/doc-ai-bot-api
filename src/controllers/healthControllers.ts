import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { apiStateService } from "@doc-ai-bot/services";
import { createResponse } from "@doc-ai-bot/utils";

const _health = async (req: Request, res: Response, next: NextFunction) => {
  try {
    createResponse({ res, messageCode: "health" });
  } catch (e) {
    next(e);
  }
};

const _ready = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (apiStateService.isShuttingDown()) {
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

export const healthController = {
  _health,
  _ready,
};
