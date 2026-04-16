"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoSikarir from '@/components/LogoSikarir';

export default function LoginPage() {
  const router = useRouter();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // State BARU untuk menampilkan/menyembunyikan password
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Gagal login, periksa kembali data Anda.');

      if (data.role === 'Mahasiswa') window.location.href = '/dashboard';
      else if (data.role === 'Dosen') window.location.href = '/dosen/dashboard';
      else if (data.role === 'Admin') window.location.href = '/admin/dashboard';

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center mb-4 scale-90">
          <LogoSikarir />
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">Selamat Datang Kembali</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Masuk ke Sistem Informasi Magang Fasilkom UNSIKA</p>
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
              <label htmlFor="email" className="block text-sm font-bold text-gray-700">Email / NIM / NIDN</label>
              <div className="mt-1 relative">
                <input
                  id="email" type="text" required
                  value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Masukkan email, NIM, atau NIDN"
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">Password</label>
              <div className="mt-1 relative">
                {/* Tipe input berubah dinamis berdasarkan state showPassword */}
                <input
                  id="password" type={showPassword ? "text" : "password"} required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-[#1e3a8a] focus:border-[#1e3a8a] sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors"
                />
                {/* Tombol Mata */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a] transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-gray-300 rounded" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">Ingat saya</label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-bold text-[#1e3a8a] hover:text-blue-800">Lupa password?</a>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-gradient-to-r from-[#1e3a8a] to-blue-700 hover:from-blue-800 hover:to-blue-900 focus:outline-none transition-all hover:-translate-y-0.5 disabled:opacity-70">
                {isLoading ? 'Memproses...' : 'Masuk Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Belum punya akun? </span>
            <Link href="/register" className="font-bold text-[#1e3a8a] hover:text-blue-800">Daftar sekarang</Link>
          </div>
        </div>
      </div>
    </div>
  );
}