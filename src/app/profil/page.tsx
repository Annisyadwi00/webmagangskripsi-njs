"use client";
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    link_ktm: '', link_ktp: '', link_cv: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Nanti fungsi Submit ini akan kita sambungkan ke API Profil (di langkah selanjutnya)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // (Simulasi sukses untuk saat ini biar desainnya bisa kamu lihat dulu)
    setTimeout(() => {
      alert("Profil dan Dokumen berhasil diperbarui!");
      setIsLoading(false);
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1e3a8a] px-8 py-6 text-white flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div>
            <h2 className="text-2xl font-extrabold">Lengkapi Profil Mahasiswa</h2>
            <p className="text-blue-200 text-sm mt-1">Unggah dokumen wajib sebelum melamar magang.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Dokumen Persyaratan Dasar</h3>
            <p className="text-xs text-orange-600 font-medium mb-6 bg-orange-50 p-3 rounded-lg border border-orange-100">
              ⚠️ Gunakan link Google Drive dan pastikan akses link diubah menjadi "Anyone with the link can view".
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Scan KTM (Kartu Tanda Mahasiswa)</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_ktm} onChange={(e) => setFormData({...formData, link_ktm: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Scan KTP</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_ktp} onChange={(e) => setFormData({...formData, link_ktp: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Curriculum Vitae (CV) / Portofolio</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_cv} onChange={(e) => setFormData({...formData, link_cv: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900 transition-colors" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <button type="submit" disabled={isLoading} className="w-full py-4 px-4 rounded-xl shadow-md font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 transition-colors disabled:opacity-70">
              {isLoading ? 'Menyimpan Profil...' : 'Simpan Dokumen Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}