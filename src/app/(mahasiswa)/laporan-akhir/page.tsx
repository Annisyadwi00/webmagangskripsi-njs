"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  getPengajuanList,
  uploadLaporanAkhir,
} from '@/lib/pengajuan-client';

function getLaporanRequirement(jenisMagang?: string | null) {
  if (jenisMagang === 'Maksimal 20 SKS') {
    return {
      showForm: true,
      needLaporan: true,
      needOutput: true,
      labelLaporan: 'Laporan Akhir PDF',
      labelOutput: 'Output Magang PDF',
      emptyMessage:
        'Laporan akhir dan output magang wajib diunggah sebelum penilaian akhir diproses.',
    };
  }

  if (jenisMagang === 'Magang 2 SKS Khusus SI') {
    return {
      showForm: true,
      needLaporan: true,
      needOutput: false,
      labelLaporan: 'Laporan Magang PDF',
      labelOutput: '',
      emptyMessage:
        'Laporan magang wajib diunggah sebelum penilaian akhir diproses.',
    };
  }

  return {
    showForm: false,
    needLaporan: false,
    needOutput: false,
    labelLaporan: '',
    labelOutput: '',
    emptyMessage: '',
  };
}

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
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

  const [linkLaporan, setLinkLaporan] = useState('');
  const [linkOutputMagang, setLinkOutputMagang] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
      setLinkLaporan(currentPengajuan?.link_laporan_akhir || '');
      setLinkOutputMagang(currentPengajuan?.link_output_magang || '');
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data laporan.';

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
      setErrorMsg(
        'Dokumen hanya dapat diunggah setelah pengajuan magang aktif.'
      );
      return;
    }

    if (!requirement.showForm) {
      setErrorMsg('Jenis magang ini tidak memerlukan upload laporan.');
      return;
    }

    if (requirement.needLaporan && !linkLaporan.trim()) {
      setErrorMsg(`${requirement.labelLaporan} wajib diisi.`);
      return;
    }

    if (linkLaporan.trim() && !isValidUrl(linkLaporan.trim())) {
      setErrorMsg(`Format link ${requirement.labelLaporan} tidak valid.`);
      return;
    }

    if (requirement.needOutput && !linkOutputMagang.trim()) {
      setErrorMsg(`${requirement.labelOutput} wajib diisi.`);
      return;
    }

    if (linkOutputMagang.trim() && !isValidUrl(linkOutputMagang.trim())) {
      setErrorMsg(`Format link ${requirement.labelOutput} tidak valid.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await uploadLaporanAkhir({
        link_laporan_akhir: linkLaporan.trim(),
        link_output_magang: requirement.needOutput
          ? linkOutputMagang.trim()
          : null,
      });

      setMessage(result.message || 'Dokumen magang berhasil disimpan.');
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan dokumen magang.';

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
            title="Upload Dokumen Magang"
            description="Lengkapi dokumen sesuai jenis magang yang kamu pilih."
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
              Kamu belum memiliki pengajuan magang. Silakan isi pendataan magang
              terlebih dahulu.
            </Alert>
          )}

          {pengajuan && !bolehUploadLaporan && (
            <Alert variant="info">
              Dokumen magang dapat diunggah setelah pengajuan magang aktif.
              Saat ini staff masih memeriksa data pengajuan kamu.
            </Alert>
          )}

          {pengajuan && !requirement.showForm && (
            <Alert variant="info">
              Jenis magang Tidak Konversi tidak memerlukan pengunggahan laporan
              melalui sistem.
            </Alert>
          )}

          {pengajuan && bolehUploadLaporan && requirement.showForm && (
            <>
              {!pengajuan.link_laporan_akhir && (
                <Alert variant="warning">{requirement.emptyMessage}</Alert>
              )}

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="app-card p-6 lg:col-span-2">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Form Upload Dokumen
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Masukkan link dokumen PDF yang dapat diakses oleh dosen
                    pembimbing dan staff.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="app-label">
                        {requirement.labelLaporan}
                      </label>
                      <input
                        type="url"
                        required={requirement.needLaporan}
                        value={linkLaporan}
                        onChange={(e) => setLinkLaporan(e.target.value)}
                        className="app-input"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>

                    {requirement.needOutput && (
                      <div>
                        <label className="app-label">
                          {requirement.labelOutput}
                        </label>
                        <input
                          type="url"
                          required
                          value={linkOutputMagang}
                          onChange={(e) => setLinkOutputMagang(e.target.value)}
                          className="app-input"
                          placeholder="https://drive.google.com/..."
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Simpan Dokumen'}
                    </button>
                  </form>
                </div>

                <div className="app-card p-6">
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    Status Dokumen
                  </h2>

                  <div className="mt-5 space-y-4">
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Status Pengajuan
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {getStatusLabel(pengajuan.status)}
                      </p>
                    </div>

                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Jenis Magang
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {pengajuan.jenis_magang || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Periode Magang
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {pengajuan.tgl_mulai || '-'} sampai{' '}
                        {pengajuan.tgl_berakhir || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {requirement.labelLaporan || 'Laporan'}
                      </p>

                      {pengajuan.link_laporan_akhir ? (
                        <a
                          href={pengajuan.link_laporan_akhir}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                        >
                          Buka Dokumen →
                        </a>
                      ) : (
                        <p className="mt-1 font-black text-red-600 dark:text-red-400">
                          Belum diunggah
                        </p>
                      )}
                    </div>

                    {requirement.needOutput && (
                      <div className="app-panel p-4">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          {requirement.labelOutput}
                        </p>

                        {pengajuan.link_output_magang ? (
                          <a
                            href={pengajuan.link_output_magang}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                          >
                            Buka Output →
                          </a>
                        ) : (
                          <p className="mt-1 font-black text-red-600 dark:text-red-400">
                            Belum diunggah
                          </p>
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