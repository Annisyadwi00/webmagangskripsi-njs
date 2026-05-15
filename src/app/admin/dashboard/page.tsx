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
            : 'Gagal memuat dashboard dosen.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const permintaanBimbingan = pengajuans.filter(
    (item) => item.status_dosen === 'Menunggu'
  );

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
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200" />

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-100"
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
          description="Pantau permintaan bimbingan, mahasiswa aktif, logbook yang perlu dievaluasi, dan penilaian akhir dari satu halaman."
          action={
            <Link href="/dosen/logbook" className="app-btn-primary">
              Evaluasi Logbook
            </Link>
          }
        />

        {permintaanBimbingan.length > 0 && (
          <Alert variant="warning">
            Ada {permintaanBimbingan.length} permintaan bimbingan yang menunggu
            persetujuan.
          </Alert>
        )}

        {logbookMenunggu.length > 0 && (
          <Alert variant="info">
            Ada {logbookMenunggu.length} logbook mahasiswa yang perlu dievaluasi.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
          <StatCard
            title="Permintaan"
            value={permintaanBimbingan.length}
            description="Mahasiswa menunggu persetujuan."
            icon="clock"
          />

          <StatCard
            title="Mahasiswa Aktif"
            value={mahasiswaAktif.length}
            description="Mahasiswa yang sedang dibimbing."
            icon="users"
          />

          <StatCard
            title="Logbook Menunggu"
            value={logbookMenunggu.length}
            description={`${logbookRevisi.length} logbook masih revisi.`}
            icon="book"
          />

          <StatCard
            title="Belum Dinilai"
            value={belumDinilai.length}
            description="Mahasiswa aktif tanpa nilai akhir."
            icon="chart"
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="app-card p-6 lg:col-span-2">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">
                  Mahasiswa Bimbingan
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Daftar mahasiswa aktif yang sedang Anda bimbing.
                </p>
              </div>

              <Link
                href="/dosen/bimbingan"
                className="text-sm font-black text-[#1e3a8a]"
              >
                Kelola
              </Link>
            </div>

            {latestBimbingan.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="font-bold text-slate-700">
                  Belum ada mahasiswa aktif.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Mahasiswa yang sudah disetujui sebagai bimbingan akan muncul di
                  sini.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestBimbingan.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-black text-slate-950">
                        {item.nama_mahasiswa}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.perusahaan} - {item.posisi}
                      </p>
                    </div>

                    <span className={getStatusBadgeClass(item.status)}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950">
              Menu Cepat Dosen
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Akses fitur utama dosen pembimbing.
            </p>

            <div className="mt-5 space-y-3">
              <Link
                href="/dosen/bimbingan"
                className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-bold text-[#1e3a8a] hover:bg-blue-100"
              >
                Kelola Bimbingan
                <span>→</span>
              </Link>

              <Link
                href="/dosen/logbook"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50"
              >
                Evaluasi Logbook
                <span>→</span>
              </Link>

              <Link
                href="/dosen/penilaian"
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 font-bold text-slate-700 hover:bg-slate-50"
              >
                Input Nilai Akhir
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="app-card mt-6 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Logbook Terbaru
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Aktivitas terbaru dari mahasiswa bimbingan.
              </p>
            </div>

            <Link
              href="/dosen/logbook"
              className="text-sm font-black text-[#1e3a8a]"
            >
              Lihat semua
            </Link>
          </div>

          {latestLogbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Belum ada logbook masuk.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Logbook mahasiswa bimbingan akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {latestLogbooks.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-black text-slate-950">{item.tanggal}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
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

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-500">Total Bimbingan</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {pengajuans.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-500">Selesai Dinilai</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {mahasiswaSelesai.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm font-bold text-slate-500">Total Logbook</p>
            <p className="mt-1 text-2xl font-black text-slate-950">
              {logbooks.length}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}