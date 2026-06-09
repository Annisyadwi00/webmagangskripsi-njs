"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  PengajuanMitra,
  PengajuanMitraStatus,
  getPengajuanMitraList,
  updateStatusPengajuanMitra,
} from '@/lib/pengajuan-mitra-client';
import DashboardShell from '@/components/dashboard/DashboardShell';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Disetujui') return 'app-badge app-badge-green';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
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
function DocumentButton({
  label,
  href,
}: {
  label: string;
  href?: string | null;
}) {
  if (!href) {
    return (
      <button
        type="button"
        disabled
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-400 dark:border-slate-700 dark:bg-slate-800"
      >
        {label} Belum Ada
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#1e3a8a] transition hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:border-blue-400/40"
    >
      Buka {label}
    </a>
  );
}
export default function AdminPengajuanMitraPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuanMitra, setPengajuanMitra] = useState<PengajuanMitra[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [selectedMitra, setSelectedMitra] = useState<PengajuanMitra | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] =
    useState<PengajuanMitraStatus>('Disetujui');
  const [catatanAdmin, setCatatanAdmin] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, mitraData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanMitraList(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setPengajuanMitra(mitraData);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan mitra.';

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

    return pengajuanMitra.filter((item) => {
      const namaMitra = item.nama_mitra || '';
const narahubung = item.nama_narahubung_mitra || '';
const mahasiswa = item.nama_mahasiswa_pengusul || '';
const npm = item.npm_mahasiswa_pengusul || '';
const prodi = item.program_studi_mahasiswa || '';
const lokasi = item.lokasi || '';

const matchesKeyword =
  namaMitra.toLowerCase().includes(keyword) ||
  narahubung.toLowerCase().includes(keyword) ||
  mahasiswa.toLowerCase().includes(keyword) ||
  npm.toLowerCase().includes(keyword) ||
  prodi.toLowerCase().includes(keyword) ||
  lokasi.toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [pengajuanMitra, search, statusFilter]);

  const totalMenunggu = pengajuanMitra.filter(
    (item) => item.status === 'Menunggu'
  ).length;

  const totalDisetujui = pengajuanMitra.filter(
    (item) => item.status === 'Disetujui'
  ).length;

  const totalDitolak = pengajuanMitra.filter(
    (item) => item.status === 'Ditolak'
  ).length;

  const openStatusModal = (
    item: PengajuanMitra,
    status: PengajuanMitraStatus
  ) => {
    setSelectedMitra(item);
    setSelectedStatus(status);
    setCatatanAdmin(item.catatan_admin || '');
    setMessage('');
    setErrorMsg('');
  };

  const closeStatusModal = () => {
    setSelectedMitra(null);
    setSelectedStatus('Disetujui');
    setCatatanAdmin('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMitra) return;

    if (selectedStatus === 'Ditolak' && !catatanAdmin.trim()) {
      setErrorMsg('Catatan admin wajib diisi jika pengajuan ditolak.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await updateStatusPengajuanMitra({
        id: selectedMitra.id,
        status: selectedStatus,
        catatan_admin: catatanAdmin.trim() || null,
      });

      setMessage(
        result.message || 'Status pengajuan mitra berhasil diperbarui.'
      );

      closeStatusModal();
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memperbarui status pengajuan mitra.';

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

  if (errorMsg && !message && !selectedMitra) {
    return (
      <DashboardShell role="Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
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
          eyebrow="Admin Mitra"
          title={`Verifikasi Pengajuan Mitra ${currentUser?.name || ''}`}
          description="Periksa pengajuan mitra dari mahasiswa, lalu setujui atau tolak berdasarkan kelayakan data mitra."
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
            Ada {totalMenunggu} pengajuan mitra yang menunggu verifikasi.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Menunggu"
            value={totalMenunggu}
            description="Pengajuan mitra yang perlu diverifikasi."
            icon="clock"
          />

          <StatCard
            title="Disetujui"
            value={totalDisetujui}
            description="Mitra yang sudah disetujui staff."
            icon="check"
          />

          <StatCard
            title="Ditolak"
            value={totalDitolak}
            description="Pengajuan mitra yang tidak disetujui."
            icon="warning"
            />
        </section>

        <section className="app-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <label className="app-label">Cari Pengajuan Mitra</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari mitra, narahubung, mahasiswa, NPM, atau prodi..."
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
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </section>

        {filteredMitra.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Pengajuan mitra tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredMitra.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        {item.nama_mitra}
                      </h2>

                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Pengusul: {item.nama_mahasiswa_pengusul} •{' '}
                      {item.npm_mahasiswa_pengusul}
                    </p>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Narahubung: {item.nama_narahubung_mitra} •{' '}
                      {item.kontak_narahubung_mitra}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    {item.url_mitra && (
                      <a
                        href={item.url_mitra}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-secondary px-4 py-2 text-sm"
                      >
                        Buka URL
                      </a>
                    )}

                    {item.status === 'Menunggu' && (
                      <>
                        <button
                          type="button"
                          onClick={() => openStatusModal(item, 'Disetujui')}
                          className="app-btn-primary px-4 py-2 text-sm"
                        >
                          Setujui
                        </button>

                        <button
                          type="button"
                          onClick={() => openStatusModal(item, 'Ditolak')}
                          className="app-btn-danger px-4 py-2 text-sm"
                        >
                          Tolak
                        </button>
                      </>
                    )}

                    {item.status !== 'Menunggu' && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(item, item.status)}
                        className="app-btn-secondary px-4 py-2 text-sm"
                      >
                        Ubah Status
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <DetailItem
                    label="Program Studi"
                    value={item.program_studi_mahasiswa}
                  />
                  <DetailItem
                    label="Angkatan"
                    value={item.angkatan_mahasiswa}
                  />
                  <DetailItem label="Kelas" value={item.kelas} />
                  <DetailItem
                    label="Kontak Mahasiswa"
                    value={item.kontak_mahasiswa}
                  />
                  <DetailItem
                    label="Kontak Mitra"
                    value={item.kontak_narahubung_mitra}
                  />
                  <DetailItem label="Status" value={item.status} />
                  <DetailItem label="Lokasi" value={item.lokasi} />
<DetailItem label="Sistem Kerja" value={item.sistem_kerja} />
<DetailItem label="Kuota" value={item.kuota} />
<DetailItem label="Email PIC" value={item.email_pic} />
                </div>

                <div className="app-panel mt-4 p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Alamat Kantor Mitra
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {item.alamat_kantor_mitra || '-'}
                  </p>
                </div>
                
<div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
  <div className="app-panel p-4">
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
      Deskripsi Lowongan
    </p>
    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
      {item.deskripsi_lowongan || '-'}
    </p>
  </div>

  <div className="app-panel p-4">
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
      Persyaratan
    </p>
    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
      {item.persyaratan || '-'}
    </p>
  </div>
</div>
<div className="app-panel mt-4 p-4">
  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
    Dokumen Pendukung
  </p>

  <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
    <DocumentButton
      label="Akta Pendirian"
      href={item.link_akta_pendirian}
    />
    <DocumentButton
      label="Akta Direksi"
      href={item.link_akta_direksi}
    />
    <DocumentButton
      label="KTP Penandatangan"
      href={item.link_ktp_penandatangan}
    />
    <DocumentButton label="NPWP" href={item.link_npwp} />
    <DocumentButton
      label="Izin Usaha"
      href={item.link_izin_usaha}
    />
  </div>
</div>
                {item.catatan_admin && (
                  <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                    <p className="text-xs font-black uppercase tracking-wide text-[#1e3a8a] dark:text-blue-300">
                      Catatan Staff
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

      {selectedMitra && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeStatusModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Verifikasi Mitra
              </p>

              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {selectedMitra.nama_mitra}
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pengusul: {selectedMitra.nama_mahasiswa_pengusul}
              </p>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-5">
              <div>
                <label className="app-label">Status Pengajuan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(e.target.value as PengajuanMitraStatus)
                  }
                  className="app-input"
                >
                  <option value="Menunggu">Menunggu</option>
                  <option value="Disetujui">Disetujui</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>

              <div>
                <label className="app-label">
                  Catatan Staff{' '}
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
                  Jika disetujui, data mitra dapat dijadikan referensi oleh
                  admin/TU untuk proses kerja sama atau dokumen pendukung.
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
                  </DashboardShell>
  );
}