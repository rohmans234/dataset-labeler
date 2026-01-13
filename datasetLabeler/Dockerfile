# Tahap 1: Install Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Salin file manifes
COPY package.json package-lock.json ./

# Optimasi NPM tanpa menggunakan 'timeout' yang tidak valid
RUN npm config set fetch-retries 5 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000

# Gunakan npm ci untuk stabilitas
RUN npm ci

# Tahap 2: Build Aplikasi
FROM node:18-alpine AS builder
WORKDIR /app

# Tambahkan baris ini untuk mencegah Out-Of-Memory
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Tahap 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]