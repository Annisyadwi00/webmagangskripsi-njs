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
  beriNilaiPengajuan,
  getPengajuanList,
} from '@/lib/pengajuan-client';
import { getIndikatorList } from '@/lib/indikator-client';

// ------------------------------------------------------------
// DATA STATIS UNTUK FORM PENILAIAN
// ------------------------------------------------------------

// 15 komponen penilaian dari mitra (dengan bobot masing-masing)
const MITRA_ITEMS = [
  { id: 'disiplin', label: 'Ketepatan waktu / disiplin', bobot: 5 },
  { id: 'sikap_kerja', label: 'Sikap kerja / prosedur kerja', bobot: 5 },
  { id: 'tanggungjawab', label: 'Tanggungjawab terhadap tugas', bobot: 5 },
  { id: 'kehadiran', label: 'Kehadiran', bobot: 5 },
  { id: 'patuh_aturan', label: 'Mematuhi aturan dan tata tertib magang', bobot: 5 },
  { id: 'penampilan', label: 'Penampilan / kerapian', bobot: 5 },
  { id: 'kemampuan_kerja', label: 'Kemampuan kerja', bobot: 5 },
  { id: 'keterampilan_kerja', label: 'Keterampilan kerja', bobot: 5 },
  { id: 'kualitas_hasil', label: 'Kualitas hasil kerja', bobot: 5 },
  { id: 'komunikasi', label: 'Kemampuan berkomunikasi', bobot: 5 },
  { id: 'kerjasama', label: 'Kerjasama', bobot: 5 },
  { id: 'kerajinan', label: 'Kerajinan / inisiatif', bobot: 5 },
  { id: 'percaya_diri', label: 'Memiliki rasa percaya diri', bobot: 5 },
  { id: 'relevansi', label: 'Relevansi', bobot: 10 },
  { id: 'isi_laporan', label: 'Isi laporan', bobot: 25 },
];

// 7 komponen penilaian dari dosen pembimbing (masing-masing 0–100, di-rata-rata)
const DOSEN_ITEMS = [
  { id: 'kedisiplinan_bimbingan', label: 'Kedisiplinan bimbingan' },
  { id: 'relevansi_bidang', label: 'Relevansi bidang keahlian' },
  { id: 'penjelasan_isi', label: 'Penjelasan isi laporan' },
  { id: 'analisis', label: 'Analisis dalam laporan' },
  { id: 'kelengkapan_isi', label: 'Kelengkapan isi laporan' },
  { id: 'aspek_kebahasaan', label: 'Aspek kebahasaan' },
  { id: 'arahan_pembimbing', label: 'Kemampuan melaksanakan arahan pembimbing' },
];

// ------------------------------------------------------------
// FUNGSI BANTUAN
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

function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ------------------------------------------------------------
// FUNGSI PERHITUNGAN NILAI
// ------------------------------------------------------------

function hitungNilaiMitra(nilai: Record<string, string>, items: Array<{ id: string; bobot: number }> = MITRA_ITEMS): number {
  let total = 0;
  items.forEach((item) => {
    const val = parseFloat(nilai[item.id]);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      total += val * (item.bobot / 100);
    }
  });
  return total;
}

