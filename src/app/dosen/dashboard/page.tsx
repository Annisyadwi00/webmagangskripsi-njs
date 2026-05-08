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
  // ---> FUNGSI MEMUNCULKAN NOTIFIKASI TOAST <---
  // ---> MESIN NOTIFIKASI TOAST (PASTIKAN KEDUANYA ADA DI SINI) <---
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  // Modal Input Nilai
  const [showNilaiModal, setShowNilaiModal] = useState(false);
  const [nilaiForm, setNilaiForm] = useState({ 
    id_pengajuan: 0, 
    nama: '', 
    perusahaan: '', 
    n_aktivitas: 0, 
    n_dokumen: 0, 
    n_kinerja: 0, 
    n_perusahaan: 0,
    masukan_terakhir: '',
    langkah_selanjutnya: ''
  });

  // ---> FITUR BARU: Modal Catatan Revisi Logbook <---
  // ---> MODAL REVIEW LOGBOOK (NILAI, STATUS, CATATAN) <---
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ id_logbook: 0, nama_mahasiswa: '', kegiatan: '', catatan_dosen: '', nilai: '', status: 'Disetujui' });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logbook', { 
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          id: reviewForm.id_logbook, 
          status: reviewForm.status, 
          catatan_dosen: reviewForm.catatan_dosen,
          nilai: reviewForm.nilai ? Number(reviewForm.nilai) : null
        }) 
      });
      if (!res.ok) throw new Error("Gagal mengirim review logbook");
      showToast(`Review dan Nilai berhasil disimpan!`, "success");
      setShowReviewModal(false);
      fetchData(); 
    } catch (err: any) { 
      showToast(err.message, "error"); 
    } finally {
      setIsSubmitting(false);
    }
  };
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Cek tema saat halaman dosen dimuat
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resBimbingan, resLogbook] = await Promise.all([
        fetch('/api/pengajuan'),
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
      const res = await fetch('/api/pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id_pengajuan }) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Berhasil ${action} mahasiswa.`, "success"); fetchData();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };
  const hitungNilaiHuruf = () => {
    const total = (Number(nilaiForm.n_aktivitas) + Number(nilaiForm.n_dokumen) + Number(nilaiForm.n_kinerja) + Number(nilaiForm.n_perusahaan)) / 4;
    if (total >= 80) return 'A';
    if (total >= 70) return 'B';
    if (total >= 60) return 'C';
    return 'D';
  };
  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const nilaiAkhir = hitungNilaiHuruf();
      const res = await fetch('/api/pengajuan', { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ 
          id_pengajuan: nilaiForm.id_pengajuan, 
          nilai_dari_dosen: nilaiAkhir,
          masukan_dosen: nilaiForm.masukan_terakhir,   // Kolom masukan
          saran_dosen: nilaiForm.langkah_selanjutnya    // Kolom langkah selanjutnya
        }) 
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Evaluasi & Nilai ${nilaiAkhir} Berhasil Disimpan!`, "success"); 
      setShowNilaiModal(false); 
      fetchData();
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
        body: JSON.stringify({ 
          id: revisiForm.id_logbook, 
          status: 'Disetujui', // Jika dosen ngisi nilai, kita anggap disetujui
          catatan_dosen: revisiForm.catatan_dosen,
          nilai: Number(revisiForm.nilai) // <--- KIRIM NILAI KE API
        }) 
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
    window.location.href = '/';
  };

  const pendingBimbingan = bimbinganList.filter(b => b.status_dosen !== 'Disetujui' && b.status_dosen !== 'Ditolak');
  const activeBimbingan = bimbinganList.filter(b => b.status_dosen === 'Disetujui');
  // Kita tambahkan 'Pending' agar logbook yang baru diisi mahasiswa bisa terbaca
const pendingLogbooks = logbooks.filter(l => l.status === 'Pending' || l.status === 'Menunggu Validasi' || !l.status);

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
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-slate-800 px-10 py-6 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {activeTab === 'Permintaan' ? 'Validasi Permintaan Bimbingan' : 
             activeTab === 'Aktif' ? 'Daftar Mahasiswa Bimbingan' : 
             activeTab === 'Logbook' ? 'Validasi Laporan Logbook' : 
             'Evaluasi & Penilaian Akhir'}
          </h2>
          
          {/* TOMBOL DARK MODE */}
          <button onClick={toggleDarkMode} className="p-2 md:p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 rounded-full border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-xl" title="Ganti Tema">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
           {isLoading ? (
             <div className="flex items-center justify-center h-64">
               <svg className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </div>
           ) : (
             <AnimatePresence mode="wait">
               
               {/* TAB 1: PERMINTAAN BIMBINGAN */}
               {activeTab === 'Permintaan' && (
                 <motion.div key="permintaan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 transition-colors">Belum ada permintaan bimbingan baru.</p> : pendingBimbingan.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full hover:shadow-lg transition-all">
                         <h4 className="font-black text-gray-900 dark:text-white text-xl">{item.nama_mahasiswa}</h4>
                         <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-6">{item.perusahaan} - {item.posisi}</p>
                         <div className="flex gap-3 mt-auto">
                            <button onClick={() => handlePersetujuan(item.id, 'tolak', item.nama_mahasiswa)} className="flex-1 py-3 bg-white dark:bg-slate-700 border-2 border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Tolak</button>
                            <button onClick={() => handlePersetujuan(item.id, 'terima', item.nama_mahasiswa)} className="flex-1 py-3 bg-indigo-600 dark:bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-md">Terima Bimbingan</button>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}

               {/* TAB 2: MAHASISWA AKTIF */}
               {activeTab === 'Aktif' && (
                 <motion.div key="aktif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {activeBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 transition-colors">Belum ada mahasiswa yang aktif dibimbing.</p> : activeBimbingan.map((b) => (
                      <div key={b.id} className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
                         <div className="flex items-center gap-4 mb-4">
                           <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-black text-xl">{b.nama_mahasiswa.charAt(0)}</div>
                           <div>
                             <h4 className="font-black text-gray-900 dark:text-white text-lg">{b.nama_mahasiswa}</h4>
                             <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{b.perusahaan}</p>
                           </div>
                         </div>
                         <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 border border-gray-100 dark:border-slate-600 flex justify-between items-center transition-colors">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Sistem Konversi</span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg font-bold">{b.tipeKonversi}</span>
                         </div>
                      </div>
                    ))}
                 </motion.div>
               )}

               {/* TAB 3: VALIDASI LOGBOOK */}
               {activeTab === 'Logbook' && (
                 <motion.div key="logbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase font-bold border-b border-gray-100 dark:border-slate-700 transition-colors">
                          <th className="p-5 pl-8">Mahasiswa & Tanggal</th>
                          <th className="p-5">Deskripsi Kegiatan</th>
                          <th className="p-5 text-center">Bukti / Dokumen</th>
                          <th className="p-5 pr-8 text-center">Aksi Validasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-slate-700 text-sm">
                        {pendingLogbooks.length === 0 ? (
                          <tr><td colSpan={4} className="p-16 text-center text-gray-400 dark:text-gray-500 font-bold">Semua laporan harian sudah divalidasi. Laporan yang masuk akan muncul di sini.</td></tr>
                        ) : pendingLogbooks.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                              <td className="p-5 pl-8 align-top">
                                <p className="font-bold text-gray-900 dark:text-white text-base mb-1">{log.nama_mahasiswa || 'Mahasiswa'}</p>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{log.tanggal}</span>
                              </td>
                              <td className="p-5 align-top">
                                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed whitespace-pre-wrap max-w-sm">{log.kegiatan}</p>
                              </td>
                              <td className="p-5 align-top text-center">
                              <a href={log.link_dokumen} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs bg-blue-50 dark:bg-blue-900/30 px-3 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> 
                               Lihat Bukti
                               </a>
                              </td>
                              <td className="p-5 pr-8 align-top text-center">
                                <button 
                                  onClick={() => { 
                                    setReviewForm({ id_logbook: log.id, nama_mahasiswa: log.nama_mahasiswa, kegiatan: log.kegiatan, catatan_dosen: '', nilai: '', status: 'Disetujui' }); 
                                    setShowReviewModal(true); 
                                  }} 
                                  className="w-full px-3 py-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 font-bold rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors text-xs shadow-sm"
                                >
                                  📝 Beri Review & Nilai
                                </button>
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
                    {activeBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 dark:text-gray-400 font-bold bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700 transition-colors">Belum ada mahasiswa yang bisa dinilai.</p> : activeBimbingan.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col h-full hover:shadow-lg transition-all">
                         <h4 className="font-black text-gray-900 dark:text-white text-lg mb-1">{item.nama_mahasiswa}</h4>
                         <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-6">{item.perusahaan}</p>
                         
                         <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-600 mb-6 flex justify-between items-center transition-colors">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nilai Akhir</span>
                            <span className={`text-3xl font-black ${item.nilai_dari_dosen ? 'text-green-500 dark:text-green-400' : 'text-gray-300 dark:text-gray-600'}`}>{item.nilai_dari_dosen || '-'}</span>
                         </div>
                         
                         <button onClick={() => { setNilaiForm({ id_pengajuan: item.id, nama: item.nama_mahasiswa, perusahaan: item.perusahaan, nilai: item.nilai_dari_dosen || '' }); setShowNilaiModal(true); }} className={`mt-auto w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${item.nilai_dari_dosen ? 'bg-white dark:bg-slate-700 border-2 border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-600' : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 hover:-translate-y-0.5'}`}>
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
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-8 z-10 transition-colors">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Evaluasi Akhir Mahasiswa</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm border-b dark:border-slate-700 pb-4">Input skor (1-100) untuk masing-masing kriteria <strong>{nilaiForm.nama}</strong>.</p>
              
              <form onSubmit={handleSubmitNilai} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nilai Aktivitas</label>
                    <input type="number" min="0" max="100" required value={nilaiForm.n_aktivitas} onChange={(e) => setNilaiForm({...nilaiForm, n_aktivitas: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nilai Dokumen</label>
                    <input type="number" min="0" max="100" required value={nilaiForm.n_dokumen} onChange={(e) => setNilaiForm({...nilaiForm, n_dokumen: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nilai Kinerja</label>
                    <input type="number" min="0" max="100" required value={nilaiForm.n_kinerja} onChange={(e) => setNilaiForm({...nilaiForm, n_kinerja: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0-100" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nilai Perusahaan</label>
                    <input type="number" min="0" max="100" required value={nilaiForm.n_perusahaan} onChange={(e) => setNilaiForm({...nilaiForm, n_perusahaan: Number(e.target.value)})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0-100" />
                  </div>
                </div>

                {/* LIVE PREVIEW HASIL */}
                <div className="mt-6 p-5 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex justify-between items-center transition-colors">
                  <div>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Estimasi Nilai Akhir</p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-300 font-medium italic">* Rata-rata otomatis</p>
                  </div>
                  <div className="text-center">
                    <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{hitungNilaiHuruf()}</span>
                  </div>
                  {/* FORM KALIMAT MASUKAN & LANGKAH SELANJUTNYA */}
                <div className="space-y-4 mt-6 pt-6 border-t dark:border-slate-700">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Masukan Terakhir untuk Mahasiswa</label>
                    <textarea required rows={3} value={nilaiForm.masukan_terakhir} onChange={(e) => setNilaiForm({...nilaiForm, masukan_terakhir: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Berikan evaluasi menyeluruh tentang kinerjanya..."></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Langkah yang Harus Dilakukan Selanjutnya</label>
                    <textarea required rows={2} value={nilaiForm.langkah_selanjutnya} onChange={(e) => setNilaiForm({...nilaiForm, langkah_selanjutnya: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 text-sm" placeholder="Contoh: Segera kumpulkan laporan akhir ke prodi..."></textarea>
                  </div>
                  </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowNilaiModal(false)} className="flex-1 py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg transition-all">Simpan Nilai</button>
                </div>
              </form>
            </motion.div>
        )}
      </AnimatePresence>

      {/* ---> FITUR BARU: MODAL CATATAN REVISI LOGBOOK <--- */}
      {/* ---> MODAL REVIEW LOGBOOK (NILAI, STATUS & CATATAN) <--- */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-8 z-10 transition-colors max-h-[90vh] overflow-y-auto custom-scrollbar">
              
              <button onClick={() => setShowReviewModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Review Logbook</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm border-b dark:border-slate-700 pb-4">Berikan persetujuan, nilai, dan catatan untuk <strong className="text-gray-900 dark:text-white">{reviewForm.nama_mahasiswa}</strong>.</p>
              
              <div className="mb-6 bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-gray-100 dark:border-slate-600 transition-colors">
                <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase mb-1">Kegiatan yang Direview:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-2">"{reviewForm.kegiatan}"</p>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Persetujuan *</label>
                    <select required value={reviewForm.status} onChange={(e) => setReviewForm({...reviewForm, status: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm cursor-pointer font-bold">
                      <option value="Disetujui">✅ Disetujui</option>
                      <option value="Revisi">❌ Minta Revisi</option>
                      <option value="Ditolak">⛔ Ditolak</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Nilai (1-100)</label>
                    <input type="number" min="0" max="100" value={reviewForm.nilai} onChange={(e) => setReviewForm({...reviewForm, nilai: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm font-bold" placeholder="Contoh: 85" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Catatan / Pesan Dosen</label>
                  <textarea rows={3} value={reviewForm.catatan_dosen} onChange={(e) => setReviewForm({...reviewForm, catatan_dosen: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" placeholder="Berikan evaluasi atau detail revisi (opsional)..."></textarea>
                </div>
                
                <div className="flex gap-4 pt-4 mt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white font-black rounded-xl hover:bg-indigo-700 dark:bg-indigo-600 shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-1">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Review & Nilai'}
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
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>
    </div>
  );
}