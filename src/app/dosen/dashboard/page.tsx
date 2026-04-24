"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DosenDashboard() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Aktif' | 'Logbook' | 'Penilaian'>('Permintaan');
  
  const [bimbinganList, setBimbinganList] = useState<any[]>([]);
  const [logbooks, setLogbooks] = useState<any[]>([]); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Modal Input Nilai
  const [showNilaiModal, setShowNilaiModal] = useState(false);
  const [nilaiForm, setNilaiForm] = useState({ id_pengajuan: 0, nama: '', perusahaan: '', nilai: '' });

  // ---> FITUR BARU: Modal Catatan Revisi Logbook <---
  const [showRevisiModal, setShowRevisiModal] = useState(false);
  const [revisiForm, setRevisiForm] = useState({ id_logbook: 0, nama_mahasiswa: '', kegiatan: '', catatan_dosen: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resBimbingan, resLogbook] = await Promise.all([
        fetch('/api/Pengajuan'),
        fetch('/api/logbook')
      ]);
      if (resBimbingan.ok) setBimbinganList((await resBimbingan.json()).data || []);
      if (resLogbook.ok) setLogbooks((await resLogbook.json()).data || []);
    } catch (error) { 
      console.error("Gagal memuat data", error); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePersetujuan = async (id_pengajuan: number, action: 'terima' | 'tolak', nama: string) => {
    if (!confirm(`Yakin ingin ${action.toUpperCase()} bimbingan dari ${nama}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id_pengajuan }) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Berhasil ${action} mahasiswa.`, "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_pengajuan: nilaiForm.id_pengajuan, nilai_dari_dosen: nilaiForm.nilai }) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Nilai tersimpan!`, "success"); setShowNilaiModal(false); fetchData();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  // Fungsi khusus untuk Setuju Langsung (Tanpa Catatan)
  const handleACCLogbook = async (id: number) => {
    if (!confirm(`Tandai logbook ini sebagai Disetujui?`)) return;
    try {
      const res = await fetch('/api/logbook', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id, status: 'Disetujui', catatan_dosen: null }) 
      });
      if (!res.ok) throw new Error("Gagal memvalidasi logbook");
      showToast(`Logbook berhasil di-ACC`, "success");
      fetchData(); 
    } catch (err: any) { showToast(err.message, "error"); }
  };

  // ---> FUNGSI BARU: Submit Form Revisi Dosen <---
  const handleSubmitRevisi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logbook', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ id: revisiForm.id_logbook, status: 'Revisi', catatan_dosen: revisiForm.catatan_dosen }) 
      });
      if (!res.ok) throw new Error("Gagal mengirim catatan revisi");
      showToast(`Catatan revisi terkirim!`, "success");
      setShowRevisiModal(false);
      fetchData(); 
    } catch (err: any) { 
      showToast(err.message, "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const pendingBimbingan = bimbinganList.filter(b => b.status_dosen !== 'Disetujui' && b.status_dosen !== 'Ditolak');
  const activeBimbingan = bimbinganList.filter(b => b.status_dosen === 'Disetujui');
  const pendingLogbooks = logbooks.filter(l => l.status === 'Menunggu Validasi' || !l.status);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* CUSTOM TOAST */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[70]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR DOSEN */}
      <aside className="w-72 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
          <p className="text-sm text-indigo-300 mt-1 font-medium">Portal Dosen Pembimbing</p>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="px-2 text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">Menu Utama</p>

          <button onClick={() => setActiveTab('Permintaan')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Permintaan' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Permintaan Bimbingan</span>
             {pendingBimbingan.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingBimbingan.length}</span>}
          </button>
          
          <button onClick={() => setActiveTab('Aktif')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Aktif' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Mahasiswa Aktif</span>
          </button>
          
          <button onClick={() => setActiveTab('Logbook')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Logbook' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Validasi Logbook</span>
             {pendingLogbooks.length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingLogbooks.length}</span>}
          </button>

          <button onClick={() => setActiveTab('Penilaian')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Penilaian' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Input Penilaian Akhir</span>
          </button>
          
          <Link href="/settings" className="w-full flex items-center px-5 py-4 rounded-2xl font-bold transition-all text-slate-200 hover:bg-white/10 hover:translate-x-1">
             Pengaturan Profil
          </Link>
        </nav>
        
        {/* TOMBOL BACK & LOGOUT */}
        <div className="p-6 border-t border-white/10 mt-auto flex flex-col gap-3">
          <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all shadow-sm border border-white/10 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg> Kembali ke Beranda
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> Logout Akun
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 px-10 py-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900">
            {activeTab === 'Permintaan' ? 'Validasi Permintaan Bimbingan' : 
             activeTab === 'Aktif' ? 'Daftar Mahasiswa Bimbingan' : 
             activeTab === 'Logbook' ? 'Validasi Laporan Harian (Logbook)' : 
             'Evaluasi & Penilaian Akhir'}
          </h2>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
           {isLoading ? (
             <div className="flex items-center justify-center h-64">
               <svg className="w-12 h-12 animate-spin text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </div>
           ) : (
             <AnimatePresence mode="wait">
               
               {/* TAB 1: PERMINTAAN BIMBINGAN */}
               {activeTab === 'Permintaan' && (
                 <motion.div key="permintaan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border">Belum ada permintaan bimbingan baru.</p> : pendingBimbingan.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl p-8 border shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow">
                         <h4 className="font-black text-gray-900 text-xl">{item.nama_mahasiswa}</h4>
                         <p className="text-sm font-bold text-gray-500 mb-6">{item.perusahaan} - {item.posisi}</p>
                         <div className="flex gap-3 mt-auto">
                            <button onClick={() => handlePersetujuan(item.id, 'tolak', item.nama_mahasiswa)} className="flex-1 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors">Tolak</button>
                            <button onClick={() => handlePersetujuan(item.id, 'terima', item.nama_mahasiswa)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md">Terima Bimbingan</button>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}

               {/* TAB 2: MAHASISWA AKTIF */}
               {activeTab === 'Aktif' && (
                 <motion.div key="aktif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border">Belum ada mahasiswa yang aktif dibimbing.</p> : activeBimbingan.map((b) => (
                      <div key={b.id} className="bg-white rounded-3xl p-8 border shadow-sm">
                         <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-xl">{b.nama_mahasiswa.charAt(0)}</div>
                           <div>
                             <h4 className="font-black text-gray-900 text-lg">{b.nama_mahasiswa}</h4>
                             <p className="text-sm font-bold text-indigo-600">{b.perusahaan}</p>
                           </div>
                         </div>
                         <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Sistem Konversi</span>
                            <span className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-bold">{b.tipeKonversi}</span>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}

               {/* TAB 3: VALIDASI LOGBOOK */}
               {activeTab === 'Logbook' && (
                 <motion.div key="logbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                          <th className="p-5 pl-8">Mahasiswa & Tanggal</th>
                          <th className="p-5">Deskripsi Kegiatan</th>
                          <th className="p-5 text-center">Bukti / Dokumen</th>
                          <th className="p-5 pr-8 text-center">Aksi Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {pendingLogbooks.length === 0 ? (
                          <tr><td colSpan={4} className="p-16 text-center text-gray-400 font-bold">Semua laporan harian sudah divalidasi. Laporan yang masuk akan muncul di sini.</td></tr>
                        ) : pendingLogbooks.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-5 pl-8 align-top">
                                <p className="font-bold text-gray-900 text-base mb-1">{log.nama_mahasiswa || 'Mahasiswa'}</p>
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">{log.tanggal}</span>
                              </td>
                              <td className="p-5 align-top">
                                <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap max-w-sm">{log.kegiatan}</p>
                              </td>
                              <td className="p-5 align-top text-center">
                                <a href={log.link_bukti} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> 
                                  Lihat Bukti
                                </a>
                              </td>
                              <td className="p-5 pr-8 align-top text-center">
                                <div className="flex flex-col gap-2">
                                  <button onClick={() => handleACCLogbook(log.id)} className="w-full px-3 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-lg hover:bg-emerald-200 transition-colors text-xs">✅ ACC Logbook</button>
                                  <button onClick={() => { setRevisiForm({ id_logbook: log.id, nama_mahasiswa: log.nama_mahasiswa, kegiatan: log.kegiatan, catatan_dosen: '' }); setShowRevisiModal(true); }} className="w-full px-3 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors text-xs">❌ Minta Revisi</button>
                                </div>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                 </motion.div>
               )}

               {/* TAB 4: INPUT PENILAIAN */}
               {activeTab === 'Penilaian' && (
                 <motion.div key="penilaian" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border">Belum ada mahasiswa yang bisa dinilai.</p> : activeBimbingan.map((item) => (
                      <div key={item.id} className="bg-white rounded-3xl p-6 border shadow-sm flex flex-col h-full hover:shadow-lg transition-shadow">
                         <h4 className="font-black text-gray-900 text-lg mb-1">{item.nama_mahasiswa}</h4>
                         <p className="text-xs text-gray-500 font-medium mb-6">{item.perusahaan}</p>
                         
                         <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 mb-6 flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nilai Akhir</span>
                            <span className={`text-3xl font-black ${item.nilai_dari_dosen ? 'text-green-500' : 'text-gray-300'}`}>{item.nilai_dari_dosen || '-'}</span>
                         </div>
                         
                         <button onClick={() => { setNilaiForm({ id_pengajuan: item.id, nama: item.nama_mahasiswa, perusahaan: item.perusahaan, nilai: item.nilai_dari_dosen || '' }); setShowNilaiModal(true); }} className={`mt-auto w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${item.nilai_dari_dosen ? 'bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-0.5'}`}>
                           {item.nilai_dari_dosen ? 'Edit Nilai' : 'Input Nilai Sekarang'}
                         </button>
                      </div>
                    ))}
                 </motion.div>
               )}

             </AnimatePresence>
           )}
        </div>
      </main>

      {/* MODAL INPUT PENILAIAN (YANG LAMA TETAP ADA) */}
      <AnimatePresence>
        {showNilaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowNilaiModal(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Evaluasi Akhir</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Input nilai huruf untuk magang <strong>{nilaiForm.nama}</strong>.</p>
              
              <form onSubmit={handleSubmitNilai}>
                <input type="text" required maxLength={2} value={nilaiForm.nilai} onChange={(e) => setNilaiForm({...nilaiForm, nilai: e.target.value.toUpperCase()})} className="w-32 mx-auto block text-center text-5xl font-black px-5 py-4 border-2 border-gray-200 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 uppercase transition-all bg-gray-50 focus:bg-white text-gray-900" placeholder="A" />
                
                <div className="flex gap-4 pt-8 mt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setShowNilaiModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1">Simpan Nilai</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---> FITUR BARU: MODAL CATATAN REVISI LOGBOOK <--- */}
      <AnimatePresence>
        {showRevisiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRevisiModal(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 z-10">
              
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-5">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-2">Permintaan Revisi Logbook</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Berikan pesan agar <strong>{revisiForm.nama_mahasiswa}</strong> tahu apa yang harus diperbaiki dari laporannya.</p>
              
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Logbook yang Direvisi:</p>
                <p className="text-sm text-gray-700 italic line-clamp-2">"{revisiForm.kegiatan}"</p>
              </div>

              <form onSubmit={handleSubmitRevisi}>
                <label className="block text-sm font-bold text-gray-700 mb-2">Catatan Dosen / Pesan Revisi *</label>
                <textarea required rows={4} value={revisiForm.catatan_dosen} onChange={(e) => setRevisiForm({...revisiForm, catatan_dosen: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-red-500 transition-all text-gray-900" placeholder="Contoh: Tolong jelaskan lebih detail bagian kode yang dibuat, dan pastikan melampirkan screenshot layarnya."></textarea>
                
                <div className="flex gap-4 pt-6 mt-4">
                  <button type="button" onClick={() => setShowRevisiModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/30 transition-all hover:-translate-y-1">
                    {isSubmitting ? 'Mengirim...' : 'Kirim Catatan Revisi'}
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