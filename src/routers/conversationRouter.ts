import { Router } from "express";
import { conversationController } from "../controllers/index.ts";

const { _read, _delete, _deleteMany, _getConversationsList } =
  conversationController;

export const conversationRouter = Router();

conversationRouter.get("/ping", (req, res) =>
  res.status(200).json({ message: "Hello There" }),
);
conversationRouter.route("/list").get(_getConversationsList);
conversationRouter.route("/:id").get(_read).delete(_delete);
conversationRouter.route("/").delete(_deleteMany);
