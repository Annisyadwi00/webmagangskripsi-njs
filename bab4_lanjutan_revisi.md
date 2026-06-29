4.1.4.2 Implementasi Basis Data

Implementasi basis data merupakan wujud fisik dari perancangan Entity Relationship Diagram (ERD) ke dalam tabel-tabel relasional pada MySQL Server. Hubungan antar-entitas, seperti data master pengguna, mahasiswa, dosen, hingga tabel transaksi pengajuan, dihubungkan secara presisi menggunakan kunci tamu (foreign key). Proses migrasi dan manipulasi skema basis data pada backend Node.js diotomatisasi menggunakan Sequelize ORM. 

Berikut adalah potongan kode implementasi pendefinisian model relasi tabel Pengguna (User.ts) menggunakan Sequelize ORM:

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type UserRole = 'Admin' | 'Super Admin' | 'Mahasiswa' | 'Dosen';

export type UserAttributes = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  nim_nidn: string;
  prodi: string | null;
  kuota_bimbingan: number | null;
  createdAt?: Date;
  updatedAt?: Date;
};

class User extends Model<UserAttributes> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: UserRole;
  declare nim_nidn: string;
  declare prodi: string | null;
  declare kuota_bimbingan: number | null;
}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Super Admin', 'Mahasiswa', 'Dosen'), allowNull: false },
    nim_nidn: { type: DataTypes.STRING, allowNull: false },
    prodi: { type: DataTypes.STRING, allowNull: true },
    kuota_bimbingan: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 5 }
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
export default User;
```

4.1.4.3 Implementasi Halaman Mahasiswa

Halaman antarmuka mahasiswa diimplementasikan menggunakan Next.js dengan desain yang responsif dan interaktif. Halaman ini berfungsi sebagai portal utama bagi mahasiswa untuk memantau progres magang mereka. Pada halaman dasbor, mahasiswa disajikan dengan visualisasi tahapan magang (progress stepper) yang mencakup pendaftaran, pemeriksaan staf, magang aktif, hingga selesai. Selain itu, mahasiswa dapat mengakses menu pengajuan magang untuk mengisi formulir pendaftaran dan mengunggah dokumen persyaratan. Implementasi pengunggahan berkas diproses oleh backend untuk memastikan validitas format dan ukuran file. Setelah magang selesai, halaman ini juga menyediakan antarmuka bagi mahasiswa untuk melihat hasil konversi nilai akhir secara transparan berdasarkan perhitungan metode SAW.

4.1.4.4 Implementasi Halaman Dosen Pembimbing

Halaman antarmuka dosen pembimbing dirancang untuk memfasilitasi proses pemantauan dan evaluasi mahasiswa bimbingan. Pada halaman dasbor, dosen disajikan ringkasan statistik jumlah mahasiswa aktif dan jadwal evaluasi. Fitur utama yang diimplementasikan pada halaman ini meliputi modul review laporan akhir dan modul penginputan nilai. Pada antarmuka review, dosen dapat mengunduh draf laporan mahasiswa, kemudian memberikan persetujuan atau catatan revisi. Pada antarmuka penilaian, sistem menyediakan formulir elektronik yang divalidasi secara otomatis agar dosen hanya dapat memasukkan nilai dalam rentang skala 0 hingga 100 untuk komponen nilai bimbingan dan nilai performa mitra.

4.1.4.5 Implementasi Halaman Admin

Halaman admin diimplementasikan sebagai pusat kendali bagi staf Tata Usaha fakultas. Implementasi fitur utama meliputi pengelolaan data master dengan fungsionalitas CRUD (Create, Read, Update, Delete). Selain itu, terdapat antarmuka verifikasi dokumen yang memungkinkan admin untuk menyetujui atau menolak berkas pendaftaran mahasiswa. Halaman ini juga memuat modul alokasi dosen yang dibangun dengan komponen dropdown dinamis, memungkinkan admin untuk memetakan mahasiswa dengan Dosen Pembimbing maupun Dosen Penguji. Pada akhir periode magang, antarmuka admin menyediakan tombol pemicu eksekusi algoritma komputasi SAW dan fitur eksportasi data rekapitulasi ke dalam format PDF atau Excel.

4.1.4.6 Implementasi Halaman Super Admin

Implementasi halaman Super Admin pada dasarnya mewarisi seluruh fungsionalitas yang ada pada halaman Admin reguler, namun dibekali dengan kapabilitas pemantauan tingkat tinggi. Pada dasbor Super Admin, sistem merender visualisasi grafik pertumbuhan data, statistik persentase kelulusan, dan ringkasan aktivitas pengguna secara keseluruhan. Super Admin memiliki hak prerogatif untuk melakukan intervensi terhadap manajemen akun user serta memelihara stabilitas aplikasi secara komprehensif.

4.1.4.7 Implementasi Perhitungan SAW pada Sistem

Implementasi algoritma Simple Additive Weighting (SAW) dibangun di sisi server (Node.js) guna menjaga keamanan logika perhitungan dari manipulasi eksternal. Eksekusi ini dirancang untuk berjalan ketika seluruh komponen nilai (bimbingan, instansi, dan sidang) telah berstatus lengkap. Berikut adalah implementasi fungsi komputasi algoritma SAW pada sistem backend Node.js (code):

```typescript
export async function hitungNilaiSAW(pengajuanId: number) {
  // 1. Ambil data nilai mentah dari database
  const pengajuan = await Pengajuan.findByPk(pengajuanId);
  const { nilai_bimbingan, nilai_mitra, nilai_sidang } = pengajuan;

  // 2. Normalisasi matriks (Kriteria Keuntungan / Benefit)
  // maxNilai adalah 100 untuk semua kriteria
  const maxNilai = 100;
  const r1 = nilai_bimbingan / maxNilai;
  const r2 = nilai_mitra / maxNilai;
  const r3 = nilai_sidang / maxNilai;

  // 3. Kalikan matriks ternormalisasi dengan vektor bobot (W)
  const w1 = 0.40; // Bobot Bimbingan 40%
  const w2 = 0.30; // Bobot Instansi/Mitra 30%
  const w3 = 0.30; // Bobot Sidang 30%

  // 4. Hitung Nilai Preferensi Akhir (V)
  const preferensi = (r1 * w1) + (r2 * w2) + (r3 * w3);
  const skorAkhir = preferensi * 100;

  // 5. Konversi Huruf Mutu
  let hurufMutu = 'E';
  if (skorAkhir >= 80) hurufMutu = 'A';
  else if (skorAkhir >= 70) hurufMutu = 'B';
  else if (skorAkhir >= 60) hurufMutu = 'C';
  else if (skorAkhir >= 50) hurufMutu = 'D';

  // 6. Simpan hasil ke database
  await pengajuan.update({
    nilai_akhir: skorAkhir,
    grade: hurufMutu,
    status: 'Selesai Dinilai'
  });

  return skorAkhir;
}
```

4.1.5 Pengujian Sistem

Tahap pengujian merupakan salah satu fase paling krusial dalam siklus hidup pengembangan perangkat lunak model Waterfall. Pengujian ini dilakukan setelah seluruh modul pemrograman pada tahap implementasi selesai dibangun. Tujuan utama dari pengujian sistem ini adalah untuk memvalidasi kelayakan operasional aplikasi, memastikan keandalan fungsionalitas fitur, serta mendeteksi kemungkinan adanya kesalahan sebelum aplikasi diserahterimakan kepada pengguna akhir.

4.1.5.1 Metode Pengujian

Metode pengujian yang diterapkan dalam penelitian ini adalah Black Box Testing (Pengujian Kotak Hitam). Pemilihan metode ini didasarkan pada kebutuhan untuk mengevaluasi perilaku eksternal perangkat lunak murni dari sudut pandang fungsionalitasnya. Pengujian dilakukan dengan memberikan serangkaian masukan tertentu pada antarmuka sistem dan memvalidasi apakah keluaran atau respons sistem telah sesuai dengan skenario yang diharapkan.

4.1.5.2 Skenario Black Box Testing

Skenario pengujian dirancang secara menyeluruh dengan mencakup seluruh unit kompetensi fungsi yang telah dirancang. Instrumen pengujian ini dipisahkan berdasarkan peran aktor operasional guna memastikan pemisahan otoritas akademik berjalan secara presisi.

4.1.5.3 Hasil Pengujian Fitur Mahasiswa

Pengujian pada fitur mahasiswa menunjukkan tingkat keberhasilan tinggi. Sistem secara presisi mampu menolak file unggahan dokumen yang melebihi batas ukuran atau format yang tidak diizinkan.

Tabel 4.x Hasil Pengujian Black Box Fitur Mahasiswa
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| 1 | Login dengan kredensial Mahasiswa | Username dan Password valid | Sistem mengarahkan ke dasbor mahasiswa | Sistem berhasil mengarahkan ke dasbor | Valid |
| 2 | Mengunggah dokumen pendaftaran format PDF | File PDF (1MB) | Dokumen tersimpan di server dan database | Dokumen berhasil diunggah | Valid |
| 3 | Mengunggah dokumen dengan format salah | File JPG (1MB) | Sistem menolak unggahan dokumen | Sistem menolak file non-PDF | Valid |
| 4 | Melihat hasil nilai akhir dan pemeringkatan | Mengklik menu "Lihat Nilai Akhir" | Sistem merender tabel dan rincian nilai SAW | Tabel hasil akhir tampil akurat | Valid |

4.1.5.4 Hasil Pengujian Fitur Dosen Pembimbing

Pengujian modul dosen pembimbing difokuskan untuk memvalidasi keandalan peninjauan dokumen laporan mahasiswa bimbingan serta penginputan nilai.

Tabel 4.x Hasil Pengujian Black Box Fitur Dosen Pembimbing
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| 1 | Meninjau laporan akhir mahasiswa | Mengklik tombol "Lihat Laporan" | Sistem menampilkan pratinjau dokumen laporan | Dokumen laporan mahasiswa berhasil dimuat | Valid |
| 2 | Menginput nilai bimbingan yang valid | Angka 85 | Sistem menyimpan nilai ke database | Nilai bimbingan berhasil disimpan | Valid |
| 3 | Menginput nilai di luar rentang valid | Angka 105 | Sistem menolak proses dan memunculkan error | Sistem memblokir nilai di atas skala 100 | Valid |

4.1.5.5 Hasil Pengujian Fitur Admin

Pengujian fungsionalitas admin mencakup validasi manajemen data master, verifikasi kelayakan berkas birokrasi, penugasan jajaran dosen, dan modul eksportasi rekap laporan cetak.

Tabel 4.x Hasil Pengujian Black Box Fitur Admin
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| 1 | Menambah entitas Dosen ke Data Master | Data profil dosen baru | Rekaman akun dosen terbentuk di MySQL | Dosen berhasil ditambahkan | Valid |
| 2 | Verifikasi persetujuan berkas pendaftaran | Mengklik opsi "Disetujui" | Status mahasiswa berubah menjadi "Aktif" | Status berhasil diubah | Valid |
| 3 | Verifikasi penolakan berkas pendaftaran | Mengklik "Ditolak" dan input revisi | Sistem merekam alasan penolakan berkas | Pesan revisi tersimpan dan dikirimkan | Valid |
| 4 | Pemetaan alokasi Dosen Pembimbing | Memilih opsi nama dosen pembimbing | Tabel database menyimpan foreign key Dosen | Alokasi pembimbing berhasil disimpan | Valid |
| 5 | Mengekspor rekapitulasi laporan magang | Menekan tombol "Cetak Excel" | Perangkat mengunduh file Excel laporan | File berhasil dibuat dan diunduh | Valid |

4.1.5.6 Hasil Pengujian Fitur Super Admin

Pengujian portal Super Admin berfokus pada validasi visualisasi tingkat tinggi serta keandalan fungsi manajemen otorisasi hak akses user admin.

Tabel 4.x Hasil Pengujian Black Box Fitur Super Admin
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| 1 | Merender grafik statistik pendaftar | Membuka dasbor Super Admin | Sistem menampilkan grafik komposisi pendaftar | Grafik termuat secara dinamis | Valid |
| 2 | Menghapus paksa akun pengguna bermasalah | Klik "Hapus" pada tabel Master User | Akun terhapus secara permanen dari database | Data akun berhasil dieliminasi | Valid |

4.1.5.7 Hasil Pengujian Perhitungan SAW

Pengujian ini bertujuan memvalidasi keandalan dan akurasi integrasi fungsi hitung SAW pada sisi server dalam memproses konversi multi-sumber nilai menjadi skor preferensi akhir.

Tabel 4.x Hasil Pengujian Black Box Algoritma SAW
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Status |
|---|---|---|---|---|---|
| 1 | Eksekusi komputasi dengan nilai tidak lengkap | Meminta kalkulasi dengan satu nilai kosong | Sistem menolak komputasi (pesan error) | Sistem memblokir proses kalkulasi | Valid |
| 2 | Eksekusi komputasi dengan nilai lengkap | Menekan tombol "Hitung Nilai Akhir" | Sistem menghitung dan menyimpan skor SAW | Skor preferensi dan grade tersimpan | Valid |
| 3 | Validasi akurasi perhitungan matematis sistem | Data nilai mentah mahasiswa (A1, A2, A3) | Hasil komputasi sistem sama dengan MS Excel | Tidak ada selisih perhitungan (Deviasi 0%) | Valid |

4.1.5.8 Kesimpulan Hasil Pengujian

Secara keseluruhan, rangkaian Black Box Testing mengonfirmasi bahwa Sistem Informasi Magang Mahasiswa ini beroperasi secara optimal dan stabil. Seluruh spesifikasi kebutuhan fungsional dan non-fungsional telah terpenuhi, mulai dari pengamanan peran otorisasi, interaksi database yang konsisten, hingga presisi perhitungan nilai akhir SAW. 

4.1.6 Pemeliharaan Sistem 

Tahap pemeliharaan merupakan fase krusial pasca-pengujian untuk menjamin keberlanjutan masa pakai, stabilitas, dan keandalan sistem dalam jangka panjang.

4.1.6.1 Identifikasi Perbaikan Sistem

Berdasarkan hasil pengujian fungsionalitas menggunakan Black Box Testing, tidak ditemukan kesalahan kritis pada logika bisnis utama aplikasi. Namun, identifikasi perbaikan difokuskan pada optimalisasi penanganan berkas digital untuk membatasi jenis ekstensi yang diunggah mahasiswa guna meminimalkan celah keamanan server, serta perbaikan pesan kesalahan agar lebih komunikatif bagi pengguna awam. Evaluasi juga menyoroti perlunya penyesuaian tata letak antarmuka agar elemen visual dasbor lebih ramah diakses melalui layar ponsel genggam.

4.1.6.2 Rencana Pemeliharaan Sistem

Rencana pemeliharaan perangkat lunak Sistem Informasi Magang Mahasiswa di lingkungan Fakultas Ilmu Komputer Universitas Singaperbangsa Karawang disusun ke dalam tiga strategi utama:
1. Pemeliharaan Korektif: Melakukan pemantauan server log secara berkala untuk mendeteksi dan memperbaiki bug minor yang muncul akibat pembaruan dependensi atau peramban web (browser).
2. Pemeliharaan Adaptif: Melakukan pembaharuan (update) versi pustaka pada framework Next.js dan Node.js secara periodik guna menyesuaikan dengan standar keamanan platform web terbaru.
3. Pemeliharaan Perfektif: Melakukan optimalisasi indeks kueri basis data MySQL secara berkala seiring bertambahnya volume data master mahasiswa dan riwayat rekapitulasi nilai akademik dari tahun ke tahun.

4.2 Pembahasan

Bagian pembahasan menguraikan analisis komparatif dan sintesis ilmiah dari seluruh hasil perancangan, implementasi, dan pengujian sistem informasi yang telah direalisasikan. Penerapan metode pengembangan Waterfall terbukti memberikan alur kerja yang terstruktur dan terdokumentasi dengan baik, di mana setiap fase berhasil memenuhi spesifikasi kebutuhan fungsional yang ditranslasikan menjadi 14 unit use case operasional. 

Inti keunggulan dari aplikasi yang dibangun ini terletak pada keberhasilan integrasi metode Simple Additive Weighting (SAW) sebagai instrumen Sistem Pendukung Keputusan otomasi penilaian. Berdasarkan hasil pengujian validasi, mesin komputasi berbasis Node.js mampu menghasilkan skor preferensi akhir dan huruf mutu secara akurat dengan tingkat deviasi 0% dibandingkan dengan perhitungan manual spreadsheet. Keberadaan otomasi ini secara langsung menyelesaikan akar permasalahan pada sistem berjalan yang fragmentatif dan konvensional, meminimalkan risiko human error, serta mempercepat birokrasi rekapitulasi nilai multi-aktor dari beberapa minggu menjadi hitungan detik. 

Dari aspek non-fungsional, arsitektur frontend Next.js yang dipadukan dengan Tailwind CSS berhasil menyajikan tampilan antarmuka yang responsif dan adaptif. Penambahan fitur dark mode toggle langsung pada bagian navigation bar memberikan kenyamanan visual ekstra bagi pengguna tanpa merusak konsistensi estetika struktur tata letak orisinal aplikasi. Terakhir, pengujian fungsional murni melalui Black Box Testing mengonfirmasi bahwa seluruh fitur utama—mulai dari gerbang autentikasi, pengajuan berkas digital, plotting alokasi jajaran dosen, hingga modul eksportasi dokumen fisik biner—telah berjalan stabil, valid, dan memenuhi standar kualitas akademik Fakultas Ilmu Komputer Universitas Singaperbangsa Karawang.
