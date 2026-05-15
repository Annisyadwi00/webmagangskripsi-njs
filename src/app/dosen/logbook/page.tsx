"use client";

import { useEffect, useState } from 'react';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Logbook,
  LogbookStatus,
  evaluasiLogbook,
  getLogbookList,
} from '@/lib/logbook-client';

function getStatusBadgeClass(status?: string) {
  if (status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

export default function EvaluasiLogbookDosenPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);

  const [status, setStatus] = useState<LogbookStatus>('Disetujui');
  const [komentarDosen, setKomentarDosen] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, logbookData] = await Promise.all([
        getCurrentUserClient(),
        getLogbookList(),
      ]);

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setLogbooks(logbookData);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data logbook.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEvaluasiModal = (logbook: Logbook) => {
    setSelectedLogbook(logbook);
    setStatus(logbook.status === 'Revisi' ? 'Revisi' : 'Disetujui');
    setKomentarDosen(logbook.komentar_dosen || '');
    setMessage('');
    setErrorMsg('');
  };

  const closeEvaluasiModal = () => {
    setSelectedLogbook(null);
    setStatus('Disetujui');
    setKomentarDosen('');
  };

  const handleSubmitEvaluasi = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLogbook) return;

    if (status === 'Revisi' && !komentarDosen.trim()) {
      setErrorMsg('Komentar wajib diisi jika status Revisi.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await evaluasiLogbook({
        logbook_id: selectedLogbook.id,
        status,
        komentar_dosen: komentarDosen.trim() || null,
      });

      setMessage(result.message || 'Evaluasi logbook berhasil disimpan.');
      closeEvaluasiModal();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan evaluasi logbook.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const logbookMenunggu = logbooks.filter((item) => item.status === 'Menunggu');
  const logbookDisetujui = logbooks.filter(
    (item) => item.status === 'Disetujui'
  );
  const logbookRevisi = logbooks.filter((item) => item.status === 'Revisi');

  if (isLoading) {
    return (
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
    );
  }

  if (errorMsg && !selectedLogbook) {
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
          eyebrow="Evaluasi Logbook"
          title={`Review Logbook ${user?.name || ''}`}
          description="Periksa aktivitas harian mahasiswa bimbingan dan berikan keputusan evaluasi secara jelas."
          action={
            <Link href="/dosen/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {logbookMenunggu.length > 0 && (
          <Alert variant="warning">
            Ada {logbookMenunggu.length} logbook yang masih menunggu evaluasi.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Menunggu Evaluasi"
            value={logbookMenunggu.length}
            description="Logbook yang perlu direview."
            icon="clock"
          />

          <StatCard
            title="Disetujui"
            value={logbookDisetujui.length}
            description="Logbook sudah valid."
            icon="check"
          />

          <StatCard
            title="Revisi"
            value={logbookRevisi.length}
            description="Logbook perlu diperbaiki mahasiswa."
            icon="warning"
          />
        </section>

        <section className="app-card p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Daftar Logbook Mahasiswa
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Review kegiatan, bukti aktivitas, dan status evaluasi logbook.
              </p>
            </div>
          </div>

          {logbooks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Belum ada logbook mahasiswa bimbingan.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Logbook akan muncul setelah mahasiswa mengisi aktivitas magang.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-black">Tanggal</th>
                    <th className="px-5 py-4 font-black">Waktu</th>
                    <th className="px-5 py-4 font-black">Kegiatan</th>
                    <th className="px-5 py-4 font-black">Bukti</th>
                    <th className="px-5 py-4 font-black">Status</th>
                    <th className="px-5 py-4 font-black">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {logbooks.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-5 py-4 font-black text-slate-950">
                        {item.tanggal}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.jam_mulai} - {item.jam_selesai}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        <p className="line-clamp-3 max-w-md">
                          {item.kegiatan}
                        </p>

                        {item.komentar_dosen && (
                          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                              Komentar Dosen
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {item.komentar_dosen}
                            </p>
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {item.bukti_kegiatan ? (
                          <a
                            href={item.bukti_kegiatan}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-black text-[#1e3a8a] hover:underline"
                          >
                            Lihat Bukti
                          </a>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openEvaluasiModal(item)}
                          className="app-btn-primary px-4 py-2 text-sm"
                        >
                          Evaluasi
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {selectedLogbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeEvaluasiModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                Form Evaluasi
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                Evaluasi Logbook
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Tanggal {selectedLogbook.tanggal}, pukul{' '}
                {selectedLogbook.jam_mulai} - {selectedLogbook.jam_selesai}
              </p>
            </div>

            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-500">Kegiatan</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {selectedLogbook.kegiatan}
              </p>
            </div>

            <form onSubmit={handleSubmitEvaluasi} className="space-y-5">
              <div>
                <label className="app-label">Status Evaluasi</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LogbookStatus)}
                  className="app-input"
                >
                  <option value="Disetujui">Disetujui</option>
                  <option value="Revisi">Revisi</option>
                </select>
              </div>

              <div>
                <label className="app-label">
                  Komentar Dosen {status === 'Revisi' ? '(Wajib)' : '(Opsional)'}
                </label>
                <textarea
                  rows={4}
                  value={komentarDosen}
                  onChange={(e) => setKomentarDosen(e.target.value)}
                  className="app-input"
                  placeholder={
                    status === 'Revisi'
                      ? 'Tuliskan bagian yang perlu diperbaiki mahasiswa...'
                      : 'Tambahkan catatan singkat bila diperlukan...'
                  }
                />
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-bold text-[#1e3a8a]">
                  Catatan Evaluasi
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Gunakan status “Revisi” jika aktivitas belum jelas, bukti tidak
                  sesuai, atau laporan perlu diperbaiki. Gunakan “Disetujui”
                  jika logbook sudah valid.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Evaluasi'}
                </button>

                <button
                  type="button"
                  onClick={closeEvaluasiModal}
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