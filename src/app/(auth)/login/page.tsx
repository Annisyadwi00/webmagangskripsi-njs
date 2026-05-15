"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { apiClient } from '@/lib/api-client';
import Alert from '@/components/ui/Alert';

type LoginData = {
  role: 'Admin' | 'Mahasiswa' | 'Dosen';
  name: string;
  prodi?: string | null;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const redirectByRole = (role?: string) => {
    if (role === 'Mahasiswa') {
      router.push('/dashboard');
      return;
    }

    if (role === 'Dosen') {
      router.push('/dosen/dashboard');
      return;
    }

    if (role === 'Admin') {
      router.push('/admin/dashboard');
      return;
    }

    throw new Error('Role pengguna tidak valid.');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await apiClient<LoginData>('/api/auth/login', {
        method: 'POST',
        body: {
          email: email.trim(),
          password,
        },
      });

      redirectByRole(result.data?.role);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat login.';

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: {
    credential?: string;
  }) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const result = await apiClient<LoginData>('/api/auth/google', {
        method: 'POST',
        body: {
          credential: credentialResponse.credential,
        },
      });

      redirectByRole(result.data?.role);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat login Google.';

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <main className="min-h-screen py-10">
        <div className="app-container">
          <div className="grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_460px]">
            <section className="hidden lg:block">
              <div className="max-w-xl">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a]">
                  SI Magang Fasilkom UNSIKA
                </p>

                <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight text-slate-950">
                  Masuk ke portal magang dengan mudah dan aman.
                </h1>

                <p className="mt-5 text-base leading-7 text-slate-500">
                  Kelola pengajuan, logbook, bimbingan, dan evaluasi magang
                  dalam satu sistem yang terintegrasi.
                </p>

                <div className="mt-8 grid grid-cols-1 gap-4">
                  <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                    <p className="font-black text-[#1e3a8a]">
                      Mahasiswa
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Ajukan LOA, isi logbook, dan pantau hasil evaluasi magang.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5">
                    <p className="font-black text-slate-950">
                      Dosen & Admin
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Validasi, bimbing, dan kelola proses magang secara rapi.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="app-card p-6 md:p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a]">
                  SI
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Selamat Datang
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Masuk menggunakan email institusi dan password akun Anda.
                </p>
              </div>

              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label htmlFor="email" className="app-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="app-input"
                    placeholder="nama@unsika.ac.id"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="app-label mb-0">
                      Password
                    </label>

                    <a
                      href="#"
                      className="text-sm font-bold text-[#1e3a8a] hover:underline"
                    >
                      Lupa password?
                    </a>
                  </div>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="app-input pr-24"
                      placeholder="Masukkan password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50"
                    >
                      {showPassword ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  atau
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setErrorMsg('Login via Google dibatalkan atau gagal.')
                  }
                  useOneTap
                />
              </div>

              <p className="mt-8 text-center text-sm text-slate-500">
                Belum punya akun?{' '}
                <Link
                  href="/register"
                  className="font-black text-[#1e3a8a] hover:underline"
                >
                  Daftar sekarang
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}