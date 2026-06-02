import { Router } from "express";
import { conversationRouter } from "./conversationRouter.ts";
import { vectorRouter } from "./vectorRouter.ts";
import { healthRouter } from "./healthRouter.ts";
import { vectorProfileRouter } from "./vectorProfileRouter.ts";
import { ragRouter } from "./ragRouter.ts";
import { chatController } from "../controllers/index.ts";
import { authRouter } from "./authRouter.ts";
import { apiConfig } from "../../apiConfig.ts";
/* import { authMiddleware } from "@albertleipzig/doc-ai-bot-middlewares"; */
import { authMiddleware } from "../../../doc-ai-bot-middlewares/src/authMiddleware.ts";
export const apiRouter = Router();

apiRouter.use("/", healthRouter);
apiRouter.use("/auth", authRouter);

apiRouter.use(authMiddleware(apiConfig.server));

apiRouter.post("/chat", chatController);
apiRouter.use("/conversation", conversationRouter);
apiRouter.use("/rag", ragRouter);
apiRouter.use("/vector", vectorRouter);
apiRouter.use("/vector-profile", vectorProfileRouter);
