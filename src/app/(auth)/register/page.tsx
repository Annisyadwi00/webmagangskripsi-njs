"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { apiClient } from '@/lib/api-client';
import Alert from '@/components/ui/Alert';

type RegisterFormData = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nim_nidn: string;
  prodi: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nim_nidn: '',
    prodi: 'S1 Informatika',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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

  const handleGoogleSuccess = (credentialResponse: { credential?: string }) => {
    try {
      const token = credentialResponse.credential;

      if (!token) {
        setErrorMsg('Token Google tidak ditemukan.');
        return;
      }

      const payload = JSON.parse(atob(token.split('.')[1]));

      if (!payload.email?.endsWith('unsika.ac.id')) {
        setErrorMsg(
          'Registrasi wajib menggunakan email institusi resmi (@...unsika.ac.id).'
        );
        return;
      }

      setFormData((prev) => ({
        ...prev,
        name: payload.name || '',
        email: payload.email || '',
      }));

      setErrorMsg('');
      setSuccessMsg(
        'Data akun Google berhasil ditarik. Silakan lengkapi NIM, program studi, nomor WhatsApp, dan password.'
      );
    } catch {
      setErrorMsg('Gagal membaca data otomatis dari Google.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    const numberOnlyRegex = /^[0-9]+$/;

    if (!formData.name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    if (!numberOnlyRegex.test(formData.nim_nidn)) {
      setErrorMsg('NIM hanya boleh berisi angka.');
      return;
    }

    if (!numberOnlyRegex.test(formData.phone)) {
      setErrorMsg('Nomor WhatsApp hanya boleh berisi angka.');
      return;
    }

    if (!formData.email.endsWith('unsika.ac.id')) {
      setErrorMsg(
        'Registrasi diwajibkan menggunakan domain email institusi resmi (@...unsika.ac.id).'
      );
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
          name: formData.name.trim(),
          nim_nidn: formData.nim_nidn,
          email: formData.email.trim(),
          phone: formData.phone,
          password: formData.password,
          prodi: formData.prodi,
        },
      });

      setSuccessMsg(result.message || 'Akun Mahasiswa berhasil didaftarkan.');

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
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <main className="min-h-screen py-10">
        <div className="app-container">
          <div className="grid min-h-[calc(100vh-7rem)] grid-cols-1 items-center gap-8 lg:grid-cols-[1fr_680px]">
            <section className="hidden lg:block">
              <div className="max-w-xl">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a]">
                  Registrasi Mahasiswa
                </p>

                <h1 className="mt-4 text-5xl font-black leading-tight tracking-tight text-slate-950">
                  Buat akun untuk memulai proses magang.
                </h1>

                <p className="mt-5 text-base leading-7 text-slate-500">
                  Daftar menggunakan email institusi UNSIKA agar kamu dapat
                  mengajukan LOA, mengisi logbook, dan memantau evaluasi
                  magang.
                </p>

                <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <p className="font-black text-[#1e3a8a]">
                    Persyaratan akun
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    <li>Email wajib menggunakan domain UNSIKA.</li>
                    <li>Password minimal 8 karakter.</li>
                    <li>Password memiliki minimal 1 huruf kapital dan 1 angka.</li>
                    <li>NIM dan nomor WhatsApp hanya boleh berisi angka.</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="app-card p-6 md:p-8">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a]">
                  SI
                </div>

                <h2 className="mt-5 text-2xl font-black text-slate-950">
                  Daftar Akun Mahasiswa
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Lengkapi data berikut untuk membuat akun SI Magang.
                </p>
              </div>

              {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
              {successMsg && <Alert variant="success">{successMsg}</Alert>}

              <div className="mb-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setErrorMsg('Gagal menarik data dari Google.')}
                  text="signup_with"
                  shape="rectangular"
                />
              </div>

              <div className="my-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  atau isi manual
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <form onSubmit={handleRegister} className="space-y-5">
                <div>
                  <label htmlFor="name" className="app-label">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Nama sesuai KTM"
                  />
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="nim_nidn" className="app-label">
                      NIM
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
                    <label htmlFor="prodi" className="app-label">
                      Program Studi
                    </label>
                    <select
                      id="prodi"
                      required
                      value={formData.prodi}
                      onChange={handleChange}
                      className="app-input"
                    >
                      <option value="S1 Informatika">S1 Informatika</option>
                      <option value="S1 Sistem Informasi">
                        S1 Sistem Informasi
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="app-label">
                      Nomor WhatsApp
                    </label>
                    <input
                      id="phone"
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        handleNumberInput('phone', e.target.value)
                      }
                      className="app-input"
                      placeholder="081234567890"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="app-label">
                      Email Institusi
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="nama@student.unsika.ac.id"
                    />
                  </div>
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
                        className="app-input pr-24"
                        placeholder="Minimal 8 karakter"
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
                        className="app-input pr-24"
                        placeholder="Ulangi password"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1 text-xs font-black text-[#1e3a8a] hover:bg-blue-50"
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

              <p className="mt-8 border-t border-slate-100 pt-6 text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <Link
                  href="/login"
                  className="font-black text-[#1e3a8a] hover:underline"
                >
                  Masuk di sini
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </GoogleOAuthProvider>
  );
}