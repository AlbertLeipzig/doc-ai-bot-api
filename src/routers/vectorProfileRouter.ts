import { Router } from "express";
import { vectorProfileController } from "../controllers/index.ts";

const { _getList, _delete, _deleteMany, _read } = vectorProfileController;

export const vectorProfileRouter = Router();

vectorProfileRouter.route("/").delete(_deleteMany);
vectorProfileRouter.route("/list").get(_getList);
vectorProfileRouter.route("/:id").get(_read).delete(_delete);
