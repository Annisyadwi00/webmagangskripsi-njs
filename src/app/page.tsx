"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const FaqItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden transition-all duration-300 hover:border-blue-300 shadow-sm">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none">
        <span className="font-bold text-gray-900 pr-4">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${isOpen ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-[#1e3a8a]'}`}>
          <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-gray-50">
            <div className="px-6 pb-5 pt-2 text-gray-600 leading-relaxed font-medium">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function Home() {
  const [feedbackForm, setFeedbackForm] = useState({ nama: '', email: '', pesan: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(feedbackForm) });
      if (!res.ok) throw new Error("Gagal mengirim pesan.");
      showToast("Pesan berhasil dikirim!", "success");
      setFeedbackForm({ nama: '', email: '', pesan: '' });
    } catch (error: any) { showToast(error.message, "error"); } finally { setIsSubmitting(false); }
  };

  const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } } };
  const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#1e3a8a] selection:text-white flex flex-col">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-50 mt-20">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-50 to-slate-50 z-0"></div>
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-500/20 blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial="hidden" animate="show" variants={staggerContainer} className="max-w-4xl mx-auto">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-blue-100 shadow-sm mb-8">
                <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span></span>
                <span className="text-sm font-bold text-[#1e3a8a]">Sistem Informasi Terintegrasi v2.0</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight leading-tight">
                Kelola Magangmu <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-500">Lebih Cerdas & Mudah</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                Platform resmi Fakultas Ilmu Komputer UNSIKA untuk mempermudah pendaftaran, konversi SKS, hingga evaluasi akhir magang mahasiswa.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-900 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2">Daftar Mahasiswa</Link>
                <Link href="/lowongan" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 font-bold rounded-2xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2">Lihat Lowongan</Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 pt-8 border-t border-gray-200/60 max-w-lg mx-auto flex flex-col items-center">
                <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-widest">Untuk Perusahaan / Mitra Industri</p>
                <Link href="/mitra" className="group flex items-center gap-3 px-6 py-3 bg-blue-50/80 text-[#1e3a8a] font-bold rounded-xl hover:bg-blue-100 transition-colors shadow-sm border border-blue-100/50">Masuk ke Portal Kemitraan</Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* REVISI: SECTION STATISTIK DIPINDAH KE SINI + ANIMASI */}
        <section className="relative z-20 -mt-16 px-6 lg:px-8 pb-12">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/90 backdrop-blur-xl p-8 md:p-12 rounded-[32px] shadow-2xl shadow-blue-900/5 border border-white/40"
            >
              {[
                { label: "Mitra Perusahaan", val: "50+", color: "text-blue-600" },
                { label: "Mahasiswa Magang", val: "200+", color: "text-emerald-600" },
                { label: "Digitalisasi", val: "100%", color: "text-indigo-600" },
                { label: "SKS Konversi", val: "20", color: "text-orange-600" }
              ].map((stat, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
                  <h4 className={`text-4xl md:text-5xl font-black mb-2 ${stat.color}`}>{stat.val}</h4>
                  <p className="text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* SECTION FITUR UNGGULAN */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">Fitur Unggulan SI Magang</h2>
              <p className="text-gray-500 font-medium">Dirancang khusus untuk ekosistem Fasilkom UNSIKA.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-black text-gray-900 mb-3">Konversi SKS Otomatis</h3>
                <p className="text-gray-600 leading-relaxed">Sistem pintar untuk pengajuan konversi hingga 20 SKS yang terhubung langsung dengan Prodi.</p>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-black text-gray-900 mb-3">Logbook Digital Terpadu</h3>
                <p className="text-gray-600 leading-relaxed">Tinggalkan kertas. Catat kegiatan harianmu dan dapatkan approval langsung dari Dosen.</p>
              </motion.div>
              <motion.div whileHover={{ y: -10 }} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <h3 className="text-xl font-black text-gray-900 mb-3">Integrasi Dosen Pembimbing</h3>
                <p className="text-gray-600 leading-relaxed">Pilih dosen yang sesuai dengan peminatan magangmu untuk memantau nilai real-time.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION FAQ */}
        <section className="py-24 bg-gray-50 relative border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Pertanyaan Seputar Magang</h2>
            </div>
            <div className="space-y-4">
              <FaqItem question="Siapa saja yang bisa mendaftar program magang ini?" answer="Seluruh mahasiswa aktif Fasilkom UNSIKA yang memenuhi SKS minimal." />
              <FaqItem question="Apakah bisa mengajukan tempat magang sendiri?" answer="Bisa. Upload LOA di dashboard untuk diverifikasi Admin." />
              <FaqItem question="Berapa maksimal SKS dikonversi?" answer="Maksimal 20 SKS, tergantung relevansi pekerjaan dengan kurikulum." />
            </div>
          </div>
        </section>

        {/* SECTION PESAN & MASUKAN */}
        <section className="py-24 bg-white relative border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-3xl shadow-lg border border-gray-100 p-8 md:p-12 text-center">
              <h2 className="text-3xl font-black text-gray-900 mb-4">Kirim Pesan & Masukan</h2>
              <form onSubmit={handleFeedbackSubmit} className="space-y-6 mt-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" required value={feedbackForm.nama} onChange={(e) => setFeedbackForm({...feedbackForm, nama: e.target.value})} className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#1e3a8a]" placeholder="Nama Anda" />
                  <input type="email" required value={feedbackForm.email} onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})} className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#1e3a8a]" placeholder="Email" />
                </div>
                <textarea required rows={4} value={feedbackForm.pesan} onChange={(e) => setFeedbackForm({...feedbackForm, pesan: e.target.value})} className="w-full px-5 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-[#1e3a8a]" placeholder="Tuliskan pesan Anda di sini..."></textarea>
                <button type="submit" disabled={isSubmitting} className="w-full px-10 py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-900 transition-all">{isSubmitting ? 'Mengirim...' : 'Kirim Pesan Sekarang'}</button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}