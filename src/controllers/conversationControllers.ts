import type { NextFunction, Request, Response } from "express";
import { Conversation, Message } from "../models/index.ts";
import { apiConfig } from "../../apiConfig.ts";
import { generator } from "@albertleipzig/doc-ai-bot-services";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
import mongoose from "mongoose";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vectorProfileId, topK: rawTopK, content } = req.body;

    const title = await generator.conversationTitle(content);

    const topK = rawTopK ?? apiConfig.llm.retrieve.topK;

    await Conversation.create({
      title,
      vectorProfileId,
      topK,
    });
    createResponse({ res, messageCode: ESystemMessage.CREATE_SUCCESS });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation)
      return createResponse({
        res,
        messageCode: ESystemMessage.REQUEST_MISSING_DATA,
      });
    await Message.deleteMany({ conversationId: req.params.id });
    createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Conversation.deleteMany();
    await Message.deleteMany();
    createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
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
    const collections = await Conversation.find().lean();
    console.log("collections value:", JSON.stringify(collections));
    collections.length > 0
      ? res.status(200).json(collections)
      : createResponse({
          res,
          messageCode: ESystemMessage.READ_EMPTY_LIST,
        });
  } catch (e) {
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
