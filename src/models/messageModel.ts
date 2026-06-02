import mongoose from "mongoose";
import type { MessageData } from "@albertleipzig/doc-ai-bot-types";

const { model, Schema } = mongoose;

const messageSchema = new Schema<MessageData>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant", "system", "benchmark"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    tokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Message = model<MessageData>("Message", messageSchema);
