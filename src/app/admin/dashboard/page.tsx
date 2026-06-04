"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  PengajuanMitra,
  getPengajuanMitraList,
} from '@/lib/pengajuan-mitra-client';
import { Lowongan, getAllLowonganList } from '@/lib/lowongan-client';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (
    status === 'Menunggu_Verifikasi' ||
    status === 'Menunggu' 
  ) {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Menunggu') return 'Menunggu';
  if (status === 'Disetujui') return 'Disetujui';

  return status || '-';
}

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuanMitra, setPengajuanMitra] = useState<PengajuanMitra[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

    const [me, mitraData, lowonganData] = await Promise.all([
  getCurrentUserClient(),
  getPengajuanMitraList(),
  getAllLowonganList(),
]);

if (me.role !== 'Admin') {
  window.location.href = getDashboardPathByRole(me.role);
  return;
}

setCurrentUser(me);
setPengajuanMitra(mitraData || []);
setLowongan(lowonganData || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Gagal memuat dashboard admin.';

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  

  const pendingMitra = useMemo(
    () => pengajuanMitra.filter((item) => item.status === 'Menunggu'),
    [pengajuanMitra]
  );

  const lowonganAktif = useMemo(
    () => lowongan.filter((item) => item.status === 'Aktif'),
    [lowongan]
  );
  
  const latestMitra = pengajuanMitra.slice(0, 5);

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
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

  if (errorMsg) {
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
          eyebrow="Dashboard Admin"
          title={`Halo, ${currentUser?.name || 'Admin'}`}
          description="Kelola pengajuan mitra, lowongan magang, dan pantau activity log sistem."
          
          action={
  <div className="flex flex-col gap-3 sm:flex-row">
    <Link href="/admin/pengajuan-mitra" className="app-btn-primary">
      Verifikasi Mitra
    </Link>

    <Link href="/admin/lowongan" className="app-btn-secondary">
      Kelola Lowongan
    </Link>

    <Link href="/admin/activity" className="app-btn-secondary">
      Activity Log
    </Link>
  </div>
}
        />

        
        {pendingMitra.length > 0 && (
          <Alert variant="info">
            Ada {pendingMitra.length} pengajuan mitra yang menunggu verifikasi.
          </Alert>
        )}

        

         <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Pengajuan Mitra"
            value={pendingMitra.length}
            description="Mitra baru menunggu validasi."
            icon="document"
          />

          <StatCard
            title="Lowongan Aktif"
            value={lowonganAktif.length}
            description="Lowongan yang sedang tampil."
            icon="check"
          />
        </section>


        <section className="app-card mb-8 p-6">
  <div className="mb-5">
    <h2 className="text-xl font-black text-slate-950 dark:text-white">
      Akses Cepat Admin
    </h2>

    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
      Gunakan menu berikut untuk mengelola fitur admin/staff TU.
    </p>
  </div>

  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
    <Link
      href="/admin/pengajuan-mitra"
      className="app-panel app-card-hover p-5"
    >
      <p className="font-black text-slate-950 dark:text-white">
        Pengajuan Mitra
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Setujui atau tolak data mitra baru.
      </p>
    </Link>

    <Link href="/admin/lowongan" className="app-panel app-card-hover p-5">
      <p className="font-black text-slate-950 dark:text-white">
        Lowongan
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Lihat data lowongan magang.
      </p>
    </Link>

    <Link href="/admin/activity" className="app-panel app-card-hover p-5">
      <p className="font-black text-slate-950 dark:text-white">
        Activity Log
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Pantau aktivitas penting di sistem.
      </p>
    </Link>
  </div>
</section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="app-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Pengajuan Mitra Terbaru
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data mitra baru yang diajukan mahasiswa.
                </p>
              </div>

              <Link
                href="/admin/pengajuan-mitra"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>

            {latestMitra.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengajuan mitra.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestMitra.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          {item.nama_mitra}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Pengusul: {item.nama_mahasiswa_pengusul}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Narahubung: {item.nama_narahubung_mitra}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
  <div className="mb-5 flex items-center justify-between gap-4">
    <div>
      <h2 className="text-xl font-black text-slate-950 dark:text-white">
        Pengajuan Dokumen Terbaru
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Permintaan dokumen magang terbaru dari mahasiswa.
      </p>
    </div>

    <Link
      href="/admin/pengajuan-dokumen"
      className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
    >
      Lihat semua
    </Link>
  </div>
        </section>
      </div>
    </main>
  );
}