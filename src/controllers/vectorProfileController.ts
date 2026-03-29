import type { NextFunction, Request, Response } from "express";
import { VectorProfile } from "../models/vectorProfileModel.ts";

const _create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfile = await VectorProfile.create(req.body);
    res.status(201).json(vectorProfile);
  } catch (e) {
    next(e);
  }
};

const _read = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfile = await VectorProfile.findById(req.params.id);
    res.status(200).json(vectorProfile);
  } catch (e) {
    next(e);
  }
};

const _readMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfiles = await VectorProfile.find();
    vectorProfiles.length > 0
      ? res.status(200).json(vectorProfiles)
      : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};
const _delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const vectorProfile = await VectorProfile.findByIdAndDelete(req.params.id);
    vectorProfile ? res.status(200).json(vectorProfile) : res.sendStatus(404);
  } catch (e) {
    next(e);
  }
};

const _deleteMany = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await VectorProfile.deleteMany();
    res.sendStatus(200);
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
    res.status(200).json(profiles);
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
