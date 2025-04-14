# syntax=docker/dockerfile:1

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
# Run the application.
CMD yarn run dev


#build stage
FROM base AS builder
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --frozen-lockfile
RUN mkdir -p .next node_modules && chmod -R 777 .next
COPY node_modules/@prisma node_modules/@prisma
COPY node_modules/.prisma node_modules/.prisma
# RUN chown -R node:node prisma/
# RUN chown -R node:node node_modules/prisma
# RUN chown -R node:node node_modules/.prisma
USER node
COPY . .
RUN yarn build

# production container
FROM base AS prod
COPY --from=builder /usr/src/app/.next .next
COPY --from=builder /usr/src/app/node_modules node_modules
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=yarn.lock,target=yarn.lock \
    --mount=type=cache,target=/root/.yarn \
    yarn install --production --frozen-lockfile
# RUN mkdir -p prisma && chmod -R 777 prisma
COPY . .
RUN chown -R node:node prisma/
RUN chown -R node:node node_modules/prisma
RUN chown -R node:node node_modules/.prisma
USER node
CMD ["yarn", "start"]

#sudo docker exec -it appcontainer sh -c "npx prisma migrate deploy"
