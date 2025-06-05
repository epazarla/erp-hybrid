# Node.js imajını kullanacağız
FROM node:18-alpine

# Çalışma dizinini ayarlayalım
WORKDIR /app

# Tüm dosyaları kopyalayalım
COPY . .

# Önce server bağımlılıklarını yükleyelim
WORKDIR /app/server
RUN npm install

# Sonra client bağımlılıklarını yükleyip build edelim
WORKDIR /app/client
RUN npm install
RUN npm run build

# Uygulamayı başlatmak için çalışma dizinini server'a ayarlayalım
WORKDIR /app/server

# Uygulamayı başlatalım
CMD ["npm", "start"]
