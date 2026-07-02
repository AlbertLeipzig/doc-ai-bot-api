import { Conversation, Message } from "../models/index.js";
import { apiConfig } from "../../apiConfig.js";
import { generator } from "@albertleipzig/doc-ai-bot-services";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
import mongoose from "mongoose";
const _create = async (req, res, next) => {
    try {
        const { vectorProfileId, topK: rawTopK, content, benchmark } = req.body;
        const generatorService = generator(apiConfig.llm);
        const title = await generatorService.conversationTitle(content);
        const topK = rawTopK ?? apiConfig.llm.retrieve.topK;
        await Conversation.create({
            title,
            vectorProfileId,
            topK,
            benchmark,
        });
        createResponse({ res, messageCode: ESystemMessage.CREATE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const _read = async (req, res, next) => {
    try {
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation)
            createResponse({ res, messageCode: ESystemMessage.REQUEST_MISSING_DATA });
        const messages = await Message.find({
            conversationId: conversation._id,
        }).sort({ createdAt: 1 });
        return createResponse({
            res,
            messageCode: ESystemMessage.READ_SUCCESS,
            data: { conversation, messages },
        });
    }
    catch (e) {
        next(e);
    }
};
const _delete = async (req, res, next) => {
    try {
        const conversation = await Conversation.findByIdAndDelete(req.params.id);
        if (!conversation)
            return createResponse({
                res,
                messageCode: ESystemMessage.REQUEST_MISSING_DATA,
            });
        await Message.deleteMany({ conversationId: req.params.id });
        createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const _deleteMany = async (req, res, next) => {
    try {
        await Conversation.deleteMany();
        await Message.deleteMany();
        createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
    }
    catch (e) {
        next(e);
    }
};
const _getConversationsList = async (req, res, next) => {
    try {
        const { vectorProfileId, benchmark } = req.query;
        const filter = {};
        if (vectorProfileId)
            filter.vectorProfileId = vectorProfileId;
        if (benchmark !== undefined)
            filter.benchmark = benchmark === "true";
        const collections = await Conversation.find(filter).lean();
        console.log("collections value:", JSON.stringify(collections));
        collections.length > 0
            ? res.status(200).json(collections)
            : createResponse({
                res,
                messageCode: ESystemMessage.READ_EMPTY_LIST,
            });
    }
    catch (e) {
        next(e);
    }
};
export const conversationController = {
    _create,
    _getConversationsList,
    _read,
    _delete,
    _deleteMany,
};
