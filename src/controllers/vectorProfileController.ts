import type { NextFunction, Request, Response } from "express";
import { createResponse } from "../utils/createResponse.ts";
import { VectorProfile } from "../models/vectorProfileModel.ts";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VectorProfile.create(req.body);
    createResponse({ res, messageCode: "create" });
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfile = await VectorProfile.findById(req.params.id);
    vectorProfile
      ? createResponse({ res, messageCode: "get", data: vectorProfile })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfiles = await VectorProfile.find();
    vectorProfiles.length > 0
      ? createResponse({ res, messageCode: "getList", data: vectorProfiles })
      : createResponse({ res, messageCode: "getList_empty" });
  } catch (e) {
    next(e);
  }
};
const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfile = await VectorProfile.findByIdAndDelete(req.params.id);
    vectorProfile
      ? createResponse({ res, messageCode: "deleteOne" })
      : createResponse({ res, messageCode: "notFound" });
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VectorProfile.deleteMany();
    createResponse({ res, messageCode: "deleteMany" });
  } catch (e) {
    next(e);
  }
};

const getVectorProfileList = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const profiles = await VectorProfile.find().sort({ _id: -1 }).lean();
    profiles.length > 0
      ? createResponse({ res, messageCode: "deleteMany", data: profiles })
      : createResponse({ res, messageCode: "getList_empty" });
  } catch (e) {
    next(e);
  }
};

export const vectorProfile = {
  _getList: getVectorProfileList,
  _create,
  _delete,
  _deleteMany,
  _read,
  _readMany,
};
