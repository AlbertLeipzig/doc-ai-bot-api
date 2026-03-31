# API TASKS

## Bugs

src/middlewares/errorHandlingMiddleware.ts(2,31): error TS2307: Cannot find module '../../shared/types.ts' or its corresponding type declarations.
src/server.ts(5,29): error TS2307: Cannot find module './utils/connectToDb.ts' or its corresponding type declarations.
src/server.ts(6,29): error TS2307: Cannot find module './utils/startServer.ts' or its corresponding type declarations.
src/server.ts(7,26): error TS2307: Cannot find module './utils/appState.ts' or its corresponding type declarations.
src/services/dbService.ts(3,27): error TS2307: Cannot find module '../../apiConfig.ts' or its corresponding type declarations.
src/services/dbService.ts(4,30): error TS2307: Cannot find module '../models/vectorModel.ts' or its corresponding type declarations.
src/services/dbService.ts(5,31): error TS2307: Cannot find module '../models/vectorProfileModel.ts' or its corresponding type declarations.
src/services/embeddingService.ts(8,29): error TS2551: Property 'vectorModel' does not exist on type '{ chat: ChatConfig; docs: DocsConfig; embed: { batchSize: number; chunking: { sizes: number[]; overlaps: number[]; }; collectionName: string; dimension: number; maxConcurrency: number; maxRetries: number; timeoutMs: number; }; generate: GenerateConfig; ollamaBaseUrl: string; retrieve: { ...; }; vectorModels: string[...'. Did you mean 'vectorModels'?
src/services/ingestionService.ts(19,44): error TS2551: Property 'size' does not exist on type '{ sizes: number[]; overlaps: number[]; }'. Did you mean 'sizes'?
src/services/ingestionService.ts(22,44): error TS2551: Property 'overlap' does not exist on type '{ sizes: number[]; overlaps: number[]; }'. Did you mean 'overlaps'?
src/services/retrieveService.ts(5,30): error TS2551: Property 'topK' does not exist on type '{ indexName?: string; minNumCandidates: number; numCandidatesMultiplier: number; topKs: number[]; }'. Did you mean 'topKs'?


## Future

- systemMessage implementaiton in ingestionController