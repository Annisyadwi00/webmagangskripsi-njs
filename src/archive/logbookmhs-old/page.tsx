"use client";

import { useEffect, useState } from 'react';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import {
  Logbook,
  createLogbook,
  getLogbookList,
  updateLogbook,
} from '@/lib/logbook-client';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import DashboardShell from '@/components/dashboard/DashboardShell';

type LogbookForm = {
  pengajuan_id: string;
  tanggal: string;
  kegiatan: string;
  jam_mulai: string;
  jam_selesai: string;
  bukti_kegiatan: string;
};

const initialForm: LogbookForm = {
  pengajuan_id: '',
  tanggal: '',
  kegiatan: '',
  jam_mulai: '',
  jam_selesai: '',
  bukti_kegiatan: '',
};

function getStatusBadgeClass(status?: string) {
  if (status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

export default function LogbookMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [pengajuanAktif, setPengajuanAktif] = useState<Pengajuan | null>(null);

  const [form, setForm] = useState<LogbookForm>(initialForm);
  const [editingLogbookId, setEditingLogbookId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, logbookData, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getLogbookList(),
        getPengajuanList(1, 10),
      ]);

      if (currentUser.role !== 'Mahasiswa') {
  window.location.href = getDashboardPathByRole(currentUser.role);
  return;
}
      const activePengajuan =
        pengajuanData.items.find((item) => item.status === 'Aktif') || null;

      setUser(currentUser);
      setLogbooks(logbookData);
      setPengajuanAktif(activePengajuan);

      if (activePengajuan) {
        setForm((prev) => ({
          ...prev,
          pengajuan_id: String(activePengajuan.id),
        }));
      }
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data logbook.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      pengajuan_id: pengajuanAktif ? String(pengajuanAktif.id) : '',
    });
    setEditingLogbookId(null);
  };

  const handleEdit = (logbook: Logbook) => {
    setEditingLogbookId(logbook.id);
    setMessage('');
    setErrorMsg('');

    setForm({
      pengajuan_id: String(logbook.pengajuan_id),
      tanggal: logbook.tanggal,
      kegiatan: logbook.kegiatan,
      jam_mulai: logbook.jam_mulai,
      jam_selesai: logbook.jam_selesai,
      bukti_kegiatan: logbook.bukti_kegiatan || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      if (!form.pengajuan_id) {
        throw new Error('Pengajuan aktif tidak ditemukan.');
      }

      if (editingLogbookId) {
        const result = await updateLogbook({
          logbook_id: editingLogbookId,
          kegiatan: form.kegiatan,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          bukti_kegiatan: form.bukti_kegiatan || null,
        });

        setMessage(result.message || 'Logbook berhasil diperbarui.');
      } else {
        const result = await createLogbook({
          pengajuan_id: Number(form.pengajuan_id),
          tanggal: form.tanggal,
          kegiatan: form.kegiatan,
          jam_mulai: form.jam_mulai,
          jam_selesai: form.jam_selesai,
          bukti_kegiatan: form.bukti_kegiatan || null,
        });

        setMessage(result.message || 'Logbook berhasil disimpan.');
      }

      resetForm();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menyimpan logbook.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logbookMenunggu = logbooks.filter((item) => item.status === 'Menunggu');
  const logbookDisetujui = logbooks.filter(
    (item) => item.status === 'Disetujui'
  );
  const logbookRevisi = logbooks.filter((item) => item.status === 'Revisi');

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">

        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-2xl bg-slate-100"
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
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
        </div>
      </main>
    );
  }

  return (

    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Logbook Magang"
          title={`Logbook Harian ${user?.name || ''}`}
          description="Catat kegiatan magang harian, lampirkan bukti kegiatan, dan pantau evaluasi dari dosen pembimbing."
          action={
            <Link href="/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {!pengajuanAktif && (
          <Alert variant="warning">
            Kamu hanya bisa mengisi logbook setelah pengajuan magang berstatus
            Aktif.
          </Alert>
        )}

        {logbookRevisi.length > 0 && (
          <Alert variant="error">
            Ada {logbookRevisi.length} logbook yang perlu direvisi. Silakan
            periksa komentar dosen.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Total Logbook"
            value={logbooks.length}
            description="Jumlah logbook yang sudah dikirim."
            icon="book"
          />

          <StatCard
            title="Menunggu"
            value={logbookMenunggu.length}
            description="Logbook yang belum dievaluasi."
            icon="clock"
          />

          <StatCard
            title="Disetujui"
            value={logbookDisetujui.length}
            description={`${logbookRevisi.length} logbook perlu revisi.`}
            icon="check"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-1">
            <div className="mb-5">
              <h2 className="text-xl font-black text-slate-950">
                {editingLogbookId ? 'Edit Logbook' : 'Tambah Logbook'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Isi aktivitas harian dengan jelas dan ringkas.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="hidden"
                name="pengajuan_id"
                value={form.pengajuan_id}
              />

              {!editingLogbookId && (
                <div>
                  <label className="app-label">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    name="tanggal"
                    required
                    disabled={!pengajuanAktif}
                    value={form.tanggal}
                    onChange={handleChange}
                    className="app-input disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="app-label">Kegiatan</label>
                <textarea
                  name="kegiatan"
                  required
                  rows={5}
                  disabled={!pengajuanAktif}
                  value={form.kegiatan}
                  onChange={handleChange}
                  className="app-input disabled:cursor-not-allowed disabled:bg-slate-100"
                  placeholder="Jelaskan kegiatan yang dilakukan hari ini..."
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="app-label">Jam Mulai</label>
                  <input
                    type="time"
                    name="jam_mulai"
                    required
                    disabled={!pengajuanAktif}
                    value={form.jam_mulai}
                    onChange={handleChange}
                    className="app-input disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="app-label">Jam Selesai</label>
                  <input
                    type="time"
                    name="jam_selesai"
                    required
                    disabled={!pengajuanAktif}
                    value={form.jam_selesai}
                    onChange={handleChange}
                    className="app-input disabled:cursor-not-allowed disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="app-label">Link Bukti Kegiatan</label>
                <input
                  type="url"
                  name="bukti_kegiatan"
                  disabled={!pengajuanAktif}
                  value={form.bukti_kegiatan}
                  onChange={handleChange}
                  className="app-input disabled:cursor-not-allowed disabled:bg-slate-100"
                  placeholder="https://drive.google.com/..."
                />
                <p className="mt-2 text-xs text-slate-500">
                  Gunakan link Google Drive atau dokumentasi lain yang dapat
                  diakses dosen.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={!pengajuanAktif || isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting
                    ? 'Menyimpan...'
                    : editingLogbookId
                      ? 'Simpan Perubahan'
                      : 'Tambah Logbook'}
                </button>

                {editingLogbookId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="app-btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Riwayat Logbook
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Semua aktivitas magang yang sudah kamu kirim.
                </p>
              </div>
            </div>

            {logbooks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">Belum ada logbook.</p>
                <p className="mt-2 text-sm text-slate-500">
                  Logbook akan muncul setelah kamu mengisi aktivitas pertama.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logbooks.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-black text-slate-950">
                          {item.tanggal}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.jam_mulai} - {item.jam_selesai}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-slate-700">
                      {item.kegiatan}
                    </p>

                    {item.komentar_dosen && (
                      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                          Komentar Dosen
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {item.komentar_dosen}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      {item.bukti_kegiatan && (
                        <a
                          href={item.bukti_kegiatan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-btn-secondary flex-1"
                        >
                          Lihat Bukti
                        </a>
                      )}

                      {(item.status === 'Revisi' ||
                        item.status === 'Menunggu') && (
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="app-btn-primary flex-1"
                          >
                            Edit Logbook
                          </button>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}