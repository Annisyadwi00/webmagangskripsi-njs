"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function DosenDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Aktif' | 'Penilaian'>('Permintaan');
  const [bimbinganList, setBimbinganList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const [showNilaiModal, setShowNilaiModal] = useState(false);
  const [nilaiForm, setNilaiForm] = useState({ id_pengajuan: 0, nama: '', perusahaan: '', nilai: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchBimbingan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/Pengajuan');
      if (res.ok) setBimbinganList((await res.json()).data || []);
    } catch (error) { console.error("Gagal", error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchBimbingan(); }, []);

  const handlePersetujuan = async (id_pengajuan: number, action: 'terima' | 'tolak', nama: string) => {
    if (!confirm(`Yakin ingin ${action.toUpperCase()} bimbingan dari ${nama}?`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, id_pengajuan }) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Berhasil ${action} mahasiswa.`, "success"); fetchBimbingan();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_pengajuan: nilaiForm.id_pengajuan, nilai_dari_dosen: nilaiForm.nilai }) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast(`Nilai tersimpan!`, "success"); setShowNilaiModal(false); fetchBimbingan();
    } catch (err: any) { showToast(err.message, "error"); } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const pendingBimbingan = bimbinganList.filter(b => b.status_dosen !== 'Disetujui' && b.status_dosen !== 'Ditolak');
  const activeBimbingan = bimbinganList.filter(b => b.status_dosen === 'Disetujui');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-50">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <aside className="w-72 bg-gradient-to-b from-indigo-900 to-indigo-950 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
          <p className="text-sm text-indigo-300 mt-1 font-medium">Portal Dosen Pembimbing</p>
        </div>
        <nav className="flex-1 py-8 px-5 space-y-3">
          <button onClick={() => setActiveTab('Permintaan')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Permintaan' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Permintaan Bimbingan</span>
             {pendingBimbingan.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingBimbingan.length}</span>}
          </button>
          <button onClick={() => setActiveTab('Aktif')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Aktif' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Mahasiswa Aktif</span>
          </button>
          <button onClick={() => setActiveTab('Penilaian')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Penilaian' ? 'bg-white text-indigo-900 shadow-lg scale-105' : 'text-slate-200 hover:bg-white/10 hover:translate-x-1'}`}>
             <span>Input Penilaian</span>
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

      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50">
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 px-10 py-6 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-black text-gray-900">{activeTab === 'Permintaan' ? 'Validasi Bimbingan' : activeTab === 'Aktif' ? 'Mahasiswa Bimbingan' : 'Evaluasi Akhir'}</h2>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
           {activeTab === 'Permintaan' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingBimbingan.length === 0 ? <p className="col-span-full p-10 text-center text-gray-500 font-bold bg-white rounded-3xl border">Belum ada permintaan bimbingan.</p> : pendingBimbingan.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-8 border shadow-sm">
                     <h4 className="font-black text-gray-900 text-xl">{item.nama_mahasiswa}</h4>
                     <p className="text-sm font-bold text-gray-500 mb-6">{item.perusahaan} - {item.posisi}</p>
                     <div className="flex gap-3 mt-auto">
                        <button onClick={() => handlePersetujuan(item.id, 'tolak', item.nama_mahasiswa)} className="flex-1 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors">Tolak</button>
                        <button onClick={() => handlePersetujuan(item.id, 'terima', item.nama_mahasiswa)} className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all">Setujui</button>
                     </div>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'Aktif' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeBimbingan.map((b) => (
                  <div key={b.id} className="bg-white rounded-3xl p-8 border shadow-sm">
                     <h4 className="font-black text-gray-900 text-xl">{b.nama_mahasiswa}</h4>
                     <p className="text-sm font-bold text-indigo-700 mb-2">{b.perusahaan}</p>
                     <p className="text-xs bg-green-100 text-green-700 inline-block px-3 py-1 rounded-lg font-bold">{b.tipeKonversi}</p>
                  </div>
                ))}
             </div>
           )}

           {activeTab === 'Penilaian' && (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeBimbingan.map((item) => (
                  <div key={item.id} className="bg-white rounded-3xl p-6 border shadow-sm flex flex-col h-full">
                     <h4 className="font-black text-gray-900 text-lg mb-1">{item.nama_mahasiswa}</h4>
                     <p className="text-xs text-gray-500 font-medium mb-6">{item.perusahaan}</p>
                     <div className="bg-slate-50 rounded-2xl p-4 border border-gray-100 mb-6 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400">Nilai Akhir</span>
                        <span className={`text-2xl font-black ${item.nilai_dari_dosen ? 'text-green-600' : 'text-gray-300'}`}>{item.nilai_dari_dosen || '-'}</span>
                     </div>
                     <button onClick={() => { setNilaiForm({ id_pengajuan: item.id, nama: item.nama_mahasiswa, perusahaan: item.perusahaan, nilai: item.nilai_dari_dosen || '' }); setShowNilaiModal(true); }} className={`mt-auto w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-sm ${item.nilai_dari_dosen ? 'bg-white border-2 border-indigo-100 text-indigo-700' : 'bg-indigo-600 text-white'}`}>Input Nilai</button>
                  </div>
                ))}
             </div>
           )}
        </div>
      </main>

      <AnimatePresence>
        {showNilaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Evaluasi Akhir</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Input nilai untuk <strong>{nilaiForm.nama}</strong>.</p>
              <form onSubmit={handleSubmitNilai}>
                <input type="text" required maxLength={2} value={nilaiForm.nilai} onChange={(e) => setNilaiForm({...nilaiForm, nilai: e.target.value.toUpperCase()})} className="w-32 mx-auto block text-center text-5xl font-black px-5 py-4 border-2 rounded-2xl outline-none focus:border-indigo-500 uppercase" placeholder="A" />
                <div className="flex gap-4 pt-6 mt-6 border-t border-gray-100">
                  <button type="button" onClick={() => setShowNilaiModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">Simpan Nilai</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}