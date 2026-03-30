    });
import { Router } from "express";
import { authController } from "../controllers/authController.ts";

console.log("AUTH ROUTER");

export const authRouter = Router();

const { _login, _logout, _verify } = authController;

authRouter.post("/login", _login);
authRouter.delete("/logout", _logout);
authRouter.get("/verify", _verify);
