"use client";

import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';

export default function SuperAdminUsersPage() {
  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Super Admin"
            title="User Management"
            description="Halaman ini digunakan untuk mengelola akun Admin dan Super Admin."
          />

          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              User management nantinya hanya menampilkan akun Admin dan Super Admin.
            </p>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}