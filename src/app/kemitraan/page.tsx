"use client";

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

export default function KemitraanPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar user={null} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-black text-gray-900 mb-6 tracking-tight">Portal Kemitraan Strategis</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Fasilkom UNSIKA mengundang instansi dan perusahaan untuk berkolaborasi dalam menyiapkan talenta digital masa depan melalui program magang terstruktur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-[#1e3a8a]">Ketentuan Pemasangan Lowongan</h2>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-bold">1</div>
                <p className="text-gray-700 font-medium"><strong>Wajib Link Eksternal:</strong> Anda harus melampirkan link pendaftaran langsung (Google Form/Web Perusahaan). Kami tidak menampung berkas di server kami.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-bold">2</div>
                <p className="text-gray-700 font-medium"><strong>Verifikasi Admin:</strong> Setiap lowongan yang dikirim akan diperiksa oleh admin fakultas dalam waktu maksimal 2x24 jam.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0 font-bold">3</div>
                <p className="text-gray-700 font-medium"><strong>Target Peserta:</strong> Mahasiswa aktif semester 5-7 dengan durasi magang minimal 3 bulan.</p>
              </li>
            </ul>
            <div className="pt-6">
              <a href="/register" className="px-8 py-4 bg-[#1e3a8a] text-white font-black rounded-2xl shadow-lg hover:bg-blue-900 transition-all inline-block">Mulai Pasang Lowongan</a>
            </div>
          </div>
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
             <h3 className="font-bold text-gray-900 mb-4">Butuh Bantuan Kerjasama?</h3>
             <p className="text-sm text-gray-600 mb-6">Untuk kerjasama resmi MoU/MoA antara perusahaan dan Fakultas Ilmu Komputer UNSIKA, silakan hubungi bagian kemitraan kami.</p>
             <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm font-bold text-[#1e3a8a]"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> kemitraan.fasilkom@unsika.ac.id</div>
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}