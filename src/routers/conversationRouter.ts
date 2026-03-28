import { Router } from "express";
import { conversation } from "../controllers/conversationControllers.ts";

const { _read, _delete, _deleteMany, _getConversationsList } = conversation;

export const conversationRouter = Router();

conversationRouter.route("/").delete(_deleteMany);
conversationRouter.route("/list").get(_getConversationsList);
conversationRouter.route("/:id").get(_read).delete(_delete);
