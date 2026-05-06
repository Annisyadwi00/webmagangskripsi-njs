"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardMahasiswa() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'Magang' | 'Logbook'>('Magang');
  const [user, setUser] = useState<{name: string, nim: string, prodi: string, role: string, id: number} | null>(null);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  // Mobile & Dark Mode State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal State
  const [showLOAModal, setShowLOAModal] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  
  const [loaForm, setLoaForm] = useState({ perusahaan: '', posisi: '', link_loa: '' });
  const [logbookForm, setLogbookForm] = useState({ judul: 'Logbook Harian', tanggal: '', kegiatan: '', link_bukti: '' });

  useEffect(() => {
    // Cek apakah mode malam sudah aktif sebelumnya
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      if (!resUser.ok) throw new Error("Unauthenticated");
      const userData = (await resUser.json()).data;
      setUser({ name: userData.name, nim: userData.nim_nidn, prodi: userData.prodi, role: userData.role, id: userData.id });

      const [resPengajuan, resLogbook] = await Promise.all([
        fetch('/api/pengajuan'),
        fetch('/api/logbook')
      ]);
      
      if (resPengajuan.ok) {
        const data = await resPengajuan.json();
        const userPengajuan = data.data.find((p: any) => p.user_id === userData.id);
        setPengajuan(userPengajuan || null);
      }
      if (resLogbook.ok) setLogbooks((await resLogbook.json()).data || []);
      
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleSubmitLOA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { perusahaan: loaForm.perusahaan, posisi: loaForm.posisi, link_loa: loaForm.link_loa, nama_mahasiswa: user?.name };
      const res = await fetch('/api/pengajuan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Terjadi kesalahan sistem');
      showToast('LOA Berhasil Diajukan!', 'success'); setShowLOAModal(false); setLoaForm({ perusahaan: '', posisi: '', link_loa: '' }); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleBatalPengajuan = async () => {
    if (!confirm('Yakin ingin menghapus pengajuan magang ini? Anda harus menginput ulang dari awal.')) return;
    try {
      await fetch('/api/pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'batal' }) });
      showToast('Pengajuan Dihapus', 'success'); fetchData();
    } catch (error) { showToast('Gagal membatalkan pengajuan', 'error'); }
  };

  const handleSubmitLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { judul: logbookForm.judul, tanggal: logbookForm.tanggal, kegiatan: logbookForm.kegiatan, link_bukti: logbookForm.link_bukti };
      const res = await fetch('/api/logbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyimpan logbook');
      showToast('Logbook berhasil ditambahkan!', 'success'); setShowLogbookModal(false); setLogbookForm({ judul: 'Logbook Harian', tanggal: '', kegiatan: '', link_bukti: '' }); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusProgress = [
    { label: 'Upload LOA', done: !!pengajuan, active: !pengajuan },
    { label: 'Verifikasi Admin', done: pengajuan && (pengajuan.status !== 'Menunggu_Verifikasi' && pengajuan.status !== 'Ditolak'), active: pengajuan && pengajuan.status === 'Menunggu_Verifikasi' },
    { label: 'Pilih Dosen', done: pengajuan && pengajuan.status_dosen && pengajuan.status_dosen !== 'Menunggu', active: pengajuan && pengajuan.status === 'Pilih_Dosen' },
    { label: 'Magang Aktif', done: pengajuan && pengajuan.status_dosen === 'Disetujui', active: pengajuan && pengajuan.status === 'Aktif' && pengajuan.status_dosen === 'Menunggu' }
  ];

  if (isLoading || !user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex font-sans relative overflow-hidden">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[70]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Sidebar untuk HP */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar - Sekarang Mendukung Mobile */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#1e3a8a] to-blue-900 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
            <p className="text-sm text-blue-200 mt-1 font-medium">Portal Mahasiswa</p>
          </div>
          {/* Tombol Tutup Sidebar di HP */}
          <button className="md:hidden text-white text-2xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="px-2 text-[10px] font-black text-blue-300 uppercase tracking-wider mb-2">Menu Utama</p>

          <button onClick={() => {setActiveTab('Magang'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Magang' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
             Status Magang
          </button>
          
          <button onClick={() => {setActiveTab('Logbook'); setIsMobileMenuOpen(false);}} disabled={!(pengajuan?.status_dosen === 'Disetujui')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'Logbook' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
             Logbook Harian
          </button>
          
          <Link href="/lowongan" className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-blue-100 hover:bg-white/10 hover:translate-x-1">Bursa Magang</Link>
          <Link href="/settings" className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-blue-100 hover:bg-white/10 hover:translate-x-1">Pengaturan Profil</Link>
        </nav>
        
        <div className="p-6 border-t border-white/10 mt-auto flex flex-col gap-3">
          <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all shadow-sm border border-white/10 hover:-translate-y-0.5">Kembali ke Beranda</Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20 hover:-translate-y-0.5">Logout Akun</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header - Tombol Hamburger & Dark Mode Toggle */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-slate-800 px-6 md:px-10 py-5 md:py-6 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-900 dark:text-white text-2xl" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{activeTab === 'Magang' ? 'Progress Pendaftaran' : 'Laporan Logbook'}</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Tombol Dark Mode */}
            <button onClick={toggleDarkMode} className="p-2 md:p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-xl">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {activeTab === 'Logbook' && pengajuan?.status_dosen === 'Disetujui' && (
              <button onClick={() => setShowLogbookModal(true)} className="px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">+ Logbook</button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-5xl mx-auto w-full">
           <AnimatePresence mode="wait">
             
             {/* TAB 1: STATUS MAGANG */}
             {activeTab === 'Magang' && (
               <motion.div key="magang" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 
                 <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6 mb-8 md:mb-10 transition-colors">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-[#1e3a8a] text-[#1e3a8a] dark:text-white rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl">{user.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base">{user.nim} • {user.prodi}</p>
                    </div>
                 </div>

                 {/* Progress Bar - Bisa Digeser Kanan-Kiri di HP */}
                 <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-12 border border-gray-100 dark:border-slate-700 shadow-sm mb-8 md:mb-10 overflow-x-auto pb-10 transition-colors">
                    <div className="flex items-center min-w-max px-4">
                      {statusProgress.map((step, idx) => (
                        <div key={idx} className="flex items-center relative">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base md:text-lg border-4 z-10 transition-colors ${step.done ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900 text-white' : step.active ? 'bg-[#1e3a8a] border-blue-200 dark:border-blue-900 text-white ring-4 ring-blue-500/20' : 'bg-gray-100 dark:bg-slate-700 border-white dark:border-slate-800 text-gray-400 dark:text-slate-500'}`}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center">
                            <p className={`text-[10px] md:text-xs font-bold ${step.active || step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{step.label}</p>
                          </div>
                          {idx !== statusProgress.length - 1 && (
                            <div className={`w-16 md:w-32 h-1 md:h-1.5 mx-2 rounded-full transition-colors ${step.done ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-slate-700'}`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                 </div>

                 {!pengajuan ? (
                    <div className="bg-blue-50/50 dark:bg-slate-800/50 rounded-[32px] p-8 md:p-10 border border-blue-100 dark:border-slate-700 text-center transition-colors">
                      <h4 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2">Belum Mengajukan Magang</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto text-sm md:text-base">Jika Anda sudah mendapatkan tempat magang dan Letter of Acceptance (LOA), silakan cantumkan link dokumen di sini.</p>
                      <button onClick={() => setShowLOAModal(true)} className="px-6 py-3 md:px-8 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:-translate-y-1 transition-all">Input Link LOA</button>
                    </div>
                 ) : pengajuan.status === 'Ditolak' ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-[32px] p-8 md:p-10 border border-red-200 dark:border-red-900/50 text-center transition-colors">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl font-black">!</div>
                      <h4 className="text-lg md:text-xl font-black text-red-900 dark:text-red-400 mb-2">Pengajuan LOA Ditolak</h4>
                      <p className="text-red-700 dark:text-red-300 mb-6 max-w-lg mx-auto font-medium text-sm md:text-base">
                        Pengajuan magang di <b>{pengajuan.perusahaan}</b> ditolak oleh Admin Fakultas dengan alasan:<br/>
                        <span className="block mt-4 p-4 bg-red-100 dark:bg-red-900/50 rounded-xl italic font-bold">"{pengajuan.alasan_penolakan || 'Tidak ada alasan'}"</span>
                      </p>
                      <button onClick={handleBatalPengajuan} className="px-6 py-3 md:px-8 md:py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all">Hapus & Ajukan Ulang LOA</button>
                    </div>
                 ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-[#1e3a8a]/20 rounded-bl-full -z-10"></div>
                       
                       <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                         <div>
                           <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tempat Magang Aktif</p>
                           <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1">{pengajuan.perusahaan}</h3>
                           <p className="text-blue-600 dark:text-blue-400 font-bold">{pengajuan.posisi}</p>
                         </div>
                         <span className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider border w-fit ${pengajuan.status_dosen === 'Disetujui' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : pengajuan.status === 'Menunggu_Verifikasi' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>
                           {pengajuan.status_dosen === 'Disetujui' ? 'MAGANG AKTIF' : pengajuan.status === 'Menunggu_Verifikasi' ? 'ANTREAN VERIFIKASI' : 'SELEKSI DOSEN'}
                         </span>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sistem Konversi (Dari Admin)</p>
                           <p className="font-black text-gray-900 dark:text-white text-sm md:text-base">{pengajuan.tipeKonversi || 'Belum Ditentukan'}</p>
                         </div>
                         <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Dosen Pembimbing</p>
                           <p className="font-black text-gray-900 dark:text-white text-sm md:text-base">{pengajuan.nama_dosen || 'Belum Ada'}</p>
                         </div>
                       </div>

                       {pengajuan.status === 'Aktif' && pengajuan.status_dosen === 'Menunggu' && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 mb-6 transition-colors">
                            <p className="text-amber-800 dark:text-amber-400 font-bold text-xs md:text-sm">Menunggu Konfirmasi Dosen. Harap hubungi dosen terkait agar segera di-ACC.</p>
                          </div>
                       )}

                       {pengajuan.status === 'Pilih_Dosen' && (
                         <div className="pt-6 border-t border-gray-100 dark:border-slate-700 text-center transition-colors">
                           <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium text-sm md:text-base">LOA disetujui! Langkah selanjutnya adalah memilih Dosen Pembimbing.</p>
                           <Link href="/pilih-dosen" className="px-6 py-3 md:px-8 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg inline-block hover:-translate-y-1 transition-all">Pilih Dosen Sekarang</Link>
                         </div>
                       )}

                       {pengajuan.status === 'Menunggu_Verifikasi' && (
                         <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end transition-colors">
                           <button onClick={handleBatalPengajuan} className="text-red-500 dark:text-red-400 font-bold text-xs md:text-sm hover:underline">Batal & Tarik Pengajuan</button>
                         </div>
                       )}
                    </div>
                 )}
               </motion.div>
             )}

             {/* TAB 2: LOGBOOK */}
             {activeTab === 'Logbook' && (
               <motion.div key="logbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 md:space-y-5">
                  {logbooks.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-10 md:p-16 text-center border border-gray-100 dark:border-slate-700 shadow-sm transition-colors">
                       <h3 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2">Belum ada Logbook</h3>
                       <p className="text-gray-500 dark:text-gray-400 font-medium text-sm md:text-base">Klik tombol "+ Logbook" di pojok kanan atas untuk mulai melapor kegiatan.</p>
                    </div>
                  ) : logbooks.map((log) => (
                    <div key={log.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                       <div className={`absolute left-0 top-0 bottom-0 w-2 ${log.status === 'Disetujui' ? 'bg-emerald-500' : log.status === 'Ditolak' ? 'bg-red-500' : 'bg-amber-400'}`}></div>

                       <div className="pl-3 md:pl-4">
                         <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 md:gap-4 mb-4">
                           <div>
                             <div className="flex items-center gap-3 mb-1">
                               <h4 className="text-lg md:text-xl font-black text-gray-900 dark:text-white">{log.judul || 'Logbook'}</h4>
                               <span className={`px-2 py-1 text-[9px] md:text-[10px] font-black uppercase tracking-wider rounded-lg border ${log.status === 'Disetujui' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : log.status === 'Ditolak' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                                 {log.status === 'Pending' ? 'Menunggu Dosen' : log.status}
                               </span>
                             </div>
                             <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                               📅 {new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                             </p>
                           </div>
                         </div>

                         <div className="bg-slate-50/80 dark:bg-slate-700/50 rounded-xl p-4 md:p-5 border border-slate-100 dark:border-slate-600 mb-4 md:mb-5 transition-colors">
                           <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-wrap text-xs md:text-sm">{log.kegiatan}</p>
                         </div>

                         {log.status === 'Ditolak' && log.feedback && (
                           <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900/50 mb-4 md:mb-5 flex items-start gap-3 transition-colors">
                              <span className="text-base md:text-lg">⚠️</span>
                              <div>
                                <p className="text-[10px] md:text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-widest mb-1">Catatan Revisi Dosen:</p>
                                <p className="text-red-900 dark:text-red-300 text-xs md:text-sm font-medium italic">"{log.feedback}"</p>
                              </div>
                           </div>
                         )}

                         {log.link_dokumen && (
                           <a href={log.link_dokumen} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs md:text-sm font-bold text-[#1e3a8a] dark:text-blue-400 bg-blue-50/50 dark:bg-[#1e3a8a]/20 hover:bg-blue-100 dark:hover:bg-[#1e3a8a]/40 px-3 md:px-4 py-2 md:py-2.5 rounded-xl transition-all">
                             📎 Buka Lampiran Bukti
                           </a>
                         )}
                       </div>
                    </div>
                  ))}
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </main>

      {/* MODAL INPUT LINK LOA */}
      <AnimatePresence>
        {showLOAModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLOAModal(false)}></div>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 md:hidden"></div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Input Link LOA</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs md:text-sm border-b dark:border-slate-700 pb-6">Pastikan nama perusahaan dan surat penerimaan asli ada di dalam link Google Drive Anda.</p>
              
              <form onSubmit={handleSubmitLOA} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Perusahaan *</label>
                  <input type="text" required value={loaForm.perusahaan} onChange={(e) => setLoaForm({...loaForm, perusahaan: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Posisi Magang *</label>
                  <input type="text" required value={loaForm.posisi} onChange={(e) => setLoaForm({...loaForm, posisi: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Dokumen LOA *</label>
                  <input type="url" required value={loaForm.link_loa} onChange={(e) => setLoaForm({...loaForm, link_loa: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div className="flex gap-3 md:gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowLOAModal(false)} className="flex-1 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all text-sm md:text-base">{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ISI LOGBOOK */}
      <AnimatePresence>
        {showLogbookModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogbookModal(false)}></div>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 md:hidden"></div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Isi Logbook</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs md:text-sm border-b dark:border-slate-700 pb-6">Laporkan progres dan rincian pekerjaan Anda secara berkala.</p>
              
              <form onSubmit={handleSubmitLogbook} className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipe Logbook *</label>
                    <select required value={logbookForm.judul} onChange={(e) => setLogbookForm({...logbookForm, judul: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all appearance-none text-sm md:text-base">
                      <option value="Logbook Harian">Logbook Harian</option>
                      <option value="Logbook Mingguan">Logbook Mingguan</option>
                      <option value="Logbook Bulanan">Logbook Bulanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal *</label>
                    <input type="date" required value={logbookForm.tanggal} onChange={(e) => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Pekerjaan *</label>
                  <textarea required rows={4} value={logbookForm.kegiatan} onChange={(e) => setLogbookForm({...logbookForm, kegiatan: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" placeholder="Ceritakan apa saja yang Anda kerjakan..."></textarea>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Bukti (Drive) *</label>
                  <input type="url" required value={logbookForm.link_bukti} onChange={(e) => setLogbookForm({...logbookForm, link_bukti: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" placeholder="Link dokumentasi kegiatan" />
                </div>
                
                <div className="flex gap-3 md:gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowLogbookModal(false)} className="flex-1 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all text-sm md:text-base">{isSubmitting ? 'Menyimpan...' : 'Kirim Logbook'}</button>
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