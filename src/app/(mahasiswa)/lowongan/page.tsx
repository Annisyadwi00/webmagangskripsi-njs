"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Filter & Pencarian
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [filterKonversi, setFilterKonversi] = useState('Semua');
  const [filterLokasi, setFilterLokasi] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/lowongan');
        const json = await res.json();
        if (res.ok) setJobs(json.data);
      } catch (error) {
        console.error('Error fetching jobs', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  // Logika Filter Berlapis
  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) || job.company.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'Semua' || job.type === filterType;
    const matchKonversi = filterKonversi === 'Semua' || 
                          (filterKonversi === 'Ya' ? job.isKonversi === true : job.isKonversi === false);
    const matchLokasi = filterLokasi === '' || job.location.toLowerCase().includes(filterLokasi.toLowerCase());
    
    return matchSearch && matchType && matchKonversi && matchLokasi;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Elegan */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Bursa Magang</h1>
          <p className="text-gray-500 mt-2 text-lg">Temukan lowongan magang terbaik untuk mengasah keahlianmu.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR FILTER (Profesional Look) */}
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-28">
              <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter Pencarian
              </h3>
              
              {/* Filter Lokasi */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lokasi / Daerah</label>
                <input 
                  type="text" 
                  placeholder="Cari Kota (cth: Jakarta)" 
                  value={filterLokasi} 
                  onChange={(e) => setFilterLokasi(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1e3a8a] outline-none transition-all"
                />
              </div>

              {/* Filter Sistem Kerja */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Sistem Kerja</label>
                <div className="space-y-2">
                  {['Semua', 'Onsite', 'Remote', 'Hybrid'].map(type => (
                    <label key={type} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input type="radio" name="tipe" checked={filterType === type} onChange={() => setFilterType(type)} className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-full checked:border-[#1e3a8a] transition-all cursor-pointer" />
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#1e3a8a] scale-0 peer-checked:scale-100 transition-transform"></div>
                      </div>
                      <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Konversi */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Konversi 20 SKS</label>
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  {['Semua', 'Ya', 'Tidak'].map(val => (
                    <button 
                      key={val} 
                      onClick={() => setFilterKonversi(val)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${filterKonversi === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT (Search Bar + Grid Lowongan) */}
          <div className="flex-1">
            
            {/* Search Bar Besar */}
            <div className="relative mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text" 
                placeholder="Ketik nama posisi atau perusahaan..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm text-gray-900 font-medium focus:ring-2 focus:ring-[#1e3a8a] focus:border-[#1e3a8a] outline-none transition-all"
              />
            </div>

            {/* Grid Kartu Lowongan */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-[#1e3a8a]"></div>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                <p className="text-gray-500 font-bold text-lg">Waduh, tidak ada lowongan yang sesuai filter 😭</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    key={job.id} 
                    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-2xl flex items-center justify-center font-black text-xl shrink-0">
                        {job.company.charAt(0)}
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${job.isKonversi ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {job.isKonversi ? '✔ Konversi' : 'Reguler'}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-black text-gray-900 mb-1 group-hover:text-[#1e3a8a] transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-gray-600 font-medium text-sm mb-4 line-clamp-1">{job.company}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-md text-xs font-bold">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Sisa Kuota: {job.kuota}
                      </span>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100">
                      {/* Tombol yang mengarah ke form pendaftaran dengan mengirim nama perusahaan & posisi via Query String */}
                      <Link href={`/pendaftaran?perusahaan=${encodeURIComponent(job.company)}&posisi=${encodeURIComponent(job.title)}&jenis=${job.isKonversi ? 'Konversi' : 'Non-Konversi'}`} className="block w-full py-3 bg-[#1e3a8a] text-white text-center font-bold rounded-xl hover:bg-blue-900 transition-colors">
                        Daftar Posisi Ini
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}