function hitungNilaiDosen(nilai: Record<string, string>, items: Array<{ id: string }> = DOSEN_ITEMS): number {
  const values = items.map((item) => parseFloat(nilai[item.id]))
    .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function getGradeFromNumber(num: number): string {
  if (num >= 85) return 'A';
  if (num >= 75) return 'B';
  if (num >= 65) return 'C';
  if (num >= 50) return 'D';
  return 'E';
}

// ------------------------------------------------------------
// KOMPONEN UTAMA
// ------------------------------------------------------------

export default function DosenPenilaianPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [search, setSearch] = useState('');
  const [tahunFilter, setTahunFilter] = useState('Semua');

  // State untuk modal
  const [showModalMitra, setShowModalMitra] = useState(false);
  const [showModalDosen, setShowModalDosen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);

  // State form nilai
  const [nilaiMitra, setNilaiMitra] = useState<Record<string, string>>({});
  const [nilaiDosen, setNilaiDosen] = useState<Record<string, string>>({});
  const [mitraItems, setMitraItems] = useState<Array<{ id: string; label: string; bobot: number }>>(MITRA_ITEMS);
  const [dosenItems, setDosenItems] = useState<Array<{ id: string; label: string }>>(DOSEN_ITEMS);

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

      const [currentUser, pengajuanData, indDospem, indMitra] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
        getIndikatorList('dospem', true).catch(() => []),
        getIndikatorList('mitra', true).catch(() => []),
      ]);

      if (indDospem && indDospem.length > 0) {
        setDosenItems(indDospem.map(i => ({ id: i.kode, label: i.label })));
      }
      if (indMitra && indMitra.length > 0) {
        setMitraItems(indMitra.map(i => ({ id: i.kode, label: i.label, bobot: i.bobot })));
      }

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setPengajuans(pengajuanData?.items || []);
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal mengambil data penilaian.';
      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ------------------------------------------------------------
  // FILTER / STATISTIK
  // ------------------------------------------------------------

  const uniqueTahunAkademik = Array.from(
    new Set(pengajuans.map((p) => p.tahun_akademik).filter((t): t is string => Boolean(t)))
  ).sort().reverse();

  const filteredPengajuans = pengajuans.filter((item) => {
    return tahunFilter === 'Semua' || item.tahun_akademik === tahunFilter;
  });

  const mahasiswaAktif = filteredPengajuans.filter(
    (item) => item.dosenId === user?.id && (item.status === 'Aktif' || item.status === 'Selesai')
  );

  const mahasiswaSiapDinilai = mahasiswaAktif.filter((item) =>
    sudahLengkapDokumen(item)
  );

  const mahasiswaDokumenBelumLengkap = mahasiswaAktif.filter(
    (item) => !sudahLengkapDokumen(item)
  );

  const mahasiswaSelesai = filteredPengajuans.filter(
    (item) => item.dosenId === user?.id && item.status === 'Selesai'
  );

  const mahasiswaSudahDinilai = filteredPengajuans.filter(
    (item) => item.dosenId === user?.id && ((item.status as string) === 'Selesai Dinilai' || !!item.nilai_dari_dosen)
  );

  const filteredMahasiswaSiapDinilai = useMemo(() => {
    const keyword = search.toLowerCase();
    return mahasiswaSiapDinilai.filter((item) => {
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
  }, [mahasiswaSiapDinilai, search]);

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
    const initialMitra: Record<string, string> = {};
    mitraItems.forEach((it) => { initialMitra[it.id] = ''; });
    const initialDosen: Record<string, string> = {};
    dosenItems.forEach((it) => { initialDosen[it.id] = ''; });

    // Jika ada nilai sebelumnya (misal dari edit), bisa diisi di sini
    // (opsional, bisa dikembangkan)

    setNilaiMitra(initialMitra);
    setNilaiDosen(initialDosen);
    setShowModalMitra(true);
    setShowModalDosen(false);
  };

  const closeAllModals = () => {
    setShowModalMitra(false);
    setShowModalDosen(false);
    setSelectedPengajuan(null);
  };

  // ------------------------------------------------------------
  // HANDLER PERPINDAHAN MODAL
  // ------------------------------------------------------------

  const handleNextToDosen = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua nilai mitra terisi (0–100)
    const allFilled = mitraItems.every((item) => {
      const val = parseFloat(nilaiMitra[item.id]);
      return !isNaN(val) && val >= 0 && val <= 100;
    });

    if (!allFilled) {
      setErrorMsg('Semua komponen nilai mitra wajib diisi dengan angka 0–100.');
      return;
    }

    setShowModalMitra(false);
    setShowModalDosen(true);
    setErrorMsg('');
  };

  const handleBackToMitra = () => {
    setShowModalDosen(false);
    setShowModalMitra(true);
    setErrorMsg('');
  };

  // ------------------------------------------------------------
  // HANDLER SUBMIT NILAI AKHIR
  // ------------------------------------------------------------

  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua nilai dosen terisi
    const allFilled = dosenItems.every((item) => {
      const val = parseFloat(nilaiDosen[item.id]);
      return !isNaN(val) && val >= 0 && val <= 100;
    });

    if (!allFilled) {
      setErrorMsg('Semua komponen nilai dosen wajib diisi dengan angka 0–100.');
      return;
    }

    const nilaiMitraTotal = hitungNilaiMitra(nilaiMitra, mitraItems);
    const nilaiDosenTotal = hitungNilaiDosen(nilaiDosen, dosenItems);
    const nilaiAkhir = (nilaiMitraTotal + nilaiDosenTotal) / 2;
    const grade = getGradeFromNumber(nilaiAkhir);

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const payload = {
        id_pengajuan: selectedPengajuan!.id,
        nilai_mitra_total: nilaiMitraTotal,
        nilai_dosen_total: nilaiDosenTotal,
        nilai_akhir_angka: nilaiAkhir,
        nilai_akhir_grade: grade,
        nilai_mitra_detail: nilaiMitra,
        nilai_dosen_detail: nilaiDosen,
      };

      const result = await beriNilaiPengajuan(payload);
      setMessage(result.message || 'Nilai akhir berhasil disimpan.');
      closeAllModals();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menyimpan nilai akhir.';
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

  if (errorMsg && !showModalMitra && !showModalDosen) {
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
          eyebrow="Penilaian Akhir"
          title={`Input Nilai Mahasiswa ${user?.name || ''}`}
          description="Isi nilai dari mitra dan dosen pembimbing secara terpisah. Sistem akan menghitung nilai akhir secara otomatis."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dosen/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
              <Link href="/dosen/laporan-akhir" className="app-btn-primary">
                Lihat Laporan
              </Link>
            </div>
          }
        />

        {mahasiswaDokumenBelumLengkap.length > 0 && (
          <Alert variant="warning">
            Ada {mahasiswaDokumenBelumLengkap.length} mahasiswa aktif yang
            dokumen magangnya belum lengkap. Penilaian hanya dapat dilakukan
            setelah dokumen wajib terpenuhi.
          </Alert>
        )}

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Siap Dinilai"
            value={mahasiswaSiapDinilai.length}
            description="Mahasiswa aktif/selesai dengan dokumen lengkap."
            icon="chart"
          />
          <StatCard
            title="Sudah Dinilai"
            value={mahasiswaSudahDinilai.length}
            description="Mahasiswa yang sudah memiliki nilai akhir."
            icon="check"
          />
          <StatCard
            title="Selesai"
            value={mahasiswaSelesai.length}
            description="Mahasiswa dengan status magang selesai."
            icon="document"
          />
        </section>

        <section className="app-card p-6">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Daftar Mahasiswa Siap Dinilai
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Mahasiswa akan muncul jika dokumen wajibnya sudah lengkap.
              </p>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-64">
                <label className="app-label">Cari Mahasiswa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, NPM, prodi, perusahaan..."
                />
              </div>
              <div className="w-full md:w-48">
                <label className="app-label">Tahun Akademik</label>
                <select
                  value={tahunFilter}
                  onChange={(e) => setTahunFilter(e.target.value)}
                  className="app-input"
                >
                  <option value="Semua">Semua Tahun</option>
                  {uniqueTahunAkademik.map((thn) => (
                    <option key={thn} value={thn}>{thn}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {filteredMahasiswaSiapDinilai.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada mahasiswa yang siap dinilai.
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
                    <th className="px-5 py-4 font-black">Nilai</th>
                    <th className="px-5 py-4 font-black">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMahasiswaSiapDinilai.map((item) => (
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
                        {item.nilai_akhir_grade || '-'}
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
                            {item.nilai_akhir_grade ? 'Ubah Nilai' : 'Input Nilai'}
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

        {mahasiswaDokumenBelumLengkap.length > 0 && (
          <section className="app-card mt-6 p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Dokumen Belum Lengkap
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Mahasiswa di bawah ini belum dapat dinilai karena dokumen wajib belum lengkap.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {mahasiswaDokumenBelumLengkap.map((item) => (
                <article key={item.id} className="app-panel p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black text-slate-950 dark:text-white">
                        {item.nama_mahasiswa}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {getJenisMagangLabel(item.jenis_magang)} • {item.perusahaan}
                      </p>
                    </div>
                    <span className="app-badge app-badge-yellow">Belum Lengkap</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {!item.link_laporan_akhir &&
                      wajibLaporan(item.jenis_magang) &&
                      `${getLaporanLabel(item.jenis_magang)} belum diunggah. `}
                    {wajibOutput(item.jenis_magang) &&
                      !item.link_output_magang &&
                      'Output magang belum diunggah.'}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ===== MODAL 1 : PENILAIAN MITRA ===== */}
      {showModalMitra && selectedPengajuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeAllModals}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Tahap 1 dari 2
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Penilaian dari Mitra
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedPengajuan.nama_mahasiswa} • {selectedPengajuan.perusahaan}
              </p>
            </div>
            
            <div className="mb-4">
              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
            </div>

            <form onSubmit={handleNextToDosen} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {mitraItems.map((item) => (
                  <div key={item.id}>
                    <label className="app-label flex items-center justify-between">
                      <span>{item.label}</span>
                      <span className="text-xs font-normal text-slate-400">
                        Bobot {item.bobot}%
                      </span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nilaiMitra[item.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNilaiMitra((prev) => ({ ...prev, [item.id]: val }));
                      }}
                      className="app-input"
                      placeholder="0–100"
                    />
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Total Nilai Mitra Sementara
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {hitungNilaiMitra(nilaiMitra, mitraItems).toFixed(2)}
                </p>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                <button
                  type="submit"
                  className="app-btn-primary flex-1"
                >
                  Selanjutnya → Isi Nilai Dosen
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="app-btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL 2 : PENILAIAN DOSEN ===== */}
      {showModalDosen && selectedPengajuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeAllModals}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Tahap 2 dari 2
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Penilaian Dosen Pembimbing
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedPengajuan.nama_mahasiswa} • {selectedPengajuan.perusahaan}
              </p>
            </div>

            <div className="mb-4">
              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
            </div>

            <form onSubmit={handleSubmitNilai} className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {dosenItems.map((item) => (
                  <div key={item.id}>
                    <label className="app-label">{item.label}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={nilaiDosen[item.id] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNilaiDosen((prev) => ({ ...prev, [item.id]: val }));
                      }}
                      className="app-input"
                      placeholder="0–100"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70 md:grid-cols-3">
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Nilai Mitra
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                    {hitungNilaiMitra(nilaiMitra, mitraItems).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Nilai Dosen
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                    {hitungNilaiDosen(nilaiDosen, dosenItems).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Nilai Akhir (Rata-rata)
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                    {((hitungNilaiMitra(nilaiMitra, mitraItems) + hitungNilaiDosen(nilaiDosen, dosenItems)) / 2).toFixed(2)}
                    {' '}
                    <span className="text-lg font-bold text-[#1e3a8a] dark:text-blue-300">
                      {getGradeFromNumber((hitungNilaiMitra(nilaiMitra, mitraItems) + hitungNilaiDosen(nilaiDosen, dosenItems)) / 2)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai Akhir'}
                </button>
                <button
                  type="button"
                  onClick={handleBackToMitra}
                  disabled={isSubmitting}
                  className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ← Kembali ke Nilai Mitra
                </button>
                <button
                  type="button"
                  onClick={closeAllModals}
                  disabled={isSubmitting}
                  className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
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