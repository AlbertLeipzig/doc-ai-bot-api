import type { Request, Response, NextFunction } from "express";
import { VectorModel, Message, Conversation } from "../models/index.ts";
import {
  retriever,
  embedder,
  generator,
} from "@albertleipzig/doc-ai-bot-services";
import { apiConfig } from "../../apiConfig.ts";
import type { AskBody } from "@albertleipzig/doc-ai-bot-types";
import { createResponse } from "@albertleipzig/doc-ai-bot-utils";
import { ESystemMessage } from "@albertleipzig/doc-ai-bot-types";

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
      role,
      benchmark
    } = req.body as AskBody;

    console.log("body:", req.body);

    // 1. Validate
    if (!question || (!conversationId && !vectorProfileId))
      return createResponse({
        res,
        messageCode: ESystemMessage.REQUEST_MISSING_DATA,
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
          messageCode: ESystemMessage.NOT_FOUND,
          data: { error: `conversation ${resolvedConversationId} not found` },
        });
    } else {
      const newConversation = await Conversation.create({
        vectorProfileId,
        topK,
        ...(benchmark && { benchmark: true }),
      });
      resolvedConversationId = newConversation._id.toString();
    }

    // 3. Persist question message
    await Message.create({
      conversationId: resolvedConversationId,
      content: question,
      role : "user",
    });

    // 4. Retrieve relevant chunks
    const queryEmbedding = await embedder.query({
      text: question,
      config: apiConfig.llm,
    });
    const retrieverService = retriever.service(apiConfig.llm.retrieve);

    const pipeline = retrieverService.buildVectorSearchPipeline({
      queryEmbedding,
      vectorProfileId,
      k: topK,
    });
    const chunks = await VectorModel.collection.aggregate(pipeline).toArray();
    const context = retrieverService.buildContext(chunks);

    // 5. Generate answer
    const generatorService = generator(apiConfig.llm);
    const { content: answer } = await generatorService.llmResponse([
      { role: "system", content: `Answer using this context:\n\n${context}` },
      { role: "user", content: question },
    ]);

    // 6. Persist assistant message
    await Message.create({
      conversationId: resolvedConversationId,
      content: answer,
      role : "assistant",
    });

    // 7. Respond
    createResponse({
      res,
      messageCode: ESystemMessage.CREATE_SUCCESS,
      data: { conversationId: resolvedConversationId, answer },
    });
  } catch (e) {
    next(e);
  }
};
