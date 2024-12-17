# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=22.12

FROM node:${NODE_VERSION}-alpine AS base
# install openssl for prisma
RUN apk add --no-cache openssl

WORKDIR usr/src/app
# Expose the port that the application listens on.
EXPOSE 3000

# Download dependencies as a separate step to take advantage of Docker's caching.
# Leverage a cache mount to /root/.yarn to speed up subsequent builds.
# Leverage a bind mounts to package.json and yarn.lock to avoid having to copy them into
# into this layer.
#
# development container
FROM base AS dev
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install
# to get rid of the permissions error
RUN mkdir -p .next && chmod -R 777 .next
# Run the application as a non-root user.
USER node
# Copy the rest of the source files into the image.
COPY . .
# generate prisma client
# RUN npx prisma migrate dev --name init
# Run the application.
CMD yarn run dev


# production container
FROM base AS prod
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile
USER node
COPY . .
CMD node src/index.js

# note: run "docker exec platon-server-1 npx prisma migrate dev --name init" after creating first image.
