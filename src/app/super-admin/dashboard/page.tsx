"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

export default function SuperAdminDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const currentUser = await getCurrentUserClient();

        if (currentUser.role !== 'Super Admin') {
          window.location.href = getDashboardPathByRole(currentUser.role);
          return;
        }

        setUser(currentUser);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard super admin.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <DashboardShell role="Super Admin">
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
      </DashboardShell>
    );
  }

  if (errorMsg) {
    return (
      <DashboardShell role="Super Admin">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <Alert variant="error">{errorMsg}</Alert>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Dashboard Super Admin"
            title={`Halo, ${user?.name || 'Super Admin'}`}
            description="Kelola data mahasiswa magang, pengajuan magang, alokasi dosen pembimbing, pengajuan mitra, lowongan, dan user admin."
          />

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Data Mahasiswa Magang"
              value="-"
              description="Rekap mahasiswa yang sedang atau telah magang."
              icon="users"
            />

            <StatCard
              title="Pengajuan Magang"
              value="-"
              description="Pengajuan magang yang perlu dipantau."
              icon="document"
            />

            <StatCard
              title="Pengajuan Mitra"
              value="-"
              description="Pengajuan mitra dari mahasiswa atau pihak terkait."
              icon="briefcase"
            />

            <StatCard
              title="Lowongan"
              value="-"
              description="Lowongan magang yang dikelola super admin."
              icon="check"
            />
          </section>

          <section className="app-card p-6">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Akses Cepat Super Admin
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pilih menu utama untuk mengelola proses magang.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Link
                href="/super-admin/mahasiswa-magang"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  Data Mahasiswa Magang
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Lihat dan export data mahasiswa magang.
                </p>
              </Link>

              <Link
                href="/super-admin/pengajuan"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  Pengajuan Magang
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Pantau pengajuan magang mahasiswa.
                </p>
              </Link>

              <Link
                href="/super-admin/alokasi-dosen"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  Alokasi Dosen
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Tetapkan dosen pembimbing mahasiswa.
                </p>
              </Link>

              <Link
                href="/super-admin/pengajuan-mitra"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  Pengajuan Mitra
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Verifikasi data mitra yang diajukan.
                </p>
              </Link>

              <Link
                href="/super-admin/lowongan"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  Lowongan
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Kelola lowongan magang dan pengajuan lowongan mitra.
                </p>
              </Link>

              <Link
                href="/super-admin/users"
                className="app-panel app-card-hover p-5"
              >
                <p className="font-black text-slate-950 dark:text-white">
                  User Management
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Kelola akun admin dan super admin.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}