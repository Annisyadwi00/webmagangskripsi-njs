"use client";

import Link from 'next/link';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';

const TEMPLATE_SURAT_DRIVE_URL = 'https://drive.google.com/';
const WEB_PERSURATAN_URL = 'https://example.com/persuratan';

export default function PengajuanDokumenInfoPage() {
  return (
    <DashboardShell role="Mahasiswa">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="Informasi Persuratan"
            title="Pengajuan Dokumen Magang"
            description="Pengajuan dokumen tidak dilakukan melalui SI Magang. Mahasiswa dapat menggunakan template surat atau mengakses web persuratan kampus."
            action={
              <Link href="/dashboard" className="app-btn-secondary">
                Kembali ke Dashboard
              </Link>
            }
          />

          <Alert variant="info">
            Fitur pengajuan dokumen sudah dipisahkan dari SI Magang. Halaman ini
            hanya menyediakan arahan menuju template dokumen dan web persuratan.
          </Alert>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Template Dokumen Magang
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Gunakan template dokumen yang sudah disediakan oleh fakultas atau
                program studi. Pastikan data mahasiswa, tempat magang, dan
                periode magang sudah sesuai.
              </p>

              <a
                href={TEMPLATE_SURAT_DRIVE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-primary mt-5"
              >
                Buka Template Drive
              </a>
            </div>

            <div className="app-card p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Web Persuratan Kampus
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Jika dokumen harus diproses secara resmi, mahasiswa diarahkan
                untuk mengajukan surat melalui web persuratan kampus.
              </p>

              <a
                href={WEB_PERSURATAN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-secondary mt-5"
              >
                Buka Web Persuratan
              </a>
            </div>
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}