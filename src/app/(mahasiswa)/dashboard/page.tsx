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
  foto_diri: string;
  bukti_penerimaan: string;

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
      description:
        'Mahasiswa mengisi data magang, bukti penerimaan, dan rencana kegiatan.',
      status: getStatus('Belum_Ada'),
    },
    {
      title: 'Pemeriksaan Staff',
      description:
        'Staff memeriksa data magang dan menentukan dosen pembimbing.',
      status: getStatus('Menunggu_Verifikasi'),
    },
    {
      title: 'Magang Aktif',
      description:
        'Mahasiswa melaksanakan magang dan dapat mengunggah dokumen magang sesuai jenis magang.',
      status: getStatus('Aktif'),
    },
    {
      title: 'Selesai',
      description: 'Dosen memberi evaluasi dan nilai akhir magang.',
      status: getStatus('Selesai'),
    },
  ];
}

function isValidUrl(value: string) {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-black text-slate-950 dark:text-white">
        {value || '-'}
      </p>
    </div>
  );
}
const documentTemplates = [
  {
    title: 'Pengajuan Surat Magang',
    description:
      'Form pengajuan surat pengantar, permohonan, atau rekomendasi magang.',
    href: 'https://digiletter.marooners.my.id/login',
    note: '',
  },
  {
    title: 'Pengajuan Mitra Magang',
    description:
      'Form untuk pengajuan perusahaan/instansi sebagai mitra magang.',
    href: '/dashboard/pengajuan-mitra',
    note: '',
  },
  {
    title: 'Pendataan Magang (Permohonan Dosen Pembimbing)',
    description:
      'Form pendataan mahasiswa magang sekaligus permohonan dosen pembimbing.',
    href: '/dashboard/pengajuan-magang',
    note: '',
  },
  {
    title: 'Lembar Aktivitas Magang',
    description:
      'Template pencatatan aktivitas atau kegiatan mahasiswa selama magang.',
    href: 'https://docs.google.com/document/d/1O7oAuNjv3WmTqwW9zL563ep4om2b1WIa/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Lembar Bimbingan Magang',
    description:
      'Template pencatatan kegiatan bimbingan antara mahasiswa dan dosen pembimbing.',
    href: 'https://docs.google.com/document/d/19swBB4iH2nRmBL4Mnu8lQbIVEp04hW5R/edit',
    note: '',
  },
  {
    title: 'Surat Tugas Dosen Pendamping Magang (DPM)',
    description:
      'Template surat tugas untuk dosen pendamping magang.',
    href: 'https://drive.google.com/drive/folders/1TT5U86q_bJjJNZI42WPA3mvfmgEDlRmV?usp=drive_link',
    note: '',
  },
  {
    title: 'Implementation of Arrangement (IA)',
    description:
      'Dokumen kerja sama teknis antara pihak kampus/fakultas dengan mitra.',
    href: '#',
    note: 'Hubungi TU Fasilkom/Fasilkom Official untuk proses pembuatannya.',
  },
  {
    title: 'Surat Perpanjangan Waktu Magang',
    description:
      'Template surat permohonan perpanjangan waktu pelaksanaan magang.',
    href: 'https://docs.google.com/document/d/1qbRwc7ZYHg8mcip26QBS5Gmrq-XUHlez/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Surat Keterangan Selesai Magang',
    description:
      'Template surat keterangan bahwa mahasiswa telah menyelesaikan magang.',
    href: 'https://docs.google.com/document/d/1Ypx5-qwjdVnPbKpPLMrmmeS3ovlrXNhS/edit?rtpof=true&sd=true',
    note: '',
  },
  {
    title: 'Pelaporan Magang',
    description:
      'Template atau panduan pelaporan hasil pelaksanaan magang.',
    href: 'MASUKKAN_LINK_DIRECT_DI_SINI',
    note: '',
  },
  {
    title: 'Lembar Penilaian Mitra',
    description:
      'Template penilaian mahasiswa dari pihak mitra atau pembimbing lapangan.',
    href: 'https://docs.google.com/document/d/1BXMz5Zp0SHj-40_6D1hOb9V6X7AwxP0I/edit',
    note: '',
  },
  {
    title: 'Lembar Penilaian Dosen Pembimbing Magang',
    description:
      'Template penilaian mahasiswa dari dosen pembimbing magang.',
    href: 'https://docs.google.com/document/d/1N1_gGM6nWVM_b38nfk6U2kJaFyMou30L/edit?rtpof=true&sd=true&tab=t.0',
    note: '',
  },
  {
    title: 'Laporan Pelaksanaan Kerja Sama',
    description:
      'Dokumen laporan pelaksanaan kerja sama magang dengan mitra.',
    href: '#',
    note: 'Hubungi TU Fasilkom/Fasilkom Official untuk proses pembuatannya.',
  },
];

