# 1. Fáze: Instalace závislostí a sestavení
# POUŽIJEME PLNOU VERZI NODE (bez -slim), abychom měli jistotu, že nic nechybí
FROM node:20 AS builder
WORKDIR /app

COPY package*.json ./

# Zapneme detailní logování (--verbose), abychom viděli přesně každý krok, a ne jen černou skříňku
RUN npm ci --verbose

COPY . .

# Vypneme Next.js telemetrii (ta občas způsobí zamrznutí při buildu v CI)
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# 2. Fáze: Produkční prostředí
# Tady už můžeme použít -slim, protože to jen spouští hotový kód
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

CMD ["npm", "start"]