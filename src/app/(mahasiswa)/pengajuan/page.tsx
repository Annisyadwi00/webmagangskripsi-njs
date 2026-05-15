"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import DashboardShell from '@/components/dashboard/DashboardShell';
import {
  Pengajuan,
  createPengajuan,
  getPengajuanList,
  batalPengajuan,
  uploadLaporanAkhir,
} from '@/lib/pengajuan-client';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';

type PengajuanForm = {
  perusahaan: string;
  posisi: string;
  link_loa: string;
  tgl_mulai: string;
  tgl_berakhir: string;
};

const initialForm: PengajuanForm = {
  perusahaan: '',
  posisi: '',
  link_loa: '',
  tgl_mulai: '',
  tgl_berakhir: '',
};

function getStatusBadgeClass(status?: string) {
  if (status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' || status === 'Pilih_Dosen') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak') {
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

  return 'Belum Ada';
}

export default function PengajuanMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);

  const [form, setForm] = useState<PengajuanForm>(initialForm);
  const [linkLaporanAkhir, setLinkLaporanAkhir] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 10),
      ]);

      if (currentUser.role !== 'Mahasiswa') {
        window.location.href = '/login';
        return;
      }

      setUser(currentUser);
      setPengajuan(pengajuanData.items[0] || null);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPengajuan = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await createPengajuan({
        perusahaan: form.perusahaan,
        posisi: form.posisi,
        link_loa: form.link_loa,
        tgl_mulai: form.tgl_mulai,
        tgl_berakhir: form.tgl_berakhir,
        nama_mahasiswa: user?.name,
      });

      setMessage(result.message || 'Pengajuan berhasil dikirim.');
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatalPengajuan = async () => {
    const confirmed = confirm('Yakin ingin membatalkan pengajuan ini?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await batalPengajuan();
      setMessage(result.message || 'Pengajuan berhasil dibatalkan.');
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal membatalkan pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadLaporan = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await uploadLaporanAkhir(linkLaporanAkhir);
      setMessage(result.message || 'Laporan akhir berhasil disimpan.');
      setLinkLaporanAkhir('');
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengunggah laporan akhir.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPengajuan = pengajuan;

  const bisaUploadLaporan = currentPengajuan?.status === 'Aktif';

  const bisaDibatalkan =
    currentPengajuan?.status === 'Menunggu_Verifikasi' ||
    currentPengajuan?.status === 'Ditolak';

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200" />

              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  if (errorMsg && !message) {
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

  return (
    <DashboardShell role="Mahasiswa">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Pengajuan Magang"
            title={`Pengajuan Magang ${user?.name || ''}`}
            description="Kirim data LOA magang, pantau status verifikasi, dan unggah laporan akhir setelah magang aktif."
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {currentPengajuan?.status === 'Ditolak' &&
            currentPengajuan.alasan_penolakan && (
              <Alert variant="error">
                Pengajuan ditolak. Alasan:{' '}
                {currentPengajuan.alasan_penolakan}
              </Alert>
            )}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Status Pengajuan"
              value={getStatusLabel(currentPengajuan?.status)}
              description="Status terakhir pengajuan magang."
              icon="document"
            />

            <StatCard
              title="Dosen Pembimbing"
              value={currentPengajuan?.nama_dosen || '-'}
              description="Dosen pembimbing yang dipilih."
              icon="users"
            />

            <StatCard
              title="Nilai Akhir"
              value={currentPengajuan?.nilai_dari_dosen || '-'}
              description="Nilai akhir dari dosen pembimbing."
              icon="chart"
            />
          </section>

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-950">
                    {currentPengajuan
                      ? 'Detail Pengajuan'
                      : 'Form Pengajuan LOA'}
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentPengajuan
                      ? 'Informasi pengajuan magang yang sedang berjalan.'
                      : 'Lengkapi data tempat magang dan link dokumen LOA.'}
                  </p>
                </div>

                {currentPengajuan && (
                  <span className={getStatusBadgeClass(currentPengajuan.status)}>
                    {getStatusLabel(currentPengajuan.status)}
                  </span>
                )}
              </div>

              {!currentPengajuan ? (
                <form onSubmit={handleSubmitPengajuan} className="space-y-5">
                  <div>
                    <label className="app-label">Nama Perusahaan</label>
                    <input
                      type="text"
                      name="perusahaan"
                      required
                      value={form.perusahaan}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: PT Teknologi Indonesia"
                    />
                  </div>

                  <div>
                    <label className="app-label">Posisi Magang</label>
                    <input
                      type="text"
                      name="posisi"
                      required
                      value={form.posisi}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: Frontend Developer Intern"
                    />
                  </div>

                  <div>
                    <label className="app-label">Link Dokumen LOA</label>
                    <input
                      type="url"
                      name="link_loa"
                      required
                      value={form.link_loa}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="https://drive.google.com/..."
                    />

                    <p className="mt-2 text-xs text-slate-500">
                      Pastikan link dapat diakses oleh admin untuk proses
                      verifikasi.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div>
                      <label className="app-label">Tanggal Mulai</label>
                      <input
                        type="date"
                        name="tgl_mulai"
                        required
                        value={form.tgl_mulai}
                        onChange={handleChange}
                        className="app-input"
                      />
                    </div>

                    <div>
                      <label className="app-label">Tanggal Berakhir</label>
                      <input
                        type="date"
                        name="tgl_berakhir"
                        required
                        value={form.tgl_berakhir}
                        onChange={handleChange}
                        className="app-input"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">
                      Nama Mahasiswa
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.nama_mahasiswa}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">
                      Perusahaan
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.perusahaan}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">Posisi</p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.posisi}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">
                      Tipe Konversi
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.tipeKonversi || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">
                      Tanggal Mulai
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.tgl_mulai || '-'}
                    </p>
                  </div>

                  <div className="app-panel p-4">
                    <p className="text-sm font-bold text-slate-500">
                      Tanggal Berakhir
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.tgl_berakhir || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                    <p className="text-sm font-bold text-slate-500">
                      Dosen Pembimbing
                    </p>
                    <p className="mt-1 font-black text-slate-950">
                      {currentPengajuan.nama_dosen || 'Belum memilih dosen'}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 md:col-span-2 sm:flex-row">
                    {currentPengajuan.link_loa && (
                      <a
                        href={currentPengajuan.link_loa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="app-btn-secondary flex-1"
                      >
                        Lihat Dokumen LOA
                      </a>
                    )}

                    {bisaDibatalkan && (
                      <button
                        type="button"
                        onClick={handleBatalPengajuan}
                        disabled={isSubmitting}
                        className="app-btn-danger flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Batalkan Pengajuan
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950">
                Alur Pengajuan
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Tahapan proses magang mahasiswa.
              </p>

              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="font-black text-[#1e3a8a]">1. Kirim LOA</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Mahasiswa mengirim data perusahaan dan dokumen LOA.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">
                    2. Verifikasi Admin
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Admin memeriksa kelengkapan dan validitas dokumen.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">3. Pilih Dosen</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Setelah disetujui, mahasiswa memilih dosen pembimbing.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">
                    4. Logbook & Nilai
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Mahasiswa mengisi logbook dan dosen memberi evaluasi akhir.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {bisaUploadLaporan && (
            <section className="app-card mt-6 p-6">
              <div className="mb-5">
                <h2 className="text-xl font-black text-slate-950">
                  Upload Laporan Akhir
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Kirim link laporan akhir setelah kegiatan magang selesai.
                </p>
              </div>

              {currentPengajuan?.link_laporan_akhir && (
                <Alert variant="info">
                  Laporan akhir sudah tersimpan. Kamu tetap bisa memperbarui
                  link jika diperlukan.
                </Alert>
              )}

              <form
                onSubmit={handleUploadLaporan}
                className="flex flex-col gap-3 md:flex-row"
              >
                <input
                  type="url"
                  required
                  value={linkLaporanAkhir}
                  onChange={(e) => setLinkLaporanAkhir(e.target.value)}
                  className="app-input flex-1"
                  placeholder="https://drive.google.com/..."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Simpan Laporan
                </button>
              </form>
            </section>
          )}
        </div>
      </main>
    </DashboardShell>
  );
}