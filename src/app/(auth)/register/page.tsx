"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RegisterPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState('Mahasiswa');

  const [formData, setFormData] = useState({
    name: '', identifier: '', email: '', phone: '', password: '', confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // State untuk fitur tampil/sembunyi password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State untuk Verifikasi Email (OTP)
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi Angka
    const numberOnlyRegex = /^[0-9]+$/;
    if (!numberOnlyRegex.test(formData.identifier) || !numberOnlyRegex.test(formData.phone)) {
      setErrorMsg('NIM/ID dan Nomor Telepon hanya boleh berisi angka!');
      return;
    }

    // Validasi Email
    if (!formData.email.endsWith('unsika.ac.id')) {
      setErrorMsg('Wajib menggunakan email resmi kampus (@...unsika.ac.id)!');
      return;
    }

    // Validasi Password
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[^+"{]+$/;
    if (!passwordRegex.test(formData.password)) {
      setErrorMsg('Password belum memenuhi syarat keamanan!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Password dan Konfirmasi Password tidak cocok!');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, identifier: formData.identifier, email: formData.email,
          phone: formData.phone, password: formData.password, role: activeRole
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan saat mendaftar.');

      // BUKAN DI-REDIRECT, TAPI MUNCULKAN POPUP OTP
      setShowOtpModal(true);
      setSuccessMsg('Pendaftaran awal sukses! Silakan cek email Anda untuk kode verifikasi.');

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi Simulasi Verifikasi OTP
  const handleVerifyOtp = async () => {
    setIsVerifying(true);
    
    // Simulasi loading 1.5 detik
    setTimeout(() => {
      setIsVerifying(false);
      if (otpCode.length === 6) {
        alert("Email berhasil diverifikasi! Mengalihkan ke halaman Login...");
        setShowOtpModal(false);
        router.push('/login');
      } else {
        alert("Kode OTP salah atau tidak lengkap!");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Buat Akun Baru</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Daftar untuk mengakses Sistem Informasi Magang</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-gray-100">
          
          {errorMsg && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
              <p className="text-sm text-red-700 font-medium">{errorMsg}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleRegister}>
             {/* Baris 1: Nama Lengkap */}
             <div>
              <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input id="name" type="text" required value={formData.name} onChange={handleChange} placeholder="Masukkan nama lengkap" className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
            </div>

            {/* Baris 2: NIM & No. Telepon */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="identifier" className="block text-sm font-bold text-gray-700 mb-1">NIM / ID</label>
                <input id="identifier" type="text" required value={formData.identifier} onChange={handleChange} placeholder="Contoh: 1957201001" className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-1">No. Telepon</label>
                <input id="phone" type="tel" required value={formData.phone} onChange={handleChange} placeholder="08xxxxxxxxxx" className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
              </div>
            </div>

            {/* Baris 3: Email Kampus */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">Email Kampus</label>
              <input id="email" type="email" required value={formData.email} onChange={handleChange} placeholder="email@student.unsika.ac.id" className="block w-full px-4 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
            </div>

            {/* Baris 4: Password dengan Tombol Mata */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    required minLength={8} 
                    value={formData.password} onChange={handleChange} 
                    placeholder="••••••••" 
                    className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a]">
                    {showPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    required minLength={8} 
                    value={formData.confirmPassword} onChange={handleChange} 
                    placeholder="Ulangi password" 
                    className="block w-full pl-4 pr-12 py-3 border border-gray-300 rounded-xl sm:text-sm bg-gray-50 focus:bg-white text-gray-900 transition-colors" 
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#1e3a8a]">
                    {showConfirmPassword ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={isLoading} className="w-full py-3.5 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 transition-colors">
                {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </div>
          </form>

          {/* Link Pindah ke Login */}
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Sudah punya akun? </span>
            <Link href="/login" className="font-bold text-[#1e3a8a] hover:text-blue-800 transition-colors">Masuk di sini</Link>
          </div>

        </div>
      </div>

      {/* POPUP MODAL VERIFIKASI OTP */}
      <AnimatePresence>
        {showOtpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center z-10">
              <div className="w-16 h-16 bg-blue-100 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Cek Email Anda</h3>
              <p className="text-sm text-gray-500 mb-6">Kami telah mengirimkan 6 digit kode verifikasi ke email <strong className="text-gray-900">{formData.email}</strong></p>
              
              <input 
                type="text" 
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Hanya angka
                placeholder="000000" 
                className="w-full text-center text-3xl tracking-[1em] font-black px-4 py-4 border-2 border-gray-300 rounded-xl focus:border-[#1e3a8a] focus:ring-0 text-gray-900 mb-6" 
              />
              
              <button 
                onClick={handleVerifyOtp} 
                disabled={isVerifying || otpCode.length < 6}
                className="w-full py-3.5 bg-[#1e3a8a] text-white font-bold rounded-xl disabled:opacity-50 transition-colors"
              >
                {isVerifying ? 'Memverifikasi...' : 'Verifikasi Akun'}
              </button>
              <button onClick={() => setShowOtpModal(false)} className="mt-4 text-sm font-bold text-gray-400 hover:text-gray-700">Tutup & Verifikasi Nanti</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}