# Sistem Informasi Magang Berbasis Web

Sistem Informasi Magang atau SI Magang adalah aplikasi berbasis web yang dikembangkan untuk membantu proses administrasi, monitoring, pelaporan, dan evaluasi kegiatan magang mahasiswa.

Project ini dibuat sebagai bagian dari tugas akhir/skripsi dan ditujukan untuk kebutuhan akademik, bukan untuk penggunaan komersial.

## Deskripsi Singkat

SI Magang memfasilitasi beberapa proses utama dalam kegiatan magang, yaitu:

- Pendaftaran dan pengajuan Letter of Acceptance (LOA)
- Verifikasi pengajuan magang oleh Admin
- Pemilihan dosen pembimbing oleh Mahasiswa
- Pengisian logbook kegiatan magang
- Evaluasi logbook oleh Dosen Pembimbing
- Upload laporan akhir
- Pemberian nilai akhir magang
- Pengelolaan data pengguna
- Pengelolaan informasi lowongan magang
- Pengiriman pesan dan masukan melalui halaman landing page

## Role Pengguna

Sistem ini memiliki tiga role utama:

### 1. Admin

Admin bertugas untuk:

- Mengelola data pengguna
- Memverifikasi pengajuan LOA mahasiswa
- Mengelola data lowongan magang
- Melihat feedback/pesan dari pengguna
- Mengatur proses administrasi magang

### 2. Mahasiswa

Mahasiswa dapat:

- Melakukan registrasi dan login
- Mengajukan LOA magang
- Memilih dosen pembimbing setelah pengajuan disetujui
- Mengisi logbook kegiatan magang
- Memperbaiki logbook jika diminta revisi
- Mengunggah laporan akhir
- Melihat status pengajuan dan evaluasi

### 3. Dosen

Dosen dapat:

- Melihat daftar mahasiswa bimbingan
- Menyetujui atau menolak permintaan bimbingan
- Mengevaluasi logbook mahasiswa
- Memberikan komentar revisi logbook
- Memberikan nilai akhir magang

## Teknologi yang Digunakan

Project ini dibangun menggunakan:

- Next.js
- React
- TypeScript
- Tailwind CSS
- Sequelize
- MySQL
- JSON Web Token
- bcryptjs

## Struktur Folder Utama

```txt
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── feedback/
│   │   ├── logbook/
│   │   ├── lowongan/
│   │   ├── pengajuan/
│   │   └── users/
│   └── ...
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── validators.ts
│   └── api-response.ts
├── models/
│   ├── Feedback.ts
│   ├── Job.ts
│   ├── Logbook.ts
│   ├── Pengajuan.ts
│   └── User.ts
└── components/