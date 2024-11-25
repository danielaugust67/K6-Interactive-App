import http from 'k6/http';
import { check } from 'k6';

// Ambil parameter interaktif dari environment variables atau gunakan default jika tidak diset
const vus = __ENV.VUS              // Jumlah virtual users  
const duration = __ENV.DURATION    // Durasi pengujian
const endpoints = (__ENV.ENDPOINTS).split(','); // Daftar endpoint dipisahkan koma

// Set opsi K6 dengan parameter VUs dan durasi
export let options = {
    vus: parseInt(vus, 10),
    duration: duration,
};

// Fungsi utama yang akan dieksekusi oleh setiap virtual user
export default function () {
    endpoints.forEach(endpoint => {
        // Kirim request GET ke setiap endpoint dalam daftar
        let res = http.get(endpoint.trim());

        // Check apakah status responsnya adalah 200
        check(res, {
            [`status 200 for ${endpoint}`]: (r) => r.status === 200,
        });
    });
}
