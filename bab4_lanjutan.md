4.1.4.3 Implementasi Halaman Mahasiswa

Halaman antarmuka mahasiswa diimplementasikan menggunakan Next.js dengan desain yang responsif dan interaktif. Halaman ini berfungsi sebagai portal utama bagi mahasiswa untuk memantau progres magang mereka. Pada halaman dasbor, mahasiswa disajikan dengan visualisasi tahapan magang (progress stepper) yang mencakup pendaftaran, pemeriksaan staf, magang aktif, hingga selesai. Selain itu, mahasiswa dapat mengakses menu pengajuan magang untuk mengisi formulir pendaftaran dan mengunggah dokumen persyaratan (seperti Surat Penerimaan dari mitra). Implementasi pengunggahan berkas menggunakan multipart/form-data yang diproses oleh backend untuk memastikan validitas format dan ukuran file. Setelah magang selesai, halaman ini juga menyediakan antarmuka bagi mahasiswa untuk melihat hasil konversi nilai akhir secara transparan berdasarkan perhitungan metode SAW, lengkap dengan rincian komponen nilai dari dosen pembimbing, instansi mitra, dan dosen penguji.

4.1.4.4 Implementasi Halaman Dosen Pembimbing

Halaman antarmuka dosen pembimbing dirancang untuk memfasilitasi proses pemantauan dan evaluasi mahasiswa bimbingan. Pada halaman dasbor, dosen disajikan ringkasan statistik jumlah mahasiswa aktif dan jadwal evaluasi. Fitur utama yang diimplementasikan pada halaman ini meliputi modul review laporan akhir dan modul penginputan nilai. Pada antarmuka review, dosen dapat mengunduh atau membuka tautan draf laporan mahasiswa, kemudian memberikan persetujuan atau catatan revisi. Pada antarmuka penilaian, sistem menyediakan formulir elektronik yang divalidasi secara otomatis agar dosen hanya dapat memasukkan nilai dalam rentang skala 0 hingga 100 untuk komponen nilai bimbingan dan nilai performa mitra. Data yang diinputkan akan langsung dikirimkan ke database MySQL melalui Sequelize ORM secara real-time.

4.1.4.5 Implementasi Halaman Admin

Halaman admin diimplementasikan sebagai pusat kendali (control panel) bagi staf Tata Usaha fakultas. Halaman ini memiliki tingkat otorisasi yang tinggi untuk mengelola data operasional. Implementasi fitur utama meliputi pengelolaan data master (mahasiswa, dosen, dan instansi mitra) dengan fungsionalitas CRUD (Create, Read, Update, Delete). Selain itu, terdapat antarmuka verifikasi dokumen yang memungkinkan admin untuk menyetujui atau menolak berkas pendaftaran mahasiswa dengan memberikan catatan perbaikan. Halaman ini juga memuat modul alokasi dosen yang dibangun dengan komponen dropdown dinamis, memungkinkan admin untuk memetakan mahasiswa dengan Dosen Pembimbing maupun Dosen Penguji. Pada akhir periode magang, antarmuka admin menyediakan tombol pemicu eksekusi algoritma komputasi SAW dan fitur eksportasi data rekapitulasi ke dalam format PDF atau Excel.

4.1.4.6 Implementasi Halaman Super Admin

Implementasi halaman Super Admin pada dasarnya mewarisi seluruh fungsionalitas yang ada pada halaman Admin reguler, namun dibekali dengan kapabilitas pemantauan tingkat tinggi (high-level monitoring). Pada dasbor Super Admin, sistem merender visualisasi grafik pertumbuhan data, statistik persentase kelulusan, dan ringkasan aktivitas pengguna secara keseluruhan. Super Admin memiliki hak prerogatif untuk melakukan intervensi terhadap data-data krusial, manajemen akun user (termasuk hak akses Admin), serta memelihara stabilitas aplikasi secara komprehensif.

4.1.4.7 Implementasi Perhitungan SAW pada Sistem

