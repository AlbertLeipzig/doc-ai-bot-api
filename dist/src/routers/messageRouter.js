import { Router } from "express";
import { messageController } from "../controllers/messageControllers.js";
export const messageRouter = Router();
messageRouter.get("/", messageController._readMany);
