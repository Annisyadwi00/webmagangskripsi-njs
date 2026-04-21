"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk menyimpan data user yang login
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mengecek apakah ada user yang sedang login
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.data);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, [pathname]); // Refresh tiap kali pindah halaman

  // Sembunyikan Navbar di halaman Auth dan Dashboard
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dosen') || 
    pathname === '/login' || 
    pathname === '/register'
  ) {
    return null;
  }

  const handleLogout = async () => {
    const isConfirm = window.confirm("Apakah Anda yakin ingin keluar dari sistem?");
    if (!isConfirm) return;
    
    // FIX: URL Logout yang benar
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <nav suppressHydrationWarning className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo SI Magang */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-2.5 rounded-xl shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="font-black text-xl tracking-tight text-gray-900 group-hover:text-[#1e3a8a] transition-colors">SI Magang</span>
            </Link>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#1e3a8a] transition-colors">Beranda</Link>
              <Link href="/lowongan" className="text-sm font-bold text-gray-500 hover:text-[#1e3a8a] transition-colors">Bursa Magang</Link>
              
              <div className="h-6 w-px bg-gray-200 mx-2"></div>

              {isLoading ? (
                <div className="h-10 w-32 bg-gray-100 animate-pulse rounded-xl"></div>
              ) : user ? (
                <AnimatePresence>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1e3a8a] to-blue-500 text-white flex items-center justify-center font-black text-xs shadow-inner">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="flex flex-col text-left pr-3">
                        <span className="text-sm font-bold text-gray-900 leading-tight truncate max-w-[120px]">{user.name}</span>
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{user.role}</span>
                      </div>
                    </div>
                    <Link href={user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Dosen' ? '/dosen/dashboard' : '/dashboard'} className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm" title="Keluar">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                  </motion.div>
                </AnimatePresence>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="px-6 py-2.5 text-sm font-bold text-[#1e3a8a] bg-blue-50/50 hover:bg-blue-100 rounded-xl transition-colors">Masuk</Link>
                  <Link href="/register" className="px-6 py-2.5 text-sm font-bold text-white bg-[#1e3a8a] rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">Daftar Sekarang</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}