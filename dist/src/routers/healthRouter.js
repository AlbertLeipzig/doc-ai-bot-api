import { Router } from "express";
import { healthController } from "../controllers/index.js";
const { _health, _ready } = healthController;
export const healthRouter = Router();
healthRouter.get("/health", _health);
healthRouter.get("/ready", _ready);
