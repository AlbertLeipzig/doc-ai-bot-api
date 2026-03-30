const baseUrl = "http://localhost:7777";

export const getRequestUrl = ({
  path,
  id,
}: {
  path: string;
  id?: string;
}): string => (id ? `${baseUrl}/${path}/${id}` : `${baseUrl}/${path}`);