Implementasi algoritma Simple Additive Weighting (SAW) dibangun di sisi server (Node.js) guna menjaga keamanan logika perhitungan dari manipulasi eksternal. Eksekusi ini dirancang untuk berjalan ketika seluruh komponen nilai (bimbingan, instansi, dan sidang) telah berstatus lengkap. Secara teknis, sistem menarik nilai mentah mahasiswa dari tabel database melalui Sequelize, kemudian mengeksekusi fungsi pembagian matriks terhadap nilai maksimum setiap kriteria (normalisasi matriks). Hasil normalisasi tersebut direpresentasikan ke dalam bentuk desimal (floating-point), yang selanjutnya dikalikan dengan bobot kriteria (W = [0,40, 0,30, 0,30]). Akumulasi akhir dari perkalian ini menghasilkan skor preferensi (Vi) yang langsung dikonversi menjadi huruf mutu (Grade) berdasarkan standar konversi nilai akademik fakultas. Nilai akhir ini direkam permanen ke dalam database untuk dapat ditampilkan di dasbor mahasiswa dan diekspor oleh admin.

4.1.5 Pengujian Sistem

4.1.5.1 Metode Pengujian

Metode pengujian yang diterapkan dalam penelitian ini adalah pengujian Black Box (Black Box Testing). Pendekatan ini difokuskan pada pengujian fungsionalitas spesifikasi perangkat lunak tanpa perlu meninjau struktur internal atau kode program (source code). Pengujian dilakukan dengan memberikan serangkaian masukan (input) tertentu pada antarmuka sistem dan memvalidasi apakah keluaran (output) atau respons sistem telah sesuai dengan skenario yang diharapkan.

4.1.5.2 Skenario Black Box Testing

Skenario pengujian disusun secara sistematis berdasarkan use case utama yang telah dirancang pada tahapan sebelumnya. Kriteria pengujian dibagi menjadi beberapa modul operasional, mulai dari validasi keamanan login, uji kelayakan pengisian form oleh mahasiswa, validasi penolakan sistem terhadap input yang tidak valid (seperti nilai huruf pada kolom angka), hingga uji komputasi akurasi perhitungan SAW. Setiap skenario diukur tingkat keberhasilannya berdasarkan kesesuaian antara ekspektasi sistem dan hasil aktual di layar browser.

4.1.5.3 Hasil Pengujian Fitur Mahasiswa

Pengujian pada fitur mahasiswa menunjukkan tingkat keberhasilan 100%. Sistem secara presisi mampu menolak file unggahan dokumen yang melebihi batas ukuran (maksimal 2MB) atau format yang tidak diizinkan. Pembaruan status secara real-time berfungsi dengan baik ketika dokumen disetujui atau ditolak oleh admin. Fitur pengecekan transparansi nilai juga berhasil menampilkan tabel kalkulasi akhir beserta rincian nilai mentah sesuai dengan session ID mahasiswa yang bersangkutan.

4.1.5.4 Hasil Pengujian Fitur Dosen Pembimbing

Hasil pengujian pada modul Dosen Pembimbing membuktikan bahwa alur penginputan nilai dan peninjauan dokumen bebas dari error. Saat dilakukan skenario input nilai di luar batas skala (misalnya angka 105 atau teks abjad), sistem berhasil memblokir proses penyimpanan dan memunculkan alert peringatan. Sistem juga berhasil memisahkan data akses sehingga dosen hanya dapat melihat dan menilai mahasiswa yang terdaftar di bawah bimbingannya.

4.1.5.5 Hasil Pengujian Fitur Admin

Fitur-fitur vital pada halaman Admin telah diuji coba dengan manipulasi data yang intensif. Pengujian operasi CRUD pada pengelolaan data master (Mahasiswa, Dosen, dan Mitra) berjalan stabil dan berhasil terefleksi secara langsung pada database MySQL. Fitur pemetaan Alokasi Dosen Pembimbing dan Dosen Penguji berhasil merekam foreign key yang tepat, sehingga data mahasiswa langsung muncul pada dasbor dosen yang ditugaskan tanpa adanya redudansi.

4.1.5.6 Hasil Pengujian Fitur Super Admin

Pengujian pada antarmuka Super Admin menunjukkan kapabilitas rendering grafik statistik dan manajemen kontrol akun dapat dioperasikan secara penuh. Fitur eksportasi data juga divalidasi keberhasilannya; sistem mampu mengonversi rekapitulasi data mahasiswa dan nilai ke dalam format dokumen eksternal secara dinamis tanpa mengubah integritas data asli.

