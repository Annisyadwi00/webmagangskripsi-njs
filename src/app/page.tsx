"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Komponen FAQ Item yang bisa Buka-Tutup
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:border-blue-200">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 flex justify-between items-center text-left font-bold text-gray-900 focus:outline-none"
      >
        <span>{question}</span>
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
            <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
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

  return (
    <div className="min-h-screen bg-gray-50 font-sans overflow-x-hidden scroll-smooth">
      
      {/* NAVBAR */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-600 p-1.5 rounded-lg shadow-md">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5V14M5.4 17.5l-3.4-1.9M18.6 17.5l3.4-1.9" /></svg>
              </div>
              <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-600">SI Magang</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-[#1e3a8a] font-bold">Home</Link>
              <Link href="#fitur" className="text-gray-500 hover:text-[#1e3a8a] transition-colors font-medium">Fitur</Link>
              <Link href="#faq" className="text-gray-500 hover:text-[#1e3a8a] transition-colors font-medium">FAQ</Link>
              <Link href="#tentang" className="text-gray-500 hover:text-[#1e3a8a] transition-colors font-medium">Tentang</Link>
            </div>

            <div className="flex items-center space-x-3">
              <Link href="/login" className="px-4 py-2 text-[#1e3a8a] font-bold hover:bg-blue-50 rounded-xl transition-colors">Masuk</Link>
              <Link href="/register" className="px-5 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all hover:-translate-y-0.5">Daftar</Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <section className="bg-white pt-20 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="text-center max-w-3xl mx-auto">
            <motion.p variants={itemVariants} className="text-sm font-bold text-blue-600 tracking-wider uppercase mb-4">Fakultas Ilmu Komputer - UNSIKA</motion.p>
            <motion.h1 variants={itemVariants} className="text-5xl tracking-tight font-extrabold text-gray-900 sm:text-6xl mb-6">
              Kelola Magang Mahasiswa <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-500">Lebih Mudah</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-4 text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
              Platform digital terintegrasi untuk monitoring magang, verifikasi logbook harian, dan konversi nilai secara otomatis. Mudah, cepat, dan efisien.
            </motion.p>
            <motion.div variants={itemVariants} className="flex justify-center gap-4">
              <Link href="/register" className="px-8 py-3.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-lg">Mulai Sekarang</Link>
              <Link href="/dashboard" className="px-8 py-3.5 bg-blue-50 text-[#1e3a8a] font-bold rounded-xl hover:bg-blue-100 transition-all text-lg">Masuk ke Dashboard</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CARA KERJA (Hal 20) */}
      <section id="fitur" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Cara Kerja</h2>
            <p className="mt-4 text-gray-500 text-lg">Proses yang sederhana dan terstruktur untuk kemudahan semua pihak</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/6 right-1/6 h-1 bg-gradient-to-r from-blue-200 to-blue-100 -z-10 -translate-y-1/2 rounded-full"></div>
            {[
              { step: '1', title: 'Daftar & Verifikasi', desc: 'Mahasiswa mendaftar magang, memilih perusahaan dan dosen pembimbing untuk diverifikasi.' },
              { step: '2', title: 'Input Logbook Harian', desc: 'Mahasiswa mengisi logbook kegiatan harian yang akan diverifikasi oleh dosen pembimbing.' },
              { step: '3', title: 'Konversi Nilai', desc: 'Sistem otomatis menghitung dan mengkonversi nilai dari mitra dan dosen menjadi nilai akademik.' }
            ].map((item, idx) => (
              <div key={idx} className="text-center relative">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#1e3a8a] to-blue-600 text-white text-2xl font-black rounded-2xl flex items-center justify-center mb-6 shadow-xl ring-8 ring-gray-50 rotate-3 hover:rotate-0 transition-transform">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-500 px-4 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION (Hal 20) */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-gray-500 text-lg">Pertanyaan yang sering diajukan seputar sistem magang</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="Apa itu Sistem Informasi Magang?" 
              answer="Sistem Informasi Magang adalah platform digital resmi Fakultas Ilmu Komputer UNSIKA yang dirancang untuk memudahkan mahasiswa, dosen, dan admin dalam mengelola proses pendaftaran magang, monitoring logbook, hingga konversi nilai akademik secara terpusat." 
            />
            <FAQItem 
              question="Bagaimana cara mendaftar magang?" 
              answer="Untuk mendaftar, Anda harus login terlebih dahulu. Lengkapi data profil Anda, kemudian masuk ke menu Pendaftaran Magang. Isi data perusahaan, posisi, dan upload surat penerimaan magang. Terakhir, pilih apakah magang Anda untuk konversi SKS atau tidak." 
            />
            <FAQItem 
              question="Bagaimana sistem penilaian magang?" 
              answer="Penilaian magang dibagi menjadi dua (khusus untuk magang konversi): Nilai dari Mitra (Perusahaan) dan Nilai dari Dosen Pembimbing berdasarkan kualitas logbook dan laporan akhir. Kedua nilai tersebut akan dikalkulasikan oleh sistem menjadi Nilai Akhir (A/B/C)." 
            />
            <FAQItem 
              question="Berapa lama durasi magang yang diperlukan?" 
              answer="Durasi standar untuk program magang konversi SKS (seperti Kampus Merdeka/MSIB) umumnya adalah 4 hingga 6 bulan, dengan target minimal akumulasi 480 jam kerja untuk memenuhi syarat konversi SKS penuh." 
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="tentang" className="bg-[#0f1f4d] text-gray-300 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/10 p-2 rounded-xl border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>
              </div>
              <span className="font-extrabold text-2xl text-white tracking-wide">SI Magang</span>
            </div>
            <p className="text-sm text-blue-200/70 leading-relaxed max-w-sm">
              Platform digital untuk pengelolaan magang mahasiswa Fakultas Ilmu Komputer, Universitas Singaperbangsa Karawang. Menghubungkan teori dengan praktik di dunia industri.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Menu Cepat</h4>
            <ul className="space-y-3 text-sm text-blue-200/80">
              <li><Link href="/" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Home</Link></li>
              <li><Link href="#fitur" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Fitur & Cara Kerja</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> FAQ</Link></li>
              <li><Link href="/lowongan" className="hover:text-white transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Lowongan Magang</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 text-lg">Hubungi Kami</h4>
            <ul className="space-y-3 text-sm text-blue-200/80">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Fakultas Ilmu Komputer, Jl. HS. Ronggowaluyo, Karawang
              </li>
              <li className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                fasilkom@unsika.ac.id
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/10 text-sm text-center text-blue-200/50">
          © 2026 Sistem Informasi Magang - Fasilkom UNSIKA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}