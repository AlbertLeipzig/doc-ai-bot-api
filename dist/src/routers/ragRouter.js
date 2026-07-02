import { Router } from "express";
import { ingestionController } from "../controllers/index.js";
export const ragRouter = Router();
ragRouter.route("/ingest").post(ingestionController);
