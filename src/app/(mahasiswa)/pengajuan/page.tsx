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
import { Mitra, getMitraList } from '@/lib/mitra-client';

type PengajuanForm = {
  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  angkatan: string;
  semester: string;
  kelas: string;

  jenis_magang: string;
  no_hp_mahasiswa: string;
  foto_diri: string;        // akan diisi URL hasil upload
  bukti_penerimaan: string; // akan diisi URL hasil upload

  // Data tempat magang (tidak diinput manual, hanya dari mitra)
  perusahaan: string;
  posisi: string;
  alamat_tempat_magang: string;
  nama_penanggung_jawab: string;
  kontak_penanggung_jawab: string;
  latitude: string;
  longitude: string;

  tgl_mulai: string;
  tgl_berakhir: string;
  rencana_magang: string;
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
  foto_diri: '',
  bukti_penerimaan: '',

  perusahaan: '',
  posisi: '',
  alamat_tempat_magang: '',
  nama_penanggung_jawab: '',
  kontak_penanggung_jawab: '',
  latitude: '',
  longitude: '',

  tgl_mulai: '',
  tgl_berakhir: '',
  rencana_magang: '',
};

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function isSistemInformasi(prodi?: string | null) {
  return String(prodi || '').toLowerCase().includes('sistem informasi');
}

function getBuktiPenerimaanLink(item: {
  bukti_penerimaan?: string | null;
  link_loa?: string | null;
}) {
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

// Fungsi upload file ke server (sesuaikan endpoint)
async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Gagal upload file');
  const data = await res.json();
  return data.url; // asumsikan response { url: string }
}

