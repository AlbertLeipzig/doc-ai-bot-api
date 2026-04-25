import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { apiConfig } from "../apiConfig.ts";
import { dbService, starter, apiStateService } from "@doc-ai-bot/services";
import { apiRouter } from "./routers/apiRouter.ts";
import { errorHandlingMiddleware, rateLimitingMiddleware, authMiddleware } from "@doc-ai-bot/middlewares";
import cookieParser from "cookie-parser";

const {port, mode} = apiConfig.server

const app = express();

app.use(cors(apiConfig.server.cors));
app.use(express.json());
app.use(cookieParser());
app.use(rateLimitingMiddleware);
app.use(authMiddleware);
app.use("/", apiRouter);
app.use(errorHandlingMiddleware);

const setupGracefulShutdown = (server) => {
  let isShuttingDown = false;

  const shutdown = (signal) => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    apiStateService.setShuttingDown(true);
    console.log(`Received ${signal}. Starting graceful shutdown...`);

    const forceExitTimer = setTimeout(() => {
      console.error("Graceful shutdown timeout. Forcing exit.");
      process.exit(1);
    }, 10000);

    server.close(async (serverError) => {
      try {
        if (serverError) {
          console.error("Error while closing HTTP server:", serverError);
        }

        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
        }

        clearTimeout(forceExitTimer);
        process.exit(serverError ? 1 : 0);
      } catch (closeError) {
        clearTimeout(forceExitTimer);
        console.error("Error during graceful shutdown:", closeError);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason);
    process.exit(1);
  });
};

dbService
  .connect(apiConfig.db.uri)
  .then(() => {
    console.clear();
    const server = starter({app, port, mode});
    setupGracefulShutdown(server);
  })
  .catch((e) => {
    console.error(e);
    process.exit(2);
  });
