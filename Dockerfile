# Použijeme oficiální Node.js image
FROM node:20-slim

# Vytvoříme pracovní adresář
WORKDIR /usr/src/app

# Zkopírujeme package.json a nainstalujeme závislosti
COPY package*.json ./
RUN npm install --production

# Zkopírujeme zbytek kódu
COPY . .

# Port, na kterém aplikace běží (standardně 8080 pro Cloud Run)
ENV PORT 8080
EXPOSE 8080

# Příkaz pro spuštění
CMD [ "npm", "start" ]
