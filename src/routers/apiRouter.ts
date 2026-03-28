import { Router } from "express";
import { conversationRouter } from "./conversationRouter.ts";
import { vectorRouter } from "./vectorRouter.ts";
import { healthRouter } from "./healthRouter.ts";
import { vectorProfileRouter } from "./vectorProfileRouter.ts";
import { ragRouter } from "./ragRouter.ts";
import { chatController } from "../controllers/chatController.ts";
import { authRouter } from "./authRouter.ts";

export const apiRouter = Router();
apiRouter.use("/", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.post("/chat", chatController);
apiRouter.use("/conversation", conversationRouter);
apiRouter.use("/rag", ragRouter);
apiRouter.use("/vector", vectorRouter);
apiRouter.use("/vector-profile", vectorProfileRouter);
