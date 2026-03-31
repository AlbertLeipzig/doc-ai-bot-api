FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json ./
COPY src/ ./src/
COPY apiConfig.ts ./
COPY types.ts/ ./types/

RUN npm run build

EXPOSE 7777

CMD ["node", "dist/src/server.js"]