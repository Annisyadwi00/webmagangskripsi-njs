"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminPengajuanMitraPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Pengajuan Mitra"
            description="Halaman ini digunakan untuk memverifikasi pengajuan mitra."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur pengajuan mitra untuk Super Admin akan disambungkan dengan data pengajuan mitra yang sudah ada.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}