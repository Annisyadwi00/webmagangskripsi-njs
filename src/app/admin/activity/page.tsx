"use client";

import { useEffect, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  ActivityLog,
  getActivityLogs,
} from '@/lib/activity-log-client';

function formatAction(action: string) {
  return action
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getRoleBadge(role?: string | null) {
  if (role === 'Admin') return 'app-badge app-badge-blue';
  if (role === 'Dosen') return 'app-badge app-badge-green';
  if (role === 'Mahasiswa') return 'app-badge app-badge-yellow';

  return 'app-badge app-badge-blue';
}

export default function AdminActivityPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [me, activityLogs] = await Promise.all([
          getCurrentUserClient(),
          getActivityLogs(),
        ]);

        if (me.role !== 'Admin') {
          window.location.href = getDashboardPathByRole(me.role);
          return;
        }

        setCurrentUser(me);
        setLogs(activityLogs);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat activity log.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Activity Log"
          title="Riwayat Aktivitas Sistem"
          description={`Pantau aktivitas penting yang terjadi di sistem. Login sebagai ${currentUser?.name || 'Admin'}.`}
        />

        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="app-card p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Aktivitas Terbaru
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Menampilkan maksimal 100 aktivitas terbaru.
            </p>
          </div>

          {logs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                Belum ada aktivitas tercatat.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Activity log akan muncul setelah user melakukan aksi penting.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <article
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={getRoleBadge(log.role)}>
                          {log.role || 'System'}
                        </span>

                        <span className="app-badge app-badge-blue">
                          {formatAction(log.action)}
                        </span>
                      </div>

                      <h3 className="mt-3 font-black text-slate-950 dark:text-white">
                        {log.description}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Oleh: {log.name || 'System'}
                      </p>
                    </div>

                    <p className="shrink-0 text-sm font-bold text-slate-500 dark:text-slate-400">
                      {formatDate(log.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}