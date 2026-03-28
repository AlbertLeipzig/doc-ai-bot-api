/* This is more of an orchestrator. Called controller to keep naming-consistency */

/* 
- yes, it's a POST request to /ingest
- my suggestion for the body: { _baseUrl, _model, _chunkSize, _chunkOverlap, _vectorProfileId }
- the function will either then define every parameter as _baseUrl ?? apiConfig....
- if no _vectorProfileId was provided, this controller must create one. Then 1 of 2 things can happen:
    - either the _vectorProfileId will take care of the creation of a vectorSearch. Challenge: anything that is not a success (like the vectorSearch not being created) must bubble up to this function and be handled here, with the potential downstream time or risk to lost errors. It shouldn't be fatal at this scale, it's maybe not the cleanest
    - or the _ingestDocument takes care of the vectorSearch creation. I don't love it, because we start piling up responsabilities on a single function  
- only is a vectorProfileId is present can the document be ingested. So much so that I wonder when this decission should be made:
    - first a vectorProfileId is created, then the proper ingest process takes place. But what happens if this process is not succcessful? Do we have desert vectorSearch and a vectorProfile?
    - they are created at the end, but where does the vector land? The vector actually needs this to be created
    - I'm leaning more towards the second though: {ingestion process without db operation | vectorProfile + vectorSearch | db operation adding the vectorProfilId to the document}
    - the actual solution would be either a "cleanerService" that, in case of error, makes sure that everything pointless is deleted AND a background-worker that regularly [makes checks to the db | creates a report | offers targeted and bulk deletion ]. But this is right now over-engineering
- instead of returns you mean response, which is status(201).json({    content: { type: String, required: true, trim: true },
    embedding: { type: [Number], required: true },
    vectorProfileId: { type: String, required: true },  })

*/

import type { Request, Response, NextFunction } from "express";
import { ingest } from "../services/ingestionService.ts";
import { VectorProfile } from "../models/vectorProfileModel.ts";
import { VectorModel } from "../models/vectorModel.ts";
import { apiConfig } from "../../apiConfig.ts";
import { generate } from "../services/generationServices.ts";
import { url } from "../services/urlServices.ts";

type IngestDocumentBody = {
  _baseUrl?: string;
  _model?: string;
  _chunkSize?: number;
  _maxPages?: number;
  _chunkOverlap?: number;
  _vectorProfileId?: string;
};

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
    if (!urls?.length) {
      res.status(400).json({ error: "At least one baseUrl is required" });
      return;
    }

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
