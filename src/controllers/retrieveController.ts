import { Request, Response, NextFunction } from "express";
import { retriever, embedder } from "@doc-ai-bot/services";
import { VectorModel } from "../models/index.ts";
import { createResponse } from "@doc-ai-bot/utils";

export const retrieveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query, k, _vectorProfileId } = req.body;

    if (!query)
      return createResponse({ res, messageCode: "retrieve_missingQuery" });

    const queryEmbedding = await embedder.query(query);
    const limit = retriever.topK(k);

    const totalDocs = await VectorModel.countDocuments(
      _vectorProfileId ? { vectorProfileId: _vectorProfileId } : {},
    );
    if (totalDocs === 0) {
      return res.status(200).json([]);
    }

    let results = [];

    try {
      const pipeline = retriever.buildVectorSearchPipeline({
        queryEmbedding,
        k: limit,
        vectorProfileId: _vectorProfileId,
      });

      results = await VectorModel.collection.aggregate(pipeline).toArray();
    } catch (vectorError) {
      console.warn(
        "Vector search failed, using fallback:",
        vectorError.message,
      );
    }

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
};