4.1.5.7 Hasil Pengujian Perhitungan SAW

Tahapan ini merupakan proses pengujian paling krusial. Sistem diuji dengan berbagai variasi angka nilai mentah dari ketiga komponen kriteria utama. Hasil komputasi dari sistem (backend) dicocokkan secara empiris dengan hasil perhitungan matematis manual menggunakan spreadsheet. Seluruh uji coba menunjukkan deviasi nol (0), membuktikan bahwa mesin komputasi algoritma SAW dalam aplikasi ini berjalan sangat akurat dalam melakukan normalisasi matriks, perkalian bobot, dan pemeringkatan nilai preferensi akhir mahasiswa.

4.1.5.8 Kesimpulan Hasil Pengujian

Secara keseluruhan, rangkaian Black Box Testing mengonfirmasi bahwa Sistem Informasi Magang Mahasiswa ini beroperasi secara optimal dan stabil. Seluruh spesifikasi kebutuhan fungsional dan non-fungsional telah terpenuhi, mulai dari pengamanan peran otorisasi, interaksi database yang konsisten, hingga presisi perhitungan nilai akhir. Aplikasi ini dinyatakan layak dan siap diimplementasikan untuk mendukung digitalisasi birokrasi magang di Fakultas Ilmu Komputer UNSIKA.

4.1.6 Pemeliharaan Sistem

4.1.6.1 Identifikasi Perbaikan Sistem

Fase identifikasi perbaikan dilakukan pasca-implementasi untuk memantau potensi anomali atau regresi kinerja saat sistem menampung beban traffic pengguna di lingkungan produksi (production). Evaluasi awal menyoroti beberapa aspek, seperti penyesuaian estetika tampilan (UI) untuk mencegah tumpang tindih elemen visual saat diakses melalui perangkat gawai (mobile), serta optimalisasi latensi kueri basis data pada modul rekapitulasi yang melibatkan penarikan relasi data kompleks (tabel mahasiswa, dosen, mitra, dan nilai) dalam satu instruksi.

4.1.6.2 Rencana Pemeliharaan Sistem

Rencana pemeliharaan (maintenance) dibagi menjadi pemeliharaan korektif dan preventif. Pemeliharaan korektif meliputi penanganan bug minor yang mungkin ditemui pengguna secara berkala, seperti perbaikan error compiler akibat keketatan (strict mode) pada TypeScript dan integrasi framework Next.js. Sedangkan pemeliharaan preventif berfokus pada pelapisan keamanan basis data, pencadangan (backup) rekam data relasional secara berkala, serta pembaruan versi library (seperti Sequelize ORM dan React) guna memastikan keamanan dan kompatibilitas aplikasi tetap relevan di masa mendatang.

4.2 Pembahasan

Berdasarkan seluruh hasil perancangan, implementasi, dan pengujian yang telah dipaparkan, penelitian ini berhasil mentransformasi proses administrasi magang konvensional menjadi sebuah ekosistem digital yang terintegrasi. Penerapan kerangka kerja Next.js dan Node.js pada aplikasi berbasis web ini terbukti mampu mengonsolidasikan data multisumber—mulai dari pendataan peserta, unggah dokumen, penugasan dosen, hingga penyajian FAQ interaktif—ke dalam satu basis data terpusat MySQL yang dapat dikelola secara otonom oleh pihak fakultas. 

Nilai tambah yang paling signifikan dari sistem ini terletak pada implementasi algoritma Simple Additive Weighting (SAW). Proses yang sebelumnya mengandalkan perhitungan kalkulasi manual yang rentan terhadap inkonsistensi (human error), kini telah terotomatisasi secara komputasional. Pemisahan peran yang tegas antara Dosen Pembimbing (kriteria C1 dan C2) serta Dosen Penguji (kriteria C3) menjamin integritas objektivitas akademik. Mesin SAW mengambil alih kompleksitas normalisasi dan pembobotan kriteria, menghasilkan nilai akhir yang komprehensif, akurat, dan transparan bagi mahasiswa. Secara keseluruhan, sistem ini tidak hanya mempercepat siklus sirkulasi dokumen birokrasi, tetapi juga memberikan jaminan standardisasi perhitungan nilai yang akuntabel di lingkungan Fakultas Ilmu Komputer Universitas Singaperbangsa Karawang.
