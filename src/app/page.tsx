"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-blue-200 hover:shadow-md">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-gray-900 focus:outline-none"
      >
        <span className="text-lg">{question}</span>
        <div className={`p-1 rounded-full transition-colors ${isOpen ? 'bg-[#1e3a8a] text-white' : 'bg-blue-50 text-[#1e3a8a]'}`}>
          <svg className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-gray-600 text-base leading-relaxed border-t border-gray-50 pt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function LandingPage() {
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } };

  const [feedbackData, setFeedbackData] = useState({ nama: '', email: '', pesan: '' });
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

 const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingFeedback(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      if (res.ok) {
        alert('Terima kasih! Pesan Anda telah berhasil dikirim ke Admin.');
        setFeedbackData({ nama: '', email: '', pesan: '' });
      }
    } catch (error) {
      alert('Gagal mengirim pesan.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  return (
    // FIX 1: Hapus bg-gray-50 dan min-h-screen agar tidak ada blok abu-abu aneh
    <div className="font-sans overflow-x-hidden scroll-smooth">
      
      {/* FIX 2: Ubah pt-24 menjadi pt-12 agar halaman tidak melorot kejauhan */}
      <section className="relative bg-white pt-12 pb-32 lg:pt-20 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="text-center max-w-4xl mx-auto">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-6">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              <span className="text-sm font-bold text-blue-700 tracking-wider uppercase">Fakultas Ilmu Komputer - UNSIKA</span>
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl lg:text-7xl tracking-tight font-black text-gray-900 mb-8 leading-[1.1]">
              Kelola Magang Mahasiswa <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-500 relative">
                Lebih Mudah
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none"><path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg>
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Platform digital terintegrasi untuk monitoring magang, verifikasi logbook harian, pencarian lowongan, dan konversi nilai secara otomatis. Mudah, cepat, dan efisien.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/register" className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg hover:shadow-blue-900/30 transition-all hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
                Mulai Sekarang
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link href="/lowongan" className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5 text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Lihat Bursa Magang
              </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-10">
              <Link href="/mitra" className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all group">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-600 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </span>
                <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                  Perwakilan Perusahaan? <span className="text-[#1e3a8a] underline decoration-blue-200 underline-offset-2">Ajukan Lowongan di Sini</span>
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="fitur" className="py-24 bg-gray-50 relative border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Cara Kerja</h2>
            <p className="mt-4 text-gray-500 text-lg">Proses yang sederhana dan terstruktur untuk kemudahan semua pihak</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 -z-10"></div>
            {[
              { step: '1', title: 'Daftar & Verifikasi', desc: 'Mahasiswa melengkapi profil, mencari posisi di bursa magang, lalu mendaftar untuk diverifikasi.' },
              { step: '2', title: 'Input Logbook Harian', desc: 'Selama magang, mahasiswa mengisi logbook kegiatan harian yang akan dipantau oleh dosen pembimbing.' },
              { step: '3', title: 'Konversi Nilai', desc: 'Sistem otomatis merekap data evaluasi dari mitra dan dosen menjadi nilai akhir akademik.' }
            ].map((item, idx) => (
              <div key={idx} className="text-center relative group">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#1e3a8a] to-blue-600 text-white text-3xl font-black rounded-3xl flex items-center justify-center mb-8 shadow-xl ring-8 ring-gray-50 transform group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-500 px-4 leading-relaxed text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-500 text-lg">Pertanyaan yang sering diajukan seputar sistem magang</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="Apa itu Sistem Informasi Magang?" 
              answer="Sistem Informasi Magang adalah platform digital resmi Fakultas Ilmu Komputer UNSIKA yang dirancang untuk memudahkan mahasiswa, dosen, dan admin dalam mengelola proses pendaftaran magang, pencarian lowongan, monitoring logbook, hingga konversi nilai akademik secara terpusat." 
            />
            <FAQItem 
              question="Bagaimana cara mendaftar dan mencari lowongan magang?" 
              answer="Untuk mendaftar, Anda harus login terlebih dahulu dan melengkapi profil (KTM, KTP, CV). Setelah itu, Anda dapat menelusuri menu 'Bursa Magang' untuk melihat lowongan yang tersedia dan langsung mendaftar pada posisi yang diminati." 
            />
            <FAQItem 
              question="Bagaimana sistem penilaian magang?" 
              answer="Penilaian magang dibagi menjadi dua (khusus untuk magang konversi): Nilai dari Mitra (Perusahaan) dan Nilai dari Dosen Pembimbing berdasarkan kualitas logbook dan laporan akhir. Kedua nilai tersebut akan dikalkulasikan oleh sistem menjadi Nilai Akhir." 
            />
            <FAQItem 
              question="Berapa lama durasi magang yang diperlukan?" 
              answer="Durasi standar untuk program magang konversi SKS (seperti Kampus Merdeka/MSIB) umumnya adalah 4 hingga 6 bulan, dengan target minimal akumulasi jam kerja yang disetujui untuk memenuhi syarat konversi SKS penuh." 
            />
          </div>
        </div>
      </section>

      <section id="kontak" className="py-24 bg-blue-50 border-t border-blue-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Kritik & Saran</h2>
            <p className="mt-4 text-gray-600 text-lg">Evaluasi Anda sangat membantu kami dalam mengembangkan dan menyempurnakan sistem ini ke depannya.</p>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg border border-gray-100">
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                  <input type="text" required value={feedbackData.nama} onChange={(e) => setFeedbackData({...feedbackData, nama: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] outline-none transition-colors text-gray-900" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email</label>
                  <input type="email" required value={feedbackData.email} onChange={(e) => setFeedbackData({...feedbackData, email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] outline-none transition-colors text-gray-900" placeholder="email@domain.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Pesan, Kritik, atau Saran</label>
                <textarea required rows={5} value={feedbackData.pesan} onChange={(e) => setFeedbackData({...feedbackData, pesan: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] outline-none transition-colors text-gray-900" placeholder="Tuliskan kendala yang dialami atau ide peningkatan sistem..."></textarea>
              </div>
              <button type="submit" disabled={isSubmittingFeedback} className="w-full py-4 px-6 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors disabled:opacity-70">
                {isSubmittingFeedback ? 'Mengirim Transmisi Data...' : 'Kirim Umpan Balik'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FIX 3: KODE FOOTER LAMA SUDAH SAYA HAPUS DARI SINI! */}
    </div>
  );
}