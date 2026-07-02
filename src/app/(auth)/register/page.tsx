"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';
import Alert from '@/components/ui/Alert';
import {
  type KampusMahasiswa,
  getMahasiswaKampusByNpm,
} from '@/lib/kampus-client';

type RegisterFormData = {
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  nim_nidn: string;
  name: string;
  prodi: string; // tambahan field prodi
};

// Helper: konversi nomor HP ke format 62
function formatPhoneNumber(rawPhone: string): string {
  let cleaned = rawPhone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1);
  } else if (cleaned.startsWith('+62')) {
    return cleaned.substring(1);
  } else if (cleaned.startsWith('62')) {
    return cleaned;
  }
  return cleaned;
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nim_nidn: '',
    name: '',
    prodi: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingMahasiswa, setIsCheckingMahasiswa] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Tidak perlu state mahasiswa dan checkedNpm karena box hijau sudah dihapus
  // Tapi kita masih butuh untuk menyimpan data yang sudah dicek saat validasi akhir
  const [checkedNpm, setCheckedNpm] = useState('');
  const [kampusEmail, setKampusEmail] = useState(''); // untuk validasi email

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya field phone, password, confirmPassword, nim_nidn yang bisa diubah manual
    // name, email, prodi bersifat readOnly, jadi tidak perlu handleChange untuk itu
    const { id, value } = e.target;
    if (id === 'phone' || id === 'password' || id === 'confirmPassword' || id === 'nim_nidn') {
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleNumberInput = (field: 'nim_nidn' | 'phone', value: string) => {
    const cleanValue = value.replace(/[^0-9]/g, '');

    setFormData({
      ...formData,
      [field]: cleanValue,
    });

    if (field === 'nim_nidn') {
      // Reset data otomatis saat NPM berubah
      setFormData((prev) => ({
        ...prev,
        name: '',
        email: '',
        prodi: '',
      }));
      setCheckedNpm('');
      setSuccessMsg('');
      setErrorMsg('');
    }
  };

  const handleCheckMahasiswa = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.nim_nidn.trim()) {
      setErrorMsg('NPM/NIM wajib diisi dulu.');
      return null;
    }

    if (!/^[0-9]+$/.test(formData.nim_nidn)) {
      setErrorMsg('NPM/NIM hanya boleh berisi angka.');
      return null;
    }

    setIsCheckingMahasiswa(true);

    try {
      const data = await getMahasiswaKampusByNpm(formData.nim_nidn);

      if (data.npm && data.npm !== formData.nim_nidn) {
        setErrorMsg('NPM/NIM tidak sesuai dengan data mahasiswa kampus.');
        setFormData((prev) => ({
          ...prev,
          name: '',
          email: '',
          prodi: '',
        }));
        setCheckedNpm('');
        return null;
      }

      // Format nomor WhatsApp jika ada
      let formattedPhone = '';
      if (data.no_hp) {
        formattedPhone = formatPhoneNumber(data.no_hp);
      }

      // Isi otomatis field yang readonly
      setFormData((prev) => ({
        ...prev,
        email: data.email || prev.email,
        name: data.nama || prev.name,
        prodi: data.prodi || prev.prodi,
        phone: formattedPhone || prev.phone,
      }));

      setCheckedNpm(formData.nim_nidn);
      setKampusEmail(data.email || '');
      setSuccessMsg('Data mahasiswa berhasil ditemukan.');

      return data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Data mahasiswa tidak ditemukan.';

      setErrorMsg(message);
      setFormData((prev) => ({
        ...prev,
        name: '',
        email: '',
        prodi: '',
      }));
      setCheckedNpm('');
      return null;
    } finally {
      setIsCheckingMahasiswa(false);
    }
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

    if (!formData.name.trim()) {
      setErrorMsg('Nama lengkap wajib diisi. Silakan cek data terlebih dahulu.');
      return;
    }

    if (!formData.prodi.trim()) {
      setErrorMsg('Prodi tidak ditemukan. Silakan cek data NPM Anda.');
      return;
    }

    if (!/^62\d{8,15}$/.test(formData.phone)) {
      setErrorMsg(
        'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.'
      );
      return;
    }

    if (!formData.email.trim().toLowerCase().endsWith('unsika.ac.id')) {
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

    // Jika NPM belum dicek atau data berubah, cek ulang
    if (checkedNpm !== formData.nim_nidn) {
      const mahasiswaData = await handleCheckMahasiswa();
      if (!mahasiswaData) {
        return;
      }
      // Validasi email dari API (jika ada)
      if (mahasiswaData.email && mahasiswaData.email.toLowerCase() !== formData.email.trim().toLowerCase()) {
        setErrorMsg('Email kampus tidak sesuai dengan data akademik mahasiswa.');
        return;
      }
    } else {
      // Sudah dicek, validasi email dengan yang tersimpan
      if (kampusEmail && kampusEmail.toLowerCase() !== formData.email.trim().toLowerCase()) {
        setErrorMsg('Email kampus tidak sesuai dengan data akademik mahasiswa.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await apiClient<null>('/api/auth/register', {
        method: 'POST',
        body: {
          nim_nidn: formData.nim_nidn,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          prodi: formData.prodi, // kirim prodi juga jika diperlukan backend
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
                  <li>Nama lengkap akan diisi otomatis dari data kampus.</li>
                  <li>Prodi akan diisi otomatis dari data kampus.</li>
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
                Lengkapi data berikut untuk membuat akun HIKARI.
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

                  <div className="flex gap-2">
                    <input
                      id="nim_nidn"
                      type="text"
                      required
                      value={formData.nim_nidn}
                      onChange={(e) =>
                        handleNumberInput('nim_nidn', e.target.value)
                      }
                      className="app-input"
                      placeholder="masukkan npm anda"
                    />

                    <button
                      type="button"
                      onClick={handleCheckMahasiswa}
                      disabled={isCheckingMahasiswa || !formData.nim_nidn}
                      className="app-btn-secondary whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isCheckingMahasiswa ? 'Cek...' : 'Cek Data'}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="app-label">
                    Nama Lengkap
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    readOnly
                    value={formData.name}
                    className="app-input bg-slate-50 dark:bg-slate-800/50"
                    placeholder="Akan terisi otomatis setelah cek data"
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
                    readOnly
                    value={formData.email}
                    className="app-input bg-slate-50 dark:bg-slate-800/50"
                    placeholder="npm@student.unsika.ac.id"
                  />
                </div>

                <div>
                  <label htmlFor="prodi" className="app-label">
                    Program Studi
                  </label>
                  <input
                    id="prodi"
                    type="text"
                    required
                    readOnly
                    value={formData.prodi}
                    className="app-input bg-slate-50 dark:bg-slate-800/50"
                    placeholder="Akan terisi otomatis setelah cek data"
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
                  Gunakan format 62. Contoh: 6285456123. Akan terisi otomatis
                  dari data kampus jika tersedia.
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
                disabled={isLoading || isCheckingMahasiswa}
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