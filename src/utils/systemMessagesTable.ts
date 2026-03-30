import { ApiResponse } from "../types/types.ts";

export const systemMessagesTable: Record<string, ApiResponse> = {
  /* SYSTEM */
  health: { codeNumber: 200 },
  ready: { codeNumber: 200 },
  dbConnect: { codeNumber: 200 },
  /* AUTH */
  login: { codeNumber: 200 },
  login_no_credentials: {
    codeNumber: 400,
    userMessage: "username and password are required",
  },
  login_wrong_credentials: { codeNumber: 401 },
  logout: { codeNumber: 200 },
  verify: { codeNumber: 200 },
  verify_no_token: { codeNumber: 401 },
  verify_wrong_token: { codeNumber: 401 },
  /* REQUEST */
  deleteOne: { codeNumber: 200 },
  deleteMany: { codeNumber: 200 },
  create: { codeNumber: 201 },
  get: { codeNumber: 200 },
  getList: { codeNumber: 200 },
  getList_empty: {
    codeNumber: 200,
    userMessage: "This collection seems to be empty",
  },
  notFound: { codeNumber: 404 },
  general_exception: { codeNumber: 500 },
};
