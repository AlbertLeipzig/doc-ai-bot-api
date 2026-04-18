import mongoose from "mongoose";
import type { ConversationData } from "@doc-types";

const { model, Schema } = mongoose;

const conversationSchema = new Schema<ConversationData>(
  {
    vectorProfileId: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      default: "Untitled conversation",
      trim: true,
    },
    topK: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

export const Conversation = model("Conversation", conversationSchema);
