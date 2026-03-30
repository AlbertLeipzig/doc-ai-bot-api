import type { Endpoint } from "../types/types.ts";

export const endpointsReferenceTable: Record<string, Endpoint> = {
  /* health - remember, health and ready don't have a common endpoint*/
  health: { path: "health", method: "GET" },
  ready: { path: "ready", method: "GET" },
  /* auth */
  login: { path: "auth/login", method: "POST" },
  logout: { path: "auth/logout", method: "DELETE" },
  verify: { path: "auth/verify", method: "GET" },
  /* chat */
  chat: { path: "chat", method: "POST" },
  /* conversation */
  deleteConversation: { path: "conversation", method: "DELETE" }, // needs an id
  getConversationList: { path: "conversation/list", method: "DELETE" }, // needs an id
  getSingleConversation: { path: "conversation", method: "GET" }, // needs an id
  /* rag */
  ingest: { path: "rag/ingest", method: "POST" },
  /* vector */
  deleteManyVectors: { path: "vector", method: "DELETE" },
  /* vectorProfile */
  deleteManyVectorProfiles: { path: "vector-profile", method: "DELETE" },
  vectorProfileList: { path: "vector-profile/list", method: "GET" },
  deleteVectorProfile: { path: "vector-profile", method: "DELETE" }, // needs an id
};
