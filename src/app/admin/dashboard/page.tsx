"use client";

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardAdminPage() {
  const [activeTab, setActiveTab] = useState('Review');

  // Fungsi untuk handle klik sidebar
  const handleMenuClick = (tabName: string) => {
    setActiveTab(tabName);
    // Otomatis scroll ke area tabel
    document.getElementById('tabel-admin')?.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      
        <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-[#0f1f4d] text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-blue-800">
          <h1 className="font-bold text-lg leading-tight">UNSIKA Admin</h1>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {/* Scroll ke atas */}
          <Link href="#dashboard-top" className="flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-white hover:text-[#1e3a8a] rounded-lg font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /></svg>
            Dashboard
          </Link>
          
          {/* Trigger Tab Review & Scroll */}
          <button onClick={() => handleMenuClick('Review')} className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors text-left">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857" /></svg>
            Data Mahasiswa / Review
          </button>
          
          {/* Trigger Tab Konversi & Scroll */}
          <button onClick={() => handleMenuClick('Konversi')} className="w-full flex items-center gap-3 px-3 py-2.5 text-blue-100 hover:bg-blue-800 hover:text-white rounded-lg transition-colors text-left">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            Konversi Nilai
          </button>
        </nav>
        {/* TOMBOL HOME DAN KELUAR */}
<div className="p-4 border-t border-white/10 space-y-2 mt-auto bg-black/10">
  <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-all group">
    <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
    Kembali ke Home
  </Link>
  <button className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-300 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all font-medium">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
    Keluar Akun
  </button>
</div>
      </aside>

      {/* MAIN CONTENT - scroll-smooth */}
      <main id="dashboard-top" className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth bg-gray-50/50">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">Dashboard Admin</h2>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-8 max-w-xl mx-auto">
            {/* ...Kode Tombol Tab Review & Konversi seperti sebelumnya... */}
            <button onClick={() => setActiveTab('Review')} className={`flex-1 py-3 px-4 rounded-lg font-bold ${activeTab === 'Review' ? 'bg-[#1e3a8a] text-white' : 'text-gray-500'}`}>Review Pendaftaran</button>
            <button onClick={() => setActiveTab('Konversi')} className={`flex-1 py-3 px-4 rounded-lg font-bold ${activeTab === 'Konversi' ? 'bg-[#1e3a8a] text-white' : 'text-gray-500'}`}>Konversi Nilai</button>
          </div>

          {/* Area ini diberi ID supaya bisa di-scroll dari sidebar */}
          <div id="tabel-admin" className="scroll-mt-24">
            <AnimatePresence mode="wait">
              {activeTab === 'Review' && (
                <motion.div key="review" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold mb-4">Tabel Review Pendaftaran...</h3>
                  </div>
                </motion.div>
              )}
              {activeTab === 'Konversi' && (
                <motion.div key="konversi" variants={containerVariants} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-bold mb-4">Tabel Konversi Nilai...</h3>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}