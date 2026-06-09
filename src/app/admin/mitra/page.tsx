"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import {
  Mitra,
  activateMitra,
  createMitra,
  deactivateMitra,
  getAllMitraList,
  updateMitra,
} from '@/lib/mitra-client';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

type MitraForm = {
  id?: number;
  nama_mitra: string;
  logo: string;
  alamat: string;
  kontak_wa: string;
  email: string;
  website: string;
  deskripsi: string;
  status: 'Aktif' | 'Nonaktif';
};

const initialForm: MitraForm = {
  nama_mitra: '',
  logo: '',
  alamat: '',
  kontak_wa: '',
  email: '',
  website: '',
  deskripsi: '',
  status: 'Aktif',
};

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif') return 'app-badge app-badge-green';
  return 'app-badge app-badge-red';
}

export default function AdminMitraPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [form, setForm] = useState<MitraForm>(initialForm);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, data] = await Promise.all([
        getCurrentUserClient(),
        getAllMitraList(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setMitraList(data || []);
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal memuat data mitra.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMitra = useMemo(() => {
    const keyword = search.toLowerCase();

    return mitraList.filter((item) => {
      const nama = item.nama_mitra || '';
      const alamat = item.alamat || '';
      const email = item.email || '';
      const kontak = item.kontak_wa || '';

      const matchesKeyword =
        nama.toLowerCase().includes(keyword) ||
        alamat.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        kontak.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [mitraList, search, statusFilter]);

  const totalAktif = mitraList.filter((item) => item.status === 'Aktif').length;
  const totalNonaktif = mitraList.filter(
    (item) => item.status === 'Nonaktif'
  ).length;

  const handleChange = (field: keyof MitraForm, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openCreateForm = () => {
    setForm(initialForm);
    setShowForm(true);
    setMessage('');
    setErrorMsg('');
  };

  const openEditForm = (item: Mitra) => {
    setForm({
      id: item.id,
      nama_mitra: item.nama_mitra || '',
      logo: item.logo || '',
      alamat: item.alamat || '',
      kontak_wa: item.kontak_wa || '',
      email: item.email || '',
      website: item.website || '',
      deskripsi: item.deskripsi || '',
      status: item.status,
    });

    setShowForm(true);
    setMessage('');
    setErrorMsg('');
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(initialForm);
  };

  const validateForm = () => {
    if (!form.nama_mitra.trim()) {
      return 'Nama mitra wajib diisi.';
    }

    if (form.kontak_wa && !/^62\d{8,15}$/.test(form.kontak_wa)) {
      return 'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.';
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
      if (form.id) {
        const result = await updateMitra({
          id: form.id,
          nama_mitra: form.nama_mitra,
          logo: form.logo || null,
          alamat: form.alamat || null,
          kontak_wa: form.kontak_wa || null,
          email: form.email || null,
          website: form.website || null,
          deskripsi: form.deskripsi || null,
          status: form.status,
        });

        setMessage(result.message || 'Mitra berhasil diperbarui.');
      } else {
        const result = await createMitra({
          nama_mitra: form.nama_mitra,
          logo: form.logo || null,
          alamat: form.alamat || null,
          kontak_wa: form.kontak_wa || null,
          email: form.email || null,
          website: form.website || null,
          deskripsi: form.deskripsi || null,
        });

        setMessage(result.message || 'Mitra berhasil ditambahkan.');
      }

      closeForm();
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal menyimpan data mitra.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: Mitra) => {
    setMessage('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const result =
        item.status === 'Aktif'
          ? await deactivateMitra(item.id)
          : await activateMitra(item.id);

      setMessage(result.message || 'Status mitra berhasil diperbarui.');
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal mengubah status mitra.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="Admin">
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
    <DashboardShell role="Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Staff"
            title="Manajemen Mitra"
            description={`Kelola data mitra yang tampil pada landing page dan halaman daftar mitra. Halo, ${
              currentUser?.name || 'Admin'
            }.`}
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href="/admin/dashboard" className="app-btn-secondary">
                  Kembali
                </Link>

                <button
                  type="button"
                  onClick={openCreateForm}
                  className="app-btn-primary"
                >
                  Tambah Mitra
                </button>
              </div>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Total Mitra"
              value={mitraList.length}
              description="Seluruh data mitra di sistem."
              icon="briefcase"
            />

            <StatCard
              title="Mitra Aktif"
              value={totalAktif}
              description="Mitra yang tampil di halaman publik."
              icon="check"
            />

            <StatCard
              title="Nonaktif"
              value={totalNonaktif}
              description="Mitra yang disembunyikan dari halaman publik."
              icon="warning"
            />
          </section>

          <section className="app-card mb-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <div>
                <label className="app-label">Cari Mitra</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, alamat, email, atau kontak..."
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
            </div>
          </section>

          {filteredMitra.length === 0 ? (
            <section className="app-card p-8 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Data mitra tidak ditemukan.
              </p>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMitra.map((item) => (
                <article key={item.id} className="app-card app-card-hover p-6">
                  <div className="flex items-start gap-4">
                    {item.logo ? (
                      <img
                        src={item.logo}
                        alt={item.nama_mitra}
                        className="h-14 w-14 shrink-0 rounded-2xl object-contain"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                        {item.nama_mitra.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="break-words text-lg font-black text-slate-950 dark:text-white">
                          {item.nama_mitra}
                        </h2>

                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.alamat || 'Alamat belum tersedia'}
                      </p>
                    </div>
                  </div>

                  <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {item.deskripsi || 'Deskripsi belum tersedia.'}
                  </p>

                  <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
                    <p className="font-bold text-slate-600 dark:text-slate-300">
                      WA: {item.kontak_wa || '-'}
                    </p>
                    <p className="break-all font-bold text-slate-600 dark:text-slate-300">
                      Email: {item.email || '-'}
                    </p>
                    {item.website && (
                      <a
                        href={item.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                      >
                        Buka Website →
                      </a>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      className="app-btn-secondary px-4 py-2 text-sm"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleToggleStatus(item)}
                      className={
                        item.status === 'Aktif'
                          ? 'app-btn-danger px-4 py-2 text-sm disabled:opacity-60'
                          : 'app-btn-primary px-4 py-2 text-sm disabled:opacity-60'
                      }
                    >
                      {item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeForm}
            />

            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  {form.id ? 'Edit Mitra' : 'Tambah Mitra'}
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Data Mitra
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mitra</label>
                    <input
                      type="text"
                      value={form.nama_mitra}
                      onChange={(e) =>
                        handleChange('nama_mitra', e.target.value)
                      }
                      className="app-input"
                      placeholder="Nama perusahaan/instansi"
                    />
                  </div>

                  <div>
                    <label className="app-label">URL Logo</label>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => handleChange('logo', e.target.value)}
                      className="app-input"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="app-label">WhatsApp</label>
                    <input
                      type="text"
                      value={form.kontak_wa}
                      onChange={(e) =>
                        handleChange(
                          'kontak_wa',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      className="app-input"
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="app-label">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="app-input"
                      placeholder="email@mitra.com"
                    />
                  </div>

                  <div>
                    <label className="app-label">Website</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="app-input"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="app-label">Status</label>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        handleChange(
                          'status',
                          e.target.value as 'Aktif' | 'Nonaktif'
                        )
                      }
                      className="app-input"
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Alamat</label>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => handleChange('alamat', e.target.value)}
                      className="app-input min-h-24"
                      placeholder="Alamat mitra"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Deskripsi</label>
                    <textarea
                      value={form.deskripsi}
                      onChange={(e) =>
                        handleChange('deskripsi', e.target.value)
                      }
                      className="app-input min-h-32"
                      placeholder="Deskripsi singkat mitra"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Mitra'}
                  </button>

                  <button
                    type="button"
                    onClick={closeForm}
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
    </DashboardShell>
  );
}