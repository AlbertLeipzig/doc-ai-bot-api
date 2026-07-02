import { retriever, embedder } from "@albertleipzig/doc-ai-bot-services";
import { VectorModel } from "../models/index.js";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";
export const retrieveController = async (req, res, next) => {
    try {
        const { query, k, _vectorProfileId } = req.body;
        if (!query)
            return createResponse({ res, messageCode: ESystemMessage.REQUEST_MISSING_DATA });
        const queryEmbedding = await embedder.query(query);
        const limit = retriever.topK(k);
        const totalDocs = await VectorModel.countDocuments(_vectorProfileId ? { vectorProfileId: _vectorProfileId } : {});
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
        }
        catch (vectorError) {
            console.warn("Vector search failed, using fallback:", vectorError.message);
        }
        res.status(200).json(results);
    }
    catch (e) {
        next(e);
    }
};
