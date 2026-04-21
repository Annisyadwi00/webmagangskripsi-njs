"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // Sembunyikan Footer di halaman Auth dan Dashboard 
  if (
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dosen') || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname.startsWith('/pilih-dosen')
  ) {
    return null;
  }

  return (
    <footer className="bg-slate-950 text-gray-300 pt-20 pb-8 mt-auto relative overflow-hidden">
      {/* Efek Cahaya Latar Belakang */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-40 bg-blue-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
        
        {/* Kolom 1: Branding */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-2.5 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5V14M5.4 17.5l-3.4-1.9M18.6 17.5l3.4-1.9" /></svg>
            </div>
            <span className="font-black text-2xl text-white tracking-tight">SI Magang</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Platform digital terintegrasi untuk pengelolaan magang mahasiswa Fakultas Ilmu Komputer, Universitas Singaperbangsa Karawang.
          </p>
        </div>
        
        {/* Kolom 2: Menu Cepat */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Tautan Cepat</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Beranda Utama</Link></li>
            <li><Link href="/lowongan" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Bursa Magang Mitra</Link></li>
            <li><Link href="/login" className="hover:text-blue-400 transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Portal Login</Link></li>
          </ul>
        </div>
        
        {/* Kolom 3: Kontak */}
        <div>
          <h4 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <svg className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Fakultas Ilmu Komputer,<br />Jl. HS. Ronggowaluyo, Karawang Timur
            </li>
            <li className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
              <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              fasilkom@unsika.ac.id
            </li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500">
        <p>© {new Date().getFullYear()} Sistem Informasi Magang - Fasilkom UNSIKA.</p>
        <p>Dikembangkan untuk keperluan Skripsi / Tugas Akhir.</p>
      </div>
    </footer>
  );
}