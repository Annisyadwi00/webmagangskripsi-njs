"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Aktif' | 'Pending' | 'Pesan'>('Aktif');
  
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Form Lengkap
  const [formData, setFormData] = useState({
    perusahaan: '', posisi: '', deskripsi: '', kuota: '', email_perusahaan: '', link_pendaftaran: '',
    location: '', type: 'Onsite', isKonversi: 'Ya', isPaid: 'Tidak', valid_until: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resJobs = await fetch('/api/lowongan');
      const jsonJobs = await resJobs.json();
      if (resJobs.ok) setJobs(jsonJobs.data);

      const resMsg = await fetch('/api/feedback');
      const jsonMsg = await resMsg.json();
      if (resMsg.ok) setMessages(jsonMsg.data);
    } catch (error) {
      console.error('Gagal mengambil data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lowongan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('Gagal menambah lowongan');
      alert('Berhasil menambah lowongan!');
      setShowModal(false);
      setFormData({ perusahaan: '', posisi: '', deskripsi: '', kuota: '', email_perusahaan: '', link_pendaftaran: '', location: '', type: 'Onsite', isKonversi: 'Ya', isPaid: 'Tidak', valid_until: '' });
      fetchData(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (!confirm(`Yakin ingin ${action === 'approve' ? 'MENYETUJUI' : action === 'delete' ? 'MENGHAPUS' : 'MENOLAK'} lowongan ini?`)) return;
    try {
      await fetch('/api/lowongan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action })
      });
      fetchData();
    } catch (error) {
      alert('Gagal memproses');
    }
  };

  const markAsRead = async (id: number) => {
    await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };

  const displayedJobs = jobs.filter(job => job.status === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">SI Magang</h1>
          <p className="text-xs text-slate-400 mt-1">Administrator Portal</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white text-slate-900 rounded-xl font-bold">Dashboard Admin</button>
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <Link href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl">Kembali ke Home</Link>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-slate-800">Panel Kendali</h2>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors">
            + Tambah Lowongan
          </button>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          {/* TAB NAVIGASI */}
          <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
            <button onClick={() => setActiveTab('Aktif')} className={`px-6 py-3 font-bold rounded-xl transition-all whitespace-nowrap ${activeTab === 'Aktif' ? 'bg-[#1e3a8a] text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
              Lowongan Tayang
            </button>
            <button onClick={() => setActiveTab('Pending')} className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'Pending' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
              Antrean Mitra
              {jobs.filter(j => j.status === 'Pending').length > 0 && (
                <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs">{jobs.filter(j => j.status === 'Pending').length}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('Pesan')} className={`px-6 py-3 font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'Pesan' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-100'}`}>
              Pesan & Masukan
              {messages.filter(m => m.status === 'Unread').length > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{messages.filter(m => m.status === 'Unread').length}</span>
              )}
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {activeTab === 'Pesan' ? (
              // TAMPILAN TAB PESAN
              <div className="divide-y divide-gray-100">
                {messages.length === 0 ? (
                  <p className="p-8 text-center text-gray-500">Belum ada pesan masuk.</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`p-6 flex flex-col md:flex-row gap-4 justify-between items-start ${msg.status === 'Unread' ? 'bg-indigo-50/50' : 'bg-white'}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-bold text-gray-900">{msg.nama}</h4>
                          <span className="text-xs text-gray-500">{msg.email}</span>
                          {msg.status === 'Unread' && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">BARU</span>}
                        </div>
                        <p className="text-gray-700 text-sm">{msg.pesan}</p>
                        <p className="text-xs text-gray-400 mt-2">{new Date(msg.createdAt).toLocaleString('id-ID')}</p>
                      </div>
                      {msg.status === 'Unread' && (
                        <button onClick={() => markAsRead(msg.id)} className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-lg hover:bg-gray-50 text-gray-700">Tandai Dibaca</button>
                      )}
                    </div>
                  ))
                )}
              </div>
            ) : (
              // TAMPILAN TAB LOWONGAN
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                      <th className="p-5">Perusahaan & Detail</th>
                      <th className="p-5">Tipe & Status</th>
                      <th className="p-5">Batas Waktu</th>
                      <th className="p-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {displayedJobs.length === 0 ? (
                      <tr><td colSpan={4} className="p-5 text-center text-gray-500">Tidak ada lowongan.</td></tr>
                    ) : (
                      displayedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="p-5">
                            <p className="font-bold text-[#1e3a8a] text-base">{job.title}</p>
                            <p className="font-semibold text-gray-800">{job.company}</p>
                            <p className="text-xs text-gray-500 mt-1">📍 {job.location}</p>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded">{job.type}</span>
                              {job.isKonversi && <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded">Konversi SKS</span>}
                              {job.isPaid && <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded">Paid</span>}
                            </div>
                          </td>
                          <td className="p-5 text-gray-600 font-medium">
                            {job.valid_until ? new Date(job.valid_until).toLocaleDateString('id-ID') : 'Tanpa Batas'}
                          </td>
                          <td className="p-5 text-center">
                            {activeTab === 'Pending' ? (
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleAction(job.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg hover:bg-green-200">Setujui</button>
                                <button onClick={() => handleAction(job.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200">Tolak</button>
                              </div>
                            ) : (
                              // FITUR HAPUS LOWONGAN AKTIF
                              <button onClick={() => handleAction(job.id, 'delete')} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100">Hapus</button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL TAMBAH LOWONGAN (SUPER LENGKAP) */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-8 z-10 max-h-full overflow-y-auto">
              <h3 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">Tambah Lowongan Baru</h3>
              
              <form onSubmit={handleAddJob} className="space-y-5">
                {/* Info Dasar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Perusahaan *</label>
                    <input type="text" required value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 outline-none text-gray-900" placeholder="PT Contoh" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Posisi Magang *</label>
                    <input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 outline-none text-gray-900" placeholder="Web Developer" />
                  </div>
                </div>

                {/* Detail Pekerjaan */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sistem Kerja</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status SKS</label>
                    <select value={formData.isKonversi} onChange={(e) => setFormData({...formData, isKonversi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Ya">Bisa Konversi</option>
                      <option value="Tidak">Reguler (Non-Konversi)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status Gaji</label>
                    <select value={formData.isPaid} onChange={(e) => setFormData({...formData, isPaid: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Tidak">Unpaid</option>
                      <option value="Ya">Paid (Berbayar)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Alamat Penempatan / Kota</label>
                    <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none" placeholder="Jakarta Selatan" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tersedia Sampai Tanggal</label>
                    <input type="date" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none" />
                  </div>
                </div>

                {/* Info Kontak Eksternal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Email Perusahaan (Opsional)</label>
                    <input type="email" value={formData.email_perusahaan} onChange={(e) => setFormData({...formData, email_perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Link Eksternal Pendaftaran (Opsional)</label>
                    <input type="url" value={formData.link_pendaftaran} onChange={(e) => setFormData({...formData, link_pendaftaran: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Lengkap *</label>
                  <textarea required rows={4} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white outline-none text-gray-900" placeholder="Syarat, job desc, dll..."></textarea>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-xl shadow-md font-bold text-white bg-[#1e3a8a] hover:bg-blue-900">
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Lowongan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}