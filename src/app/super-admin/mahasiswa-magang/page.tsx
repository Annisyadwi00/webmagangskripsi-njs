"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminMahasiswaMagangPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="Data Mahasiswa Magang"
            description="Halaman ini akan digunakan untuk melihat data mahasiswa magang dan export data ke CSV/Excel."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Fitur data mahasiswa magang akan ditambahkan pada tahap berikutnya.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}