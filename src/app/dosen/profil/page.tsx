"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DosenProfil() {
  // State untuk Data Profil
  const [profileData, setProfileData] = useState({
    nama: 'Dr. Budi Santoso, M.Kom',
    nidn: '0412345678',
    email: 'budi.santoso@unsika.ac.id',
    phone: '081234567890',
    keahlian: 'Software Engineering, Artificial Intelligence',
    foto: null as string | null
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fungsi untuk Handle Ganti Foto (Preview)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pt-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden"
      >
        {/* HEADER */}
        <div className="bg-[#0f1f4d] px-8 py-8 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dosen/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h2 className="text-2xl font-black tracking-tight">Profil Dosen</h2>
          </div>
          <span className="px-4 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-bold uppercase tracking-widest">Dosen Pembimbing</span>
        </div>

        <div className="p-8 lg:p-10">
          <form className="space-y-8">
            
            {/* BAGIAN FOTO PROFIL */}
            <div className="flex flex-col items-center pb-8 border-b border-gray-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-lg relative">
                  {profileData.foto ? (
                    <img src={profileData.foto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#0f1f4d]/20">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Tombol Hover Ganti Foto */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 w-full h-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-3xl text-white font-bold text-xs"
                >
                  GANTI FOTO
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                className="hidden" 
                accept="image/*"
              />
              <div className="mt-4 text-center">
                <h3 className="text-xl font-black text-gray-900">{profileData.nama}</h3>
                <p className="text-sm text-gray-500 font-medium">NIDN: {profileData.nidn}</p>
              </div>
            </div>

            {/* FORM DATA DIRI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  defaultValue={profileData.nama}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0f1f4d] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">NIDN / NIP</label>
                <input 
                  type="text" 
                  disabled 
                  value={profileData.nidn} 
                  className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-400 font-bold cursor-not-allowed" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Email Institusi</label>
                <input 
                  type="email" 
                  defaultValue={profileData.email}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0f1f4d] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-wider">No. WhatsApp</label>
                <input 
                  type="tel" 
                  defaultValue={profileData.phone}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0f1f4d] outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 uppercase tracking-wider">Bidang Keahlian (Expertise)</label>
              <textarea 
                rows={3}
                defaultValue={profileData.keahlian}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#0f1f4d] outline-none transition-all resize-none"
              />
            </div>

            <div className="pt-6">
              <button 
                type="button" 
                onClick={() => alert("Profil Anda berhasil diperbarui!")}
                className="w-full py-4 bg-[#0f1f4d] text-white font-black rounded-2xl shadow-lg shadow-blue-900/20 hover:bg-[#1a2e63] hover:-translate-y-0.5 transition-all"
              >
                SIMPAN PERUBAHAN
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}