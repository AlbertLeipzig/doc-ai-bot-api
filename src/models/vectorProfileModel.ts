import { Schema, model } from "mongoose";
import { VectorProfileData } from "@doc-ai-bot/types";
const vectorProfileSchema = new Schema<VectorProfileData>(
  {
    name: { type: String, required: true },
    model: { type: String, required: true },
    chunkSize: { type: Number, required: true },
    chunkOverlap: { type: Number, required: true },
  },
  { timestamps: false },
);

export const VectorProfile = model<VectorProfileData>(
  "VectorProfile",
  vectorProfileSchema,
);
