"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import ProgressStepper from '@/components/ui/ProgressStepper';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  batalPengajuan,
  createPengajuan,
  getPengajuanList,
} from '@/lib/pengajuan-client';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type PengajuanForm = {
  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  angkatan: string;
  semester: string;
  kelas: string;

  jenis_magang: string;
  no_hp_mahasiswa: string;
};

const DRAFT_KEY = 'draft_pengajuan_magang';

const initialForm: PengajuanForm = {
  nama_mahasiswa: '',
  npm: '',
  program_studi: '',
  angkatan: '',
  semester: '',
  kelas: '',

  jenis_magang: 'Konversi 20 SKS',
  no_hp_mahasiswa: '',
};

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function getBuktiPenerimaanLink(item: { bukti_penerimaan?: string | null; link_loa?: string | null }) {
  return item.bukti_penerimaan || item.link_loa || '';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }
  if (status === 'Menunggu_Verifikasi' || status === 'Menunggu') {
    return 'app-badge app-badge-yellow';
  }
  if (status === 'Ditolak') {
    return 'app-badge app-badge-red';
  }
  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan Staff';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Disetujui') return 'Disetujui';
  if (status === 'Menunggu') return 'Menunggu';
  return 'Belum Ada';
}

function getMagangSteps(status?: string | null) {
  const currentStatus = status || 'Belum_Ada';
  const order = ['Belum_Ada', 'Menunggu_Verifikasi', 'Aktif', 'Selesai'];
  const currentIndex = order.indexOf(currentStatus);

  const getStatus = (stepStatus: string) => {
    if (currentStatus === 'Ditolak' && stepStatus === 'Menunggu_Verifikasi') {
      return 'rejected' as const;
    }
    const stepIndex = order.indexOf(stepStatus);
    if (currentStatus === 'Ditolak') {
      return stepIndex < 1 ? ('done' as const) : ('pending' as const);
    }
    if (stepIndex < currentIndex) return 'done' as const;
    if (stepIndex === currentIndex) return 'active' as const;
    return 'pending' as const;
  };

  return [
    {
      title: 'Pendataan Magang',
      description: 'Mahasiswa mengisi data magang, bukti penerimaan, dan rencana kegiatan.',
      status: getStatus('Belum_Ada'),
    },
    {
      title: 'Pemeriksaan Staff',
      description: 'Staff memeriksa data magang dan menentukan dosen pembimbing.',
      status: getStatus('Menunggu_Verifikasi'),
    },
    {
      title: 'Magang Aktif',
      description: 'Mahasiswa melaksanakan magang dan dapat mengunggah dokumen magang sesuai jenis magang.',
      status: getStatus('Aktif'),
    },
    {
      title: 'Selesai',
      description: 'Dosen memberi evaluasi dan nilai akhir magang.',
      status: getStatus('Selesai'),
    },
  ];
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words font-black text-slate-950 dark:text-white">{value || '-'}</p>
    </div>
  );
}

