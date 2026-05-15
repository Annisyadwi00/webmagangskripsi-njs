"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Feedback,
  getFeedbackList,
  markFeedbackAsRead,
  deleteFeedback,
} from '@/lib/feedback-client';

function getStatusBadgeClass(status: string) {
  if (status === 'Read') {
    return 'app-badge app-badge-green';
  }

  return 'app-badge app-badge-yellow';
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function AdminFeedbackPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(
    null
  );

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Unread' | 'Read'>(
    'Semua'
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, feedbackData] = await Promise.all([
        getCurrentUserClient(),
        getFeedbackList(),
      ]);

      if (me.role !== 'Admin') {
        window.location.href = '/login';
        return;
      }

      setCurrentUser(me);
      setFeedbacks(feedbackData);
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
    fetchData();
  }, []);

  const handleMarkAsRead = async (id: number) => {
    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await markFeedbackAsRead(id);
      setMessage(result.message || 'Feedback ditandai sudah dibaca.');
      await fetchData();

      if (selectedFeedback?.id === id) {
        setSelectedFeedback({
          ...selectedFeedback,
          status: 'Read',
        });
      }
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menandai feedback.';

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
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error ? error.message : 'Gagal menghapus feedback.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFeedbacks = useMemo(() => {
    const keyword = search.toLowerCase();

    return feedbacks.filter((item) => {
      const matchesKeyword =
        item.nama.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.pesan.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [feedbacks, search, statusFilter]);

  const totalUnread = feedbacks.filter((item) => item.status === 'Unread').length;
  const totalRead = feedbacks.filter((item) => item.status === 'Read').length;

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

  if (errorMsg && !message) {
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
          eyebrow="Admin Feedback"
          title={`Feedback Pengguna ${currentUser?.name || ''}`}
          description="Pantau kritik, saran, dan kendala yang dikirim oleh pengguna melalui landing page SI Magang."
          action={
            <Link href="/admin/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        {totalUnread > 0 && (
          <Alert variant="warning">
            Ada {totalUnread} feedback yang belum dibaca.
          </Alert>
        )}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Total Feedback"
            value={feedbacks.length}
            description="Semua pesan yang masuk."
            icon="message"
          />

          <StatCard
            title="Belum Dibaca"
            value={totalUnread}
            description="Feedback yang perlu diperiksa."
            icon="clock"
          />

          <StatCard
            title="Sudah Dibaca"
            value={totalRead}
            description="Feedback yang sudah ditandai."
            icon="check"
          />
        </section>

        <section className="app-card p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Daftar Feedback
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cari, baca detail, tandai sudah dibaca, atau hapus feedback.
              </p>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-[1fr_200px]">
            <div>
              <label className="app-label">Cari Feedback</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari nama, email, atau isi pesan..."
              />
            </div>

            <div>
              <label className="app-label">Filter Status</label>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'Semua' | 'Unread' | 'Read')
                }
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Unread">Belum Dibaca</option>
                <option value="Read">Sudah Dibaca</option>
              </select>
            </div>
          </div>

          {filteredFeedbacks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Feedback tidak ditemukan.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Coba ubah kata kunci pencarian atau filter status.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedbacks.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-black text-slate-950">
                          {item.nama}
                        </h3>

                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status === 'Unread'
                            ? 'Belum Dibaca'
                            : 'Sudah Dibaca'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {item.email}
                      </p>

                      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => setSelectedFeedback(item)}
                        className="app-btn-secondary px-4 py-2 text-sm"
                      >
                        Detail
                      </button>

                      {item.status === 'Unread' && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(item.id)}
                          disabled={isSubmitting}
                          className="app-btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Tandai Dibaca
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        disabled={isSubmitting}
                        className="app-btn-danger px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {item.pesan}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSelectedFeedback(null)}
          />

          <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                  Detail Feedback
                </p>

                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  {selectedFeedback.nama}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedFeedback.email}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  {formatDate(selectedFeedback.createdAt)}
                </p>
              </div>

              <span className={getStatusBadgeClass(selectedFeedback.status)}>
                {selectedFeedback.status === 'Unread'
                  ? 'Belum Dibaca'
                  : 'Sudah Dibaca'}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-black text-slate-500">Isi Pesan</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-700">
                {selectedFeedback.pesan}
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {selectedFeedback.status === 'Unread' && (
                <button
                  type="button"
                  onClick={() => handleMarkAsRead(selectedFeedback.id)}
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tandai Dibaca
                </button>
              )}

              <button
                type="button"
                onClick={() => handleDelete(selectedFeedback.id)}
                disabled={isSubmitting}
                className="app-btn-danger flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hapus Feedback
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeedback(null)}
                disabled={isSubmitting}
                className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
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