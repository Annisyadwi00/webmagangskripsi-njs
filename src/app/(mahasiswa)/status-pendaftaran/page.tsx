"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StatusPendaftaranPage() {
  // Variasi animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
      {/* SIDEBAR (Disederhanakan untuk preview, idealnya pakai layout.tsx yang sama dengan Dashboard) */}
      <aside className="w-64 bg-[#1e3a8a] text-white flex flex-col hidden md:flex">
        <div className="p-6 border-b border-blue-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5V14M5.4 17.5l-3.4-1.9M18.6 17.5l3.4-1.9" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">UNSIKA</h1>
              <p className="text-xs text-blue-200">Sistem Informasi Magang</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden border-2 border-white/20">
              <svg className="w-full h-full text-gray-500 bg-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div>
              <h2 className="font-semibold text-sm">Ahmad Fauzi</h2>
              <span className="inline-block px-2 py-0.5 mt-0.5 bg-blue-800 text-xs rounded-full">Mahasiswa</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </Link>
          <Link href="#" className="flex items-center gap-3 px-3 py-2.5 bg-white text-[#1e3a8a] rounded-lg font-medium shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Status Pendaftaran
          </Link>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Status Pendaftaran Magang</h2>
            <p className="text-sm text-gray-500 mt-1">Pantau proses pendaftaran magang Anda di sini</p>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            
            {/* Kolom Kiri: Status & Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Alert Status */}
              <motion.div variants={itemVariants} className="bg-orange-50 border border-orange-200 rounded-xl p-6 flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-full text-orange-600 flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-orange-800">Pendaftaran Sedang Diproses</h3>
                  <p className="mt-1 text-sm text-orange-700">Admin sedang mereview pendaftaran magang Anda. Proses review biasanya memakan waktu 1-3 hari kerja.</p>
                  <p className="mt-2 text-sm text-orange-700 font-medium">Anda akan menerima notifikasi melalui email setelah admin memberikan keputusan.</p>
                </div>
              </motion.div>

              {/* Timeline Card */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Timeline Proses
                </h3>
                
                <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4">
                  {/* Step 1: Diterima */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                    <h4 className="font-semibold text-gray-900">Pendaftaran Diterima</h4>
                    <p className="text-sm text-gray-500 mt-1">2026-04-10 (1 hari yang lalu)</p>
                  </div>

                  {/* Step 2: Review (Current) */}
                  <div className="relative pl-8">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-orange-400 ring-4 ring-orange-50 animate-pulse"></div>
                    <h4 className="font-bold text-[#1e3a8a]">Review Admin</h4>
                    <p className="text-sm text-orange-600 font-medium mt-1">Sedang diproses...</p>
                  </div>

                  {/* Step 3: Dosen */}
                  <div className="relative pl-8 opacity-50">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 border-2 border-white"></div>
                    <h4 className="font-medium text-gray-600">Pilih Dosen Pembimbing</h4>
                    <p className="text-sm text-gray-500 mt-1">Menunggu approval admin</p>
                  </div>

                  {/* Step 4: Mulai */}
                  <div className="relative pl-8 opacity-50">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gray-300 border-2 border-white"></div>
                    <h4 className="font-medium text-gray-600">Mulai Magang</h4>
                    <p className="text-sm text-gray-500 mt-1">Setelah dosen disetujui</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Kolom Kanan: Detail & Kontak */}
            <div className="space-y-6">
              
              {/* Detail Pendaftaran */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Detail Pendaftaran</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Perusahaan</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">PT Digital Teknologi Indonesia</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Posisi</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">Full Stack Developer Intern</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Lokasi</dt>
                      <dd className="mt-1 text-sm text-gray-900">Jakarta Selatan</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Durasi</dt>
                      <dd className="mt-1 text-sm text-gray-900">6 bulan</dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-gray-500">Periode Magang</dt>
                    <dd className="mt-1 text-sm text-gray-900">2026-05-01 s/d 2026-10-31</dd>
                  </div>
                  <div className="pt-2 border-t border-gray-50">
                    <dt className="text-xs font-medium text-gray-500 mb-2">Jenis Magang</dt>
                    <dd>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-[#1e3a8a] border border-blue-100">
                        Konversi SKS
                      </span>
                    </dd>
                  </div>
                </dl>

                {/* Info Konversi SKS */}
                <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <h4 className="text-xs font-semibold text-gray-700 mb-2">Mata Kuliah untuk Konversi (7 SKS)</h4>
                  <ul className="text-xs text-gray-600 space-y-1.5">
                    <li className="flex justify-between">
                      <span>TIF401 Kerja Praktek</span>
                      <span className="font-medium">4 SKS</span>
                    </li>
                    <li className="flex justify-between">
                      <span>TIF402 Proyek Perangkat Lunak</span>
                      <span className="font-medium">3 SKS</span>
                    </li>
                  </ul>
                  <div className="mt-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">
                      Pending
                    </span>
                  </div>
                </div>

                {/* Dokumen */}
                <div className="mt-4 pt-4 border-t border-gray-50">
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Dokumen yang Diupload</h4>
                  <ul className="space-y-2">
                    {['Surat Penerimaan Magang', 'Surat Perjanjian/MoU', 'Proposal Magang'].map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-[#1e3a8a] hover:underline cursor-pointer">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Bantuan Card */}
              <motion.div variants={itemVariants} className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h3 className="font-bold text-[#1e3a8a] mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Butuh Bantuan?
                </h3>
                <p className="text-sm text-gray-600 mb-4">Jika ada pertanyaan seputar pendaftaran magang Anda, silakan hubungi:</p>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    admin.magang@fasilkom.unsika.ac.id
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    (0264) 123-4567
                  </li>
                  <li className="flex items-center gap-2 mt-2 pt-2 border-t border-blue-100">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Senin - Jumat, 08:00 - 16:00 WIB
                  </li>
                </ul>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}