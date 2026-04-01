import type { Request, Response, NextFunction } from "express";
import { Conversation } from "../models/conversationModel.ts";
import { Message } from "../models/messageModel.ts";
import { VectorModel } from "../models/vectorModel.ts";
import { retrieveService } from "../services/retrieveService.ts";
import { embed } from "../services/embeddingService.ts";
import { generate } from "../services/generationServices.ts";
import { apiConfig } from "../../apiConfig.ts";
import { AskBody } from "../types/types.ts";
import { createResponse } from "../utils/createResponse.ts";

export const chatController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      question,
      vectorProfileId,
      conversationId,
      topK = apiConfig.llm.retrieve.topK,
    } = req.body as AskBody;

    // 1. Validate
    if (!question || !vectorProfileId)
      return createResponse({
        res,
        messageCode: "missingContent",
        data: { message: "missing question and / or vector profile id" },
      });

    // 2. Resolve conversation
    let resolvedConversationId = conversationId ?? null;

    if (resolvedConversationId) {
      const existing = await Conversation.findById(
        resolvedConversationId,
      ).lean();
      if (!existing)
        return createResponse({
          res,
          messageCode: "notFound",
          data: { error: `conversation ${resolvedConversationId} not found` },
        });
    } else {
      const newConversation = await Conversation.create({
        vectorProfileId: vectorProfileId,
        topK,
      });
      resolvedConversationId = newConversation._id.toString();
    }

    // 3. Persist user message
    await Message.create({
      conversationId: resolvedConversationId,
      content: question,
      role: "user",
    });

    // 4. Retrieve relevant chunks
    const queryEmbedding = await embed.query(question);
    const pipeline = retrieveService.buildVectorSearchPipeline({
      queryEmbedding,
      vectorProfileId,
      k: topK,
    });
    const chunks = await VectorModel.collection.aggregate(pipeline).toArray();
    const context = retrieveService.buildContext(chunks);

    // 5. Generate answer
    const { content: answer } = await generate.llmResponse([
      { role: "system", content: `Answer using this context:\n\n${context}` },
      { role: "user", content: question },
    ]);

    // 6. Persist assistant message
    await Message.create({
      conversationId: resolvedConversationId,
      content: answer,
      role: "assistant",
    });

    // 7. Respond
    createResponse({
      res,
      messageCode: "create",
      data: { conversationId: resolvedConversationId, answer },
    });
  } catch (e) {
    next(e);
  }
};
