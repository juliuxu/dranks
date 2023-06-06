# syntax = docker/dockerfile:1

ARG NODE_VERSION=18
FROM node:${NODE_VERSION}-slim as base

# Remix app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Throw-away build stage to reduce size of final image
FROM base as build

# Install node modules
COPY --link package.json package-lock.json ./
RUN npm install --production=false

# Copy application code
COPY --link . .

# Build application
RUN npm run build

# Remove development dependencies
RUN npm prune --production

# Final stage for app image
# FROM base
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian11

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
CMD [ "/app/node_modules/.bin/remix-serve", "/app/build" ]
