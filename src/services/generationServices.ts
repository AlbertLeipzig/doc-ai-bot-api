import type {
  GenerationMessages,
  GenerationOptions,
} from "../../../shared/types.ts";
import { apiConfig } from "../../apiConfig.ts";
import axios from "axios";
import { sleep } from "./sleepService.ts";

const { generate: _generate, ollamaBaseUrl } = apiConfig.llm;

const ollamaGenerateUrl = `${ollamaBaseUrl}/api/chat`;

const generateLlmResponse = async (
  messages: GenerationMessages,
  options: GenerationOptions = {},
) => {
  const normalizedMessages =
    typeof messages === "string"
      ? [{ role: "user", content: messages }]
      : messages;

  const { model, maxRetries, temperature, maxTokens, timeoutMs } = {
    ..._generate,
    ...options,
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.post(
        ollamaGenerateUrl,
        {
          model,
          messages: normalizedMessages,
          stream: false,
          options: {
            temperature,
            num_predict: maxTokens,
          },
        },
        { timeout: timeoutMs },
      );

      const content = response.data?.message?.content;
      return {
        content: content || "No response generated",
        model,
      };
    } catch (error: unknown) {
      const isLast = attempt === maxRetries;

      if (isLast) throw error;
      await sleep((attempt + 1) * 1000);
    }
  }

  throw new Error("Failed to generate response after retries");
};

const generateConversationTitle = async (question: string) => {
  try {
    const systemPrompt = apiConfig.llm.generate.systemPrompt;

    const userMessage = `Create a title for this conversation topic:\n\n"${question}"`;

    const result = await generateLlmResponse(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      {},
    );

    const title = result.content.trim();

    // Ensure title is not empty and reasonably short
    if (!title || title.length === 0) {
      return null;
    }

    // Cap at 100 characters to avoid excessively long titles
    return title.substring(0, 100);
  } catch (error) {
    console.warn("Title generation failed:", error.message);
    return null;
  }
};

const generateVectorCollectionName = ({
  model: _model,
  chunkSize,
  chunkOverlap,
}: {
  model: string;
  chunkSize: number;
  chunkOverlap: number;
}): string => {
  const model = _model
    .replace(/[^a-z0-9]/gi, "-")
    .trim()
    .toLowerCase();

  return `vector_${model}_s${chunkSize}_o${chunkOverlap}`;
};

export const generate = {
  conversationTitle: generateConversationTitle,
  llmResponse: generateLlmResponse,
  vectorCollectionName: generateVectorCollectionName,
};
