"use client";

import { useEffect, useState } from 'react';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { Logbook, getLogbookList } from '@/lib/logbook-client';
import DashboardShell from '@/components/dashboard/DashboardShell';

function getStatusBadgeClass(status?: string) {
  if (status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' || status === 'Pilih_Dosen') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

export default function MahasiswaDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [currentUser, pengajuanData, logbookData] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanList(1, 10),
          getLogbookList(),
        ]);

      if (currentUser.role !== 'Mahasiswa') {
  window.location.href = getDashboardPathByRole(currentUser.role);
  return;
}

const pengajuanItems = Array.isArray(pengajuanData)
  ? pengajuanData
  : pengajuanData?.items || [];

setUser(currentUser);
setPengajuan(pengajuanItems[0] || null);
setLogbooks(logbookData || []);

setUser(currentUser);
setPengajuan(pengajuanItems[0] || null);
setLogbooks(logbookData || []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard mahasiswa.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalDisetujui = logbooks.filter(
    (item) => item.status === 'Disetujui'
  ).length;

  const totalRevisi = logbooks.filter((item) => item.status === 'Revisi').length;

  const latestLogbooks = logbooks.slice(0, 3);

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-72 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  if (errorMsg) {
    return (
  <DashboardShell role="Mahasiswa">
    <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
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
          eyebrow="Dashboard Mahasiswa"
          title={`Halo, ${user?.name || 'Mahasiswa'}`}
          description="Pantau progres magang, logbook, dan evaluasi akhir kamu dari satu halaman yang lebih ringkas."
          action={
            <Link href="/pengajuan" className="app-btn-primary">
              Ajukan Magang
            </Link>
          }
        />

        {pengajuan?.status === 'Ditolak' && pengajuan.alasan_penolakan && (
          <Alert variant="error">
            Pengajuan kamu ditolak. Alasan: {pengajuan.alasan_penolakan}
          </Alert>
        )}

        {totalRevisi > 0 && (
          <Alert variant="warning">
            Ada {totalRevisi} logbook yang perlu direvisi. Segera perbaiki agar proses evaluasi tidak tertunda.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Status Pengajuan"
            value={pengajuan?.status || 'Belum Ada'}
            description="Status terakhir proses magang kamu."
            icon="document"
          />

          <StatCard
            title="Total Logbook"
            value={logbooks.length}
            description="Jumlah logbook yang sudah kamu kirim."
            icon="calendar"
          />

          <StatCard
            title="Disetujui Dosen"
            value={totalDisetujui}
            description={`${totalRevisi} logbook masih perlu revisi.`}
            icon="check"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white dark:text-white">
                  Ringkasan Magang
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Informasi utama pengajuan magang kamu.
                </p>
              </div>

              <span className={getStatusBadgeClass(pengajuan?.status)}>
                {pengajuan?.status || 'Belum Ada'}
              </span>
            </div>

            {pengajuan ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Perusahaan</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white dark:text-white">
                    {pengajuan.perusahaan}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Posisi</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white dark:text-white">
                    {pengajuan.posisi}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Dosen Pembimbing
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white dark:text-white">
                    {pengajuan.nama_dosen || 'Belum memilih dosen'}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Nilai Akhir</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white dark:text-white">
                    {pengajuan.nilai_dari_dosen || 'Belum dinilai'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-4 md:col-span-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Periode Magang
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white dark:text-white">
                    {pengajuan.tgl_mulai || '-'} sampai{' '}
                    {pengajuan.tgl_berakhir || '-'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-8 text-center">
                <p className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                  Kamu belum memiliki pengajuan magang.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Mulai dengan mengirim LOA dan data perusahaan tempat magang.
                </p>
                <Link href="/pengajuan" className="app-btn-primary mt-5">
                  Buat Pengajuan
                </Link>
              </div>
            )}
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white dark:text-white">Menu Cepat</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Akses fitur utama mahasiswa.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/pengajuan"
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-bold text-[#1e3a8a] hover:bg-blue-100"
              >
                Pengajuan Magang
                <span>→</span>
              </Link>

              <Link
                href="/logbook"
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 px-5 py-4 font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70"
              >
                Logbook Harian
                <span>→</span>
              </Link>

              <Link
                href="/lowongan"
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 px-5 py-4 font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70"
              >
                Bursa Magang
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="app-card mt-6 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white dark:text-white">
                Logbook Terbaru
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                Tiga aktivitas terakhir yang kamu kirim.
              </p>
            </div>

            <Link href="/logbook" className="text-sm font-black text-[#1e3a8a]">
              Lihat semua
            </Link>
          </div>

          {latestLogbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-8 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">Belum ada logbook.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                Logbook akan muncul setelah kamu mengisi aktivitas magang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestLogbooks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:bg-slate-900 dark:bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">
                      {item.tanggal}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                      {item.kegiatan}
                    </p>
                  </div>

                  <span className={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
    </DashboardShell>
  );
}