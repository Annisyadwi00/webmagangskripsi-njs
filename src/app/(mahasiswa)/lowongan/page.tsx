"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Semua');

  // Mengambil data lowongan dari API (Database MySQL)
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/lowongan');
        const json = await res.json();
        if (res.ok) {
          setJobs(json.data);
        }
      } catch (error) {
        console.error('Gagal mengambil data lowongan:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Filter logika untuk pencarian dan kategori
  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'Semua' ? true : job.type === filterType;
    return matchSearch && matchType;
  });

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {/* HEADER NAVIGASI */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <h1 className="font-extrabold text-[#1e3a8a] text-lg">Bursa Magang</h1>
          </div>
          <Link href="/pendaftaran" className="text-sm font-bold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
            Daftar Magang Sekarang
          </Link>
        </div>
      </header>

      {/* HERO SECTION KECIL */}
      <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl font-black text-white mb-3">Temukan Tempat Magang Impianmu</h2>
          <p className="text-blue-200 text-lg">Eksplorasi puluhan mitra perusahaan yang bekerjasama dengan Fasilkom UNSIKA.</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-30px] relative z-20">
        
        {/* BAR PENCARIAN & FILTER */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="Cari posisi atau nama perusahaan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm transition-colors focus:bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            {['Semua', 'Onsite', 'Hybrid', 'Remote'].map(type => (
              <button 
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${filterType === type ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* DAFTAR KARTU LOWONGAN */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-[#1e3a8a] rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 font-medium">Memuat data lowongan...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Lowongan Tidak Ditemukan</h3>
            <p className="text-gray-500">Coba gunakan kata kunci lain atau ubah filter pencarian Anda.</p>
          </div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredJobs.map(job => (
                <motion.div key={job.id} variants={cardVariants} layout className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col overflow-hidden group">
                  <div className="p-6 flex-1 flex flex-col">
                    
                    {/* Header Card: Logo & Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center font-black text-gray-500 text-xl overflow-hidden group-hover:border-blue-300 transition-colors">
                        {job.company.charAt(0)}
                      </div>
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${job.isKonversi ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                        {job.isKonversi ? 'Bisa Konversi' : 'Non-Konversi'}
                      </span>
                    </div>

                    {/* Judul & Perusahaan */}
                    <h3 className="font-extrabold text-gray-900 text-lg leading-tight mb-1 group-hover:text-[#1e3a8a] transition-colors">{job.title}</h3>
                    <p className="text-sm font-semibold text-gray-600 mb-4">{job.company}</p>

                    {/* Tags (Lokasi & Tipe) */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-bold rounded-lg">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {job.type}
                      </span>
                    </div>

                    {/* Deskripsi Singkat */}
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-auto">
                      {job.description}
                    </p>
                  </div>

                  {/* Tombol Footer */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50/50 mt-auto">
                    <Link href="/pendaftaran" className="block w-full text-center py-2.5 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-xl hover:bg-[#1e3a8a] hover:text-white transition-colors text-sm">
                      Daftar Posisi Ini
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}