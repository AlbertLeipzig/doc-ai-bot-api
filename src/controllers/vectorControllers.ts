import type { NextFunction, Request, Response } from "express";
import { VectorModel, getDynamicVectorModel } from "../models/vectorModel.ts";
import { isValidObjectId } from "mongoose";
import { embed } from "../services/embeddingService.ts";
/* import {VectorUpdateData} from "../types/types.ts" */

/* LIKELY TO BE DELETED IN FEW DAYS */

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, metadata } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const embedding = await embed.query(content);

    await VectorModel.create({
      content,
      embedding,
    });

    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
};

/* LIKELY TO BE DELETED IN FEW DAYS */
const _createMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vectors, collectionName } = req.body;

    if (!collectionName) {
      return next("Placeholder Error");
    }

    const DynamicVectorModel = getDynamicVectorModel(collectionName);
    await DynamicVectorModel.create(vectors);
    res.sendStatus(201);
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid vector id" });
    }

    const vector = await VectorModel.findById(req.params.id);
    vector ? res.status(200).json(vector) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

const _readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectors = await VectorModel.find();
    res.status(200).json(vectors);
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid vector id" });
    }

    const vector = await VectorModel.findByIdAndDelete(req.params.id);
    vector ? res.status(200).json(vector) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VectorModel.deleteMany();
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

export const vector = {
  _create,
  _read,
  _readMany,
  _delete,
  _deleteMany,
  _createMany,
};
