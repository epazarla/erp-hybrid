# Node.js imajını kullanacağız
FROM node:18-alpine

# Gerekli araçları yükleyelim
RUN apk add --no-cache python3 make g++

# 1. Server için çalışma alanı oluştur
WORKDIR /app/server

# 2. Sadece server package.json'ı kopyala
COPY server/package*.json ./


# 3. Server bağımlılıklarını yükle
RUN npm install

# 4. Server kaynak kodlarını kopyala
COPY server/ ./

# 5. Server'ı derle
RUN npm run build

# 6. Client için çalışma alanı oluştur
WORKDIR /app/client

# 7. Client package.json'ı kopyala
COPY client/package*.json ./

# 8. Client bağımlılıklarını yükle
RUN npm install

# 9. Client kaynak kodlarını kopyala
COPY client/ ./

# 10. Client'ı derle
RUN npm run build

# 11. Çalışma dizinini server'a ayarla
WORKDIR /app/server

# 12. Uygulamayı başlat
CMD ["npm", "start"]