export default function PengajuanMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [mitraList, setMitraList] = useState<Mitra[]>([]);

  const [form, setForm] = useState<PengajuanForm>(initialForm);
  const [selectedMitraId, setSelectedMitraId] = useState('');
  const [isMitraTerdaftar, setIsMitraTerdaftar] = useState('ya');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const userIsSistemInformasi = isSistemInformasi(
    form.program_studi || user?.prodi
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData, mitraData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 10),
        getMitraList(),
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
      setMitraList(mitraData || []);

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
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan.';

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
          no_hp_mahasiswa:
            prev.no_hp_mahasiswa || parsedDraft.no_hp_mahasiswa,
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleJenisMagangChange = (value: string) => {
    if (value === 'Konversi 2 SKS' && !userIsSistemInformasi) {
      setErrorMsg(
        'Magang 2 SKS Khusus SI hanya tersedia untuk mahasiswa Sistem Informasi.'
      );
      return;
    }

    setErrorMsg('');
    setSelectedMitraId('');
    setIsMitraTerdaftar(value === 'Tidak Konversi' ? 'tidak' : 'ya');

    setForm((prev) => ({
      ...prev,
      jenis_magang: value,
      perusahaan: value === 'Tidak Konversi' ? prev.perusahaan : '',
      alamat_tempat_magang:
        value === 'Tidak Konversi' ? prev.alamat_tempat_magang : '',
      nama_penanggung_jawab:
        value === 'Tidak Konversi' ? prev.nama_penanggung_jawab : '',
      kontak_penanggung_jawab:
        value === 'Tidak Konversi' ? prev.kontak_penanggung_jawab : '',
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
      alamat_tempat_magang: selected.alamat || prev.alamat_tempat_magang,
      kontak_penanggung_jawab:
        selected.kontak_wa || prev.kontak_penanggung_jawab,
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

    if (
      form.kontak_penanggung_jawab &&
      !/^62\d{8,15}$/.test(form.kontak_penanggung_jawab)
    ) {
      return 'Kontak penanggung jawab harus diawali 62. Contoh: 6285456123.';
    }

    if (
      form.jenis_magang === 'Konversi 2 SKS' &&
      !isSistemInformasi(form.program_studi)
    ) {
      return 'Magang 2 SKS Khusus SI hanya tersedia untuk mahasiswa Sistem Informasi.';
    }

    if (
      form.jenis_magang !== 'Tidak Konversi' &&
      isMitraTerdaftar === 'tidak'
    ) {
      return 'Untuk magang konversi, ajukan mitra terlebih dahulu sebelum mengirim pengajuan magang.';
    }

    if (
      form.jenis_magang !== 'Tidak Konversi' &&
      isMitraTerdaftar === 'ya' &&
      !selectedMitraId
    ) {
      return 'Pilih mitra terdaftar terlebih dahulu.';
    }

    if (
      !form.perusahaan.trim() ||
      !form.alamat_tempat_magang.trim() ||
      !form.tgl_mulai.trim() ||
      !form.tgl_berakhir.trim() ||
      !form.rencana_magang.trim()
    ) {
      return 'Data tempat magang, periode, dan rencana magang wajib diisi.';
    }

    if (!form.bukti_penerimaan.trim()) {
      return 'Link bukti penerimaan magang wajib diisi.';
    }

    if (!isValidUrl(form.bukti_penerimaan.trim())) {
      return 'Format link bukti penerimaan magang tidak valid.';
    }

    if (form.foto_diri.trim() && !isValidUrl(form.foto_diri.trim())) {
      return 'Format link foto diri tidak valid.';
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

    try {
      const result = await createPengajuan({
        nama_mahasiswa: form.nama_mahasiswa.trim(),
        npm: form.npm.trim(),
        program_studi: form.program_studi.trim(),
        angkatan: form.angkatan.trim() || null,
        kelas: form.kelas.trim() || null,

        jenis_magang: form.jenis_magang,
        no_hp_mahasiswa: form.no_hp_mahasiswa.trim(),
        foto_diri: form.foto_diri.trim() || null,
        bukti_penerimaan: form.bukti_penerimaan.trim(),

        perusahaan: form.perusahaan.trim(),
        posisi: form.posisi.trim() || 'Peserta Magang',
        link_loa: form.bukti_penerimaan.trim(),

        alamat_tempat_magang: form.alamat_tempat_magang.trim(),
        nama_penanggung_jawab:
          form.nama_penanggung_jawab.trim() || 'Belum diisi',
        kontak_penanggung_jawab:
          form.kontak_penanggung_jawab.trim() || form.no_hp_mahasiswa.trim(),
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
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pengajuan magang.';

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
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal membatalkan pengajuan magang.';

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
            description="Isi data magang, tempat magang, bukti penerimaan, periode, dan rencana kegiatan."
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mt-8">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Dokumen Magang
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Template Dokumen Magang
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Unduh template dokumen yang dibutuhkan untuk pengajuan, pendataan,
                  pelaksanaan, bimbingan, penilaian, dan pelaporan magang.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {documentTemplates.map((item) => {
                const isManualProcess = item.href === '#';

                if (isManualProcess) {
                  return (
                    <div
                      key={item.title}
                      className="app-panel p-5 opacity-90"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-lg font-black text-amber-700 dark:bg-amber-400/10 dark:text-amber-300">
                        !
                      </div>

                      <h3 className="mt-4 text-lg font-black leading-snug text-slate-950 dark:text-white">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>

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

                    <h3 className="mt-4 text-lg font-black leading-snug text-slate-950 dark:text-white">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>

                    <span className="mt-4 inline-flex text-sm font-black text-[#1e3a8a] dark:text-blue-300">
                      Buka Dokumen →
                    </span>
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
                      <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                        {pengajuan.perusahaan}
                      </h2>

                      <span className={getStatusBadgeClass(pengajuan.status)}>
                        {getStatusLabel(pengajuan.status)}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {pengajuan.posisi || 'Peserta Magang'} •{' '}
                      {getJenisMagangLabel(pengajuan.jenis_magang)}
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
                    <p className="text-sm font-black text-red-700 dark:text-red-300">
                      Alasan Penolakan
                    </p>
                    <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-200">
                      {pengajuan.alasan_penolakan}
                    </p>
                  </div>
                )}

                <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem label="Nama Mahasiswa" value={pengajuan.nama_mahasiswa} />
                  <DetailItem label="NPM" value={pengajuan.npm} />
                  <DetailItem label="Program Studi" value={pengajuan.program_studi} />
                  <DetailItem
                    label="Jenis Magang"
                    value={getJenisMagangLabel(pengajuan.jenis_magang)}
                  />
                  <DetailItem label="Perusahaan" value={pengajuan.perusahaan} />
                  <DetailItem label="Posisi" value={pengajuan.posisi} />
                  <DetailItem
                    label="Tanggal Mulai"
                    value={pengajuan.tgl_mulai}
                  />
                  <DetailItem
                    label="Tanggal Berakhir"
                    value={pengajuan.tgl_berakhir}
                  />
                  <DetailItem label="Dosen Pembimbing" value={pengajuan.nama_dosen} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Alamat Tempat Magang
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pengajuan.alamat_tempat_magang || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Rencana Magang
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pengajuan.rencana_magang || '-'}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  {getBuktiPenerimaanLink(pengajuan) && (
                    <a
                      href={getBuktiPenerimaanLink(pengajuan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-btn-secondary"
                    >
                      Buka Bukti Penerimaan
                    </a>
                  )}

                  {pengajuan.foto_diri && (
                    <a
                      href={pengajuan.foto_diri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-btn-secondary"
                    >
                      Buka Foto Diri
                    </a>
                  )}

                  {pengajuan.status === 'Aktif' &&
                    pengajuan.jenis_magang !== 'Tidak Konversi' && (
                      <Link href="/laporan-akhir" className="app-btn-primary">
                        {pengajuan.jenis_magang === 'Konversi 2 SKS'
                          ? 'Upload Laporan Magang'
                          : 'Upload Laporan Akhir'}
                      </Link>
                    )}
                </div>
              </div>
            </section>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Data Mahasiswa
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data mahasiswa diambil dari akun. Lengkapi bagian yang masih
                  kosong.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mahasiswa</label>
                    <input
                      type="text"
                      name="nama_mahasiswa"
                      value={form.nama_mahasiswa}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="app-label">NPM</label>
                    <input
                      type="text"
                      name="npm"
                      value={form.npm}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="NPM"
                    />
                  </div>

                  <div>
                    <label className="app-label">Program Studi</label>
                    <input
                      type="text"
                      name="program_studi"
                      value={form.program_studi}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Informatika / Sistem Informasi"
                    />
                  </div>

                  <div>
                    <label className="app-label">Angkatan</label>
                    <input
                      type="text"
                      name="angkatan"
                      value={form.angkatan}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="2022"
                    />
                  </div>

                  <div>
                    <label className="app-label">Semester</label>
                    <input
                      type="text"
                      name="semester"
                      value={form.semester}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="7"
                    />
                  </div>

                  <div>
                    <label className="app-label">Kelas</label>
                    <input
                      type="text"
                      name="kelas"
                      value={form.kelas}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="7C"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nomor HP Mahasiswa</label>
                    <input
                      type="text"
                      name="no_hp_mahasiswa"
                      value={form.no_hp_mahasiswa}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          no_hp_mahasiswa: e.target.value.replace(/[^0-9]/g, ''),
                        }))
                      }
                      className="app-input"
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>
                </div>
              </section>

              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Jenis Magang dan Mitra
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Jenis Magang</label>
                    <select
                      name="jenis_magang"
                      value={form.jenis_magang}
                      onChange={(e) => handleJenisMagangChange(e.target.value)}
                      className="app-input"
                    >
                      <option value="Konversi 20 SKS">
                        Konversi Maksimal 20 SKS
                      </option>
                      <option value="Tidak Konversi">Tidak Konversi</option>
                      {userIsSistemInformasi && (
                        <option value="Konversi 2 SKS">
                          Magang 2 SKS Khusus SI
                        </option>
                      )}
                    </select>
                  </div>

                  {form.jenis_magang !== 'Tidak Konversi' && (
                    <div>
                      <label className="app-label">
                        Status Mitra Perusahaan
                      </label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => setIsMitraTerdaftar('ya')}
                          className={
                            isMitraTerdaftar === 'ya'
                              ? 'app-btn-primary'
                              : 'app-btn-secondary'
                          }
                        >
                          Sudah Terdaftar
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsMitraTerdaftar('tidak');
                            setSelectedMitraId('');
                            setForm((prev) => ({
                              ...prev,
                              perusahaan: '',
                              alamat_tempat_magang: '',
                              kontak_penanggung_jawab: '',
                            }));
                          }}
                          className={
                            isMitraTerdaftar === 'tidak'
                              ? 'app-btn-primary'
                              : 'app-btn-secondary'
                          }
                        >
                          Belum Terdaftar
                        </button>
                      </div>
                    </div>
                  )}

                  {form.jenis_magang !== 'Tidak Konversi' &&
                    isMitraTerdaftar === 'ya' && (
                      <div className="md:col-span-2">
                        <label className="app-label">Pilih Mitra</label>
                        <select
                          value={selectedMitraId}
                          onChange={(e) => handleMitraChange(e.target.value)}
                          className="app-input"
                        >
                          <option value="">Pilih mitra terdaftar</option>
                          {mitraList.map((mitra) => (
                            <option key={mitra.id} value={mitra.id}>
                              {mitra.nama_mitra}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  {form.jenis_magang !== 'Tidak Konversi' &&
                    isMitraTerdaftar === 'tidak' && (
                      <div className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                        Untuk magang konversi, perusahaan perlu diajukan sebagai
                        mitra terlebih dahulu.
                        <Link href="/ajukan-mitra" className="ml-1 font-black underline">
                          Ajukan mitra di sini.
                        </Link>
                      </div>
                    )}
                </div>
              </section>

              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Data Tempat Magang
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Perusahaan/Instansi</label>
                    <input
                      type="text"
                      name="perusahaan"
                      value={form.perusahaan}
                      onChange={(e) => {
                        setSelectedMitraId('');
                        handleChange(e);
                      }}
                      readOnly={
                        form.jenis_magang !== 'Tidak Konversi' &&
                        isMitraTerdaftar === 'ya' &&
                        Boolean(selectedMitraId)
                      }
                      className="app-input"
                      placeholder="Nama perusahaan/instansi"
                    />
                  </div>

                  <div>
                    <label className="app-label">Posisi</label>
                    <input
                      type="text"
                      name="posisi"
                      value={form.posisi}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: Frontend Developer Intern"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Alamat Tempat Magang</label>
                    <textarea
                      name="alamat_tempat_magang"
                      value={form.alamat_tempat_magang}
                      onChange={handleChange}
                      className="app-input min-h-24"
                      placeholder="Alamat lengkap tempat magang"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nama Penanggung Jawab</label>
                    <input
                      type="text"
                      name="nama_penanggung_jawab"
                      value={form.nama_penanggung_jawab}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Nama PIC / Pembimbing lapangan"
                    />
                  </div>

                  <div>
                    <label className="app-label">Kontak Penanggung Jawab</label>
                    <input
                      type="text"
                      name="kontak_penanggung_jawab"
                      value={form.kontak_penanggung_jawab}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          kontak_penanggung_jawab: e.target.value.replace(
                            /[^0-9]/g,
                            ''
                          ),
                        }))
                      }
                      className="app-input"
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="app-label">Latitude</label>
                    <input
                      type="text"
                      name="latitude"
                      value={form.latitude}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="-6.305..."
                    />
                  </div>

                  <div>
                    <label className="app-label">Longitude</label>
                    <input
                      type="text"
                      name="longitude"
                      value={form.longitude}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="107.300..."
                    />
                  </div>
                </div>
              </section>

              <section className="app-card p-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Periode dan Dokumen
                </h2>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Tanggal Mulai</label>
                    <input
                      type="date"
                      name="tgl_mulai"
                      value={form.tgl_mulai}
                      onChange={handleChange}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">Tanggal Berakhir</label>
                    <input
                      type="date"
                      name="tgl_berakhir"
                      value={form.tgl_berakhir}
                      onChange={handleChange}
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      Link Bukti Penerimaan Magang
                    </label>
                    <input
                      type="url"
                      name="bukti_penerimaan"
                      value={form.bukti_penerimaan}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Masukkan link PDF bukti penerimaan"
                    />
                  </div>

                  <div>
                    <label className="app-label">Link Foto Diri</label>
                    <input
                      type="url"
                      name="foto_diri"
                      value={form.foto_diri}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Masukkan link foto diri"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Rencana Magang</label>
                    <textarea
                      name="rencana_magang"
                      value={form.rencana_magang}
                      onChange={handleChange}
                      className="app-input min-h-32"
                      placeholder="Tuliskan rencana kegiatan selama magang"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Magang'}
                </button>

                <button
                  type="button"
                  onClick={resetDraft}
                  disabled={isSubmitting}
                  className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
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