// app/dosen/penguji/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  getPengajuanList,
  beriNilaiPenguji, // fungsi API baru (harus dibuat)
} from '@/lib/pengajuan-client';

// ------------------------------------------------------------
// KOMPONEN PENILAIAN DOSEN PENGAJI (sama dengan DOSEN_ITEMS)
// Bisa diubah sesuai kebutuhan
// ------------------------------------------------------------
const EXAMINER_ITEMS = [
  { id: 'kedisiplinan_bimbingan', label: 'Kedisiplinan bimbingan' },
  { id: 'relevansi_bidang', label: 'Relevansi bidang keahlian' },
  { id: 'penjelasan_isi', label: 'Penjelasan isi laporan' },
  { id: 'analisis', label: 'Analisis dalam laporan' },
  { id: 'kelengkapan_isi', label: 'Kelengkapan isi laporan' },
  { id: 'aspek_kebahasaan', label: 'Aspek kebahasaan' },
  { id: 'arahan_pembimbing', label: 'Kemampuan melaksanakan arahan pembimbing' },
];

// ------------------------------------------------------------
// FUNGSI BANTUAN (sama seperti di penilaian)
// ------------------------------------------------------------
function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function getLaporanLabel(jenisMagang?: string | null) {
  if (jenisMagang === 'Konversi 2 SKS') return 'Laporan Magang';
  if (jenisMagang === 'Tidak Konversi') return 'Tidak Wajib';
  return 'Laporan Akhir';
}

function wajibLaporan(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS' || jenisMagang === 'Konversi 2 SKS';
}

function wajibOutput(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS';
}

function sudahLengkapDokumen(item: Pengajuan) {
  if (!wajibLaporan(item.jenis_magang)) return true;
  if (!item.link_laporan_akhir) return false;
  if (wajibOutput(item.jenis_magang) && !item.link_output_magang) return false;
  return true;
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Selesai') return 'app-badge app-badge-green';
  if (status === 'Aktif') return 'app-badge app-badge-blue';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
  return 'app-badge app-badge-yellow';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';
  return status || '-';
}

