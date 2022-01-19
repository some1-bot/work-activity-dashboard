FROM node:apline AS dependencies
WORKDIR /app
COPY package.json package-*.json ./
RUN npm ci

FROM node:alpine AS dev
WORKDIR /app
ENV NODE_ENV=development
ENV  DEBUG=workly-api:*
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
CMD ["node","./bin/www"]

FROM node:alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
CMD ["node","./bin/www"]