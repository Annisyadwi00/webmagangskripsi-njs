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
  beriNilaiPenguji,
} from '@/lib/pengajuan-client';
import { getIndikatorList } from '@/lib/indikator-client';
import {
  getSidangCurriculum,
  getAllSidangItems,
  getSidangPredicate,
  detectProdiAndSemester,
} from '@/lib/sidang-curriculum';

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
  const [modalProdi, setModalProdi] = useState<'Informatika' | 'Sistem Informasi'>('Informatika');
  const [modalSemester, setModalSemester] = useState<'5' | '6' | '7'>('5');

  const activeCurriculum = useMemo(
    () => getSidangCurriculum(modalProdi, modalSemester),
    [modalProdi, modalSemester]
  );
  const activeItems = useMemo(() => getAllSidangItems(activeCurriculum), [activeCurriculum]);

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
        getIndikatorList('penguji', true).catch(() => []), // Trigger sync database indikator cpl
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
    (item) => item.dosenPengujiId === user?.id && (item.status === 'Aktif' || item.status === 'Selesai')
  );

  const mahasiswaSiapUji = mahasiswaAktif.filter((item) =>
    sudahLengkapDokumen(item)
  );

  const mahasiswaSudahDinilaiPenguji = pengajuans.filter(
    (item) => item.dosenPengujiId === user?.id && ((item.status as string) === 'Selesai Dinilai' || !!(item as any).nilai_sidang)
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

    const { prodi, semester } = detectProdiAndSemester(item.program_studi, item.semester);
    setModalProdi(prodi);
    setModalSemester(semester);
    const curr = getSidangCurriculum(prodi, semester);
    const items = getAllSidangItems(curr);

    // Inisialisasi form kosong / load dari detail sebelumnya
    const initial: Record<string, string> = {};
    items.forEach((it) => {
      const prevVal = item.nilai_penguji_detail ? item.nilai_penguji_detail[it.id] : undefined;
      initial[it.id] = prevVal !== undefined && prevVal !== null ? String(prevVal) : '';
    });
    setNilaiPenguji(initial);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPengajuan(null);
  };

  const handleCurriculumChange = (newProdi: 'Informatika' | 'Sistem Informasi', newSem: '5' | '6' | '7') => {
    setModalProdi(newProdi);
    setModalSemester(newSem);
    const curr = getSidangCurriculum(newProdi, newSem);
    const items = getAllSidangItems(curr);
    setNilaiPenguji((prev) => {
      const updated: Record<string, string> = { ...prev };
      items.forEach((it) => {
        if (updated[it.id] === undefined) updated[it.id] = '';
      });
      return updated;
    });
  };

  const handleQuickFill = (val: string) => {
    setNilaiPenguji((prev) => {
      const updated: Record<string, string> = { ...prev };
      activeItems.forEach((it) => {
        updated[it.id] = val;
      });
      return updated;
    });
  };

  // ------------------------------------------------------------
  // HANDLER SUBMIT
  // ------------------------------------------------------------
  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi semua nilai terisi
    const allFilled = activeItems.every((item) => {
      const val = parseFloat(nilaiPenguji[item.id]);
      return !isNaN(val) && val >= 0 && val <= 100;
    });

    if (!allFilled) {
      setErrorMsg(`Semua komponen nilai (${activeItems.length} indikator ${activeCurriculum.prodi} Semester ${activeCurriculum.semester}) wajib diisi dengan angka 0–100.`);
      return;
    }

    // Hitung rata-rata nilai penguji
    const values = activeItems.map((item) => parseFloat(nilaiPenguji[item.id]))
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
        nilai_penguji_detail: {
          ...nilaiPenguji,
          _prodi: activeCurriculum.prodi,
          _semester: activeCurriculum.semester,
        },
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
                        {item.nilai_penguji_total !== null && item.nilai_penguji_total !== undefined
                          ? `${Number(item.nilai_penguji_total).toFixed(2)} (${item.nilai_penguji_grade || ''})`
                          : item.nilai_penguji_grade || '-'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 md:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="app-badge app-badge-blue mb-2 inline-block">
                  Sidang & Evaluasi Akhir
                </span>
                <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                  Penilaian Dosen Penguji
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {selectedPengajuan.nama_mahasiswa} ({selectedPengajuan.npm || '-'}) • {selectedPengajuan.perusahaan}
                </p>
              </div>

              {/* Selector Kurikulum Prodi & Semester */}
              <div className="flex flex-col gap-2 rounded-2xl bg-slate-50 p-3 dark:bg-slate-800/80">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-2">Kurikulum:</span>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('Informatika', modalSemester)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      modalProdi === 'Informatika'
                        ? 'bg-[#1e3a8a] text-white shadow dark:bg-blue-600'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    S1 Informatika
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange('Sistem Informasi', modalSemester)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      modalProdi === 'Sistem Informasi'
                        ? 'bg-[#1e3a8a] text-white shadow dark:bg-blue-600'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    S1 Sistem Informasi
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400 mr-2">Semester:</span>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange(modalProdi, '5')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      modalSemester === '5'
                        ? 'bg-[#1e3a8a] text-white shadow dark:bg-blue-600'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semester 5
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange(modalProdi, '6')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      modalSemester === '6'
                        ? 'bg-[#1e3a8a] text-white shadow dark:bg-blue-600'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semester 6
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurriculumChange(modalProdi, '7')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                      modalSemester === '7'
                        ? 'bg-[#1e3a8a] text-white shadow dark:bg-blue-600'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    Semester 7
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Fill / Bantu Isi */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
              <span className="text-xs font-bold text-[#1e3a8a] dark:text-blue-300">
                ⚡ Bantu Isi Cepat ({activeItems.length} Indikator):
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('90')}
                  className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                >
                  Sangat Baik (90)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('75')}
                  className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-extrabold text-blue-800 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                >
                  Baik (75)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('55')}
                  className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
                >
                  Cukup (55)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('')}
                  className="rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-extrabold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Reset
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mt-4">
                <Alert variant="error">{errorMsg}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmitNilai} className="mt-6 space-y-6">
              {activeCurriculum.groups.map((group, gIdx) => (
                <div
                  key={gIdx}
                  className="space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5 dark:border-slate-700">
                    <h3 className="font-extrabold text-[#1e3a8a] dark:text-blue-400">
                      {group.category}
                    </h3>
                    <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {group.items.length} Indikator
                    </span>
                  </div>

                  <div className="space-y-3 pt-1">
                    {group.items.map((it) => {
                      const valNum = parseFloat(nilaiPenguji[it.id] || '');
                      const pred = getSidangPredicate(valNum);
                      return (
                        <div
                          key={it.id}
                          className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-[1fr_120px_130px] md:items-center"
                        >
                          <div>
                            {it.code && (
                              <span className="mr-2 inline-block rounded bg-blue-100 px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#1e3a8a] dark:bg-blue-900/60 dark:text-blue-300">
                                {it.code}
                              </span>
                            )}
                            <span className="text-sm font-semibold leading-relaxed text-slate-800 dark:text-slate-200">
                              {it.label}
                            </span>
                          </div>

                          <div>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={nilaiPenguji[it.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNilaiPenguji((prev) => ({ ...prev, [it.id]: val }));
                              }}
                              className="app-input text-center font-black"
                              placeholder="0–100"
                            />
                          </div>

                          <div className="text-center md:text-right">
                            <span className={`inline-block w-full rounded-xl px-2.5 py-1.5 text-center text-xs font-extrabold ${pred.badgeClass}`}>
                              {pred.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Rubrik Penjelasan */}
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-slate-100 p-3 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span>Rubrik:</span>
                <span className="text-red-600 dark:text-red-400">1–20: Sangat Kurang</span> •
                <span className="text-orange-600 dark:text-orange-400">21–40: Kurang</span> •
                <span className="text-amber-600 dark:text-amber-400">41–60: Cukup</span> •
                <span className="text-blue-600 dark:text-blue-400">61–80: Baik</span> •
                <span className="text-emerald-600 dark:text-emerald-400">81–100: Sangat Baik</span>
              </div>

              {/* Rata-rata & Predikat */}
              <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60 md:grid-cols-3">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Rata-rata Nilai Sidang
                  </p>
                  <p className="mt-1 text-3xl font-black text-slate-950 dark:text-white">
                    {(() => {
                      const values = activeItems.map((item) => parseFloat(nilaiPenguji[item.id]))
                        .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
                      return values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : '0.00';
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Predikat Evaluasi
                  </p>
                  <div className="mt-2">
                    {(() => {
                      const values = activeItems.map((item) => parseFloat(nilaiPenguji[item.id]))
                        .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
                      const nilaiRata = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                      const pred = getSidangPredicate(nilaiRata);
                      return (
                        <span className={`inline-block rounded-xl px-4 py-1.5 text-sm font-black ${pred.badgeClass}`}>
                          {pred.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Grade Huruf
                  </p>
                  <p className="mt-1 text-3xl font-black text-[#1e3a8a] dark:text-blue-400">
                    {(() => {
                      const values = activeItems.map((item) => parseFloat(nilaiPenguji[item.id]))
                        .filter((v) => !isNaN(v) && v >= 0 && v <= 100);
                      const nilaiRata = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
                      if (nilaiRata >= 85) return 'A';
                      if (nilaiRata >= 75) return 'B';
                      if (nilaiRata >= 65) return 'C';
                      if (nilaiRata >= 50) return 'D';
                      return 'E';
                    })()}
                  </p>
                </div>
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