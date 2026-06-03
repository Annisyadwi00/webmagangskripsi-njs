"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import ProgressStepper from '@/components/ui/ProgressStepper';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import {
  Pengajuan,
  createPengajuan,
  getPengajuanList,
  batalPengajuan,
  uploadLaporanAkhir,
} from '@/lib/pengajuan-client';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

type PengajuanForm = {
  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  angkatan: string;
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

const initialForm: PengajuanForm = {
  nama_mahasiswa: '',
  npm: '',
  program_studi: '',
  angkatan: '',
  kelas: '',

  jenis_magang: 'Magang Berdampak',
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

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (
    status === 'Menunggu_Verifikasi' ||
    status === 'Pilih_Dosen' ||
    status === 'Menunggu'
  ) {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Pilih_Dosen') return 'Pilih Dosen';
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
        'Mahasiswa mengisi data magang, bukti penerimaan, dan permohonan dosen pembimbing.',
      status: getStatus('Belum_Ada'),
    },
    {
      title: 'Verifikasi Admin',
      description:
        'Admin memeriksa data magang dan menentukan dosen pembimbing.',
      status: getStatus('Menunggu_Verifikasi'),
    },
    {
      title: 'Magang Aktif',
      description:
        'Mahasiswa melaksanakan magang dan mengisi logbook kegiatan.',
      status: getStatus('Aktif'),
    },
    {
      title: 'Selesai',
      description: 'Dosen memberi evaluasi dan nilai akhir magang.',
      status: getStatus('Selesai'),
    },
  ];
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

export default function PengajuanMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);

  const [form, setForm] = useState<PengajuanForm>(initialForm);
  const [linkLaporanAkhir, setLinkLaporanAkhir] = useState('');

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

      const pengajuanItems = Array.isArray(pengajuanData)
        ? pengajuanData
        : pengajuanData?.items || [];

      const userData = currentUser as CurrentUser & {
        nim_nidn?: string | null;
        prodi?: string | null;
        kelas?: string | null;
      };

      setUser(currentUser);
      setForm((prev) => ({
        ...prev,
        nama_mahasiswa: prev.nama_mahasiswa || userData.name || '',
        npm: prev.npm || userData.nim_nidn || '',
        program_studi: prev.program_studi || userData.prodi || '',
        kelas: prev.kelas || userData.kelas || '',
      }));
      setPengajuan(pengajuanItems[0] || null);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPengajuan = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await createPengajuan({
        nama_mahasiswa: form.nama_mahasiswa.trim() || user?.name,
        npm: form.npm.trim(),
        program_studi: form.program_studi.trim(),
        angkatan: form.angkatan.trim(),
        kelas: form.kelas.trim(),

        jenis_magang: form.jenis_magang,
        no_hp_mahasiswa: form.no_hp_mahasiswa.trim(),
        foto_diri: form.foto_diri.trim() || null,
        bukti_penerimaan: form.bukti_penerimaan.trim(),

        perusahaan: form.perusahaan.trim(),
        posisi: form.posisi.trim() || form.jenis_magang,
        link_loa: form.bukti_penerimaan.trim(),

        alamat_tempat_magang: form.alamat_tempat_magang.trim(),
        nama_penanggung_jawab: form.nama_penanggung_jawab.trim(),
        kontak_penanggung_jawab: form.kontak_penanggung_jawab.trim(),
        latitude: form.latitude.trim() || null,
        longitude: form.longitude.trim() || null,

        tgl_mulai: form.tgl_mulai,
        tgl_berakhir: form.tgl_berakhir,
        rencana_magang: form.rencana_magang.trim(),
      });

      setMessage(result.message || 'Pendataan magang berhasil dikirim.');
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pendataan magang.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatalPengajuan = async () => {
    const confirmed = confirm('Yakin ingin membatalkan pengajuan ini?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await batalPengajuan();

      setMessage(result.message || 'Pengajuan berhasil dibatalkan.');
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal membatalkan pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadLaporan = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await uploadLaporanAkhir(linkLaporanAkhir.trim());

      setMessage(result.message || 'Laporan akhir berhasil disimpan.');
      setLinkLaporanAkhir('');
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengunggah laporan akhir.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPengajuan = pengajuan;

  const bisaUploadLaporan = currentPengajuan?.status === 'Aktif';

  const bisaDibatalkan =
    currentPengajuan?.status === 'Menunggu_Verifikasi' ||
    currentPengajuan?.status === 'Ditolak';

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  if (errorMsg && !message) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <Alert variant="error">{errorMsg}</Alert>
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
            title={`Pengajuan Magang ${user?.name || ''}`}
            description="Isi data pendataan magang, pantau status verifikasi, dan unggah laporan akhir setelah magang aktif."
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {currentPengajuan?.status === 'Ditolak' &&
            currentPengajuan.alasan_penolakan && (
              <Alert variant="error">
                Pengajuan ditolak. Alasan:{' '}
                {currentPengajuan.alasan_penolakan}
              </Alert>
            )}

          {currentPengajuan?.status === 'Menunggu_Verifikasi' && (
            <Alert variant="warning">
              Pengajuan kamu sedang menunggu verifikasi admin. Pastikan bukti
              penerimaan dan dokumen pendukung dapat diakses.
            </Alert>
          )}

          {currentPengajuan?.status === 'Aktif' && (
            <Alert variant="success">
              Pengajuan kamu sudah aktif. Dosen pembimbing telah ditentukan oleh
              admin.
            </Alert>
          )}

          {!currentPengajuan && (
            <Alert variant="info">
              Kamu belum memiliki pendataan magang. Silakan isi data magang dan
              bukti penerimaan terlebih dahulu.
            </Alert>
          )}

          <section className="mb-8">
            <ProgressStepper steps={getMagangSteps(currentPengajuan?.status)} />
          </section>

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Status Pengajuan"
              value={getStatusLabel(currentPengajuan?.status)}
              description="Status terakhir proses magang."
              icon="document"
            />

            <StatCard
              title="Dosen Pembimbing"
              value={currentPengajuan?.nama_dosen || '-'}
              description="Dosen pembimbing ditentukan oleh admin."
              icon="users"
            />

            <StatCard
              title="Nilai Akhir"
              value={currentPengajuan?.nilai_dari_dosen || '-'}
              description="Nilai akhir dari dosen pembimbing."
              icon="chart"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {currentPengajuan
                      ? 'Detail Pengajuan'
                      : 'Form Pendataan Magang'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {currentPengajuan
                      ? 'Informasi pendataan magang yang sedang berjalan.'
                      : 'Lengkapi data magang dan bukti penerimaan dari tempat magang.'}
                  </p>
                </div>

                {currentPengajuan && (
                  <span className={getStatusBadgeClass(currentPengajuan.status)}>
                    {getStatusLabel(currentPengajuan.status)}
                  </span>
                )}
              </div>

              {!currentPengajuan ? (
                <form onSubmit={handleSubmitPengajuan} className="space-y-6">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                      Data Mahasiswa
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Pastikan data mahasiswa sesuai identitas akademik.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="app-label">Nama Lengkap</label>
                      <input
                        type="text"
                        name="nama_mahasiswa"
                        required
                        value={form.nama_mahasiswa}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Nama lengkap mahasiswa"
                      />
                    </div>

                    <div>
                      <label className="app-label">NPM</label>
                      <input
                        type="text"
                        name="npm"
                        required
                        value={form.npm}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: 2210631170112"
                      />
                    </div>

                    <div>
                      <label className="app-label">Program Studi</label>
                      <select
                        name="program_studi"
                        required
                        value={form.program_studi}
                        onChange={handleChange}
                        className="app-input"
                      >
                        <option value="">Pilih Program Studi</option>
                        <option value="Informatika">Informatika</option>
                        <option value="Sistem Informasi">
                          Sistem Informasi
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="app-label">Angkatan</label>
                      <input
                        type="text"
                        name="angkatan"
                        required
                        value={form.angkatan}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: 2022"
                      />
                    </div>

                    <div>
                      <label className="app-label">Kelas</label>
                      <input
                        type="text"
                        name="kelas"
                        required
                        value={form.kelas}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: 7C"
                      />
                    </div>

                    <div>
                      <label className="app-label">Nomor HP Mahasiswa</label>
                      <input
                        type="text"
                        name="no_hp_mahasiswa"
                        required
                        value={form.no_hp_mahasiswa}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="6285456123"
                      />
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Gunakan format 62, bukan 0. Contoh: 6285456123.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                      Data Magang
                    </h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      Isi data tempat magang dan bukti penerimaan dari unit
                      tujuan magang.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="app-label">Jenis Magang</label>
                      <select
                        name="jenis_magang"
                        required
                        value={form.jenis_magang}
                        onChange={handleChange}
                        className="app-input"
                      >
                        <option value="Magang Berdampak">
                          Magang Berdampak
                        </option>
                        <option value="Mandiri Konversi">
                          Mandiri Konversi
                        </option>
                        <option value="Umum Mandiri Non-Konversi">
                          Umum / Mandiri Non-Konversi
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="app-label">Nama Tempat Magang</label>
                      <input
                        type="text"
                        name="perusahaan"
                        required
                        value={form.perusahaan}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: PT. Sukamaju"
                      />
                    </div>

                    <div>
                      <label className="app-label">Posisi / Unit Kerja</label>
                      <input
                        type="text"
                        name="posisi"
                        value={form.posisi}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: Frontend Developer Intern"
                      />
                    </div>

                    <div>
                      <label className="app-label">
                        Link Foto Diri Profesional
                      </label>
                      <input
                        type="url"
                        name="foto_diri"
                        value={form.foto_diri}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="https://drive.google.com/..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="app-label">
                        Bukti Penerimaan Magang
                      </label>
                      <input
                        type="url"
                        name="bukti_penerimaan"
                        required
                        value={form.bukti_penerimaan}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="https://drive.google.com/..."
                      />
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Bisa berupa surat resmi, screenshot chat, email
                        penerimaan, atau bukti lain. Gunakan link Google Drive
                        yang bisa diakses.
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="app-label">
                        Alamat Tempat Magang
                      </label>
                      <textarea
                        name="alamat_tempat_magang"
                        required
                        rows={3}
                        value={form.alamat_tempat_magang}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Contoh: Jl. Parahyangan No.39, Karawang..."
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
                        placeholder="-6.367712"
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
                        placeholder="107.277014"
                      />
                    </div>

                    <div>
                      <label className="app-label">Tanggal Mulai Magang</label>
                      <input
                        type="date"
                        name="tgl_mulai"
                        required
                        value={form.tgl_mulai}
                        onChange={handleChange}
                        className="app-input"
                      />
                    </div>

                    <div>
                      <label className="app-label">
                        Tanggal Selesai Magang
                      </label>
                      <input
                        type="date"
                        name="tgl_berakhir"
                        required
                        value={form.tgl_berakhir}
                        onChange={handleChange}
                        className="app-input"
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                      Penanggung Jawab Tempat Magang
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="app-label">
                        Nama Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        name="nama_penanggung_jawab"
                        required
                        value={form.nama_penanggung_jawab}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="Nama PIC / pembimbing lapangan"
                      />
                    </div>

                    <div>
                      <label className="app-label">
                        Kontak Penanggung Jawab
                      </label>
                      <input
                        type="text"
                        name="kontak_penanggung_jawab"
                        required
                        value={form.kontak_penanggung_jawab}
                        onChange={handleChange}
                        className="app-input"
                        placeholder="6285456123"
                      />
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Gunakan format 62, bukan 0.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="app-label">Rencana Magang</label>
                    <textarea
                      name="rencana_magang"
                      required
                      rows={5}
                      value={form.rencana_magang}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Tulis deskripsi kegiatan yang akan dilakukan selama magang..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? 'Mengirim...'
                      : 'Kirim Pendataan Magang'}
                  </button>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <DetailItem
                      label="Nama Mahasiswa"
                      value={currentPengajuan.nama_mahasiswa}
                    />
                    <DetailItem label="NPM" value={currentPengajuan.npm} />
                    <DetailItem
                      label="Program Studi"
                      value={currentPengajuan.program_studi}
                    />
                    <DetailItem
                      label="Angkatan"
                      value={currentPengajuan.angkatan}
                    />
                    <DetailItem label="Kelas" value={currentPengajuan.kelas} />
                    <DetailItem
                      label="Jenis Magang"
                      value={currentPengajuan.jenis_magang}
                    />
                    <DetailItem
                      label="Tempat Magang"
                      value={currentPengajuan.perusahaan}
                    />
                    <DetailItem
                      label="Posisi / Unit Kerja"
                      value={currentPengajuan.posisi}
                    />
                    <DetailItem
                      label="Tanggal Mulai"
                      value={currentPengajuan.tgl_mulai}
                    />
                    <DetailItem
                      label="Tanggal Berakhir"
                      value={currentPengajuan.tgl_berakhir}
                    />
                    <DetailItem
                      label="Dosen Pembimbing"
                      value={
                        currentPengajuan.nama_dosen ||
                        'Menunggu penentuan admin'
                      }
                    />
                    <DetailItem
                      label="Tipe Konversi"
                      value={currentPengajuan.tipeKonversi}
                    />
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Rencana Magang
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {currentPengajuan.rencana_magang || '-'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    {currentPengajuan.link_loa && (
                      <a
                        href={currentPengajuan.link_loa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-secondary flex-1"
                      >
                        Lihat Bukti Penerimaan
                      </a>
                    )}

                    {currentPengajuan.foto_diri && (
                      <a
                        href={currentPengajuan.foto_diri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-secondary flex-1"
                      >
                        Lihat Foto Diri
                      </a>
                    )}

                    {bisaDibatalkan && (
                      <button
                        type="button"
                        onClick={handleBatalPengajuan}
                        disabled={isSubmitting}
                        className="app-btn-danger flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Batalkan Pengajuan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Alur Pengajuan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Tahapan proses magang mahasiswa.
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <p className="font-black text-[#1e3a8a] dark:text-blue-300">
                    1. Pendataan Magang
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Mahasiswa mengisi data magang dan bukti penerimaan.
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="font-black text-slate-950 dark:text-white">
                    2. Verifikasi Admin
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Admin memeriksa data dan dokumen pendukung.
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="font-black text-slate-950 dark:text-white">
                    3. Penentuan Dosen
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Admin/koorprodi menentukan dosen pembimbing magang.
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="font-black text-slate-950 dark:text-white">
                    4. Logbook & Nilai
                  </p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    Mahasiswa mengisi logbook dan dosen memberi evaluasi akhir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {bisaUploadLaporan && (
            <section className="app-card mt-6 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Upload Laporan Akhir
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Kirim link laporan akhir setelah kegiatan magang selesai.
                </p>
              </div>

              {currentPengajuan?.link_laporan_akhir && (
                <Alert variant="info">
                  Laporan akhir sudah tersimpan. Kamu tetap bisa memperbarui
                  link jika diperlukan.
                </Alert>
              )}

              <form
                onSubmit={handleUploadLaporan}
                className="flex flex-col gap-3 md:flex-row"
              >
                <input
                  type="url"
                  required
                  value={linkLaporanAkhir}
                  onChange={(e) => setLinkLaporanAkhir(e.target.value)}
                  className="app-input flex-1"
                  placeholder="https://drive.google.com/..."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Simpan Laporan
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}