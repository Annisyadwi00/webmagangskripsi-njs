"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Selesai') return 'app-badge app-badge-green';
  if (status === 'Aktif') return 'app-badge app-badge-blue';
  if (status === 'Ditolak') return 'app-badge app-badge-red';

  return 'app-badge app-badge-yellow';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return status || '-';
}

export default function DosenLaporanAkhirPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
      ]);

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setPengajuans(pengajuanData.items || []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat laporan akhir mahasiswa.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPengajuans = useMemo(() => {
  const keyword = search.toLowerCase();

  return pengajuans
    .filter((item) => item.status === 'Aktif' || item.status === 'Selesai')
    .filter((item) => {
      const matchesKeyword =
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        (item.npm || '').toLowerCase().includes(keyword) ||
        item.perusahaan.toLowerCase().includes(keyword) ||
        (item.program_studi || '').toLowerCase().includes(keyword);

      const hasReport = Boolean(item.link_laporan_akhir);

      const matchesFilter =
        filter === 'Semua' ||
        (filter === 'Sudah Upload' && hasReport) ||
        (filter === 'Belum Upload' && !hasReport);

      return matchesKeyword && matchesFilter;
    });
}, [pengajuans, search, filter]);

const mahasiswaBimbingan = pengajuans.filter(
  (item) => item.status === 'Aktif' || item.status === 'Selesai'
);

  const totalSudahUpload = mahasiswaBimbingan.filter(
  (item) => item.link_laporan_akhir
).length;

const totalBelumUpload = mahasiswaBimbingan.filter(
  (item) => !item.link_laporan_akhir
).length;

  if (isLoading) {
    return (
      <DashboardShell role="Dosen">
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

  if (errorMsg) {
    return (
      <DashboardShell role="Dosen">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <Alert variant="error">{errorMsg}</Alert>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Dosen">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Laporan Akhir"
            title="Laporan Akhir Mahasiswa"
description={`Lihat laporan akhir mahasiswa bimbingan yang sudah ditetapkan. ${user?.name ? `Dosen: ${user.name}` : ''}`}
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
  <Link href="/dosen/dashboard" className="app-btn-secondary">
    Kembali ke Dashboard
  </Link>

  <Link href="/dosen/penilaian" className="app-btn-primary">
    Input Penilaian
  </Link>
</div>
            }
          />

          {totalBelumUpload > 0 && (
            <Alert variant="warning">
              Ada {totalBelumUpload} mahasiswa bimbingan yang belum mengunggah laporan akhir.
            </Alert>
          )}

          <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="app-card p-5">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Total Mahasiswa
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {mahasiswaBimbingan.length}
              </p>
            </div>

            <div className="app-card p-5">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Sudah Upload
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {totalSudahUpload}
              </p>
            </div>

            <div className="app-card p-5">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Belum Upload
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {totalBelumUpload}
              </p>
            </div>
          </section>

          <section className="app-card mb-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <div>
                <label className="app-label">Cari Mahasiswa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, NPM, prodi, atau tempat magang..."
                />
              </div>

              <div>
                <label className="app-label">Filter Laporan</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="app-input"
                >
                  <option value="Semua">Semua</option>
                  <option value="Sudah Upload">Sudah Upload</option>
                  <option value="Belum Upload">Belum Upload</option>
                </select>
              </div>
            </div>
          </section>

          {filteredPengajuans.length === 0 ? (
            <section className="app-card p-8 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Data laporan akhir tidak ditemukan.
              </p>
            </section>
          ) : (
            <section className="space-y-4">
              {filteredPengajuans.map((item) => (
                <article key={item.id} className="app-card p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </h2>

                        <span className={getStatusBadgeClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        {item.npm || '-'} • {item.program_studi || '-'} •{' '}
                        {item.kelas || '-'}
                      </p>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.perusahaan} - {item.posisi}
                      </p>
                    </div>

                    {item.link_laporan_akhir ? (
                      <a
                        href={item.link_laporan_akhir}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-primary"
                      >
                        Buka Laporan
                      </a>
                    ) : (
                      <span className="app-badge app-badge-yellow">
                        Belum Upload
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Periode
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {item.tgl_mulai || '-'} sampai {item.tgl_berakhir || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Jenis Magang
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {item.jenis_magang || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-4">
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        Nilai Akhir
                      </p>
                      <p className="mt-1 font-black text-slate-950 dark:text-white">
                        {item.nilai_dari_dosen || 'Belum dinilai'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}