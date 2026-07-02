"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  PengajuanLowongan,
  PengajuanLowonganStatus,
  getPengajuanLowonganList,
  updateStatusPengajuanLowongan,
} from '@/lib/pengajuan-lowongan-client';

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Disetujui') return 'app-badge app-badge-green';
  if (status === 'Ditolak') return 'app-badge app-badge-red';
  return 'app-badge app-badge-yellow';
}

function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words font-black text-slate-950 dark:text-white whitespace-pre-line">
        {value || '-'}
      </p>
    </div>
  );
}

export default function PengajuanLowonganView({ role = 'Admin' }: { role?: string }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [list, setList] = useState<PengajuanLowongan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal detail & action
  const [detailItem, setDetailItem] = useState<PengajuanLowongan | null>(null);
  const [selectedItem, setSelectedItem] = useState<PengajuanLowongan | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<PengajuanLowonganStatus>('Disetujui');
  const [catatanAdmin, setCatatanAdmin] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getPengajuanLowonganList();
      setList(data);
    } catch (err) {
      setErrorMsg('Gagal memuat daftar pengajuan lowongan.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const user = getCurrentUserClient();
    setCurrentUser(user);
    fetchData();
  }, []);

  const totalMenunggu = useMemo(() => list.filter((item) => item.status === 'Menunggu').length, [list]);
  const totalDisetujui = useMemo(() => list.filter((item) => item.status === 'Disetujui').length, [list]);
  const totalDitolak = useMemo(() => list.filter((item) => item.status === 'Ditolak').length, [list]);

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        item.posisi.toLowerCase().includes(q) ||
        item.nama_mitra.toLowerCase().includes(q) ||
        item.nama_pic.toLowerCase().includes(q);
      return matchStatus && matchSearch;
    });
  }, [list, filterStatus, searchQuery]);

  const openStatusModal = (item: PengajuanLowongan, status: PengajuanLowonganStatus) => {
    setSelectedItem(item);
    setSelectedStatus(status);
    setCatatanAdmin(item.catatan_super_admin || '');
    setMessage('');
    setErrorMsg('');
  };

  const closeStatusModal = () => {
    setSelectedItem(null);
    setCatatanAdmin('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    if (selectedStatus === 'Ditolak' && !catatanAdmin.trim()) {
      setErrorMsg('Catatan wajib diisi jika pengajuan ditolak.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await updateStatusPengajuanLowongan({
        id: selectedItem.id,
        status: selectedStatus,
        catatan_super_admin: catatanAdmin.trim() || null,
      });

      setMessage(`Status pengajuan lowongan berhasil diubah menjadi ${selectedStatus}.`);
      closeStatusModal();
      await fetchData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memperbarui status pengajuan lowongan.';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow={role}
          title="Verifikasi Pengajuan Lowongan"
          description="Periksa dan kelola lowongan magang yang diajukan oleh mitra atau mahasiswa. Lowongan yang disetujui akan otomatis terbit ke halaman lowongan utama."
          action={
            <Link href={`/${role.toLowerCase().replace(' ', '-')}/dashboard`} className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {totalMenunggu > 0 && (
          <Alert variant="warning">
            Ada {totalMenunggu} pengajuan lowongan yang menunggu verifikasi Anda!
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Menunggu"
            value={totalMenunggu}
            description="Perlu verifikasi & evaluasi."
            icon="clock"
          />
          <StatCard
            title="Disetujui"
            value={totalDisetujui}
            description="Sudah aktif & terbit di bursa kerja."
            icon="check"
          />
          <StatCard
            title="Ditolak"
            value={totalDitolak}
            description="Lowongan yang belum memenuhi syarat."
            icon="x"
          />
        </section>

        <section className="app-panel p-6">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['Semua', 'Menunggu', 'Disetujui', 'Ditolak'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    filterStatus === st
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari posisi, mitra, atau PIC..."
                className="app-input w-full"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              Memuat daftar pengajuan lowongan...
            </div>
          ) : filteredList.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              Tidak ada data pengajuan lowongan yang sesuai.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-black uppercase text-slate-400 dark:border-slate-800">
                    <th className="py-3 px-4">Posisi & Mitra</th>
                    <th className="py-3 px-4">PIC / Kontak</th>
                    <th className="py-3 px-4">Sistem & Konversi</th>
                    <th className="py-3 px-4 text-center">Kuota</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Tanggal</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm dark:divide-slate-800">
                  {filteredList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="py-4 px-4">
                        <p className="font-black text-slate-900 dark:text-white">{item.posisi}</p>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{item.nama_mitra}</p>
                        {item.lokasi && <p className="text-[11px] text-slate-400">📍 {item.lokasi}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800 dark:text-slate-200">{item.nama_pic}</p>
                        <p className="text-xs text-slate-500">📞 {item.kontak_pic}</p>
                        {item.email_pic && <p className="text-xs text-slate-400">✉️ {item.email_pic}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.sistem_kerja}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">{item.tipe_konversi}</p>
                      </td>
                      <td className="py-4 px-4 text-center font-black text-slate-700 dark:text-slate-300">
                        {item.kuota} org
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailItem(item)}
                            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            Detail
                          </button>

                          {item.status !== 'Disetujui' && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(item, 'Disetujui')}
                              className="rounded-xl bg-green-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700"
                            >
                              Setujui
                            </button>
                          )}

                          {item.status !== 'Ditolak' && (
                            <button
                              type="button"
                              onClick={() => openStatusModal(item, 'Ditolak')}
                              className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                            >
                              Tolak
                            </button>
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

        {/* Modal Detail */}
        {detailItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="app-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <span className={getStatusBadgeClass(detailItem.status)}>{detailItem.status}</span>
                  <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                    {detailItem.posisi} - {detailItem.nama_mitra}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem label="Nama Mitra / Perusahaan" value={detailItem.nama_mitra} />
                <DetailItem label="Posisi Lowongan" value={detailItem.posisi} />
                <DetailItem label="Nama PIC" value={detailItem.nama_pic} />
                <DetailItem label="Kontak & Email PIC" value={`${detailItem.kontak_pic}\n${detailItem.email_pic || '-'}`} />
                <DetailItem label="Sistem Kerja" value={detailItem.sistem_kerja} />
                <DetailItem label="Tipe Konversi SKS" value={detailItem.tipe_konversi} />
                <DetailItem label="Kuota Magang" value={`${detailItem.kuota} Mahasiswa`} />
                <DetailItem label="Lokasi Kerja" value={detailItem.lokasi || 'Menyesuaikan'} />
                <DetailItem label="Alamat Kantor Mitra" value={detailItem.alamat_mitra} />
                <DetailItem label="Website Mitra" value={detailItem.website_mitra} />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <DetailItem label="Deskripsi Lowongan" value={detailItem.deskripsi} />
                <DetailItem label="Persyaratan Khusus" value={detailItem.persyaratan} />
                {detailItem.link_pendaftaran && (
                  <div className="app-panel p-4 bg-blue-50/50 dark:bg-blue-950/20">
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Link Pendaftaran Eksternal</p>
                    <a
                      href={detailItem.link_pendaftaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm font-bold text-blue-600 underline dark:text-blue-300"
                    >
                      {detailItem.link_pendaftaran}
                    </a>
                  </div>
                )}
                {detailItem.catatan_super_admin && (
                  <DetailItem label="Catatan Evaluasi Staff" value={detailItem.catatan_super_admin} />
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="app-btn-secondary"
                >
                  Tutup
                </button>
                {detailItem.status !== 'Disetujui' && (
                  <button
                    type="button"
                    onClick={() => {
                      const item = detailItem;
                      setDetailItem(null);
                      openStatusModal(item, 'Disetujui');
                    }}
                    className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white hover:bg-green-700"
                  >
                    Setujui & Terbitkan
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal Status Update */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <div className="app-panel w-full max-w-md p-6 shadow-2xl">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Konversi Status Lowongan
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Ubah status pengajuan untuk posisi <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.posisi}</span> di <span className="font-bold text-slate-800 dark:text-slate-200">{selectedItem.nama_mitra}</span>.
              </p>

              <form onSubmit={handleUpdateStatus} className="mt-6 space-y-4">
                <div>
                  <label className="app-label">Status Verifikasi</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as PengajuanLowonganStatus)}
                    className="app-input w-full"
                  >
                    <option value="Disetujui">✅ Disetujui (Terbitkan Lowongan)</option>
                    <option value="Ditolak">❌ Ditolak (Kembalikan/Tolak)</option>
                    <option value="Menunggu">⏳ Menunggu Pemeriksaan</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">
                    Catatan Staff {selectedStatus === 'Ditolak' ? '<span className="text-red-500">*</span>' : '(Opsional)'}
                  </label>
                  <textarea
                    value={catatanAdmin}
                    onChange={(e) => setCatatanAdmin(e.target.value)}
                    rows={3}
                    className="app-input w-full"
                    placeholder="Berikan alasan atau catatan perbaikan jika ada..."
                  />
                  {selectedStatus === 'Ditolak' && (
                    <p className="mt-1 text-[11px] text-red-500">Catatan wajib diisi bila lowongan ditolak.</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeStatusModal}
                    disabled={isSubmitting}
                    className="app-btn-secondary"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`rounded-xl px-5 py-2.5 font-bold text-white shadow-md transition ${
                      selectedStatus === 'Disetujui'
                        ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20'
                        : selectedStatus === 'Ditolak'
                        ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                        : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                    }`}
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Status'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
