"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { User, getUsers } from '@/lib/users-client';
import {
  Pengajuan,
  getPengajuanList,
  setujuiPengajuan,
  tolakPengajuan,
} from '@/lib/pengajuan-client';

type VerifikasiForm = {
  id: number;
  nama_mahasiswa: string;
  perusahaan: string;
  tipeKonversi: string;
  matkulInput: string;
  semester_konversi: string;
  dosenId: string;
  nama_dosen: string;
};

const initialVerifikasiForm: VerifikasiForm = {
  id: 0,
  nama_mahasiswa: '',
  dosenId: '',
nama_dosen: '',
  perusahaan: '',
  tipeKonversi: 'Full',
  matkulInput: '',
  semester_konversi: 'Semester 6',
};

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (
    status === 'Menunggu_Verifikasi' ||
    status === 'Pilih_Dosen' ||
    status === 'Menunggu'
  ) {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Pilih_Dosen') return 'Pilih Dosen';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Selesai') return 'Selesai';

  return '-';
}

export default function AdminPengajuanPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
const [dosens, setDosens] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [selectedPengajuan, setSelectedPengajuan] =
    useState<Pengajuan | null>(null);

  const [verifikasiForm, setVerifikasiForm] =
    useState<VerifikasiForm>(initialVerifikasiForm);

  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

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

      if (me.role !== 'Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setPengajuans(pengajuanData?.items || []);
      setDosens(usersData.filter((item) => item.role === 'Dosen'));
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

  const filteredPengajuans = useMemo(() => {
    const keyword = search.toLowerCase();

    return pengajuans.filter((item) => {
      const matchesKeyword =
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        item.perusahaan.toLowerCase().includes(keyword) ||
        item.posisi.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [pengajuans, search, statusFilter]);

  const pendingPengajuan = pengajuans.filter(
    (item) => item.status === 'Menunggu_Verifikasi'
  );

  const pengajuanAktif = pengajuans.filter((item) => item.status === 'Aktif');

  const pengajuanSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const openApproveModal = (pengajuan: Pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setMessage('');
    setErrorMsg('');
    setRejectId(null);
    setRejectReason('');

    setVerifikasiForm({
  id: pengajuan.id,
  nama_mahasiswa: pengajuan.nama_mahasiswa,
  perusahaan: pengajuan.perusahaan,
  tipeKonversi: pengajuan.tipeKonversi || 'Full',
  matkulInput: pengajuan.matkulKonversi || '',
  semester_konversi: pengajuan.semester_konversi || 'Semester 6',
  dosenId: pengajuan.dosenId ? String(pengajuan.dosenId) : '',
  nama_dosen: pengajuan.nama_dosen || '',
});
  };

  const closeApproveModal = () => {
    setSelectedPengajuan(null);
    setVerifikasiForm(initialVerifikasiForm);
  };

  const openRejectModal = (id: number) => {
    setRejectId(id);
    setRejectReason('');
    setSelectedPengajuan(null);
    setMessage('');
    setErrorMsg('');
  };

  const closeRejectModal = () => {
    setRejectId(null);
    setRejectReason('');
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

      if (!verifikasiForm.dosenId || !verifikasiForm.nama_dosen) {
      setErrorMsg('Dosen pembimbing wajib dipilih.');
      setIsSubmitting(false);
      return;
    }
    try {
      const matkulKonversi =
        verifikasiForm.tipeKonversi === 'Tidak'
          ? []
          : verifikasiForm.matkulInput
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean);

      const result = await setujuiPengajuan({
  id: verifikasiForm.id,
  tipeKonversi: verifikasiForm.tipeKonversi,
  matkulKonversi,
  semester_konversi: verifikasiForm.semester_konversi,
  dosenId: Number(verifikasiForm.dosenId),
  nama_dosen: verifikasiForm.nama_dosen,
});

      setMessage(result.message || 'Pengajuan berhasil disetujui.');
      closeApproveModal();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menyetujui pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rejectId) return;

    if (!rejectReason.trim()) {
      setErrorMsg('Alasan penolakan wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await tolakPengajuan({
        id: rejectId,
        alasan: rejectReason.trim(),
      });

      setMessage(result.message || 'Pengajuan berhasil ditolak.');
      closeRejectModal();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menolak pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
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

  if (errorMsg && !message && !selectedPengajuan && !rejectId) {
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
          eyebrow="Admin Pengajuan"
          title={`Verifikasi Pengajuan ${currentUser?.name || ''}`}
          description="Periksa dokumen LOA mahasiswa, tentukan tipe konversi, lalu setujui atau tolak pengajuan magang."
          action={
            <Link href="/admin/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {pendingPengajuan.length > 0 && (
          <Alert variant="warning">
            Ada {pendingPengajuan.length} pengajuan yang menunggu verifikasi.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Menunggu Verifikasi"
            value={pendingPengajuan.length}
            description="Pengajuan baru yang perlu diproses."
            icon="clock"
          />

          <StatCard
            title="Magang Aktif"
            value={pengajuanAktif.length}
            description="Pengajuan yang sedang berjalan."
            icon="briefcase"
          />

          <StatCard
            title="Selesai"
            value={pengajuanSelesai.length}
            description="Magang yang sudah selesai dinilai."
            icon="check"
          />
        </section>

        <section className="app-card p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Daftar Pengajuan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Cari, filter, dan verifikasi pengajuan magang mahasiswa.
              </p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
            <div>
              <label className="app-label">Cari Pengajuan</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari nama mahasiswa, perusahaan, atau posisi..."
              />
            </div>

            <div>
              <label className="app-label">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Menunggu_Verifikasi">
                  Menunggu Verifikasi
                </option>
                <option value="Pilih_Dosen">Pilih Dosen</option>
                <option value="Aktif">Aktif</option>
                <option value="Ditolak">Ditolak</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
          </div>

          {filteredPengajuans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Pengajuan tidak ditemukan.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPengajuans.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </h3>

                        <span className={getStatusBadgeClass(item.status)}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.perusahaan} - {item.posisi}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link
                        href={`/admin/pengajuan/${item.id}`}
                        className="app-btn-secondary px-4 py-2 text-sm"
                      >
                        Detail
                      </Link>

                      {item.link_loa && (
                        <a
                          href={item.link_loa}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="app-btn-secondary px-4 py-2 text-sm"
                        >
                          Lihat LOA
                        </a>
                      )}

                      {item.status === 'Menunggu_Verifikasi' && (
                        <>
                          <button
                            type="button"
                            onClick={() => openApproveModal(item)}
                            className="app-btn-primary px-4 py-2 text-sm"
                          >
                            Setujui
                          </button>

                          <button
                            type="button"
                            onClick={() => openRejectModal(item.id)}
                            className="app-btn-danger px-4 py-2 text-sm"
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div className="app-panel p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Tanggal Mulai
                      </p>
                      <p className="mt-1 font-bold text-slate-950 dark:text-white">
                        {item.tgl_mulai || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Tanggal Berakhir
                      </p>
                      <p className="mt-1 font-bold text-slate-950 dark:text-white">
                        {item.tgl_berakhir || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Konversi
                      </p>
                      <p className="mt-1 font-bold text-slate-950 dark:text-white">
                        {item.tipeKonversi || '-'}
                      </p>
                    </div>

                    <div className="app-panel p-3">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Dosen
                      </p>
                      <p className="mt-1 font-bold text-slate-950 dark:text-white">
                        {item.nama_dosen || '-'}
                      </p>
                    </div>
                  </div>

                  {item.alasan_penolakan && (
                    <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-400/20 dark:bg-red-400/10">
                      <p className="text-xs font-black uppercase tracking-wide text-red-600 dark:text-red-300">
                        Alasan Penolakan
                      </p>
                      <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-300">
                        {item.alasan_penolakan}
                      </p>
                    </div>
                  )}
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
            onClick={closeApproveModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Verifikasi LOA
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {selectedPengajuan.nama_mahasiswa}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedPengajuan.perusahaan} - {selectedPengajuan.posisi}
              </p>
            </div>

            <form onSubmit={handleApprove} className="space-y-5">
              <div>
                <label className="app-label">Tipe Konversi</label>
                <select
                  value={verifikasiForm.tipeKonversi}
                  onChange={(e) =>
                    setVerifikasiForm({
                      ...verifikasiForm,
                      tipeKonversi: e.target.value,
                    })
                  }
                  className="app-input"
                >
                  <option value="Full">Full</option>
                  <option value="Parsial">Parsial</option>
                  <option value="Tidak">Tidak</option>
                </select>
              </div>

              {verifikasiForm.tipeKonversi !== 'Tidak' && (
                <div>
                  <label className="app-label">Mata Kuliah Konversi</label>
                  <input
                    type="text"
                    value={verifikasiForm.matkulInput}
                    onChange={(e) =>
                      setVerifikasiForm({
                        ...verifikasiForm,
                        matkulInput: e.target.value,
                      })
                    }
                    className="app-input"
                    placeholder="Contoh: Kerja Praktik, Etika Profesi"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Pisahkan dengan koma jika lebih dari satu mata kuliah.
                  </p>
                </div>
              )}

              <div>
                <label className="app-label">Semester Konversi</label>
                <input
                  type="text"
                  value={verifikasiForm.semester_konversi}
                  onChange={(e) =>
                    setVerifikasiForm({
                      ...verifikasiForm,
                      semester_konversi: e.target.value,
                    })
                  }
                  className="app-input"
                  placeholder="Contoh: Semester 6"
                />
              </div>
                    <div>
  <label className="app-label">Dosen Pembimbing</label>
  <select
    required
    value={verifikasiForm.dosenId}
    onChange={(e) => {
      const selectedDosen = dosens.find(
        (dosen) => dosen.id === Number(e.target.value)
      );

      setVerifikasiForm({
        ...verifikasiForm,
        dosenId: e.target.value,
        nama_dosen: selectedDosen?.name || '',
      });
    }}
    className="app-input"
  >
    <option value="">Pilih Dosen Pembimbing</option>
    {dosens.map((dosen) => (
      <option key={dosen.id} value={dosen.id}>
        {dosen.name}
        {dosen.kategori_dosen ? ` - ${dosen.kategori_dosen}` : ''}
      </option>
    ))}
  </select>

  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
    Dosen yang dipilih akan langsung menjadi dosen pembimbing mahasiswa.
  </p>
</div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                <p className="text-sm font-bold text-[#1e3a8a] dark:text-blue-300">
                  Setelah disetujui
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Status pengajuan akan langsung menjadi “Aktif”, dan dosen pembimbing ditentukan oleh admin.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Memproses...' : 'Setujui Pengajuan'}
                </button>

                <button
                  type="button"
                  onClick={closeApproveModal}
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

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeRejectModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-red-600 dark:text-red-300">
                Tolak Pengajuan
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                Alasan Penolakan
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Berikan alasan yang jelas agar mahasiswa dapat memperbaiki
                pengajuannya.
              </p>
            </div>

            <form onSubmit={handleReject} className="space-y-5">
              <div>
                <label className="app-label">Alasan Penolakan</label>
                <textarea
                  rows={5}
                  required
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="app-input"
                  placeholder="Contoh: Dokumen LOA belum mencantumkan periode magang..."
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-danger flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Memproses...' : 'Tolak Pengajuan'}
                </button>

                <button
                  type="button"
                  onClick={closeRejectModal}
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
  );
}