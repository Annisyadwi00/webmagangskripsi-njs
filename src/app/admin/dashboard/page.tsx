"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { Logbook, getLogbookList } from '@/lib/logbook-client';

function getStatusBadgeClass(status?: string) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' || status === 'Pilih_Dosen' || status === 'Menunggu') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Pilih_Dosen') return 'Pilih Dosen';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Selesai') return 'Selesai';

  return status || '-';
}

export default function AdminDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [currentUser, pengajuanData, logbookData] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanList(1, 50),
          getLogbookList(),
        ]);

        if (currentUser.role !== 'Admin') {
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
            : 'Gagal memuat dashboard admin.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const pengajuanMenunggu = pengajuans.filter(
    (item) => item.status === 'Menunggu_Verifikasi'
  );

  const pengajuanPilihDosen = pengajuans.filter(
    (item) => item.status === 'Pilih_Dosen'
  );

  const pengajuanAktif = pengajuans.filter((item) => item.status === 'Aktif');

  const pengajuanSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const pengajuanDitolak = pengajuans.filter(
    (item) => item.status === 'Ditolak'
  );

  const logbookMenunggu = logbooks.filter(
    (item) => item.status === 'Menunggu'
  );

  const logbookRevisi = logbooks.filter((item) => item.status === 'Revisi');

  const latestPengajuans = pengajuans.slice(0, 5);
  const latestLogbooks = logbooks.slice(0, 5);

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
          eyebrow="Dashboard Admin"
          title={`Halo, ${user?.name || 'Admin'}`}
          description="Pantau pengajuan magang, logbook mahasiswa, dan aktivitas utama sistem dari satu halaman."
          action={
            <Link href="/admin/pengajuan" className="app-btn-primary">
              Verifikasi Pengajuan
            </Link>
          }
        />

        {pengajuanMenunggu.length > 0 && (
          <Alert variant="warning">
            Ada {pengajuanMenunggu.length} pengajuan LOA yang menunggu
            verifikasi admin.
          </Alert>
        )}

        {pengajuanPilihDosen.length > 0 && (
          <Alert variant="info">
            Ada {pengajuanPilihDosen.length} pengajuan yang sudah disetujui dan
            menunggu mahasiswa memilih dosen.
          </Alert>
        )}

        {logbookRevisi.length > 0 && (
          <Alert variant="warning">
            Ada {logbookRevisi.length} logbook berstatus revisi pada sistem.
          </Alert>
        )}

        {pengajuanDitolak.length > 0 && (
          <Alert variant="error">
            Ada {pengajuanDitolak.length} pengajuan yang ditolak. Pastikan
            alasan penolakan sudah jelas untuk mahasiswa.
          </Alert>
        )}

        {pengajuanMenunggu.length === 0 &&
          logbookRevisi.length === 0 &&
          pengajuanDitolak.length === 0 && (
            <Alert variant="success">
              Tidak ada pengajuan mendesak saat ini. Sistem berjalan normal.
            </Alert>
          )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Menunggu Verifikasi"
            value={pengajuanMenunggu.length}
            description="Pengajuan LOA baru yang perlu dicek."
            icon="document"
          />

          <StatCard
            title="Magang Aktif"
            value={pengajuanAktif.length}
            description="Mahasiswa yang sedang menjalankan magang."
            icon="briefcase"
          />

          <StatCard
            title="Logbook Masuk"
            value={logbooks.length}
            description={`${logbookMenunggu.length} logbook menunggu evaluasi.`}
            icon="book"
          />

          <StatCard
            title="Magang Selesai"
            value={pengajuanSelesai.length}
            description="Pengajuan yang sudah selesai dinilai."
            icon="check"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Pengajuan Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Daftar pengajuan magang terbaru dari mahasiswa.
                </p>
              </div>

              <Link
                href="/admin/pengajuan"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>

            {latestPengajuans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengajuan.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Pengajuan mahasiswa akan muncul setelah mahasiswa mengirim
                  data LOA.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestPengajuans.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.perusahaan} - {item.posisi}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
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
                          Berakhir
                        </p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {item.tgl_berakhir || '-'}
                        </p>
                      </div>

                      <div className="app-panel p-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Dosen
                        </p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {item.nama_dosen || 'Belum dipilih'}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Menu Cepat
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Akses fitur utama administrator.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/admin/pengajuan"
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-bold text-[#1e3a8a] hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20"
              >
                Verifikasi Pengajuan
                <span>→</span>
              </Link>

              <Link
                href="/admin/users"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Kelola Pengguna
                <span>→</span>
              </Link>

              <Link
                href="/admin/lowongan"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Kelola Lowongan
                <span>→</span>
              </Link>

              <Link
                href="/admin/feedback"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Feedback Pengguna
                <span>→</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Settings Akun
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="app-card mt-6 p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Logbook Terbaru
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Aktivitas logbook terbaru yang masuk ke sistem.
              </p>
            </div>
          </div>

          {latestLogbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada logbook.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Logbook mahasiswa akan muncul setelah mahasiswa mengisi aktivitas
                magang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestLogbooks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">
                      {item.tanggal}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {item.kegiatan}
                    </p>
                  </div>

                  <span className={getStatusBadgeClass(item.status)}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Ringkasan Sistem
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Total pengajuan tercatat: {pengajuans.length}. Dari jumlah
              tersebut, {pengajuanAktif.length} sedang aktif dan{' '}
              {pengajuanSelesai.length} sudah selesai.
            </p>
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Prioritas Admin
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Fokus utama admin adalah memverifikasi LOA, memastikan data
              mahasiswa rapi, dan menjaga informasi lowongan tetap valid.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}