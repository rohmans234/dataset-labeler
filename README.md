# TalaqyLabeler - Dataset Labeling System

Sistem pelabelan dataset berbasis web yang terintegrasi dengan Google Sheets sebagai basis data dan n8n untuk alur kerja otomatis.

## 🛠 Panduan Pengembang (Development)

### Prasyarat
- Node.js 18.x atau lebih tinggi.
- Akun Google Cloud Platform (untuk Google Sheets API).
- File `.env` yang sudah terkonfigurasi.

### Instalasi
1. Clone repositori.
2. Masuk ke direktori aplikasi: `cd datasetLabeler`.
3. Instal dependensi: `npm install`.
4. Jalankan mode pengembangan: `npm run dev`.

### Struktur Data (Google Sheets)
Aplikasi membaca data pengguna dari sheet bernama `users` dengan kolom:
- Kolom A: Email
- Kolom B: Password
- Kolom C: Role (ADMIN/USER)
- Kolom D: Name

## 🚀 Panduan Deployment (VPS)

### Persiapan Environment
Pastikan file `.env` di root VPS mencakup variabel berikut:
- `NEXTAUTH_SECRET`: Secret key untuk sesi (bisa dibuat dengan `openssl rand -base64 32`).
- `ID_SPREADSHEET_LOG`: ID Google Spreadsheet Anda.
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`: Email dari Service Account Google.
- `GOOGLE_PRIVATE_KEY`: Private key dari Service Account (pastikan formatnya benar).
- `NEXTAUTH_URL`: URL publik VPS Anda (contoh: `http://vps-ip:3000`).

### Menjalankan dengan Docker
Kami menggunakan Docker Compose untuk menjalankan aplikasi dan n8n secara bersamaan.
1. Bangun dan jalankan container:
   ```bash
   docker-compose up -d --build