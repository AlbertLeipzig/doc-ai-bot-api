import { Router } from "express";
import { vector } from "../controllers/vectorControllers.ts";

const {
  _deleteMany,
} = vector;

export const vectorRouter = Router();

vectorRouter.route("/").delete(_deleteMany);
