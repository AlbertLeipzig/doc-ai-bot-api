import { Request, Response, NextFunction } from "express";
import { retrieveService } from "../services/retrieveService.ts";
import { VectorModel } from "../models/vectorModel.ts";
import { embed } from "../services/embeddingService.ts";

export const _retrieve = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { query, k, _vectorProfileId } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const queryEmbedding = await embed.query(query);
    const limit = retrieveService.getTopK(k);

    const totalDocs = await VectorModel.countDocuments(
      _vectorProfileId ? { vectorProfileId: _vectorProfileId } : {},
    );
    if (totalDocs === 0) {
      return res.status(200).json([]);
    }

    let results = [];

    try {
      const pipeline = retrieveService.buildVectorSearchPipeline({
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
