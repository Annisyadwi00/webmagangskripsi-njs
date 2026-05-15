"use client";

import { useEffect, useState } from 'react';
import {
  Feedback,
  getFeedbackList,
  markFeedbackAsRead,
  deleteFeedback,
} from '@/lib/feedback-client';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const data = await getFeedbackList();
      setFeedbacks(data);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data feedback.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await markFeedbackAsRead(id);
      setMessage(result.message || 'Feedback ditandai sudah dibaca.');
      await fetchFeedbacks();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menandai feedback.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = confirm('Yakin ingin menghapus feedback ini?');

    if (!confirmed) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await deleteFeedback(id);
      setMessage(result.message || 'Feedback berhasil dihapus.');
      setSelectedFeedback(null);
      await fetchFeedbacks();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menghapus feedback.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat data feedback...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Feedback Pengguna
        </h1>
        <p className="text-gray-500 mt-1">
          Lihat pesan, masukan, dan kritik dari pengguna sistem.
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
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Daftar Feedback
          </h2>

          <span className="text-sm font-bold text-gray-500">
            Total: {feedbacks.length}
          </span>
        </div>

        {feedbacks.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500">Belum ada feedback.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-5 py-4 text-left">Nama</th>
                  <th className="px-5 py-4 text-left">Email</th>
                  <th className="px-5 py-4 text-left">Pesan</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Tanggal</th>
                  <th className="px-5 py-4 text-left">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((item) => (
                  <tr key={item.id} className="align-top">
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {item.nama}
                    </td>

                    <td className="px-5 py-4 text-gray-700">
                      {item.email}
                    </td>

                    <td className="px-5 py-4 text-gray-700 max-w-md">
                      <p className="line-clamp-2">{item.pesan}</p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          item.status === 'Unread'
                            ? 'inline-flex px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 font-bold text-xs'
                            : 'inline-flex px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-xs'
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {new Date(item.createdAt).toLocaleDateString('id-ID')}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedFeedback(item)}
                          className="px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
                        >
                          Detail
                        </button>

                        {item.status === 'Unread' && (
                          <button
                            type="button"
                            onClick={() => handleMarkAsRead(item.id)}
                            disabled={isSubmitting}
                            className="px-3 py-2 rounded-lg bg-green-50 text-green-700 font-bold hover:bg-green-100 disabled:opacity-60"
                          >
                            Tandai Dibaca
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          disabled={isSubmitting}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-700 font-bold hover:bg-red-100 disabled:opacity-60"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-900/60"
            onClick={() => setSelectedFeedback(null)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10">
            <h3 className="text-xl font-black text-gray-900 mb-2">
              Detail Feedback
            </h3>

            <div className="space-y-4 mt-5">
              <div>
                <p className="text-sm text-gray-500">Nama</p>
                <p className="font-bold text-gray-900">
                  {selectedFeedback.nama}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-bold text-gray-900">
                  {selectedFeedback.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-bold text-gray-900">
                  {selectedFeedback.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pesan</p>
                <p className="mt-2 text-gray-700 whitespace-pre-line">
                  {selectedFeedback.pesan}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {selectedFeedback.status === 'Unread' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(selectedFeedback.id)}
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100 disabled:opacity-60"
                >
                  Tandai Dibaca
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(selectedFeedback.id)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 disabled:opacity-60"
              >
                Hapus
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 disabled:opacity-60"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}