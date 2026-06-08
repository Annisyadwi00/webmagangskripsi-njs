"use client";
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  getPengajuanList,
  setujuiPengajuan,
  tolakPengajuan,
} from '@/lib/pengajuan-client';
import { User, getUsers } from '@/lib/users-client';
import DashboardShell from '@/components/dashboard/DashboardShell';

type VerifikasiForm = {
  id: number;
  nama_mahasiswa: string;
  perusahaan: string;
  dosenId: string;
  nama_dosen: string;
};

const initialVerifikasiForm: VerifikasiForm = {
  id: 0,
  nama_mahasiswa: '',
  perusahaan: '',
  dosenId: '',
  nama_dosen: '',
};

function getBuktiPenerimaanLink(item: {
  bukti_penerimaan?: string | null;
  link_loa?: string | null;
}) {
  return item.bukti_penerimaan || item.link_loa || '';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (
    status === 'Menunggu_Verifikasi' ||
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
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Disetujui') return 'Disetujui';
  if (status === 'Menunggu') return 'Menunggu';

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

const [detailPengajuan, setDetailPengajuan] = useState<Pengajuan | null>(null);

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

     if (me.role !== 'Super Admin') {
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
        item.posisi.toLowerCase().includes(keyword) ||
        (item.npm || '').toLowerCase().includes(keyword) ||
        (item.program_studi || '').toLowerCase().includes(keyword) ||
        (item.jenis_magang || '').toLowerCase().includes(keyword);

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
  setDetailPengajuan(null);

  setVerifikasiForm({
    id: pengajuan.id,
    nama_mahasiswa: pengajuan.nama_mahasiswa,
    perusahaan: pengajuan.perusahaan,
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
  setDetailPengajuan(null);
  setMessage('');
  setErrorMsg('');
};

 const openDetailModal = (pengajuan: Pengajuan) => {
  setDetailPengajuan(pengajuan);
  setSelectedPengajuan(null);
  setRejectId(null);
  setMessage('');
  setErrorMsg('');
};

const closeDetailModal = () => {
  setDetailPengajuan(null);
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

      const result = await setujuiPengajuan({
  id: verifikasiForm.id,
  dosenId: Number(verifikasiForm.dosenId),
  nama_dosen: verifikasiForm.nama_dosen,
});

      setMessage(
        result.message ||
          'Pengajuan berhasil disetujui dan dosen pembimbing berhasil ditentukan.'
      );

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
      <DashboardShell role="Super Admin">
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
      </DashboardShell>
    );
  }

  if (errorMsg && !message && !selectedPengajuan && !rejectId) {
    return (
<DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
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
          eyebrow="staff"
title="Pengajuan Mahasiswa Magang"
          description="Pantau pengajuan magang mahasiswa, verifikasi data, dan tetapkan dosen pembimbing."
          action={
            <Link href="/super-admin/dashboard" className="app-btn-secondary">
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
                Cari, filter, dan verifikasi pendataan magang mahasiswa.
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
                placeholder="Cari nama, NPM, perusahaan, prodi, atau jenis magang..."
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
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
    {filteredPengajuans.map((item) => {
      const buktiLink = getBuktiPenerimaanLink(item);

      return (
        <article
          key={item.id}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-black text-slate-950 dark:text-white">
                {item.nama_mahasiswa}
              </h3>

              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                {item.npm || '-'} • {item.program_studi || '-'}
              </p>
            </div>

            <span className={getStatusBadgeClass(item.status)}>
              {getStatusLabel(item.status)}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Perusahaan
              </p>
              <p className="mt-1 font-black text-slate-950 dark:text-white">
                {item.perusahaan || '-'}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Jenis Magang
              </p>
              <p className="mt-1 font-black text-slate-950 dark:text-white">
                {item.jenis_magang || '-'}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => openDetailModal(item)}
              className="app-btn-secondary px-3 py-2 text-sm"
            >
              Lihat Detail
            </button>

            {buktiLink ? (
              <a
                href={buktiLink}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-secondary px-3 py-2 text-center text-sm"
              >
                Lihat Bukti
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="app-btn-secondary px-3 py-2 text-sm opacity-50"
              >
                Lihat Bukti
              </button>
            )}

            {item.foto_diri ? (
              <a
                href={item.foto_diri}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-secondary px-3 py-2 text-center text-sm"
              >
                Lihat Foto
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="app-btn-secondary px-3 py-2 text-sm opacity-50"
              >
                Lihat Foto
              </button>
            )}

            {item.status === 'Menunggu_Verifikasi' ? (
              <>
                <button
                  type="button"
                  onClick={() => openApproveModal(item)}
                  className="app-btn-primary px-3 py-2 text-sm"
                >
                  Setujui
                </button>

                <button
                  type="button"
                  onClick={() => openRejectModal(item.id)}
                  className="app-btn-danger col-span-2 px-3 py-2 text-sm"
                >
                  Tolak
                </button>
              </>
            ) : (
              <div className="col-span-2 rounded-2xl bg-slate-100 px-3 py-2 text-center text-sm font-black text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Sudah Diproses
              </div>
            )}
          </div>
        </article>
      );
    })}
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

          <div className="animate-scale-in relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
            <div className="overflow-y-auto p-6">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Verifikasi Pengajuan Magang
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {selectedPengajuan.nama_mahasiswa}
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedPengajuan.perusahaan} - {selectedPengajuan.posisi}
                </p>
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

                    {dosens.map((dosen) => {
                      const dosenData = dosen as User & {
                        kategori_dosen?: string | null;
                      };

                      return (
                        <option key={dosen.id} value={dosen.id}>
                          {dosen.name}
                          {dosenData.kategori_dosen
                            ? ` - ${dosenData.kategori_dosen}`
                            : ''}
                        </option>
                      );
                    })}
                  </select>

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Dosen yang dipilih akan langsung menjadi dosen pembimbing
                    mahasiswa.
                  </p>
                </div>

                {dosens.length === 0 && (
                  <Alert variant="warning">
                    Belum ada data dosen di sistem. Tambahkan akun dosen
                    terlebih dahulu melalui menu Pengguna.
                  </Alert>
                )}

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <p className="text-sm font-bold text-[#1e3a8a] dark:text-blue-300">
                    Setelah disetujui
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Status pengajuan akan langsung menjadi “Aktif”. Dosen
                    pembimbing yang dipilih admin akan menjadi DPM mahasiswa
                    sesuai alur penentuan dosen pembimbing magang.
                  </p>
                </div>

                <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col gap-3 border-t border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900 sm:flex-row">
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

            <form onSubmit={handleApprove} className="space-y-5">
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Mahasiswa
      </p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">
        {selectedPengajuan.nama_mahasiswa}
      </p>
    </div>

    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        Perusahaan
      </p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">
        {selectedPengajuan.perusahaan}
      </p>
    </div>
  </div>

  <div>
    <label className="app-label">Dosen Pembimbing</label>
    <select
      required
      value={verifikasiForm.dosenId}
      onChange={(e) => {
        const selectedDosen = dosens.find(
          (item) => String(item.id) === e.target.value
        );

        setVerifikasiForm((prev) => ({
          ...prev,
          dosenId: e.target.value,
          nama_dosen: selectedDosen?.name || '',
        }));
      }}
      className="app-input"
    >
      <option value="">Pilih dosen pembimbing</option>
      {dosens.map((dosen) => (
        <option key={dosen.id} value={dosen.id}>
          {dosen.name}
        </option>
      ))}
    </select>
  </div>

  <div className="flex flex-col gap-3 sm:flex-row">
    <button
      type="button"
      onClick={closeApproveModal}
      className="app-btn-secondary flex-1"
    >
      Batal
    </button>

    <button
      type="submit"
      disabled={isSubmitting}
      className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? 'Menyimpan...' : 'Setujui Pengajuan'}
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