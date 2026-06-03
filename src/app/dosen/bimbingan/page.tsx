"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { Logbook, getLogbookList } from '@/lib/logbook-client';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Disetujui' || status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu' || status === 'Menunggu_Verifikasi') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Disetujui') return 'Disetujui';
  if (status === 'Menunggu') return 'Menunggu';
  if (status === 'Revisi') return 'Revisi';

  return status || '-';
}

export default function DosenBimbinganPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [currentUser, pengajuanData, logbookData] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanList(1, 100),
          getLogbookList(),
        ]);

        if (currentUser.role !== 'Dosen') {
          window.location.href = getDashboardPathByRole(currentUser.role);
          return;
        }

        setUser(currentUser);
        setPengajuans(pengajuanData?.items || []);
        setLogbooks(logbookData || []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat data bimbingan dosen.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const mahasiswaAktif = pengajuans.filter(
    (item) => item.status_dosen === 'Disetujui' && item.status === 'Aktif'
  );

  const mahasiswaSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const belumDinilai = pengajuans.filter(
    (item) =>
      item.status_dosen === 'Disetujui' &&
      item.status === 'Aktif' &&
      !item.nilai_dari_dosen
  );

  const logbookMenunggu = logbooks.filter(
    (item) => item.status === 'Menunggu'
  );

  const filteredPengajuans = useMemo(() => {
    const keyword = search.toLowerCase();

    return pengajuans.filter((item) => {
      const matchesKeyword =
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        item.perusahaan.toLowerCase().includes(keyword) ||
        item.posisi.toLowerCase().includes(keyword) ||
        (item.npm || '').toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [pengajuans, search, statusFilter]);

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
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

  if (errorMsg) {
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
          eyebrow="Bimbingan Magang"
          title={`Mahasiswa Bimbingan ${user?.name || ''}`}
          description="Daftar mahasiswa magang yang telah ditetapkan oleh admin/koorprodi sebagai bimbingan dosen."
          action={
            <Link href="/dosen/logbook" className="app-btn-primary">
              Evaluasi Logbook
            </Link>
          }
        />

        {pengajuans.length === 0 && (
          <Alert variant="info">
            Belum ada mahasiswa bimbingan yang ditetapkan untuk akun dosen ini.
          </Alert>
        )}

        {logbookMenunggu.length > 0 && (
          <Alert variant="info">
            Ada {logbookMenunggu.length} logbook mahasiswa yang menunggu
            evaluasi.
          </Alert>
        )}

        {belumDinilai.length > 0 && (
          <Alert variant="warning">
            Ada {belumDinilai.length} mahasiswa aktif yang belum memiliki nilai
            akhir.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Total Bimbingan"
            value={pengajuans.length}
            description="Mahasiswa yang ditetapkan sebagai bimbingan."
            icon="users"
          />

          <StatCard
            title="Magang Aktif"
            value={mahasiswaAktif.length}
            description="Mahasiswa yang sedang menjalankan magang."
            icon="briefcase"
          />

          <StatCard
            title="Belum Dinilai"
            value={belumDinilai.length}
            description="Mahasiswa aktif tanpa nilai akhir."
            icon="chart"
          />

          <StatCard
            title="Selesai"
            value={mahasiswaSelesai.length}
            description="Mahasiswa yang sudah selesai magang."
            icon="check"
          />
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
                placeholder="Cari nama, NPM, tempat magang, atau posisi..."
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
                <option value="Aktif">Aktif</option>
                <option value="Selesai">Selesai</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>
        </section>

        {filteredPengajuans.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Data bimbingan tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau filter status.
            </p>
          </section>
        ) : (
          <section className="space-y-4">
            {filteredPengajuans.map((item) => (
              <article
                key={item.id}
                className="app-card app-card-hover p-6"
              >
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

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link
                      href={`/dosen/bimbingan/${item.id}`}
                      className="app-btn-secondary px-4 py-2 text-sm"
                    >
                      Detail
                    </Link>

                    <Link
                      href="/dosen/logbook"
                      className="app-btn-primary px-4 py-2 text-sm"
                    >
                      Evaluasi Logbook
                    </Link>

                    <Link
                      href="/dosen/penilaian"
                      className="app-btn-secondary px-4 py-2 text-sm"
                    >
                      Input Nilai
                    </Link>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div className="app-panel p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Jenis Magang
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.jenis_magang || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Mulai
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.tgl_mulai || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Selesai
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.tgl_berakhir || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Nilai
                    </p>
                    <p className="mt-1 font-bold text-slate-950 dark:text-white">
                      {item.nilai_dari_dosen || 'Belum dinilai'}
                    </p>
                  </div>
                </div>

                {item.rencana_magang && (
                  <div className="app-panel mt-4 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Rencana Magang
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {item.rencana_magang}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}