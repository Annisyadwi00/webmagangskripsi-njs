"use client";

import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function AdminFeedbackPage() {
  return (
    <DashboardShell role="Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Admin"
            title="Feedback Dinonaktifkan"
            description="Fitur feedback sudah dihapus dari sistem. Mahasiswa diarahkan untuk menghubungi TU melalui WhatsApp."
            action={
              <Link href="/admin/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur feedback tidak digunakan pada alur terbaru SI Magang.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}