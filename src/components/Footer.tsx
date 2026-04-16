"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Logika Pintar: Sembunyikan Footer di halaman Auth dan Dashboard 
  // agar tidak bentrok dengan layout Sidebar Dosen/Admin/Mahasiswa
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dosen') || 
    pathname === '/login' || 
    pathname === '/register'
  ) {
    return null;
  }

  return (
    <footer className="bg-[#0f1f4d] text-gray-300 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Kolom 1: Branding */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/10 p-2.5 rounded-xl border border-white/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5V14M5.4 17.5l-3.4-1.9M18.6 17.5l3.4-1.9" /></svg>
            </div>
            <span className="font-black text-2xl text-white tracking-wide">SI Magang</span>
          </div>
          <p className="text-sm text-blue-200/70 leading-relaxed max-w-sm">
            Platform digital untuk pengelolaan magang mahasiswa Fakultas Ilmu Komputer, Universitas Singaperbangsa Karawang. Menghubungkan teori dengan praktik di dunia industri.
          </p>
        </div>
        
        {/* Kolom 2: Menu Cepat (Diperbaiki Link-nya) */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Menu Cepat</h4>
          <ul className="space-y-3 text-sm text-blue-200/80">
            <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Home</Link></li>
            <li><Link href="/#fitur" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Fitur & Cara Kerja</Link></li>
            <li><Link href="/#faq" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> FAQ</Link></li>
            <li><Link href="/lowongan" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Lowongan Magang</Link></li>
          </ul>
        </div>
        
        {/* Kolom 3: Kontak */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h4>
          <ul className="space-y-3 text-sm text-blue-200/80">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Fakultas Ilmu Komputer, Jl. HS. Ronggowaluyo, Karawang
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              fasilkom@unsika.ac.id
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-sm text-center text-blue-200/50">
        © 2026 Sistem Informasi Magang - Fasilkom UNSIKA. All rights reserved.
      </div>
    </footer>
  );
}