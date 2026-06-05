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

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export default function LaporanAkhirMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [linkLaporan, setLinkLaporan] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

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
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data laporan akhir.';

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

    if (!linkLaporan.trim()) {
      setErrorMsg('Link laporan akhir wajib diisi.');
      return;
    }

    if (!isValidUrl(linkLaporan.trim())) {
      setErrorMsg('Format link laporan akhir tidak valid.');
      return;
    }

    if (!canUploadLaporan(pengajuan?.status)) {
  setErrorMsg(
    'Laporan akhir hanya dapat diunggah setelah pengajuan magang aktif.'
  );
  return;
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan Staff';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return 'Belum Ada';
}

function canUploadLaporan(status?: string | null) {
  return status === 'Aktif' || status === 'Selesai';
}
    setIsSubmitting(true);

    try {
      const result = await uploadLaporanAkhir(linkLaporan.trim());

      setMessage(result.message || 'Laporan akhir berhasil disimpan.');
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan laporan akhir.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bolehUploadLaporan = canUploadLaporan(pengajuan?.status);

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
            eyebrow="Laporan Akhir"
            title="Upload Laporan Akhir Magang"
            description="Unggah laporan akhir dalam bentuk PDF melalui link Google Drive yang dapat diakses oleh dosen pembimbing."
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
              terlebih dahulu sebelum mengunggah laporan akhir.
            </Alert>
          )}

         {pengajuan && !bolehUploadLaporan && (
  <Alert variant="info">
    Laporan akhir dapat diunggah setelah pengajuan magang aktif. Saat ini
    staff masih memeriksa data pengajuan kamu.
  </Alert>
)}

          {pengajuan && bolehUploadLaporan && !pengajuan.link_laporan_akhir && (
  <Alert variant="warning">
    Kamu belum mengunggah laporan akhir. Laporan akhir wajib diunggah sebelum
    dosen pembimbing dapat memproses penilaian akhir.
  </Alert>
)}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Form Upload Laporan Akhir
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Masukkan link file PDF laporan akhir. Pastikan akses file tidak
                terkunci agar dapat dilihat oleh dosen pembimbing.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="app-label">Link Laporan Akhir PDF</label>
                  <input
                    type="url"
                    value={linkLaporan}
                    onChange={(e) => setLinkLaporan(e.target.value)}
                    className="app-input"
                    placeholder="https://drive.google.com/..."
                    disabled={!pengajuan || !bolehUploadLaporan}
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
  Pastikan file berbentuk PDF dan akses link Google Drive tidak terkunci.
</p>
                </div>

                <button
                  type="submit"
                  disabled={!pengajuan || !bolehUploadLaporan || isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan Akhir'}
                </button>
              </form>
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Status Laporan
              </h2>

              <div className="mt-5 space-y-4">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Status Pengajuan
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {getStatusLabel(pengajuan?.status)}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Periode Magang
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {pengajuan
                      ? `${pengajuan.tgl_mulai || '-'} sampai ${
                          pengajuan.tgl_berakhir || '-'
                        }`
                      : '-'}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Laporan Akhir
                  </p>

                  {pengajuan?.link_laporan_akhir ? (
                    <a
                      href={pengajuan.link_laporan_akhir}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                    >
                      Buka Laporan Akhir →
                    </a>
                  ) : (
                    <p className="mt-1 font-black text-red-600 dark:text-red-400">
                      Belum diunggah
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}