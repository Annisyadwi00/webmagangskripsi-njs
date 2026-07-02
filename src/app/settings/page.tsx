"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  updateCurrentUserPassword,
  updateCurrentUserProfile,
} from '@/lib/users-client';

type ShellRole = 'Mahasiswa' | 'Admin' | 'Super Admin' | 'Dosen';

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const initialPasswordForm: PasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export default function SettingsPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [phone, setPhone] = useState('');

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>(initialPasswordForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

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

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');

    if (!/^62\d{8,15}$/.test(phone)) {
      setErrorMsg(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
      return;
    }

    setIsSubmittingProfile(true);

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
      setIsSubmittingProfile(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setErrorMsg(
        'Password lama, password baru, dan konfirmasi password wajib diisi.'
      );
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setErrorMsg('Password baru minimal 8 karakter.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak sesuai.');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const result = await updateCurrentUserPassword(passwordForm);

      setMessage(result.message || 'Kata sandi berhasil diubah.');
      setPasswordForm(initialPasswordForm);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal mengubah kata sandi.';

      setErrorMsg(msg);
    } finally {
      setIsSubmittingPassword(false);
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
            description="Lihat data akun dan ubah kata sandi untuk keamanan akses AMIRAT."
            action={
              <Link href={dashboardPath} className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <Alert variant="info">
            Nama, NPM/NIDN, email, dan program studi bersifat tetap. Data
            tersebut mengikuti data akademik kampus.
          </Alert>

          <section className="grid grid-cols-1 gap-6">
  <div className="space-y-6">
              <div className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Data Akun
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Informasi utama akun pengguna.
                </p>

                <form onSubmit={handleSubmitProfile} className="mt-6 space-y-5">
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
                      <label className="app-label">Email</label>
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
                    disabled={isSubmittingProfile}
                    className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingProfile
                      ? 'Menyimpan...'
                      : 'Simpan Nomor WhatsApp'}
                  </button>
                </form>
              </div>

              <div className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Ubah Kata Sandi
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Gunakan kata sandi minimal 8 karakter.
                </p>

                <form onSubmit={handleSubmitPassword} className="mt-6 space-y-5">
                  <div>
                    <label className="app-label">Password Lama</label>
                    <input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="app-input"
                      placeholder="Masukkan password lama"
                    />
                  </div>

                  <div>
                    <label className="app-label">Password Baru</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="app-input"
                      placeholder="Minimal 8 karakter"
                    />
                  </div>

                  <div>
                    <label className="app-label">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="app-input"
                      placeholder="Ulangi password baru"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingPassword}
                    className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmittingPassword
                      ? 'Menyimpan...'
                      : 'Ubah Kata Sandi'}
                  </button>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}