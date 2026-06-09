"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
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

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
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
          : 'Gagal memuat laporan mahasiswa.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mahasiswaBimbingan = pengajuans.filter(
    (item) => item.status === 'Aktif' || item.status === 'Selesai'
  );

  const totalWajibLaporan = mahasiswaBimbingan.filter((item) =>
    wajibLaporan(item.jenis_magang)
  ).length;

  const totalSudahUpload = mahasiswaBimbingan.filter(
    (item) => wajibLaporan(item.jenis_magang) && item.link_laporan_akhir
  ).length;

  const totalBelumUpload = mahasiswaBimbingan.filter(
    (item) => wajibLaporan(item.jenis_magang) && !item.link_laporan_akhir
  ).length;

  const totalDokumenLengkap = mahasiswaBimbingan.filter((item) =>
    sudahLengkapDokumen(item)
  ).length;

  const filteredPengajuans = useMemo(() => {
    const keyword = search.toLowerCase();

    return pengajuans
      .filter((item) => item.status === 'Aktif' || item.status === 'Selesai')
      .filter((item) => {
        const nama = item.nama_mahasiswa || '';
        const npm = item.npm || '';
        const perusahaan = item.perusahaan || '';
        const prodi = item.program_studi || '';
        const jenisMagang = getJenisMagangLabel(item.jenis_magang);
        const laporanLabel = getLaporanLabel(item.jenis_magang);

        const matchesKeyword =
          nama.toLowerCase().includes(keyword) ||
          npm.toLowerCase().includes(keyword) ||
          perusahaan.toLowerCase().includes(keyword) ||
          prodi.toLowerCase().includes(keyword) ||
          jenisMagang.toLowerCase().includes(keyword) ||
          laporanLabel.toLowerCase().includes(keyword);

        const hasReport = Boolean(item.link_laporan_akhir);
        const isComplete = sudahLengkapDokumen(item);
        const isTidakKonversi = item.jenis_magang === 'Tidak Konversi';

        const matchesFilter =
          filter === 'Semua' ||
          (filter === 'Sudah Upload' && hasReport) ||
          (filter === 'Belum Upload' &&
            wajibLaporan(item.jenis_magang) &&
            !hasReport) ||
          (filter === 'Dokumen Lengkap' && isComplete) ||
          (filter === 'Tidak Wajib' && isTidakKonversi);

        return matchesKeyword && matchesFilter;
      });
  }, [pengajuans, search, filter]);

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
            eyebrow="Laporan Magang"
            title="Laporan Mahasiswa Bimbingan"
            description={`Lihat dokumen laporan mahasiswa bimbingan yang sudah ditetapkan. ${
              user?.name ? `Dosen: ${user.name}` : ''
            }`}
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
              Ada {totalBelumUpload} mahasiswa bimbingan yang belum mengunggah
              laporan wajib.
            </Alert>
          )}

          {totalBelumUpload === 0 && totalWajibLaporan > 0 && (
            <Alert variant="success">
              Semua mahasiswa yang wajib laporan sudah mengunggah dokumen
              laporan.
            </Alert>
          )}

          <section className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-4">
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
                Wajib Laporan
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {totalWajibLaporan}
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
                Dokumen Lengkap
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                {totalDokumenLengkap}
              </p>
            </div>
          </section>

          <section className="app-card mb-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
              <div>
                <label className="app-label">Cari Mahasiswa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, NPM, prodi, jenis magang, atau tempat magang..."
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
                  <option value="Dokumen Lengkap">Dokumen Lengkap</option>
                  <option value="Tidak Wajib">Tidak Wajib</option>
                </select>
              </div>
            </div>
          </section>

          {filteredPengajuans.length === 0 ? (
            <section className="app-card p-8 text-center">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Data laporan mahasiswa tidak ditemukan.
              </p>
            </section>
          ) : (
            <section className="space-y-4">
              {filteredPengajuans.map((item) => {
                const isWajibLaporan = wajibLaporan(item.jenis_magang);
                const isWajibOutput = wajibOutput(item.jenis_magang);
                const isComplete = sudahLengkapDokumen(item);

                return (
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

                          <span
                            className={
                              isComplete
                                ? 'app-badge app-badge-green'
                                : 'app-badge app-badge-yellow'
                            }
                          >
                            {isComplete ? 'Dokumen Lengkap' : 'Belum Lengkap'}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {item.npm || '-'} • {item.program_studi || '-'} •{' '}
                          {item.kelas || '-'}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.perusahaan} - {item.posisi || 'Peserta Magang'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                        {item.link_laporan_akhir && (
                          <a
                            href={item.link_laporan_akhir}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-btn-primary"
                          >
                            Buka {getLaporanLabel(item.jenis_magang)}
                          </a>
                        )}

                        {item.link_output_magang && (
                          <a
                            href={item.link_output_magang}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="app-btn-secondary"
                          >
                            Buka Output Magang
                          </a>
                        )}

                        {isComplete && (
                          <Link href="/dosen/penilaian" className="app-btn-secondary">
                            Input Penilaian
                          </Link>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="app-panel p-4">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Periode
                        </p>
                        <p className="mt-1 font-black text-slate-950 dark:text-white">
                          {formatDate(item.tgl_mulai)} sampai{' '}
                          {formatDate(item.tgl_berakhir)}
                        </p>
                      </div>

                      <div className="app-panel p-4">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Jenis Magang
                        </p>
                        <p className="mt-1 font-black text-slate-950 dark:text-white">
                          {getJenisMagangLabel(item.jenis_magang)}
                        </p>
                      </div>

                      <div className="app-panel p-4">
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                          Kebutuhan Dokumen
                        </p>
                        <p className="mt-1 font-black text-slate-950 dark:text-white">
                          {!isWajibLaporan
                            ? 'Tidak Wajib'
                            : isWajibOutput
                              ? 'Laporan + Output'
                              : 'Laporan'}
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

                    {isWajibLaporan && !item.link_laporan_akhir && (
                      <Alert variant="warning">
                        Mahasiswa belum mengunggah {getLaporanLabel(item.jenis_magang).toLowerCase()}.
                      </Alert>
                    )}

                    {isWajibOutput && !item.link_output_magang && (
                      <Alert variant="warning">
                        Mahasiswa belum mengunggah output magang.
                      </Alert>
                    )}
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}