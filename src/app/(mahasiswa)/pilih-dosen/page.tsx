"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function PilihDosenPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [dosenList, setDosenList] = useState<any[]>([]);
  const [magangInfo, setMagangInfo] = useState({ perusahaan: "Memuat...", posisi: "Memuat..." });
  
  // Custom Toast Notification State
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Data Dosen & Data Magang Mahasiswa saat halaman dimuat
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Ambil list Dosen dari Database
        const resDosen = await fetch('/api/dosen');
        if (resDosen.ok) setDosenList((await resDosen.json()).data);

        // 2. Ambil data Pengajuan Magang milik user ini
        const resMagang = await fetch('/api/Pengajuan');
        if (resMagang.ok) {
          const magang = (await resMagang.json()).data;
          if (magang) setMagangInfo({ perusahaan: magang.perusahaan, posisi: magang.posisi });
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      }
    };
    fetchInitialData();
  }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  // Fungsi saat tombol "Pilih Dosen" diklik
  const handlePilihDosen = async (dosenId: number, namaDosen: string) => {
    if (!confirm(`Yakin ingin memilih ${namaDosen} sebagai dosen pembimbing Anda?`)) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/Pengajuan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pilih_dosen',
          dosenId: dosenId,
          nama_dosen: namaDosen
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      showToast("Berhasil! Mengalihkan ke dashboard...", "success");
      
      // Tunggu animasi toast selesai, lalu lempar ke dashboard
      setTimeout(() => router.push('/dashboard'), 2000);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDosen = dosenList.filter(dosen => 
    dosen.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, scale: 0.95, y: 20 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16 relative">
      
      {/* CUSTOM TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-50">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.type === 'success' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <Link href="/dashboard" className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-full transition-colors group">
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="w-px h-6 bg-gray-200"></div>
          <h1 className="font-extrabold text-gray-900 text-lg">Pilih Dosen Pembimbing</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Temukan Pembimbing Magangmu</h2>
          <p className="text-gray-500 text-lg font-medium">Pilih dosen dari Fasilkom UNSIKA yang keahliannya sejalan dengan peran magang Anda saat ini.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6">
            
            {/* Kartu Info Magang Dinamis */}
            <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 rounded-3xl shadow-xl shadow-blue-900/10 p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/20 relative z-10">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h3 className="font-black text-lg">Informasi Magang</h3>
                  <p className="text-blue-200 text-xs">Target Penempatan</p>
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Perusahaan</p>
                  <p className="font-black text-xl leading-tight">{magangInfo.perusahaan}</p>
                </div>
                <div>
                  <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-1">Posisi / Role</p>
                  <p className="font-bold text-lg leading-tight">{magangInfo.posisi}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <label className="block text-sm font-black text-gray-800 mb-3">Cari Nama Dosen</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ketik nama dosen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-5 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent text-sm bg-gray-50 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
          </motion.div>

          {/* KOLOM KANAN (DAFTAR DOSEN) */}
          <div className="lg:col-span-2">
            {dosenList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 p-12 text-center">
                <svg className="w-16 h-16 text-gray-300 mb-4 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                <p className="text-gray-500 font-bold text-lg">Memuat data dosen...</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredDosen.map((dosen) => (
                  <motion.div key={dosen.id} variants={cardVariants} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 flex flex-col h-full overflow-hidden group">
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start gap-4 mb-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex-shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(dosen.name)}&background=1e3a8a&color=fff&bold=true`} alt={dosen.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="pt-1 flex-1">
                          <h4 className="font-black text-gray-900 leading-tight mb-1">{dosen.name}</h4>
                          <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg border border-gray-200">
                            NIDN: {dosen.nim_nidn || '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium mb-auto mt-2 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <span className="truncate">{dosen.email}</span>
                      </div>
                    </div>

                    <div className="px-6 py-5 bg-gray-50/50 mt-auto border-t border-gray-50">
                      <button 
                        onClick={() => handlePilihDosen(dosen.id, dosen.name)}
                        disabled={isSubmitting}
                        className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white hover:shadow-lg hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        Pilih Dosen Ini
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}