import type { NextFunction, Request, Response } from "express";
import { Message } from "../models/messageModel.ts";
import { isValidObjectId } from "mongoose";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId, content, role = "user" } = req.body;

    if (!content) {
      res.status(400).json({ error: "content is required" });
      return;
    }

    if (!conversationId) {
      res.status(400).json({ error: "conversationId is required" });
      return;
    }

    const message = await Message.create({ conversationId, content, role });
    res.status(201).json(message);
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid message id" });
    }

    const message = await Message.findById(req.params.id).populate(
      "conversationId",
    );
    message ? res.status(200).json(message) : res.sendStatus(404);
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

    return res.status(200).json({
      conversationId,
      messages,
    });
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    message ? res.status(200).json(message) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Message.deleteMany();
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

export const message = {
  _create,
  _read,
  _readMany,
  _delete,
  _deleteMany,
};
