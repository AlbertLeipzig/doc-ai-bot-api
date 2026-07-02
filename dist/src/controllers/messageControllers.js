import { Message } from "../models/index.js";
import { Conversation } from "../models/index.js";
import { isValidObjectId } from "mongoose";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
const _create = async (req, res, next) => {
    try {
        const { conversationId, content, role = "user" } = req.body;
        if (!content)
            return createResponse({
                res,
                messageCode: ESystemMessage.REQUEST_MISSING_DATA,
            });
        if (!conversationId)
            return createResponse({
                res,
                messageCode: ESystemMessage.GENERAL_EXCEPTION,
            });
        await Message.create({ conversationId, content, role });
        createResponse({ res, messageCode: ESystemMessage.CREATE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const _read = async (req, res, next) => {
    try {
        if (!isValidObjectId(req.params.id))
            return createResponse({
                res,
                messageCode: ESystemMessage.GENERAL_EXCEPTION,
            });
        const message = await Message.findById(req.params.id).populate("conversationId");
        message
            ? createResponse({
                res,
                messageCode: ESystemMessage.READ_SUCCESS,
                data: message,
            })
            : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
    }
    catch (e) {
        next(e);
    }
};
const _readMany = async (req, res, next) => {
    try {
        const { conversationId, vectorProfileId, benchmark } = req.query;
        if (!conversationId && !vectorProfileId) {
            return createResponse({
                res,
                messageCode: ESystemMessage.REQUEST_MISSING_DATA,
            });
        }
        let conversationIds;
        if (conversationId) {
            conversationIds = [conversationId];
        }
        else {
            const filter = { vectorProfileId };
            if (benchmark === "true")
                filter.benchmark = true;
            const conversations = await Conversation.find(filter)
                .select("_id")
                .lean();
            conversationIds = conversations.map((c) => c._id.toString());
        }
        const messages = await Message.find({
            conversationId: { $in: conversationIds },
        })
            .sort({ createdAt: 1 })
            .lean();
        messages?.length > 0
            ? createResponse({
                res,
                messageCode: ESystemMessage.READ_SUCCESS,
                data: { messages },
            })
            : createResponse({
                res,
                messageCode: ESystemMessage.READ_EMPTY_LIST,
                data: { conversationIds, vectorProfileId },
            });
    }
    catch (e) {
        next(e);
    }
};
const _delete = async (req, res, next) => {
    try {
        const message = await Message.findByIdAndDelete(req.params.id);
        message
            ? createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS })
            : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
    }
    catch (e) {
        next(e);
    }
};
const _deleteMany = async (req, res, next) => {
    try {
        await Message.deleteMany();
        createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
export const messageController = {
    _create,
    _read,
    _readMany,
    _delete,
    _deleteMany,
};
