# Tahap 1: Install Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./

# Optimasi NPM untuk koneksi tidak stabil (EOF)
RUN npm config set fetch-retries 5
RUN npm config set fetch-retry-mintimeout 20000
RUN npm config set fetch-retry-maxtimeout 120000

# Install dengan frozen-lockfile untuk konsistensi
RUN npm install --frozen-lockfile

# Tahap 2: Build Aplikasi
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Build aplikasi Next.js
RUN npm run build

# Tahap 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Fix: Salin file satu per satu untuk menghindari error "not found"
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next

# Gunakan wildcard (*) agar Docker tidak error jika folder public kosong/tidak ada
COPY --from=builder /app/public* ./public/

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]