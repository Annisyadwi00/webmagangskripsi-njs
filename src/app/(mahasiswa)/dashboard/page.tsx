"use client";

import { useEffect, useState } from 'react';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { Logbook, getLogbookList } from '@/lib/logbook-client';
import DashboardShell from '@/components/dashboard/DashboardShell';
import ProgressStepper from '@/components/ui/ProgressStepper';

function getStatusBadgeClass(status?: string) {
  if (status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' ) {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}
function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return 'Belum Ada';
}
function getMagangSteps(status?: string) {
  const currentStatus = status || 'Belum_Ada';

  const order = ['Belum_Ada', 'Menunggu_Verifikasi', 'Aktif', 'Selesai'];

  const currentIndex = order.indexOf(currentStatus);

  const getStatus = (stepStatus: string) => {
    if (currentStatus === 'Ditolak' && stepStatus === 'Menunggu_Verifikasi') {
      return 'rejected' as const;
    }

    const stepIndex = order.indexOf(stepStatus);

    if (currentStatus === 'Ditolak') {
      return stepIndex < 1 ? ('done' as const) : ('pending' as const);
    }

    if (stepIndex < currentIndex) return 'done' as const;
    if (stepIndex === currentIndex) return 'active' as const;

    return 'pending' as const;
  };

  return [
    {
      title: 'Pendataan Magang',
      description:
        'Mahasiswa mengisi data magang, bukti penerimaan, dan permohonan dosen pembimbing.',
      status: getStatus('Belum_Ada'),
    },
    {
      title: 'Verifikasi Admin',
      description:
        'Admin memeriksa data magang dan menentukan dosen pembimbing.',
      status: getStatus('Menunggu_Verifikasi'),
    },
    {
      title: 'Magang Aktif',
      description:
        'Mahasiswa melaksanakan magang dan mengisi logbook kegiatan.',
      status: getStatus('Aktif'),
    },
    {
      title: 'Selesai',
      description: 'Dosen memberi evaluasi dan nilai akhir magang.',
      status: getStatus('Selesai'),
    },
  ];
}

export default function MahasiswaDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
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
          getPengajuanList(1, 10),
          getLogbookList(),
        ]);

      if (currentUser.role !== 'Mahasiswa') {
  window.location.href = getDashboardPathByRole(currentUser.role);
  return;
}

const pengajuanItems = Array.isArray(pengajuanData)
  ? pengajuanData
  : pengajuanData?.items || [];

setUser(currentUser);
setPengajuan(pengajuanItems[0] || null);
setLogbooks(logbookData || []);

      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard mahasiswa.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalDisetujui = logbooks.filter(
    (item) => item.status === 'Disetujui'
  ).length;

  const totalRevisi = logbooks.filter((item) => item.status === 'Revisi').length;

  const latestLogbooks = logbooks.slice(0, 3);

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-72 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-36 animate-pulse rounded-2xl bg-slate-100" />
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
  <DashboardShell role="Mahasiswa">
    <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
        </div>
      </main>
      </DashboardShell>
    );
  }
const logbookMenunggu = logbooks.filter((item) => item.status === 'Menunggu');

const sudahAdaNilai = Boolean(pengajuan?.nilai_dari_dosen);

const belumPunyaPengajuan = !pengajuan;

const pengajuanMenunggu = pengajuan?.status === 'Menunggu_Verifikasi';

const pengajuanAktif = pengajuan?.status === 'Aktif';
  return (
  <DashboardShell role="Mahasiswa">
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Dashboard Mahasiswa"
          title={`Halo, ${user?.name || 'Mahasiswa'}`}
          description="Pantau progres magang, logbook, dan evaluasi akhir kamu dari satu halaman yang lebih ringkas."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/pengajuan" className="app-btn-primary">
                Isi Pendataan Magang
              </Link>
            </div>
          }
        />

        {pengajuan?.status === 'Ditolak' && pengajuan.alasan_penolakan && (
          <Alert variant="error">
            Pengajuan kamu ditolak. Alasan: {pengajuan.alasan_penolakan}
          </Alert>
        )}

        {totalRevisi > 0 && (
          <Alert variant="warning">
            Ada {totalRevisi} logbook yang perlu direvisi. Segera perbaiki agar proses evaluasi tidak tertunda.
          </Alert>
        )}
          <section className="mb-6">
  <div className="app-card p-5">
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-black text-slate-950 dark:text-white">
          Progres Magang
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Status kamu saat ini: {pengajuan?.status || 'Belum Ada'}
        </p>
      </div>
    </div>

    <ProgressStepper steps={getMagangSteps(pengajuan?.status)} />
  </div>
