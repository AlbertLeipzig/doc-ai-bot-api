import type { NextFunction, Request, Response } from "express";
import { Message } from "../models/index.ts";
import { isValidObjectId } from "mongoose";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content, role = "user" } = req.body;

    if (!content) return createResponse({ res, messageCode: ESystemMessage.REQUEST_MISSING_DATA });

    if (!conversationId)
      return createResponse({ res, messageCode: ESystemMessage.GENERAL_EXCEPTION });

    await Message.create({ conversationId, content, role });
    createResponse({ res, messageCode: ESystemMessage.CREATE_SUCCESS });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id))
      return createResponse({ res, messageCode: ESystemMessage.GENERAL_EXCEPTION });

    const message = await Message.findById(req.params.id).populate(
      "conversationId",
    );
    message
      ? createResponse({ res, messageCode: ESystemMessage.READ_SUCCESS, data: message })
      : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
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
          messageCode: ESystemMessage.READ_SUCCESS,
          data: {
            conversationId,
            messages,
          },
        })
      : createResponse({
          res,
          messageCode: ESystemMessage.READ_EMPTY_LIST,
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
      ? createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS })
      : createResponse({ res, messageCode: ESystemMessage.NOT_FOUND });
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Message.deleteMany();
    createResponse({ res, messageCode: ESystemMessage.DELETE_SUCCESS });
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
