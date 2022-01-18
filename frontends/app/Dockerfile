# Only installing dependencies
FROM node:alpine AS deps
# RUN mkdir /app
WORKDIR /app
COPY package.json package-*.json ./
RUN npm ci

# Rebuild the source code only when changed
FROM node:alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM deps as dev
ENV NODE_ENV=development
CMD ["npm","run", "dev"]

# Production image, copy all the files and run next
FROM node:alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app/.next
USER nextjs

EXPOSE 3000 
CMD ["npm", "start"]