// ------------------------------------------------------------
// KOMPONEN UTAMA
// ------------------------------------------------------------
export default function DosenPengujiPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [search, setSearch] = useState('');

  // State modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);

  // State form nilai penguji
  const [nilaiPenguji, setNilaiPenguji] = useState<Record<string, string>>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ------------------------------------------------------------
  // FETCH DATA
  // ------------------------------------------------------------
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
      ]);

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setPengajuans(pengajuanData?.items || []);
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal mengambil data.';
      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------------------------
  // FILTER
  // ------------------------------------------------------------
  const mahasiswaAktif = pengajuans.filter(
    (item) => item.status === 'Aktif' || item.status === 'Selesai'
  );

  const mahasiswaSiapUji = mahasiswaAktif.filter((item) =>
    sudahLengkapDokumen(item)
  );

  const mahasiswaSudahDinilaiPenguji = pengajuans.filter(
    (item) => item.nilai_penguji_grade // asumsikan ada field ini
  );

  const filteredMahasiswaSiapUji = useMemo(() => {
    const keyword = search.toLowerCase();
    return mahasiswaSiapUji.filter((item) => {
      const nama = item.nama_mahasiswa || '';
      const npm = item.npm || '';
      const perusahaan = item.perusahaan || '';
      const posisi = item.posisi || '';
      const prodi = item.program_studi || '';
      const jenisMagang = getJenisMagangLabel(item.jenis_magang);
      return (
        nama.toLowerCase().includes(keyword) ||
        npm.toLowerCase().includes(keyword) ||
        perusahaan.toLowerCase().includes(keyword) ||
        posisi.toLowerCase().includes(keyword) ||
        prodi.toLowerCase().includes(keyword) ||
        jenisMagang.toLowerCase().includes(keyword)
      );
    });
  }, [mahasiswaSiapUji, search]);

  // ------------------------------------------------------------
  // HANDLER MODAL
  // ------------------------------------------------------------
  const openNilaiModal = (item: Pengajuan) => {
    if (!sudahLengkapDokumen(item)) {
      setErrorMsg(
        item.jenis_magang === 'Konversi 20 SKS'
          ? 'Mahasiswa belum melengkapi laporan akhir dan output magang, sehingga belum dapat dinilai.'
          : 'Mahasiswa belum mengunggah laporan magang, sehingga belum dapat dinilai.'
      );
      return;
    }

    setSelectedPengajuan(item);
    setMessage('');
    setErrorMsg('');

    // Inisialisasi form kosong
    const initial: Record<string, string> = {};
    EXAMINER_ITEMS.forEach((it) => { initial[it.id] = ''; });
    setNilaiPenguji(initial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPengajuan(null);
  };

  // ------------------------------------------------------------
  // HANDLER SUBMIT
  // ------------------------------------------------------------
  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua nilai terisi
    const allFilled = EXAMINER_ITEMS.every((item) => {
      const val = parseFloat(nilaiPenguji[item.id]);
      return !isNaN(val) && val >= 0 && val <= 100;
    });

    if (!allFilled) {
      setErrorMsg('Semua komponen nilai wajib diisi dengan angka 0–100.');
      return;
    }

    // Hitung rata-rata nilai penguji
    const values = EXAMINER_ITEMS.map((item) => parseFloat(nilaiPenguji[item.id]))
      .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
    const nilaiRata = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    // Konversi ke grade (opsional, bisa disimpan angka saja)
    const grade = (num: number): string => {
      if (num >= 85) return 'A';
      if (num >= 75) return 'B';
      if (num >= 65) return 'C';
      if (num >= 50) return 'D';
      return 'E';
    };

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const payload = {
        id_pengajuan: selectedPengajuan!.id,
        nilai_penguji_total: nilaiRata,
        nilai_penguji_grade: grade(nilaiRata),
        nilai_penguji_detail: nilaiPenguji,
      };

      // Panggil API yang sesuai (harus dibuat di server)
      const result = await beriNilaiPenguji(payload);
      setMessage(result.message || 'Nilai penguji berhasil disimpan.');
      closeModal();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menyimpan nilai penguji.';
      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg && !showModal) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Penilaian Penguji"
          title={`Input Nilai Ujian ${user?.name || ''}`}
          description="Isi penilaian dari dosen penguji untuk mahasiswa yang akan diuji."
          action={
            <Link href="/dosen/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Siap Diuji"
            value={mahasiswaSiapUji.length}
            description="Mahasiswa dengan dokumen lengkap."
            icon="chart"
          />
          <StatCard
            title="Sudah Dinilai"
            value={mahasiswaSudahDinilaiPenguji.length}
            description="Mahasiswa yang sudah mendapat nilai penguji."
            icon="check"
          />
          <StatCard
            title="Selesai"
            value={pengajuans.filter((item) => item.status === 'Selesai').length}
            description="Mahasiswa dengan status magang selesai."
            icon="document"
          />
        </section>

        <section className="app-card p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Daftar Mahasiswa Siap Diuji
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Mahasiswa akan muncul jika dokumen wajibnya sudah lengkap.
              </p>
            </div>
            <div className="w-full md:w-80">
              <label className="app-label">Cari Mahasiswa</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari nama, NPM, prodi, perusahaan..."
              />
            </div>
          </div>

          {filteredMahasiswaSiapUji.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada mahasiswa yang siap diuji.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Mahasiswa akan muncul setelah dokumen wajib lengkap.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-black">Mahasiswa</th>
                    <th className="px-5 py-4 font-black">Tempat Magang</th>
                    <th className="px-5 py-4 font-black">Jenis</th>
                    <th className="px-5 py-4 font-black">Status</th>
                    <th className="px-5 py-4 font-black">Nilai Penguji</th>
                    <th className="px-5 py-4 font-black">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMahasiswaSiapUji.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {item.npm || '-'} • {item.program_studi || '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        <p className="font-bold">{item.perusahaan}</p>
                        <p className="mt-1 text-xs">{item.posisi || 'Peserta Magang'}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        {getJenisMagangLabel(item.jenis_magang)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={getStatusBadgeClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-slate-950 dark:text-white">
                        {item.nilai_penguji_grade || '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-2">
                          {item.link_laporan_akhir && (
                            <a
                              href={item.link_laporan_akhir}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="app-btn-secondary px-3 py-2 text-xs"
                            >
                              Buka {getLaporanLabel(item.jenis_magang)}
                            </a>
                          )}
                          {item.link_output_magang && (
                            <a
                              href={item.link_output_magang}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="app-btn-secondary px-3 py-2 text-xs"
                            >
                              Buka Output
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => openNilaiModal(item)}
                            className="app-btn-primary px-3 py-2 text-xs"
                          >
                            {item.nilai_penguji_grade ? 'Ubah Nilai' : 'Input Nilai'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* ===== MODAL PENILAIAN PENGAJI ===== */}
      {showModal && selectedPengajuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                Penilaian Dosen Penguji
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedPengajuan.nama_mahasiswa} • {selectedPengajuan.perusahaan}
              </p>
            </div>

            <form onSubmit={handleSubmitNilai} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {EXAMINER_ITEMS.map((item) => (
                  <div key={item.id}>
                    <label className="app-label">{item.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nilaiPenguji[item.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNilaiPenguji((prev) => ({ ...prev, [item.id]: val }));
                      }}
                      className="app-input"
                      placeholder="0–100"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Rata-rata Nilai Penguji
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {(() => {
                    const values = EXAMINER_ITEMS.map((item) => parseFloat(nilaiPenguji[item.id]))
                      .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
                    return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0.00';
                  })()}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai Penguji'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="app-btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}