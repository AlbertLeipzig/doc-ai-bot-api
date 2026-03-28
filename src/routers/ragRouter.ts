import { Router } from "express";
import { _ingest } from "../controllers/ingestionController.ts";

export const ragRouter = Router();

ragRouter.route("/ingest").post(_ingest);
