"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoSikarir from '@/components/LogoSikarir';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { apiClient } from '@/lib/api-client';
type LoginData = {
  role: 'Admin' | 'Mahasiswa' | 'Dosen';
  name: string;
  prodi?: string | null;
};
type LoginResponse = {
  success: boolean;
  message: string;
  data?: {
    role?: 'Admin' | 'Mahasiswa' | 'Dosen';
    name?: string;
    prodi?: string;
  };
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
        email: identifier.trim(),
        password,
      },
    });

    const role = result.data?.role;

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
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Terjadi kesalahan saat login.';

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

    const role = result.data?.role;

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
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : 'Terjadi kesalahan saat login Google.';

    setErrorMsg(message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com">
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center mb-4 scale-90">
            <LogoSikarir />
          </div>

          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Selamat Datang Kembali
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke Sistem Informasi Magang Fasilkom UNSIKA
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
            {errorMsg && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-gray-700"
                >
                  Email
                </label>

                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukkan email"
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-bold text-gray-700"
                >
                  Password
                </label>

                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="appearance-none block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a] transition-colors"
                    aria-label={
                      showPassword ? 'Sembunyikan password' : 'Tampilkan password'
                    }
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900 font-medium"
                  >
                    Ingat saya
                  </label>
                </div>

                <div className="text-sm">
                  <a
                    href="#"
                    className="font-bold text-[#1e3a8a] hover:text-blue-800"
                  >
                    Lupa password?
                  </a>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-[#1e3a8a] to-blue-700 hover:from-blue-800 hover:to-blue-900 focus:outline-none transition-all hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>

                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500 font-medium">
                    Atau masuk menggunakan
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    setErrorMsg('Login via Google dibatalkan atau gagal.')
                  }
                  useOneTap
                />
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-600">Belum punya akun? </span>
              <Link
                href="/register"
                className="font-bold text-[#1e3a8a] hover:text-blue-800"
              >
                Daftar sekarang
              </Link>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}