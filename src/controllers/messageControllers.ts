import type { NextFunction, Request, Response } from "express";
import { Message } from "../models/index.ts";
import { isValidObjectId } from "mongoose";
import { createResponse } from "@doc-ai-bot/utils";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content, role = "user" } = req.body;

    if (!content) return createResponse({ res, messageCode: "missingContent" });

    if (!conversationId)
      return createResponse({ res, messageCode: "invalidId" });

    await Message.create({ conversationId, content, role });
    createResponse({ res, messageCode: "create" });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id))
      return createResponse({ res, messageCode: "invalidId" });

    const message = await Message.findById(req.params.id).populate(
      "conversationId",
    );
    message
      ? createResponse({ res, messageCode: "get", data: message })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;

    const filter = conversationId ?? "";

    const messages = await Message.find({ filter })
      .sort({
        createdAt: 1,
      })
      .populate("conversationId");

    messages?.length > 0
      ? createResponse({
          res,
          messageCode: "getList",
          data: {
            conversationId,
            messages,
          },
        })
      : createResponse({
          res,
          messageCode: "getList_empty",
          data: { conversationId },
        });
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    message
      ? createResponse({ res, messageCode: "deleteOne" })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Message.deleteMany();
    createResponse({ res, messageCode: "deleteMany" });
  } catch (e) {
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
