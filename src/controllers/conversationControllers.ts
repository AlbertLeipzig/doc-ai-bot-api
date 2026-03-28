import type { NextFunction, Request, Response } from "express";
import { Conversation } from "../models/conversationModel.ts";
import { Message } from "../models/messageModel.ts";
import { apiConfig } from "../../apiConfig.ts";
import { generate } from "../services/generationServices.ts";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vectorProfileId, topK: rawTopK, content } = req.body;

    const title = await generate.conversationTitle(content);

    const topK = rawTopK ?? apiConfig.llm.retrieve.topK;

    const conversation = await Conversation.create({
      title,
      vectorProfileId,
      topK,
    });
    res.status(201).json(conversation);
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.sendStatus(404);
    }

    const messages = await Message.find({
      conversationId: conversation._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      conversation,
      messages,
    });
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await Conversation.findByIdAndDelete(req.params.id);
    if (!conversation) {
      return res.sendStatus(404);
    }
    await Message.deleteMany({ conversationId: req.params.id });
    res.status(200).json(conversation);
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Conversation.deleteMany();
    await Message.deleteMany();
    res.sendStatus(200);
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
    res.status(200).json(collections);
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
