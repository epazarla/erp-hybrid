# Node.js imajını kullanacağız
FROM node:18-alpine

# Gerekli araçları yükleyelim
RUN apk add --no-cache python3 make g++

# 1. Kök dizini oluştur
WORKDIR /app

# 2. Sadece package.json dosyalarını kopyala
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# 3. Önce kök bağımlılıkları yükle (eğer varsa)
RUN if [ -f "package.json" ]; then npm install; fi

# 4. Server bağımlılıklarını yükle
WORKDIR /app/server
RUN npm install --loglevel verbose

# 5. Server kaynak kodlarını kopyala
WORKDIR /app
COPY server/ ./server/

# 6. Server'ı derle
WORKDIR /app/server
RUN npm run build --if-present

# 7. Client bağımlılıklarını yükle
WORKDIR /app/client
RUN npm install --loglevel verbose

# 8. Client kaynak kodlarını kopyala
WORKDIR /app
COPY client/ ./client/

# 9. Client'ı derle
WORKDIR /app/client
RUN npm run build --if-present

# 10. Çalışma dizinini server'a ayarla
WORKDIR /app/server

# 11. Hata ayıklama için çevre değişkenlerini yazdır
RUN echo "NODE_ENV: $NODE_ENV"
RUN echo "PORT: $PORT"
RUN echo "Current directory: $(pwd)"
RUN ls -la

# 12. Uygulamayı başlat
CMD ["npm", "start"]
