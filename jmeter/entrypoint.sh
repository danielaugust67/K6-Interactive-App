#!/bin/sh

# Debugging: Cek lingkungan dan path
echo "Debug: Environment Variables"
env
echo "Debug: Current Directory"
pwd
echo "Debug: Files in Current Directory"
ls -la

# Meminta pengguna untuk memasukkan path file input
echo "Masukkan path file input :"
read -r INPUT_PATH

# Periksa apakah file input ada
if [ ! -f "$INPUT_PATH" ]; then
  echo "File input tidak ditemukan di path: $INPUT_PATH"
  exit 1
fi

# Meminta pengguna untuk memasukkan path folder output
echo "Masukkan path folder output untuk laporan :"
read -r OUTPUT_PATH

# Buat folder output jika belum ada
if [ ! -d "$OUTPUT_PATH" ]; then
  echo "Folder output tidak ditemukan, membuat folder: $OUTPUT_PATH"
  mkdir -p "$OUTPUT_PATH"
fi

# Jalankan JMeter dengan jalur input dan output yang diberikan
echo "Menjalankan JMeter dengan path input: $INPUT_PATH dan output: $OUTPUT_PATH"
jmeter -g "$INPUT_PATH" -o "$OUTPUT_PATH"
