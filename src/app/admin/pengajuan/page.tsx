"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
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

type VerifikasiForm = {
  id: number;
  nama_mahasiswa: string;
  perusahaan: string;
  dosenId: string;
  nama_dosen: string;
  dosenPengujiId: string;
  nama_dosen_penguji: string;
};

const initialVerifikasiForm: VerifikasiForm = {
  id: 0,
  nama_mahasiswa: '',
  perusahaan: '',
  dosenId: '',
  nama_dosen: '',
  dosenPengujiId: '',
  nama_dosen_penguji: '',
};

function getBuktiPenerimaanLink(item: {
  bukti_penerimaan?: string | null;
  link_loa?: string | null;
}) {
  return item.bukti_penerimaan || item.link_loa || '';
}

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';

  return value || '-';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
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
  if (status === 'Ditolak') return 'Ditolak';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Disetujui') return 'Disetujui';
  if (status === 'Menunggu') return 'Menunggu';

  return '-';
}

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words font-black text-slate-950 dark:text-white">
        {value || '-'}
      </p>
    </div>
  );
}

export default function AdminPengajuanPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [dosens, setDosens] = useState<User[]>([]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [selectedPengajuan, setSelectedPengajuan] =
    useState<Pengajuan | null>(null);
  const [detailPengajuan, setDetailPengajuan] = useState<Pengajuan | null>(
    null
  );

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
      setDosens((usersData || []).filter((item) => item.role === 'Dosen'));
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
      const nama = item.nama_mahasiswa || '';
      const perusahaan = item.perusahaan || '';
      const posisi = item.posisi || '';
      const npm = item.npm || '';
      const prodi = item.program_studi || '';
      const jenisMagang = getJenisMagangLabel(item.jenis_magang);

      const matchesKeyword =
        nama.toLowerCase().includes(keyword) ||
        perusahaan.toLowerCase().includes(keyword) ||
        posisi.toLowerCase().includes(keyword) ||
        npm.toLowerCase().includes(keyword) ||
        prodi.toLowerCase().includes(keyword) ||
        jenisMagang.toLowerCase().includes(keyword);

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
      dosenPengujiId: pengajuan.dosenPengujiId
        ? String(pengajuan.dosenPengujiId)
        : '',
      nama_dosen_penguji: pengajuan.nama_dosen_penguji || '',
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

  const closeRejectModal = () => {
    setRejectId(null);
    setRejectReason('');
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

  const handleSelectDosenPembimbing = (value: string) => {
    const selected = dosens.find((item) => String(item.id) === value);

    setVerifikasiForm((prev) => ({
      ...prev,
      dosenId: value,
      nama_dosen: selected?.name || '',
    }));
  };

  const handleSelectDosenPenguji = (value: string) => {
    const selected = dosens.find((item) => String(item.id) === value);

    setVerifikasiForm((prev) => ({
      ...prev,
      dosenPengujiId: value,
      nama_dosen_penguji: selected?.name || '',
    }));
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
        dosenPengujiId: verifikasiForm.dosenPengujiId
          ? Number(verifikasiForm.dosenPengujiId)
          : null,
        nama_dosen_penguji: verifikasiForm.nama_dosen_penguji || null,
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
      <DashboardShell role="Admin">
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
      <DashboardShell role="Admin">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <Alert variant="error">{errorMsg}</Alert>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Admin Pengajuan"
            title={`Verifikasi Pengajuan ${currentUser?.name || ''}`}
            description="Periksa data pendataan magang mahasiswa, bukti penerimaan, lalu tentukan dosen pembimbing dan dosen penguji."
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
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            {filteredPengajuans.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
                <p className="font-bold text-slate-500 dark:text-slate-400">
                  Data pengajuan tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                      <th className="px-4 py-3">Mahasiswa</th>
                      <th className="px-4 py-3">Tempat Magang</th>
                      <th className="px-4 py-3">Jenis</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Dosen</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPengajuans.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 dark:border-slate-800"
                      >
                        <td className="px-4 py-4 align-top">
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.nama_mahasiswa}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.npm || '-'} • {item.program_studi || '-'}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.perusahaan}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.posisi || 'Peserta Magang'}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {getJenisMagangLabel(item.jenis_magang)}
                          </p>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <span className={getStatusBadgeClass(item.status)}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {item.nama_dosen || '-'}
                          </p>
                          {item.nama_dosen_penguji && (
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              Penguji: {item.nama_dosen_penguji}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col items-stretch gap-2 sm:items-end">
                            <button
                              type="button"
                              onClick={() => openDetailModal(item)}
                              className="app-btn-secondary px-3 py-2 text-xs"
                            >
                              Detail
                            </button>

                            {item.status === 'Menunggu_Verifikasi' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openApproveModal(item)}
                                  className="app-btn-primary px-3 py-2 text-xs"
                                >
                                  Setujui
                                </button>

                                <button
                                  type="button"
                                  onClick={() => openRejectModal(item.id)}
                                  className="app-btn-danger px-3 py-2 text-xs"
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {detailPengajuan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeDetailModal}
            />

            <div className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                    Detail Pengajuan
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                    {detailPengajuan.nama_mahasiswa}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {detailPengajuan.perusahaan} •{' '}
                    {getJenisMagangLabel(detailPengajuan.jenis_magang)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDetailModal}
                  className="app-btn-secondary"
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <DetailItem
                  label="Nama Mahasiswa"
                  value={detailPengajuan.nama_mahasiswa}
                />
                <DetailItem label="NPM" value={detailPengajuan.npm} />
                <DetailItem
                  label="Program Studi"
                  value={detailPengajuan.program_studi}
                />
                <DetailItem label="Angkatan" value={detailPengajuan.angkatan} />
                <DetailItem label="Kelas" value={detailPengajuan.kelas} />
                <DetailItem
                  label="Jenis Magang"
                  value={getJenisMagangLabel(detailPengajuan.jenis_magang)}
                />
                <DetailItem
                  label="Nomor HP"
                  value={detailPengajuan.no_hp_mahasiswa}
                />
                <DetailItem
                  label="Perusahaan"
                  value={detailPengajuan.perusahaan}
                />
                <DetailItem label="Posisi" value={detailPengajuan.posisi} />
                <DetailItem
                  label="Tanggal Mulai"
                  value={formatDate(detailPengajuan.tgl_mulai)}
                />
                <DetailItem
                  label="Tanggal Berakhir"
                  value={formatDate(detailPengajuan.tgl_berakhir)}
                />
                <DetailItem
                  label="Dosen Pembimbing"
                  value={detailPengajuan.nama_dosen}
                />
                <DetailItem
                  label="Dosen Penguji"
                  value={detailPengajuan.nama_dosen_penguji}
                />
                <DetailItem
                  label="Status"
                  value={getStatusLabel(detailPengajuan.status)}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Alamat Tempat Magang
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {detailPengajuan.alamat_tempat_magang || '-'}
                  </p>
                </div>

                <div className="app-panel p-4">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Rencana Magang
                  </p>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {detailPengajuan.rencana_magang || '-'}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {getBuktiPenerimaanLink(detailPengajuan) && (
                  <a
                    href={getBuktiPenerimaanLink(detailPengajuan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn-secondary"
                  >
                    Buka Bukti Penerimaan
                  </a>
                )}

                {detailPengajuan.foto_diri && (
                  <a
                    href={detailPengajuan.foto_diri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn-secondary"
                  >
                    Buka Foto Diri
                  </a>
                )}

                {detailPengajuan.link_laporan_akhir && (
                  <a
                    href={detailPengajuan.link_laporan_akhir}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn-secondary"
                  >
                    Buka Laporan
                  </a>
                )}

                {detailPengajuan.link_output_magang && (
                  <a
                    href={detailPengajuan.link_output_magang}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="app-btn-secondary"
                  >
                    Buka Output Magang
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedPengajuan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeApproveModal}
            />

            <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Setujui Pengajuan
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {selectedPengajuan.nama_mahasiswa}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedPengajuan.perusahaan} •{' '}
                  {getJenisMagangLabel(selectedPengajuan.jenis_magang)}
                </p>
              </div>

              <form onSubmit={handleApprove} className="space-y-5">
                <div>
                  <label className="app-label">Dosen Pembimbing</label>
                  <select
                    value={verifikasiForm.dosenId}
                    onChange={(e) => handleSelectDosenPembimbing(e.target.value)}
                    className="app-input"
                  >
                    <option value="">Pilih dosen pembimbing</option>
                    {dosens.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.name}
                        {dosen.nim_nidn ? ` - ${dosen.nim_nidn}` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="app-label">Dosen Penguji</label>
                  <select
                    value={verifikasiForm.dosenPengujiId}
                    onChange={(e) => handleSelectDosenPenguji(e.target.value)}
                    className="app-input"
                  >
                    <option value="">Pilih dosen penguji jika sudah ada</option>
                    {dosens.map((dosen) => (
                      <option key={dosen.id} value={dosen.id}>
                        {dosen.name}
                        {dosen.nim_nidn ? ` - ${dosen.nim_nidn}` : ''}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Dosen penguji hanya untuk kebutuhan internal staff dan tidak
                    ditampilkan ke mahasiswa.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                    Ringkasan
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Pengajuan akan disetujui, status magang menjadi aktif, dan
                    mahasiswa dapat mengunggah dokumen magang sesuai jenis
                    magangnya.
                  </p>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
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

            <div className="relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-red-600 dark:text-red-300">
                  Tolak Pengajuan
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Alasan Penolakan
                </h2>
              </div>

              <form onSubmit={handleReject} className="space-y-5">
                <div>
                  <label className="app-label">Alasan</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="app-input min-h-32"
                    placeholder="Tuliskan alasan penolakan agar mahasiswa dapat memperbaiki data."
                  />
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
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
    </DashboardShell>
  );
}