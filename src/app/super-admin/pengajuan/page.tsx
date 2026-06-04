"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminPengajuanPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Pengajuan Mahasiswa Magang"
            description="Halaman ini digunakan untuk memantau pengajuan magang mahasiswa."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur pengajuan mahasiswa magang akan disesuaikan pada tahap berikutnya.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}