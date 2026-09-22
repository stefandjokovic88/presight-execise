# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare yarn@4.9.1 --activate
WORKDIR /app

FROM base AS deps
COPY package.json yarn.lock .yarnrc.yml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN yarn install --immutable

FROM deps AS build
COPY client ./client
COPY server ./server
RUN yarn workspace presight-client build \
  && yarn workspace presight-server build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=8080
ENV CLIENT_DIST=/app/client/dist
WORKDIR /app

COPY --from=deps /app/package.json /app/yarn.lock /app/.yarnrc.yml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/client/package.json ./client/
COPY --from=deps /app/server/package.json ./server/
COPY --from=build /app/client/dist ./client/dist
COPY --from=build /app/server/dist ./server/dist

RUN mkdir -p /app/server/data

EXPOSE 8080
CMD ["node", "server/dist/index.js"]
