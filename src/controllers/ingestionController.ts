import type { Request, Response, NextFunction } from "express";
import { ingester, generator, scraper } from "@doc-ai-bot/services";
import { VectorModel, VectorProfile } from "../models/index.ts";
import { apiConfig } from "../../apiConfig.ts";
import { createResponse } from "@doc-ai-bot/utils";
import { Types } from "mongoose";
import { VectorProfileData } from "@doc-ai-bot/types";
import { profile } from "console";
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
  const loadedDocs = await ingester.loadFromUrl(baseUrl, {
    chunkSize,
    chunkOverlap,
    model,
  });

  if (!loadedDocs.length)
    throw new Error(`No content extracted from ${baseUrl}`);

  const embeddedDocs = await ingester.ingestDocuments(loadedDocs, {
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

/*  */

export const ingestionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      baseUrl,
      model,
      maxPages,
      chunkSize,
      chunkOverlap,
      vectorProfileId,
    } = req.body;

    /* GUARDS */

    const _model = model ?? apiConfig.llm.vectorModel;
    const _chunkSize = Number(chunkSize) || apiConfig.llm.embed.chunking.size;
    const _chunkOverlap =
      Number(chunkOverlap) || apiConfig.llm.embed.chunking.overlap;
    const _baseUrl = baseUrl ?? apiConfig.llm.docs.baseUrl;
    const _maxPages = maxPages ?? apiConfig.llm.docs.maxPages;

    /* Create VectorProfile if none is provided */

    let _vectorProfileId = vectorProfileId ?? "";

    if (!vectorProfileId) {
      const vectorProfile = await VectorProfile.create({
        name: generator.vectorCollectionName({ model, chunkSize, chunkOverlap }),
        model: _model,
        chunkSize: _chunkSize,
        chunkOverlap: _chunkOverlap,
      });
      if (!vectorProfile) {
        return createResponse({ res, messageCode: "notRound" });
      }
      if (vectorProfile) _vectorProfileId = vectorProfile._id;
    }

    /*  */

    const _urls = await scraper.documentation({
      baseUrl: _baseUrl,
      maxPages: _maxPages,
    });
    if (!_urls?.length)
      return createResponse({ res, messageCode: "missingUrl" });

    const allDocs = [];
    for (const url of _urls) {
      try {
        const docs = await ingester.loadFromUrl(url, {
          model: _model,
          chunkSize: _chunkSize,
          chunkOverlap: _chunkOverlap,
        });
        allDocs.push(...docs);
      } catch (e) {
        next(e);
      }
    }
    res.status(201).json(allDocs);
  } catch (e) {
    console.log(e);
    next(e);
  }
};
