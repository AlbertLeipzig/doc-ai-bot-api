import axios from "axios";
import { apiConfig } from "../../apiConfig.ts";
import type { EmbedOptions } from "../../types/types.ts";

const getEmbeddingModel = (overrideModel?: string): string =>
  typeof overrideModel === "string" && overrideModel.trim()
    ? overrideModel.trim()
    : apiConfig?.llm?.vectorModel;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const embedQuery = async (
  text: string,
  options: EmbedOptions = {},
): Promise<number[]> => {
  const model = getEmbeddingModel(options.model);
  const maxRetries = Number(apiConfig?.llm?.embed?.maxRetries ?? 2);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `[embedQuery] Attempt ${attempt + 1}/${maxRetries + 1} - Model: ${model}`,
      );

      const response = await axios.post(
        `${apiConfig?.llm?.ollamaBaseUrl}/api/embeddings`,
        { model, prompt: text },
        { timeout: Number(apiConfig?.llm?.embed?.timeoutMs || 60000) },
      );

      const embedding = response.data?.embedding;

      if (!Array.isArray(embedding)) {
        throw new Error("Unexpected embedding response format from Ollama");
      }

      return embedding;
    } catch (error) {
      const isLast = attempt === maxRetries;
      if (isLast) {
        console.error("[embedQuery] Failed after retries:", error.message);
        throw error;
      }
      await sleep((attempt + 1) * 500);
    }
  }

  throw new Error("Failed to generate embedding after retries");
};

const embedDocuments = async (
  texts: string[],
  options: EmbedOptions = {},
): Promise<number[][]> => {
  const maxConcurrency = Math.max(
    1,
    Number(apiConfig?.llm?.embed?.maxConcurrency || 4),
  );
  const results = new Array(texts.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < texts.length) {
      const index = currentIndex++;
      results[index] = await embedQuery(texts[index], options);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(maxConcurrency, texts.length) }, () =>
      worker(),
    ),
  );

  return results;
};

export const embed = {
  query: embedQuery,
  documents: embedDocuments,
};
