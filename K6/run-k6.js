import { spawn } from 'child_process';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Fungsi untuk meminta input dari pengguna
const askQuestion = (question) => {
    return new Promise((resolve) => rl.question(question, resolve));
};

(async () => {
    try {
        // Minta input dari pengguna
        const vus = await askQuestion('Masukkan jumlah VUs: ');
        const duration = await askQuestion('Masukkan durasi (contoh: 30s): ');
        const endpoints = await askQuestion('Masukkan daftar endpoint (pisahkan dengan koma): ');
        const outputFile = await askQuestion('Masukkan nama file output (contoh: hasil.csv): ');

        // Meminta path folder untuk menyimpan file output
        let outputPath = await askQuestion('Masukkan path folder untuk menyimpan file output (default: ./output): ');
        if (!outputPath.trim()) {
            outputPath = './output'; // Default jika pengguna tidak memberikan input
        }

        // Pastikan folder output ada, buat jika belum ada
        if (!fs.existsSync(outputPath)) {
            console.log(`Folder ${outputPath} tidak ada. Membuat folder...`);
            fs.mkdirSync(outputPath, { recursive: true });
        }

        const fullOutputPath = path.join(outputPath, outputFile);

        console.log('Menjalankan pengujian dengan K6...');
        console.log('Proses sedang berlangsung. Silakan tunggu...');

        // Jalankan k6 menggunakan spawn
        const k6Process = spawn('k6', [
            'run',
            'test.js',
            `--env`,
            `VUS=${vus}`,
            `--env`,
            `DURATION=${duration}`,
            `--env`,
            `ENDPOINTS=${endpoints}`,
            `--out`,
            `csv=${fullOutputPath}`,
        ]);

        // Tangkap output k6 dan tampilkan ke konsol secara real-time
        k6Process.stdout.on('data', (data) => {
            process.stdout.write(data.toString()); // Cetak langsung output
        });

        k6Process.stderr.on('data', (data) => {
            process.stderr.write(data.toString()); // Cetak langsung error jika ada
        });

        k6Process.on('close', (code) => {
            if (code === 0) {
                console.log(`Proses selesai! File output disimpan di: ${fullOutputPath}`);
            } else {
                console.error(`Proses selesai dengan kode error: ${code}`);
            }
        });
    } catch (error) {
        console.error(`Terjadi kesalahan: ${error.message}`);
    } finally {
        rl.close();
    }
})();
