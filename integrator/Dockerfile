# Gunakan image Node.js resmi
FROM node:20

# Tambahkan Docker CLI ke dalam container
RUN apt-get update && apt-get install -y \
    docker.io \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Salin semua file ke dalam container
COPY . .


# Set default command
ENTRYPOINT ["node", "integrator.js"]
