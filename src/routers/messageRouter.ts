import { Router } from "express";
import { messageController } from "../controllers/messageControllers.ts";

export const messageRouter = Router()

messageRouter.get("/", messageController._readMany)