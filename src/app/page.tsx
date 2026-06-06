"use client";

import { useState } from 'react';
import Link from 'next/link';

type FAQ = {
  tanya: string;
  jawab: string;
};

const features = [
  {
    title: 'Pendataan Magang',
    description:
      'Mahasiswa mengisi data tempat magang, periode magang, bukti penerimaan, dan rencana kegiatan untuk diperiksa oleh staff.',
  },
  {
    title: 'Upload Laporan Akhir',
    description:
      'Mahasiswa wajib mengunggah laporan akhir dalam bentuk PDF sebagai syarat sebelum penilaian akhir diproses.',
  },
  {
    title: 'Penilaian Akhir',
    description:
      'Dosen pembimbing melihat laporan akhir mahasiswa lalu menginput seluruh komponen penilaian akhir.',
  },
];

const steps = [
  'Mahasiswa melakukan registrasi menggunakan NPM/NIM dan email kampus.',
  'Mahasiswa mengisi pendataan magang dan mengunggah bukti penerimaan.',
  'Staff memeriksa pengajuan dan menetapkan dosen pembimbing.',
  'Mahasiswa melaksanakan magang sesuai periode yang diajukan.',
  'Mahasiswa mengunggah laporan akhir dalam bentuk PDF.',
  'Dosen pembimbing memeriksa laporan akhir dan menginput nilai akhir.',
];

const roles = [
  {
    title: 'Mahasiswa',
    description:
      'Mengisi pendataan magang, mengajukan mitra, upload laporan akhir, dan memantau status magang.',
  },
  {
    title: 'Dosen Pembimbing',
    description:
      'Melihat laporan akhir mahasiswa dan menginput nilai akhir magang.',
  },
  {
    title: 'Staff',
    description:
      'Memeriksa pengajuan magang, mengelola mitra, lowongan, dan kebutuhan administrasi magang.',
  },
  {
    title: 'Mitra',
    description:
      'Mengajukan lowongan magang agar dapat ditampilkan pada sistem setelah diverifikasi.',
  },
];

const mitraList = [
  'Toyota Motor Manufacturing Indonesia',
  'Kominfo Karawang',
  'LPPM UNSIKA',
  'Kantor Kecamatan Telukjambe',
  'SMK Negeri 1 Karawang',
  'PT Teknologi Indonesia',
];

const faqs: FAQ[] = [
  {
    tanya: 'Siapa saja yang bisa menggunakan SI Magang?',
    jawab:
      'Sistem ini digunakan oleh mahasiswa, dosen pembimbing, staff, dan mitra sesuai kebutuhan proses magang.',
  },
  {
    tanya: 'Bagaimana alur pengajuan magang?',
    jawab:
      'Mahasiswa mengisi pendataan magang dan bukti penerimaan, kemudian staff memeriksa data serta menetapkan dosen pembimbing.',
  },
  {
    tanya: 'Apakah logbook masih digunakan di sistem?',
    jawab:
      'Tidak. Pada alur terbaru, fitur logbook diganti dengan upload laporan akhir dalam bentuk PDF.',
  },
  {
    tanya: 'Bagaimana proses penilaian akhir?',
    jawab:
      'Dosen pembimbing melihat laporan akhir mahasiswa lalu menginput seluruh komponen penilaian, termasuk nilai dari mitra atau tempat magang.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]" />

        <div className="app-container">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
                SI Magang Fasilkom UNSIKA
              </p>

              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
                Sistem Informasi Magang Berbasis Web.
              </h1>

              <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Digitalisasi proses magang mulai dari pendataan magang,
                pengajuan mitra, upload laporan akhir, alokasi dosen
                pembimbing, hingga penilaian akhir.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="app-btn-primary">
                  Masuk ke Portal
                </Link>

                <Link href="/lowongan" className="app-btn-secondary">
                  Lihat Lowongan
                </Link>

                <Link href="/ajukan-lowongan" className="app-btn-secondary">
                  Mitra Ajukan Lowongan
                </Link>
              </div>
            </div>

            <div className="app-card p-6 md:p-8">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Ringkasan Sistem
                </p>

                <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                  Satu portal untuk proses magang.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  SI Magang membantu proses pendataan, pemantauan laporan akhir,
                  dan evaluasi magang agar lebih terpusat.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {roles.map((role) => (
                  <div
                    key={role.title}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <p className="font-black text-slate-950 dark:text-white">
                      {role.title}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {role.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
              Fitur Utama
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Proses magang lebih terarah.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Fitur disesuaikan dengan kebutuhan pengajuan, pelaporan, dan
              penilaian akhir magang.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="app-card app-card-hover p-6">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-lg font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                  ✓
                </div>

                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="app-card p-6 md:p-8">
            <div className="mb-8">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Alur Magang
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                Alur proses dari awal sampai penilaian.
              </h2>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1e3a8a] text-sm font-black text-white">
                    {index + 1}
                  </div>

                  <p className="pt-2 text-sm font-bold leading-6 text-slate-700 dark:text-slate-300">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
              Daftar Mitra
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Mitra magang yang terdata.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Beberapa perusahaan atau instansi yang dapat dijadikan referensi
              tempat magang mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {mitraList.map((mitra) => (
              <div key={mitra} className="app-card app-card-hover p-5">
                <p className="font-black text-slate-950 dark:text-white">
                  {mitra}
                </p>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Mitra/instansi terdata dalam proses magang.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="app-card grid grid-cols-1 gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Untuk Mitra
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                Ingin membuka lowongan magang?
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Mitra, perusahaan, atau instansi dapat mengajukan lowongan
                magang melalui sistem. Lowongan akan diverifikasi terlebih
                dahulu oleh staff sebelum ditampilkan kepada mahasiswa.
              </p>
            </div>

            <Link href="/ajukan-lowongan" className="app-btn-primary">
              Ajukan Lowongan
            </Link>
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Pertanyaan yang sering diajukan.
            </h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.tanya} className="app-card p-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="font-black text-slate-950 dark:text-white">
                      {faq.tanya}
                    </span>

                    <span className="text-xl font-black text-[#1e3a8a] dark:text-blue-300">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>

                  {isOpen && (
                    <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {faq.jawab}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="app-card grid grid-cols-1 gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Butuh Informasi?
              </p>

              <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
                Hubungi TU Fasilkom
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                Jika membutuhkan informasi lebih lanjut terkait proses magang,
                mahasiswa dapat menghubungi TU Fasilkom melalui WhatsApp.
              </p>
            </div>

            <a
              href="https://wa.me/628xxxxxxxxxx"
              target="_blank"
              rel="noopener noreferrer"
              className="app-btn-primary"
            >
              Hubungi TU
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}