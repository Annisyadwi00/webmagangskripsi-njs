"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  JenisDokumen,
  PengajuanDokumen,
  createPengajuanDokumen,
  getPengajuanDokumenList,
} from '@/lib/pengajuan-dokumen-client';

type DokumenForm = {
  nama_mahasiswa: string;
  npm: string;
  program_studi: string;
  kelas: string;
  jenis_dokumen: JenisDokumen;
  keperluan: string;
  catatan_mahasiswa: string;
};

const initialForm: DokumenForm = {
  nama_mahasiswa: '',
  npm: '',
  program_studi: '',
  kelas: '',
  jenis_dokumen: 'Surat Permohonan Magang',
  keperluan: '',
  catatan_mahasiswa: '',
};

const jenisDokumenOptions: JenisDokumen[] = [
  'Surat Permohonan Magang',
  'SK Dosen Pembimbing',
  'Surat Perpanjangan Magang',
  'Surat Keterangan Selesai Magang',
  'Implementation of Arrangement',
  'Laporan Pelaksanaan Kerja Sama',
  'Dokumen Nilai Akhir',
  'Lainnya',
];

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Selesai') return 'app-badge app-badge-green';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
  if (status === 'Diproses') return 'app-badge app-badge-blue';

  return 'app-badge app-badge-yellow';
}

export default function PengajuanDokumenMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<DokumenForm>(initialForm);
  const [dokumens, setDokumens] = useState<PengajuanDokumen[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, dokumenData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanDokumenList(),
      ]);

      if (currentUser.role !== 'Mahasiswa') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      const userData = currentUser as CurrentUser & {
        nim_nidn?: string | null;
        prodi?: string | null;
        kelas?: string | null;
      };

      setUser(currentUser);
      setDokumens(dokumenData);

      setForm((prev) => ({
        ...prev,
        nama_mahasiswa: prev.nama_mahasiswa || currentUser.name || '',
        npm: prev.npm || userData.nim_nidn || '',
        program_studi: prev.program_studi || userData.prodi || '',
        kelas: prev.kelas || userData.kelas || '',
      }));
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data pengajuan dokumen.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await createPengajuanDokumen({
        nama_mahasiswa: form.nama_mahasiswa.trim() || user?.name,
        npm: form.npm.trim(),
        program_studi: form.program_studi.trim(),
        kelas: form.kelas.trim(),
        jenis_dokumen: form.jenis_dokumen,
        keperluan: form.keperluan.trim(),
        catatan_mahasiswa: form.catatan_mahasiswa.trim() || null,
      });

      setMessage(result.message || 'Pengajuan dokumen berhasil dikirim.');
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pengajuan dokumen.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="Mahasiswa">
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

  return (
    <DashboardShell role="Mahasiswa">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Pengajuan Dokumen"
            title="Ajukan Kebutuhan Dokumen Magang"
            description="Ajukan kebutuhan dokumen magang. Dokumen resmi tetap diproses manual oleh admin/TU dan link hasilnya akan dikirim melalui sistem."
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Form Pengajuan Dokumen
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Lengkapi jenis dokumen dan keperluan pengajuan.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                    Data Mahasiswa
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mahasiswa</label>
                    <input
                      type="text"
                      name="nama_mahasiswa"
                      required
                      value={form.nama_mahasiswa}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Nama lengkap"
                    />
                  </div>

                  <div>
                    <label className="app-label">NPM</label>
                    <input
                      type="text"
                      name="npm"
                      required
                      value={form.npm}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="2210631170112"
                    />
                  </div>

                  <div>
                    <label className="app-label">Program Studi</label>
                    <select
                      name="program_studi"
                      required
                      value={form.program_studi}
                      onChange={handleChange}
                      className="app-input"
                    >
                      <option value="">Pilih Program Studi</option>
                      <option value="Informatika">Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                    </select>
                  </div>

                  <div>
                    <label className="app-label">Kelas</label>
                    <input
                      type="text"
                      name="kelas"
                      required
                      value={form.kelas}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: 7C"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                    Data Dokumen
                  </h3>
                </div>

                <div>
                  <label className="app-label">Jenis Dokumen</label>
                  <select
                    name="jenis_dokumen"
                    required
                    value={form.jenis_dokumen}
                    onChange={handleChange}
                    className="app-input"
                  >
                    {jenisDokumenOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label">Keperluan</label>
                  <textarea
                    name="keperluan"
                    required
                    rows={4}
                    value={form.keperluan}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Contoh: Untuk kebutuhan pengajuan magang ke PT. Sukamaju periode Januari - Maret 2026."
                  />
                </div>

                <div>
                  <label className="app-label">Catatan Tambahan</label>
                  <textarea
                    name="catatan_mahasiswa"
                    rows={4}
                    value={form.catatan_mahasiswa}
                    onChange={handleChange}
                    className="app-input"
                    placeholder="Opsional. Tambahkan informasi tambahan jika diperlukan."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Dokumen'}
                </button>
              </form>
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Riwayat Dokumen
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Pantau status dokumen yang pernah kamu ajukan.
              </p>

              <div className="mt-5 space-y-3">
                {dokumens.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Belum ada pengajuan dokumen.
                    </p>
                  </div>
                ) : (
                  dokumens.map((item) => (
                    <div key={item.id} className="app-panel p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.jenis_dokumen}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {item.keperluan}
                          </p>
                        </div>

                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </div>

                      {item.catatan_admin && (
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Catatan admin: {item.catatan_admin}
                        </p>
                      )}

                      {item.link_dokumen && (
                        <a
                          href={item.link_dokumen}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-btn-secondary mt-4 w-full text-center"
                        >
                          Buka Dokumen
                        </a>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}