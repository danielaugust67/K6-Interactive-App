# Menggunakan JMeter image
FROM justb4/jmeter:5.5

# Copy semua file dari direktori kerja ke dalam container
COPY . /jmeter

# Copy entrypoint.sh ke container
COPY entrypoint.sh /entrypoint.sh

# Berikan permission agar skrip dapat dieksekusi
RUN chmod +x /entrypoint.sh

# Set entrypoint agar menjalankan skrip
ENTRYPOINT ["/entrypoint.sh"]
