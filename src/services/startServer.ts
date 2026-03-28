import { apiConfig } from "../../apiConfig.ts";

export const startServer = (app) => {
  try {
    const server = app.listen(apiConfig.server.port, () => {
      apiConfig.server.mode === "DEV" &&
        console.log(`Server is running on port ${apiConfig.server.port}`);
    });

    return server;
  } catch (e) {
    console.error(e);
    process.exit(2);
  }
};
