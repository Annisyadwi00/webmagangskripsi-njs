"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminAlokasiDosenPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Alokasi Dosen Pembimbing"
            description="Halaman ini digunakan untuk menetapkan dosen pembimbing kepada mahasiswa magang."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur alokasi dosen pembimbing akan dibuat setelah data pengajuan magang dirapikan.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}