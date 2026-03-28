FROM node:20-alpine
WORKDIR /app
COPY doc-ai-bot-api/ ./doc-ai-bot-api/
COPY shared/ ./shared/
WORKDIR /app/doc-ai-bot-api
RUN npm ci
RUN npm run build
EXPOSE 7777
CMD ["node", "dist/doc-ai-bot-api/src/server.js"]
