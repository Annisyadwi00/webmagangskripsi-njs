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

export default function DosenDashboardPage() {
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
            : 'Gagal memuat dashboard dosen.';

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

  const logbookMenunggu = logbooks.filter(
    (item) => item.status === 'Menunggu'
  );

  const logbookRevisi = logbooks.filter((item) => item.status === 'Revisi');

  const belumDinilai = pengajuans.filter(
    (item) =>
      item.status_dosen === 'Disetujui' &&
      item.status === 'Aktif' &&
      !item.nilai_dari_dosen
  );

  const latestLogbooks = logbooks.slice(0, 5);
  const latestBimbingan = mahasiswaAktif.slice(0, 5);

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
          eyebrow="Dashboard Dosen"
          title={`Halo, ${user?.name || 'Dosen'}`}
          description="Pantau mahasiswa bimbingan yang telah ditetapkan admin, logbook yang perlu dievaluasi, dan penilaian akhir dari satu halaman."
          action={
            <Link href="/dosen/logbook" className="app-btn-primary">
              Evaluasi Logbook
            </Link>
          }
        />

        {logbookMenunggu.length > 0 && (
          <Alert variant="info">
            Ada {logbookMenunggu.length} logbook mahasiswa yang menunggu
            evaluasi.
          </Alert>
        )}

        {logbookRevisi.length > 0 && (
          <Alert variant="warning">
            Ada {logbookRevisi.length} logbook berstatus revisi yang perlu
            dipantau.
          </Alert>
        )}

        {belumDinilai.length > 0 && (
          <Alert variant="info">
            Ada {belumDinilai.length} mahasiswa aktif yang belum memiliki nilai
            akhir.
          </Alert>
        )}

        {permintaanBimbingan.length === 0 &&
          logbookMenunggu.length === 0 &&
          belumDinilai.length === 0 && (
            <Alert variant="success">
              Tidak ada tugas mendesak saat ini. Semua proses bimbingan berjalan
              normal.
            </Alert>
          )}

<StatCard
  title="Total Bimbingan"
  value={pengajuans.length}
  description="Mahasiswa yang ditetapkan sebagai bimbingan."
  icon="users"
/>

          <StatCard
            title="Mahasiswa Aktif"
            value={mahasiswaAktif.length}
            description="Mahasiswa bimbingan yang sedang magang."
            icon="briefcase"
          />

          <StatCard
            title="Logbook Menunggu"
            value={logbookMenunggu.length}
            description="Logbook yang perlu dievaluasi."
            icon="document"
          />

          <StatCard
            title="Belum Dinilai"
            value={belumDinilai.length}
            description="Mahasiswa aktif tanpa nilai akhir."
            icon="warning"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Mahasiswa Bimbingan Aktif
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Mahasiswa yang telah ditetapkan admin/koorprodi sebagai bimbingan akan muncul di sini.
                </p>
              </div>

              <Link
                href="/dosen/bimbingan"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Mahasiswa Bimbingan
              </Link>
            </div>

            {latestBimbingan.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada mahasiswa bimbingan aktif.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Mahasiswa yang diterima sebagai bimbingan akan muncul di sini.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {latestBimbingan.map((item) => (
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
                        {item.npm || '-'} • {item.program_studi || '-'} • {item.kelas || '-'}
<br />
{item.perusahaan} - {item.posisi}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {item.status}
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
                          Nilai
                        </p>
                        <p className="mt-1 font-bold text-slate-950 dark:text-white">
                          {item.nilai_dari_dosen || 'Belum dinilai'}
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
              Akses fitur utama dosen pembimbing.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/dosen/bimbingan"
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-bold text-[#1e3a8a] hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20"
              >
                Permintaan Bimbingan
                <span>→</span>
              </Link>

              <Link
                href="/dosen/logbook"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Evaluasi Logbook
                <span>→</span>
              </Link>

              <Link
                href="/dosen/penilaian"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Penilaian Akhir
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
                Aktivitas mahasiswa terbaru yang masuk ke sistem.
              </p>
            </div>

            <Link
              href="/dosen/logbook"
              className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
            >
              Lihat semua
            </Link>
          </div>

          {latestLogbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada logbook.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Logbook mahasiswa akan muncul setelah mahasiswa mengisi
                aktivitas magang.
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
              Ringkasan Bimbingan
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Total mahasiswa selesai bimbingan: {mahasiswaSelesai.length}.
              Gunakan halaman penilaian untuk mengisi nilai akhir mahasiswa yang
              sudah menyelesaikan proses magang.
            </p>
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Prioritas Hari Ini
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Fokus utama: evaluasi logbook menunggu dan proses permintaan
              bimbingan baru agar mahasiswa tidak menunggu terlalu lama.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}