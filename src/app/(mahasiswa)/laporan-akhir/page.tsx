"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function getLaporanRequirement(jenisMagang?: string | null) {
  if (jenisMagang === 'Konversi 20 SKS') {
    return {
      showForm: true,
      needLaporan: true,
      needOutput: true,
      title: 'Upload Laporan Akhir',
      labelLaporan: 'File Laporan Akhir (PDF)',
      labelOutput: 'File Output Magang (PDF)',
      emptyMessage: 'Laporan akhir dan output magang wajib diunggah sebelum penilaian akhir diproses.',
    };
  }
  if (jenisMagang === 'Konversi 2 SKS') {
    return {
      showForm: true,
      needLaporan: true,
      needOutput: false,
      title: 'Upload Laporan Magang',
      labelLaporan: 'File Laporan Magang (PDF)',
      labelOutput: '',
      emptyMessage: 'Laporan magang wajib diunggah sebelum penilaian akhir diproses.',
    };
  }
  return {
    showForm: false,
    needLaporan: false,
    needOutput: false,
    title: 'Laporan Magang',
    labelLaporan: '',
    labelOutput: '',
    emptyMessage: '',
  };
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan Staff';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';
  return 'Belum Ada';
}

function canUploadLaporan(status?: string | null) {
  return status === 'Aktif';
}

export default function LaporanAkhirMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const laporanFileRef = useRef<HTMLInputElement>(null);
  const outputFileRef = useRef<HTMLInputElement>(null);

  const requirement = getLaporanRequirement(pengajuan?.jenis_magang);
  const bolehUploadLaporan = canUploadLaporan(pengajuan?.status);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 10),
      ]);
      if (currentUser.role !== 'Mahasiswa') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }
      const currentPengajuan = pengajuanData.items?.[0] || null;
      setUser(currentUser);
      setPengajuan(currentPengajuan);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal memuat data laporan.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    if (!pengajuan) {
      setErrorMsg('Data pengajuan magang tidak ditemukan.');
      return;
    }
    if (!bolehUploadLaporan) {
      setErrorMsg('Dokumen hanya dapat diunggah setelah pengajuan magang aktif.');
      return;
    }
    if (!requirement.showForm) {
      setErrorMsg('Jenis magang ini tidak memerlukan upload laporan.');
      return;
    }

    const laporanFile = laporanFileRef.current?.files?.[0];
    const outputFile = outputFileRef.current?.files?.[0];

    if (requirement.needLaporan && (!laporanFile || laporanFile.type !== 'application/pdf')) {
      setErrorMsg(`${requirement.labelLaporan} wajib diunggah dalam format PDF.`);
      return;
    }
    if (requirement.needOutput && (!outputFile || outputFile.type !== 'application/pdf')) {
      setErrorMsg(`${requirement.labelOutput} wajib diunggah dalam format PDF.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('action', 'upload_laporan_akhir');
      if (laporanFile) formData.append('laporan_file', laporanFile);
      if (outputFile) formData.append('output_file', outputFile);

      const res = await fetch('/api/pengajuan', { method: 'PUT', body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Gagal mengunggah dokumen.');

      setMessage(result.message || 'Dokumen berhasil disimpan.');
      await fetchData();
      // Reset file inputs
      if (laporanFileRef.current) laporanFileRef.current.value = '';
      if (outputFileRef.current) outputFileRef.current.value = '';
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan dokumen.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Mahasiswa">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Laporan Magang"
            title={requirement.title}
            description={
              pengajuan
                ? `Jenis magang kamu: ${getJenisMagangLabel(pengajuan.jenis_magang)}.`
                : 'Lengkapi dokumen laporan magang sesuai status pengajuan.'
            }
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {!pengajuan && (
            <Alert variant="warning">
              Kamu belum memiliki pengajuan magang. Silakan isi pendataan magang terlebih dahulu.
            </Alert>
          )}

          {pengajuan && !bolehUploadLaporan && (
            <Alert variant="info">
              Dokumen magang dapat diunggah setelah pengajuan magang aktif. Saat ini staff masih memeriksa data pengajuan kamu.
            </Alert>
          )}

          {pengajuan && pengajuan.jenis_magang === 'Tidak Konversi' && (
            <Alert variant="info">
              Jenis magang Tidak Konversi tidak mewajibkan upload laporan melalui sistem.
            </Alert>
          )}

          {pengajuan && bolehUploadLaporan && requirement.showForm && (
            <>
              {(!pengajuan.link_laporan_akhir) && (
                <Alert variant="warning">{requirement.emptyMessage}</Alert>
              )}

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="app-card p-6 lg:col-span-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Form Upload Dokumen</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Unggah file PDF (maksimal 5MB).
                  </p>
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    {requirement.needLaporan && (
                      <div>
                        <label className="app-label">{requirement.labelLaporan}</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          ref={laporanFileRef}
                          className="app-input"
                          required={requirement.needLaporan}
                        />
                      </div>
                    )}
                    {requirement.needOutput && (
                      <div>
                        <label className="app-label">{requirement.labelOutput}</label>
                        <input
                          type="file"
                          accept="application/pdf"
                          ref={outputFileRef}
                          className="app-input"
                          required
                        />
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Mengunggah...' : 'Upload Dokumen'}
                    </button>
                  </form>
                </div>

                <div className="app-card p-6">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">Status Dokumen</h2>
                  <div className="mt-5 space-y-4">
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Status Pengajuan</p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">{getStatusLabel(pengajuan.status)}</p>
                    </div>
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Jenis Magang</p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">{getJenisMagangLabel(pengajuan.jenis_magang)}</p>
                    </div>
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Periode Magang</p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">{pengajuan.tgl_mulai || '-'} sampai {pengajuan.tgl_berakhir || '-'}</p>
                    </div>
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{requirement.labelLaporan || 'Laporan'}</p>
                      {pengajuan.link_laporan_akhir ? (
                        <a href={pengajuan.link_laporan_akhir} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-black text-blue-800 dark:text-blue-300">
                          Buka Dokumen →
                        </a>
                      ) : (
                        <p className="mt-1 font-black text-red-600 dark:text-red-400">Belum diunggah</p>
                      )}
                    </div>
                    {requirement.needOutput && (
                      <div className="app-panel p-4">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{requirement.labelOutput}</p>
                        {pengajuan.link_output_magang ? (
                          <a href={pengajuan.link_output_magang} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex font-black text-blue-800 dark:text-blue-300">
                            Buka Output →
                          </a>
                        ) : (
                          <p className="mt-1 font-black text-red-600 dark:text-red-400">Belum diunggah</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}