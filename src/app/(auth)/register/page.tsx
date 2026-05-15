"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { apiClient } from '@/lib/api-client';
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

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

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
      'Data akun Google berhasil ditarik. Silakan lengkapi NIM, Jurusan, No HP, dan Password Anda.'
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
    setErrorMsg('Nomor telepon hanya boleh berisi angka.');
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
    setErrorMsg('Kata sandi dan konfirmasi kata sandi tidak sinkron.');
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
    setShowOtpModal(true);
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat registrasi.';

    setErrorMsg(message);
  } finally {
    setIsLoading(false);
  }
};

  const handleVerifyOtp = async () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      if (otpCode.length === 6) {
        setShowOtpModal(false);
        router.push('/login');
      } else {
        alert('Pastikan kode verifikasi terdiri dari 6 digit.');
      }
    }, 1500);
  };

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-xl">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrasi Mahasiswa
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Portal Sistem Informasi Magang Fasilkom UNSIKA
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
            {errorMsg && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            {successMsg && !showOtpModal && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <p className="text-sm text-green-700 font-medium">
                  {successMsg}
                </p>
              </div>
            )}

            <div className="mb-6 flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setErrorMsg('Gagal menarik data dari Google.')}
                text="signup_with"
                shape="rectangular"
              />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-500 font-medium">
                  Atau isi form secara manual
                </span>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  Nama Lengkap Sesuai KTM
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="nim_nidn"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    NIM *
                  </label>
                  <input
                    id="nim_nidn"
                    type="text"
                    required
                    value={formData.nim_nidn}
                    onChange={(e) =>
                      handleNumberInput('nim_nidn', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]"
                    placeholder="Contoh: 2210631170001"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prodi"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Program Studi / Jurusan
                  </label>
                  <select
                    id="prodi"
                    required
                    value={formData.prodi}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#1e3a8a]"
                  >
                    <option value="S1 Informatika">S1 Informatika</option>
                    <option value="S1 Sistem Informasi">
                      S1 Sistem Informasi
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Nomor WhatsApp Aktif
                  </label>
                  <input
                    id="phone"
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleNumberInput('phone', e.target.value)}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700 mb-1"
                >
                  Alamat Email Institusi (@student.unsika.ac.id)
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a]"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-bold text-gray-700 mb-1"
                  >
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a]"
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 transition-colors outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Memproses Registrasi...' : 'Daftar Sekarang'}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm border-t pt-6 border-gray-100">
              <span className="text-gray-600">Sudah punya akun? </span>
              <Link
                href="/login"
                className="font-bold text-[#1e3a8a] hover:text-blue-800 transition-colors"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showOtpModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center z-10"
              >
                <div className="w-16 h-16 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-5">
                  ✉️
                </div>

                <h3 className="text-2xl font-black text-gray-900 mb-2">
                  Validasi Otentikasi
                </h3>

                <p className="text-sm text-gray-500 mb-6">
                  Masukkan kode verifikasi 6 digit untuk email{' '}
                  <strong className="text-gray-900">{formData.email}</strong>
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/[^0-9]/g, ''))
                  }
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[0.7em] font-black px-4 py-4 border-2 border-gray-200 rounded-xl focus:border-[#1e3a8a] focus:ring-0 text-gray-900 mb-6 outline-none transition-colors"
                />

                <button
                  onClick={handleVerifyOtp}
                  disabled={isVerifying || otpCode.length < 6}
                  className="w-full py-3.5 bg-[#1e3a8a] text-white font-bold rounded-xl disabled:opacity-50 transition-colors shadow-md hover:bg-blue-900"
                >
                  {isVerifying ? 'Memproses Validasi...' : 'Konfirmasi Token'}
                </button>

                <button
                  onClick={() => setShowOtpModal(false)}
                  className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Tutup
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </GoogleOAuthProvider>
  );
}