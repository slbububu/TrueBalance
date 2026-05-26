# 1. Fáze: Instalace závislostí a sestavení (build)
FROM node:20-slim AS builder
WORKDIR /app

# Nejdříve zkopírujeme package soubory, aby se využilo cacheování vrstev
COPY package*.json ./
RUN npm install

# Zkopírujeme zbytek kódu a zkompilujeme aplikaci
COPY . .
RUN npm run build

# 2. Fáze: Produkční prostředí (spuštění)
FROM node:20-slim AS runner
WORKDIR /app

# Nastavení na produkci
ENV NODE_ENV production

# Zkopírujeme pouze to, co je nezbytné pro běh
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Exponujeme port 3000, na kterém Next.js běží
EXPOSE 3000

# Příkaz pro spuštění
CMD ["npm", "start"]
