import { Router } from "express";
import { health } from "../controllers/healthControllers.ts";

const { _health, _ready } = health;

export const healthRouter = Router();

healthRouter.get("/health", _health);
healthRouter.get("/ready", _ready);
