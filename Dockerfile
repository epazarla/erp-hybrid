# Node.js imajını kullanacağız
FROM node:18-alpine

# Çalışma dizinini ayarlayalım
WORKDIR /app

# Önce sadece package.json dosyalarını kopyalayalım
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Önce server bağımlılıklarını yükleyelim
WORKDIR /app/server
RUN npm install

# Sonra client bağımlılıklarını yükleyip build edelim
WORKDIR /app/client
RUN npm install

# Kalan dosyaları kopyalayalım
WORKDIR /app
COPY . .

# Client'ı build edelim
WORKDIR /app/client
RUN npm run build

# Uygulamayı başlatmak için çalışma dizinini server'a ayarlayalım
WORKDIR /app/server

# Uygulamayı başlatalım
CMD ["npm", "start"]
