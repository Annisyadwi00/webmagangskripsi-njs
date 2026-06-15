"use client";

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import {
  Mitra,
  MitraStatus,
  activateMitra,
  deactivateMitra,
  getAllMitraList,
} from '@/lib/mitra-client';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

type MitraForm = {
  id?: number;
  nama_mitra: string;
  url_mitra: string;          // website
  alamat_kantor_mitra: string;
  latitude: string;
  longitude: string;
  nama_narahubung_mitra: string;
  kontak_narahubung_mitra: string;  // WhatsApp
  email_perusahaan: string;
  logo: string;
  deskripsi: string;
  status: MitraStatus;
};

const initialForm: MitraForm = {
  nama_mitra: '',
  url_mitra: '',
  alamat_kantor_mitra: '',
  latitude: '',
  longitude: '',
  nama_narahubung_mitra: '',
  kontak_narahubung_mitra: '',
  email_perusahaan: '',
  logo: '',
  deskripsi: '',
  status: 'Aktif',
};

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif') return 'app-badge app-badge-green';
  return 'app-badge app-badge-red';
}

function isValidUrl(value: string) {
  if (!value) return true;
  try { new URL(value); return true; } catch { return false; }
}

function isValidEmail(value: string) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

  // State untuk file-file (sama seperti ajukan mitra)
  const [aktaPendirianFile, setAktaPendirianFile] = useState<File | null>(null);
  const [aktaDireksiFile, setAktaDireksiFile] = useState<File | null>(null);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [npwpFile, setNpwpFile] = useState<File | null>(null);
  const [izinUsahaFile, setIzinUsahaFile] = useState<File | null>(null);

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
      const msg = error instanceof Error ? error.message : 'Gagal memuat data mitra.';
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
      const alamat = item.alamat_kantor_mitra || '';
      const email = item.email_perusahaan || '';
      const kontak = item.kontak_narahubung_mitra || '';
      const website = item.url_mitra || '';
      const matchesKeyword = [nama, alamat, email, kontak, website].some(f => f.toLowerCase().includes(keyword));
      const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;
      return matchesKeyword && matchesStatus;
    });
  }, [mitraList, search, statusFilter]);

  const totalAktif = mitraList.filter((item) => item.status === 'Aktif').length;
  const totalNonaktif = mitraList.filter((item) => item.status === 'Nonaktif').length;

  const handleChange = (field: keyof MitraForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetFiles = () => {
    setAktaPendirianFile(null);
    setAktaDireksiFile(null);
    setKtpFile(null);
    setNpwpFile(null);
    setIzinUsahaFile(null);
  };

  const openCreateForm = () => {
    setForm(initialForm);
    resetFiles();
    setShowForm(true);
    setMessage('');
    setErrorMsg('');
  };

  const openEditForm = (item: Mitra) => {
    setForm({
      id: item.id,
      nama_mitra: item.nama_mitra || '',
      url_mitra: item.url_mitra || '',
      alamat_kantor_mitra: item.alamat_kantor_mitra || '',
      latitude: item.latitude?.toString() || '',
      longitude: item.longitude?.toString() || '',
      nama_narahubung_mitra: item.nama_narahubung_mitra || '',
      kontak_narahubung_mitra: item.kontak_narahubung_mitra || '',
      email_perusahaan: item.email_perusahaan || '',
      logo: item.logo || '',
      deskripsi: item.deskripsi || '',
      status: item.status,
    });
    resetFiles(); // file tidak diisi ulang, biarkan admin upload jika perlu ganti
    setShowForm(true);
    setMessage('');
    setErrorMsg('');
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(initialForm);
    resetFiles();
  };

  const validateForm = () => {
    if (!form.nama_mitra.trim()) return 'Nama mitra wajib diisi.';
    if (!form.alamat_kantor_mitra.trim()) return 'Alamat kantor mitra wajib diisi.';
    if (!form.latitude.trim()) return 'Latitude wajib diisi.';
    if (!form.longitude.trim()) return 'Longitude wajib diisi.';
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) return 'Latitude tidak valid (rentang -90 sampai 90).';
    if (isNaN(lng) || lng < -180 || lng > 180) return 'Longitude tidak valid (rentang -180 sampai 180).';
    if (!form.nama_narahubung_mitra.trim()) return 'Nama narahubung wajib diisi.';
    if (!form.kontak_narahubung_mitra.trim()) return 'Nomor WhatsApp narahubung wajib diisi.';
    if (!/^62\d{8,15}$/.test(form.kontak_narahubung_mitra)) return 'Nomor WhatsApp harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.';
    if (!form.email_perusahaan.trim()) return 'Email perusahaan wajib diisi.';
    if (!isValidEmail(form.email_perusahaan)) return 'Format email tidak valid.';
    if (form.url_mitra && !isValidUrl(form.url_mitra)) return 'Format website tidak valid.';
    if (form.logo && !isValidUrl(form.logo)) return 'Format URL logo tidak valid.';
    // File tidak wajib, opsional
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
      const formData = new FormData();
      // Append semua field text
      formData.append('nama_mitra', form.nama_mitra.trim());
      formData.append('url_mitra', form.url_mitra.trim() || '');
      formData.append('alamat_kantor_mitra', form.alamat_kantor_mitra.trim());
      formData.append('latitude', form.latitude.trim());
      formData.append('longitude', form.longitude.trim());
      formData.append('nama_narahubung_mitra', form.nama_narahubung_mitra.trim());
      formData.append('kontak_narahubung_mitra', form.kontak_narahubung_mitra.trim());
      formData.append('email_perusahaan', form.email_perusahaan.trim());
      formData.append('logo', form.logo.trim() || '');
      formData.append('deskripsi', form.deskripsi.trim() || '');
      if (form.id) formData.append('id', String(form.id));
      if (form.id && form.status) formData.append('status', form.status);

      // Append file jika ada
      if (aktaPendirianFile) formData.append('akta_pendirian', aktaPendirianFile);
      if (aktaDireksiFile) formData.append('akta_direksi', aktaDireksiFile);
      if (ktpFile) formData.append('ktp_penandatangan', ktpFile);
      if (npwpFile) formData.append('npwp_perusahaan', npwpFile);
      if (izinUsahaFile) formData.append('izin_usaha', izinUsahaFile);

      const url = '/api/mitra';
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, body: formData });
      const result = await res.json();

      if (!res.ok) throw new Error(result.message || 'Gagal menyimpan mitra');

      setMessage(result.message || (form.id ? 'Mitra berhasil diperbarui.' : 'Mitra berhasil ditambahkan.'));
      closeForm();
      await fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal menyimpan data mitra.';
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
      const result = item.status === 'Aktif' ? await deactivateMitra(item.id) : await activateMitra(item.id);
      setMessage(result.message || 'Status mitra berhasil diperbarui.');
      await fetchData();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Gagal mengubah status mitra.';
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
          title="Manajemen Mitra"
          description={`Kelola data mitra dan dokumen pendukung. Halo, ${currentUser?.name || 'Admin'}.`}
          action={
            <button type="button" onClick={openCreateForm} className="app-btn-primary">
              Tambah Mitra
            </button>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard title="Total Mitra" value={mitraList.length} description="Seluruh data mitra di sistem." icon="briefcase" />
          <StatCard title="Mitra Aktif" value={totalAktif} description="Mitra yang tampil di halaman publik." icon="check" />
          <StatCard title="Nonaktif" value={totalNonaktif} description="Mitra yang disembunyikan dari halaman publik." icon="warning" />
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
                placeholder="Cari nama, alamat, email, website, atau kontak..."
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
            <p className="font-bold text-slate-700 dark:text-slate-300">Data mitra tidak ditemukan.</p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMitra.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="flex items-start gap-4">
                  {item.logo ? (
                    <img src={item.logo} alt={item.nama_mitra} className="h-14 w-14 shrink-0 rounded-2xl object-contain" />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                      {item.nama_mitra.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="break-words text-lg font-black text-slate-950 dark:text-white">{item.nama_mitra}</h2>
                      <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {item.alamat_kantor_mitra || 'Alamat belum tersedia'}
                    </p>
                  </div>
                </div>
                <p className="mt-5 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {item.deskripsi || 'Deskripsi belum tersedia.'}
                </p>
                <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm dark:bg-slate-800/70">
                  <p className="font-bold text-slate-600 dark:text-slate-300">WA: {item.kontak_narahubung_mitra || '-'}</p>
                  <p className="break-all font-bold text-slate-600 dark:text-slate-300">Email: {item.email_perusahaan || '-'}</p>
                  <p className="break-all font-bold text-slate-600 dark:text-slate-300">Website: {item.url_mitra || '-'}</p>
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  {item.url_mitra && (
                    <a href={item.url_mitra} target="_blank" rel="noopener noreferrer" className="app-btn-secondary flex-1 text-center">
                      Website
                    </a>
                  )}
                  <button type="button" onClick={() => openEditForm(item)} className="app-btn-primary flex-1">Edit</button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(item)}
                    disabled={isSubmitting}
                    className={`${item.status === 'Aktif' ? 'app-btn-danger' : 'app-btn-secondary'} flex-1 disabled:cursor-not-allowed disabled:opacity-60`}
                  >
                    {item.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {/* Modal Form dengan upload file (sama seperti ajukan mitra) */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={closeForm} />
          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  {form.id ? 'Edit Mitra' : 'Tambah Mitra'}
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {form.id ? form.nama_mitra : 'Data Mitra Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-xl font-black text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                aria-label="Tutup modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Data Perusahaan */}
              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Data Perusahaan</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mitra/Perusahaan</label>
                    <input
                      type="text"
                      value={form.nama_mitra}
                      onChange={(e) => handleChange('nama_mitra', e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="app-label">Website Perusahaan</label>
                    <input
                      type="url"
                      value={form.url_mitra}
                      onChange={(e) => handleChange('url_mitra', e.target.value)}
                      className="app-input"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="app-label">Alamat Kantor</label>
                    <textarea
                      value={form.alamat_kantor_mitra}
                      onChange={(e) => handleChange('alamat_kantor_mitra', e.target.value)}
                      className="app-input min-h-28"
                      required
                    />
                  </div>
                  <div>
                    <label className="app-label">Latitude</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.latitude}
                      onChange={(e) => handleChange('latitude', e.target.value.replace(/[^0-9.-]/g, ''))}
                      className="app-input"
                      placeholder="Contoh: -6.200000"
                      required
                    />
                  </div>
                  <div>
                    <label className="app-label">Longitude</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={form.longitude}
                      onChange={(e) => handleChange('longitude', e.target.value.replace(/[^0-9.-]/g, ''))}
                      className="app-input"
                      placeholder="Contoh: 106.816666"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Narahubung */}
              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Narahubung</h3>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label className="app-label">Nama Narahubung</label>
                    <input
                      type="text"
                      value={form.nama_narahubung_mitra}
                      onChange={(e) => handleChange('nama_narahubung_mitra', e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="app-label">WhatsApp</label>
                    <input
                      type="text"
                      value={form.kontak_narahubung_mitra}
                      onChange={(e) => handleChange('kontak_narahubung_mitra', e.target.value.replace(/[^0-9]/g, ''))}
                      className="app-input"
                      placeholder="628xxxxxxxxxx"
                      required
                    />
                  </div>
                  <div>
                    <label className="app-label">Email Perusahaan</label>
                    <input
                      type="email"
                      value={form.email_perusahaan}
                      onChange={(e) => handleChange('email_perusahaan', e.target.value)}
                      className="app-input"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Dokumen Pendukung (Upload File) - Sama seperti ajukan mitra */}
              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Dokumen Pendukung (PDF)</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Unggah file PDF untuk melengkapi data mitra. Kosongkan jika tidak ada perubahan.
                </p>
                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Akta Pendirian</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setAktaPendirianFile(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                  <div>
                    <label className="app-label">Akta Susunan Direksi</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setAktaDireksiFile(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                  <div>
                    <label className="app-label">KTP Penandatangan</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setKtpFile(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                  <div>
                    <label className="app-label">NPWP Perusahaan</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setNpwpFile(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="app-label">Izin Usaha Terkait</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setIzinUsahaFile(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                </div>
              </section>

              {/* Logo & Deskripsi */}
              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">Informasi Tambahan</h3>
                <div className="mt-5 space-y-5">
                  <div>
                    <label className="app-label">URL Logo (opsional)</label>
                    <input
                      type="url"
                      value={form.logo}
                      onChange={(e) => handleChange('logo', e.target.value)}
                      className="app-input"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="app-label">Deskripsi (opsional)</label>
                    <textarea
                      value={form.deskripsi}
                      onChange={(e) => handleChange('deskripsi', e.target.value)}
                      className="app-input min-h-32"
                      placeholder="Deskripsi singkat mitra"
                    />
                  </div>
                </div>
              </section>

              {form.id && (
                <section>
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">Status</h3>
                  <select
                    value={form.status}
                    onChange={(e) => handleChange('status', e.target.value as MitraStatus)}
                    className="app-input mt-2"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Nonaktif">Nonaktif</option>
                  </select>
                </section>
              )}

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                <button type="submit" disabled={isSubmitting} className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
                  {isSubmitting ? 'Menyimpan...' : form.id ? 'Simpan Perubahan' : 'Tambah Mitra'}
                </button>
                <button type="button" onClick={closeForm} disabled={isSubmitting} className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60">
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