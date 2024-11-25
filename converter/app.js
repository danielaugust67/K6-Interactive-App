const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const prompt = require('prompt-sync')();

// Meminta pengguna untuk memasukkan jalur file CSV
const file_path = prompt('Please enter the path to the CSV file: ').trim();

// Cek apakah file ada dan memiliki ekstensi .csv
if (!fs.existsSync(file_path)) {
    console.error('Error: File not found. Please check the file path and try again.');
    process.exit(1);
}

if (path.extname(file_path) !== '.csv') {
    console.error('Error: Invalid file format. Please provide a .csv file.');
    process.exit(1);
}

console.log(`Menggunakan file CSV: ${file_path}`);

// Meminta pengguna untuk menentukan nama dan jalur file output
let output_directory = prompt('Please enter the directory to save the output file (default: ./output): ').trim();
if (!output_directory) {
    output_directory = './output';
}
if (!fs.existsSync(output_directory)) {
    console.log(`Directory ${output_directory} does not exist. Creating it...`);
    fs.mkdirSync(output_directory, { recursive: true });
}

const output_filename = prompt('Please enter the name for the output file (default: result_jmeter.csv): ').trim() || 'result_jmeter.csv';
const output_jmeter_path = path.resolve(output_directory, output_filename);
console.log(`Saving JMeter report to: ${output_jmeter_path}`);

// Membaca data CSV menggunakan Fast-CSV
const k6_data = [];
fs.createReadStream(file_path)
    .pipe(fastcsv.parse({ headers: true }))
    .on('data', row => {
        try {
            k6_data.push(row);
        } catch (err) {
            console.error(`Error processing row: ${err.message}`);
        }
    })
    .on('end', () => {
        console.log('File CSV berhasil dibaca.');

        // Proses untuk menemukan nilai VUS dan VUS Max
        let vus = null;
        let vus_max = null;

        k6_data.forEach(row => {
            if (row.metric_name === 'vus') {
                vus = parseInt(row.metric_value, 10) || null;
            }
            if (row.metric_name === 'vus_max') {
                vus_max = parseInt(row.metric_value, 10) || null;
            }
        });

        if (vus === null) {
            console.warn("Nilai VUS tidak ditemukan dalam data.");
        }
        if (vus_max === null) {
            console.warn("Nilai VUS Max tidak ditemukan dalam data.");
        }

        // Konversi data K6 ke format JMeter
        const jmeter_data = convertK6ToJMeter(k6_data, vus, vus_max);

        // Menyimpan data JMeter ke file CSV menggunakan Fast-CSV
        const ws = fs.createWriteStream(output_jmeter_path);
        fastcsv
            .write(jmeter_data, { headers: true })
            .pipe(ws)
            .on('finish', () => {
                console.log(`Laporan JMeter berhasil disimpan sebagai ${output_jmeter_path}`);
            })
            .on('error', err => {
                console.error('Error saat menyimpan file:', err);
            });
    })
    .on('error', err => {
        console.error('Error membaca file CSV:', err);
    });

// Fungsi untuk mengonversi data K6 ke format JMeter
function convertK6ToJMeter(k6_data, vus, vus_max) {
    const jmeter_data = [];
    const metricMap = {};

    // HTTP error messages
    const httpStatusMessages = {
        100: 'Continue',
        101: 'Switching Protocols',
        200: 'OK',
        201: 'Created',
        202: 'Accepted',
        204: 'No Content',
        301: 'Moved Permanently',
        302: 'Found',
        304: 'Not Modified',
        307: 'Temporary Redirect',
        400: 'Bad Request',
        401: 'Unauthorized',
        403: 'Forbidden',
        404: 'Not Found',
        405: 'Method Not Allowed',
        408: 'Request Timeout',
        409: 'Conflict',
        413: 'Payload Too Large',
        429: 'Too Many Requests',
        500: 'Internal Server Error',
        501: 'Not Implemented',
        502: 'Bad Gateway',
        503: 'Service Unavailable',
        504: 'Gateway Timeout',
        505: 'HTTP Version Not Supported'
    };

    // Mengumpulkan metrik berdasarkan timestamp
    k6_data.forEach(row => {
        const timestamp = parseInt(row.timestamp);

        if (!metricMap[timestamp]) {
            metricMap[timestamp] = {};
        }

        const metricName = row.metric_name;
        const metricValue = parseFloat(row.metric_value);

        // Simpan hanya Latency, IdleTime, Connect, dan http_req_duration
        if (metricName === 'http_req_blocked') {
            metricMap[timestamp]['Latency'] = metricValue;
        }
        if (metricName === 'http_req_sending') {
            metricMap[timestamp]['IdleTime'] = metricValue;
        }
        if (metricName === 'http_req_connecting') {
            metricMap[timestamp]['Connect'] = metricValue;
        }
        if (metricName === 'http_req_duration') {
            metricMap[timestamp]['Duration'] = metricValue;
        }
    });

    // Konversi metrik yang dikumpulkan ke format JMeter
    k6_data.forEach(row => {
        const timestamp = parseInt(row.timestamp);
        const latency = Math.round(metricMap[timestamp]?.Latency || 0);
        const connect = Math.round(metricMap[timestamp]?.Connect || 0);
        const idleTime = Math.round(metricMap[timestamp]?.IdleTime || 0);
        const duration = metricMap[timestamp]?.Duration || 0;
        const statusCode = row.status || (row.metric_name === 'http_req_failed' ? 500 : 200);

        const jmeter_row = {
            timeStamp: timestamp,
            elapsed: Math.round(duration) || 0,
            label: row.name || '',
            responseCode: statusCode,
            responseMessage: httpStatusMessages[statusCode] || 'Unknown Status',
            threadName: 'default',
            dataType: 'text',
            success: statusCode >= 200 && statusCode < 300,
            failureMessage: null,
            bytes: 0,
            sentBytes: 0,
            grpThreads: vus || 1,
            allThreads: vus_max || 1,
            URL: row.url || '',
            Latency: latency,
            IdleTime: idleTime,
            Connect: connect
        };

        jmeter_data.push(jmeter_row);
    });

    return jmeter_data;
}
