"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminLowonganPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Kelola Lowongan"
            description="Halaman ini digunakan untuk menambah, melihat, mengubah, menghapus, dan memvalidasi lowongan magang."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur lowongan akan dipindahkan menjadi kewenangan Super Admin.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}