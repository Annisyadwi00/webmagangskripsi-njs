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

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-between items-center relative">
        
        {/* KIRI: Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a8a] to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all group-hover:-translate-y-0.5">
            <span className="text-white font-black text-xl">S</span>
          </div>
          <span className={`font-extrabold text-xl tracking-tight hidden sm:block ${isScrolled ? 'text-gray-900' : 'text-[#1e3a8a]'}`}>
            SI Magang
          </span>
        </Link>

        {/* TENGAH ABSOLUTE: Menu Navigasi (Biar tidak terkesan kosong) */}
        <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          <Link href="/lowongan" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${pathname === '/lowongan' ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-[#1e3a8a]'}`}>Bursa Magang</Link>
          <Link href="/mitra" className={`text-sm font-bold transition-all hover:-translate-y-0.5 ${pathname === '/mitra' ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-[#1e3a8a]'}`}>Kemitraan Industri</Link>
          <Link href="/#faq" className="text-sm font-bold text-gray-500 hover:text-[#1e3a8a] transition-all hover:-translate-y-0.5">Pusat Bantuan</Link>
        </div>

        {/* KANAN: Akun / Login */}
        <div className="flex items-center shrink-0">
          {user ? (
            <div className="flex items-center gap-4 bg-white/60 px-2 py-1.5 rounded-full border border-gray-200/60 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
              <div className="text-right hidden md:block pl-3">
                <p className="text-sm font-black text-gray-900 leading-none">{user.name.split(" ")[0]}</p>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">{user.role}</p>
              </div>
              
              {/* Klik foto lari ke dashboard masing-masing */}
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
            <Link href="/login" className="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">
              Masuk
            </Link>
          )}
        </div>
        
      </div>
    </nav>
  );
}