const documentTemplates = [
  {
    title: 'Pengajuan Surat Magang',
    description: 'Form pengajuan surat pengantar, permohonan, atau rekomendasi magang.',
    href: 'https://digiletter.marooners.my.id/login',
    note: '',
  },
  {
    title: 'Pengajuan Mitra Magang',
    description: 'Form untuk pengajuan perusahaan/instansi sebagai mitra magang.',
    href: '/dashboard/pengajuan-mitra',
    note: '',
  },
  {
    title: 'Pendataan Magang (Permohonan Dosen Pembimbing)',
    description: 'Form pendataan mahasiswa magang sekaligus permohonan dosen pembimbing.',
    href: '/dashboard/pengajuan-magang',
    note: '',
  },
  {
    title: 'Lembar Aktivitas Magang',
    description: 'Template pencatatan aktivitas atau kegiatan mahasiswa selama magang.',
    href: 'https://docs.google.com/document/d/1O7oAuNjv3WmTqwW9zL563ep4om2b1WIa/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Lembar Bimbingan Magang',
    description: 'Template pencatatan kegiatan bimbingan antara mahasiswa dan dosen pembimbing.',
    href: 'https://docs.google.com/document/d/19swBB4iH2nRmBL4Mnu8lQbIVEp04hW5R/edit',
    note: '',
  },
  {
    title: 'Surat Tugas Dosen Pendamping Magang (DPM)',
    description: 'Template surat tugas untuk dosen pendamping magang.',
    href: 'https://drive.google.com/drive/folders/1TT5U86q_bJjJNZI42WPA3mvfmgEDlRmV?usp=drive_link',
    note: '',
  },
  {
    title: 'Implementation of Arrangement (IA)',
    description: 'Dokumen kerja sama teknis antara pihak kampus/fakultas dengan mitra.',
    href: 'https://docs.google.com/document/d/10EoaENFJmvfMyHPXa9lHsYXHTsppSFSY/edit',
    note: '',
  },
  {
    title: 'Surat Perpanjangan Waktu Magang',
    description: 'Template surat permohonan perpanjangan waktu pelaksanaan magang.',
    href: 'https://docs.google.com/document/d/1qbRwc7ZYHg8mcip26QBS5Gmrq-XUHlez/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Surat Keterangan Selesai Magang',
    description: 'Template surat keterangan bahwa mahasiswa telah menyelesaikan magang.',
    href: 'https://docs.google.com/document/d/1Ypx5-qwjdVnPbKpPLMrmmeS3ovlrXNhS/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Pelaporan Magang',
    description: 'Template atau panduan pelaporan hasil pelaksanaan magang.',
    href: 'MASUKKAN_LINK_DIRECT_DI_SINI',
    note: '',
  },
  {
    title: 'Lembar Penilaian Mitra',
    description: 'Template penilaian mahasiswa dari pihak mitra atau pembimbing lapangan.',
    href: 'https://docs.google.com/document/d/1BXMz5Zp0SHj-40_6D1hOb9V6X7AwxP0I/edit',
    note: '',
  },
  {
    title: 'Lembar Penilaian Dosen Pembimbing Magang',
    description: 'Template penilaian mahasiswa dari dosen pembimbing magang.',
    href: 'https://docs.google.com/document/d/1N1_gGM6nWVM_b38nfk6U2kJaFyMou30L/edit?rtpof=true&sd=true&tab=t.0',
    note: '',
  },
  {
    title: 'Laporan Pelaksanaan Kerja Sama',
    description: 'Dokumen laporan pelaksanaan kerja sama magang dengan mitra.',
    href: 'https://docs.google.com/document/d/1q1HHClXevRnHGVfRbqNYdAVBy-aDFK-H/edit',
    note: '',
  },
];

