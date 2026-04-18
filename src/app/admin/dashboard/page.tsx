"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminDashboard() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tab sekarang dikendalikan dari Sidebar
  const [activeTab, setActiveTab] = useState<'Aktif' | 'Pending' | 'Pesan' | 'Pengguna'>('Aktif');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // FIX: Data form dengan tambahan Kategori & Tipe Konversi
  const [formData, setFormData] = useState({
    perusahaan: '', posisi: '', deskripsi: '', kuota: '', email_perusahaan: '', link_pendaftaran: '',
    location: '', type: 'Onsite', tipeKonversi: 'Full', kategori: '💻 Frontend Developer', isPaid: 'Tidak', valid_until: ''
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resJobs = await fetch('/api/lowongan');
      if (resJobs.ok) setJobs((await resJobs.json()).data);
      const resMsg = await fetch('/api/feedback');
      if (resMsg.ok) setMessages((await resMsg.json()).data);
      const resUsers = await fetch('/api/users');
      if (resUsers.ok) setUsers((await resUsers.json()).data);
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
      fetchData(); 
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJobAction = async (id: number, action: 'approve' | 'reject' | 'delete') => {
    if (!confirm(`Yakin ingin memproses lowongan ini?`)) return;
    await fetch('/api/lowongan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
    fetchData();
  };

  const markAsRead = async (id: number) => {
    await fetch('/api/feedback', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    fetchData();
  };

  const handleUserAction = async (id: number, action: 'reset_password' | 'delete', name: string) => {
    const warningText = action === 'delete' ? `HAPUS permanen akun ${name}?` : `Reset password ${name} menjadi '123456'?`;
    if (!confirm(warningText)) return;
    try {
      const res = await fetch('/api/users', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) });
      alert((await res.json()).message);
      fetchData();
    } catch (error) {
      alert('Terjadi kesalahan sistem.');
    }
  };

  const displayedJobs = jobs.filter(job => job.status === activeTab);
  
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR BARU ADMIN */}
      <aside className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">SI Magang</h1>
          <p className="text-xs text-slate-400 mt-1">Administrator Portal</p>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Menu Utama</p>
          
          <button onClick={() => setActiveTab('Aktif')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Aktif' ? 'bg-[#1e3a8a] text-white shadow-md' : 'text-slate-300 hover:bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Lowongan Tayang
            </div>
          </button>

          <button onClick={() => setActiveTab('Pending')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pending' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Antrean Mitra
            </div>
            {jobs.filter(j => j.status === 'Pending').length > 0 && <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">{jobs.filter(j => j.status === 'Pending').length}</span>}
          </button>

          <button onClick={() => setActiveTab('Pesan')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pesan' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              Pesan & Masukan
            </div>
            {messages.filter(m => m.status === 'Unread').length > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{messages.filter(m => m.status === 'Unread').length}</span>}
          </button>

          <button onClick={() => setActiveTab('Pengguna')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Pengguna' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-300 hover:bg-white/5'}`}>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              Manajemen Pengguna
            </div>
          </button>
        </nav>
        
        <div className="p-4 border-t border-white/10 mt-auto">
          <a href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl">Kembali ke Home</a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {activeTab === 'Aktif' ? 'Lowongan Tersedia' : activeTab === 'Pending' ? 'Validasi Antrean Mitra' : activeTab === 'Pesan' ? 'Pesan Masuk' : 'Daftar Pengguna'}
            </h2>
          </div>
          <div className="flex gap-3">
            {activeTab === 'Aktif' && (
              <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-colors">
                + Tambah Lowongan
              </button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* TAB PENGGUNA */}
            {activeTab === 'Pengguna' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                      <th className="p-5">Nama & Identitas</th>
                      <th className="p-5">Peran</th>
                      <th className="p-5">Bergabung</th>
                      <th className="p-5 text-center">Aksi Bahaya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50">
                        <td className="p-5"><p className="font-bold text-gray-900">{u.name}</p><p className="text-xs text-gray-500">{u.email}</p></td>
                        <td className="p-5"><span className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700">{u.role}</span></td>
                        <td className="p-5 text-gray-600">{new Date(u.createdAt).toLocaleDateString('id-ID')}</td>
                        <td className="p-5 text-center">
                          {u.role !== 'Admin' && (
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleUserAction(u.id, 'reset_password', u.name)} className="px-3 py-1 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 text-xs">Reset Pass</button>
                              <button onClick={() => handleUserAction(u.id, 'delete', u.name)} className="px-3 py-1 bg-red-50 text-red-600 font-bold rounded-lg hover:bg-red-100 text-xs">Hapus</button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'Pesan' ? (
              <div className="divide-y divide-gray-100">
                {messages.length === 0 ? <p className="p-8 text-center text-gray-500">Belum ada pesan.</p> : messages.map(msg => (
                  <div key={msg.id} className={`p-6 flex justify-between ${msg.status === 'Unread' ? 'bg-indigo-50/50' : 'bg-white'}`}>
                    <div><h4 className="font-bold text-gray-900">{msg.nama}</h4><p className="text-gray-700 text-sm mt-2">{msg.pesan}</p></div>
                    {msg.status === 'Unread' && <button onClick={() => markAsRead(msg.id)} className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold rounded-lg">Tandai Dibaca</button>}
                  </div>
                ))}
              </div>
            ) : (
              // TAB LOWONGAN (Aktif & Pending)
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b border-gray-100">
                      <th className="p-5">Perusahaan & Posisi</th>
                      <th className="p-5">Kategori & Status</th>
                      <th className="p-5">Batas Waktu</th>
                      <th className="p-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {displayedJobs.length === 0 ? <tr><td colSpan={4} className="p-5 text-center text-gray-500">Tidak ada lowongan.</td></tr> : displayedJobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50">
                          <td className="p-5">
                            <p className="font-bold text-[#1e3a8a] text-base">{job.title}</p>
                            <p className="font-semibold text-gray-800">{job.company}</p>
                          </td>
                          <td className="p-5">
                            <div className="flex flex-col gap-1.5 items-start">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded border border-gray-200">{job.kategori}</span>
                              <span className={`px-2 py-1 text-xs font-bold rounded ${job.tipeKonversi === 'Full' ? 'bg-green-50 text-green-700' : job.tipeKonversi === 'Parsial' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                {job.tipeKonversi === 'Full' ? 'SKS Konversi Full' : job.tipeKonversi === 'Parsial' ? 'Konversi Beberapa Matkul' : 'SKS Non-Konversi'}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-gray-600 font-medium">
                            {job.valid_until ? new Date(job.valid_until).toLocaleDateString('id-ID') : 'Tanpa Batas'}
                          </td>
                          <td className="p-5 text-center">
                            {activeTab === 'Pending' ? (
                              <div className="flex gap-2 justify-center">
                                <button onClick={() => handleJobAction(job.id, 'approve')} className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg text-xs">Setujui</button>
                                <button onClick={() => handleJobAction(job.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg text-xs">Tolak</button>
                              </div>
                            ) : (
                              <button onClick={() => handleJobAction(job.id, 'delete')} className="px-3 py-1.5 bg-red-50 text-red-600 font-bold rounded-lg text-xs hover:bg-red-100">Hapus</button>
                            )}
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MODAL TAMBAH LOWONGAN REVISI */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-8 z-10 max-h-full overflow-y-auto">
              <h3 className="text-2xl font-black text-gray-900 mb-6 border-b pb-4">Tambah Lowongan Baru</h3>
              <form onSubmit={handleAddJob} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Nama Perusahaan *</label><input type="text" required value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2" placeholder="PT Contoh" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">Posisi Magang *</label><input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2" placeholder="Web Developer" /></div>
                </div>

                {/* BARIS BARU: KATEGORI & DURASI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kategori / Bidang IT *</label>
                    <select required value={formData.kategori} onChange={(e) => setFormData({...formData, kategori: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none focus:ring-2">
                      <option value="💻 Frontend Developer">💻 Frontend Developer</option>
                      <option value="⚙️ Backend Developer">⚙️ Backend Developer</option>
                      <option value="📱 Mobile App Developer">📱 Mobile App Developer</option>
                      <option value="🎨 UI/UX Designer">🎨 UI/UX Designer</option>
                      <option value="🔒 Keamanan Sistem / Cyber">🔒 Keamanan Sistem / Cyber</option>
                      <option value="📊 Data Analyst / Science">📊 Data Analyst / Science</option>
                      <option value="☁️ Cloud / DevOps">☁️ Cloud / DevOps</option>
                      <option value="🛠️ Lainnya (IT Support, QA)">🛠️ Lainnya (IT Support, QA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Deadline Pendaftaran (Kalender)</label>
                    <input type="date" value={formData.valid_until} onChange={(e) => setFormData({...formData, valid_until: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2" />
                    <p className="text-[10px] text-gray-500 mt-1">Biarkan kosong jika tidak ada batas waktu.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Tipe Konversi SKS *</label>
                    <select value={formData.tipeKonversi} onChange={(e) => setFormData({...formData, tipeKonversi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Full">✅ Konversi Full (20 SKS)</option>
                      <option value="Parsial">⚠️ Beberapa Matkul Saja</option>
                      <option value="Tidak">❌ Non-Konversi (Reguler)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Sistem Kerja</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Onsite">Onsite</option><option value="Hybrid">Hybrid</option><option value="Remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Status Gaji</label>
                    <select value={formData.isPaid} onChange={(e) => setFormData({...formData, isPaid: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 outline-none">
                      <option value="Tidak">Unpaid</option><option value="Ya">Paid (Berbayar)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tautan Form Perusahaan (Wajib)</label>
                  <input type="url" required value={formData.link_pendaftaran} onChange={(e) => setFormData({...formData, link_pendaftaran: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2" placeholder="https://..." />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi Lengkap *</label>
                  <textarea required rows={4} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 outline-none focus:bg-white focus:ring-2"></textarea>
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 px-4 rounded-xl shadow-md font-bold text-white bg-[#1e3a8a] hover:bg-blue-900">{isSubmitting ? 'Menyimpan...' : 'Simpan Lowongan'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}