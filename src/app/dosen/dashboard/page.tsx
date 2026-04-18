"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Data Dummy Mahasiswa Bimbingan
const mockMahasiswa = [
  { id: 1, nama: "Eko Prasetyo", perusahaan: "PT Digital Teknologi", status: "Aktif", pendingLogbook: 3, role: "Web Developer", foto: "EP" },
  { id: 2, nama: "Dewi Lestari", perusahaan: "Bank Mandiri (Persero)", status: "Aktif", pendingLogbook: 0, role: "Data Analyst", foto: "DL" },
  { id: 3, nama: "Tom Kurmawan", perusahaan: "Telkom Indonesia", status: "Aktif", pendingLogbook: 1, role: "UI/UX Designer", foto: "TK" },
];

// Data Dummy Pengajuan Baru
const mockPengajuan = [
  { id: 101, nama: "Andi Saputra", perusahaan: "PT Astra Internasional", posisi: "Software Engineer", tanggal: "18 Apr 2026" },
];

export default function DosenDashboard() {
  const [activeTab, setActiveTab] = useState<'Tindakan' | 'Mahasiswa'>('Tindakan');

  // Menghitung total notifikasi
  const totalPendingLogbook = mockMahasiswa.reduce((acc, curr) => acc + curr.pendingLogbook, 0);
  const totalPengajuan = mockPengajuan.length;
  const totalNotifikasi = totalPendingLogbook + totalPengajuan;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-[#0f1f4d] text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="bg-white/10 p-2 rounded-lg">
            <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-wide">Ruang Dosen</h1>
            <p className="text-xs text-blue-300">SI Magang UNSIKA</p>
          </div>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <button className="w-full flex items-center justify-between px-4 py-3 bg-white/10 text-white rounded-xl font-bold border border-white/20 transition-all">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </div>
            {/* BADGE NOTIFIKASI DI SIDEBAR */}
            {totalNotifikasi > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {totalNotifikasi} NEW
              </span>
            )}
          </button>
          
          <Link href="/dosen/profil" className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Profil Saya
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10 mt-auto">
          {/* FIX: Menggunakan tag <a> agar hard refresh saat kembali ke home */}
          <a href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l-7-7m-7 7h18" /></svg>
            Kembali ke Home
          </a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Dashboard Dosen Pembimbing</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">Selamat datang, Dr. Budi Santoso, M.Kom</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1e3a8a] to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-100">
              BS
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
          
          {/* KARTU RINGKASAN TINDAKAN (PROAKTIF) */}
          {totalNotifikasi > 0 && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-900">Perhatian Diperlukan!</h3>
                  <p className="text-sm text-red-700 font-medium mt-0.5">
                    Ada <strong className="font-extrabold">{totalPendingLogbook} logbook harian</strong> belum divalidasi dan <strong className="font-extrabold">{totalPengajuan} pengajuan magang baru</strong> menunggu persetujuan Anda.
                  </p>
                </div>
              </div>
              <button onClick={() => setActiveTab('Tindakan')} className="px-5 py-2.5 bg-red-600 text-white text-sm font-bold rounded-xl shadow-md hover:bg-red-700 transition-colors">
                Lihat Detail
              </button>
            </motion.div>
          )}

          {/* TAB NAVIGASI */}
          <div className="flex gap-4 border-b border-gray-200">
            <button 
              onClick={() => setActiveTab('Tindakan')} 
              className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'Tindakan' ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Perlu Tindakan
              {totalNotifikasi > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{totalNotifikasi}</span>
              )}
              {activeTab === 'Tindakan' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e3a8a] rounded-t-md" />}
            </button>
            <button 
              onClick={() => setActiveTab('Mahasiswa')} 
              className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 transition-all relative ${activeTab === 'Mahasiswa' ? 'text-[#1e3a8a]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Mahasiswa Aktif & Penilaian
              {activeTab === 'Mahasiswa' && <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e3a8a] rounded-t-md" />}
            </button>
          </div>

          {/* KONTEN TAB */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* TAB TINDAKAN (LOGBOOK & PENGAJUAN) */}
              {activeTab === 'Tindakan' && (
                <motion.div key="tindakan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-0">
                  
                  <div className="p-6 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-extrabold text-gray-900">Validasi Logbook Harian</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {mockMahasiswa.filter(m => m.pendingLogbook > 0).length === 0 ? (
                      <p className="p-8 text-center text-gray-500 font-medium">Semua logbook sudah divalidasi. Luar biasa! 🎉</p>
                    ) : (
                      mockMahasiswa.filter(m => m.pendingLogbook > 0).map(mhs => (
                        <div key={mhs.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">{mhs.foto}</div>
                            <div>
                              <h4 className="font-bold text-gray-900">{mhs.nama}</h4>
                              <p className="text-xs text-gray-500 font-medium">{mhs.perusahaan} • {mhs.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border border-orange-200">
                              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                              {mhs.pendingLogbook} Menunggu Validasi
                            </span>
                            <button className="px-4 py-2 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] text-sm font-bold rounded-xl hover:bg-[#1e3a8a] hover:text-white transition-colors">
                              Cek Logbook
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-slate-50 border-y border-gray-100 flex justify-between items-center mt-4">
                    <h3 className="font-extrabold text-gray-900">Pengajuan Bimbingan Baru</h3>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {mockPengajuan.length === 0 ? (
                      <p className="p-8 text-center text-gray-500 font-medium">Tidak ada pengajuan bimbingan baru saat ini.</p>
                    ) : (
                      mockPengajuan.map(pengajuan => (
                        <div key={pengajuan.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div>
                            <h4 className="font-bold text-gray-900">{pengajuan.nama}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-1">Mengajukan pada: {pengajuan.tanggal}</p>
                            <p className="text-sm font-medium text-[#1e3a8a] mt-1">{pengajuan.perusahaan} — {pengajuan.posisi}</p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 text-sm font-bold rounded-xl hover:bg-green-100 transition-colors">
                              Terima
                            </button>
                            <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
                              Tolak
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                </motion.div>
              )}

              {/* TAB MAHASISWA AKTIF */}
              {activeTab === 'Mahasiswa' && (
                <motion.div key="mahasiswa" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                        <th className="p-5">Mahasiswa</th>
                        <th className="p-5">Tempat Magang</th>
                        <th className="p-5">Status Logbook</th>
                        <th className="p-5 text-center">Aksi Laporan Akhir</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {mockMahasiswa.map((mhs) => (
                        <tr key={mhs.id} className="hover:bg-slate-50">
                          <td className="p-5 flex items-center gap-3">
                             <div className="w-10 h-10 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm">{mhs.foto}</div>
                             <div>
                               <p className="font-bold text-gray-900">{mhs.nama}</p>
                               <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold mt-1 inline-block">Aktif Magang</span>
                             </div>
                          </td>
                          <td className="p-5">
                            <p className="font-bold text-gray-800">{mhs.perusahaan}</p>
                            <p className="text-xs text-gray-500">{mhs.role}</p>
                          </td>
                          <td className="p-5">
                            {mhs.pendingLogbook > 0 ? (
                              <span className="text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded border border-orange-100">{mhs.pendingLogbook} Menunggu Validasi</span>
                            ) : (
                              <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded border border-green-100">Up to date</span>
                            )}
                          </td>
                          <td className="p-5 text-center">
                            <button className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200 transition-colors text-xs">
                              Input Nilai Akhir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </main>
    </div>
  );
}