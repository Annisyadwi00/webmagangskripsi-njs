"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function MitraPage() {
  const [showJobModal, setShowJobModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  
  const [jobForm, setJobForm] = useState({
    perusahaan: '', email_perusahaan: '', posisi: '', kategori: '💻 Frontend Developer',
    type: 'Onsite', tipeKonversi: 'Full', isPaid: 'Tidak', link_pendaftaran: '', deskripsi: '', valid_until: ''
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const handleSubmitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lowongan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobForm) 
      });
      
      if (!res.ok) throw new Error("Gagal mengirim pengajuan lowongan.");
      
      showToast("Lowongan berhasil diajukan! Menunggu verifikasi dari Admin Fasilkom.", "success");
      setShowJobModal(false);
      setJobForm({
        perusahaan: '', email_perusahaan: '', posisi: '', kategori: '💻 Frontend Developer',
        type: 'Onsite', tipeKonversi: 'Full', isPaid: 'Tidak', link_pendaftaran: '', deskripsi: '', valid_until: ''
      });
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } } };
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  return (
    <div className="font-sans selection:bg-[#1e3a8a] selection:text-white flex flex-col">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[60] mt-20">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* HERO SECTION B2B */}
        <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-28 overflow-hidden bg-[#0a1128] text-white">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" animate="show" variants={staggerContainer} className="max-w-2xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-sm font-bold text-blue-200 uppercase tracking-wider">Portal Kemitraan Industri</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black mb-6 tracking-tight leading-tight">
                Temukan Talenta Digital Terbaik di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">UNSIKA</span>.
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-blue-100/80 mb-10 leading-relaxed font-medium">
                Buka peluang inovasi di perusahaan Anda dengan merekrut mahasiswa magang unggulan dari Fakultas Ilmu Komputer. Kirim lowongan Anda sekarang dan jangkau ratusan mahasiswa berbakat.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setShowJobModal(true)} className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all hover:-translate-y-1 text-center flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  Ajukan Lowongan Magang
                </button>
                <Link href="/lowongan" className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl border border-white/20 hover:bg-white/20 transition-all text-center">
                  Lihat Bursa Magang
                </Link>
              </motion.div>
            </motion.div>

            {/* Statistik Badges */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="hidden lg:grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl">
                <h4 className="text-4xl font-black text-emerald-400 mb-2">5+</h4>
                <p className="text-sm font-bold text-blue-200">Program Studi IT</p>
                <p className="text-xs text-blue-200/50 mt-2">Mencakup Informatika, Sistem Informasi, dsb.</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl translate-y-8">
                <h4 className="text-4xl font-black text-blue-400 mb-2">1000+</h4>
                <p className="text-sm font-bold text-blue-200">Mahasiswa Aktif</p>
                <p className="text-xs text-blue-200/50 mt-2">Siap terjun memecahkan masalah industri.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SECTION WHY PARTNER WITH US */}
        <section className="py-24 bg-white relative border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Keuntungan Pasang Lowongan di Sini</h2>
              <p className="text-gray-500 font-medium max-w-2xl mx-auto">Kami merancang kurikulum dan sistem informasi magang yang memudahkan perusahaan Anda dalam proses rekrutmen hingga pemantauan.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Tepat Sasaran</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Lowongan Anda langsung dilihat oleh ribuan mahasiswa Fakultas Ilmu Komputer yang sedang mencari tempat magang wajib.</p>
              </motion.div>

              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Kualitas Terjamin</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Setiap mahasiswa magang dibimbing langsung oleh Dosen Pembimbing untuk memastikan output pekerjaan sesuai standar industri.</p>
              </motion.div>

              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm transition-all duration-300">
                <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">Gratis & Cepat</h3>
                <p className="text-gray-600 leading-relaxed text-sm">Pemasangan lowongan 100% gratis. Cukup isi form, Admin akan memverifikasi, dan lowongan Anda langsung tayang hari itu juga.</p>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      {/* MODAL FORM PENGAJUAN LOWONGAN UNTUK MITRA */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowJobModal(false)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 md:p-10 z-10 max-h-full overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-start mb-6 border-b border-gray-100 pb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">Form Pengajuan Lowongan</h3>
                  <p className="text-gray-500 text-sm mt-1">Silakan isi detail kebutuhan magang perusahaan Anda. Admin akan meninjau sebelum menayangkan ke mahasiswa.</p>
                </div>
                <button onClick={() => setShowJobModal(false)} className="p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleSubmitJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nama Perusahaan *</label>
                    <input type="text" required value={jobForm.perusahaan} onChange={(e) => setJobForm({...jobForm, perusahaan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="PT Contoh Teknologi" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Perusahaan (Untuk Verifikasi) *</label>
                    <input type="email" required value={jobForm.email_perusahaan} onChange={(e) => setJobForm({...jobForm, email_perusahaan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="hr@perusahaan.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Posisi Magang *</label>
                    <input type="text" required value={jobForm.posisi} onChange={(e) => setJobForm({...jobForm, posisi: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="Frontend Developer Intern" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Kategori Bidang IT *</label>
                    <select required value={jobForm.kategori} onChange={(e) => setJobForm({...jobForm, kategori: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer">
                      <option value="💻 Frontend Developer">💻 Frontend Developer</option>
                      <option value="⚙️ Backend Developer">⚙️ Backend Developer</option>
                      <option value="📱 Mobile App Developer">📱 Mobile App Developer</option>
                      <option value="🎨 UI/UX Designer">🎨 UI/UX Designer</option>
                      <option value="🔒 Keamanan Sistem / Cyber">🔒 Keamanan Sistem / Cyber</option>
                      <option value="📊 Data Analyst / Science">📊 Data Analyst / Science</option>
                      <option value="☁️ Cloud / DevOps">☁️ Cloud / DevOps</option>
                      <option value="🛠️ Lainnya (IT Support, QA)">🛠️ Lainnya (IT Support, QA)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sistem Konversi Kampus</label>
                    <select value={jobForm.tipeKonversi} onChange={(e) => setJobForm({...jobForm, tipeKonversi: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none cursor-pointer shadow-sm">
                      <option value="Full">✅ Konversi SKS Penuh</option>
                      <option value="Parsial">⚠️ Parsial (Beberapa Matkul)</option>
                      <option value="Tidak">❌ Tidak Ada Konversi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Sistem Kerja</label>
                    <select value={jobForm.type} onChange={(e) => setJobForm({...jobForm, type: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none cursor-pointer shadow-sm">
                      <option value="Onsite">WFO (Onsite)</option><option value="Hybrid">Hybrid</option><option value="Remote">WFH (Remote)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Status Gaji/Uang Saku</label>
                    <select value={jobForm.isPaid} onChange={(e) => setJobForm({...jobForm, isPaid: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-900 outline-none cursor-pointer shadow-sm">
                      <option value="Tidak">Tidak Ada (Unpaid)</option><option value="Ya">Ada (Paid)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tautan/Link Pendaftaran Eksternal (Wajib) *</label>
                    <input type="url" required value={jobForm.link_pendaftaran} onChange={(e) => setJobForm({...jobForm, link_pendaftaran: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" placeholder="https://forms.gle/... atau Web Karir" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Batas Waktu Pendaftaran (DL) *</label>
                    <input type="date" required value={jobForm.valid_until} onChange={(e) => setJobForm({...jobForm, valid_until: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Lengkap Lowongan *</label>
                  <textarea required rows={5} value={jobForm.deskripsi} onChange={(e) => setJobForm({...jobForm, deskripsi: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-colors custom-scrollbar" placeholder="Sebutkan kualifikasi, tugas utama, dan keuntungan magang di tempat Anda..."></textarea>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-col md:flex-row gap-4">
                  <button type="button" onClick={() => setShowJobModal(false)} className="py-4 px-8 rounded-2xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors text-center">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/30 font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:-translate-y-1 text-center">
                    {isSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan Lowongan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}