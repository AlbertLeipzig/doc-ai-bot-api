import { NextFunction, Request, Response } from "express";
import { apiConfig } from "../../apiConfig.ts";

import type { RawError } from "../types/types.ts";

// PENDING: add message, retryable flag, or domain-specific codes per entry.
// Currently maps known codes explicitly, defaulting unknown to 500.

const httpCodeMap: Record<number, RawError> = {
  400: { code: 400 },
  404: { code: 404 },
  429: { code: 429 },
  500: { code: 500 },
};

const httpFallbackError: RawError = { code: 500 };

const normalizeApiError = (error: RawError): RawError =>
  httpCodeMap[error.code] ?? httpFallbackError;

export const errorHandlingMiddleware = (
  payload: RawError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (apiConfig.server.mode === "DEV") console.error(payload);

  const normalizedError = normalizeApiError(payload);

  normalizedError?.message
    ? res
        .status(normalizedError.code)
        .json({ message: normalizedError.message })
    : res.sendStatus(normalizedError.code);
};
