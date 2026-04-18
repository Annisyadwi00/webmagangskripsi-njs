"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'Status' | 'Logbook' | 'Profil'>('Status');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaForm, setLoaForm] = useState({ link_loa: '', nama_perusahaan: '', posisi: '' });
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', link_bukti: '' });
  
  // Profil State (Digabung dengan Status Magang)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState({ 
    nama: "Memuat...", 
    nim: "Memuat...", 
    email: "Memuat...", 
    prodi: "S1 Informatika", 
    fakultas: "Ilmu Komputer (Fasilkom)", 
    tanggalLahir: "", 
    noHp: "", 
    fotoUrl: null as string | null,
    // Data Magang
    status: "Menunggu_Verifikasi", // Opsi: Belum_Upload, Menunggu_Verifikasi, Pilih_Dosen, Aktif, Selesai
    perusahaan: "PT Digital Teknologi Indonesia",
    posisi: "Web Developer Intern",
    tipeKonversi: "Parsial",
    matkulKonversi: ["Kerja Praktek (2 SKS)", "Pemrograman Web (3 SKS)", "UI/UX Design (3 SKS)"],
    dosen: "Dr. Budi Santoso, M.Kom"
  });

  const [logbooks, setLogbooks] = useState([
    { id: 1, tanggal: "2026-04-18", kegiatan: "Membuat desain UI untuk Dashboard Admin", link: "https://drive.google.com/...", status: "Divalidasi" },
  ]);

  // Mengambil Data Asli dari Database
  useEffect(() => {
    const fetchRealUserData = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const json = await res.json();
          const userData = json.data;
          setProfile(prev => ({
            ...prev,
            nama: userData.name,
            nim: userData.nim_nidn,
            email: userData.email
          }));
        }
      } catch (error) {
        console.error("Gagal mengambil profil asli", error);
      }
    };
    fetchRealUserData();
  }, []);

  const handleLoaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("LOA berhasil dikirim! Status Anda sekarang 'Menunggu Verifikasi'.");
      setProfile(prev => ({ ...prev, status: 'Menunggu_Verifikasi' }));
      setIsSubmitting(false);
    }, 1000);
  };

  const handleLogbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Logbook harian berhasil dicatat!");
      setLogbooks([{ id: Date.now(), ...logbookForm, status: "Menunggu Validasi" }, ...logbooks]);
      setLogbookForm({ tanggal: '', kegiatan: '', link_bukti: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    alert("Data profil berhasil diperbarui!");
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfile({ ...profile, fotoUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-gradient-to-b from-[#1e3a8a] to-blue-900 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide">SI Magang</h1>
          <p className="text-xs text-blue-300 mt-1">Portal Mahasiswa</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('Status')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Status' ? 'bg-white text-[#1e3a8a] shadow-md' : 'text-slate-200 hover:bg-white/10'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             Status & LOA
          </button>
          <button onClick={() => setActiveTab('Logbook')} disabled={profile.status !== 'Aktif'} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${profile.status !== 'Aktif' ? 'opacity-50 cursor-not-allowed' : activeTab === 'Logbook' ? 'bg-white text-[#1e3a8a] shadow-md' : 'text-slate-200 hover:bg-white/10'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>
             Logbook Harian
          </button>
          <button onClick={() => setActiveTab('Profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'Profil' ? 'bg-white text-[#1e3a8a] shadow-md' : 'text-slate-200 hover:bg-white/10'}`}>
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             Profil Saya
          </button>
        </nav>
        <div className="p-4 border-t border-white/10 mt-auto">
          <a href="/" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl">Kembali ke Home</a>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Portal Akademik Magang</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium">{profile.nama} • {profile.nim}</p>
          </div>
          {/* Badge Status Dinamis */}
          <div className="flex items-center">
            <span className={`px-4 py-1.5 font-bold rounded-full text-xs flex items-center gap-2 border 
              ${profile.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-200' : 
                profile.status === 'Menunggu_Verifikasi' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                profile.status === 'Pilih_Dosen' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {profile.status === 'Aktif' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
              {profile.status.replace('_', ' ')}
            </span>
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full">
           <AnimatePresence mode="wait">
              
              {/* ================= TAB STATUS & LOA ================= */}
              {activeTab === 'Status' && (
                <motion.div key="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {profile.status === 'Belum_Upload' && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-8 border-b border-gray-100 bg-slate-50 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></div>
                        <div>
                          <h3 className="text-xl font-black text-gray-900">Lapor Diterima Magang (Upload LOA)</h3>
                          <p className="text-sm text-gray-500 mt-1">Unggah link Google Drive LOA Anda agar bisa diverifikasi oleh Admin/Prodi.</p>
                        </div>
                      </div>
                      <form onSubmit={handleLoaSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Nama Perusahaan *</label><input type="text" required value={loaForm.nama_perusahaan} onChange={(e) => setLoaForm({...loaForm, nama_perusahaan: e.target.value})} className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white outline-none text-gray-900" placeholder="PT Contoh" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Posisi / Role *</label><input type="text" required value={loaForm.posisi} onChange={(e) => setLoaForm({...loaForm, posisi: e.target.value})} className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white outline-none text-gray-900" placeholder="Web Developer" /></div>
                        </div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Tautan (Link) Google Drive LOA *</label><input type="url" required value={loaForm.link_loa} onChange={(e) => setLoaForm({...loaForm, link_loa: e.target.value})} className="w-full px-5 py-4 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white outline-none text-gray-900" placeholder="https://drive.google.com/..." /></div>
                        <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all">{isSubmitting ? 'Mengirim...' : 'Kirim Form Verifikasi'}</button>
                      </form>
                    </div>
                  )}

                  {profile.status === 'Menunggu_Verifikasi' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 text-center shadow-sm">
                      <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-10 h-10 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-black text-amber-900 mb-2">Sedang Dalam Tahap Verifikasi</h3>
                      <p className="text-amber-700 mb-6 max-w-lg mx-auto font-medium">Dokumen LOA Anda di <strong>{profile.perusahaan}</strong> sedang ditinjau oleh Staff Prodi untuk menentukan mata kuliah apa saja yang bisa dikonversi.</p>
                      <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-amber-200 text-amber-800 text-sm font-bold">
                        Estimasi Verifikasi: Maks. 2x24 Jam
                      </div>
                    </div>
                  )}

                  {profile.status === 'Pilih_Dosen' && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-lg flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-green-100 tracking-wider uppercase mb-1">Verifikasi Berhasil</h3>
                          <h2 className="text-3xl font-black mb-2">Selamat, LOA Disetujui! 🎉</h2>
                          <p className="text-green-50 font-medium">Langkah selanjutnya: Silakan pilih Dosen Pembimbing untuk magang Anda.</p>
                        </div>
                        <Link href="/pilih-dosen" className="px-6 py-3 bg-white text-green-700 font-black rounded-xl shadow-md hover:scale-105 transition-transform">
                          Pilih Dosen Sekarang
                        </Link>
                      </div>

                      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-4">Hasil Keputusan Konversi SKS</h3>
                        <div className="flex gap-4 items-center mb-6">
                          <span className="px-3 py-1.5 bg-blue-100 text-blue-800 font-bold rounded-lg text-sm">Tipe: {profile.tipeKonversi}</span>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Mata Kuliah Yang Dikonversi:</p>
                          <ul className="space-y-2">
                            {profile.matkulKonversi.map((matkul, idx) => (
                              <li key={idx} className="flex items-center gap-3 text-gray-800 font-medium">
                                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                {matkul}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.status === 'Aktif' && (
                    <div className="bg-gradient-to-br from-[#1e3a8a] to-blue-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                      <h3 className="text-sm font-bold text-blue-200 tracking-wider uppercase mb-2">Penempatan Magang Aktif</h3>
                      <h2 className="text-3xl font-black mb-1">{profile.perusahaan}</h2>
                      <p className="text-lg font-medium text-blue-100 mb-8">{profile.posisi}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                          <p className="text-blue-200 text-xs font-bold uppercase mb-1">Dosen Pembimbing</p>
                          <p className="font-bold text-lg">{profile.dosen}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20">
                          <p className="text-blue-200 text-xs font-bold uppercase mb-1">Sistem Konversi</p>
                          <p className="font-bold text-lg">{profile.tipeKonversi} ({profile.matkulKonversi.length} Matkul)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {profile.status === 'Selesai' && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-10 text-center shadow-sm">
                      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-black text-emerald-900 mb-2">Magang Telah Selesai!</h3>
                      <p className="text-emerald-700 mb-6 max-w-lg mx-auto font-medium">Terima kasih telah menyelesaikan program magang. Silakan unggah Laporan Akhir dan Lembar Penilaian dari perusahaan.</p>
                      <button className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:bg-emerald-700 transition-all">
                        Upload Laporan Akhir
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ================= TAB LOGBOOK ================= */}
              {activeTab === 'Logbook' && (
                <motion.div key="logbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 bg-slate-50">
                      <h3 className="text-xl font-black text-gray-900">Catat Logbook Harian</h3>
                      <p className="text-sm text-gray-500 mt-1">Catat aktivitas harian Anda dan lampirkan link bukti Google Drive.</p>
                    </div>
                    <form onSubmit={handleLogbookSubmit} className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Tanggal *</label><input type="date" required value={logbookForm.tanggal} onChange={(e) => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full px-5 py-3.5 border rounded-xl bg-gray-50 outline-none text-gray-900" /></div>
                        <div><label className="block text-sm font-bold text-gray-700 mb-2">Link Bukti (Opsional)</label><input type="url" value={logbookForm.link_bukti} onChange={(e) => setLogbookForm({...logbookForm, link_bukti: e.target.value})} className="w-full px-5 py-3.5 border rounded-xl bg-gray-50 outline-none text-gray-900" placeholder="https://drive.google.com/..." /></div>
                      </div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">Detail Kegiatan *</label><textarea required rows={3} value={logbookForm.kegiatan} onChange={(e) => setLogbookForm({...logbookForm, kegiatan: e.target.value})} className="w-full px-5 py-4 border rounded-xl bg-gray-50 outline-none text-gray-900 resize-none"></textarea></div>
                      <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all">{isSubmitting ? 'Menyimpan...' : 'Simpan Logbook'}</button>
                    </form>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                    <h3 className="text-xl font-black text-gray-900 mb-6">Riwayat Logbook Saya</h3>
                    <div className="space-y-4">
                      {logbooks.map((log) => (
                        <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg text-sm">{log.tanggal}</span>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-md border ${log.status === 'Divalidasi' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>{log.status}</span>
                            </div>
                            <p className="text-gray-700 mt-2 text-sm leading-relaxed">{log.kegiatan}</p>
                          </div>
                          {log.link && (
                            <a href={log.link} target="_blank" rel="noreferrer" className="shrink-0 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 font-bold rounded-lg hover:bg-blue-100 transition-colors text-sm flex items-center gap-2 w-fit">
                              Lihat Bukti
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ================= TAB PROFIL ================= */}
              {activeTab === 'Profil' && (
                <motion.div key="profil" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative">
                    <div className="absolute top-8 right-8">
                      {!isEditingProfile ? (
                        <button onClick={() => setIsEditingProfile(true)} className="px-5 py-2.5 bg-blue-50 text-[#1e3a8a] font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm border border-blue-200">Edit Profil</button>
                      ) : (
                        <button onClick={() => setIsEditingProfile(false)} className="px-5 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors text-sm">Batal Edit</button>
                      )}
                    </div>

                    {!isEditingProfile ? (
                      <>
                        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-50 shadow-md shrink-0 bg-blue-100 flex items-center justify-center">
                            {profile.fotoUrl ? <img src={profile.fotoUrl} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-[#1e3a8a]">{profile.nama.charAt(0)}</span>}
                          </div>
                          <div>
                            <h3 className="text-2xl font-black text-gray-900">{profile.nama}</h3>
                            <p className="text-gray-500 font-medium">{profile.prodi} — {profile.fakultas}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div><label className="text-xs font-black text-gray-400 uppercase tracking-widest">NIM</label><p className="text-lg font-bold text-gray-900 mt-1">{profile.nim}</p></div>
                          <div><label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email</label><p className="text-lg font-bold text-gray-900 mt-1">{profile.email}</p></div>
                          <div><label className="text-xs font-black text-gray-400 uppercase tracking-widest">Tanggal Lahir</label><p className="text-lg font-bold text-gray-900 mt-1">{profile.tanggalLahir ? new Date(profile.tanggalLahir).toLocaleDateString('id-ID') : '-'}</p></div>
                          <div><label className="text-xs font-black text-gray-400 uppercase tracking-widest">No HP</label><p className="text-lg font-bold text-gray-900 mt-1">{profile.noHp || '-'}</p></div>
                        </div>
                      </>
                    ) : (
                      <form onSubmit={handleSaveProfile}>
                        <div className="flex items-center gap-6 mb-8 pb-6 border-b">
                          <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-100 shadow-sm shrink-0 bg-gray-100 flex items-center justify-center">
                              {profile.fotoUrl ? <img src={profile.fotoUrl} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-4xl font-black text-gray-400">{profile.nama.charAt(0)}</span>}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="text-white text-xs font-bold text-center">Ubah<br/>Foto</span></button>
                            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoChange} />
                          </div>
                          <div><h3 className="text-xl font-black text-gray-900 mb-1">Ubah Foto Profil</h3></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label><input type="text" value={profile.nama} onChange={(e) => setProfile({...profile, nama: e.target.value})} required className="w-full px-4 py-3 border rounded-xl bg-white outline-none text-gray-900" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">NIM (Tidak bisa diubah)</label><input type="text" value={profile.nim} disabled className="w-full px-4 py-3 border rounded-xl bg-gray-100 text-gray-500 outline-none" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Email</label><input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} required className="w-full px-4 py-3 border rounded-xl bg-white outline-none text-gray-900" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Lahir</label><input type="date" value={profile.tanggalLahir} onChange={(e) => setProfile({...profile, tanggalLahir: e.target.value})} required className="w-full px-4 py-3 border rounded-xl bg-white outline-none text-gray-900" /></div>
                          <div><label className="block text-sm font-bold text-gray-700 mb-2">Nomor HP</label><input type="tel" value={profile.noHp} onChange={(e) => setProfile({...profile, noHp: e.target.value})} className="w-full px-4 py-3 border rounded-xl bg-white outline-none text-gray-900" /></div>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-gray-100"><button type="submit" className="px-8 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all">Simpan Perubahan</button></div>
                      </form>
                    )}
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}