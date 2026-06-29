4.1.5.3 Hasil Pengujian Fitur Mahasiswa

Tabel 4.x Hasil Pengujian Black Box Fitur Mahasiswa
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|
| 1 | Mengunggah dokumen pendaftaran magang dengan format PDF | File PDF ukuran 1MB | Sistem menyimpan file dan mengubah status menjadi "Pending" | File berhasil disimpan, status berubah menjadi "Pending" | Valid |
| 2 | Mengunggah dokumen pendaftaran dengan format yang tidak diizinkan | File JPG ukuran 1MB | Sistem menolak file dan memunculkan pesan peringatan | Sistem menolak unggahan dan menampilkan alert | Valid |
| 3 | Mengunggah dokumen dengan ukuran melebihi batas | File PDF ukuran 5MB | Sistem membatalkan proses dan memunculkan pesan galat batas ukuran | Proses dibatalkan, pesan batas ukuran maksimal 2MB muncul | Valid |
| 4 | Melihat hasil nilai akhir setelah dosen menginput nilai | Mengklik menu "Lihat Nilai Akhir" | Sistem menampilkan tabel rincian nilai komponen dan ranking SAW | Rincian skor dan ranking tampil secara akurat | Valid |

4.1.5.4 Hasil Pengujian Fitur Dosen Pembimbing

Tabel 4.x Hasil Pengujian Black Box Fitur Dosen Pembimbing
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|
| 1 | Meninjau laporan akhir mahasiswa bimbingan | Mengklik tombol "Lihat Laporan" | Sistem membuka atau mengunduh file draf laporan mahasiswa terkait | Laporan mahasiswa berhasil diakses dan dibaca | Valid |
| 2 | Menginput nilai bimbingan dengan rentang yang benar | Nilai angka 85 | Sistem menyimpan nilai ke database MySQL | Nilai tersimpan dengan sukses | Valid |
| 3 | Menginput nilai bimbingan di luar rentang batas | Nilai angka 105 | Sistem menolak penyimpanan dan menampilkan peringatan batas (0-100) | Sistem memblokir input dan menampilkan pesan galat | Valid |
| 4 | Menginput nilai bimbingan dengan huruf/karakter kosong | Teks abjad / Null | Sistem menolak penyimpanan dan meminta input angka yang valid | Sistem meminta input angka dan membatalkan proses | Valid |

4.1.5.5 Hasil Pengujian Fitur Admin

Tabel 4.x Hasil Pengujian Black Box Fitur Admin
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|
| 1 | Mengelola (Tambah/Ubah/Hapus) Data Master Dosen | Data nama dan NIDN Dosen | Sistem memodifikasi data pada tabel dosen di database | Perubahan data langsung terefleksi pada tabel sistem | Valid |
| 2 | Melakukan verifikasi penolakan dokumen mahasiswa | Memilih opsi "Ditolak" dan mengetik alasan revisi | Sistem memperbarui status mahasiswa menjadi "Ditolak" dan menyimpan catatan revisi | Status berubah dan catatan revisi tampil di dasbor mahasiswa | Valid |
| 3 | Melakukan verifikasi persetujuan dokumen mahasiswa | Memilih opsi "Disetujui" | Sistem memperbarui status menjadi "Aktif" atau siap dialokasikan pembimbing | Status berubah menjadi disetujui | Valid |
| 4 | Memetakan / Mengalokasikan Dosen Pembimbing | Memilih nama dosen dari dropdown | Sistem menyimpan ID Dosen sebagai foreign key di data mahasiswa | Mahasiswa berhasil dipetakan ke dosen pembimbing | Valid |
| 5 | Mengekspor rekapitulasi data laporan akhir | Menekan tombol "Eksport Excel/PDF" | Sistem mengunduh file rekapitulasi nilai dan data administratif | File Excel/PDF berhasil diunduh dan datanya sesuai | Valid |

4.1.5.6 Hasil Pengujian Fitur Super Admin

Tabel 4.x Hasil Pengujian Black Box Fitur Super Admin
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|
| 1 | Melihat grafik statistik pendaftaran di dasbor | Mengakses Halaman Dasbor | Sistem me-render grafik komposisi jumlah mahasiswa berdasarkan status | Grafik tampil dinamis mengikuti data real-time database | Valid |
| 2 | Memanipulasi hak akses atau akun Admin | Data kredensial baru | Sistem memperbarui entitas akun administrator di database | Akun Admin baru berhasil didaftarkan dan dapat login | Valid |

4.1.5.7 Hasil Pengujian Perhitungan SAW

Tabel 4.x Hasil Pengujian Black Box Algoritma SAW
| No | Skenario Pengujian | Input Data | Hasil yang Diharapkan | Hasil Pengujian | Kesimpulan |
|---|---|---|---|---|---|
| 1 | Mengeksekusi komputasi SAW ketika ada nilai yang masih kosong | Menekan tombol "Hitung Nilai Akhir" | Sistem menunda proses dan memunculkan peringatan "Komponen Belum Lengkap" | Proses dihentikan dan peringatan validasi muncul | Valid |
| 2 | Mengeksekusi komputasi SAW ketika semua nilai lengkap | Menekan tombol "Hitung Nilai Akhir" | Sistem mengekstrak matriks, melakukan normalisasi, menghitung preferensi, dan menyimpan skor akhir | Kalkulasi berhasil dieksekusi tanpa error backend | Valid |
| 3 | Memverifikasi keakuratan hasil komputasi SAW dengan manual | Hasil kalkulasi sistem vs kalkulasi Excel | Tidak ada selisih angka (deviasi = 0) antara mesin komputasi dan manual | Hasil perhitungan sistem dan manual persis sama | Valid |
