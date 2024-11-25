# Gunakan Node.js sebagai base image
FROM node:20

# Buat direktori kerja di dalam container
WORKDIR /app

# Salin semua file ke dalam direktori kerja container
COPY . .

# Install dependencies
RUN npm install

# Tentukan perintah untuk menjalankan aplikasi
CMD ["node", "app.js"]
