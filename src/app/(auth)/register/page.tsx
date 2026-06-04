"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Alert from '@/components/ui/Alert';

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

    const numberOnlyRegex = /^[0-9]+$/;

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
  nim_nidn: formData.nim_nidn,
  email: formData.email.trim(),
  phone: formData.phone,
  password: formData.password,
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
                 Daftar menggunakan NPM/NIM dan email kampus UNSIKA. Data identitas
mahasiswa akan divalidasi melalui data akademik kampus.
                </p>

                <div className="mt-8 rounded-3xl border border-blue-100 bg-blue-50 p-6">
                  <p className="font-black text-[#1e3a8a]">
                    Persyaratan akun
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    <li>NPM/NIM wajib sesuai data akademik kampus.</li>
<li>Email wajib menggunakan domain UNSIKA.</li>
<li>Nomor WhatsApp menggunakan format angka.</li>
<li>Password minimal 8 karakter, memiliki huruf kapital dan angka.</li>
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
      onChange={(e) => handleNumberInput('nim_nidn', e.target.value)}
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
  <p className="mt-2 text-xs text-slate-500">
    Gunakan format angka. Disarankan diawali 62.
  </p>
</div>

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
                        autoComplete="off"
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
  );
}