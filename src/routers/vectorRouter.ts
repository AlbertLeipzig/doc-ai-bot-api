import { Router } from "express";
import { vectorController } from "../controllers/index.ts";

const {
  _deleteMany,
} = vectorController;

export const vectorRouter = Router();

vectorRouter.route("/").delete(_deleteMany);
