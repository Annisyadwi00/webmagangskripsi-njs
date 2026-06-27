"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import LoadingAnimation from '@/components/ui/LoadingAnimation';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';

  return value || '-';
}

function getLaporanLabel(jenisMagang?: string | null) {
  if (jenisMagang === 'Konversi 2 SKS') return 'Laporan Magang';
  if (jenisMagang === 'Tidak Konversi') return 'Tidak Wajib';

  return 'Laporan Akhir';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu' || status === 'Menunggu_Verifikasi') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return status || '-';
}

function wajibLaporan(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS' || jenisMagang === 'Konversi 2 SKS';
}

function wajibOutput(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS';
}

function sudahLengkapDokumen(item: Pengajuan) {
  if (!wajibLaporan(item.jenis_magang)) return true;

  if (!item.link_laporan_akhir) return false;

  if (wajibOutput(item.jenis_magang) && !item.link_output_magang) {
    return false;
  }

  return true;
}

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function DosenDashboardPage() {
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
          getPengajuanList(1, 50),
        ]);

        if (currentUser.role !== 'Dosen') {
          window.location.href = getDashboardPathByRole(currentUser.role);
          return;
        }

        setUser(currentUser);
        setPengajuans(pengajuanData?.items || []);
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

  const mahasiswaAktif = pengajuans.filter((item) => item.status === 'Aktif');
  const mahasiswaSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const laporanMasuk = pengajuans.filter(
    (item) => wajibLaporan(item.jenis_magang) && item.link_laporan_akhir
  );

  const dokumenBelumLengkap = pengajuans.filter(
    (item) => item.status === 'Aktif' && !sudahLengkapDokumen(item)
  );

  const belumDinilai = pengajuans.filter(
    (item) =>
      item.status === 'Aktif' &&
      !item.nilai_dari_dosen &&
      sudahLengkapDokumen(item)
  );

  const latestBimbingan = mahasiswaAktif.slice(0, 5);
  const latestLaporan = pengajuans
    .filter((item) => item.link_laporan_akhir)
    .slice(0, 5);

  if (isLoading) {
    return (
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <LoadingAnimation />
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
            description="Pantau mahasiswa bimbingan, dokumen magang, dan penilaian akhir dari satu halaman."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dosen/laporan-akhir" className="app-btn-primary">
                  Lihat Laporan
                </Link>

                <Link href="/dosen/penilaian" className="app-btn-secondary">
                  Input Penilaian
                </Link>
              </div>
            }
          />

          {dokumenBelumLengkap.length > 0 && (
            <Alert variant="warning">
              Ada {dokumenBelumLengkap.length} mahasiswa aktif yang dokumen
              magangnya belum lengkap.
            </Alert>
          )}

          {belumDinilai.length > 0 && (
            <Alert variant="info">
              Ada {belumDinilai.length} mahasiswa aktif yang dokumennya sudah
              lengkap dan belum memiliki nilai akhir.
            </Alert>
          )}

          {dokumenBelumLengkap.length === 0 && belumDinilai.length === 0 && (
            <Alert variant="success">
              Tidak ada tugas mendesak saat ini. Dokumen dan penilaian berjalan
              normal.
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
              title="Mahasiswa Aktif"
              value={mahasiswaAktif.length}
              description="Mahasiswa bimbingan yang sedang magang."
              icon="briefcase"
            />

            <StatCard
              title="Laporan Masuk"
              value={laporanMasuk.length}
              description="Mahasiswa yang sudah upload laporan magang."
              icon="document"
            />

            <StatCard
              title="Belum Dinilai"
              value={belumDinilai.length}
              description="Mahasiswa aktif dengan dokumen lengkap tanpa nilai."
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
                    Mahasiswa yang telah ditetapkan sebagai bimbingan akan
                    muncul di sini.
                  </p>
                </div>

                <Link
                  href="/dosen/penilaian"
                  className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
                >
                  Lihat Penilaian
                </Link>
              </div>

              {latestBimbingan.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    Belum ada mahasiswa bimbingan aktif.
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Mahasiswa yang diterima sebagai bimbingan akan muncul di
                    sini.
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
                          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {item.npm || '-'} • {item.program_studi || '-'} •{' '}
                            {item.kelas || '-'}
                            <br />
                            {item.perusahaan} -{' '}
                            {item.posisi || 'Peserta Magang'}
                          </p>
                        </div>

                        <span className={getStatusBadgeClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
                        <div className="app-panel p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Jenis
                          </p>
                          <p className="mt-1 font-bold text-slate-950 dark:text-white">
                            {getJenisMagangLabel(item.jenis_magang)}
                          </p>
                        </div>

                        <div className="app-panel p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Periode
                          </p>
                          <p className="mt-1 font-bold text-slate-950 dark:text-white">
                            {formatDate(item.tgl_mulai)} -{' '}
                            {formatDate(item.tgl_berakhir)}
                          </p>
                        </div>

                        <div className="app-panel p-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Dokumen
                          </p>
                          <p className="mt-1 font-bold text-slate-950 dark:text-white">
                            {sudahLengkapDokumen(item)
                              ? 'Lengkap'
                              : 'Belum Lengkap'}
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

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        {item.link_laporan_akhir && (
                          <a
                            href={item.link_laporan_akhir}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-btn-secondary px-4 py-2 text-sm"
                          >
                            Buka {getLaporanLabel(item.jenis_magang)}
                          </a>
                        )}

                        {item.link_output_magang && (
                          <a
                            href={item.link_output_magang}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-btn-secondary px-4 py-2 text-sm"
                          >
                            Buka Output Magang
                          </a>
                        )}

                        {sudahLengkapDokumen(item) && (
                          <Link
                            href="/dosen/penilaian"
                            className="app-btn-primary px-4 py-2 text-sm"
                          >
                            Input Nilai
                          </Link>
                        )}
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
                  href="/dosen/laporan-akhir"
                  className="flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 font-bold text-[#1e3a8a] hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/20"
                >
                  Laporan Magang
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
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Laporan Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Mahasiswa yang sudah mengunggah laporan magang.
                </p>
              </div>

              <Link
                href="/dosen/laporan-akhir"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>

            {latestLaporan.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada laporan yang diunggah.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {latestLaporan.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {getLaporanLabel(item.jenis_magang)} •{' '}
                          {getJenisMagangLabel(item.jenis_magang)}
                        </p>
                      </div>

                      <span className={getStatusBadgeClass(item.status)}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                      {item.link_laporan_akhir && (
                        <a
                          href={item.link_laporan_akhir}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-btn-secondary px-4 py-2 text-sm"
                        >
                          Buka Laporan
                        </a>
                      )}

                      {item.link_output_magang && (
                        <a
                          href={item.link_output_magang}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-btn-secondary px-4 py-2 text-sm"
                        >
                          Buka Output
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
  );
}