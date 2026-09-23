# syntax=docker/dockerfile:1

# --- Build React client ---
FROM node:20-bookworm-slim AS client-build
RUN corepack enable && corepack prepare yarn@4.9.1 --activate
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml ./
COPY client/package.json ./client/
COPY server/package.json ./server/
RUN yarn install --immutable
COPY client ./client
RUN yarn workspace presight-client build

# --- Build Spring Boot ---
FROM maven:3.9.9-eclipse-temurin-21 AS java-build
WORKDIR /build
COPY server-java/pom.xml .
COPY server-java/src ./src
RUN mvn -q -DskipTests package

# --- Runtime ---
FROM eclipse-temurin:21-jre-jammy
ENV PORT=8080
ENV CLIENT_DIST=/app/client/dist
ENV DB_PATH=/app/data/users.db
WORKDIR /app

COPY --from=client-build /app/client/dist ./client/dist
COPY --from=java-build /build/target/presight-server-java-1.0.0.jar ./app.jar

RUN mkdir -p /app/data

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
