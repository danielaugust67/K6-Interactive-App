# Gunakan image dasar Node.js untuk menjalankan script run-k6.js
FROM node:20

# Buat direktori kerja
WORKDIR /app
COPY . .

# Install dependencies untuk k6
RUN apt-get update && apt-get install -y curl gnupg && \
    curl -s https://dl.k6.io/key.gpg | apt-key add - && \
    echo "deb https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list && \
    apt-get update && apt-get install -y k6 && \
    apt-get clean


# Salin file run-k6.js dan test.js ke dalam container
COPY run-k6.js test.js package.json /app/

# Tentukan entrypoint untuk Node.js
CMD ["node", "run-k6.js"]
