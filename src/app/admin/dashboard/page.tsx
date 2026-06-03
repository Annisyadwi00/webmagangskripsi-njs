"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import {
  PengajuanMitra,
  getPengajuanMitraList,
} from '@/lib/pengajuan-mitra-client';
import { Lowongan, getAllLowonganList } from '@/lib/lowongan-client';
import { User, getUsers } from '@/lib/users-client';
import {
  PengajuanDokumen,
  getPengajuanDokumenList,
} from '@/lib/pengajuan-dokumen-client';
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
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [pengajuanMitra, setPengajuanMitra] = useState<PengajuanMitra[]>([]);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [pengajuanDokumen, setPengajuanDokumen] = useState<PengajuanDokumen[]>([]);
  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

     const [
  me,
  pengajuanData,
  mitraData,
  lowonganData,
  dokumenData,
  usersData,
] = await Promise.all([
  getCurrentUserClient(),
  getPengajuanList(1, 100),
  getPengajuanMitraList(),
  getAllLowonganList(),
  getPengajuanDokumenList(),
  getUsers(),
]);

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
setPengajuans(pengajuanData?.items || []);
setPengajuanMitra(mitraData || []);
setLowongan(lowonganData || []);
setPengajuanDokumen(dokumenData || []);
setUsers(usersData || []);
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

  const pendingPengajuan = useMemo(
    () =>
      pengajuans.filter((item) => item.status === 'Menunggu_Verifikasi'),
    [pengajuans]
  );
  const pendingDokumen = useMemo(
    () => pengajuanDokumen.filter((item) => item.status === 'Menunggu'),
    [pengajuanDokumen]
  );
  const pengajuanAktif = useMemo(
    () => pengajuans.filter((item) => item.status === 'Aktif'),
    [pengajuans]
  );

  const pengajuanSelesai = useMemo(
    () => pengajuans.filter((item) => item.status === 'Selesai'),
    [pengajuans]
  );

  const pendingMitra = useMemo(
    () => pengajuanMitra.filter((item) => item.status === 'Menunggu'),
    [pengajuanMitra]
  );

  const lowonganAktif = useMemo(
    () => lowongan.filter((item) => item.status === 'Aktif'),
    [lowongan]
  );

  const totalMahasiswa = users.filter((item) => item.role === 'Mahasiswa').length;
  const totalDosen = users.filter((item) => item.role === 'Dosen').length;

  const latestPengajuan = pengajuans.slice(0, 5);
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
          description="Pantau pengajuan magang, pengajuan mitra, data pengguna, dan lowongan dari satu halaman."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/pengajuan" className="app-btn-primary">
                Verifikasi Magang
              </Link>

              <Link href="/admin/pengajuan-mitra" className="app-btn-secondary">
                Verifikasi Mitra
              </Link>
              <Link href="/admin/pengajuan-dokumen" className="app-btn-secondary">
  Proses Dokumen
</Link>
            </div>
          }
        />

        {pendingPengajuan.length > 0 && (
          <Alert variant="warning">
            Ada {pendingPengajuan.length} pengajuan magang yang menunggu
            verifikasi.
          </Alert>
        )}
{pendingDokumen.length > 0 && (
  <Alert variant="info">
    Ada {pendingDokumen.length} pengajuan dokumen yang menunggu diproses.
  </Alert>
)}
        {pendingMitra.length > 0 && (
          <Alert variant="info">
            Ada {pendingMitra.length} pengajuan mitra yang menunggu verifikasi.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          <StatCard
            title="Menunggu Magang"
            value={pendingPengajuan.length}
            description="Pengajuan magang perlu diverifikasi."
            icon="clock"
          />

          <StatCard
            title="Magang Aktif"
            value={pengajuanAktif.length}
            description="Mahasiswa sedang menjalankan magang."
            icon="briefcase"
          />
<StatCard
  title="Dokumen Menunggu"
  value={pendingDokumen.length}
  description="Pengajuan dokumen perlu diproses."
  icon="document"
/>
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

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Total Mahasiswa"
            value={totalMahasiswa}
            description="Akun mahasiswa di sistem."
            icon="users"
          />

          <StatCard
            title="Total Dosen"
            value={totalDosen}
            description="Akun dosen pembimbing."
            icon="users"
          />

          <StatCard
            title="Magang Selesai"
            value={pengajuanSelesai.length}
            description="Pengajuan yang sudah selesai."
            icon="chart"
          />
        </section>

        <section className="app-card mb-8 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Akses Cepat Admin
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Gunakan menu berikut untuk mengelola proses utama SI Magang.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Link href="/admin/pengajuan" className="app-panel app-card-hover p-5">
              <p className="font-black text-slate-950 dark:text-white">
                Pengajuan Magang
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Verifikasi pendataan magang dan tentukan dosen.
              </p>
            </Link>

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
            <Link
  href="/admin/pengajuan-dokumen"
  className="app-panel app-card-hover p-5"
>
  <p className="font-black text-slate-950 dark:text-white">
    Pengajuan Dokumen
  </p>
  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
    Proses permintaan dokumen dan isi link Google Drive.
  </p>
</Link>
            <Link href="/admin/lowongan" className="app-panel app-card-hover p-5">
              <p className="font-black text-slate-950 dark:text-white">
                Lowongan
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Tambah dan kelola lowongan magang.
              </p>
            </Link>

            <Link href="/admin/users" className="app-panel app-card-hover p-5">
              <p className="font-black text-slate-950 dark:text-white">
                Pengguna
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Kelola akun mahasiswa, dosen, dan admin.
              </p>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="app-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Pengajuan Magang Terbaru
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data pendataan magang terbaru dari mahasiswa.
                </p>
              </div>

              <Link
                href="/admin/pengajuan"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>

            {latestPengajuan.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengajuan magang.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestPengajuan.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.npm || '-'} • {item.program_studi || '-'}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.perusahaan} - {item.posisi}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
        </section>
      </div>
    </main>
  );
}