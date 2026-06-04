"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import {
  JobStatus,
  JobTipeKonversi,
  JobType,
  Lowongan,
  activateLowongan,
  createLowongan,
  deactivateLowongan,
  deleteLowongan,
  getAllLowonganList,
  updateLowongan,
} from '@/lib/lowongan-client';
import {
  PengajuanLowongan,
  getPengajuanLowonganList,
  updateStatusPengajuanLowongan,
} from '@/lib/pengajuan-lowongan-client';
type LowonganForm = {
  id?: number;
  posisi: string;
  perusahaan: string;
  deskripsi: string;
  location: string;
  kategori: string;
  type: JobType;
  tipeKonversi: JobTipeKonversi;
  isPaid: boolean;
  kuota: number;
  link_pendaftaran: string;
  email_perusahaan: string;
  valid_until: string;
  status: JobStatus;
};

const initialForm: LowonganForm = {
  posisi: '',
  perusahaan: '',
  deskripsi: '',
  location: '',
  kategori: '',
  type: 'Onsite',
  tipeKonversi: 'Konversi 20 SKS',
  isPaid: false,
  kuota: 1,
  link_pendaftaran: '',
  email_perusahaan: '',
  valid_until: '',
  status: 'Aktif',
};
const [pengajuanLowongan, setPengajuanLowongan] = useState<PengajuanLowongan[]>([]);
const [selectedPengajuanLowongan, setSelectedPengajuanLowongan] =
  useState<PengajuanLowongan | null>(null);
const [catatanSuperAdmin, setCatatanSuperAdmin] = useState('');
function getTypeBadgeClass(type: string) {
  if (type === 'Remote') return 'app-badge app-badge-green';
  if (type === 'Hybrid') return 'app-badge app-badge-yellow';

  return 'app-badge app-badge-blue';
}

function getStatusBadgeClass(status: string) {
  if (status === 'Aktif') return 'app-badge app-badge-green';

  return 'app-badge app-badge-red';
}

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function toDateInputValue(date?: string | null) {
  if (!date) return '';

  return String(date).slice(0, 10);
}

export default function AdminLowonganPage() {
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');

  const [form, setForm] = useState<LowonganForm>(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isEditMode = Boolean(form.id);

  const fetchLowongan = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [dataLowongan, dataPengajuanLowongan] = await Promise.all([
  getAllLowonganList(),
  getPengajuanLowonganList(),
]);

setLowongan(dataLowongan);
setPengajuanLowongan(dataPengajuanLowongan);

    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowongan();
  }, []);

  const filteredLowongan = useMemo(() => {
    const keyword = search.toLowerCase();

    return lowongan.filter((item) => {
      const matchesKeyword =
        item.title.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.kategori.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      const matchesType = typeFilter === 'Semua' || item.type === typeFilter;

      return matchesKeyword && matchesStatus && matchesType;
    });
  }, [lowongan, search, statusFilter, typeFilter]);

  const totalAktif = lowongan.filter((item) => item.status === 'Aktif').length;
  const totalNonaktif = lowongan.filter(
    (item) => item.status === 'Nonaktif'
  ).length;
  const totalRemote = lowongan.filter((item) => item.type === 'Remote').length;
