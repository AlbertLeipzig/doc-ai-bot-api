import { Router } from "express";
import { conversationController } from "../controllers/index.js";
const { _read, _delete, _deleteMany, _getConversationsList } = conversationController;
export const conversationRouter = Router();
conversationRouter.route("/list").get(_getConversationsList);
conversationRouter.route("/:id").get(_read).delete(_delete);
conversationRouter.route("/").delete(_deleteMany);
