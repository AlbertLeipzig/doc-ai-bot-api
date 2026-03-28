import { apiConfig } from "../../apiConfig.ts";
import { embed as embeddingService } from "./embeddingService.ts";

const { retrieve, embed } = apiConfig.llm;

const defaultTopK = retrieve.topK || 5;
const indexName = retrieve.indexName || embed.collectionName;
const numCandidatesMultiplier = retrieve.numCandidatesMultiplier;
const minNumCandidates = retrieve.minNumCandidates;

const getTopK = (k?: number) => (k ? Number(k) : defaultTopK);

const buildVectorSearchPipeline = ({
  queryEmbedding,
  k,
  vectorProfileId,
}: {
  queryEmbedding: number[];
  k?: number;
  vectorProfileId: string;
}) => {
  const limit = getTopK(k);
  return [
    {
      $vectorSearch: {
        index: indexName,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: Math.max(
          limit * numCandidatesMultiplier,
          minNumCandidates,
        ),
        limit,
        filter: { vectorProfileId: { $eq: vectorProfileId } },
      },
    },
    {
      $project: {
        content: 1,
        metadata: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ];
};

const mapFallbackResults = (documents: any[]) =>
  documents.map((doc, index) => ({
    content: doc.content,
    metadata: doc.metadata,
    _id: doc._id,
    score: 1 - index * 0.1,
  }));

const buildContext = (documents: any[]) =>
  documents.map((doc) => doc.content).join("\n\n");

export const retrieveService = {
  getTopK,
  buildVectorSearchPipeline,
  mapFallbackResults,
  buildContext,
};
