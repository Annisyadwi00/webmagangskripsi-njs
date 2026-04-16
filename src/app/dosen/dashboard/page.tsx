"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DosenDashboard() {
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Permintaan' | 'Aktif'>('Permintaan');
  
  // State Logbook
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  const [selectedMhs, setSelectedMhs] = useState<any>(null);
  const [mhsLogbooks, setMhsLogbooks] = useState<any[]>([]);
  
  // State Penilaian
  const [showNilaiModal, setShowNilaiModal] = useState(false);
  const [nilai, setNilai] = useState('');

  const fetchMahasiswa = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/pengajuan');
      const json = await res.json();
      if (res.ok) setMahasiswaList(json.data);
    } catch (error) {
      console.error('Error fetching data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMahasiswa(); }, []);

  // FUNGSI ACC BIMBINGAN
  const handleAccBimbingan = async (id: number, action: 'terima' | 'tolak') => {
    if (!confirm(`Yakin ingin ${action} mahasiswa ini?`)) return;
    try {
      await fetch('/api/pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_pengajuan: id, action }) });
      fetchMahasiswa();
    } catch (err) { alert('Gagal memproses'); }
  };

  // FUNGSI LOGBOOK
  const openLogbook = async (mhs: any) => {
    setSelectedMhs(mhs);
    setShowLogbookModal(true);
    try {
      const res = await fetch(`/api/logbook?mhsId=${mhs.mahasiswaId}`);
      const json = await res.json();
      if (res.ok) setMhsLogbooks(json.data);
    } catch (err) {}
  };

  const handleAccLogbook = async (logId: number, status: 'Disetujui' | 'Ditolak') => {
    try {
      await fetch('/api/logbook', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: logId, status }) });
      openLogbook(selectedMhs); // Refresh logbook list
    } catch (err) {}
  };

  // FUNGSI PENILAIAN
  const handleSimpanNilai = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_pengajuan: selectedMhs.id, nilai_dari_dosen: nilai }) });
      alert('Nilai disimpan!');
      setShowNilaiModal(false);
      fetchMahasiswa();
    } catch (err) { alert('Gagal menyimpan nilai'); }
  };

  const displayedMhs = mahasiswaList.filter(m => activeTab === 'Permintaan' ? m.status_dosen === 'Menunggu' : m.status_dosen === 'Disetujui');

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      <aside className="w-72 bg-gradient-to-b from-[#0f1f4d] to-slate-900 text-white flex flex-col hidden md:flex h-screen sticky top-0 shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-extrabold text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200">SI Magang</h1>
          <p className="text-xs text-blue-300 mt-1">Portal Dosen Pembimbing</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <Link href="/dosen/dashboard" className="flex items-center px-4 py-3 bg-white text-[#0f1f4d] rounded-xl font-bold">Dashboard Dosen</Link>
          <Link href="/dosen/profil" className="flex items-center px-4 py-3 text-blue-200 hover:bg-white/10 rounded-xl font-medium transition-colors">Profil Saya</Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <a href="/" className="flex px-4 py-2 text-sm text-blue-200 hover:text-white">Kembali ke Home</a>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b px-8 py-5 sticky top-0 z-10">
          <h2 className="text-2xl font-extrabold text-[#0f1f4d]">Ruang Dosen</h2>
        </header>

        <div className="p-8 max-w-7xl mx-auto w-full">
          
          <div className="flex gap-4 mb-6">
            <button onClick={() => setActiveTab('Permintaan')} className={`px-6 py-3 font-bold rounded-xl transition-all flex gap-2 ${activeTab === 'Permintaan' ? 'bg-[#0f1f4d] text-white shadow-md' : 'bg-white text-gray-500'}`}>
              Permintaan Bimbingan
              {mahasiswaList.filter(m => m.status_dosen === 'Menunggu').length > 0 && (
                <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">{mahasiswaList.filter(m => m.status_dosen === 'Menunggu').length}</span>
              )}
            </button>
            <button onClick={() => setActiveTab('Aktif')} className={`px-6 py-3 font-bold rounded-xl transition-all ${activeTab === 'Aktif' ? 'bg-[#0f1f4d] text-white shadow-md' : 'bg-white text-gray-500'}`}>
              Mahasiswa Aktif & Penilaian
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold border-b">
                  <th className="p-5">Mahasiswa</th>
                  <th className="p-5">Perusahaan</th>
                  {activeTab === 'Aktif' && <th className="p-5 text-center">Nilai</th>}
                  <th className="p-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {displayedMhs.length === 0 ? (
                  <tr><td colSpan={4} className="p-5 text-center text-gray-500">Tidak ada data.</td></tr>
                ) : (
                  displayedMhs.map(mhs => (
                    <tr key={mhs.id} className="hover:bg-slate-50">
                      <td className="p-5 font-bold text-gray-800">{mhs.nama_mahasiswa}</td>
                      <td className="p-5 text-gray-600">{mhs.perusahaan} ({mhs.posisi})</td>
                      
                      {activeTab === 'Aktif' && (
                        <td className="p-5 text-center font-black text-lg text-[#0f1f4d]">{mhs.nilai_dari_dosen || '-'}</td>
                      )}
                      
                      <td className="p-5 text-center">
                        {activeTab === 'Permintaan' ? (
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleAccBimbingan(mhs.id, 'terima')} className="px-3 py-1.5 bg-green-100 text-green-700 font-bold rounded-lg">Terima</button>
                            <button onClick={() => handleAccBimbingan(mhs.id, 'tolak')} className="px-3 py-1.5 bg-red-100 text-red-700 font-bold rounded-lg">Tolak</button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => openLogbook(mhs)} className="px-3 py-1.5 bg-blue-100 text-blue-700 font-bold rounded-lg">Cek Logbook</button>
                            <button onClick={() => { setSelectedMhs(mhs); setNilai(mhs.nilai_dari_dosen || ''); setShowNilaiModal(true); }} className="px-3 py-1.5 bg-[#0f1f4d] text-white font-bold rounded-lg">Beri Nilai</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL LOGBOOK */}
      <AnimatePresence>
        {showLogbookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-white w-full max-w-3xl rounded-3xl p-8 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b pb-4 mb-4">
                <h3 className="text-2xl font-black text-[#0f1f4d]">Logbook: {selectedMhs?.nama_mahasiswa}</h3>
                <button onClick={() => setShowLogbookModal(false)} className="text-gray-400 hover:text-red-500 font-bold">TUTUP ✕</button>
              </div>
              <div className="space-y-4">
                {mhsLogbooks.length === 0 ? <p className="text-center text-gray-500">Belum ada logbook.</p> : mhsLogbooks.map(log => (
                  <div key={log.id} className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">{new Date(log.tanggal).toLocaleDateString('id-ID')} • {log.jam_kerja} Jam</p>
                      <p className="font-semibold text-gray-800">{log.kegiatan}</p>
                      <a href={log.link_dokumen} target="_blank" className="text-xs text-blue-600 hover:underline">Lihat Bukti</a>
                    </div>
                    <div>
                      {log.status === 'Pending' ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleAccLogbook(log.id, 'Disetujui')} className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-md font-bold">ACC</button>
                          <button onClick={() => handleAccLogbook(log.id, 'Ditolak')} className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-md font-bold">Tolak</button>
                        </div>
                      ) : (
                        <span className={`text-xs font-bold px-3 py-1 rounded-md ${log.status === 'Disetujui' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* MODAL PENILAIAN */}
        {showNilaiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-md rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-black text-[#0f1f4d] mb-4">Penilaian Akhir Magang</h3>
              <p className="mb-4 text-sm text-gray-600 italic">Evaluasi Mhs: "{selectedMhs?.evaluasi_dari_mahasiswa || 'Belum ada evaluasi'}"</p>
              <form onSubmit={handleSimpanNilai}>
                <select required value={nilai} onChange={(e) => setNilai(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-[#0f1f4d] outline-none font-bold text-lg mb-6 text-gray-900">
                  <option value="" disabled>Pilih Nilai</option>
                  <option value="A">A (Sangat Baik)</option>
                  <option value="B">B (Baik)</option>
                  <option value="C">C (Cukup)</option>
                  <option value="D">D (Kurang)</option>
                </select>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setShowNilaiModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-700">Batal</button>
                  <button type="submit" className="flex-1 py-3 bg-[#0f1f4d] text-white rounded-xl font-bold">Simpan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}