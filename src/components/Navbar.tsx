"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  const [user, setUser] = useState<{name: string, role: string, photo: string} | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = (await res.json()).data;
          setUser({ name: data.name, role: data.role, photo: data.photo });
        }
      } catch (error) {}
    };
    fetchUser();
  }, [pathname]);

  // Sembunyikan Navbar di halaman Dashboard & Settings
  if (pathname && (pathname.includes('/dashboard') || pathname.includes('/settings'))) {
    return null;
  }

  // ---> FITUR BARU: Deteksi Halaman Background Gelap <---
  const isDarkHero = pathname === '/lowongan' || pathname === '/mitra';

  // Fungsi untuk mengubah warna teks menu secara dinamis
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    if (isScrolled) {
      return isActive ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-[#1e3a8a]';
    } else {
      if (isDarkHero) {
        return isActive ? 'text-white drop-shadow-md' : 'text-blue-200 hover:text-white drop-shadow-sm';
      } else {
        return isActive ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-[#1e3a8a]';
      }
    }
  };

  const logoTextColor = isScrolled ? 'text-gray-900' : (isDarkHero ? 'text-white drop-shadow-md' : 'text-[#1e3a8a]');
  
  // Tombol login juga diubah agar kontrasnya bagus
  const loginBtnClass = isScrolled || !isDarkHero 
    ? 'bg-[#1e3a8a] text-white shadow-blue-900/20 hover:bg-blue-900' 
    : 'bg-white text-[#1e3a8a] shadow-black/10 hover:bg-blue-50';

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center relative">
        
        {/* KIRI: Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all group-hover:-translate-y-0.5 ${isScrolled || !isDarkHero ? 'bg-gradient-to-br from-[#1e3a8a] to-blue-500 group-hover:shadow-blue-500/30' : 'bg-white text-[#1e3a8a]'}`}>
            <span className={`font-black text-xl ${isScrolled || !isDarkHero ? 'text-white' : 'text-[#1e3a8a]'}`}>S</span>
          </div>
          <span className={`font-extrabold text-xl tracking-tight hidden sm:block transition-colors ${logoTextColor}`}>
            SI Magang
          </span>
        </Link>

        {/* TENGAH ABSOLUTE: Menu Navigasi */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/lowongan" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${getLinkClass('/lowongan')}`}>Bursa Magang</Link>
          <Link href="/mitra" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${getLinkClass('/mitra')}`}>Kemitraan Industri</Link>
          <Link href="/#faq" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${getLinkClass('/#faq')}`}>Pusat Bantuan</Link>
        </div>

        {/* KANAN: Akun / Login */}
        <div className="flex items-center shrink-0">
          {user ? (
            <div className={`flex items-center gap-4 px-2 py-1.5 rounded-full border backdrop-blur-sm shadow-sm hover:shadow-md transition-all ${isScrolled ? 'bg-white/60 border-gray-200/60' : (isDarkHero ? 'bg-black/20 border-white/10' : 'bg-white/60 border-gray-200/60')}`}>
              <div className="text-right hidden md:block pl-3">
                <p className={`text-sm font-black leading-none ${isScrolled || !isDarkHero ? 'text-gray-900' : 'text-white'}`}>{user.name.split(" ")[0]}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isScrolled || !isDarkHero ? 'text-blue-600' : 'text-blue-300'}`}>{user.role}</p>
              </div>
              
              <Link href={user.role === 'Admin' ? '/admin/dashboard' : user.role === 'Dosen' ? '/dosen/dashboard' : '/dashboard'} 
                    className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-white font-black hover:scale-105 transition-transform overflow-hidden group relative">
                {user.photo ? (
                  <img src={user.photo} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 group-hover:text-[#1e3a8a]">{user.name.charAt(0).toUpperCase()}</span>
                )}
              </Link>
            </div>
          ) : (
            <Link href="/login" className={`px-6 py-2.5 font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ${loginBtnClass}`}>
              Masuk
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
}