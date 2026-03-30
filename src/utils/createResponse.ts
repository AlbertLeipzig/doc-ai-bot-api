import { Request, Response, NextFunction } from "express";
import { systemMessagesTable } from "./systemMessagesTable.ts";

type ExitResponse = {
  res: Response;
  messageCode: string;
  data?: unknown;
};

export const createResponse = ({ res, messageCode, data }: ExitResponse) => {
  const { codeNumber, userMessage } = systemMessagesTable[messageCode];
  if (data !== undefined) return res.status(codeNumber).json(data);
  if (userMessage) return res.status(codeNumber).json({ userMessage });
  return res.sendStatus(codeNumber);
};