const totalPengajuanMenunggu = pengajuanLowongan.filter(
  (item) => item.status === 'Menunggu'
).length;
  const resetForm = () => {
    setForm(initialForm);
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setMessage('');
    setErrorMsg('');
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const openEditForm = (item: Lowongan) => {
    setMessage('');
    setErrorMsg('');

    setForm({
      id: item.id,
      posisi: item.title,
      perusahaan: item.company,
      deskripsi: item.description,
      location: item.location || '',
      kategori: item.kategori || '',
      type: item.type,
      tipeKonversi: item.tipeKonversi,
      isPaid: item.isPaid,
      kuota: item.kuota,
      link_pendaftaran: item.link_pendaftaran || '',
      email_perusahaan: item.email_perusahaan || '',
      valid_until: toDateInputValue(item.valid_until),
      status: item.status,
    });

    setIsFormOpen(true);
  };

  const handleChange = (
    field: keyof LowonganForm,
    value: string | number | boolean
  ) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const payload = {
        posisi: form.posisi.trim(),
        perusahaan: form.perusahaan.trim(),
        deskripsi: form.deskripsi.trim(),
        location: form.location.trim(),
        kategori: form.kategori.trim(),
        type: form.type,
        tipeKonversi: form.tipeKonversi,
        isPaid: form.isPaid,
        kuota: Number(form.kuota),
        link_pendaftaran: form.link_pendaftaran.trim() || null,
        email_perusahaan: form.email_perusahaan.trim() || null,
        valid_until: form.valid_until || null,
        status: form.status,
      };

      const result = isEditMode
        ? await updateLowongan({
            id: Number(form.id),
            ...payload,
          })
        : await createLowongan(payload);

      setMessage(
        result.message ||
          (isEditMode
            ? 'Lowongan berhasil diperbarui.'
            : 'Lowongan berhasil ditambahkan.')
      );

      resetForm();
      await fetchLowongan();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: Lowongan) => {
    const confirmed = confirm(
      item.status === 'Aktif'
        ? 'Nonaktifkan lowongan ini?'
        : 'Aktifkan kembali lowongan ini?'
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result =
        item.status === 'Aktif'
          ? await deactivateLowongan(item.id)
          : await activateLowongan(item.id);

      setMessage(result.message || 'Status lowongan berhasil diperbarui.');
      await fetchLowongan();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengubah status lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Lowongan) => {
    const confirmed = confirm(
      `Yakin ingin menghapus lowongan "${item.title}"?`
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await deleteLowongan(item.id);

      setMessage(result.message || 'Lowongan berhasil dihapus.');
      await fetchLowongan();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal menghapus lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

const handleUpdatePengajuanLowongan = async (
  item: PengajuanLowongan,
  status: 'Disetujui' | 'Ditolak'
) => {
  if (status === 'Ditolak' && !catatanSuperAdmin.trim()) {
    setErrorMsg('Catatan wajib diisi jika pengajuan lowongan ditolak.');
    return;
  }

  const confirmed = confirm(
    status === 'Disetujui'
      ? `Setujui pengajuan lowongan "${item.posisi}" dari ${item.nama_mitra}?`
      : `Tolak pengajuan lowongan "${item.posisi}" dari ${item.nama_mitra}?`
  );

  if (!confirmed) return;

  setIsSubmitting(true);
  setMessage('');
  setErrorMsg('');

  try {
    const result = await updateStatusPengajuanLowongan({
      id: item.id,
      status,
      catatan_super_admin: catatanSuperAdmin.trim() || null,
    });

    setMessage(
      result.message || 'Status pengajuan lowongan berhasil diperbarui.'
    );

    setSelectedPengajuanLowongan(null);
    setCatatanSuperAdmin('');
    await fetchLowongan();
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : 'Gagal memperbarui pengajuan lowongan.';

    setErrorMsg(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  if (isLoading) {
    return (
      <DashboardShell role="Super Admin">
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

  return (
    <DashboardShell role="Super Admin">
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Super Admin"
title="Kelola Lowongan Magang"
description="Tambah, ubah, nonaktifkan, hapus, dan validasi lowongan magang yang tampil di halaman pengguna."
          action={
            <button type="button" onClick={openCreateForm} className="app-btn-primary">
              Tambah Lowongan
            </button>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Lowongan Aktif"
            value={totalAktif}
            description="Lowongan yang sedang tampil untuk pengguna."
            icon="briefcase"
          />

          <StatCard
            title="Nonaktif"
            value={totalNonaktif}
            description="Lowongan yang disembunyikan dari pengguna."
            icon="warning"
          />

          <StatCard
            title="Remote"
            value={totalRemote}
            description="Lowongan dengan sistem kerja remote."
            icon="document"
          />
          <StatCard
  title="Pengajuan Mitra"
  value={totalPengajuanMenunggu}
  description="Lowongan dari mitra yang menunggu validasi."
  icon="clock"
/>
        </section>

<section className="app-card mb-8 p-6">
  <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
    <div>
      <h2 className="text-xl font-black text-slate-950 dark:text-white">
        Pengajuan Lowongan Mitra
      </h2>

      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Lowongan yang diajukan oleh mitra melalui form publik.
      </p>
    </div>
  </div>

  {pengajuanLowongan.length === 0 ? (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
      <p className="font-bold text-slate-700 dark:text-slate-300">
        Belum ada pengajuan lowongan dari mitra.
      </p>
    </div>
  ) : (
    <div className="space-y-4">
      {pengajuanLowongan.slice(0, 5).map((item) => (
        <article key={item.id} className="app-panel p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  {item.posisi}
                </h3>

                <span
                  className={
                    item.status === 'Disetujui'
                      ? 'app-badge app-badge-green'
                      : item.status === 'Ditolak'
                        ? 'app-badge app-badge-red'
                        : 'app-badge app-badge-yellow'
                  }
                >
                  {item.status}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {item.nama_mitra} • {item.sistem_kerja} • {item.tipe_konversi}
              </p>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                PIC: {item.nama_pic} • {item.kontak_pic}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => setSelectedPengajuanLowongan(item)}
                className="app-btn-secondary px-4 py-2 text-sm"
              >
                Detail
              </button>

              {item.status === 'Menunggu' && (
                <button
                  type="button"
                  onClick={() =>
                    handleUpdatePengajuanLowongan(item, 'Disetujui')
                  }
                  disabled={isSubmitting}
                  className="app-btn-primary px-4 py-2 text-sm"
                >
                  Setujui
                </button>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )}
</section>

        {isFormOpen && (
          <section className="app-card animate-fade-up mb-8 p-6">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  {isEditMode ? 'Edit Lowongan' : 'Tambah Lowongan'}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Lengkapi data lowongan magang yang akan ditampilkan.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="app-btn-secondary"
              >
                Tutup Form
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="app-label">Posisi Magang</label>
                  <input
                    type="text"
                    required
                    value={form.posisi}
                    onChange={(e) => handleChange('posisi', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Frontend Developer Intern"
                  />
                </div>

                <div>
                  <label className="app-label">Nama Perusahaan</label>
                  <input
                    type="text"
                    required
                    value={form.perusahaan}
                    onChange={(e) =>
                      handleChange('perusahaan', e.target.value)
                    }
                    className="app-input"
                    placeholder="Contoh: PT Teknologi Indonesia"
                  />
                </div>

                <div>
                  <label className="app-label">Lokasi</label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Karawang / Jakarta / Remote"
                  />
                </div>

                <div>
                  <label className="app-label">Kategori</label>
                  <input
                    type="text"
                    value={form.kategori}
                    onChange={(e) => handleChange('kategori', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Web Development"
                  />
                </div>

                <div>
                  <label className="app-label">Tipe Kerja</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      handleChange('type', e.target.value as JobType)
                    }
                    className="app-input"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Tipe Konversi</label>
                  <select
                    value={form.tipeKonversi}
                    onChange={(e) =>
                      handleChange(
                        'tipeKonversi',
                        e.target.value as JobTipeKonversi
                      )
                    }
                    className="app-input"
                  >
                    <option value="Konversi 20 SKS">Konversi 20 SKS</option>
<option value="Tidak Konversi">Tidak Konversi</option>
<option value="Konversi 2 SKS">Konversi 2 SKS khusus Sistem Informasi</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Kuota</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.kuota}
                    onChange={(e) =>
                      handleChange('kuota', Number(e.target.value))
                    }
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Batas Daftar</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) =>
                      handleChange('valid_until', e.target.value)
                    }
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      handleChange('status', e.target.value as JobStatus)
                    }
                    className="app-input"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Berbayar?</label>
                  <select
                    value={form.isPaid ? 'Ya' : 'Tidak'}
                    onChange={(e) =>
                      handleChange('isPaid', e.target.value === 'Ya')
                    }
                    className="app-input"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Link Pendaftaran</label>
                  <input
                    type="url"
                    value={form.link_pendaftaran}
                    onChange={(e) =>
                      handleChange('link_pendaftaran', e.target.value)
                    }
                    className="app-input"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="app-label">Email Perusahaan</label>
                  <input
                    type="email"
                    value={form.email_perusahaan}
                    onChange={(e) =>
                      handleChange('email_perusahaan', e.target.value)
                    }
                    className="app-input"
                    placeholder="hr@perusahaan.com"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Deskripsi Lowongan</label>
                <textarea
                  required
                  rows={5}
                  value={form.deskripsi}
                  onChange={(e) => handleChange('deskripsi', e.target.value)}
                  className="app-input"
                  placeholder="Jelaskan tugas, kualifikasi, dan informasi lowongan..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : isEditMode
                      ? 'Simpan Perubahan'
                      : 'Tambah Lowongan'}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="app-btn-secondary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="app-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px_220px]">
            <div>
              <label className="app-label">Cari Lowongan</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari posisi, perusahaan, lokasi, atau kategori..."
              />
            </div>

            <div>
              <label className="app-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>

            <div>
              <label className="app-label">Tipe Kerja</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </section>

        {filteredLowongan.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Lowongan tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau filter.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredLowongan.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-[#1e3a8a] dark:text-blue-300">
                      {item.company}
                    </p>

                    <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.location}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={getTypeBadgeClass(item.type)}>
                      {item.type}
                    </span>
                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <p className="line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="app-panel p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Kategori
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.kategori}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Konversi
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.tipeKonversi}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Kuota
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.kuota} mahasiswa
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Batas Daftar
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {formatDate(item.valid_until)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => openEditForm(item)}
                    className="app-btn-secondary flex-1"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    disabled={isSubmitting}
                    className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={isSubmitting}
                    className="app-btn-danger flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

{selectedPengajuanLowongan && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div
      className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      onClick={() => {
        setSelectedPengajuanLowongan(null);
        setCatatanSuperAdmin('');
      }}
    />

    <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
      <div className="mb-6">
        <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
          Detail Pengajuan Lowongan
        </p>

        <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
          {selectedPengajuanLowongan.posisi}
        </h3>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {selectedPengajuanLowongan.nama_mitra}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="app-panel p-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            PIC
          </p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">
            {selectedPengajuanLowongan.nama_pic}
          </p>
        </div>

        <div className="app-panel p-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Kontak PIC
          </p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">
            {selectedPengajuanLowongan.kontak_pic}
          </p>
        </div>

        <div className="app-panel p-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Sistem Kerja
          </p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">
            {selectedPengajuanLowongan.sistem_kerja}
          </p>
        </div>

        <div className="app-panel p-4">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Tipe Konversi
          </p>
          <p className="mt-1 font-black text-slate-950 dark:text-white">
            {selectedPengajuanLowongan.tipe_konversi}
          </p>
        </div>

        <div className="app-panel p-4 md:col-span-2">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Deskripsi
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
            {selectedPengajuanLowongan.deskripsi}
          </p>
        </div>

        <div className="app-panel p-4 md:col-span-2">
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            Persyaratan
          </p>
          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
            {selectedPengajuanLowongan.persyaratan || '-'}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <label className="app-label">Catatan Super Admin</label>
        <textarea
          value={catatanSuperAdmin}
          onChange={(e) => setCatatanSuperAdmin(e.target.value)}
          className="app-input min-h-28"
          placeholder="Wajib diisi jika pengajuan ditolak."
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {selectedPengajuanLowongan.status === 'Menunggu' && (
          <>
            <button
              type="button"
              onClick={() =>
                handleUpdatePengajuanLowongan(
                  selectedPengajuanLowongan,
                  'Disetujui'
                )
              }
              disabled={isSubmitting}
              className="app-btn-primary flex-1"
            >
              Setujui
            </button>

            <button
              type="button"
              onClick={() =>
                handleUpdatePengajuanLowongan(
                  selectedPengajuanLowongan,
                  'Ditolak'
                )
              }
              disabled={isSubmitting}
              className="app-btn-danger flex-1"
            >
              Tolak
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => {
            setSelectedPengajuanLowongan(null);
            setCatatanSuperAdmin('');
          }}
          className="app-btn-secondary flex-1"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
)}

    </main>
    </DashboardShell>
  );
}