export default function PengajuanMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [form, setForm] = useState<PengajuanForm>(initialForm);
  const [selectedMitraId, setSelectedMitraId] = useState('');
  const [isMitraTerdaftar, setIsMitraTerdaftar] = useState('ya');

  // State untuk menyimpan file sebelum upload
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userIsSistemInformasi = isSistemInformasi(form.program_studi || user?.prodi);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const currentUser = await getCurrentUserClient();
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
      setUser(currentUser);
      setForm((prev) => ({
        ...prev,
        nama_mahasiswa: userData.name || '',
        npm: userData.nim_nidn || '',
        program_studi: userData.prodi || '',
        angkatan: userData.angkatan || '',
        semester: userData.semester || '',
        kelas: userData.kelas || '',
        no_hp_mahasiswa: userData.phone || '',
      }));
      const [pengajuanData, mitraData] = await Promise.all([
        getPengajuanList(1, 10),
        getMitraList(),
      ]);
      const currentPengajuan = pengajuanData.items?.[0] || null;
      setPengajuan(currentPengajuan);
      setMitraList(mitraData || []);
      setIsDataLoaded(true);
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

  // Load draft
  useEffect(() => {
    if (!isDataLoaded || pengajuan) return;
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft) as Partial<PengajuanForm>;
        setForm((prev) => ({
          ...prev,
          ...parsedDraft,
          nama_mahasiswa: prev.nama_mahasiswa,
          npm: prev.npm,
          program_studi: prev.program_studi,
          angkatan: prev.angkatan,
          semester: prev.semester,
          kelas: prev.kelas,
          no_hp_mahasiswa: prev.no_hp_mahasiswa,
        }));
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, [isDataLoaded, pengajuan]);

  // Simpan draft
  useEffect(() => {
    if (!pengajuan && isDataLoaded && form.nama_mahasiswa) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
    }
  }, [form, pengajuan, isDataLoaded]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJenisMagangChange = (value: string) => {
    if (value === 'Konversi 2 SKS' && !userIsSistemInformasi) {
      setErrorMsg('Magang 2 SKS Khusus SI hanya tersedia untuk mahasiswa Sistem Informasi.');
      return;
    }
    setErrorMsg('');
    setSelectedMitraId('');
    setIsMitraTerdaftar(value === 'Tidak Konversi' ? 'tidak' : 'ya');
    setForm((prev) => ({
      ...prev,
      jenis_magang: value,
      perusahaan: value === 'Tidak Konversi' ? prev.perusahaan : '',
      alamat_tempat_magang: value === 'Tidak Konversi' ? prev.alamat_tempat_magang : '',
      nama_penanggung_jawab: value === 'Tidak Konversi' ? prev.nama_penanggung_jawab : '',
      kontak_penanggung_jawab: value === 'Tidak Konversi' ? prev.kontak_penanggung_jawab : '',
    }));
  };

  const handleMitraChange = (value: string) => {
    setSelectedMitraId(value);
    const selected = mitraList.find((mitra) => String(mitra.id) === value);
    if (!selected) {
      setForm((prev) => ({
        ...prev,
        perusahaan: '',
        alamat_tempat_magang: '',
        kontak_penanggung_jawab: '',
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      perusahaan: selected.nama_mitra,
      alamat_tempat_magang: selected.alamat_kantor_mitra || prev.alamat_tempat_magang,
      kontak_penanggung_jawab: selected.kontak_narahubung_mitra || prev.kontak_penanggung_jawab,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'bukti' | 'foto') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMsg('Hanya file PDF yang diperbolehkan.');
      return;
    }
    if (type === 'bukti') setBuktiFile(file);
    else setFotoFile(file);
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
    if (form.kontak_penanggung_jawab && !/^62\d{8,15}$/.test(form.kontak_penanggung_jawab)) {
      return 'Kontak penanggung jawab harus diawali 62. Contoh: 6285456123.';
    }
    if (form.jenis_magang === 'Konversi 2 SKS' && !isSistemInformasi(form.program_studi)) {
      return 'Magang 2 SKS Khusus SI hanya tersedia untuk mahasiswa Sistem Informasi.';
    }
    if (form.jenis_magang !== 'Tidak Konversi' && isMitraTerdaftar === 'tidak') {
      return 'Untuk magang konversi, ajukan mitra terlebih dahulu sebelum mengirim pengajuan magang.';
    }
    if (form.jenis_magang !== 'Tidak Konversi' && isMitraTerdaftar === 'ya' && !selectedMitraId) {
      return 'Pilih mitra terdaftar terlebih dahulu.';
    }
    // Data tempat magang akan diambil dari mitra yang dipilih, tidak perlu validasi manual
    if (!form.tgl_mulai.trim() || !form.tgl_berakhir.trim() || !form.rencana_magang.trim()) {
      return 'Periode dan rencana magang wajib diisi.';
    }
   if (!buktiFile && !form.bukti_penerimaan && !pengajuan?.bukti_penerimaan) {
  return 'File bukti penerimaan magang wajib diupload.';
}
    if (form.tgl_mulai && form.tgl_berakhir) {
      const start = new Date(form.tgl_mulai);
      const end = new Date(form.tgl_berakhir);
      if (end < start) {
        return 'Tanggal berakhir magang tidak boleh lebih awal dari tanggal mulai.';
      }
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
    setUploading(true);

    try {
      let buktiUrl = form.bukti_penerimaan;
      let fotoUrl = form.foto_diri;

      // Upload file bukti penerimaan jika ada
      if (buktiFile) {
        buktiUrl = await uploadFile(buktiFile);
      }
      // Upload file foto diri jika ada
      if (fotoFile) {
        fotoUrl = await uploadFile(fotoFile);
      }

      const result = await createPengajuan({
        nama_mahasiswa: form.nama_mahasiswa.trim(),
        npm: form.npm.trim(),
        program_studi: form.program_studi.trim(),
        angkatan: form.angkatan.trim() || null,
        kelas: form.kelas.trim() || null,
        jenis_magang: form.jenis_magang,
        no_hp_mahasiswa: form.no_hp_mahasiswa.trim(),
        foto_diri: fotoUrl || null,
        bukti_penerimaan: buktiUrl,
        perusahaan: form.perusahaan.trim(),
        posisi: form.posisi.trim() || 'Peserta Magang',
        link_loa: buktiUrl,
        alamat_tempat_magang: form.alamat_tempat_magang.trim(),
        nama_penanggung_jawab: form.nama_penanggung_jawab.trim() || 'Belum diisi',
        kontak_penanggung_jawab: form.kontak_penanggung_jawab.trim() || form.no_hp_mahasiswa.trim(),
        latitude: form.latitude.trim() || null,
        longitude: form.longitude.trim() || null,
        tgl_mulai: form.tgl_mulai,
        tgl_berakhir: form.tgl_berakhir,
        rencana_magang: form.rencana_magang.trim(),
      });

      setMessage(result.message || 'Pengajuan magang berhasil dikirim.');
      localStorage.removeItem(DRAFT_KEY);
      await fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal mengirim pengajuan magang.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
      setUploading(false);
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
    setSelectedMitraId('');
    setIsMitraTerdaftar('ya');
    setBuktiFile(null);
    setFotoFile(null);
    localStorage.removeItem(DRAFT_KEY);
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
            eyebrow="Pendataan Magang"
            title="Pengajuan Magang"
            description="Isi data magang, bukti penerimaan (PDF), periode, dan rencana kegiatan."
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mb-8">
            <ProgressStepper steps={getMagangSteps(pengajuan?.status)} />
          </section>

          {pengajuan ? (
            <section className="space-y-6">
              <div className="app-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                        {pengajuan.perusahaan}
                      </h2>
                      <span className={getStatusBadgeClass(pengajuan.status)}>
                        {getStatusLabel(pengajuan.status)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {pengajuan.posisi || 'Peserta Magang'} • {getJenisMagangLabel(pengajuan.jenis_magang)}
                    </p>
                  </div>
                  {pengajuan.status === 'Menunggu_Verifikasi' && (
                    <button
                      type="button"
                      onClick={handleBatalPengajuan}
                      disabled={isSubmitting}
                      className="app-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Memproses...' : 'Batalkan Pengajuan'}
                    </button>
                  )}
                </div>

                {pengajuan.status === 'Ditolak' && pengajuan.alasan_penolakan && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-400/30 dark:bg-red-400/10">
                    <p className="text-sm font-black text-red-700 dark:text-red-300">Alasan Penolakan</p>
                    <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
                      {pengajuan.alasan_penolakan}
                    </p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem label="Nama Mahasiswa" value={pengajuan.nama_mahasiswa} />
                  <DetailItem label="NPM" value={pengajuan.npm} />
                  <DetailItem label="Program Studi" value={pengajuan.program_studi} />
                  <DetailItem label="Jenis Magang" value={getJenisMagangLabel(pengajuan.jenis_magang)} />
                  <DetailItem label="Perusahaan" value={pengajuan.perusahaan} />
                  <DetailItem label="Posisi" value={pengajuan.posisi} />
                  <DetailItem label="Tanggal Mulai" value={pengajuan.tgl_mulai} />
                  <DetailItem label="Tanggal Berakhir" value={pengajuan.tgl_berakhir} />
                  <DetailItem label="Dosen Pembimbing" value={pengajuan.nama_dosen} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Alamat Tempat Magang</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pengajuan.alamat_tempat_magang || '-'}
                    </p>
                  </div>
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Rencana Magang</p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pengajuan.rencana_magang || '-'}
                    </p>
                  </div>
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
              </div>
            </section>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Data Mahasiswa */}
              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Data Mahasiswa</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data mahasiswa diambil dari akun. Lengkapi bagian yang masih kosong.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mahasiswa</label>
                    <input type="text" name="nama_mahasiswa" value={form.nama_mahasiswa} onChange={handleChange} className="app-input" placeholder="Nama lengkap" readOnly={!!user?.name} />
                  </div>
                  <div>
                    <label className="app-label">NPM</label>
                    <input type="text" name="npm" value={form.npm} onChange={handleChange} className="app-input" placeholder="NPM" readOnly={!!user?.nim_nidn} />
                  </div>
                  <div>
                    <label className="app-label">Program Studi</label>
                    <input type="text" name="program_studi" value={form.program_studi} onChange={handleChange} className="app-input" placeholder="Informatika / Sistem Informasi" readOnly={!!user?.prodi} />
                  </div>
                  <div>
                    <label className="app-label">Angkatan</label>
                    <input type="text" name="angkatan" value={form.angkatan} onChange={handleChange} className="app-input" placeholder="2022" />
                  </div>
                  <div>
                    <label className="app-label">Semester</label>
                    <input type="text" name="semester" value={form.semester} onChange={handleChange} className="app-input" placeholder="7" />
                  </div>
                  <div>
                    <label className="app-label">Kelas</label>
                    <input type="text" name="kelas" value={form.kelas} onChange={handleChange} className="app-input" placeholder="7C" />
                  </div>
                  <div>
                    <label className="app-label">Nomor HP Mahasiswa</label>
                    <input type="text" name="no_hp_mahasiswa" value={form.no_hp_mahasiswa} onChange={(e) => setForm((prev) => ({ ...prev, no_hp_mahasiswa: e.target.value.replace(/[^0-9]/g, '') }))} className="app-input" placeholder="628xxxxxxxxxx" />
                  </div>
                </div>
              </section>

              {/* Jenis Magang dan Mitra */}
              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Jenis Magang dan Mitra</h2>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Jenis Magang</label>
                    <select name="jenis_magang" value={form.jenis_magang} onChange={(e) => handleJenisMagangChange(e.target.value)} className="app-input">
                      <option value="Konversi 20 SKS">Konversi Maksimal 20 SKS</option>
                      <option value="Tidak Konversi">Tidak Konversi</option>
                      {userIsSistemInformasi && <option value="Konversi 2 SKS">Magang 2 SKS Khusus SI</option>}
                    </select>
                  </div>
                  {form.jenis_magang !== 'Tidak Konversi' && (
                    <div>
                      <label className="app-label">Status Mitra Perusahaan</label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button type="button" onClick={() => setIsMitraTerdaftar('ya')} className={isMitraTerdaftar === 'ya' ? 'app-btn-primary' : 'app-btn-secondary'}>
                          Sudah Terdaftar
                        </button>
                        <button type="button" onClick={() => { setIsMitraTerdaftar('tidak'); setSelectedMitraId(''); setForm((prev) => ({ ...prev, perusahaan: '', alamat_tempat_magang: '', kontak_penanggung_jawab: '' })); }} className={isMitraTerdaftar === 'tidak' ? 'app-btn-primary' : 'app-btn-secondary'}>
                          Belum Terdaftar
                        </button>
                      </div>
                    </div>
                  )}
                  {form.jenis_magang !== 'Tidak Konversi' && isMitraTerdaftar === 'ya' && (
                    <div className="md:col-span-2">
                      <label className="app-label">Pilih Mitra</label>
                      <select value={selectedMitraId} onChange={(e) => handleMitraChange(e.target.value)} className="app-input">
                        <option value="">Pilih mitra terdaftar</option>
                        {mitraList.map((mitra) => (
                          <option key={mitra.id} value={mitra.id}>{mitra.nama_mitra}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {form.jenis_magang !== 'Tidak Konversi' && isMitraTerdaftar === 'tidak' && (
                    <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                      Untuk magang konversi, perusahaan perlu diajukan sebagai mitra terlebih dahulu.
                      <Link href="/ajukan-mitra" className="ml-1 font-black underline">Ajukan mitra di sini.</Link>
                    </div>
                  )}
                </div>
              </section>

              {/* Periode dan Dokumen (dengan upload PDF) */}
              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Periode dan Dokumen</h2>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Tanggal Mulai</label>
                    <input type="date" name="tgl_mulai" value={form.tgl_mulai} onChange={handleChange} className="app-input" />
                  </div>
                  <div>
                    <label className="app-label">Tanggal Berakhir</label>
                    <input type="date" name="tgl_berakhir" value={form.tgl_berakhir} onChange={handleChange} className="app-input" />
                  </div>
                  <div>
                    <label className="app-label">Upload Bukti Penerimaan Magang (PDF)</label>
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'bukti')} className="app-input" />
                    {buktiFile && <p className="mt-1 text-xs text-green-600">File siap: {buktiFile.name}</p>}
                  </div>
                  <div>
                    <label className="app-label">Upload Foto Diri (PDF)</label>
                    <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, 'foto')} className="app-input" />
                    {fotoFile && <p className="mt-1 text-xs text-green-600">File siap: {fotoFile.name}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="app-label">Rencana Magang</label>
                    <textarea name="rencana_magang" value={form.rencana_magang} onChange={handleChange} className="app-input min-h-32" placeholder="Tuliskan rencana kegiatan selama magang" />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={isSubmitting || uploading} className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting || uploading ? 'Memproses...' : 'Kirim Pengajuan Magang'}
                </button>
                <button type="button" onClick={resetDraft} disabled={isSubmitting} className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
                  Reset Form
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}