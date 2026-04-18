"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState<'Status' | 'Logbook' | 'Profil'>('Status');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaForm, setLoaForm] = useState({ link_loa: '', nama_perusahaan: '', posisi: '' });
  const [logbookForm, setLogbookForm] = useState({ tanggal: '', kegiatan: '', link_bukti: '' });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State Profil Terintegrasi
  const [profile, setProfile] = useState({ 
    nama: "Memuat...", 
    nim: "Memuat...", 
    email: "Memuat...", 
    prodi: "S1 Informatika", 
    fakultas: "Ilmu Komputer (Fasilkom)", 
    tanggalLahir: "", 
    noHp: "", 
    fotoUrl: null as string | null,
    // Data Magang Dinamis (Default: Belum_Upload)
    status: "Belum_Upload", 
    perusahaan: "-",
    posisi: "-",
    tipeKonversi: "-",
    matkulKonversi: [] as string[],
    dosen: "-"
  });

  const [logbooks, setLogbooks] = useState<any[]>([]);

  // Fungsi Tarik Data dari Database
  const fetchAllData = async () => {
    try {
      // 1. Ambil Identitas User
      const resUser = await fetch('/api/auth/me');
      if (resUser.ok) {
        const userData = (await resUser.json()).data;
        setProfile(prev => ({
          ...prev,
          nama: userData.name,
          nim: userData.nim_nidn,
          email: userData.email,
          prodi: userData.prodi || "S1 Informatika"
        }));
      }

      // 2. Ambil Status Magang (Pengajuan)
      const resPengajuan = await fetch('/api/Pengajuan');
      if (resPengajuan.ok) {
        const pengajuanData = (await resPengajuan.json()).data;
        if (pengajuanData) {
          // Jika ada data pengajuan, timpa statusnya
          setProfile(prev => ({
            ...prev,
            status: pengajuanData.status, // Menunggu_Verifikasi, Pilih_Dosen, Aktif, Selesai
            perusahaan: pengajuanData.perusahaan,
            posisi: pengajuanData.posisi,
            tipeKonversi: pengajuanData.tipeKonversi || "-",
            // Parsing string JSON matkul jika ada
            matkulKonversi: pengajuanData.matkulKonversi ? JSON.parse(pengajuanData.matkulKonversi) : [],
            dosen: pengajuanData.nama_dosen || "-"
          }));
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Fungsi Kirim Form LOA ke MySQL
  const handleLoaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/Pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_perusahaan: loaForm.nama_perusahaan,
          posisi: loaForm.posisi,
          link_loa: loaForm.link_loa
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert("LOA berhasil dikirim! Menunggu verifikasi Admin.");
      setLoaForm({ link_loa: '', nama_perusahaan: '', posisi: '' }); // Reset form
      fetchAllData(); // Refresh tampilan seketika
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert("Logbook harian berhasil dicatat! (Masih simulasi)");
      setLogbooks([{ id: Date.now(), ...logbookForm, status: "Menunggu Validasi" }, ...logbooks]);
      setLogbookForm({ tanggal: '', kegiatan: '', link_bukti: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingProfile(false);
    alert("Data profil berhasil diperbarui! (Masih simulasi)");
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
      
      {/* SIDEBAR MAHASISWA */}
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
                  
                  {/* JIKA BELUM ADA DATA PENGAJUAN SAMA SEKALI */}
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
                        <button type="submit" disabled={isSubmitting} className="px-8 py-4 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-md hover:bg-blue-900 transition-all">{isSubmitting ? 'Mengirim Data...' : 'Kirim Form Verifikasi'}</button>
                      </form>
                    </div>
                  )}

                  {profile.status === 'Menunggu_Verifikasi' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-10 text-center shadow-sm">
                      <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-5">
                        <svg className="w-10 h-10 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <h3 className="text-2xl font-black text-amber-900 mb-2">Sedang Dalam Tahap Verifikasi</h3>
                      <p className="text-amber-700 mb-6 max-w-lg mx-auto font-medium">Dokumen LOA Anda di <strong>{profile.perusahaan}</strong> sedang ditinjau oleh Admin Prodi untuk menentukan mata kuliah apa saja yang bisa dikonversi.</p>
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
                            {profile.matkulKonversi.length === 0 ? <p className="text-sm text-gray-500">Tidak ada matkul konversi (Reguler).</p> : profile.matkulKonversi.map((matkul, idx) => (
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
                </motion.div>
              )}

              {/* ================= TAB LOGBOOK & PROFIL (Dipotong agar kode tidak terlalu panjang, gunakan versi sebelumnya) ================= */}
              {activeTab === 'Logbook' && (
                 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center py-20">
                    <p className="text-gray-500 font-bold">Fitur Logbook sama seperti kode sebelumnya.</p>
                 </div>
              )}
              {activeTab === 'Profil' && (
                 <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center py-20">
                    <p className="text-gray-500 font-bold">Fitur Profil sama seperti kode sebelumnya.</p>
                 </div>
              )}
           </AnimatePresence>
        </div>
      </main>
    </div>
  );
}