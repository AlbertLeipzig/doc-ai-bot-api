import { Router } from "express";
import { vectorProfileController } from "../controllers/index.js";
const { _getList, _delete, _deleteMany, _read, _getConversationsWithMessages } = vectorProfileController;
export const vectorProfileRouter = Router();
vectorProfileRouter.route("/").delete(_deleteMany);
vectorProfileRouter.route("/list").get(_getList);
vectorProfileRouter.route("/:id").get(_read).delete(_delete);
vectorProfileRouter
    .route("/:id/conversations")
    .get(_getConversationsWithMessages);
