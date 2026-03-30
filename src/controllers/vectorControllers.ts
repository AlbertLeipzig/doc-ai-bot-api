import type { NextFunction, Request, Response } from "express";
import { VectorModel, getDynamicVectorModel } from "../models/vectorModel.ts";
import { isValidObjectId } from "mongoose";
import { embed } from "../services/embeddingService.ts";
import { createResponse } from "../utils/createResponse.ts";
/* import {VectorUpdateData} from "../types/types.ts" */

/* LIKELY TO BE DELETED IN FEW DAYS */

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { content, metadata } = req.body;

    if (!content)
      return createResponse({ res, messageCode: "missingContent" });

    const embedding = await embed.query(content);

    await VectorModel.create({
      content,
      embedding,
    });

    createResponse({ res, messageCode: "create" });
  } catch (e) {
    next(e);
  }
};

/* LIKELY TO BE DELETED IN FEW DAYS */
const _createMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { vectors, collectionName } = req.body;

    if (!collectionName) {
      createResponse({
        res,
        messageCode: "missingCollectionName",
      });
    }

    const DynamicVectorModel = getDynamicVectorModel(collectionName);
    await DynamicVectorModel.create(vectors);
    createResponse({ res, messageCode: "create" });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id))
      return createResponse({ res, messageCode: "invalidId" });
    const vector = await VectorModel.findById(req.params.id);
    vector
      ? createResponse({ res, messageCode: "get", data: vector })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectors = await VectorModel.find();
    vectors
      ? createResponse({ res, messageCode: "get", data: vectors })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isValidObjectId(req.params.id))
      return createResponse({ res, messageCode: "invalidId" });

    const vector = await VectorModel.findByIdAndDelete(req.params.id);
    vector ? res.status(200).json(vector) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VectorModel.deleteMany();
    createResponse({ res, messageCode: "delete" });
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
