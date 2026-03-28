import { connect, model } from "mongoose";
import mongoose from "mongoose";
import { apiConfig } from "../../apiConfig.ts";
import { vectorSchema } from "../models/vectorModel.ts";
import { VectorProfile } from "../models/vectorProfileModel.ts";
import { generate } from "./generationServices.ts";

export const connectToDb = async () => {
  try {
    await connect(apiConfig.db.uri);
  } catch (e) {
    throw new Error(e);
  }
};

const getDynamicVectorModel = (collectionName: string) => {
  return (
    mongoose.models[collectionName] ||
    model(collectionName, vectorSchema, collectionName)
  );
};

const initVectorProfile = async ({ model, chunkSize, chunkOverlap }) => {
  const collectionName = generate.vectorCollectionName({
    model,
    chunkSize,
    chunkOverlap,
  });
  const vectorProfile = await VectorProfile.create({
    name: collectionName,
    model,
    chunkSize,
    chunkOverlap,
  });
  const DynamicVectorModel = getDynamicVectorModel(collectionName);
  await DynamicVectorModel.collection.createSearchIndex({
    name: "vector_index",
    type: "vectorSearch",
    definition: {
      fields: [
        {
          type: "vector",
          path: "embedding",
          numDimensions: apiConfig.llm.embed.dimension,
          similarity: "cosine",
        },
      ],
    },
  });
  return vectorProfile;
};

export const db = {
  connect,
  getDynamicVectorModel,
  initVectorProfile,
};
