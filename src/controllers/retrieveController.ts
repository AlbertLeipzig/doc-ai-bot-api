import type { Request, Response, NextFunction } from "express";
import { retriever, embedder } from "@albertleipzig/doc-ai-bot-services";
import { VectorModel } from "../models/index.ts";
import { apiConfig } from "../../apiConfig.ts";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";

const retrieverService = retriever.service(apiConfig.llm.retrieve);

export const retrieveController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query, k, vectorProfileId } = req.body;

    if (!query)
      return createResponse({
        res,
        messageCode: ESystemMessage.REQUEST_MISSING_DATA,
      });

    const queryEmbedding = await embedder.query(query);
    const limit = retrieverService.getTopK(k);

    const totalDocs = await VectorModel.countDocuments(
      vectorProfileId ? { vectorProfileId } : {},
    );

    if (totalDocs === 0) {
      return res.status(200).json([]);
    }

    let results = [];
    try {
      const pipeline = retrieverService.buildVectorSearchPipeline({
        queryEmbedding,
        k: limit,
        vectorProfileId,
      });
      results = await VectorModel.collection.aggregate(pipeline).toArray();
    } catch (vectorError) {
      console.warn(
        "Vector search failed, using fallback:",
        vectorError instanceof Error ? vectorError.message : vectorError,
      );
    }

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
};