"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LowonganPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Array untuk Filter Ceklis
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPaid, setSelectedPaid] = useState<string[]>([]);
  const [selectedKonversi, setSelectedKonversi] = useState<string[]>([]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('/api/lowongan');
        if (res.ok) {
          const data = await res.json();
          // Hanya tampilkan yang berstatus Aktif
          const activeJobs = data.data.filter((job: any) => job.status === 'Aktif');
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("Gagal mengambil data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const categories = Array.from(new Set(jobs.map(job => job.kategori)));

  const handleCheck = (stateArray: string[], setState: any, value: string) => {
    if (stateArray.includes(value)) {
      setState(stateArray.filter(item => item !== value)); // Uncheck
    } else {
      setState([...stateArray, value]); // Check
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setSelectedPaid([]);
    setSelectedKonversi([]);
    setSearchTerm('');
  };

  // LOGIKA FILTER YANG SUDAH DIPERBAIKI
  const filteredJobs = jobs.filter(job => {
    const matchCat = selectedCategories.length === 0 || selectedCategories.includes(job.kategori);
    const matchType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    
    // FIX: Konversi nilai boolean dari database MySQL ke String "Ya"/"Tidak"
    const isPaidValue = (job.isPaid === true || job.isPaid === 'Ya' || job.isPaid === 1) ? 'Ya' : 'Tidak';
    const matchPaid = selectedPaid.length === 0 || selectedPaid.includes(isPaidValue);
    
    const matchKonversi = selectedKonversi.length === 0 || selectedKonversi.includes(job.tipeKonversi);
    
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = job.title.toLowerCase().includes(searchLower) || job.company.toLowerCase().includes(searchLower);
    
    return matchCat && matchType && matchPaid && matchKonversi && matchSearch;
  });

  // Komponen Checkbox Kustom yang sudah bisa di-klik
  const CheckboxItem = ({ label, value, state, setState }: { label: string, value: string, state: string[], setState: any }) => {
    const isChecked = state.includes(value);
    return (
      <label className="flex items-center gap-3 cursor-pointer group mb-3">
        <input 
          type="checkbox" 
          className="hidden" 
          checked={isChecked} 
          onChange={() => handleCheck(state, setState, value)} 
        />
        <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-all ${isChecked ? 'bg-[#1e3a8a] border-[#1e3a8a]' : 'bg-white border-gray-300 group-hover:border-[#1e3a8a]'}`}>
          <svg className={`w-3.5 h-3.5 text-white transition-transform ${isChecked ? 'scale-100' : 'scale-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
        </div>
        <span className={`text-sm font-medium transition-colors ${isChecked ? 'text-gray-900 font-bold' : 'text-gray-600 group-hover:text-gray-900'}`}>{label}</span>
      </label>
    );
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const cardVariants = { hidden: { opacity: 0, y: 20, scale: 0.95 }, show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.4 } } };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      <section className="bg-[#1e3a8a] text-white pt-16 pb-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 mt-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Bursa Magang Fasilkom</h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto font-medium mb-10">Temukan posisi magang yang tepat. Gunakan filter di samping untuk menyesuaikan pencarianmu.</p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Cari nama lowongan atau perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl text-gray-900 bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/30 text-lg font-medium transition-all outline-none"
            />
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 -mt-10 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8">
          
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h3 className="font-black text-gray-900 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                  Filter Pencarian
                </h3>
                {(selectedCategories.length > 0 || selectedTypes.length > 0 || selectedPaid.length > 0 || selectedKonversi.length > 0) && (
                  <button onClick={resetFilters} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Reset</button>
                )}
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {categories.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Bidang / Kategori IT</p>
                    <div className="flex flex-col">
                      {categories.map((cat: any, idx) => (
                        <CheckboxItem key={idx} label={cat.replace(/💻|⚙️|📱|🎨|🔒|📊|☁️|🛠️/g, '').trim()} value={cat} state={selectedCategories} setState={setSelectedCategories} />
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sistem Kerja</p>
                  <div className="flex flex-col">
                    <CheckboxItem label="WFO (Onsite)" value="Onsite" state={selectedTypes} setState={setSelectedTypes} />
                    <CheckboxItem label="WFH (Remote)" value="Remote" state={selectedTypes} setState={setSelectedTypes} />
                    <CheckboxItem label="Hybrid" value="Hybrid" state={selectedTypes} setState={setSelectedTypes} />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Status Pendapatan</p>
                  <div className="flex flex-col">
                    <CheckboxItem label="Paid (Berbayar)" value="Ya" state={selectedPaid} setState={setSelectedPaid} />
                    <CheckboxItem label="Unpaid (Tidak Berbayar)" value="Tidak" state={selectedPaid} setState={setSelectedPaid} />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sistem Konversi SKS</p>
                  <div className="flex flex-col">
                    <CheckboxItem label="Full SKS (Max 20)" value="Full" state={selectedKonversi} setState={setSelectedKonversi} />
                    <CheckboxItem label="Parsial (Beberapa Matkul)" value="Parsial" state={selectedKonversi} setState={setSelectedKonversi} />
                    <CheckboxItem label="Tanpa Konversi (Reguler)" value="Tidak" state={selectedKonversi} setState={setSelectedKonversi} />
                  </div>
                </div>

              </div>
            </div>
          </aside>

          <div className="flex-1 mt-10 lg:mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="bg-white rounded-3xl p-6 h-80 animate-pulse border border-gray-100">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl mb-6"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-8"></div>
                    <div className="h-12 bg-gray-200 rounded-xl w-full mt-auto"></div>
                  </div>
                ))}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Lowongan Tidak Ditemukan</h3>
                <p className="text-gray-500 font-medium">Coba hapus beberapa centang di filter sebelah kiri untuk memperluas pencarianmu.</p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 font-bold mb-6">Menampilkan {filteredJobs.length} posisi magang yang sesuai</p>
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {filteredJobs.map((job) => {
                      // FIX: Pastikan Lencana / Tag Label juga dirender dengan benar
                      const isPaidReal = job.isPaid === true || job.isPaid === 'Ya' || job.isPaid === 1;
                      
                      return (
                        <motion.div key={job.id} variants={cardVariants} layout className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-2xl hover:border-[#1e3a8a]/20 transition-all duration-300 flex flex-col h-full group">
                          
                          <div className="p-6 md:p-8 flex-1 flex flex-col">
                            <div className="flex items-start gap-4 mb-6">
                              <div className="w-16 h-16 rounded-2xl border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform bg-white">
                                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&bold=true`} alt={job.company} className="w-full h-full object-cover" />
                              </div>
                              <div className="pt-1">
                                <h3 className="font-black text-xl text-gray-900 leading-tight mb-1 group-hover:text-[#1e3a8a] transition-colors">{job.title}</h3>
                                <p className="text-sm font-bold text-gray-500">{job.company}</p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-lg border border-blue-100 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                {job.type}
                              </span>
                              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 ${isPaidReal ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                {isPaidReal ? '💵 Paid' : '🚫 Unpaid'}
                              </span>
                              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border flex items-center gap-1 ${job.tipeKonversi === 'Full' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : job.tipeKonversi === 'Parsial' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                {job.tipeKonversi === 'Full' ? '🎓 Full SKS' : job.tipeKonversi === 'Parsial' ? '⚠️ Parsial' : '❌ No Konversi'}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-auto whitespace-pre-wrap">
                              {job.description || job.deskripsi}
                            </p>
                          </div>

                          <div className="px-6 md:px-8 py-5 bg-gray-50/80 border-t border-gray-50 flex items-center justify-between mt-auto rounded-b-3xl">
                            <div className="text-xs font-bold text-gray-500">
                              {job.valid_until ? (
                                <span>Batas: <span className="text-red-500">{new Date(job.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span></span>
                              ) : (
                                <span className="text-green-600">Selalu Buka</span>
                              )}
                            </div>
                            
                            <a href={job.link_pendaftaran} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-xl shadow-sm hover:bg-[#1e3a8a] hover:text-white transition-all text-sm flex items-center gap-2">
                              Daftar
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                            </a>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}