"use client";

import { useState } from 'react';
import Link from 'next/link';

export default function PengajuanMitraPage() {
  const [formData, setFormData] = useState({
    perusahaan: '', posisi: '', deskripsi: '', email_perusahaan: '', link_pendaftaran: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/lowongan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) setIsSuccess(true);
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim pengajuan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Pengajuan Berhasil!</h2>
          <p className="text-gray-600 mb-8">Terima kasih telah berpartisipasi. Lowongan Anda sedang masuk antrean untuk direview oleh tim Admin Fakultas Ilmu Komputer UNSIKA.</p>
          <Link href="/" className="px-6 py-3 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors inline-block">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pt-28">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1e3a8a] px-8 py-8 text-white text-center">
          <h2 className="text-3xl font-extrabold mb-2">Portal Kemitraan Industri</h2>
          <p className="text-blue-200">Ajukan lowongan magang untuk Mahasiswa Fasilkom UNSIKA.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Perusahaan/Instansi *</label>
              <input type="text" required value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-[#1e3a8a]" placeholder="PT Inovasi Bangsa" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Posisi Magang *</label>
              <input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-[#1e3a8a]" placeholder="Software Engineer Intern" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email HR / Narahubung *</label>
              <input type="email" required value={formData.email_perusahaan} onChange={(e) => setFormData({...formData, email_perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-[#1e3a8a]" placeholder="hr@perusahaan.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Link Pendaftaran (Opsional)</label>
              <input type="url" value={formData.link_pendaftaran} onChange={(e) => setFormData({...formData, link_pendaftaran: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-[#1e3a8a]" placeholder="Bila via website eksternal" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi, Syarat & Ketentuan *</label>
            <textarea required rows={5} value={formData.deskripsi} onChange={(e) => setFormData({...formData, deskripsi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 outline-none focus:border-[#1e3a8a]" placeholder="Jelaskan detail pekerjaan, teknologi yang digunakan, dll..."></textarea>
          </div>

          <div className="pt-4 border-t border-gray-100 flex gap-4">
            <Link href="/" className="flex-1 py-4 text-center rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200">Batal</Link>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-xl shadow-md font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 disabled:opacity-70">
              {isSubmitting ? 'Mengirim Data...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}