"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  PengajuanMitra,
  createPengajuanMitra,
  getPengajuanMitraList,
} from '@/lib/pengajuan-mitra-client';

type MitraForm = {
  nama_mitra: string;
  alamat_kantor_mitra: string;
  url_mitra: string;
  nama_narahubung_mitra: string;
  kontak_narahubung_mitra: string;

  nama_mahasiswa_pengusul: string;
  npm_mahasiswa_pengusul: string;
  program_studi_mahasiswa: string;
  angkatan_mahasiswa: string;
  kontak_mahasiswa: string;
  kelas: string;
};

const initialForm: MitraForm = {
  nama_mitra: '',
  alamat_kantor_mitra: '',
  url_mitra: '',
  nama_narahubung_mitra: '',
  kontak_narahubung_mitra: '',

  nama_mahasiswa_pengusul: '',
  npm_mahasiswa_pengusul: '',
  program_studi_mahasiswa: '',
  angkatan_mahasiswa: '',
  kontak_mahasiswa: '',
  kelas: '',
};

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Disetujui') return 'app-badge app-badge-green';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
  return 'app-badge app-badge-yellow';
}

export default function PengajuanMitraMahasiswaPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<MitraForm>(initialForm);
  const [pengajuanMitra, setPengajuanMitra] = useState<PengajuanMitra[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, mitraData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanMitraList(),
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
      setPengajuanMitra(mitraData);

      setForm((prev) => ({
        ...prev,
        nama_mahasiswa_pengusul:
          prev.nama_mahasiswa_pengusul || currentUser.name || '',
        npm_mahasiswa_pengusul:
          prev.npm_mahasiswa_pengusul || userData.nim_nidn || '',
        program_studi_mahasiswa:
          prev.program_studi_mahasiswa || userData.prodi || '',
        kelas: prev.kelas || userData.kelas || '',
      }));
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data pengajuan mitra.';

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
      const result = await createPengajuanMitra({
        nama_mitra: form.nama_mitra.trim(),
        alamat_kantor_mitra: form.alamat_kantor_mitra.trim(),
        url_mitra: form.url_mitra.trim() || null,
        nama_narahubung_mitra: form.nama_narahubung_mitra.trim(),
        kontak_narahubung_mitra: form.kontak_narahubung_mitra.trim(),

        nama_mahasiswa_pengusul:
          form.nama_mahasiswa_pengusul.trim() || user?.name,
        npm_mahasiswa_pengusul: form.npm_mahasiswa_pengusul.trim(),
        program_studi_mahasiswa: form.program_studi_mahasiswa.trim(),
        angkatan_mahasiswa: form.angkatan_mahasiswa.trim(),
        kontak_mahasiswa: form.kontak_mahasiswa.trim(),
        kelas: form.kelas.trim(),
      });

      setMessage(
  result.message ||
    'Pengajuan mitra berhasil dikirim dan akan diperiksa oleh staff.'
);
      setForm(initialForm);
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal mengirim pengajuan mitra.';

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
            eyebrow="Pengajuan Mitra"
            title="Form Pengajuan Mitra Magang"
            description="Ajukan data mitra apabila tempat magang belum tersedia dalam daftar mitra kerja sama Fasilkom."
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
              <Alert variant="info">
  Pengajuan mitra yang dikirim akan diperiksa oleh staff terlebih dahulu sebelum
  dinyatakan disetujui atau ditolak.
</Alert>
          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="app-card p-6 lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Form Pengajuan Mitra
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Lengkapi data mitra dan data mahasiswa pengusul.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                    Data Mitra
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mitra</label>
                    <input
                      type="text"
                      name="nama_mitra"
                      required
                      value={form.nama_mitra}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: PT. Sukamaju"
                    />
                  </div>

                  <div>
                    <label className="app-label">URL Mitra</label>
                    <input
                      type="url"
                      name="url_mitra"
                      value={form.url_mitra}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="https://perusahaan.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Alamat Kantor Mitra</label>
                    <textarea
                      name="alamat_kantor_mitra"
                      required
                      rows={3}
                      value={form.alamat_kantor_mitra}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Alamat lengkap kantor mitra"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      Nama Narahubung Mitra
                    </label>
                    <input
                      type="text"
                      name="nama_narahubung_mitra"
                      required
                      value={form.nama_narahubung_mitra}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Nama PIC / HR / pembimbing lapangan"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      Nomor Kontak Narahubung Mitra
                    </label>
                    <input
                      type="text"
                      name="kontak_narahubung_mitra"
                      required
                      value={form.kontak_narahubung_mitra}
                      onChange={(e) =>
  setForm({
    ...form,
    kontak_narahubung_mitra: e.target.value.replace(/[^0-9]/g, ''),
  })
}
                      className="app-input"
                      placeholder="6285456123"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Ganti angka 0 di depan dengan 62.
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <h3 className="font-black text-[#1e3a8a] dark:text-blue-300">
                    Data Mahasiswa Pengusul
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mahasiswa Pengusul</label>
                    <input
  type="text"
  name="nama_mahasiswa_pengusul"
  required
  readOnly
  value={form.nama_mahasiswa_pengusul}
  onChange={handleChange}
  className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
  placeholder="Nama lengkap"
/>

                  <input
  type="text"
  name="npm_mahasiswa_pengusul"
  required
  readOnly
  value={form.npm_mahasiswa_pengusul}
  onChange={handleChange}
  className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
  placeholder="NPM dari data akademik"
/>

                  <div>
  <label className="app-label">Program Studi</label>
  <input
    type="text"
    name="program_studi_mahasiswa"
    required
    readOnly
    value={form.program_studi_mahasiswa}
    onChange={handleChange}
    className="app-input cursor-not-allowed bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
    placeholder="Program studi dari data akademik"
  />
</div>
</div>

                  <div>
                    <label className="app-label">Angkatan</label>
                    <input
                      type="text"
                      name="angkatan_mahasiswa"
                      required
                      value={form.angkatan_mahasiswa}
                      onChange={handleChange}
                      className="app-input"
                      placeholder="Contoh: 2022"
                    />
                  </div>

                  <div>
                    <label className="app-label">No Kontak Mahasiswa</label>
                    <input
                      type="text"
                      name="kontak_mahasiswa"
                      required
                      value={form.kontak_mahasiswa}
                      onChange={(e) =>
  setForm({
    ...form,
    kontak_mahasiswa: e.target.value.replace(/[^0-9]/g, ''),
  })
}
                      className="app-input"
                      placeholder="6285456123"
                    />
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Ganti angka 0 di depan dengan 62.
                    </p>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Mitra'}
                </button>
              </form>
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Riwayat Pengajuan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Status pengajuan mitra yang pernah kamu kirim.
              </p>

              <div className="mt-5 space-y-3">
                {pengajuanMitra.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Belum ada pengajuan mitra.
                    </p>
                  </div>
                ) : (
                  pengajuanMitra.map((item) => (
                    <div key={item.id} className="app-panel p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.nama_mitra}
                          </p>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {item.nama_narahubung_mitra}
                          </p>
                        </div>

                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </div>

                      {item.catatan_admin && (
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                          Catatan: {item.catatan_admin}
                        </p>
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