FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY tsconfig*.json ./
COPY src/ ./src/
COPY apiConfig.ts ./
COPY types/ ./types/

RUN npm run build

EXPOSE 7777

CMD ["node", "dist/src/server.js"]