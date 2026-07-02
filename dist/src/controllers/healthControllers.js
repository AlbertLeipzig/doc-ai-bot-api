import mongoose from "mongoose";
import { apiStateService } from "@albertleipzig/doc-ai-bot-services";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
const _health = async (req, res, next) => {
    try {
        createResponse({ res, messageCode: ESystemMessage.HEALTHY });
    }
    catch (e) {
        next(e);
    }
};
const _ready = async (req, res, next) => {
    try {
        if (apiStateService.isShuttingDown()) {
            createResponse({
                res,
                data: {
                    checks: {
                        app: "shutting_down",
                        db: mongoose.connection.readyState === 1 ? "up" : "down",
                    },
                },
            });
            return;
        }
        const isDbReady = mongoose.connection.readyState === 1;
        if (!isDbReady) {
            createResponse({
                res,
                data: {
                    status: "not_ready",
                    checks: {
                        db: "down",
                    },
                },
            });
            return;
        }
        createResponse({ res, messageCode: ESystemMessage.HEALTHY });
        return;
    }
    catch (e) {
        next(e);
    }
};
export const healthController = {
    _health,
    _ready,
};