</section>

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
  title="Status Pengajuan"
  value={getStatusLabel(pengajuan?.status)}
  description={
    pengajuan?.status === 'Menunggu_Verifikasi'
      ? 'Menunggu admin memverifikasi data magang.'
      : pengajuan?.status === 'Aktif'
        ? 'Magang sudah aktif dan bisa mengisi logbook.'
        : pengajuan?.status === 'Selesai'
          ? 'Magang selesai dan nilai akhir tersedia.'
          : pengajuan?.status === 'Ditolak'
            ? 'Pengajuan ditolak. Periksa catatan admin.'
            : 'Belum ada pengajuan magang.'
  }
  icon="document"
/>

          <StatCard
            title="Total Logbook"
            value={logbooks.length}
            description="Jumlah logbook yang sudah kamu kirim."
            icon="calendar"
          />

          <StatCard
            title="Disetujui Dosen"
            value={totalDisetujui}
            description={`${totalRevisi} logbook masih perlu revisi.`}
            icon="check"
          />
        </section>

        <section className="grid grid-cols-1 gap-6">
  <div className="app-card p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Ringkasan Magang
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Informasi utama pengajuan magang kamu.
                </p>
              </div>

              <span className={getStatusBadgeClass(pengajuan?.status)}>
  {getStatusLabel(pengajuan?.status)}
</span>
            </div>
                  {belumPunyaPengajuan && (
  <Alert variant="info">
    Kamu belum memiliki pengajuan magang. Silakan isi pendataan magang dan unggah bukti penerimaan terlebih dahulu.
  </Alert>
)}

{pengajuanMenunggu && (
  <Alert variant="warning">
    Pengajuan kamu sedang menunggu verifikasi admin. Pastikan bukti penerimaan dan dokumen pendukung dapat diakses.
  </Alert>
)}

{pengajuanAktif && logbookMenunggu.length > 0 && (
  <Alert variant="info">
    Ada {logbookMenunggu.length} logbook yang sedang menunggu evaluasi dosen.
  </Alert>
)}
{pengajuanAktif && (
  <Alert variant="success">
    Pengajuan kamu sudah aktif. Dosen pembimbing telah ditentukan oleh admin.
  </Alert>
)}

{totalRevisi > 0 && (
  <Alert variant="warning">
    Ada {totalRevisi} logbook yang perlu direvisi. Segera perbaiki agar proses
    evaluasi tidak tertunda.
  </Alert>
)}

{sudahAdaNilai && (
  <Alert variant="success">
    Nilai akhir magang kamu sudah tersedia: {pengajuan?.nilai_dari_dosen}.
  </Alert>
)}
            {pengajuan ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Perusahaan</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {pengajuan.perusahaan}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Posisi</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {pengajuan.posisi}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Dosen Pembimbing
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                  Dosen pembimbing yang ditentukan admin.
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Nilai Akhir</p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {pengajuan.nilai_dari_dosen || 'Belum dinilai'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-4 md:col-span-2">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Periode Magang
                  </p>
                  <p className="mt-1 font-black text-slate-950 dark:text-white">
                    {pengajuan.tgl_mulai || '-'} sampai{' '}
                    {pengajuan.tgl_berakhir || '-'}
                  </p>
                </div>
                <div className="app-panel p-4">
  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
    Jenis Magang
  </p>
  <p className="mt-1 font-black text-slate-950 dark:text-white">
    {pengajuan.jenis_magang || '-'}
  </p>
</div>

<div className="app-panel p-4">
  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
    Program Studi
  </p>
  <p className="mt-1 font-black text-slate-950 dark:text-white">
    {pengajuan.program_studi || '-'}
  </p>
</div>
<div className="app-panel p-4 md:col-span-2">
  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
    Rencana Magang
  </p>
  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
    {pengajuan.rencana_magang || '-'}
  </p>
</div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-8 text-center">
                <p className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300 dark:text-slate-300">
                  Kamu belum memiliki pengajuan magang.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Silakan isi data magang dan bukti penerimaan terlebih dahulu.
                </p>
                <Link href="/pengajuan" className="app-btn-primary mt-5">
                  Buat Pengajuan
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="app-card mt-6 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Logbook Terbaru
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                Tiga aktivitas terakhir yang kamu kirim.
              </p>
            </div>

            <Link href="/logbook" className="text-sm font-black text-[#1e3a8a]">
              Lihat semua
            </Link>
          </div>

          {latestLogbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:bg-slate-800/70 dark:bg-slate-800/70 p-8 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300 dark:text-slate-300">Belum ada logbook.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
                Logbook akan muncul setelah kamu mengisi aktivitas magang.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestLogbooks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-950 dark:text-white">
                      {item.tanggal}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
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
      </div>
    </main>
    </DashboardShell>
  );
}