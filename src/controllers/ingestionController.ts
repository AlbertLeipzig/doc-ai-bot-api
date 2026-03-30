import type { Request, Response, NextFunction } from "express";
import { ingest } from "../services/ingestionService.ts";
import { VectorProfile } from "../models/vectorProfileModel.ts";
import { VectorModel } from "../models/vectorModel.ts";
import { apiConfig } from "../../apiConfig.ts";
import { generate } from "../services/generationServices.ts";
import { url } from "../services/urlServices.ts";
import { createResponse } from "../utils/createResponse.ts";

/* const _ingestSingleDocument = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { _baseUrl, _model, _chunkSize, _chunkOverlap, _vectorProfileId } =
      req.body as IngestDocumentBody;

    // 1. Resolve params
    const baseUrl = _baseUrl ?? apiConfig.llm.docs.baseUrl;
    const model = _model ?? apiConfig.llm.vectorModel;
    const chunkSize = Number(_chunkSize) || apiConfig.llm.embed.chunking.size;
    const chunkOverlap =
      Number(_chunkOverlap) || apiConfig.llm.embed.chunking.overlap;

    if (!baseUrl) {
      res.status(400).json({ error: "baseUrl is required" });
      return;
    }

    // 2. Resolve collectionName
    let vectorProfileId = _vectorProfileId ?? null;
    let collectionName: string;

    if (vectorProfileId) {
      const existing = await VectorProfile.findById(vectorProfileId).lean();
      if (!existing) {
        res
          .status(404)
          .json({ error: `vectorProfile ${vectorProfileId} not found` });
        return;
      }
      collectionName = existing.name;
    } else {
      collectionName = generate.vectorCollectionName({
        model,
        chunkSize,
        chunkOverlap,
      });
    }

    // 3. Load → chunk (pure processing, zero DB)
    const loadedDocs = await ingestionService.loadFromUrl(baseUrl, {
      chunkSize,
      chunkOverlap,
      model,
    });

    if (!loadedDocs.length) {
      res
        .status(422)
        .json({ error: "No content could be extracted from the provided URL" });
      return;
    }

    // 4. Embed
    const embeddedDocs = await ingestionService.ingestDocuments(loadedDocs, {
      model,
      chunkSize,
      chunkOverlap,
    });

    // 5. Store vectors
    await VectorModel.insertMany(
      embeddedDocs.map((doc) => ({
        content: doc.content,
        embedding: doc.embedding,
        collectionName,
        vectorProfileId
      })),
    );

    // 6. Create vectorProfile only if not provided
    if (!vectorProfileId) {
      const profile = await VectorProfile.create({
        name: collectionName,
        model,
        chunkSize,
        chunkOverlap,
      });
      vectorProfileId = profile._id.toString();
    }

    res.status(201).json({
      vectorProfileId,
      collectionName,
      totalChunks: embeddedDocs.length,
    });
  } catch (e) {
    next(e);
  }
}; */

const _ingestSingleDocument = async (
  baseUrl: string,
  model: string,
  chunkSize: number,
  chunkOverlap: number,
  vectorProfileId: string,
): Promise<{ totalChunks: number }> => {
  const loadedDocs = await ingest.loadFromUrl(baseUrl, {
    chunkSize,
    chunkOverlap,
    model,
  });

  if (!loadedDocs.length)
    throw new Error(`No content extracted from ${baseUrl}`);

  const embeddedDocs = await ingest.ingestDocuments(loadedDocs, {
    model,
    chunkSize,
    chunkOverlap,
  });

  await VectorModel.insertMany(
    embeddedDocs.map((doc) => ({
      content: doc.content,
      embedding: doc.embedding,
      vectorProfileId,
    })),
  );

  return { totalChunks: embeddedDocs.length };
};

export const _ingest = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      _baseUrl,
      _model,
      _maxPages,
      _chunkSize,
      _chunkOverlap,
      _vectorProfileId,
    } = req.body;

    // 1. Resolve params
    const model = _model ?? apiConfig.llm.vectorModel;
    const chunkSize = Number(_chunkSize) || apiConfig.llm.embed.chunking.size;
    const chunkOverlap =
      Number(_chunkOverlap) || apiConfig.llm.embed.chunking.overlap;
    const baseUrl = _baseUrl ?? apiConfig.llm.docs.baseUrl;
    const maxPages = _maxPages ?? apiConfig.llm.docs.maxPages;
    const urls = await url.documentation(baseUrl, maxPages);
    if (!urls?.length)
      return createResponse({ res, messageCode: "missingUrl" });

    // 2. Resolve or create vectorProfile once — shared across all URLs
    let vectorProfileId = _vectorProfileId ?? null;

    if (!vectorProfileId) {
      const collectionName = generate.vectorCollectionName({
        model,
        chunkSize,
        chunkOverlap,
      });
      const profile = await VectorProfile.create({
        name: collectionName,
        model,
        chunkSize,
        chunkOverlap,
      });
      vectorProfileId = profile._id.toString();
    }

    // 3. Process each URL, collect results and errors
    let totalChunks = 0;
    const errors: { url: string; error: string }[] = [];

    for (const url of urls) {
      try {
        const result = await _ingestSingleDocument(
          url,
          model,
          chunkSize,
          chunkOverlap,
          vectorProfileId,
        );
        totalChunks += result.totalChunks;
      } catch (e) {
        errors.push({ url, error: e instanceof Error ? e.message : String(e) });
      }
    }
    try {
      await VectorModel.collection.createSearchIndex({
        name: "vector_index",
        type: "vectorSearch",
        definition: {
          fields: [
            {
              type: "vector",
              path: "embedding",
              numDimensions: 768,
              similarity: "cosine",
            },
            { type: "filter", path: "vectorProfileId" },
          ],
        },
      });
    } catch (e) {
      console.error(e);
    }

    const status =
      errors.length > 0 && totalChunks === 0
        ? 422
        : errors.length > 0
          ? 207
          : 201;

    res.status(status).json({
      vectorProfileId,
      totalChunks,
      totalUrls: urls.length,
      ...(errors.length ? { errors } : {}),
    });
  } catch (e) {
    next(e);
  }
};
