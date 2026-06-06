"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { updateCurrentUserProfile } from '@/lib/users-client';

type ShellRole = 'Mahasiswa' | 'Admin' | 'Super Admin' | 'Dosen';

export default function SettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const currentUser = await getCurrentUserClient();

      setUser(currentUser);
      setPhone(currentUser.phone || '');
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal memuat data settings.';

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

    if (!/^62\d{8,15}$/.test(phone)) {
      setErrorMsg(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await updateCurrentUserProfile({
        phone,
      });

      setMessage(result.message || 'Nomor WhatsApp berhasil diperbarui.');
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui nomor WhatsApp.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shellRole = (user?.role || 'Mahasiswa') as ShellRole;
  const dashboardPath = getDashboardPathByRole(user?.role);

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 h-80 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  if (errorMsg && !user) {
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
    <DashboardShell role={shellRole}>
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Settings"
            title="Pengaturan Akun"
            description="Data identitas bersifat tetap karena akan terhubung dengan data akademik kampus. Pengguna hanya dapat memperbarui nomor WhatsApp."
            action={
              <Link href={dashboardPath} className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <Alert variant="info">
            Nama, NPM/NIDN, email kampus, dan program studi tidak dapat diubah
            melalui halaman ini. Data tersebut akan mengikuti data akademik/API
            kampus.
          </Alert>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Data Akun
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Informasi utama akun pengguna.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Lengkap</label>
                    <input
                      type="text"
                      value={user?.name || '-'}
                      readOnly
                      className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="app-label">NPM/NIDN</label>
                    <input
                      type="text"
                      value={user?.nim_nidn || '-'}
                      readOnly
                      className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="app-label">Email Kampus</label>
                    <input
                      type="email"
                      value={user?.email || '-'}
                      readOnly
                      className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="app-label">Program Studi</label>
                    <input
                      type="text"
                      value={user?.prodi || '-'}
                      readOnly
                      className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="app-label">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/[^0-9]/g, ''))
                    }
                    className="app-input"
                    placeholder="628xxxxxxxxxx"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Gunakan format 62. Contoh: 6285456123.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Nomor WhatsApp'}
                </button>
              </form>
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Informasi
              </h2>

              <div className="mt-5 space-y-4">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Role
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {user?.role || '-'}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Status Data
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    Mengikuti data kampus
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Foto Profil
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    Tidak digunakan
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}