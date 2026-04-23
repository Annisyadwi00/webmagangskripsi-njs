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

  const [user, setUser] = useState({ name: '', email: '', role: '', nim_nidn: '', prodi: '', phone: '', photo: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // REVISI: State untuk tombol mata (show password)
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
            name: data.name || '', email: data.email || '', role: data.role || 'Pengguna',
            nim_nidn: data.nim_nidn || '-', prodi: data.prodi || '-', phone: data.phone || '', photo: data.photo || ''
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return showToast("Ukuran foto terlalu besar! Maksimal 2MB.", "error");

    const reader = new FileReader();
    reader.onloadend = () => setUser({ ...user, photo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_profile', name: user.name, phone: user.phone, photo: user.photo })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Profil berhasil diperbarui!', 'success');
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) return showToast('Konfirmasi kata sandi tidak cocok!', 'error');
    if (passwords.new.length < 8) return showToast('Kata sandi baru minimal 8 karakter!', 'error');
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_password', currentPassword: passwords.current, newPassword: passwords.new })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      showToast('Kata sandi berhasil diubah!', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 relative">
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-50">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
        <aside className="w-full md:w-72 flex-shrink-0">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-24">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
              <div className="w-14 h-14 rounded-full border-2 border-[#1e3a8a]/20 bg-gradient-to-tr from-[#1e3a8a] to-blue-500 text-white flex items-center justify-center font-black text-xl overflow-hidden flex-shrink-0">
                {user.photo ? <img src={user.photo} alt="Profil" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h3 className="font-bold text-gray-900 truncate">{user.name}</h3>
                <p className="text-xs font-bold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">{user.role}</p>
              </div>
            </div>
            <nav className="space-y-2">
              <button onClick={() => setActiveTab('profil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'profil' ? 'bg-blue-50 text-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>Profil Personal</button>
              <button onClick={() => setActiveTab('keamanan')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${activeTab === 'keamanan' ? 'bg-blue-50 text-[#1e3a8a]' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>Keamanan & Sandi</button>
            </nav>
          </div>
        </aside>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            
            {activeTab === 'profil' && (
              <motion.div key="profil" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Informasi Personal</h2>
                  <p className="text-gray-500 mb-8 border-b pb-6">Kelola data diri Anda.</p>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                      <input type="file" accept="image/png, image/jpeg, image/jpg" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                      <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group relative shadow-inner">
                        {user.photo ? <img src={user.photo} alt="Profil" className="w-full h-full object-cover" /> : <span className="text-3xl font-black text-gray-400">{user.name.charAt(0).toUpperCase()}</span>}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                          <span className="text-[10px] font-bold uppercase mt-1">Ubah Foto</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">Foto Profil</h4>
                        <p className="text-sm text-gray-500">Format: JPG, PNG. (Maks 2MB).</p>
                        <button type="button" onClick={() => setUser({...user, photo: ''})} className="text-xs font-bold text-red-500 mt-2 hover:underline">Hapus Foto</button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label><input type="text" value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">Email (Read Only)</label><input type="email" value={user.email} disabled className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">{user.role === 'Dosen' ? 'NIDN' : 'NIM'} (Read Only)</label><input type="text" value={user.nim_nidn} disabled className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-100 text-gray-500 cursor-not-allowed outline-none" /></div>
                      <div><label className="block text-sm font-bold text-gray-700 mb-2">No WhatsApp</label><input type="text" value={user.phone} onChange={(e) => setUser({...user, phone: e.target.value.replace(/[^0-9]/g, '')})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" /></div>
                    </div>
                    
                    <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end">
                      <button type="submit" disabled={isSubmitting} className="px-8 py-3.5 bg-[#1e3a8a] text-white font-bold rounded-2xl hover:bg-blue-900 transition-all">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* REVISI: TAB KEAMANAN DENGAN IKON MATA */}
            {activeTab === 'keamanan' && (
              <motion.div key="keamanan" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0, y: -20 }}>
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Ganti Kata Sandi</h2>
                  <p className="text-gray-500 mb-8 border-b pb-6">Pastikan kata sandi baru Anda unik dan memiliki minimal 8 karakter demi keamanan akun Anda.</p>
                  
                  <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                    
                    {/* Password Saat Ini */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Saat Ini</label>
                      <div className="relative">
                        <input type={showCurrentPw ? "text" : "password"} required value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="••••••••" />
                        <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showCurrentPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Password Baru */}
                    <div className="pt-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Kata Sandi Baru</label>
                      <div className="relative">
                        <input type={showNewPw ? "text" : "password"} required minLength={8} value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="Minimal 8 karakter" />
                        <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    {/* Konfirmasi Password */}
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Konfirmasi Kata Sandi Baru</label>
                      <div className="relative">
                        <input type={showConfirmPw ? "text" : "password"} required minLength={8} value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full px-5 py-4 border border-gray-200 rounded-2xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#1e3a8a] text-gray-900 transition-all" placeholder="Ulangi kata sandi baru" />
                        <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showConfirmPw ? '🙈' : '👁️'}
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                      <button type="submit" disabled={isSubmitting || !passwords.current || !passwords.new} className="px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all w-full sm:w-auto">
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