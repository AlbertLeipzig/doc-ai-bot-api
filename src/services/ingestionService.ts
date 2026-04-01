import axios from "axios";
import * as cheerio from "cheerio";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { apiConfig } from "../../apiConfig.ts";
import { embed } from "./embeddingService.ts";
import { url } from "../services/urlServices.ts";
import { sleep } from "./sleepService.ts";
import type { DocsConfig, LoadedDoc, EmbeddedDoc } from "../types/types.ts";
import { createResponse } from "../utils/createResponse.ts";

type IngestionOverrides = {
  chunkSize?: number;
  chunkOverlap?: number;
  model?: string;
};

const resolveChunking = (overrides: IngestionOverrides = {}) => {
  const apiConfiguredChunkSize = Number(
    apiConfig?.llm?.embed?.chunking?.size || 1000,
  );
  const apiConfiguredChunkOverlap = Number(
    apiConfig?.llm?.embed?.chunking?.overlap || 200,
  );

  const chunkSize =
    Number.isFinite(overrides.chunkSize) && Number(overrides.chunkSize) > 0
      ? Math.floor(Number(overrides.chunkSize))
      : apiConfiguredChunkSize;

  let chunkOverlap =
    Number.isFinite(overrides.chunkOverlap) &&
    Number(overrides.chunkOverlap) >= 0
      ? Number(overrides.chunkOverlap)
      : apiConfiguredChunkOverlap;

  if (chunkOverlap > 0 && chunkOverlap < 1) {
    chunkOverlap = Math.floor(chunkSize * chunkOverlap);
  }

  chunkOverlap = Math.max(0, Math.min(Math.floor(chunkOverlap), chunkSize - 1));

  return {
    chunkSize,
    chunkOverlap,
  };
};

const buildTextSplitter = (overrides: IngestionOverrides = {}) => {
  const chunking = resolveChunking(overrides);

  return new RecursiveCharacterTextSplitter({
    chunkSize: chunking.chunkSize,
    chunkOverlap: chunking.chunkOverlap,
  });
};

const normalizeDocumentationOptions = (
  options: unknown,
): Required<DocsConfig> => {
  const defaultBaseUrl = apiConfig?.llm?.docs?.baseUrl;
  const defaultMaxPages = Number(apiConfig?.llm?.docs?.maxPages || 25);
  const defaultRequestDelayMs = Number(
    apiConfig?.llm?.docs?.requestDelayMs || 500,
  );

  let baseUrl = defaultBaseUrl;
  let maxPages = defaultMaxPages;
  let requestDelayMs = defaultRequestDelayMs;

  if (typeof options === "object" && options !== null) {
    const candidate = options as DocsConfig;

    if (typeof candidate.baseUrl === "string" && candidate.baseUrl.trim()) {
      baseUrl = candidate.baseUrl.trim();
    } else {
      baseUrl = defaultBaseUrl;
    }

    if (
      typeof candidate.maxPages === "number" &&
      Number.isFinite(candidate.maxPages) &&
      candidate.maxPages > 0
    ) {
      maxPages = Math.floor(candidate.maxPages);
    } else {
      maxPages = defaultMaxPages;
    }

    if (
      typeof candidate.requestDelayMs === "number" &&
      Number.isFinite(candidate.requestDelayMs) &&
      candidate.requestDelayMs >= 0
    ) {
      requestDelayMs = Math.floor(candidate.requestDelayMs);
    } else {
      requestDelayMs = defaultRequestDelayMs;
    }
  }

  if (!baseUrl) {
    throw new Error("A documentation baseUrl is required");
  }

  return {
    baseUrl,
    maxPages,
    requestDelayMs,
  };
};

const loadFromUrl = async (
  url: string,
  overrides: IngestionOverrides = {},
): Promise<LoadedDoc[]> => {
  const response = await axios.get(url, { timeout: 30000 });
  const $ = cheerio.load(response.data);

  const title = $("title").first().text().trim() || "Documentation";
  const bodyText =
    $("main, article, .content, #content").text().replace(/\s+/g, " ").trim() ||
    $("body").text().replace(/\s+/g, " ").trim();
  const textSplitter = buildTextSplitter(overrides);
  const chunks = await textSplitter.splitText(bodyText);

  return chunks.map((chunk) => ({
    content: chunk,
    metadata: {
      source: url,
      url,
      title,
      type: "text",
    },
  }));
};

const loadFromDocumentation = async (
  options?: DocsConfig & IngestionOverrides,
): Promise<LoadedDoc[]> => {
  const { baseUrl, maxPages, requestDelayMs } =
    normalizeDocumentationOptions(options);
  const chunkOptions =
    typeof options === "object" && options !== null
      ? {
          chunkSize: (options as IngestionOverrides).chunkSize,
          chunkOverlap: (options as IngestionOverrides).chunkOverlap,
          model: (options as IngestionOverrides).model,
        }
      : {};

  const urls = await url.documentation(baseUrl, maxPages);

  const allDocs: LoadedDoc[] = [];

  for (const url of urls) {
    try {
      const docs = await loadFromUrl(url, chunkOptions);
      allDocs.push(...docs);
      await sleep(requestDelayMs);
    } catch (error) {
      continue;
    }
  }

  return allDocs;
};

const ingestDocuments = async (
  documents: LoadedDoc[],
  options: IngestionOverrides = {},
): Promise<EmbeddedDoc[]> => {
  if (!documents || documents.length === 0) {
    throw new Error("No documents provided for ingestion");
  }

  const docsWithContent = documents.map((doc: LoadedDoc) => {
    if (!doc.content) {
      throw new Error("Each document must have a 'content' field");
    }
    return doc;
  });

  const embeddings = await embed.documents(
    docsWithContent.map((doc: LoadedDoc) => doc.content),
    {
      model: options.model,
    },
  );

  const docsWithEmbeddings = docsWithContent.map(
    (doc: LoadedDoc, index: number) => ({
      content: doc.content,
      embedding: embeddings[index],
      metadata: doc.metadata || {},
    }),
  );

  return docsWithEmbeddings;
};

export const ingest = {
  loadFromUrl,
  loadFromDocumentation,
  ingestDocuments,
};
