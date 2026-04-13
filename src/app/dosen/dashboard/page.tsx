"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardDosenPage() {
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State untuk Modal Review
  const [selectedLogbook, setSelectedLogbook] = useState<any>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ambil data logbook dari API
  const fetchLogbooks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/logbook');
      const json = await res.json();
      if (res.ok) setLogbooks(json.data);
    } catch (error) {
      console.error('Gagal mengambil data logbook', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogbooks();
  }, []);

  // Filter khusus logbook yang masih 'Pending'
  const pendingLogbooks = logbooks.filter(log => log.status === 'Pending');

  // Fungsi untuk menyetujui atau menolak logbook
  const handleReview = async (statusKeputusan: 'Disetujui' | 'Ditolak') => {
    if (!selectedLogbook) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/logbook', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logbookId: selectedLogbook.id,
          status: statusKeputusan,
          feedback: feedback,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert(`Logbook berhasil ${statusKeputusan}!`);
      setSelectedLogbook(null); // Tutup modal
      setFeedback(''); // Kosongkan catatan
      fetchLogbooks(); // Refresh tabel

    } catch (error: any) {
      alert(error.message || 'Terjadi kesalahan server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR DOSEN */}
      <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-[#0f1f4d] text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">SI Magang</h1>
          <p className="text-xs text-blue-200/80 mt-1">Portal Dosen Pembimbing</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <Link href="#dashboard-top" className="flex items-center gap-3 px-4 py-3 bg-white text-[#1e3a8a] rounded-xl font-bold shadow-lg">Dashboard Dosen</Link>
          <Link href="#verifikasi-logbook" className="flex items-center gap-3 px-4 py-3 text-blue-100 hover:bg-white/10 rounded-xl">Verifikasi Logbook</Link>
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto bg-black/10">
          <Link href="/" className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 rounded-xl font-bold">Keluar Akun</Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main id="dashboard-top" className="flex-1 flex flex-col h-screen overflow-y-auto scroll-smooth">
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-[#1e3a8a]">Selamat Datang, Dosen Pembimbing!</h2>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* STATISTIK SEDERHANA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Menunggu Verifikasi</p>
                <p className="text-3xl font-black text-orange-500 mt-1">{pendingLogbooks.length}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl text-orange-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
          </div>

          {/* TABEL VERIFIKASI LOGBOOK */}
          <div id="verifikasi-logbook" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-28">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-lg">Daftar Logbook Mahasiswa (Perlu Review)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                    <th className="p-5">Tanggal</th>
                    <th className="p-5">Kegiatan</th>
                    <th className="p-5 text-center">Jam</th>
                    <th className="p-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {isLoading ? (
                    <tr><td colSpan={4} className="p-5 text-center text-gray-500">Memuat data...</td></tr>
                  ) : pendingLogbooks.length === 0 ? (
                    <tr><td colSpan={4} className="p-5 text-center text-green-600 font-medium">Yeay! Semua logbook sudah direview.</td></tr>
                  ) : (
                    pendingLogbooks.map((log) => (
                      <tr key={log.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="p-5 font-medium">{new Date(log.tanggal).toLocaleDateString('id-ID')}</td>
                        <td className="p-5 max-w-sm truncate text-gray-600">{log.kegiatan}</td>
                        <td className="p-5 text-center font-bold text-gray-700">{log.jam_kerja} jam</td>
                        <td className="p-5 text-right">
                          <button 
                            onClick={() => setSelectedLogbook(log)}
                            className="bg-blue-50 text-[#1e3a8a] border border-blue-200 px-4 py-1.5 rounded-lg font-bold hover:bg-[#1e3a8a] hover:text-white transition-colors"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL REVIEW LOGBOOK */}
      <AnimatePresence>
        {selectedLogbook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedLogbook(null)} />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
              
              <div className="bg-[#1e3a8a] p-5 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">Review Logbook Mahasiswa</h3>
                <button onClick={() => setSelectedLogbook(null)} className="text-white/60 hover:text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div><p className="text-xs text-gray-500 font-bold mb-1">Tanggal</p><p className="font-semibold text-gray-900">{new Date(selectedLogbook.tanggal).toLocaleDateString('id-ID')}</p></div>
                  <div><p className="text-xs text-gray-500 font-bold mb-1">Jam Kerja</p><p className="font-semibold text-gray-900">{selectedLogbook.jam_kerja} Jam</p></div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">Deskripsi Kegiatan</p>
                  <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedLogbook.kegiatan}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 font-bold mb-1">Dokumen Lampiran</p>
                  <a href={selectedLogbook.link_dokumen} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-600 font-bold hover:underline bg-blue-50 px-4 py-2 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    Lihat Dokumen di Google Drive
                  </a>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Catatan/Feedback Dosen (Opsional)</label>
                  <textarea 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Beri masukan untuk mahasiswa..." 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-[#1e3a8a] text-sm"
                    rows={3}
                  ></textarea>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
                <button disabled={isSubmitting} onClick={() => handleReview('Ditolak')} className="px-6 py-2.5 bg-white border border-red-500 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors">Tolak</button>
                <button disabled={isSubmitting} onClick={() => handleReview('Disetujui')} className="px-6 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors">Setuju & Verifikasi</button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}