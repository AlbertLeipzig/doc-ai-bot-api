FROM node:20.20.2-alpine
WORKDIR /app
COPY .npmrc ./
COPY package*.json ./
ARG GITHUB_TOKEN
RUN npm ci
COPY . .
RUN npm run build
CMD ["node", "dist/doc-ai-bot-api/src/server.js"]