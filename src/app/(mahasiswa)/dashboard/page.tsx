"use client"; // (Pastikan ini ada kalau ini file frontend)

import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
export default function DashboardMahasiswa() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'Magang' | 'Logbook' | 'Dokumen'>('Magang');
  const [filterLogbook, setFilterLogbook] = useState<'Semua' | 'Disetujui' | 'Revisi' | 'Pending'>('Semua');
  const [user, setUser] = useState<{name: string, nim: string, prodi: string, role: string, id: number} | null>(null);
  const [pengajuan, setPengajuan] = useState<any>(null);
  const [logbooks, setLogbooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
  // Filter logbook berdasarkan status
  const logbookPending = logbooks.filter(l => l.status === 'Pending' || l.status === 'Menunggu Validasi');
  const logbookDiterima = logbooks.filter(l => l.status === 'Disetujui');
  const logbookDitolak = logbooks.filter(l => l.status === 'Ditolak' || l.status === 'Revisi');

  // Mobile & Dark Mode State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Modal State
  const [showLOAModal, setShowLOAModal] = useState(false);
  const [showLogbookModal, setShowLogbookModal] = useState(false);
  const [showLaporanModal, setShowLaporanModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [loaForm, setLoaForm] = useState({ perusahaan: '', posisi: '', link_loa: '', tgl_mulai: '', tgl_berakhir: ''});
  const [logbookForm, setLogbookForm] = useState({ judul: 'Logbook Harian', tanggal: '', kegiatan: '', link_bukti: '' });

  useEffect(() => {
    // Cek apakah mode malam sudah aktif sebelumnya
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);
  }, []);
  // Fungsi menghitung persentase progres magang
 


  // Logika Cek apakah boleh upload Laporan Akhir
  // Syarat: Minimal sudah ada logbook, dan SEMUA logbook harus 'Disetujui'
  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
    setIsDarkMode(!isDarkMode);
  };

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 4000);
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resUser = await fetch('/api/auth/me');
      if (!resUser.ok) throw new Error("Unauthenticated");
      const userData = (await resUser.json()).data;
      setUser({ name: userData.name, nim: userData.nim_nidn, prodi: userData.prodi, role: userData.role, id: userData.id });

      const [resPengajuan, resLogbook] = await Promise.all([
        fetch('/api/pengajuan'),
        fetch('/api/logbook')
      ]);
      
      if (resPengajuan.ok) {
        const data = await resPengajuan.json();
        const userPengajuan = data.data.find((p: any) => p.user_id === userData.id);
        setPengajuan(userPengajuan || null);
      }
      if (resLogbook.ok) setLogbooks((await resLogbook.json()).data || []);
      
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [router]);

  const handleSubmitLOA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Masukkan tgl_mulai dan tgl_berakhir ke payload
      const payload = { 
        perusahaan: loaForm.perusahaan, posisi: loaForm.posisi, link_loa: loaForm.link_loa, 
        nama_mahasiswa: user?.name,
        tgl_mulai: loaForm.tgl_mulai, tgl_berakhir: loaForm.tgl_berakhir
      };
      const res = await fetch('/api/pengajuan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Terjadi kesalahan sistem');
      showToast('LOA Berhasil Diajukan!', 'success'); 
      setShowLOAModal(false); 
      setLoaForm({ perusahaan: '', posisi: '', link_loa: '', tgl_mulai: '', tgl_berakhir: '' }); 
      fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };
    const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header Kop Surat Sederhana
    doc.setFontSize(14);
    doc.text("UNIVERSITAS SINGAPERBANGSA KARAWANG", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("FAKULTAS ILMU KOMPUTER", 105, 22, { align: "center" });
    doc.line(20, 25, 190, 25); // Garis Pembatas

    // Judul Dokumen
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LEMBAR PENGESAHAN LAPORAN MAGANG", 105, 40, { align: "center" });

    // Isi Data Mahasiswa
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nama Mahasiswa : ${user?.name || '-'}`, 20, 55);
    doc.text(`NPM            : ${user?.nim || '-'}`, 20, 62);
    doc.text(`Perusahaan     : ${pengajuan?.perusahaan || '-'}`, 20, 69);
    doc.text(`Posisi Magang  : ${pengajuan?.posisi || '-'}`, 20, 76);
    doc.text(`Periode        : ${pengajuan?.tgl_mulai} s/d ${pengajuan?.tgl_berakhir}`, 20, 83);

    // Tabel Nilai (Jika sudah ada)
    if (pengajuan?.nilai_dari_dosen) {
      doc.text("Rincian Penilaian Akademik:", 20, 95);
      (doc as any).autoTable({
        startY: 100,
        head: [['Komponen Penilaian', 'Nilai']],
        body: [
          ['Kedisiplinan', pengajuan.nilai_kedisiplinan || 0],
          ['Pemahaman Materi', pengajuan.nilai_materi || 0],
          ['Kualitas Pekerjaan', pengajuan.nilai_koding || 0],
          ['Laporan Akhir', pengajuan.nilai_laporan || 0],
          ['TOTAL NILAI', pengajuan.nilai_dari_dosen],
        ],
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138] } // Warna Biru Gelap sesuai tema webmu
      });
    }

    // Tanda Tangan
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 120;
    doc.text("Menyetujui,", 150, finalY);
    doc.text("Dosen Pembimbing,", 150, finalY + 7);
    doc.text(`( ${pengajuan?.nama_dosen || '..........................'} )`, 150, finalY + 35);

    // Download File
    doc.save(`Lembar_Pengesahan_${user?.name}.pdf`);
  };
  const handleBatalPengajuan = async () => {
    if (!confirm('Yakin ingin menghapus pengajuan magang ini? Anda harus menginput ulang dari awal.')) return;
    try {
      await fetch('/api/pengajuan', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'batal' }) });
      showToast('Pengajuan Dihapus', 'success'); fetchData();
    } catch (error) { showToast('Gagal membatalkan pengajuan', 'error'); }
  };

  const handleSubmitLogbook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { judul: logbookForm.judul, tanggal: logbookForm.tanggal, kegiatan: logbookForm.kegiatan, link_bukti: logbookForm.link_bukti };
      const res = await fetch('/api/logbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || 'Gagal menyimpan logbook');
      showToast('Logbook berhasil ditambahkan!', 'success'); setShowLogbookModal(false); setLogbookForm({ judul: 'Logbook Harian', tanggal: '', kegiatan: '', link_bukti: '' }); fetchData();
    } catch (err: any) { showToast(err.message, 'error'); } finally { setIsSubmitting(false); }
  };

  const handleLogout = async () => {
   try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };
  // ---> LOGIKA FILTER LOGBOOK <---
  const logbookFiltered = logbooks.filter(l => {
    if (filterLogbook === 'Semua') return true;
    if (filterLogbook === 'Disetujui') return l.status === 'Disetujui';
    if (filterLogbook === 'Revisi') return l.status === 'Revisi' || l.status === 'Ditolak';
    if (filterLogbook === 'Pending') return l.status === 'Pending' || l.status === 'Menunggu Validasi';
    return true;
  });

  // ---> LOGIKA CEK LAPORAN AKHIR <---
  const isLaporanAkhirReady = logbooks.length > 0 && logbooks.every(l => l.status === 'Disetujui');
  const calculateInternProgress = () => {
    if (!pengajuan || !pengajuan.tgl_mulai || !pengajuan.tgl_berakhir) return 0;
    
    const start = new Date(pengajuan.tgl_mulai).getTime();
    const end = new Date(pengajuan.tgl_berakhir).getTime();
    const now = new Date().getTime();

    if (isNaN(start) || isNaN(end)) return 0;
    if (now < start) return 0; 
    if (now > end) return 100; 

    const totalDuration = end - start;
    const timeElapsed = now - start;
    const percent = Math.round((timeElapsed / totalDuration) * 100);
    
    return Math.max(0, Math.min(100, percent));
  };
  // ---> LOGIKA DETEKSI LOGBOOK HARI INI <---
  const checkMissingLogbook = () => {
    if (pengajuan?.status === 'Selesai') return null;
    if (!pengajuan || pengajuan.status_dosen !== 'Disetujui') return null;
    
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Minggu, 1 = Senin, ... 6 = Sabtu
    
    // Abaikan peringatan jika ini hari Sabtu (6) atau Minggu (0)
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;

    // Cek apakah ada logbook harian yang tanggalnya hari ini
    const todayStr = today.toISOString().split('T')[0];
    const hasLogbookToday = logbooks.some(log => 
      log.judul === 'Logbook Harian' && log.tanggal === todayStr
    );

    if (!hasLogbookToday) {
      return "Peringatan: Anda belum mengisi Logbook Harian untuk hari ini!";
    }
    return null;
  };

  const missingLogbookWarning = checkMissingLogbook();
  const progressPercent = calculateInternProgress();

  const statusProgress = [
    { label: 'Upload LOA', done: !!pengajuan, active: !pengajuan },
    { label: 'Verifikasi Admin', done: pengajuan && (pengajuan.status !== 'Menunggu_Verifikasi' && pengajuan.status !== 'Ditolak'), active: pengajuan && pengajuan.status === 'Menunggu_Verifikasi' },
    { label: 'Pilih Dosen', done: pengajuan && pengajuan.status_dosen && pengajuan.status_dosen !== 'Menunggu', active: pengajuan && pengajuan.status === 'Pilih_Dosen' },
    { label: 'Magang Aktif', done: pengajuan && pengajuan.status_dosen === 'Disetujui', active: pengajuan && pengajuan.status === 'Aktif' && pengajuan.status_dosen === 'Menunggu' }
  ];

  if (isLoading || !user) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex font-sans relative overflow-hidden">
      
      {/* Toast Notifikasi */}
      <AnimatePresence>
        {toast.show && (
          <motion.div initial={{ opacity: 0, y: -50, x: '-50%' }} animate={{ opacity: 1, y: 20, x: '-50%' }} exit={{ opacity: 0, y: -50, x: '-50%' }} className="fixed top-0 left-1/2 z-[70]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 text-white ${toast.type === 'error' ? 'bg-red-500 shadow-red-500/30' : 'bg-emerald-500 shadow-emerald-500/30'}`}>
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay Sidebar untuk HP */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar - Sekarang Mendukung Mobile */}
      <aside className={`fixed md:relative top-0 left-0 h-screen w-72 bg-gradient-to-b from-[#1e3a8a] to-blue-900 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 border-b border-white/10 flex justify-between items-center">
          <div>
            <h1 className="font-extrabold text-2xl tracking-wide">SI Magang</h1>
            <p className="text-sm text-blue-200 mt-1 font-medium">Portal Mahasiswa</p>
          </div>
          {/* Tombol Tutup Sidebar di HP */}
          <button className="md:hidden text-white text-2xl" onClick={() => setIsMobileMenuOpen(false)}>✕</button>
        </div>
        
        <nav className="flex-1 py-8 px-5 space-y-3 overflow-y-auto custom-scrollbar">
          <p className="px-2 text-[10px] font-black text-blue-300 uppercase tracking-wider mb-2">Menu Utama</p>

          <button onClick={() => {setActiveTab('Magang'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Magang' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
             Status Magang
          </button>
          <button onClick={() => setActiveTab('Dokumen')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'Dokumen' ? 'bg-white text-[#1e3a8a] shadow-lg' : 'text-blue-100 hover:bg-white/10'}`}>
          📁 Template Dokumen
          </button>
          <button onClick={() => {setActiveTab('Logbook'); setIsMobileMenuOpen(false);}} disabled={!(pengajuan?.status_dosen === 'Disetujui')} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'Logbook' ? 'bg-white text-[#1e3a8a] shadow-lg scale-105' : 'text-blue-100 hover:bg-white/10 hover:translate-x-1'}`}>
             Logbook
          </button>
          
          <Link href="/lowongan" className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-blue-100 hover:bg-white/10 hover:translate-x-1">Bursa Magang</Link>
          <Link href="/settings" className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-blue-100 hover:bg-white/10 hover:translate-x-1">Pengaturan Profil</Link>
        </nav>
        
        <div className="p-6 border-t border-white/10 mt-auto flex flex-col gap-3">
          <Link href="/" className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 text-white hover:bg-white/10 rounded-xl font-bold transition-all shadow-sm border border-white/10 hover:-translate-y-0.5">Kembali ke Beranda</Link>
          <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-all border border-red-500/20 hover:-translate-y-0.5">
  Logout Akun
</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        {/* Header - Tombol Hamburger & Dark Mode Toggle */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200 dark:border-slate-800 px-6 md:px-10 py-5 md:py-6 flex justify-between items-center sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-900 dark:text-white text-2xl" onClick={() => setIsMobileMenuOpen(true)}>☰</button>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{activeTab === 'Magang' ? 'Progress Pendaftaran' : 'Laporan Logbook'}</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4">
            {/* Tombol Dark Mode */}
            <button onClick={toggleDarkMode} className="p-2 md:p-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-all text-xl">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            {activeTab === 'Logbook' && pengajuan?.status_dosen === 'Disetujui' && (
              <button onClick={() => setShowLogbookModal(true)} className="px-4 py-2 md:px-5 md:py-2.5 text-sm md:text-base bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 transition-all hover:-translate-y-0.5">+ Logbook</button>
            )}
          </div>
        </header>

        <div className="p-4 md:p-10 max-w-5xl mx-auto w-full">
           <AnimatePresence mode="wait">
             
             {/* TAB 1: STATUS MAGANG */}
             {activeTab === 'Magang' && (
               <motion.div key="magang" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 
                 <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-6 mb-8 md:mb-10 transition-colors">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-[#1e3a8a] text-[#1e3a8a] dark:text-white rounded-2xl flex items-center justify-center font-black text-2xl md:text-3xl">{user.name.charAt(0)}</div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">{user.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-base">{user.nim} • {user.prodi}</p>
                    </div>
                 </div>
{/* --- Ini adalah bagian bawah kartu Detail Pengajuan --- */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                  {pengajuan?.status === 'Selesai' ? (
                    <div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4 border border-emerald-100 dark:border-emerald-800">
                        <h4 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-1">🎉 Magang Telah Selesai!</h4>
                        <p className="text-emerald-600 dark:text-emerald-300 text-xs">Selamat, seluruh proses magang dan penilaian telah selesai. Anda dapat mencetak lembar pengesahan sekarang.</p>
                      </div>
                      
                      {/* TOMBOL UNDUH PDF */}
                      <button 
                        onClick={generatePDF}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1"
                      >
                        <span className="text-xl">📄</span> Cetak Lembar Pengesahan (PDF)
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-blue-600 dark:text-blue-300 text-xs text-center font-medium">
                        Fitur cetak dokumen pengesahan akan otomatis terbuka setelah Dosen memberikan nilai akhir.
                      </p>
                    </div>
                  )}
                </div>
                 {/* Progress Bar - Bisa Digeser Kanan-Kiri di HP */}
                 <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-12 border border-gray-100 dark:border-slate-700 shadow-sm mb-8 md:mb-10 overflow-x-auto pb-10 transition-colors">
                    <div className="flex items-center min-w-max px-4">
                      {statusProgress.map((step, idx) => (
                        <div key={idx} className="flex items-center relative">
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-base md:text-lg border-4 z-10 transition-colors ${step.done ? 'bg-emerald-500 border-emerald-200 dark:border-emerald-900 text-white' : step.active ? 'bg-[#1e3a8a] border-blue-200 dark:border-blue-900 text-white ring-4 ring-blue-500/20' : 'bg-gray-100 dark:bg-slate-700 border-white dark:border-slate-800 text-gray-400 dark:text-slate-500'}`}>
                            {step.done ? '✓' : idx + 1}
                          </div>
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center">
                            <p className={`text-[10px] md:text-xs font-bold ${step.active || step.done ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>{step.label}</p>
                          </div>
                          {idx !== statusProgress.length - 1 && (
                            <div className={`w-16 md:w-32 h-1 md:h-1.5 mx-2 rounded-full transition-colors ${step.done ? 'bg-emerald-500' : 'bg-gray-100 dark:bg-slate-700'}`}></div>
                          )}
                        </div>
                      ))}
                    </div>
                 </div>

                 {!pengajuan ? (
                    <div className="bg-blue-50/50 dark:bg-slate-800/50 rounded-[32px] p-8 md:p-10 border border-blue-100 dark:border-slate-700 text-center transition-colors">
                      <h4 className="text-lg md:text-xl font-black text-gray-900 dark:text-white mb-2">Belum Mengajukan Magang</h4>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto text-sm md:text-base">Jika Anda sudah mendapatkan tempat magang dan Letter of Acceptance (LOA), silakan cantumkan link dokumen di sini.</p>
                      <button onClick={() => setShowLOAModal(true)} className="px-6 py-3 md:px-8 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg hover:-translate-y-1 transition-all">Input Link LOA</button>
                    </div>
                 ) : pengajuan.status === 'Ditolak' ? (
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-[32px] p-8 md:p-10 border border-red-200 dark:border-red-900/50 text-center transition-colors">
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl md:text-3xl font-black">!</div>
                      <h4 className="text-lg md:text-xl font-black text-red-900 dark:text-red-400 mb-2">Pengajuan LOA Ditolak</h4>
                      <p className="text-red-700 dark:text-red-300 mb-6 max-w-lg mx-auto font-medium text-sm md:text-base">
                        Pengajuan magang di <b>{pengajuan.perusahaan}</b> ditolak oleh Admin Fakultas dengan alasan:<br/>
                        <span className="block mt-4 p-4 bg-red-100 dark:bg-red-900/50 rounded-xl italic font-bold">"{pengajuan.alasan_penolakan || 'Tidak ada alasan'}"</span>
                      </p>
                      <button onClick={handleBatalPengajuan} className="px-6 py-3 md:px-8 md:py-4 bg-red-600 text-white font-bold rounded-2xl shadow-lg hover:bg-red-700 hover:-translate-y-1 transition-all">Hapus & Ajukan Ulang LOA</button>
                    </div>
                 ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-[32px] p-6 md:p-8 border border-gray-100 dark:border-slate-700 shadow-sm relative overflow-hidden transition-colors">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-[#1e3a8a]/20 rounded-bl-full -z-10"></div>
                       
                       <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
                         <div>
                           <p className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Tempat Magang Aktif</p>
                           <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1">{pengajuan.perusahaan}</h3>
                           <p className="text-blue-600 dark:text-blue-400 font-bold">{pengajuan.posisi}</p>
                         </div>
                         <span className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-lg uppercase tracking-wider border w-fit ${pengajuan.status_dosen === 'Disetujui' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : pengajuan.status === 'Menunggu_Verifikasi' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'}`}>
                           {pengajuan.status_dosen === 'Disetujui' ? 'MAGANG AKTIF' : pengajuan.status === 'Menunggu_Verifikasi' ? 'ANTREAN VERIFIKASI' : 'SELEKSI DOSEN'}
                         </span>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                         <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Sistem Konversi (Dari Admin)</p>
                           <p className="font-black text-gray-900 dark:text-white text-sm md:text-base">{pengajuan.tipeKonversi || 'Belum Ditentukan'}</p>
                         </div>
                         <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 transition-colors">
                           <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">Dosen Pembimbing</p>
                           <p className="font-black text-gray-900 dark:text-white text-sm md:text-base">{pengajuan.nama_dosen || 'Belum Ada'}</p>
                         </div>
                       </div>
                       
                      {/* --- TAMPILAN PROGRESS BAR MASA MAGANG --- */}
                       {pengajuan.status_dosen === 'Disetujui' && (
                         <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[24px] p-6 border border-gray-100 dark:border-slate-700 mb-8 relative overflow-hidden transition-colors">
                           <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                             <div>
                               <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 border border-emerald-100 dark:border-emerald-800">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                 Magang Berjalan
                               </div>
                               <h4 className="text-lg font-black text-gray-900 dark:text-white">Progres Waktu Magang</h4>
                             </div>
                             <div className="text-left md:text-right">
                               <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{progressPercent}<span className="text-xl text-indigo-400">%</span></span>
                             </div>
                           </div>
                           
                           {/* Bar Animasi */}
                           <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 mb-2 overflow-hidden border border-gray-300 dark:border-slate-600 p-0.5">
                             <div 
                               className="bg-gradient-to-r from-indigo-500 to-blue-500 h-full rounded-full transition-all duration-1000 relative overflow-hidden" 
                               style={{ width: `${progressPercent}%` }}
                             >
                               <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
                             </div>
                           </div>
                           <div className="flex justify-between text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                             <span>Hari Pertama</span>
                             <span>Selesai (100%)</span>
                           </div>
                         </div>
                       )}
                       {pengajuan.status === 'Aktif' && pengajuan.status_dosen === 'Menunggu' && (
                          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5 mb-6 transition-colors">
                            <p className="text-amber-800 dark:text-amber-400 font-bold text-xs md:text-sm">Menunggu Konfirmasi Dosen. Harap hubungi dosen terkait agar segera di-ACC.</p>
                          </div>
                       )}

                       {pengajuan.status === 'Pilih_Dosen' && (
                         <div className="pt-6 border-t border-gray-100 dark:border-slate-700 text-center transition-colors">
                           <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium text-sm md:text-base">LOA disetujui! Langkah selanjutnya adalah memilih Dosen Pembimbing.</p>
                           <Link href="/pilih-dosen" className="px-6 py-3 md:px-8 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-lg inline-block hover:-translate-y-1 transition-all">Pilih Dosen Sekarang</Link>
                         </div>
                       )}

                       {pengajuan.status === 'Menunggu_Verifikasi' && (
                         <div className="pt-6 border-t border-gray-100 dark:border-slate-700 flex justify-end transition-colors">
                           <button onClick={handleBatalPengajuan} className="text-red-500 dark:text-red-400 font-bold text-xs md:text-sm hover:underline">Batal & Tarik Pengajuan</button>
                         </div>
                       )}
                    </div>
                 )}
               </motion.div>
             )}
             {activeTab === 'Dokumen' && (
  <motion.div key="dokumen" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Pusat Unduhan Format Dokumen</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { title: 'Format Logbook Harian', link: '#' },
        { title: 'Template Laporan Akhir Magang', link: '#' },
        { title: 'Formulir Penilaian Instansi', link: '#' },
        { title: 'Surat Permohonan Izin Magang', link: '#' },
      ].map((doc, i) => (
        <div key={i} className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
          <span className="font-bold text-gray-700 dark:text-gray-300">{doc.title}</span>
          <a href={doc.link} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-100">Unduh PDF</a>
        </div>
      ))}
    </div>
  </motion.div>
)}
              {/*  BAGIAN RIWAYAT LOGBOOK MAHASISWA --- */}
                <div className="mt-2 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-slate-800 pb-6">
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">📋</span>
                        Riwayat Laporan
                      </h3>
                      {/* Tampilkan Peringatan di Sini Jika Ada */}
                      {missingLogbookWarning && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                          <p className="text-yellow-800 dark:text-yellow-300 text-xs font-bold flex items-center gap-2">
                            ⚠️ {missingLogbookWarning}
                          </p>
                        </div>
                      )}
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">Pantau status validasi, nilai, dan pesan dari dosen pembimbingmu di sini.</p>
                    </div>
                  {/* BANNER PERINGATAN LOGBOOK KOSONG */}
                  {missingLogbookWarning && activeTab === 'Logbook' && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center justify-between gap-4 mt-6 animate-pulse">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                          <h4 className="text-sm font-black text-red-800 dark:text-red-400">Tindakan Diperlukan</h4>
                          <p className="text-xs font-bold text-red-600 dark:text-red-300">{missingLogbookWarning}</p>
                        </div>
                      </div>
                      <button onClick={() => setShowLogbookModal(true)} disabled={pengajuan?.status === 'Selesai'}  className={`px-4 py-2 font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 ${pengajuan?.status === 'Selesai' ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#1e3a8a] hover:bg-blue-800 text-white hover:-translate-y-0.5'}`}>
                        {pengajuan?.status === 'Selesai' ? '🔒 Data Dikunci' : '+ Tambah Logbook'}
                        </button>
                    </div>
                  )}
                    {/* FILTER TABS (Desain Lebih Rapi) */}
                    <div className="inline-flex bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-1 overflow-x-auto max-w-full border border-gray-200 dark:border-slate-700">
                      {['Semua', 'Disetujui', 'Revisi', 'Pending'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setFilterLogbook(status as any)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                            filterLogbook === status 
                            ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
{/* MODAL UNGGAH LAPORAN AKHIR */}
      <AnimatePresence>
        {showLaporanModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLaporanModal(false)}></div>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 z-10 transition-colors">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 md:hidden"></div>
              
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-sm">🎓</div>
              
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Unggah Laporan Akhir</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs md:text-sm border-b border-gray-100 dark:border-slate-700 pb-6">Selamat! Kamu telah menyelesaikan seluruh rangkaian logbook. Silakan lampirkan draf laporan akhir magangmu di bawah ini.</p>
              
              <form onSubmit={(e) => { e.preventDefault(); alert("Fitur submit laporan akhir sedang dalam pengembangan!"); setShowLaporanModal(false); }} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Dokumen (Google Drive / PDF) *</label>
                  <input type="url" required className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm md:text-base" placeholder="https://drive.google.com/..." />
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50 mt-4">
                  <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
                    <strong>Penting:</strong> Pastikan akses link Google Drive tidak terkunci (Anyone with the link can view) agar Dosen Penguji dapat membacanya.
                  </p>
                </div>
                
                <div className="flex gap-3 md:gap-4 pt-4 mt-2">
                  <button type="button" onClick={() => setShowLaporanModal(false)} className="flex-1 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Nanti Saja</button>
                  <button type="submit" className="flex-1 py-3 md:py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-all text-sm md:text-base">Kirim Laporan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
                  {/* INFO LAPORAN AKHIR (Desain Banner Alert Lembut) */}
                  {isLaporanAkhirReady ? (
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 dark:shadow-none relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                      </div>
                      <div className="relative z-10">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/20">Akses Terbuka</span>
                        <h4 className="text-xl font-black mt-4">Selamat! Laporan Akhir Sudah Bisa Diisi.</h4>
                        <p className="text-indigo-100 text-sm mt-2 mb-6 max-w-md leading-relaxed">Seluruh logbook harian/mingguan kamu sudah disetujui dosen. Sekarang saatnya mengunggah laporan akhir magangmu.</p>
                        <button onClick={() => setShowLaporanModal(true)} disabled={pengajuan?.status === 'Selesai'} className="px-8 py-3 bg-white text-indigo-600 font-black rounded-xl hover:bg-indigo-50 transition-all shadow-lg flex items-center gap-2 hover:-translate-y-1">
                          Unggah Laporan Akhir Sekarang 🚀
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                      <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center text-lg shadow-sm border border-gray-100 dark:border-slate-600 shrink-0">🔒</div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1">Akses Laporan Akhir Terkunci</h4>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-relaxed">Tombol unggah akan otomatis terbuka jika <strong className="text-gray-700 dark:text-gray-300">SEMUA</strong> laporan logbook kamu sudah berstatus <span className="text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">Disetujui</span> tanpa ada revisi.</p>
                      </div>
                    </div>
                  )}

                  {/* DAFTAR KARTU LOGBOOK (Desain Kartu Premium) */}
                  <div className="grid grid-cols-1 gap-6 pt-2">
                    {logbookFiltered.length === 0 ? (
                      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl">
                        <p className="text-gray-400 dark:text-gray-500 font-bold">Belum ada logbook dengan status ini.</p>
                      </div>
                    ) : logbookFiltered.map((log) => (
                      <div key={log.id} className="bg-white dark:bg-slate-800 rounded-[28px] border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col md:flex-row group">
                        
                        {/* Kiri: Kolom Status & Nilai Angka */}
                        <div className="md:w-48 bg-slate-50/50 dark:bg-slate-800/80 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-700 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm border z-10 ${
                            log.status === 'Disetujui' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800' : 
                            log.status === 'Revisi' || log.status === 'Ditolak' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:border-red-800' : 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800'
                          }`}>
                            {log.status}
                          </span>
                          
                          <div className="z-10">
                            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">Nilai</p>
                            {log.nilai !== null ? (
                              <p className="text-6xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter drop-shadow-sm">{log.nilai}</p>
                            ) : (
                              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 italic mt-2">Belum Dinilai</p>
                            )}
                          </div>
                          
                          {/* Dekorasi Background Angka Samar */}
                          {log.nilai !== null && (
                            <div className="absolute -right-4 -bottom-4 text-9xl font-black text-slate-100 dark:text-slate-700/30 opacity-50 z-0 select-none pointer-events-none">
                              {log.nilai}
                            </div>
                          )}
                        </div>

                        {/* Kanan: Detail Konten & Pesan Dosen */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col">
                          <div className="flex justify-between items-start gap-4 mb-5">
                            <div>
                              <h4 className="text-xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">{log.judul}</h4>
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 rounded-lg text-xs font-bold text-gray-500 dark:text-gray-400">
                                <span>📅</span>
                                <span>{new Date(log.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              </div>
                            </div>
                            
                            {log.link_dokumen && (
                              <a href={log.link_dokumen} target="_blank" className="w-11 h-11 rounded-xl bg-gray-50 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-indigo-900/40 border border-gray-100 dark:border-slate-600 flex items-center justify-center transition-all shrink-0 hover:scale-105 shadow-sm" title="Buka Dokumen Laporan">
                                🔗
                              </a>
                            )}
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
                            {log.kegiatan}
                          </p>

                          {/* Chat Bubble: Pesan Dosen (Desain Jauh Lebih Bersih) */}
                          {log.catatan_dosen && (
                            <div className="mt-auto bg-indigo-50/70 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-2xl p-5 flex gap-4 items-start relative">
                              <div className="w-10 h-10 rounded-full bg-white dark:bg-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-300 shadow-sm border border-indigo-100 dark:border-indigo-700 shrink-0 text-lg">
                                👨‍🏫
                              </div>
                              <div className="pt-0.5">
                                <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Pesan & Revisi Dosen</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium italic leading-relaxed">"{log.catatan_dosen}"</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </AnimatePresence> {/* <--- SELIPKAN KEMBALI TAG INI DI SINI */}
              </div>
            </main>

      {/* MODAL INPUT LINK LOA */}
      <AnimatePresence>
        {showLOAModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLOAModal(false)}></div>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 md:hidden"></div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Input Link LOA</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs md:text-sm border-b dark:border-slate-700 pb-6">Pastikan nama perusahaan dan surat penerimaan asli ada di dalam link Google Drive Anda.</p>
              
              <form onSubmit={handleSubmitLOA} className="space-y-4 md:space-y-5">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Perusahaan *</label>
                  <input type="text" required value={loaForm.perusahaan} onChange={(e) => setLoaForm({...loaForm, perusahaan: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Posisi Magang *</label>
                  <input type="text" required value={loaForm.posisi} onChange={(e) => setLoaForm({...loaForm, posisi: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal Mulai Magang *</label>
                    <input type="date" required value={loaForm.tgl_mulai} onChange={(e) => setLoaForm({...loaForm, tgl_mulai: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal Selesai Magang *</label>
                    <input type="date" required value={loaForm.tgl_berakhir} onChange={(e) => setLoaForm({...loaForm, tgl_berakhir: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Dokumen LOA *</label>
                  <input type="url" required value={loaForm.link_loa} onChange={(e) => setLoaForm({...loaForm, link_loa: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                </div>
                <div className="flex gap-3 md:gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowLOAModal(false)} className="flex-1 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all text-sm md:text-base">{isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
          {/* --- Ini adalah bagian bawah kartu Detail Pengajuan --- */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
                  {pengajuan?.status === 'Selesai' ? (
                    <div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl mb-4 border border-emerald-100 dark:border-emerald-800">
                        <h4 className="text-emerald-800 dark:text-emerald-400 font-bold text-sm mb-1">🎉 Magang Telah Selesai!</h4>
                        <p className="text-emerald-600 dark:text-emerald-300 text-xs">Selamat, seluruh proses magang dan penilaian telah selesai. Anda dapat mencetak lembar pengesahan sekarang.</p>
                      </div>
                      {/* TOMBOL UNDUH PDF */}
                      <button 
                        onClick={generatePDF}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1">
                        <span className="text-xl">📄</span> Cetak Lembar Pengesahan (PDF)
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <p className="text-blue-600 dark:text-blue-300 text-xs text-center font-medium">
                        Fitur cetak dokumen pengesahan akan otomatis terbuka setelah Dosen memberikan nilai akhir.
                      </p>
                    </div>
                  )}
                </div>

      </AnimatePresence>

      {/* MODAL ISI LOGBOOK */}
      <AnimatePresence>
        {showLogbookModal && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogbookModal(false)}></div>
            <motion.div initial={{ y: '100%', opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-xl rounded-t-3xl md:rounded-3xl shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-slate-600 rounded-full mx-auto mb-6 md:hidden"></div>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Isi Logbook</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6 text-xs md:text-sm border-b dark:border-slate-700 pb-6">Laporkan progres dan rincian pekerjaan Anda secara berkala.</p>
              
              <form onSubmit={handleSubmitLogbook} className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tipe Logbook *</label>
                    <select required value={logbookForm.judul} onChange={(e) => setLogbookForm({...logbookForm, judul: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all appearance-none text-sm md:text-base">
                      <option value="Logbook Harian">Logbook Harian</option>
                      <option value="Logbook Mingguan">Logbook Mingguan</option>
                      <option value="Logbook Bulanan">Logbook Bulanan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Tanggal *</label>
                    <input type="date" required value={logbookForm.tanggal} onChange={(e) => setLogbookForm({...logbookForm, tanggal: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deskripsi Pekerjaan *</label>
                  <textarea required rows={4} value={logbookForm.kegiatan} onChange={(e) => setLogbookForm({...logbookForm, kegiatan: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" placeholder="Ceritakan apa saja yang Anda kerjakan..."></textarea>
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Bukti (Drive) *</label>
                  <input type="url" required value={logbookForm.link_bukti} onChange={(e) => setLogbookForm({...logbookForm, link_bukti: e.target.value})} className="w-full px-4 md:px-5 py-3 md:py-4 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all text-sm md:text-base" placeholder="Link dokumentasi kegiatan" />
                </div>
                
                <div className="flex gap-3 md:gap-4 pt-4 mt-2 border-t border-gray-100 dark:border-slate-700">
                  <button type="button" onClick={() => setShowLogbookModal(false)} className="flex-1 py-3 md:py-4 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm md:text-base">Batal</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 py-3 md:py-4 bg-[#1e3a8a] text-white font-bold rounded-xl hover:bg-blue-900 shadow-lg transition-all text-sm md:text-base">{isSubmitting ? 'Menyimpan...' : 'Kirim Logbook'}</button>
                </div>
              </form>
      {/* <--- Ini adalah penutup activeTab === 'Logbook' yang asli */}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
{/* MODAL LOGOUT POP-OUT */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white dark:bg-slate-800 w-full max-w-sm rounded-3xl shadow-2xl p-8 z-10 transition-colors text-center overflow-hidden">
              {/* Dekorasi Background */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-red-50 dark:from-red-900/20 to-transparent -z-10"></div>
              
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 shadow-inner border-4 border-white dark:border-slate-800 z-10 relative">
                🚪
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Yakin Ingin Keluar?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm font-medium leading-relaxed">
                Sesi kamu akan diakhiri. Kamu harus login kembali untuk mengakses portal mahasiswa.
              </p>
              
              <div className="flex gap-3">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  Batal
                </button>
                <button onClick={handleLogout} className="flex-1 py-3.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all">
                  Ya, Keluar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        `}</style>
    </div>
  );
}