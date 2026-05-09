FROM node:20.20.2-alpine
WORKDIR /app
COPY .npmrc ./
COPY package*.json ./
ARG GITHUB_TOKEN
RUN npm ci
COPY . .
CMD ["npx", "tsx", "src/server.ts"]