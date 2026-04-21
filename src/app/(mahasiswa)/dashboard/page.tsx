"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Status' | 'Logbook' | 'Profil'>('Status');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const [loaForm, setLoaForm] = useState({ link_loa: '', nama_perusahaan: '', posisi: '' });
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', link_bukti: '' });
  const [logbooks, setLogbooks] = useState<any[]>([]);

  const [profile, setProfile] = useState({ 
    nama: "Memuat...", nim: "Memuat...", email: "Memuat...", prodi: "S1 Informatika",
    status: "Belum_Upload", perusahaan: "-", posisi: "-", tipeKonversi: "-", matkulKonversi: [] as string[], dosen: "-"
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchAllData = async () => {
    try {
      const [resUser, resPengajuan, resLogbook] = await Promise.all([
        fetch('/api/auth/me'), fetch('/api/Pengajuan'), fetch('/api/logbook')
      ]);

      if (resUser.ok) {
        const userData = (await resUser.json()).data;
        setProfile(prev => ({ ...prev, nama: userData.name, nim: userData.nim_nidn, email: userData.email, prodi: userData.prodi || "S1 Informatika" }));
      }
      if (resPengajuan.ok) {
        const pengajuanData = (await resPengajuan.json()).data;
        if (pengajuanData) {
          setProfile(prev => ({
            ...prev, status: pengajuanData.status, perusahaan: pengajuanData.perusahaan, posisi: pengajuanData.posisi,
            tipeKonversi: pengajuanData.tipeKonversi || "-", matkulKonversi: pengajuanData.matkulKonversi ? JSON.parse(pengajuanData.matkulKonversi) : [], dosen: pengajuanData.nama_dosen || "-"
          }));
        }
      }
      if (resLogbook.ok) setLogbooks((await resLogbook.json()).data || []);
    } catch (error) {
      console.error("Gagal memuat data", error);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleLoaSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/Pengajuan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loaForm) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast("LOA berhasil dikirim! Menunggu verifikasi.", "success");
      setLoaForm({ link_loa: '', nama_perusahaan: '', posisi: '' }); fetchAllData(); 
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  const handleLogbookSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/logbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(logbookForm) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast("Logbook berhasil dicatat!", "success");
      setLogbookForm({ tanggal: '', kegiatan: '', link_bukti: '' }); fetchAllData();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-50">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.type === 'success' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR MAHASISWA */}
      <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-blue-900 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl z-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="p-8 border-b border-white/10 relative z-10">
          <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
          <p className="text-sm text-blue-300 mt-1 font-medium">Portal Mahasiswa</p>
        </div>
        <nav className="flex-1 py-8 px-5 space-y-3 relative z-10">
          <button onClick={() => setActiveTab('Status')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Status' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Status & LOA
          </button>
          <button onClick={() => setActiveTab('Logbook')} disabled={profile.status !== 'Aktif'} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${profile.status !== 'Aktif' ? 'opacity-50 cursor-not-allowed' : activeTab === 'Logbook' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg> Logbook Harian
          </button>
          <Link href="/settings" className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all text-slate-200 hover:bg-white/10 hover:translate-x-1">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Pengaturan Profil
          </Link>
        </nav>
        
        {/* TOMBOL BACK & LOGOUT */}
        <div className="p-6 border-t border-white/10 mt-auto relative z-10 flex flex-col gap-3">
          <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all shadow-sm backdrop-blur-sm border border-white/10 hover:-translate-y-0.5">
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
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Portal Akademik</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{profile.nama} • {profile.nim}</p>
          </div>
          <div className="flex items-center">
            <span className={`px-5 py-2 font-black rounded-xl text-xs flex items-center gap-2 border shadow-sm transition-colors ${profile.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-200' : profile.status === 'Menunggu_Verifikasi' ? 'bg-amber-50 text-amber-700 border-amber-200' : profile.status === 'Pilih_Dosen' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {profile.status === 'Aktif' && <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>}
              {profile.status.replace('_', ' ')}
            </span>
          </div>
        </header>

        <div className="p-10 max-w-5xl mx-auto w-full">
           <AnimatePresence mode="wait">
              {/* TAB STATUS */}
              {activeTab === 'Status' && (
                <motion.div key="status" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-6">
                  {profile.status === 'Belum_Upload' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex items-center gap-5">
                        <div className="p-4 bg-white text-blue-600 rounded-2xl shadow-sm"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                        <div><h3 className="text-2xl font-black text-gray-900 mb-1">Lapor Diterima Magang (LOA)</h3><p className="text-gray-600 font-medium">Unggah tautan dokumen LOA Anda agar bisa diverifikasi oleh Admin/Prodi.</p></div>
                      </div>
                      <form onSubmit={handleLoaSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Nama Perusahaan *</label><input type="text" required value={loaForm.nama_perusahaan} onChange={(e) => setLoaForm({...loaForm, nama_perusahaan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900" placeholder="PT Contoh Digital" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Posisi / Role Magang *</label><input type="text" required value={loaForm.posisi} onChange={(e) => setLoaForm({...loaForm, posisi: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900" placeholder="Web Developer Intern" /></div>
                        </div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Tautan Link G-Drive LOA *</label><input type="url" required value={loaForm.link_loa} onChange={(e) => setLoaForm({...loaForm, link_loa: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900" placeholder="https://drive.google.com/..." /></div>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:bg-blue-900 transition-all hover:-translate-y-1">{isSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan Verifikasi'}</button>
                      </form>
                    </div>
                  )}

                  {profile.status === 'Menunggu_Verifikasi' && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-12 text-center shadow-sm">
                      <h3 className="text-3xl font-black text-amber-900 mb-3">Tahap Verifikasi LOA</h3>
                      <p className="text-amber-800 mb-8 font-medium text-lg">Dokumen magang Anda di <strong>{profile.perusahaan}</strong> sedang ditinjau oleh Admin Prodi.</p>
                    </div>
                  )}

                  {profile.status === 'Pilih_Dosen' && (
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                      <div>
                        <h2 className="text-4xl font-black mb-2 tracking-tight">Selamat, LOA Disetujui! 🎉</h2>
                        <p className="text-green-50 font-medium text-lg">Silakan pilih Dosen Pembimbing untuk magang Anda.</p>
                      </div>
                      <Link href="/pilih-dosen" className="px-8 py-4 bg-white text-green-700 font-black rounded-2xl shadow-lg hover:scale-105 transition-transform text-lg whitespace-nowrap">Pilih Dosen Sekarang</Link>
                    </div>
                  )}

                  {profile.status === 'Aktif' && (
                    <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                      <span className="inline-block px-3 py-1 bg-white/20 rounded-lg text-xs font-black uppercase tracking-widest mb-4">Penempatan Magang Aktif</span>
                      <h2 className="text-4xl font-black mb-2 tracking-tight">{profile.perusahaan}</h2>
                      <p className="text-xl font-medium text-blue-200 mb-10">{profile.posisi}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><p className="text-blue-200 text-xs font-bold uppercase mb-2">Dosen Pembimbing</p><p className="font-bold text-lg">{profile.dosen}</p></div>
                        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20"><p className="text-blue-200 text-xs font-bold uppercase mb-2">Sistem Konversi</p><p className="font-bold text-lg">{profile.tipeKonversi} ({profile.matkulKonversi.length} Matkul)</p></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB LOGBOOK */}
              {activeTab === 'Logbook' && (
                <motion.div key="logbook" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Catat Kegiatan Hari Ini</h3>
                    <form onSubmit={handleLogbookSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Tanggal</label><input type="date" required value={logbookForm.tanggal} onChange={(e) => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a]" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Link Bukti Kegiatan</label><input type="url" required value={logbookForm.link_bukti} onChange={(e) => setLogbookForm({...logbookForm, link_bukti: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a]" placeholder="https://..." /></div>
                      </div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Kegiatan</label><textarea required rows={3} value={logbookForm.kegiatan} onChange={(e) => setLogbookForm({...logbookForm, kegiatan: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 outline-none focus:ring-2 focus:ring-[#1e3a8a]" placeholder="Detail kegiatan..."></textarea></div>
                      <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 transition-all hover:-translate-y-1">{isSubmitting ? 'Menyimpan...' : 'Simpan Logbook'}</button>
                    </form>
                  </div>
                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                     <h3 className="text-lg font-black text-gray-900 mb-4 border-b pb-4">Riwayat Logbook</h3>
                     <div className="space-y-4">
                        {logbooks.map((log) => (
                           <div key={log.id} className="p-5 border border-gray-100 rounded-2xl bg-gray-50">
                              <div className="flex justify-between items-start mb-3"><span className="text-sm font-bold text-gray-500">{log.tanggal}</span><span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">{log.status || 'Menunggu Validasi'}</span></div>
                              <p className="text-gray-800 font-medium mb-3">{log.kegiatan}</p>
                              <a href={log.link_bukti} target="_blank" className="text-sm font-bold text-blue-600 hover:text-blue-800">Buka Bukti ➔</a>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}