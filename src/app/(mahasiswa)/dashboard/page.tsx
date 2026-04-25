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

  // Modal State
  const [showLOAModal, setShowLOAModal] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  
  const [loaForm, setLoaForm] = useState({ perusahaan: '', posisi: '', link_loa: '' });
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', link_bukti: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      if (!resUser.ok) throw new Error("Unauthenticated");
      const userData = (await resUser.json()).data;
      setUser({ name: userData.name, nim: userData.nim_nidn, prodi: userData.prodi, role: userData.role, id: userData.id });

      const [resPengajuan, resLogbook] = await Promise.all([
        fetch('/api/Pengajuan'),
        fetch('/api/logbook')
      ]);
      
      if (resPengajuan.ok) {
        const data = await resPengajuan.json();
        // MENGGUNAKAN mahasiswaId SESUAI DENGAN MYSQL
        const userPengajuan = data.data.find((p: any) => p.mahasiswaId === userData.id);
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
      const res = await fetch('/api/Pengajuan', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(loaForm) 
      });
      
      if (!res.ok) {
        const errText = await res.text();
        let errMsg = 'Terjadi kesalahan sistem';
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.message;
        } catch (e) {
          errMsg = "Server Error (500). Gagal memproses data di Database.";
        }
        throw new Error(errMsg);
      }

      showToast('LOA Berhasil Diajukan!', 'success'); 
      setShowLOAModal(false); 
      setLoaForm({ perusahaan: '', posisi: '', link_loa: '' });
      fetchData();
    } catch (err: any) { 
      showToast(err.message, 'error'); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleBatalPengajuan = async () => {
    if (!confirm('Yakin ingin membatalkan pengajuan magang ini? Data akan dihapus permanen.')) return;
    try {
      await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'tolak', id: pengajuan.id }) });
      showToast('Pengajuan Dibatalkan', 'success'); fetchData();
    } catch (error) { showToast('Gagal membatalkan pengajuan', 'error'); }
  };

  const handleSubmitLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/logbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logbookForm) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Logbook berhasil ditambahkan!', 'success'); setShowLogbookModal(false); setLogbookForm({ tanggal: '', kegiatan: '', link_bukti: '' }); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusProgress = [
    { label: 'Upload LOA', done: !!pengajuan, active: !pengajuan },
    { label: 'Verifikasi Admin', done: pengajuan && pengajuan.status !== 'Menunggu_Verifikasi', active: pengajuan && pengajuan.status === 'Menunggu_Verifikasi' },
    { label: 'Pilih Dosen', done: pengajuan && pengajuan.status_dosen && pengajuan.status_dosen !== 'Menunggu', active: pengajuan && pengajuan.status === 'Disetujui' && pengajuan.status_dosen === 'Menunggu' },
    { label: 'Magang Aktif', done: pengajuan && pengajuan.status_dosen === 'Disetujui', active: false }
  ];

  if (isLoading || !user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[70]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-blue-900 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
          <p className="text-sm text-blue-200 mt-1 font-medium">Portal Mahasiswa</p>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto">
          <p className="px-2 text-[10px] font-black text-blue-300 uppercase tracking-wider mb-2">Menu Utama</p>

          <button onClick={() => setActiveTab('Magang')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Magang' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
             Status Magang
          </button>
          
          <button onClick={() => setActiveTab('Logbook')} disabled={!(pengajuan?.status_dosen === 'Disetujui')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'Logbook' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
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

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 px-10 py-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900">{activeTab === 'Magang' ? 'Progress & Status Pendaftaran' : 'Laporan Kegiatan Harian (Logbook)'}</h2>
          {activeTab === 'Logbook' && pengajuan?.status_dosen === 'Disetujui' && (
            <button onClick={() => setShowLogbookModal(true)} className="px-5 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">+ Isi Logbook</button>
          )}
        </header>

        <div className="p-10 max-w-5xl mx-auto w-full">
           <AnimatePresence mode="wait">
             
             {/* TAB 1: STATUS MAGANG */}
             {activeTab === 'Magang' && (
               <motion.div key="magang" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 
                 <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm flex items-center gap-6 mb-10">
                    <div className="w-20 h-20 bg-blue-100 text-[#1e3a8a] rounded-2xl flex items-center justify-center font-black text-3xl">{user.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900">{user.name}</h3>
                      <p className="text-gray-500 font-bold">{user.nim} • {user.prodi}</p>
                    </div>
                 </div>

                 <div className="bg-white rounded-[32px] p-8 md:p-12 border border-gray-100 shadow-sm mb-10 overflow-x-auto">
                    <div className="flex items-center min-w-max">
                      {statusProgress.map((step, idx) => (
                        <div key={idx} className="flex items-center relative">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-4 z-10 ${step.done ? 'bg-green-500 border-green-200 text-white' : step.active ? 'bg-[#1e3a8a] border-blue-200 text-white ring-4 ring-blue-500/20' : 'bg-gray-100 border-white text-gray-400'}`}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center">
                            <p className={`text-xs font-bold ${step.active || step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                          </div>
                          {idx !== statusProgress.length - 1 && (
                            <div className={`w-24 md:w-32 h-1.5 mx-2 rounded-full ${step.done ? 'bg-green-500' : 'bg-gray-100'}`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="h-8"></div>
                 </div>

                 {!pengajuan ? (
                    <div className="bg-blue-50/50 rounded-[32px] p-10 border border-blue-100 text-center">
                      <h4 className="text-xl font-black text-gray-900 mb-2">Belum Mengajukan Magang</h4>
                      <p className="text-gray-600 mb-6 max-w-lg mx-auto">Jika Anda sudah mendapatkan tempat magang dan Letter of Acceptance (LOA), silakan cantumkan link dokumen di sini.</p>
                      <button onClick={() => setShowLOAModal(true)} className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:-translate-y-1 transition-all">Input Link LOA</button>
                    </div>
                 ) : (
                    <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
                       
                       <div className="flex justify-between items-start mb-6">
                         <div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tempat Magang Aktif</p>
                           <h3 className="text-2xl font-black text-gray-900 mb-1">{pengajuan.perusahaan}</h3>
                           <p className="text-blue-600 font-bold">{pengajuan.posisi}</p>
                         </div>
                         <span className={`px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider border ${pengajuan.status_dosen === 'Disetujui' ? 'bg-green-50 text-green-700 border-green-200' : pengajuan.status === 'Menunggu_Verifikasi' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                           {pengajuan.status_dosen === 'Disetujui' ? 'MAGANG AKTIF' : pengajuan.status === 'Menunggu_Verifikasi' ? 'ANTREAN VERIFIKASI' : 'SELEKSI DOSEN'}
                         </span>
                       </div>

                       <div className="grid grid-cols-2 gap-4 mb-8">
                         <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                           <p className="text-xs font-bold text-gray-500 mb-1">Sistem Konversi (Dari Admin)</p>
                           <p className="font-black text-gray-900">{pengajuan.tipeKonversi || 'Belum Ditentukan'}</p>
                         </div>
                         <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                           <p className="text-xs font-bold text-gray-500 mb-1">Dosen Pembimbing</p>
                           <p className="font-black text-gray-900">{pengajuan.dosen_pembimbing || 'Belum Ada'}</p>
                         </div>
                       </div>

                       {pengajuan.status === 'Disetujui' && pengajuan.status_dosen === 'Menunggu' && (
                          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6">
                            <p className="text-amber-800 font-bold text-sm">Menunggu Konfirmasi Dosen. Harap hubungi dosen terkait agar segera di-ACC.</p>
                          </div>
                       )}

                       {pengajuan.status === 'Disetujui' && !pengajuan.dosen_pembimbing && (
                         <div className="pt-6 border-t border-gray-100 text-center">
                           <p className="text-gray-600 mb-4 font-medium">LOA disetujui! Langkah selanjutnya adalah memilih Dosen Pembimbing.</p>
                           <Link href="/pilih-dosen" className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg inline-block hover:-translate-y-1 transition-all">Pilih Dosen Sekarang</Link>
                         </div>
                       )}

                       {pengajuan.status === 'Menunggu_Verifikasi' && (
                         <div className="pt-6 border-t border-gray-100 flex justify-end">
                           <button onClick={handleBatalPengajuan} className="text-red-500 font-bold text-sm hover:underline">Batal & Tarik Pengajuan</button>
                         </div>
                       )}
                    </div>
                 )}
               </motion.div>
             )}

             {/* TAB 2: LOGBOOK */}
             {activeTab === 'Logbook' && (
               <motion.div key="logbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {logbooks.length === 0 ? (
                    <div className="bg-white rounded-[32px] p-16 text-center border border-gray-100 shadow-sm">
                       <h3 className="text-xl font-black text-gray-900 mb-2">Belum ada Logbook</h3>
                       <p className="text-gray-500 font-medium">Klik tombol "+ Isi Logbook" di pojok kanan atas untuk mulai melapor kegiatan.</p>
                    </div>
                  ) : logbooks.map((log) => (
                    <div key={log.id} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                         <div className="flex items-center gap-3">
                           <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center font-black">{log.tanggal.split('-')[2]}</div>
                           <div>
                             <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tanggal Laporan</p>
                             <p className="font-black text-gray-900">{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', month: 'long', year: 'numeric' })}</p>
                           </div>
                         </div>
                         <span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border w-fit ${log.status === 'Disetujui' ? 'bg-green-50 text-green-700 border-green-200' : log.status === 'Revisi' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                           {log.status || 'Menunggu'}
                         </span>
                       </div>

                       <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-4">
                         <p className="text-gray-700 font-medium leading-relaxed whitespace-pre-wrap text-sm">{log.kegiatan}</p>
                       </div>

                       {log.status === 'Revisi' && log.catatan_dosen && (
                         <div className="bg-red-50 rounded-xl p-5 border border-red-200 mb-4 flex items-start gap-3">
                            <span className="text-xl">⚠️</span>
                            <div>
                              <p className="text-xs font-bold text-red-700 uppercase tracking-widest mb-1">Catatan Revisi dari Dosen:</p>
                              <p className="text-red-900 text-sm font-medium italic">"{log.catatan_dosen}"</p>
                            </div>
                         </div>
                       )}

                       {log.link_bukti && (
                         <a href={log.link_bukti} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-600 hover:underline">Lampiran Dokumen Bukti ↗</a>
                       )}
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
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLOAModal(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Input Link LOA</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Pastikan nama perusahaan dan surat penerimaan asli ada di dalam link Google Drive Anda.</p>
              
              <form onSubmit={handleSubmitLOA} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nama Perusahaan *</label>
                  <input type="text" required value={loaForm.perusahaan} onChange={(e) => setLoaForm({...loaForm, perusahaan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Posisi Magang *</label>
                  <input type="text" required value={loaForm.posisi} onChange={(e) => setLoaForm({...loaForm, posisi: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Dokumen LOA (Google Drive) *</label>
                  <input type="url" required value={loaForm.link_loa} onChange={(e) => setLoaForm({...loaForm, link_loa: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" placeholder="Pastikan hak akses link bersifat publik (Anyone with link)" />
                </div>
                
                <div className="flex gap-4 pt-4 mt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowLOAModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all">{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL ISI LOGBOOK */}
      <AnimatePresence>
        {showLogbookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogbookModal(false)}></div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Laporan Kegiatan Harian</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Isi sesuai dengan tugas yang dikerjakan hari ini beserta link buktinya.</p>
              
              <form onSubmit={handleSubmitLogbook} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Kegiatan *</label>
                  <input type="date" required value={logbookForm.tanggal} onChange={(e) => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Kegiatan *</label>
                  <textarea required rows={4} value={logbookForm.kegiatan} onChange={(e) => setLogbookForm({...logbookForm, kegiatan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" placeholder="Ceritakan apa saja yang Anda kerjakan hari ini..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Link Bukti (Foto/Dokumen Google Drive) *</label>
                  <input type="url" required value={logbookForm.link_bukti} onChange={(e) => setLogbookForm({...logbookForm, link_bukti: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all" placeholder="Link folder atau file dokumentasi kegiatan" />
                </div>
                
                <div className="flex gap-4 pt-4 mt-2 border-t border-gray-100">
                  <button type="button" onClick={() => setShowLogbookModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all">{isSubmitting ? 'Menyimpan...' : 'Simpan Logbook'}</button>
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