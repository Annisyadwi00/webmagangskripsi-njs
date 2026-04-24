"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const router = useRouter();
  
  const [jobs, setJobs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [pengajuans, setPengajuans] = useState<any[]>([]); 

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ---> FITUR BARU: Tambah Tab 'Rekap' <---
  const [activeTab, setActiveTab] = useState<'Aktif' | 'Pending' | 'Verifikasi' | 'Rekap' | 'Pesan' | 'Pengguna'>('Aktif');
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    perusahaan: '', posisi: '', deskripsi: '', kuota: '', email_perusahaan: '', link_pendaftaran: '',
    location: '', type: 'Onsite', tipeKonversi: 'Full', kategori: '💻 Frontend Developer', isPaid: 'Tidak', valid_until: ''
  });

  const [showJobDetailModal, setShowJobDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

  const [showUserModal, setShowUserModal] = useState(false); 
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'Dosen', nim_nidn: '', prodi: 'S1 Informatika' });
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'Semua' | 'Mahasiswa' | 'Dosen' | 'Admin'>('Semua');

  const [showVerifModal, setShowVerifModal] = useState(false);
  const [verifForm, setVerifForm] = useState({ id: 0, nama_mahasiswa: '', perusahaan: '', tipeKonversi: 'Full', matkulInput: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resJobs, resMsg, resUsers, resPengajuan] = await Promise.all([
        fetch('/api/lowongan'), fetch('/api/feedback'), fetch('/api/users'), fetch('/api/Pengajuan')
      ]);
      
      if (resJobs.ok) setJobs((await resJobs.json()).data || []);
      if (resMsg.ok) setMessages((await resMsg.json()).data || []);
      if (resUsers.ok) setUsers((await resUsers.json()).data || []);
      if (resPengajuan.ok) setPengajuans((await resPengajuan.json()).data || []);
    } catch (error) {
      showToast('Gagal mengambil data server', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    if (!confirm("Yakin ingin keluar?")) return;
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleOpenVerifModal = (pengajuan: any) => {
    setVerifForm({ id: pengajuan.id, nama_mahasiswa: pengajuan.nama_mahasiswa, perusahaan: pengajuan.perusahaan, tipeKonversi: 'Full', matkulInput: '' });
    setShowVerifModal(true);
  };

  const handleApproveLOA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const matkulArray = verifForm.tipeKonversi === 'Tidak' ? [] : verifForm.matkulInput.split(',').map(m => m.trim()).filter(m => m);
      const res = await fetch('/api/Pengajuan', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setujui', id: verifForm.id, tipeKonversi: verifForm.tipeKonversi, matkulKonversi: matkulArray })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('LOA Berhasil disetujui!', 'success');
      setShowVerifModal(false);
      fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleRejectLOA = async (id: number) => {
    if (!confirm('Tolak dan hapus pengajuan LOA ini?')) return;
    try {
      await fetch('/api/Pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'tolak', id }) });
      showToast('Pengajuan ditolak.', 'success');
      fetchData();
    } catch (err) { showToast('Terjadi kesalahan', 'error'); }
  };

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      await fetch('/api/lowongan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      showToast('Berhasil menambah lowongan!', 'success');
      setShowModal(false); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleJobAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (!confirm(`Yakin ingin memproses lowongan ini?`)) return;
    await fetch('/api/lowongan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    showToast('Aksi berhasil diproses.', 'success');
    if (showJobDetailModal) setShowJobDetailModal(false); 
    fetchData();
  };

  const handleViewJobDetail = (job: any) => {
    setSelectedJob(job);
    setShowJobDetailModal(true);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userForm) });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Pengguna berhasil ditambahkan!', 'success');
      setShowUserModal(false); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleUserAction = async (id: number, action: 'reset_password' | 'delete', name: string) => {
    if (!confirm(action === 'delete' ? `HAPUS permanen akun ${name}?` : `Reset password ${name} menjadi '123456'?`)) return;
    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
      showToast((await res.json()).message, 'success'); fetchData();
    } catch (error) { showToast('Terjadi kesalahan sistem.', 'error'); }
  };

  const markAsRead = async (id: number) => {
    await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };
  
  const deleteMessage = async (id: number) => {
    if (!confirm('Hapus pesan ini secara permanen dari sistem?')) return;
    try {
      await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action: 'delete' }) });
      showToast('Pesan berhasil dihapus!', 'success');
      fetchData();
    } catch (error) { showToast('Gagal menghapus pesan', 'error'); }
  };

  // ---> FITUR BARU: FUNGSI EXPORT KE CSV (EXCEL) <---
  const handleExportCSV = () => {
    const approvedPengajuan = pengajuans.filter(p => p.status === 'Disetujui');
    if (approvedPengajuan.length === 0) {
      return showToast('Belum ada data magang aktif untuk diekspor.', 'error');
    }

    const headers = ['Nama Mahasiswa', 'Perusahaan', 'Posisi Magang', 'Dosen Pembimbing', 'Sistem Konversi', 'Nilai Akhir'];
    const rows = approvedPengajuan.map(p => [
      `"${p.nama_mahasiswa || '-'}"`,
      `"${p.perusahaan || '-'}"`,
      `"${p.posisi || '-'}"`,
      `"${p.dosen_pembimbing || 'Belum Memilih'}"`,
      `"${p.tipeKonversi || '-'}"`,
      `"${p.nilai_dari_dosen || 'Belum Dinilai'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_Nilai_Magang_${new Date().getFullYear()}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayedJobs = jobs.filter(job => job.status === activeTab);
  const pendingLOA = pengajuans.filter(p => p.status === 'Menunggu_Verifikasi');
  const activeMagang = pengajuans.filter(p => p.status === 'Disetujui'); // Data untuk tab Rekap
  const filteredUsers = users.filter(u => {
    const matchesRole = userRoleFilter === 'Semua' || u.role === userRoleFilter;
    const searchLower = userSearchTerm.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower) || (u.nim_nidn && u.nim_nidn.includes(searchLower));
    return matchesRole && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans relative overflow-hidden">
      
      {/* CUSTOM TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[60]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.type === 'success' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SIDEBAR ADMIN */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-2xl z-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="p-8 border-b border-white/10 relative z-10">
          <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">Administrator Portal</p>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 relative z-10 overflow-y-auto">
          <p className="px-2 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
          
          <button onClick={() => setActiveTab('Aktif')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Aktif' ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Lowongan Tayang
          </button>

          <button onClick={() => setActiveTab('Pending')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pending' ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Antrean Mitra</div>
            {jobs.filter(j => j.status === 'Pending').length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{jobs.filter(j => j.status === 'Pending').length}</span>}
          </button>

          <button onClick={() => setActiveTab('Verifikasi')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Verifikasi' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Verifikasi LOA</div>
            {pendingLOA.length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">{pendingLOA.length}</span>}
          </button>

          {/* ---> TAB BARU: REKAP DATA <--- */}
          <button onClick={() => setActiveTab('Rekap')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Rekap' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Rekap Data & Nilai</div>
          </button>

          <button onClick={() => setActiveTab('Pesan')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pesan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <div className="flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> Pesan & Masukan</div>
            {messages.filter(m => m.status === 'Unread').length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'Unread').length}</span>}
          </button>

          <button onClick={() => setActiveTab('Pengguna')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pengguna' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/50 scale-105' : 'text-slate-300 hover:bg-white/5 hover:translate-x-1'}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> Manajemen Pengguna
          </button>
        </nav>

        <div className="p-6 border-t border-white/10 mt-auto relative z-10 flex flex-col gap-3">
          <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all shadow-sm backdrop-blur-sm border border-white/10 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Beranda
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20 hover:-translate-y-0.5">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout Akun
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-10 py-6 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {activeTab === 'Aktif' ? 'Lowongan Tersedia' : 
               activeTab === 'Pending' ? 'Validasi Antrean Mitra' : 
               activeTab === 'Verifikasi' ? 'Verifikasi Pengajuan Magang' : 
               activeTab === 'Rekap' ? 'Rekapitulasi & Ekspor Data' :
               activeTab === 'Pesan' ? 'Pesan Masuk' : 'Manajemen Pengguna'}
            </h2>
          </div>
          <div className="flex gap-3">
            {activeTab === 'Aktif' && <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">+ Tambah Lowongan</button>}
            {activeTab === 'Pengguna' && <button onClick={() => setShowUserModal(true)} className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all hover:-translate-y-0.5">+ Tambah Pengguna</button>}
            {/* Tombol Export Excel */}
            {activeTab === 'Rekap' && <button onClick={handleExportCSV} className="px-5 py-2.5 bg-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/20 hover:bg-cyan-700 transition-all hover:-translate-y-0.5 flex items-center gap-2"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> Unduh CSV (Excel)</button>}
          </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto w-full">
          {isLoading ? (
             <div className="flex items-center justify-center h-64">
               <svg className="w-12 h-12 animate-spin text-[#1e3a8a]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <AnimatePresence mode="wait">
                
                {/* TAB VERIFIKASI LOA */}
                {activeTab === 'Verifikasi' && (
                  <motion.div key="verif" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                          <th className="p-5 pl-8">Data Mahasiswa</th><th className="p-5">Tempat Magang</th><th className="p-5">Dokumen LOA</th><th className="p-5 pr-8 text-center">Aksi Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {pendingLOA.length === 0 ? (
                          <tr><td colSpan={4} className="p-16 text-center text-gray-400 font-bold">Hore! Antrean Kosong. Belum ada mahasiswa yang mengajukan LOA baru.</td></tr>
                        ) : pendingLOA.map((p) => (
                            <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                              <td className="p-5 pl-8"><p className="font-bold text-gray-900 text-base">{p.nama_mahasiswa}</p><p className="text-xs text-amber-600 font-bold mt-1 bg-amber-100 w-fit px-2 py-0.5 rounded">Menunggu Verifikasi</p></td>
                              <td className="p-5"><p className="font-bold text-[#1e3a8a]">{p.perusahaan}</p><p className="text-sm text-gray-600">{p.posisi}</p></td>
                              <td className="p-5"><a href={p.link_loa} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 w-fit px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg> Buka Bukti LOA</a></td>
                              <td className="p-5 pr-8 text-center">
                                <div className="flex gap-2 justify-center">
                                  <button onClick={() => handleOpenVerifModal(p)} className="px-4 py-2 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-all hover:-translate-y-0.5">Proses & Setujui</button>
                                  <button onClick={() => handleRejectLOA(p.id)} className="px-4 py-2 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-all hover:-translate-y-0.5">Tolak</button>
                                </div>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* ---> TAB BARU: REKAP DATA <--- */}
                {activeTab === 'Rekap' && (
                  <motion.div key="rekap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                          <th className="p-5 pl-8">Nama Mahasiswa</th>
                          <th className="p-5">Tempat Magang</th>
                          <th className="p-5">Sistem Konversi</th>
                          <th className="p-5">Dosen Pembimbing</th>
                          <th className="p-5 pr-8 text-center">Nilai Akhir</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {activeMagang.length === 0 ? (
                          <tr><td colSpan={5} className="p-16 text-center text-gray-400 font-bold">Belum ada mahasiswa yang berstatus magang aktif/selesai.</td></tr>
                        ) : activeMagang.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-5 pl-8 font-bold text-gray-900 text-base">{p.nama_mahasiswa}</td>
                              <td className="p-5"><p className="font-bold text-[#1e3a8a]">{p.perusahaan}</p><p className="text-xs text-gray-500">{p.posisi}</p></td>
                              <td className="p-5"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{p.tipeKonversi}</span></td>
                              <td className="p-5 font-medium text-gray-700">{p.dosen_pembimbing || <span className="text-red-500 text-xs italic">Belum Memilih</span>}</td>
                              <td className="p-5 pr-8 text-center">
                                <span className={`text-xl font-black ${p.nilai_dari_dosen ? 'text-green-600' : 'text-gray-300'}`}>
                                  {p.nilai_dari_dosen || '-'}
                                </span>
                              </td>
                            </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* TAB PENGGUNA */}
                {activeTab === 'Pengguna' && (
                  <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
                      <div className="flex gap-2 bg-gray-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
                        {['Semua', 'Mahasiswa', 'Dosen', 'Admin'].map(role => (
                          <button key={role} onClick={() => setUserRoleFilter(role as any)} className={`px-5 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${userRoleFilter === role ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200/50'}`}>{role}</button>
                        ))}
                      </div>
                      <div className="relative w-full md:w-72">
                        <input type="text" placeholder="Cari nama atau email..." value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white" />
                        <svg className="w-5 h-5 text-gray-400 absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                            <th className="p-5 pl-8">Nama & Identitas</th><th className="p-5">Peran & Prodi</th><th className="p-5">Bergabung</th><th className="p-5 pr-8 text-center">Aksi Bahaya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                          {filteredUsers.length === 0 ? <tr><td colSpan={4} className="p-16 text-center text-gray-500 font-bold">Tidak ada pengguna yang sesuai.</td></tr> : filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-5 pl-8"><p className="font-bold text-gray-900 text-base">{u.name}</p><p className="text-xs text-gray-500 mt-1">{u.email}</p></td>
                              <td className="p-5"><span className={`px-3 py-1 rounded-lg text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : u.role === 'Dosen' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>{u.role}</span>{u.role === 'Mahasiswa' && <p className="text-xs text-gray-500 mt-1.5 font-medium">{u.prodi}</p>}</td>
                              <td className="p-5 text-gray-600 font-medium">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                              <td className="p-5 pr-8 text-center">
                                {u.role !== 'Admin' && (
                                  <div className="flex gap-2 justify-center">
                                    <button onClick={() => handleUserAction(u.id, 'reset_password', u.name)} className="px-3 py-1.5 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors">Reset Pass</button>
                                    <button onClick={() => handleUserAction(u.id, 'delete', u.name)} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 transition-colors">Hapus</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}

                {/* TAB LOWONGAN (AKTIF & PENDING) */}
                {(activeTab === 'Aktif' || activeTab === 'Pending') && (
                  <motion.div key="lowongan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                          <th className="p-5 pl-8">Perusahaan & Posisi</th><th className="p-5">Kategori & Status</th><th className="p-5 text-center pr-8">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {displayedJobs.length === 0 ? <tr><td colSpan={3} className="p-16 text-center text-gray-500 font-bold">Tidak ada lowongan di kategori ini.</td></tr> : displayedJobs.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-5 pl-8"><p className="font-bold text-[#1e3a8a] text-base">{job.title}</p><p className="font-semibold text-gray-800">{job.company}</p></td>
                            <td className="p-5"><div className="flex flex-col gap-1.5 items-start"><span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded border border-gray-200">{job.kategori}</span><span className={`px-2 py-1 text-xs font-bold rounded border ${job.tipeKonversi === 'Full' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{job.tipeKonversi === 'Full' ? 'SKS Konversi' : 'Non-Konversi'}</span></div></td>
                            <td className="p-5 pr-8 text-center">
                              {activeTab === 'Pending' ? (
                                <div className="flex gap-2 justify-center">
                                  <button onClick={() => handleViewJobDetail(job)} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-xs">Lihat Detail</button>
                                  <button onClick={() => handleJobAction(job.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-all text-xs">Setujui</button>
                                  <button onClick={() => handleJobAction(job.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-all text-xs">Tolak</button>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-center">
                                  <button onClick={() => handleViewJobDetail(job)} className="px-3 py-1.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all text-xs">Lihat Detail</button>
                                  <button onClick={() => handleJobAction(job.id, 'delete')} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all text-xs">Hapus</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </motion.div>
                )}

                {/* TAB PESAN MASUK */}
                {activeTab === 'Pesan' && (
                  <motion.div key="pesan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="divide-y divide-gray-100">
                    {messages.length === 0 ? <p className="p-16 text-center text-gray-500 font-bold">Belum ada pesan / umpan balik.</p> : messages.map(msg => (
                      <div key={msg.id} className={`p-8 flex flex-col md:flex-row justify-between gap-6 ${msg.status === 'Unread' ? 'bg-indigo-50/30' : 'bg-white'}`}>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-gray-900 text-lg">{msg.nama} <span className="text-sm font-normal text-gray-500">({msg.email})</span></h4>
                          <div className="mt-3 bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-gray-900 font-medium leading-relaxed whitespace-pre-wrap break-words">
                            {msg.pesan}
                          </div>
                        </div>
                        <div className="flex-shrink-0 flex flex-col gap-3">
                          {msg.status === 'Unread' && (
                            <button onClick={() => markAsRead(msg.id)} className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl whitespace-nowrap hover:bg-indigo-700 transition-all shadow-md">Tandai Dibaca</button>
                          )}
                          <button onClick={() => deleteMessage(msg.id)} className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl whitespace-nowrap hover:bg-red-100 transition-all border border-red-100">Hapus Pesan</button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>

      {/* MODAL LIHAT DETAIL LOWONGAN */}
      <AnimatePresence>
        {showJobDetailModal && selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowJobDetailModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 z-10 max-h-full overflow-y-auto custom-scrollbar">
              
              <div className="flex justify-between items-start border-b border-gray-100 pb-5 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-gray-900">{selectedJob.title}</h3>
                    <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${selectedJob.status === 'Pending' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedJob.status}
                    </span>
                  </div>
                  <p className="text-[#1e3a8a] font-bold text-lg">{selectedJob.company}</p>
                </div>
                <button onClick={() => setShowJobDetailModal(false)} className="p-2 bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Kategori / Bidang IT</p>
                    <p className="font-bold text-gray-900">{selectedJob.kategori}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sistem Kerja</p>
                    <p className="font-bold text-gray-900">{selectedJob.type} • {selectedJob.isPaid === 'Ya' ? 'Berbayar (Paid)' : 'Tidak Berbayar (Unpaid)'}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sistem Konversi SKS</p>
                    <p className="font-bold text-gray-900">{selectedJob.tipeKonversi === 'Full' ? 'Full Konversi (Max 20 SKS)' : selectedJob.tipeKonversi === 'Parsial' ? 'Parsial (Beberapa Matkul)' : 'Tanpa Konversi'}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Batas Waktu (Deadline)</p>
                    <p className="font-bold text-red-600">{selectedJob.valid_until ? new Date(selectedJob.valid_until).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : 'Terbuka Terus'}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Deskripsi Pekerjaan / Kualifikasi</p>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-900 text-sm leading-relaxed whitespace-pre-wrap break-words max-h-64 overflow-y-auto custom-scrollbar">
                  {selectedJob.description || selectedJob.deskripsi || '-'}
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tautan Pendaftaran (Validasi)</p>
                <a href={selectedJob.link_pendaftaran} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100 break-all">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  {selectedJob.link_pendaftaran}
                </a>
              </div>

              {selectedJob.status === 'Pending' && (
                <div className="flex gap-4 pt-6 border-t border-gray-100">
                  <button onClick={() => handleJobAction(selectedJob.id, 'reject')} className="flex-1 py-4 bg-red-50 border-2 border-red-200 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-colors">
                    Tolak Lowongan
                  </button>
                  <button onClick={() => handleJobAction(selectedJob.id, 'approve')} className="flex-1 py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-600/30 hover:bg-green-700 transition-all hover:-translate-y-1">
                    Setujui & Tayangkan
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL VERIFIKASI LOA MAHASISWA */}
      <AnimatePresence>
        {showVerifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowVerifModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 z-10">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">Verifikasi & Konversi SKS</h3>
              <p className="text-gray-500 mb-6 text-sm border-b pb-6">Tentukan sistem konversi nilai untuk magang <strong className="text-gray-800">{verifForm.nama_mahasiswa}</strong> di <strong className="text-[#1e3a8a]">{verifForm.perusahaan}</strong>.</p>
              <form onSubmit={handleApproveLOA} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tipe Konversi SKS *</label>
                  <select required value={verifForm.tipeKonversi} onChange={(e) => setVerifForm({...verifForm, tipeKonversi: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 font-medium transition-all">
                    <option value="Full">✅ Konversi Penuh (Maks 20 SKS)</option>
                    <option value="Parsial">⚠️ Konversi Parsial (Beberapa Mata Kuliah)</option>
                    <option value="Tidak">❌ Tidak Ada Konversi (Reguler)</option>
                  </select>
                </div>
                {verifForm.tipeKonversi !== 'Tidak' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-bold text-gray-700 mb-2 mt-4">Daftar Mata Kuliah yang Dikonversi *</label>
                    <textarea required rows={3} value={verifForm.matkulInput} onChange={(e) => setVerifForm({...verifForm, matkulInput: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-amber-500 transition-all" placeholder="Contoh: Web, Basis Data Lanjut (Pisahkan dengan koma)"></textarea>
                  </motion.div>
                )}
                <div className="flex gap-4 pt-6 mt-4">
                  <button type="button" onClick={() => setShowVerifModal(false)} className="flex-1 py-4 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-4 px-4 rounded-xl shadow-lg shadow-amber-500/30 font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all hover:-translate-y-1">{isSubmitting ? 'Memproses...' : 'Setujui LOA Mahasiswa'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH PENGGUNA */}
      <AnimatePresence>
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 z-10">
              <h3 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">Tambah Pengguna Internal</h3>
              <form onSubmit={handleAddUser} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Peran Akses *</label>
                    <select required value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                      <option value="Dosen">Dosen</option><option value="Admin">Admin</option><option value="Mahasiswa">Mahasiswa</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap *</label>
                    <input type="text" required value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Nama Lengkap" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="email@unsika.ac.id" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">NIM / NIDN</label>
                    <input type="text" value={userForm.nim_nidn} onChange={(e) => setUserForm({...userForm, nim_nidn: e.target.value.replace(/[^0-9]/g, '')})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Hanya Angka" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kata Sandi</label>
                    <input type="text" required value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="Sandi Default" />
                  </div>
                  {userForm.role === 'Mahasiswa' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">Program Studi</label>
                      <select required value={userForm.prodi} onChange={(e) => setUserForm({...userForm, prodi: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
                        <option value="S1 Informatika">S1 Informatika</option><option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex gap-4 pt-4 border-t border-gray-100 mt-2">
                  <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/30 font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all hover:-translate-y-0.5">{isSubmitting ? 'Menyimpan...' : 'Simpan Pengguna'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL TAMBAH LOWONGAN MANUAL (ADMIN) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 z-10 max-h-full overflow-y-auto custom-scrollbar">
              <h3 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">Tambah Lowongan Baru</h3>
              <form onSubmit={handleAddJob} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Perusahaan *</label><input type="text" required value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Posisi Magang *</label><input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kategori IT *</label>
                    <select required value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors">
                      <option value="💻 Frontend Developer">💻 Frontend Developer</option><option value="⚙️ Backend Developer">⚙️ Backend Developer</option><option value="🎨 UI/UX Designer">🎨 UI/UX Designer</option><option value="📊 Data Analyst / Science">📊 Data Analyst / Science</option>
                    </select>
                  </div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Link Pendaftaran *</label><input type="url" required value={formData.link_pendaftaran} onChange={(e) => setFormData({...formData, link_pendaftaran: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors" /></div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Batas Waktu (Deadline) *</label>
                  <input type="date" required value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors" />
                </div>

                <div><label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Pekerjaan *</label><textarea required rows={4} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-colors"></textarea></div>
                <div className="flex gap-4 pt-4 border-t border-gray-100 mt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-xl shadow-lg font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 transition-all">{isSubmitting ? 'Menyimpan...' : 'Simpan Lowongan'}</button>
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