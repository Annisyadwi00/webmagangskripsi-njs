"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profil' | 'keamanan'>('profil');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data User (Ditambah "photo")
  const [user, setUser] = useState({ name: '', email: '', role: '', nim_nidn: '', prodi: '', phone: '', photo: '' });
  
  // Data Keamanan
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = (await res.json()).data;
          setUser({
            name: data.name || '',
            email: data.email || '',
            role: data.role || 'Pengguna',
            nim_nidn: data.nim_nidn || '-',
            prodi: data.prodi || '-',
            phone: data.phone || '',
            photo: data.photo || '' // Memuat foto dari database
          });
        } else {
          router.push('/login');
        }
      } catch (error) {
        showToast('Gagal memuat data akun.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  // ---> FUNGSI UBAH FOTO JADI BASE64 <---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Batasi ukuran foto maks 2MB
    if (file.size > 2 * 1024 * 1024) {
      return showToast("Ukuran foto terlalu besar! Maksimal 2MB.", "error");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser({ ...user, photo: reader.result as string });
    };
    reader.readAsDataURL(file); // Convert ke text Base64
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', name: user.name, phone: user.phone, photo: user.photo })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Profil berhasil diperbarui!', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return showToast('Konfirmasi kata sandi tidak cocok!', 'error');
    if (passwords.new.length < 8) return showToast('Kata sandi baru minimal 8 karakter!', 'error');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', currentPassword: passwords.current, newPassword: passwords.new })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Kata sandi berhasil diubah!', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center animate-pulse">
          <div className="w-16 h-16 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-3 bg-gray-100 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 relative">
      
      {/* CUSTOM TOAST */}
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

      {/* HEADER SEDERHANA */}
      <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 text-gray-400 hover:text-[#1e3a8a] hover:bg-blue-50 rounded-full transition-colors group">
            <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <h1 className="font-extrabold text-gray-900 text-lg">Pengaturan Akun</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR PENGATURAN */}
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            
            {/* Profil Mini (Sidebar) */}
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full border-2 border-[#1e3a8a]/20 bg-gradient-to-tr from-[#1e3a8a] to-blue-500 text-white flex items-center justify-center font-black text-xl overflow-hidden shadow-inner flex-shrink-0">
                {user.photo ? (
                  <img src={user.photo} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{user.role}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'profil' ? 'bg-blue-50 text-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> Profil Personal
              </button>
              <button onClick={() => setActiveTab('keamanan')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'keamanan' ? 'bg-blue-50 text-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg> Keamanan & Sandi
              </button>
            </nav>
          </div>
        </aside>

        {/* KONTEN PENGATURAN */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {/* --- TAB PROFIL --- */}
            {activeTab === 'profil' && (
              <motion.div key="profil" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Informasi Personal</h2>
                  <p className="text-gray-500 mb-8 border-b pb-6">Kelola data diri Anda. Beberapa data yang terikat dengan identitas kampus tidak dapat diubah secara langsung.</p>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    
                    {/* FOTO PROFIL UPLOAD */}
                    <div className="flex items-center gap-6 mb-8">
                      <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                      <div 
                        onClick={() => fileInputRef.current?.click()} 
                        className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group relative shadow-inner"
                      >
                        {user.photo ? (
                          <img src={user.photo} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl font-black text-gray-400">{user.name.charAt(0).toUpperCase()}</span>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span className="text-[10px] font-bold uppercase">Ubah Foto</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">Foto Profil</h4>
                        <p className="text-sm text-gray-500">Klik gambar di samping untuk mengganti foto Anda. Format didukung: JPG, PNG. (Maks 2MB).</p>
                        <button type="button" onClick={() => setUser({...user, photo: ''})} className="text-xs font-bold text-red-500 mt-2 hover:underline">Hapus Foto</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                        <input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Alamat Email (Read Only)</label>
                        <input type="email" value={user.email} disabled className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">{user.role === 'Dosen' ? 'NIDN' : 'NIM'} (Read Only)</label>
                        <input type="text" value={user.nim_nidn} disabled className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Nomor Telepon / WhatsApp</label>
                        <input type="text" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value.replace(/[^0-9]/g, '')})} placeholder="081234567890" className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" />
                      </div>
                    </div>

                    {user.role === 'Mahasiswa' && (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Program Studi (Read Only)</label>
                        <input type="text" value={user.prodi} disabled className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" />
                      </div>
                    )}

                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                      <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg shadow-blue-900/30 hover:bg-blue-900 hover:-translate-y-0.5 transition-all disabled:opacity-70">
                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* --- TAB KEAMANAN --- */}
            {activeTab === 'keamanan' && (
              <motion.div key="keamanan" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Ganti Kata Sandi</h2>
                  <p className="text-gray-500 mb-8 border-b pb-6">Pastikan kata sandi baru Anda unik dan memiliki minimal 8 karakter demi keamanan akun Anda.</p>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Saat Ini</label>
                      <input type="password" required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="••••••••" />
                    </div>
                    
                    <div className="pt-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Baru</label>
                      <input type="password" required minLength={8} value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="Minimal 8 karakter" />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                      <input type="password" required minLength={8} value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="Ulangi kata sandi baru" />
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <button type="submit" disabled={isSubmitting || !passwords.current || !passwords.new} className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 w-full sm:w-auto">
                        {isSubmitting ? 'Memproses...' : 'Perbarui Kata Sandi'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}