import axios from "axios";
import { endpointsReferenceTable } from "./endpointsReferecenTable.ts";
import { getRequestUrl } from "./getRequestUrl.ts";

export const makeRequest = ({
  name,
  id,
  body,
}: {
  id: string;
  name: string;
  body: unknown;
}) => {
  const requestReference = endpointsReferenceTable[name];
  const url = getRequestUrl({ path: requestReference.path, id: _id });
  const method = requestReference.method.toUpperCase();
  const hasBody = !["GET", "DELETE"].includes(method);

  return axios({
    method,
    url,
    data: hasBody ? (body ?? {}) : undefined,
  });
};
