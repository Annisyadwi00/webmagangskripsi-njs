"use client";

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return status || '-';
}

function getPercent(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function getStatusClass(status: string) {
  if (status === 'Aktif') return 'bg-green-500';
  if (status === 'Selesai') return 'bg-blue-500';
  if (status === 'Ditolak') return 'bg-red-500';
  if (status === 'Menunggu_Verifikasi') return 'bg-yellow-500';

  return 'bg-slate-400';
}

export default function SuperAdminDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [currentUser, pengajuanData] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanList(1, 100),
        ]);

        if (currentUser.role !== 'Super Admin') {
          window.location.href = getDashboardPathByRole(currentUser.role);
          return;
        }

        setUser(currentUser);
        setPengajuans(pengajuanData.items || []);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard staff.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalPengajuan = pengajuans.length;

  const totalMenunggu = pengajuans.filter(
    (item) => item.status === 'Menunggu_Verifikasi'
  ).length;

  const totalAktif = pengajuans.filter((item) => item.status === 'Aktif').length;

  const totalSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  ).length;

  const totalDitolak = pengajuans.filter(
    (item) => item.status === 'Ditolak'
  ).length;

  const totalBelumLaporan = pengajuans.filter((item) => {
    if (item.jenis_magang === 'Tidak Konversi') return false;
    return !item.link_laporan_akhir;
  }).length;

  const statusSummary = [
    {
      label: 'Menunggu Pemeriksaan',
      status: 'Menunggu_Verifikasi',
      value: totalMenunggu,
    },
    {
      label: 'Aktif',
      status: 'Aktif',
      value: totalAktif,
    },
    {
      label: 'Selesai',
      status: 'Selesai',
      value: totalSelesai,
    },
    {
      label: 'Ditolak',
      status: 'Ditolak',
      value: totalDitolak,
    },
  ];

  const angkatanSummary = useMemo(() => {
    const map = new Map<string, number>();

    pengajuans.forEach((item) => {
      const angkatan = item.angkatan || 'Tidak Ada Data';
      map.set(angkatan, (map.get(angkatan) || 0) + 1);
    });

    return Array.from(map.entries())
      .map(([angkatan, total]) => ({
        angkatan,
        total,
      }))
      .sort((a, b) => a.angkatan.localeCompare(b.angkatan));
  }, [pengajuans]);

  const maxAngkatan = Math.max(...angkatanSummary.map((item) => item.total), 1);

  const jenisMagangSummary = useMemo(() => {
    const map = new Map<string, number>();

    pengajuans.forEach((item) => {
      const jenis = item.jenis_magang || 'Tidak Ada Data';
      map.set(jenis, (map.get(jenis) || 0) + 1);
    });

    return Array.from(map.entries()).map(([jenis, total]) => ({
      jenis,
      total,
      percent: getPercent(total, totalPengajuan),
    }));
  }, [pengajuans, totalPengajuan]);

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

  if (errorMsg) {
    return (
      <DashboardShell role="Super Admin">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <Alert variant="error">{errorMsg}</Alert>
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
            eyebrow="Dashboard Staff"
            title={`Halo, ${user?.name || 'Super Admin'}`}
            description="Pantau ringkasan data magang mahasiswa, status pengajuan, dan distribusi jenis magang."
          />

          {totalBelumLaporan > 0 && (
            <Alert variant="warning">
              Ada {totalBelumLaporan} mahasiswa yang belum melengkapi dokumen
              magang.
            </Alert>
          )}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Pengajuan"
              value={totalPengajuan}
              description="Seluruh data pengajuan magang."
              icon="document"
            />

            <StatCard
              title="Menunggu Pemeriksaan"
              value={totalMenunggu}
              description="Pengajuan baru yang perlu diproses."
              icon="clock"
            />

            <StatCard
              title="Magang Aktif"
              value={totalAktif}
              description="Mahasiswa yang sedang menjalankan magang."
              icon="briefcase"
            />

            <StatCard
              title="Selesai"
              value={totalSelesai}
              description="Mahasiswa yang sudah selesai dinilai."
              icon="check"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <div className="app-card p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Persentase Status Magang
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Perbandingan status pengajuan mahasiswa.
                </p>
              </div>

              <div className="space-y-4">
                {statusSummary.map((item) => {
                  const percent = getPercent(item.value, totalPengajuan);

                  return (
                    <div key={item.status}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                          {item.label}
                        </p>
                        <p className="text-sm font-black text-slate-500 dark:text-slate-400">
                          {item.value} data • {percent}%
                        </p>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${getStatusClass(
                            item.status
                          )}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="app-card p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Data Magang per Angkatan
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Jumlah mahasiswa magang berdasarkan angkatan.
                </p>
              </div>

              {angkatanSummary.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <p className="font-bold text-slate-500">
                    Belum ada data angkatan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {angkatanSummary.map((item) => {
                    const width = Math.round((item.total / maxAngkatan) * 100);

                    return (
                      <div key={item.angkatan}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                            Angkatan {item.angkatan}
                          </p>
                          <p className="text-sm font-black text-slate-500 dark:text-slate-400">
                            {item.total} mahasiswa
                          </p>
                        </div>

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-full rounded-full bg-[#1e3a8a] dark:bg-blue-400"
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="app-card p-6 xl:col-span-2">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Distribusi Jenis Magang
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Ringkasan jenis magang yang dipilih mahasiswa.
                </p>
              </div>

              {jenisMagangSummary.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                  <p className="font-bold text-slate-500">
                    Belum ada data jenis magang.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {jenisMagangSummary.map((item) => (
                    <div
                      key={item.jenis}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/70"
                    >
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                        {item.jenis}
                      </p>
                      <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                        {item.total}
                      </p>
                      <p className="mt-1 text-sm font-black text-[#1e3a8a] dark:text-blue-300">
                        {item.percent}% dari total data
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}