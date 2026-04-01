import type { NextFunction, Request, Response } from "express";
import { Conversation } from "../models/conversationModel.ts";
import { Message } from "../models/messageModel.ts";
import { apiConfig } from "../../apiConfig.ts";
import { generate } from "../services/generationServices.ts";
import { createResponse } from "../utils/createResponse.ts";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vectorProfileId, topK: rawTopK, content } = req.body;

    const title = await generate.conversationTitle(content);

    const topK = rawTopK ?? apiConfig.llm.retrieve.topK;

    await Conversation.create({
      title,
      vectorProfileId,
      topK,
    });
    createResponse({ res, messageCode: "create" });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation)
      createResponse({ res, messageCode: "missingConversation" });

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return createResponse({
      res,
      messageCode: "get",
      data: { conversation, messages },
    });
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation)
      return createResponse({ res, messageCode: "missingConversation" });
    await Message.deleteMany({ conversationId: req.params.id });
    createResponse({ res, messageCode: "deleteOne" });
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Conversation.deleteMany();
    await Message.deleteMany();
    createResponse({ res, messageCode: "deleteMany" });
  } catch (e) {
    next(e);
  }
};

const _getConversationsList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const collections = await Conversation.distinct("collectionId");
    collections.length > 0
      ? createResponse({ res, messageCode: "getList", data: collections })
      : createResponse({ res, messageCode: "getList_empty" });
  } catch (e) {
    next(e);
  }
};

export const conversation = {
  _create,
  _getConversationsList,
  _read,
  _delete,
  _deleteMany,
};
