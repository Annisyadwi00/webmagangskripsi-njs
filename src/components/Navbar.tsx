"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar({ user }: { user: any }) {
  const pathname = usePathname();
  const router = useRouter();

  // Sembunyikan Navbar di halaman Auth dan Dashboard (karena dashboard punya sidebar sendiri)
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
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Navbar Putih Solid + suppressHydrationWarning */}
      <nav suppressHydrationWarning className="fixed w-full top-0 z-50 bg-white border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            
            {/* Logo SI Magang */}
            <a href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-2.5 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900">SI Magang</span>
            </a>

            {/* Menu Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-sm font-bold text-gray-600 hover:text-[#1e3a8a] transition-colors">Beranda</Link>
              <Link href="/lowongan" className="text-sm font-bold text-gray-600 hover:text-[#1e3a8a] transition-colors">Bursa Magang</Link>
              <Link href="/#faq" className="text-sm font-bold text-gray-600 hover:text-[#1e3a8a] transition-colors">Panduan</Link>
              
              <div className="h-6 w-px bg-gray-300 mx-2"></div>

              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-bold text-gray-900">{user.name}</span>
                    <span className="text-xs font-medium text-[#1e3a8a]">{user.role}</span>
                  </div>
                  <Link href={user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Dosen' ? '/dosen/dashboard' : '/dashboard'} className="px-5 py-2.5 bg-[#1e3a8a] text-white text-sm font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all hover:-translate-y-0.5">
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Keluar">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link href="/login" className="px-5 py-2.5 text-sm font-bold text-[#1e3a8a] bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">Masuk</Link>
                  <Link href="/register" className="px-5 py-2.5 text-sm font-bold text-white bg-[#1e3a8a] rounded-xl shadow-md hover:bg-blue-900 transition-all hover:-translate-y-0.5">Daftar Sekarang</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* BALOK SPASI CERDAS: Mendorong Landing Page ke bawah tepat setinggi Navbar (80px) */}
      <div className="h-20"></div>
    </>
  );
}