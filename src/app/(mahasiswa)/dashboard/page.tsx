"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  // State untuk Data Pengajuan Magang
  const [pengajuanInfo, setPengajuanInfo] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  
  // State untuk Data Logbook
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true); // INI YANG TADI HILANG
  
  // State untuk Form Tambah Logbook
  const [showAddLogbook, setShowAddLogbook] = useState(false); // INI JUGA TADI HILANG
  const [formData, setFormData] = useState({
    tanggal: '',
    jam_kerja: '',
    kegiatan: '',
    link_dokumen: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Ambil Data Status Pengajuan
  useEffect(() => {
    const fetchPengajuanInfo = async () => {
      try {
        const res = await fetch('/api/pengajuan');
        const json = await res.json();
        if (res.ok) setPengajuanInfo(json.data);
      } catch (error) {
        console.error('Gagal mengambil data pengajuan', error);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchPengajuanInfo(); // Sudah diperbaiki dari fetchStatusMagang
  }, []);

  // 2. Ambil Data Logbook
  const fetchLogbooks = async () => {
    try {
      const res = await fetch('/api/logbook');
      const json = await res.json();
      if (res.ok) setLogbooks(json.data);
    } catch (error) {
      console.error('Gagal mengambil data logbook', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, []);

  // Fungsi Submit Logbook
  const handleSubmitLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/logbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || 'Gagal menyimpan logbook.');
        return;
      }

      alert('Logbook berhasil ditambahkan!');
      setShowAddLogbook(false); 
      setFormData({ tanggal: '', jam_kerja: '', kegiatan: '', link_dokumen: '' }); 
      fetchLogbooks(); // Refresh tabel

    } catch (error) {
      alert('Terjadi kesalahan server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Logika penentu: Jika ada data pengajuan, berarti isRegistered = true
  const isRegistered = pengajuanInfo !== null;

  // Hitung total jam kerja dari logbook yang disetujui
  const totalJamDisetujui = logbooks
    .filter(log => log.status === 'Disetujui')
    .reduce((total, log) => total + log.jam_kerja, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-[#0f1f4d] text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">SI Magang</h1>
          <p className="text-xs text-blue-200/80 mt-1">Dashboard Mahasiswa</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="#dashboard-top" className="flex items-center gap-3 px-4 py-3 bg-white text-[#1e3a8a] rounded-xl font-bold">Dashboard</Link>
          <Link href="#logbook-harian" className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl">Logbook Harian</Link>
        </nav>
        <div className="p-4 border-t border-white/10 space-y-2 mt-auto bg-black/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-blue-200 hover:text-white hover:bg-white/10 rounded-xl">Kembali ke Home</Link>
        </div>
      </aside>

      <main id="dashboard-top" className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
          <div>
            <h2 className="text-2xl font-extrabold text-[#1e3a8a]">Dashboard</h2>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full pb-20">
          {isLoadingStatus ? (
            <div className="text-center py-20 text-gray-500 font-medium animate-pulse">Memuat data dashboard...</div>
          ) : isRegistered ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              
              {/* STATUS CARD DINAMIS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Perusahaan</p>
                  <p className="font-bold text-gray-900 text-lg mt-1">{pengajuanInfo?.perusahaan || 'Memuat...'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Jam Disetujui</p>
                  <p className="font-black text-green-600 text-2xl mt-1">{totalJamDisetujui} Jam</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Status Pengajuan</p>
                  <span className={`inline-block mt-2 px-3 py-1 font-bold text-xs rounded-md ${
                    pengajuanInfo?.status === 'Disetujui' ? 'bg-green-100 text-green-700' : 
                    pengajuanInfo?.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {pengajuanInfo?.status || 'Memuat...'}
                  </span>
                </div>
              </div>

              {/* LOGBOOK HARIAN SECTION */}
              <div id="logbook-harian" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-28">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-lg">
                    {showAddLogbook ? 'Upload Logbook Harian' : 'Logbook Harian Magang'}
                  </h3>
                  {!showAddLogbook && (
                    <button onClick={() => setShowAddLogbook(true)} className="bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-900 transition-all">
                      + Tambah Logbook
                    </button>
                  )}
                </div>

                <AnimatePresence mode="wait">
                  {showAddLogbook ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8">
                      <form className="space-y-6 max-w-3xl" onSubmit={handleSubmitLogbook}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Tanggal</label>
                            <input type="date" required value={formData.tanggal} onChange={(e) => setFormData({...formData, tanggal: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#1e3a8a]" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Jam Kerja</label>
                            <input type="number" required min="1" max="12" placeholder="Contoh: 8" value={formData.jam_kerja} onChange={(e) => setFormData({...formData, jam_kerja: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#1e3a8a]" />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Ringkasan Aktivitas</label>
                          <input type="text" required placeholder="Contoh: Implementasi fitur login" value={formData.kegiatan} onChange={(e) => setFormData({...formData, kegiatan: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#1e3a8a]" />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-1">Link Google Drive (PDF Dokumen Pendukung)</label>
                          <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_dokumen} onChange={(e) => setFormData({...formData, link_dokumen: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-[#1e3a8a]" />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <button type="button" onClick={() => setShowAddLogbook(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                          <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors">
                            {isSubmitting ? 'Menyimpan...' : 'Submit Logbook'}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                              <th className="p-5">Tanggal</th>
                              <th className="p-5">Kegiatan</th>
                              <th className="p-5 text-center">Jam</th>
                              <th className="p-5">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm">
                            {isLoadingData ? (
                              <tr><td colSpan={4} className="p-5 text-center text-gray-500">Memuat data...</td></tr>
                            ) : logbooks.length === 0 ? (
                              <tr><td colSpan={4} className="p-5 text-center text-gray-500">Belum ada logbook yang diisi.</td></tr>
                            ) : (
                              logbooks.map((log) => (
                                <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                                  <td className="p-5 font-medium">{new Date(log.tanggal).toLocaleDateString('id-ID')}</td>
                                  <td className="p-5 max-w-xs truncate text-gray-600">{log.kegiatan}</td>
                                  <td className="p-5 text-center font-bold text-gray-700">{log.jam_kerja} jam</td>
                                  <td className="p-5">
                                    <span className={`inline-flex px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                                      log.status === 'Disetujui' ? 'bg-green-50 text-green-700' : 
                                      log.status === 'Ditolak' ? 'bg-red-50 text-red-700' : 
                                      'bg-orange-50 text-orange-700'
                                    }`}>
                                      {log.status}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </motion.div>
  
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center p-12 md:p-20 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-3xl mx-auto mt-10">
              <div className="w-24 h-24 bg-blue-50 text-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4">Kamu Belum Terdaftar Magang</h2>
              <p className="text-gray-500 mb-10 text-lg">Untuk memulai program magang, pastikan dokumen profilmu sudah lengkap, lalu temukan posisi yang cocok di Bursa Magang.</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/profil" className="px-8 py-4 bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] font-bold rounded-xl hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  1. Lengkapi Profil
                </Link>
                <Link href="/lowongan" className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  2. Cari Lowongan
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}