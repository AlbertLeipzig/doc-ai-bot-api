import { Router } from "express";
import { ingestionController } from "../controllers/index.ts";

export const ragRouter = Router();

ragRouter.route("/ingest").post(ingestionController);
