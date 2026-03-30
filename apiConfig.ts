import { config as _config } from "dotenv";
import type { ApiConfig } from "./src/types/types.ts";

_config({ quiet: true });

const {
  PORT,
  DB_URI,
  MODE,
  COLLECTION_NAME,
  INDEX_NAME,
  ALLOWED_CLIENT_ORIGIN,
  JWT_SECRET,
  ADMIN_USER,
  ADMIN_PASSWORD,
} = process.env;

const parsedPort = Number(PORT);

export const apiConfig: ApiConfig = {
  db: {
    uri: DB_URI || "",
  },
  llm: {
    ollamaBaseUrl: "http://ollama:11434",
    vectorModel: "nomic-embed-text", // model to embed AND retrieve. "embeddingModel" just does not desvribe everyting t does
    retrieve: {
      topK: 5,
      indexName: INDEX_NAME,
      numCandidatesMultiplier: 10,
      minNumCandidates: 50,
    },
    generate: {
      model: "qwen2.5:1.5b",
      maxTokens: 500,
      systemPrompt:
        "You are a helpful assistant that creates concise, descriptive titles for conversations. Given a user's question or initial message, generate a short title (3-8 words) that captures the essence of the topic. Return only the title, nothing else.",
      temperature: 0.7,
      maxRetries: 3,
    },
    embed: {
      batchSize: 50,
      dimension: 768,
      collectionName: COLLECTION_NAME,
      maxConcurrency: 5,
      maxRetries: 3,
      timeoutMs: 120000,
      chunking: {
        size: 1000,
        overlap: 200,
      },
    },
    docs: {
      // default documentation URL used when no baseUrl is supplied in the
      // ingestion request. benchmarkConfig.ingest is already configured to
      // crawl the d3js site, so using the same value here prevents the
      // accidental Three.js fallback that produced repeated 404 messages.
      baseUrl: "https://d3js.org/",
      maxPages: 25,
      requestDelayMs: 500,
    },

    chat: {
      maxContextChars: 5000,
      maxHistoryMessages: 12,
    },
  },
  server: {
    port: Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 7777,
    mode: MODE || "DEV",
    jwtSecret: JWT_SECRET,
    cors: {
      methods: "GET, POST, DELETE",
      origin: "*",
    },
    cookieOptions: {
      httpOnly: true,
      sameSite: "strict" as const,
      secure: MODE === "production",
      maxAge: 24 * 60 * 60 * 1000,
    },
    adminUser: ADMIN_USER,
    adminPassword: ADMIN_PASSWORD,
  },
};