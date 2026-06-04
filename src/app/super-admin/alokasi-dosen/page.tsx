"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  getPengajuanList,
  setujuiPengajuan,
} from '@/lib/pengajuan-client';
import { User, getUsers } from '@/lib/users-client';

type AlokasiForm = {
  id: number;
  nama_mahasiswa: string;
  perusahaan: string;
  tipeKonversi: string;
  matkulInput: string;
  semester_konversi: string;
  dosenId: string;
  nama_dosen: string;
};

const initialForm: AlokasiForm = {
  id: 0,
  nama_mahasiswa: '',
  perusahaan: '',
  tipeKonversi: 'Konversi 20 SKS',
  matkulInput: '',
  semester_konversi: '',
  dosenId: '',
  nama_dosen: '',
};

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' || status === 'Menunggu') {
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

  return status || '-';
}

export default function SuperAdminAlokasiDosenPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [dosens, setDosens] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [selectedPengajuan, setSelectedPengajuan] =
    useState<Pengajuan | null>(null);
  const [form, setForm] = useState<AlokasiForm>(initialForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, pengajuanData, usersData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
        getUsers(),
      ]);

      if (me.role !== 'Super Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setPengajuans(pengajuanData.items || []);
      setDosens(usersData.filter((item) => item.role === 'Dosen'));
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data alokasi dosen.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const belumDialokasikan = useMemo(
    () =>
      pengajuans.filter(
        (item) =>
          item.status === 'Menunggu_Verifikasi' ||
          (item.status === 'Aktif' && !item.dosenId)
      ),
    [pengajuans]
  );

  const sudahDialokasikan = useMemo(
    () => pengajuans.filter((item) => item.dosenId && item.nama_dosen),
    [pengajuans]
  );

  const filteredPengajuans = useMemo(() => {
    const keyword = search.toLowerCase();

    return belumDialokasikan.filter((item) => {
      return (
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        (item.npm || '').toLowerCase().includes(keyword) ||
        item.perusahaan.toLowerCase().includes(keyword) ||
        (item.program_studi || '').toLowerCase().includes(keyword)
      );
    });
  }, [belumDialokasikan, search]);

  const openModal = (pengajuan: Pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setMessage('');
    setErrorMsg('');

    setForm({
      id: pengajuan.id,
      nama_mahasiswa: pengajuan.nama_mahasiswa,
      perusahaan: pengajuan.perusahaan,
      tipeKonversi: pengajuan.tipeKonversi || 'Konversi 20 SKS',
      matkulInput: pengajuan.matkulKonversi || '',
      semester_konversi: pengajuan.semester_konversi || '',
      dosenId: pengajuan.dosenId ? String(pengajuan.dosenId) : '',
      nama_dosen: pengajuan.nama_dosen || '',
    });
  };

  const closeModal = () => {
    setSelectedPengajuan(null);
    setForm(initialForm);
  };

  const handleDosenChange = (dosenId: string) => {
    const dosen = dosens.find((item) => String(item.id) === dosenId);

    setForm({
      ...form,
      dosenId,
      nama_dosen: dosen?.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.dosenId || !form.nama_dosen) {
      setErrorMsg('Dosen pembimbing wajib dipilih.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const matkulKonversi =
        form.tipeKonversi === 'Tidak Konversi'
          ? []
          : form.matkulInput
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);

      const result = await setujuiPengajuan({
        id: form.id,
        tipeKonversi: form.tipeKonversi,
        matkulKonversi,
        semester_konversi: form.semester_konversi,
        dosenId: Number(form.dosenId),
        nama_dosen: form.nama_dosen,
      });

      setMessage(
        result.message ||
          'Dosen pembimbing berhasil dialokasikan dan pengajuan disetujui.'
      );

      closeModal();
      await fetchData();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Gagal mengalokasikan dosen.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardShell role="Super Admin">
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
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Alokasi Dosen Pembimbing"
            description="Tetapkan dosen pembimbing untuk mahasiswa yang pengajuan magangnya telah masuk."
            action={
              <Link href="/super-admin/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Belum Dialokasikan"
              value={belumDialokasikan.length}
              description="Pengajuan yang perlu ditentukan dosennya."
              icon="clock"
            />

            <StatCard
              title="Sudah Dialokasikan"
              value={sudahDialokasikan.length}
              description="Mahasiswa yang sudah memiliki dosen pembimbing."
              icon="users"
            />

            <StatCard
              title="Total Dosen"
              value={dosens.length}
              description="Dosen yang tersedia di sistem."
              icon="briefcase"
            />
          </section>

          <section className="app-card p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Daftar Pengajuan Belum Dialokasikan
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Pilih mahasiswa untuk menetapkan dosen pembimbing.
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input md:max-w-xs"
                placeholder="Cari nama/NPM/prodi/perusahaan..."
              />
            </div>

            {filteredPengajuans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Tidak ada pengajuan yang perlu dialokasikan.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredPengajuans.map((item) => (
                  <article key={item.id} className="app-panel p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black text-slate-950 dark:text-white">
                            {item.nama_mahasiswa}
                          </h3>
                          <span className={getStatusBadgeClass(item.status)}>
                            {getStatusLabel(item.status)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                          {item.npm || '-'} • {item.program_studi || '-'} •{' '}
                          {item.kelas || '-'}
                        </p>

                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {item.perusahaan} - {item.posisi}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => openModal(item)}
                        className="app-btn-primary px-4 py-2 text-sm"
                      >
                        Alokasikan Dosen
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {selectedPengajuan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeModal}
            />

            <div className="animate-scale-in relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Alokasi Dosen
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {selectedPengajuan.nama_mahasiswa}
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedPengajuan.perusahaan} - {selectedPengajuan.posisi}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="app-label">Dosen Pembimbing</label>
                  <select
                    value={form.dosenId}
                    onChange={(e) => handleDosenChange(e.target.value)}
                    className="app-input"
                  >
                    <option value="">Pilih dosen</option>
                    {dosens.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.name} - {dosen.prodi || '-'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label">Tipe Konversi</label>
                  <select
                    value={form.tipeKonversi}
                    onChange={(e) =>
                      setForm({ ...form, tipeKonversi: e.target.value })
                    }
                    className="app-input"
                  >
                    <option value="Konversi 20 SKS">Konversi 20 SKS</option>
                    <option value="Tidak Konversi">Tidak Konversi</option>
                    <option value="Konversi 2 SKS">
                      Konversi 2 SKS khusus Sistem Informasi
                    </option>
                  </select>
                </div>

                {form.tipeKonversi !== 'Tidak Konversi' && (
                  <div>
                    <label className="app-label">Mata Kuliah Konversi</label>
                    <input
                      type="text"
                      value={form.matkulInput}
                      onChange={(e) =>
                        setForm({ ...form, matkulInput: e.target.value })
                      }
                      className="app-input"
                      placeholder="Pisahkan dengan koma, contoh: Magang, Proyek Independen"
                    />
                  </div>
                )}

                <div>
                  <label className="app-label">Semester Konversi</label>
                  <input
                    type="text"
                    value={form.semester_konversi}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        semester_konversi: e.target.value,
                      })
                    }
                    className="app-input"
                    placeholder="Contoh: Semester 7"
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Alokasi'}
                  </button>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}