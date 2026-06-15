"use client";

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Mitra, getMitraList } from '@/lib/mitra-client';
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

function getTypeBadgeClass(type?: string | null) {
  if (type === 'Remote') return 'app-badge app-badge-green';
  if (type === 'Hybrid') return 'app-badge app-badge-yellow';
  return 'app-badge app-badge-blue';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif') return 'app-badge app-badge-green';
  return 'app-badge app-badge-red';
}

function getTipeKonversiLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
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

function isValidUrl(value: string) {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function AdminLowonganPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [selectedMitraId, setSelectedMitraId] = useState('');

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

      const [me, dataLowongan, dataMitra] = await Promise.all([
        getCurrentUserClient(),
        getAllLowonganList(),
        getMitraList(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setLowongan(dataLowongan || []);
      setMitraList(dataMitra || []);
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
      const title = item.title || '';
      const company = item.company || '';
      const location = item.location || '';
      const kategori = item.kategori || '';
      const description = item.description || '';
      const tipeLabel = getTipeKonversiLabel(item.tipeKonversi);

      const matchesKeyword =
        title.toLowerCase().includes(keyword) ||
        company.toLowerCase().includes(keyword) ||
        location.toLowerCase().includes(keyword) ||
        kategori.toLowerCase().includes(keyword) ||
        description.toLowerCase().includes(keyword) ||
        tipeLabel.toLowerCase().includes(keyword);

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

  const resetForm = () => {
    setForm(initialForm);
    setSelectedMitraId('');
    setIsFormOpen(false);
  };

  const openCreateForm = () => {
    setMessage('');
    setErrorMsg('');
    setForm(initialForm);
    setSelectedMitraId('');
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

    // Cari mitra berdasarkan nama perusahaan yang tersimpan
    const selectedMitra = mitraList.find(
      (mitra) => mitra.nama_mitra === item.company
    );
    setSelectedMitraId(selectedMitra ? String(selectedMitra.id) : '');
    setIsFormOpen(true);
  };

  const handleChange = (
    field: keyof LowonganForm,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Perbaikan: gunakan field yang sesuai dari tipe Mitra yang sudah diperbarui
  const handleMitraChange = (value: string) => {
    setSelectedMitraId(value);

    if (!value) {
      setForm((prev) => ({
        ...prev,
        perusahaan: '',
        location: '',
        email_perusahaan: '',
        link_pendaftaran: '',
      }));
      return;
    }

    const selected = mitraList.find((mitra) => String(mitra.id) === value);
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      perusahaan: selected.nama_mitra,
      location: selected.alamat_kantor_mitra || '',
      email_perusahaan: selected.email_perusahaan || '',
      link_pendaftaran: selected.url_mitra || '',
    }));
  };

  const validateForm = () => {
    // Wajib pilih mitra
    if (!selectedMitraId) {
      return 'Harus memilih mitra terlebih dahulu.';
    }
    if (
      !form.posisi.trim() ||
      !form.deskripsi.trim() ||
      !form.kategori.trim()
    ) {
      return 'Posisi, deskripsi, dan kategori wajib diisi.';
    }
    if (Number(form.kuota) < 1) {
      return 'Kuota minimal 1 mahasiswa.';
    }
    if (form.link_pendaftaran && !isValidUrl(form.link_pendaftaran)) {
      return 'Format link pendaftaran tidak valid.';
    }
    if (form.email_perusahaan && !isValidEmail(form.email_perusahaan)) {
      return 'Format email perusahaan tidak valid.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    const validation = validateForm();
    if (validation) {
      setErrorMsg(validation);
      setIsSubmitting(false);
      return;
    }

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
        error instanceof Error ? error.message : 'Gagal menyimpan lowongan.';
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
        error instanceof Error ? error.message : 'Gagal mengubah status lowongan.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (item: Lowongan) => {
    const confirmed = confirm(`Yakin ingin menghapus lowongan "${item.title}"?`);
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

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Staff"
          title="Manajemen Lowongan"
          description={`Kelola lowongan magang yang tampil pada halaman publik. Halo, ${
            currentUser?.name || 'Admin'
          }.`}
          action={
            <button type="button" onClick={openCreateForm} className="app-btn-primary">
              Tambah Lowongan
            </button>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Aktif"
            value={totalAktif}
            description="Lowongan yang tampil di halaman publik."
            icon="check"
          />
          <StatCard
            title="Nonaktif"
            value={totalNonaktif}
            description="Lowongan yang disembunyikan dari publik."
            icon="warning"
          />
          <StatCard
            title="Remote"
            value={totalRemote}
            description="Lowongan dengan sistem kerja remote."
            icon="briefcase"
          />
        </section>

        <section className="app-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_220px]">
            <div>
              <label className="app-label">Cari Lowongan</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari posisi, perusahaan, lokasi, jenis magang..."
              />
            </div>
            <div>
              <label className="app-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua Status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="app-label">Sistem Kerja</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua Sistem</option>
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
          </section>
        ) : (
          <section className="space-y-4">
            {filteredLowongan.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        {item.title}
                      </h2>
                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                      <span className={getTypeBadgeClass(item.type)}>
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.company} • {item.location || 'Menyesuaikan'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="app-btn-primary px-4 py-2 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      disabled={isSubmitting}
                      className="app-btn-secondary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      disabled={isSubmitting}
                      className="app-btn-danger px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Jenis Magang
                    </p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">
                      {getTipeKonversiLabel(item.tipeKonversi)}
                    </p>
                  </div>
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Kategori
                    </p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">
                      {item.kategori || '-'}
                    </p>
                  </div>
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Kuota
                    </p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">
                      {item.kuota || '-'}
                    </p>
                  </div>
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Berlaku Sampai
                    </p>
                    <p className="mt-1 font-black text-slate-950 dark:text-white">
                      {formatDate(item.valid_until)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={resetForm}
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white p-6 pr-16 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  {isEditMode ? 'Edit Lowongan' : 'Tambah Lowongan'}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {isEditMode ? form.posisi : 'Data Lowongan Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Pilih Mitra - WAJIB */}
              <div>
                <label className="app-label">
                  Pilih Mitra <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedMitraId}
                  onChange={(e) => handleMitraChange(e.target.value)}
                  className="app-input"
                  required
                >
                  <option value="" disabled>
                    -- Pilih mitra --
                  </option>
                  {mitraList.map((mitra) => (
                    <option key={mitra.id} value={mitra.id}>
                      {mitra.nama_mitra}
                    </option>
                  ))}
                </select>
                {mitraList.length === 0 && (
                  <p className="mt-1 text-sm text-red-500">
                    Belum ada mitra terdaftar. Silakan tambahkan mitra terlebih dahulu.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* Perusahaan - READONLY dari mitra */}
                <div>
                  <label className="app-label">Perusahaan</label>
                  <input
                    type="text"
                    value={form.perusahaan}
                    readOnly
                    className="app-input bg-slate-100 dark:bg-slate-800"
                  />
                </div>

                {/* Lokasi - READONLY dari mitra */}
                <div>
                  <label className="app-label">Lokasi</label>
                  <input
                    type="text"
                    value={form.location}
                    readOnly
                    className="app-input bg-slate-100 dark:bg-slate-800"
                  />
                </div>

                {/* Posisi - EDITABLE */}
                <div>
                  <label className="app-label">Posisi</label>
                  <input
                    type="text"
                    value={form.posisi}
                    onChange={(e) => handleChange('posisi', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Frontend Developer Intern"
                    required
                  />
                </div>

                {/* Kategori - EDITABLE */}
                <div>
                  <label className="app-label">Kategori</label>
                  <input
                    type="text"
                    value={form.kategori}
                    onChange={(e) => handleChange('kategori', e.target.value)}
                    className="app-input"
                    placeholder="IT, Administrasi, Data, UI/UX..."
                    required
                  />
                </div>

                {/* Sistem Kerja */}
                <div>
                  <label className="app-label">Sistem Kerja</label>
                  <select
                    value={form.type}
                    onChange={(e) => handleChange('type', e.target.value as JobType)}
                    className="app-input"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                {/* Jenis Magang */}
                <div>
                  <label className="app-label">Jenis Magang</label>
                  <select
                    value={form.tipeKonversi}
                    onChange={(e) =>
                      handleChange('tipeKonversi', e.target.value as JobTipeKonversi)
                    }
                    className="app-input"
                  >
                    <option value="Konversi 20 SKS">Konversi Maksimal 20 SKS</option>
                    <option value="Tidak Konversi">Tidak Konversi</option>
                    <option value="Konversi 2 SKS">Magang 2 SKS Khusus SI</option>
                  </select>
                </div>

                {/* Kuota */}
                <div>
                  <label className="app-label">Kuota</label>
                  <input
                    type="number"
                    min={1}
                    value={form.kuota}
                    onChange={(e) => handleChange('kuota', Number(e.target.value))}
                    className="app-input"
                  />
                </div>

                {/* Berlaku Sampai */}
                <div>
                  <label className="app-label">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={form.valid_until}
                    onChange={(e) => handleChange('valid_until', e.target.value)}
                    className="app-input"
                  />
                </div>

                {/* Link Pendaftaran - READONLY dari mitra (opsional override) */}
                <div>
                  <label className="app-label">Link Pendaftaran</label>
                  <input
                    type="url"
                    value={form.link_pendaftaran}
                    onChange={(e) => handleChange('link_pendaftaran', e.target.value)}
                    className="app-input"
                    placeholder="https://..."
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    Biarkan kosong jika menggunakan website mitra.
                  </p>
                </div>

                {/* Email Perusahaan - READONLY dari mitra (opsional override) */}
                <div>
                  <label className="app-label">Email Perusahaan</label>
                  <input
                    type="email"
                    value={form.email_perusahaan}
                    onChange={(e) => handleChange('email_perusahaan', e.target.value)}
                    className="app-input"
                    placeholder="hr@perusahaan.com"
                  />
                </div>

                {/* Paid? */}
                <div>
                  <label className="app-label">Paid?</label>
                  <select
                    value={form.isPaid ? 'Ya' : 'Tidak'}
                    onChange={(e) => handleChange('isPaid', e.target.value === 'Ya')}
                    className="app-input"
                  >
                    <option value="Tidak">Tidak</option>
                    <option value="Ya">Ya</option>
                  </select>
                </div>

                {/* Status (hanya untuk edit) */}
                {isEditMode && (
                  <div>
                    <label className="app-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) => handleChange('status', e.target.value as JobStatus)}
                      className="app-input"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="app-label">Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => handleChange('deskripsi', e.target.value)}
                  className="app-input min-h-36"
                  placeholder="Deskripsi pekerjaan, persyaratan, atau informasi tambahan."
                  required
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
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
                  className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}