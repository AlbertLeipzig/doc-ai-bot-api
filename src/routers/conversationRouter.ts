import { Router } from "express";
import { conversationController } from "../controllers/index.ts";

const { _read, _delete, _deleteMany, _getConversationsList } = conversationController;

export const conversationRouter = Router();

conversationRouter.route("/").delete(_deleteMany);
conversationRouter.route("/list").get(_getConversationsList);
conversationRouter.route("/:id").get(_read).delete(_delete);
