import mongoose from "mongoose";
import type { Model } from "mongoose";
import { apiConfig } from "../../apiConfig.ts";
import type { VectorData } from "../../types/types.ts";

const { model, Schema, models } = mongoose;

export const vectorSchema = new Schema<VectorData>(
  {
    content: { type: String, required: true, trim: true },
    embedding: { type: [Number], required: true },
    vectorProfileId: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

vectorSchema.index({ "metadata.chunkSize": 1, "metadata.overlapRatio": 1 });

/* ABSTRACT! */

const collectionName =
  apiConfig.llm.embed?.collectionName ||
  process.env.COLLECTION_NAME ||
  "vectors";

export const getDynamicVectorModel = (collectionName: string) => {
  return (
    mongoose.models[collectionName] ||
    mongoose.model(collectionName, vectorSchema, collectionName)
  );
};

export const VectorModel: Model<VectorData> =
  models.Document || model("Vectors", vectorSchema, collectionName);
