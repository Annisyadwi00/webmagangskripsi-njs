# SI Magang - Sistem Informasi Magang Berbasis Web

SI Magang adalah aplikasi berbasis web yang dikembangkan untuk membantu proses pengelolaan kegiatan magang mahasiswa secara lebih terpusat dan terstruktur. Sistem ini dirancang untuk mendukung alur pendataan magang, pengajuan mitra, pengelolaan lowongan, upload laporan akhir, alokasi dosen pembimbing, hingga proses penilaian akhir magang.

Project ini dibuat sebagai bagian dari tugas akhir/skripsi dan digunakan untuk kebutuhan akademik, bukan untuk tujuan komersial.

## Fitur Utama

### Mahasiswa
- Registrasi menggunakan NPM/NIM dan email kampus.
- Mengisi data pengajuan magang.
- Mengajukan mitra magang.
- Melihat daftar lowongan magang.
- Mengunggah laporan akhir magang dalam bentuk link PDF.
- Melihat status pengajuan dan proses magang.
- Mengatur nomor WhatsApp pada halaman settings.

### Dosen Pembimbing
- Melihat mahasiswa bimbingan.
- Melihat laporan akhir mahasiswa.
- Menginput penilaian akhir magang.
- Menginput nilai mitra berdasarkan dokumen atau informasi resmi dari tempat magang.

### Admin / Staff TU
- Melihat pengajuan mitra.
- Melihat data lowongan magang.

### Super Admin
- Mengelola data mahasiswa magang.
- Memverifikasi pengajuan magang.
- Mengalokasikan dosen pembimbing.
- Mengelola pengajuan mitra.
- Mengelola lowongan magang.
- Mengelola akun admin/staff.

### Mitra
- Mengajukan lowongan magang melalui form publik.
- Lowongan yang diajukan akan diperiksa terlebih dahulu sebelum ditampilkan pada sistem.

## Teknologi yang Digunakan

- Next.js
- TypeScript
- Tailwind CSS
- Node.js
- Sequelize
- MySQL
- JWT Authentication
- bcryptjs

## Struktur Role

Sistem ini memiliki 4 role utama:

1. Mahasiswa
2. Dosen
3. Admin / Staff TU
4. Super Admin

Setiap role memiliki hak akses dan tampilan dashboard yang berbeda sesuai kebutuhan proses magang.

## Alur Sistem

1. Mahasiswa melakukan registrasi menggunakan NPM/NIM dan email kampus.
2. Mahasiswa mengisi pengajuan magang.
3. Staff memeriksa data pengajuan.
4. Staff menetapkan dosen pembimbing.
5. Mahasiswa melaksanakan magang sesuai periode yang diajukan.
6. Mahasiswa mengunggah laporan akhir.
7. Dosen pembimbing memeriksa laporan akhir.
8. Dosen pembimbing menginput nilai akhir.
9. Data magang dapat direkap oleh staff sesuai kebutuhan.
