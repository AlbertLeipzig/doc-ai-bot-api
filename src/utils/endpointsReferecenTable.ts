import type{Endpoint} from "../types/types.ts"

const apiUrl = "http://api:7777";
const benchmarkUrl = "http://api:7778";

export const endpointsReferenceTable: Record<string, Endpoint> = {
  /* conversation */
  findSingleConversation: { path: "conversation", method: "GET" }, // needs an id
  getConversationList: { path: "conversation/list", method: "DELETE" }, // needs an id
  newConversation: { path: "conversation", method: "POST" },
  deleteConversation: { path: "conversation", method: "DELETE" }, // needs an id
  deleteMultipleConversations: { path: "conversation", method: "DELETE" },
  message: { path: "message/ask", method: "POST" },
  /* health - remember, health and ready don't have a common endpoint*/
  health: { path: "health", method: "GET" },
  ready: { path: "ready", method: "GET" },
  /* message */
  newMessage: { path: "message", method: "POST" },
  getMessage: { path: "message", method: "GET" }, // needs an id
  getManyMessages: { path: "message", method: "GET" },
  deleteMessae: { path: "message", method: "DELETE" }, // needs an id
  deleteManyMessages: { path: "message", method: "DELETE" },
  /* rag */
  ingest: { path: "rag/ingest", method: "POST" },
  retrieve: { path: "rag/retrieve", method: "POST" },
  /* vector */
  getVector: { path: "vector", method: "GET" }, // needs an id
  getManyVectors: { path: "vector", method: "GET" },
  deleteVector: { path: "vector", method: "DELETE" }, // needs an id
  deleteManyVectors: { path: "vector", method: "DELETE" },
  /* vectorProfile */
  newVectorProfile: { path: "vectorProfile", method: "POST" },
  getVectorProfile: { path: "vectorProfile", method: "GET" }, // needs an id
  getManyVectorProfiles: { path: "vectorProfile", method: "GET" },
  deleteVectorProfile: { path: "vectorProfile", method: "DELETE" }, // needs an id
  deleteManyVectorProfiles: { path: "vectorProfile", method: "DELETE" },
};

/* Placeholder Function to Create Request Urls */
/* The actual goal is to have a Centralized Request Builder Function that  */
