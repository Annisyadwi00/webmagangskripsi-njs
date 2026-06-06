"use client";

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { Lowongan, getAllLowonganList } from '@/lib/lowongan-client';

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

export default function AdminLowonganPage() {
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [selectedLowongan, setSelectedLowongan] = useState<Lowongan | null>(
    null
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [typeFilter, setTypeFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLowongan = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const data = await getAllLowonganList();
      setLowongan(data || []);
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
        item.kategori.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword);

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

  return (
    <DashboardShell role="Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Admin Lowongan"
            title="Data Lowongan Magang"
            description="Lihat data lowongan magang yang tampil pada sistem. Pengelolaan lowongan dilakukan oleh staff berwenang."
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <Alert variant="info">
            Halaman ini bersifat read-only. Admin/Staff TU hanya dapat melihat
            data lowongan, sedangkan tambah, edit, nonaktifkan, dan hapus
            lowongan dilakukan oleh staff berwenang.
          </Alert>

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Lowongan Aktif"
              value={totalAktif}
              description="Lowongan yang sedang tampil untuk pengguna."
              icon="briefcase"
            />

            <StatCard
              title="Nonaktif"
              value={totalNonaktif}
              description="Lowongan yang sedang disembunyikan."
              icon="warning"
            />

            <StatCard
              title="Remote"
              value={totalRemote}
              description="Lowongan dengan sistem kerja remote."
              icon="document"
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
                <label className="app-label">Sistem Kerja</label>
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
                Coba ubah kata kunci pencarian atau filter yang dipilih.
              </p>
            </section>
          ) : (
            <section className="app-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-black">Lowongan</th>
                      <th className="px-5 py-4 font-black">Perusahaan</th>
                      <th className="px-5 py-4 font-black">Sistem</th>
                      <th className="px-5 py-4 font-black">Konversi</th>
                      <th className="px-5 py-4 font-black">Status</th>
                      <th className="px-5 py-4 font-black">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredLowongan.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.location || '-'} • Kuota {item.kuota}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {item.company}
                        </td>

                        <td className="px-5 py-4">
                          <span className={getTypeBadgeClass(item.type)}>
                            {item.type}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="app-badge app-badge-blue">
                            {item.tipeKonversi}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={getStatusBadgeClass(item.status)}>
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedLowongan(item)}
                            className="app-btn-secondary px-4 py-2 text-xs"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        {selectedLowongan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSelectedLowongan(null)}
            />

            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Detail Lowongan
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {selectedLowongan.title}
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedLowongan.company} • {selectedLowongan.location}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Sistem Kerja
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {selectedLowongan.type}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Tipe Konversi
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {selectedLowongan.tipeKonversi}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {selectedLowongan.status}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Kuota
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {selectedLowongan.kuota} mahasiswa
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Benefit
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {selectedLowongan.isPaid ? 'Paid' : 'Unpaid'}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Batas Pendaftaran
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {formatDate(selectedLowongan.valid_until)}
                  </p>
                </div>
              </div>

              <div className="app-panel mt-5 p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Deskripsi
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
                  {selectedLowongan.description}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {selectedLowongan.link_pendaftaran && (
                  <a
                    href={selectedLowongan.link_pendaftaran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn-primary flex-1"
                  >
                    Buka Link Pendaftaran
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedLowongan(null)}
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