"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Alert from '@/components/ui/Alert';
import { getMahasiswaKampusByNpm } from '@/lib/kampus-client';

type RegisterFormData = {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nim_nidn: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nim_nidn: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleNumberInput = (field: 'nim_nidn' | 'phone', value: string) => {
    setFormData({
      ...formData,
      [field]: value.replace(/[^0-9]/g, ''),
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.nim_nidn.trim()) {
      setErrorMsg('NPM/NIM wajib diisi.');
      return;
    }

    if (!/^[0-9]+$/.test(formData.nim_nidn)) {
      setErrorMsg('NPM/NIM hanya boleh berisi angka.');
      return;
    }

    if (!/^62\d{8,15}$/.test(formData.phone)) {
      setErrorMsg(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
      return;
    }

    if (!formData.email.trim().endsWith('unsika.ac.id')) {
      setErrorMsg('Registrasi wajib menggunakan email kampus UNSIKA.');
      return;
    }

    if (formData.password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[^+"{]+$/;

    if (!passwordRegex.test(formData.password)) {
      setErrorMsg(
        'Kata sandi harus mengandung minimal 1 huruf kapital dan 1 angka.'
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak sama.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiClient<null>('/api/auth/register', {
        method: 'POST',
        body: {
          nim_nidn: formData.nim_nidn,
          email: formData.email.trim(),
          phone: formData.phone,
          password: formData.password,
        },
      });

      setSuccessMsg(result.message || 'Akun mahasiswa berhasil didaftarkan.');

      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat registrasi.';

      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="app-container">
        <div className="grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_680px]">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
                Registrasi Mahasiswa
              </p>

              <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight text-slate-950 dark:text-white">
                Buat akun untuk memulai proses magang.
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300">
                Daftar menggunakan NPM/NIM dan email kampus UNSIKA. Data
                identitas mahasiswa akan divalidasi melalui data akademik
                kampus.
              </p>

              <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-400/20 dark:bg-blue-400/10">
                <p className="font-black text-[#1e3a8a] dark:text-blue-300">
                  Persyaratan akun
                </p>

                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <li>NPM/NIM wajib sesuai data akademik kampus.</li>
                  <li>Email wajib menggunakan domain UNSIKA.</li>
                  <li>Nomor WhatsApp menggunakan format 62.</li>
                  <li>
                    Password minimal 8 karakter, memiliki huruf kapital dan
                    angka.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="app-card p-6 md:p-8">
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                SI
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                Daftar Akun Mahasiswa
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Lengkapi data berikut untuk membuat akun SI Magang.
              </p>
            </div>

            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="nim_nidn" className="app-label">
                    NPM/NIM
                  </label>
                  <input
                    id="nim_nidn"
                    type="text"
                    required
                    value={formData.nim_nidn}
                    onChange={(e) =>
                      handleNumberInput('nim_nidn', e.target.value)
                    }
                    className="app-input"
                    placeholder="2210631170001"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="app-label">
                    Email Kampus
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="npm@student.unsika.ac.id"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="app-label">
                  Nomor WhatsApp
                </label>
                <input
                  id="phone"
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => handleNumberInput('phone', e.target.value)}
                  className="app-input"
                  placeholder="628xxxxxxxxxx"
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Gunakan format 62. Contoh: 6285456123.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label htmlFor="password" className="app-label">
                    Password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="off"
                      className="app-input pr-24"
                      placeholder="Masukkan password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      {showPassword ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="app-label">
                    Konfirmasi Password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="off"
                      className="app-input pr-24"
                      placeholder="Ulangi password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-400/10"
                    >
                      {showConfirmPassword ? 'Sembunyikan' : 'Lihat'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Memproses Registrasi...' : 'Daftar Sekarang'}
              </button>
            </form>

            <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="font-black text-[#1e3a8a] hover:underline dark:text-blue-300"
              >
                Masuk di sini
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}