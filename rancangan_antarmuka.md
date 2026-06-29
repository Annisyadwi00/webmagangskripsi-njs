4.1.2.6 Rancangan Antarmuka Pengguna

Rancangan antarmuka pengguna (User Interface Design) merupakan tahapan visualisasi dari struktur logika dan alur sistem yang telah dimodelkan sebelumnya ke dalam bentuk tata letak grafis yang interaktif. Tujuan utama dari perancangan antarmuka ini adalah untuk menjembatani komunikasi antara entitas pengguna dengan sistem komputasi di latar belakang, sekaligus memastikan bahwa aplikasi Sistem Informasi Magang Mahasiswa ini memenuhi prinsip ergonomi, kemudahan penggunaan (usability), dan aksesibilitas yang tinggi.

Pada penelitian ini, pendekatan perancangan antarmuka menggunakan prinsip desain berbasis komponen (component-based design) yang responsif. Artinya, tata letak halaman web akan beradaptasi secara otomatis mengikuti ukuran layar perangkat pengguna, baik itu komputer meja (desktop), tablet, maupun telepon pintar (smartphone). Untuk mewujudkan rancangan tersebut, spesifikasi antarmuka dibagi berdasarkan pemisahan hak akses (Role-Based Access Control) yang meliputi empat ruang lingkup utama:

1. Antarmuka Ruang Publik dan Autentikasi
Antarmuka ini mencakup halaman utama (landing page) yang memuat informasi umum dan bagian Frequently Asked Questions (FAQ) sebagai panduan dasar bagi mahasiswa. Selain itu, terdapat halaman login terpusat yang dirancang sederhana dan aman. Halaman ini berfungsi sebagai gerbang validasi kredensial sebelum sistem mengarahkan pengguna ke dasbor spesifik masing-masing.

2. Antarmuka Dasbor Mahasiswa
Rancangan antarmuka untuk mahasiswa difokuskan pada kejelasan informasi progres magang. Dasbor utama dilengkapi dengan indikator visual berupa tahapan langkah (progress stepper) sehingga mahasiswa dapat mengetahui status berkas mereka secara intuitif. Modul navigasi diatur secara minimalis, memberikan kemudahan akses menuju formulir pendaftaran, panel unggah dokumen digital, hingga lembar transparansi nilai akhir yang memuat hasil perhitungan metode SAW.

3. Antarmuka Dasbor Dosen (Pembimbing dan Penguji)
Antarmuka untuk tenaga pendidik dirancang dengan mengedepankan efisiensi dalam meninjau dokumen dan memasukkan nilai. Pada dasbor ini, sistem menyajikan daftar tabel mahasiswa aktif secara ringkas. Panel aksi dilengkapi dengan fitur pratinjau dokumen laporan akhir secara langsung serta formulir elektronik penginputan nilai yang telah dibatasi rentang skalanya. Hal ini dirancang untuk mencegah terjadinya kesalahan ketik (typo) saat dosen memasukkan skor evaluasi.

4. Antarmuka Dasbor Admin dan Super Admin
Sebagai pusat kendali operasional, antarmuka Admin menyajikan visualisasi data yang lebih padat. Bagian atas dasbor dilengkapi dengan elemen kartu statistik (stat cards) yang menampilkan rekapitulasi data pendaftar magang. Menu navigasi dirancang lebih komprehensif untuk memfasilitasi modul pengelolaan data master, antarmuka verifikasi dokumen dua tahap (terima atau tolak dengan catatan), panel alokasi penjadwalan dosen, hingga tombol eksekusi mesin kalkulasi SAW dan eksportasi laporan cetak.

Secara keseluruhan, arsitektur visual ini memadukan palet warna yang konsisten, tipografi yang mudah dibaca, serta umpan balik visual (seperti animasi loading dan notifikasi pop-up) guna memandu pengguna agar tidak kebingungan saat mengoperasikan sistem. Implementasi nyata dari seluruh cetak biru rancangan antarmuka ini direalisasikan memanfaatkan kerangka kerja antarmuka Next.js yang dipadukan dengan pustaka gaya Tailwind CSS.
