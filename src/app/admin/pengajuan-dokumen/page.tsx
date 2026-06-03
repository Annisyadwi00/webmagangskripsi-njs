"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  PengajuanDokumen,
  PengajuanDokumenStatus,
  getPengajuanDokumenList,
  updateStatusPengajuanDokumen,
} from '@/lib/pengajuan-dokumen-client';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Selesai') return 'app-badge app-badge-green';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
  if (status === 'Diproses') return 'app-badge app-badge-blue';

  return 'app-badge app-badge-yellow';
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

export default function AdminPengajuanDokumenPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [dokumens, setDokumens] = useState<PengajuanDokumen[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [selectedDokumen, setSelectedDokumen] =
    useState<PengajuanDokumen | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<PengajuanDokumenStatus>('Diproses');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [linkDokumen, setLinkDokumen] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, dokumenData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanDokumenList(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setDokumens(dokumenData);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan dokumen.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredDokumens = useMemo(() => {
    const keyword = search.toLowerCase();

    return dokumens.filter((item) => {
      const matchesKeyword =
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        item.npm.toLowerCase().includes(keyword) ||
        item.program_studi.toLowerCase().includes(keyword) ||
        item.jenis_dokumen.toLowerCase().includes(keyword) ||
        item.keperluan.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [dokumens, search, statusFilter]);

  const totalMenunggu = dokumens.filter(
    (item) => item.status === 'Menunggu'
  ).length;

  const totalDiproses = dokumens.filter(
    (item) => item.status === 'Diproses'
  ).length;

  const totalSelesai = dokumens.filter(
    (item) => item.status === 'Selesai'
  ).length;

  const openStatusModal = (
    item: PengajuanDokumen,
    status: PengajuanDokumenStatus
  ) => {
    setSelectedDokumen(item);
    setSelectedStatus(status);
    setCatatanAdmin(item.catatan_admin || '');
    setLinkDokumen(item.link_dokumen || '');
    setMessage('');
    setErrorMsg('');
  };

  const closeStatusModal = () => {
    setSelectedDokumen(null);
    setSelectedStatus('Diproses');
    setCatatanAdmin('');
    setLinkDokumen('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedDokumen) return;

    if (selectedStatus === 'Selesai' && !linkDokumen.trim()) {
      setErrorMsg('Link dokumen wajib diisi jika status Selesai.');
      return;
    }

    if (selectedStatus === 'Ditolak' && !catatanAdmin.trim()) {
      setErrorMsg('Catatan admin wajib diisi jika pengajuan ditolak.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await updateStatusPengajuanDokumen({
        id: selectedDokumen.id,
        status: selectedStatus,
        catatan_admin: catatanAdmin.trim() || null,
        link_dokumen: linkDokumen.trim() || null,
      });

      setMessage(
        result.message || 'Status pengajuan dokumen berhasil diperbarui.'
      );

      closeStatusModal();
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status pengajuan dokumen.';

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
    );
  }

  if (errorMsg && !message && !selectedDokumen) {
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
          eyebrow="Admin Dokumen"
          title={`Pengajuan Dokumen ${currentUser?.name || ''}`}
          description="Proses pengajuan dokumen magang mahasiswa. Dokumen dibuat manual oleh admin/TU, lalu link hasil dokumen dimasukkan ke sistem."
          action={
            <Link href="/admin/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {totalMenunggu > 0 && (
          <Alert variant="warning">
            Ada {totalMenunggu} pengajuan dokumen yang menunggu diproses.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Menunggu"
            value={totalMenunggu}
            description="Dokumen yang belum diproses."
            icon="clock"
          />

          <StatCard
            title="Diproses"
            value={totalDiproses}
            description="Dokumen yang sedang diproses admin/TU."
            icon="document"
          />

          <StatCard
            title="Selesai"
            value={totalSelesai}
            description="Dokumen yang sudah tersedia."
            icon="check"
          />
        </section>

        <section className="app-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <label className="app-label">Cari Pengajuan Dokumen</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari nama, NPM, jenis dokumen, atau keperluan..."
              />
            </div>

            <div>
              <label className="app-label">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Diproses">Diproses</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </section>

        {filteredDokumens.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Pengajuan dokumen tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredDokumens.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        {item.jenis_dokumen}
                      </h2>

                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.nama_mahasiswa} • {item.npm}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {item.program_studi} • {item.kelas}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {item.link_dokumen && (
                      <a
                        href={item.link_dokumen}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-secondary px-4 py-2 text-sm"
                      >
                        Buka Dokumen
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => openStatusModal(item, item.status)}
                      className="app-btn-primary px-4 py-2 text-sm"
                    >
                      Proses
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <DetailItem label="Nama" value={item.nama_mahasiswa} />
                  <DetailItem label="NPM" value={item.npm} />
                  <DetailItem label="Program Studi" value={item.program_studi} />
                  <DetailItem label="Kelas" value={item.kelas} />
                </div>

                <div className="app-panel mt-4 p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Keperluan
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {item.keperluan || '-'}
                  </p>
                </div>

                {item.catatan_mahasiswa && (
                  <div className="app-panel mt-4 p-4">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Catatan Mahasiswa
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {item.catatan_mahasiswa}
                    </p>
                  </div>
                )}

                {item.catatan_admin && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1e3a8a] dark:text-blue-300">
                      Catatan Admin
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {item.catatan_admin}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>

      {selectedDokumen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeStatusModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Proses Dokumen
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {selectedDokumen.jenis_dokumen}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pengaju: {selectedDokumen.nama_mahasiswa}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-5">
              <div>
                <label className="app-label">Status Pengajuan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as PengajuanDokumenStatus
                    )
                  }
                  className="app-input"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="app-label">
                  Link Dokumen{' '}
                  {selectedStatus === 'Selesai' ? '(Wajib)' : '(Opsional)'}
                </label>
                <input
                  type="url"
                  value={linkDokumen}
                  onChange={(e) => setLinkDokumen(e.target.value)}
                  className="app-input"
                  placeholder="https://drive.google.com/..."
                />
              </div>

              <div>
                <label className="app-label">
                  Catatan Admin{' '}
                  {selectedStatus === 'Ditolak' ? '(Wajib)' : '(Opsional)'}
                </label>
                <textarea
                  rows={5}
                  value={catatanAdmin}
                  onChange={(e) => setCatatanAdmin(e.target.value)}
                  className="app-input"
                  placeholder="Tambahkan catatan untuk mahasiswa..."
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                <p className="text-sm font-bold text-[#1e3a8a] dark:text-blue-300">
                  Catatan
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Sistem hanya mencatat pengajuan dan status dokumen. File resmi
                  tetap dibuat manual oleh admin/TU, lalu link Google Drive
                  dimasukkan saat dokumen selesai.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Status'}
                </button>

                <button
                  type="button"
                  onClick={closeStatusModal}
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