export default function PengajuanMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [form, setForm] = useState<PengajuanForm>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 10),
      ]);

      if (currentUser.role !== 'Mahasiswa') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      const userData = currentUser as CurrentUser & {
        nim_nidn?: string | null;
        prodi?: string | null;
        angkatan?: string | null;
        semester?: string | null;
        kelas?: string | null;
        phone?: string | null;
      };

      const currentPengajuan = pengajuanData.items?.[0] || null;

      setUser(currentUser);
      setPengajuan(currentPengajuan);

      setForm((prev) => ({
        ...prev,
        nama_mahasiswa: userData.name || prev.nama_mahasiswa || '',
        npm: userData.nim_nidn || prev.npm || '',
        program_studi: userData.prodi || prev.program_studi || '',
        angkatan: userData.angkatan || prev.angkatan || '',
        semester: userData.semester || prev.semester || '',
        kelas: userData.kelas || prev.kelas || '',
        no_hp_mahasiswa: userData.phone || prev.no_hp_mahasiswa || '',
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal mengambil data pengajuan.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft && !pengajuan) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as PengajuanForm;
        setForm((prev) => ({
          ...prev,
          ...parsedDraft,
          nama_mahasiswa: prev.nama_mahasiswa || parsedDraft.nama_mahasiswa,
          npm: prev.npm || parsedDraft.npm,
          program_studi: prev.program_studi || parsedDraft.program_studi,
          angkatan: prev.angkatan || parsedDraft.angkatan,
          semester: prev.semester || parsedDraft.semester,
          kelas: prev.kelas || parsedDraft.kelas,
          no_hp_mahasiswa: prev.no_hp_mahasiswa || parsedDraft.no_hp_mahasiswa,
        }));
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [pengajuan]);

  useEffect(() => {
    if (!pengajuan) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, pengajuan]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (
      !form.nama_mahasiswa.trim() ||
      !form.npm.trim() ||
      !form.program_studi.trim() ||
      !form.semester.trim() ||
      !form.no_hp_mahasiswa.trim()
    ) {
      return 'Data mahasiswa belum lengkap.';
    }
    if (!/^62\d{8,15}$/.test(form.no_hp_mahasiswa)) {
      return 'Nomor HP mahasiswa harus diawali 62. Contoh: 6285456123.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrorMsg('');

    const validation = validateForm();
    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      // Kirim data seminimal mungkin, field lain dikosongkan atau diisi default
      const result = await createPengajuan({
        nama_mahasiswa: form.nama_mahasiswa.trim(),
        npm: form.npm.trim(),
        program_studi: form.program_studi.trim(),
        angkatan: form.angkatan.trim() || null,
        kelas: form.kelas.trim() || null,
        jenis_magang: form.jenis_magang,
        no_hp_mahasiswa: form.no_hp_mahasiswa.trim(),
        // Field wajib lainnya dikosongkan / default agar backend tetap menerima
        foto_diri: null,
        bukti_penerimaan: '',
        perusahaan: '',
        posisi: 'Peserta Magang',
        link_loa: '',
        alamat_tempat_magang: '',
        nama_penanggung_jawab: '',
        kontak_penanggung_jawab: form.no_hp_mahasiswa.trim(),
        latitude: null,
        longitude: null,
        tgl_mulai: '',
        tgl_berakhir: '',
        rencana_magang: '',
      });

      setMessage(result.message || 'Pengajuan magang berhasil dikirim.');
      localStorage.removeItem(DRAFT_KEY);
      await fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal mengirim pengajuan magang.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatalPengajuan = async () => {
    setMessage('');
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await batalPengajuan();
      setMessage(result.message || 'Pengajuan magang berhasil dibatalkan.');
      await fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal membatalkan pengajuan magang.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetDraft = () => {
    setForm((prev) => ({
      ...initialForm,
      nama_mahasiswa: prev.nama_mahasiswa,
      npm: prev.npm,
      program_studi: prev.program_studi,
      angkatan: prev.angkatan,
      semester: prev.semester,
      kelas: prev.kelas,
      no_hp_mahasiswa: prev.no_hp_mahasiswa,
    }));
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleExportPDF = () => {
    if (!pengajuan) return;
    const doc = new jsPDF('p', 'pt', 'a4');

    doc.setFontSize(18);
    doc.text('Transkrip Nilai Magang', 40, 40);

    doc.setFontSize(12);
    doc.text(`Nama Mahasiswa: ${pengajuan.nama_mahasiswa}`, 40, 70);
    doc.text(`NPM: ${pengajuan.npm || '-'}`, 40, 90);
    doc.text(`Program Studi: ${pengajuan.program_studi || '-'}`, 40, 110);
    doc.text(`Perusahaan: ${pengajuan.perusahaan || '-'}`, 40, 130);

    autoTable(doc, {
      startY: 150,
      head: [['Komponen Penilaian', 'Nilai (0-100)']],
      body: [
        ['Nilai dari Mitra / Pembimbing Lapangan', pengajuan.nilai_mitra_total || '0'],
        ['Nilai dari Dosen Pembimbing', pengajuan.nilai_dosen_total || '0'],
        ['Nilai dari Dosen Penguji', pengajuan.nilai_penguji_total || '0'],
        ['Total Nilai Akhir', pengajuan.nilai_akhir_angka || '0'],
        ['Grade', pengajuan.nilai_akhir_grade || '-'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [30, 58, 138] },
    });

    doc.save(`Transkrip_Nilai_${pengajuan.npm || 'Magang'}.pdf`);
  };

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Mahasiswa">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Mahasiswa"
            title="Dashboard"
            description="Ringkasan aktivitas dan informasi magang Anda."
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Dokumen Magang
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Template Dokumen Magang</h2>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Unduh template dokumen yang dibutuhkan untuk pengajuan, pendataan, pelaksanaan, bimbingan, penilaian, dan pelaporan magang.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documentTemplates.map((item) => {
                const isManualProcess = item.href === '#';
                if (isManualProcess) {
                  return (
                    <div key={item.title} className="app-panel p-5 opacity-90">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        !
                      </div>
                      <h3 className="mt-4 text-lg font-black leading-snug text-slate-950 dark:text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                      <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200">
                        {item.note}
                      </p>
                    </div>
                  );
                }
                return (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-panel app-card-hover p-5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                      ↓
                    </div>
                    <h3 className="mt-4 text-lg font-black leading-snug text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
                    <span className="mt-4 inline-flex text-sm font-black text-[#1e3a8a] dark:text-blue-300">Buka Dokumen →</span>
                  </a>
                );
              })}
            </div>
          </section>

          <section className="mb-8">
            <ProgressStepper steps={getMagangSteps(pengajuan?.status)} />
          </section>

          {pengajuan ? (
            <section className="space-y-6">
              <div className="app-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-950 dark:text-white">{pengajuan.perusahaan || 'Pengajuan Magang'}</h2>
                      <span className={getStatusBadgeClass(pengajuan.status)}>{getStatusLabel(pengajuan.status)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {pengajuan.posisi || 'Peserta Magang'} • {getJenisMagangLabel(pengajuan.jenis_magang)}
                    </p>
                  </div>
                  {(pengajuan.status === 'Menunggu_Verifikasi' || pengajuan.status === 'Ditolak') && (
                    <button
                      type="button"
                      onClick={handleBatalPengajuan}
                      disabled={isSubmitting}
                      className="app-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Memproses...' : pengajuan.status === 'Ditolak' ? 'Ajukan Ulang / Hapus Data' : 'Batalkan Pengajuan'}
                    </button>
                  )}
                </div>

                {pengajuan.status === 'Ditolak' && pengajuan.alasan_penolakan && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-400/30 dark:bg-red-400/10">
                    <p className="text-sm font-black text-red-700 dark:text-red-300">Alasan Penolakan</p>
                    <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">{pengajuan.alasan_penolakan}</p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem label="Nama Mahasiswa" value={pengajuan.nama_mahasiswa} />
                  <DetailItem label="NPM" value={pengajuan.npm} />
                  <DetailItem label="Program Studi" value={pengajuan.program_studi} />
                  <DetailItem label="Jenis Magang" value={getJenisMagangLabel(pengajuan.jenis_magang)} />
                  <DetailItem label="Dosen Pembimbing" value={pengajuan.nama_dosen} />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {getBuktiPenerimaanLink(pengajuan) && (
                    <a href={getBuktiPenerimaanLink(pengajuan)} target="_blank" rel="noopener noreferrer" className="app-btn-secondary">
                      Buka Bukti Penerimaan
                    </a>
                  )}
                  {pengajuan.foto_diri && (
                    <a href={pengajuan.foto_diri} target="_blank" rel="noopener noreferrer" className="app-btn-secondary">
                      Buka Foto Diri
                    </a>
                  )}
                  {pengajuan.status === 'Aktif' && pengajuan.jenis_magang !== 'Tidak Konversi' && (
                    <Link href="/laporan-akhir" className="app-btn-primary">
                      {pengajuan.jenis_magang === 'Konversi 2 SKS' ? 'Upload Laporan Magang' : 'Upload Laporan Akhir'}
                    </Link>
                  )}
                </div>

                {pengajuan.status === 'Selesai' && (
                  <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-5">
                      <div>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white">Nilai Akhir Magang</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Rincian nilai dari mitra, pembimbing, dan penguji.</p>
                      </div>
                      <button type="button" onClick={handleExportPDF} className="app-btn-primary">
                        Download Transkrip (PDF)
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                      <div className="app-panel p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Mitra</p>
                        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{pengajuan.nilai_mitra_total || '-'}</p>
                      </div>
                      <div className="app-panel p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Dospem</p>
                        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{pengajuan.nilai_dosen_total || '-'}</p>
                      </div>
                      <div className="app-panel p-4 text-center">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nilai Penguji</p>
                        <p className="mt-2 text-2xl font-black text-slate-950 dark:text-white">{pengajuan.nilai_penguji_total || '-'}</p>
                      </div>
                      <div className="app-panel p-4 text-center bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] dark:text-blue-300">Total & Grade</p>
                        <p className="mt-2 text-2xl font-black text-[#1e3a8a] dark:text-blue-200">
                          {pengajuan.nilai_akhir_angka || '-'} ({pengajuan.nilai_akhir_grade || '-'})
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <div className="app-card flex flex-col items-center justify-center p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-3xl dark:bg-blue-900/20">
                📄
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">Anda belum melakukan pengajuan</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Silakan lakukan pengajuan magang melalui halaman Pengajuan Magang.
              </p>
              <Link href="/pengajuan" className="mt-6 app-btn-primary">
                Ke Halaman Pengajuan
              </Link>
            </div>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}