const { spawn } = require('child_process');

// Fungsi untuk menjalankan perintah dengan interaksi stdin
function runInteractiveCommand(command, args) {
    return new Promise((resolve, reject) => {
        const process = spawn(command, args, { stdio: 'inherit' });

        process.on('close', (code) => {
            if (code !== 0) {
                reject(`Process exited with code ${code}`);
            } else {
                resolve();
            }
        });
    });
}

// Fungsi utama untuk menjalankan semua tahapan
async function runImagesSequentially() {
    try {
        console.log('Running k6-image...');
        await runInteractiveCommand('docker', [
            'exec', '-it', 'interaktif-app-k6-image-1', 'bash', '-c',
            'node run-k6.js && exit'
        ]);

        console.log('Running converter-image...');
        await runInteractiveCommand('docker', [
            'exec', '-it', 'interaktif-app-converter-image-1', 'bash', '-c',
            'node app.js && exit'
        ]);

        console.log('Running jmeter-image...');
        await runInteractiveCommand('docker', [
            'exec', '-it', 'interaktif-app-jmeter-image-1', 'bash', '-c',
            '/entrypoint.sh && exit'
        ]);

        console.log('All images have been executed sequentially!');
    } catch (error) {
        console.error('An error occurred while running images:', error);
    }
}

// Jalankan fungsi utama
runImagesSequentially();
