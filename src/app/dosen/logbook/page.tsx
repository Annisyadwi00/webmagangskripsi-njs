"use client";

import { useEffect, useState } from 'react';
import {
  Logbook,
  LogbookStatus,
  evaluasiLogbook,
  getLogbookList,
} from '@/lib/logbook-client';

export default function EvaluasiLogbookDosenPage() {
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);
  const [selectedLogbook, setSelectedLogbook] = useState<Logbook | null>(null);

  const [status, setStatus] = useState<LogbookStatus>('Disetujui');
  const [komentarDosen, setKomentarDosen] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLogbooks = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const data = await getLogbookList();
      setLogbooks(data);
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
    fetchLogbooks();
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
      await fetchLogbooks();
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

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat data logbook bimbingan...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Evaluasi Logbook Mahasiswa
        </h1>
        <p className="text-gray-500 mt-1">
          Review kegiatan harian mahasiswa bimbingan dan berikan status evaluasi.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 font-medium">
          {message}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      <section className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            Daftar Logbook
          </h2>
        </div>

        {logbooks.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500">
              Belum ada logbook mahasiswa bimbingan.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4 text-left">Tanggal</th>
                  <th className="px-5 py-4 text-left">Jam</th>
                  <th className="px-5 py-4 text-left">Kegiatan</th>
                  <th className="px-5 py-4 text-left">Bukti</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Komentar</th>
                  <th className="px-5 py-4 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {logbooks.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-4 font-medium text-gray-900">
                      {item.tanggal}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.jam_mulai} - {item.jam_selesai}
                    </td>

                    <td className="px-5 py-4 text-gray-700 max-w-md">
                      {item.kegiatan}
                    </td>

                    <td className="px-5 py-4">
                      {item.bukti_kegiatan ? (
                        <a
                          href={item.bukti_kegiatan}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 font-bold hover:underline"
                        >
                          Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {item.komentar_dosen || '-'}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => openEvaluasiModal(item)}
                        className="px-3 py-2 rounded-lg bg-[#1e3a8a] text-white font-bold hover:bg-blue-900"
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

      {selectedLogbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={closeEvaluasiModal}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Evaluasi Logbook
            </h3>

            <p className="text-sm text-gray-500 mb-5">
              Tanggal: {selectedLogbook.tanggal}
            </p>

            <div className="mb-5 rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-sm font-bold text-gray-700 mb-1">
                Kegiatan
              </p>
              <p className="text-sm text-gray-600">
                {selectedLogbook.kegiatan}
              </p>
            </div>

            <form onSubmit={handleSubmitEvaluasi} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Status Evaluasi
                </label>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as LogbookStatus)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                >
                  <option value="Disetujui">Disetujui</option>
                  <option value="Revisi">Revisi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Komentar Dosen
                </label>

                <textarea
                  rows={4}
                  value={komentarDosen}
                  onChange={(e) => setKomentarDosen(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  placeholder={
                    status === 'Revisi'
                      ? 'Tuliskan alasan revisi...'
                      : 'Opsional'
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900 disabled:opacity-60"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Evaluasi'}
                </button>

                <button
                  type="button"
                  onClick={closeEvaluasiModal}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-60"
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