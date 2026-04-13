"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PendaftaranPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    perusahaan: '', posisi: '', jenis_magang: 'Konversi',
    link_ktm: '', link_ktp: '', link_cv: '' // 3 State Dokumen Baru
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/pengajuan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      alert('Pendaftaran berhasil dikirim! Menunggu verifikasi dosen.');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-[#1e3a8a] px-8 py-6 text-white">
          <h2 className="text-2xl font-extrabold">Formulir Pendaftaran Magang</h2>
          <p className="text-blue-200 text-sm mt-1">Lengkapi data institusi dan dokumen persyaratan di bawah ini.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Bagian Informasi Pekerjaan */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Informasi Magang</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nama Perusahaan</label>
                <input type="text" required value={formData.perusahaan} onChange={(e) => setFormData({...formData, perusahaan: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Posisi / Role</label>
                <input type="text" required value={formData.posisi} onChange={(e) => setFormData({...formData, posisi: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-1">Jenis Magang</label>
                <select value={formData.jenis_magang} onChange={(e) => setFormData({...formData, jenis_magang: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900">
                  <option value="Konversi">Bisa Dikonversi (20 SKS)</option>
                  <option value="Non-Konversi">Non-Konversi (Magang Mandiri)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bagian Upload Dokumen */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">Dokumen Persyaratan (Link Google Drive)</h3>
            <p className="text-xs text-orange-600 font-medium mb-4 bg-orange-50 p-3 rounded-lg">Pastikan akses link Google Drive diubah menjadi "Anyone with the link can view".</p>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Scan KTM (Kartu Tanda Mahasiswa)</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_ktm} onChange={(e) => setFormData({...formData, link_ktm: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Scan KTP</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_ktp} onChange={(e) => setFormData({...formData, link_ktp: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link Curriculum Vitae (CV) ATS</label>
                <input type="url" required placeholder="https://drive.google.com/..." value={formData.link_cv} onChange={(e) => setFormData({...formData, link_cv: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white text-gray-900" />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Link href="/dashboard" className="flex-1 text-center py-3.5 px-4 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">Batal</Link>
            <button type="submit" disabled={isLoading} className="flex-1 py-3.5 px-4 rounded-xl shadow-md font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 transition-colors disabled:opacity-70">
              {isLoading ? 'Mengirim Data...' : 'Kirim Pengajuan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}