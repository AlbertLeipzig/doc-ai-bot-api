import { Router } from "express";
import { authController } from "../controllers/index.ts";

export const authRouter = Router();

const { _login, _logout, _verify } = authController;

authRouter.post("/login", _login);
authRouter.delete("/logout", _logout);
authRouter.get("/verify", _verify);
