"use client";

import { useState } from 'react';
import Link from 'next/link';
// FIX: Import 'Variants' dihapus agar TypeScript tidak protes
import { motion, AnimatePresence } from 'framer-motion';

// Data dummy Dosen sesuai dengan PDF
const dosenList = [
  {
    id: 1,
    name: "Dr. Budi Santoso, M.Kom",
    nip: "197801012005011001",
    rating: 4.8,
    studentsCount: 7,
    email: "budi.santoso@ft.unsika.ac.id",
    tags: ["Web Development", "Software Engineering", "Database"],
    slotsUsed: 7,
    slotsTotal: 10,
    isRecommended: true,
  },
  {
    id: 2,
    name: "Prof. Siti Nurhaliza, M.T.",
    nip: "198205102008012002",
    rating: 4.9,
    studentsCount: 15,
    email: "siti.nurhaliza@ft.unsika.ac.id",
    tags: ["Mobile Development", "UI/UX Design", "Web Development"],
    slotsUsed: 5,
    slotsTotal: 10,
    isRecommended: true,
  },
  {
    id: 3,
    name: "Drs. Ahmad Fauzi, M.Kom",
    nip: "197512152003121001",
    rating: 4.7,
    studentsCount: 6,
    email: "ahmad.fauzi@ft.unsika.ac.id",
    tags: ["Data Science", "Machine Learning", "Python"],
    slotsUsed: 6,
    slotsTotal: 8,
    isRecommended: false,
  },
  {
    id: 4,
    name: "Dr. Rina Wijaya, S.Kom., M.T.",
    nip: "198608202012012003",
    rating: 4.6,
    studentsCount: 6,
    email: "rina.wijaya@ft.unsika.ac.id",
    tags: ["Cyber Security", "Network", "Database"],
    slotsUsed: 10,
    slotsTotal: 10,
    isRecommended: false,
  },
  {
    id: 5,
    name: "Ir. Hendra Gunawan, M.Sc.",
    nip: "197903152005011002",
    rating: 4.5,
    studentsCount: 8,
    email: "hendra.gunawan@ft.unsika.ac.id",
    tags: ["Cloud Computing", "DevOps", "Linux"],
    slotsUsed: 8,
    slotsTotal: 8,
    isRecommended: false,
  }
];

export default function PilihDosenPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDosen = dosenList.filter(dosen => 
    dosen.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    dosen.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // FIX: Definisi animasi dibiarkan polos agar dibaca otomatis tanpa error
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      
      {/* HEADER COZY */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/status-pendaftaran" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors group">
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Link>
          <div className="w-px h-6 bg-gray-200"></div>
          <div>
            <h1 className="font-bold text-gray-900 text-lg">Pilih Dosen Pembimbing</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Pilih Dosen Pembimbing</h2>
          <p className="text-gray-500 text-lg">Pilih dosen pembimbing yang sesuai dengan bidang magang Anda.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: INFO MAGANG & FILTER */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            
            {/* Info Magang Panel */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              {/* Ornamen Background */}
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/20">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm border border-white/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="font-bold text-lg">Informasi Magang Anda</h3>
              </div>

              <div className="space-y-5 relative z-10">
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Perusahaan</p>
                  <p className="font-bold text-lg leading-tight">PT Digital Teknologi Indonesia</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Posisi</p>
                  <p className="font-bold text-lg leading-tight">Web Developer Intern</p>
                </div>
                <div className="pt-2">
                  <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-2">Bidang Terkait</p>
                  <span className="inline-flex items-center px-3 py-1 bg-white text-[#1e3a8a] text-xs font-bold rounded-lg shadow-sm">
                    Web Development
                  </span>
                </div>
              </div>
            </div>

            {/* Pencarian */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-3">Cari Dosen</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                  type="text"
                  placeholder="Cari nama atau keahlian..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-[#1e3a8a] focus:border-[#1e3a8a] text-sm bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>
          </motion.div>

          {/* KOLOM KANAN: LIST DOSEN */}
          <div className="lg:col-span-2">
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {filteredDosen.map((dosen) => {
                const isFull = dosen.slotsUsed >= dosen.slotsTotal;

                return (
                  <motion.div key={dosen.id} variants={cardVariants} whileHover={{ y: -5 }} className={`relative bg-white rounded-2xl border transition-all flex flex-col h-full overflow-hidden ${isFull ? 'border-gray-200 opacity-80' : 'border-gray-200 hover:border-blue-300 hover:shadow-lg'}`}>
                    
                    {/* Badge Rekomendasi / Penuh */}
                    {dosen.isRecommended && !isFull && (
                      <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl z-10 flex items-center gap-1 shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        Rekomendasi
                      </div>
                    )}
                    {isFull && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-bl-xl z-10 shadow-sm">
                        Penuh
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.name)}&background=1e3a8a&color=fff`} alt={dosen.name} className="w-full h-full object-cover" />
                        </div>
                        {/* Nama & Rating */}
                        <div className="pt-1 flex-1">
                          <h4 className="font-bold text-gray-900 leading-tight mb-1 pr-6">{dosen.name}</h4>
                          <p className="text-[11px] text-gray-500 font-medium mb-2">NIP: {dosen.nip}</p>
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">
                              <svg className="w-3.5 h-3.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                              {dosen.rating}
                            </div>
                            <span className="text-[11px] text-gray-500">({dosen.studentsCount} mhs)</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Kontak & Tags */}
                      <div className="space-y-4 mb-auto">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                          <span className="truncate">{dosen.email}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dosen.tags.map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-semibold rounded-md border border-gray-200">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Footer Card (Slot & Tombol) */}
                    <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 mt-auto">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-700">Slot Tersedia</span>
                        <span className={`text-xs font-bold ${isFull ? 'text-red-600' : 'text-[#1e3a8a]'}`}>
                          {dosen.slotsTotal - dosen.slotsUsed} / {dosen.slotsTotal}
                        </span>
                      </div>
                      
                      {/* Progress Bar Slot */}
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                        <div className={`h-1.5 rounded-full ${isFull ? 'bg-red-500' : 'bg-[#1e3a8a]'}`} style={{ width: `${(dosen.slotsUsed / dosen.slotsTotal) * 100}%` }}></div>
                      </div>

                      <button 
                        disabled={isFull}
                        className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm
                          ${isFull 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' 
                            : 'bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white'
                          }`}
                      >
                        {isFull ? (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                            Tidak Tersedia
                          </>
                        ) : (
                          'Pilih Dosen'
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}