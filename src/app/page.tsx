"use client";

import Link from 'next/link';
import { useState } from 'react';

type FAQ = {
  tanya: string;
  jawab: string;
};

const mitraList = [
  'Toyota Motor Manufacturing Indonesia',
  'Kominfo Karawang',
  'LPPM UNSIKA',
  'Kantor Kecamatan Telukjambe',
  'SMK Negeri 1 Karawang',
  'PT Teknologi Indonesia',
];
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
        Beberapa perusahaan atau instansi yang dapat dijadikan referensi tempat magang mahasiswa.
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
const faqs: FAQ[] = [
  {
    tanya: 'Siapa saja yang bisa menggunakan SI Magang?',
    jawab:
      'Sistem ini digunakan oleh Mahasiswa, Dosen Pembimbing, Admin/Staff TU, dan staff untuk mengelola proses magang sesuai kewenangan masing-masing.',
  },
  {
    tanya: 'Bagaimana alur pengajuan magang?',
    jawab:
      'Mahasiswa mengisi pendataan magang dan bukti penerimaan, kemudian staff memverifikasi data serta menetapkan dosen pembimbing.',
  },
  {
    tanya: 'Apakah logbook masih digunakan di sistem?',
    jawab:
      'Tidak. Pada revisi terbaru, fitur logbook diganti dengan upload laporan akhir dalam bentuk PDF.',
  },
  {
    tanya: 'Bagaimana proses penilaian akhir?',
    jawab:
      'Dosen pembimbing melihat laporan akhir mahasiswa lalu menginput seluruh komponen penilaian, termasuk nilai dari mitra/tempat magang.',
  },
];

const features = [
  {
    title: 'Pendataan Magang',
    description:
      'Mahasiswa mengisi data tempat magang, periode magang, bukti penerimaan, dan rencana kegiatan untuk diverifikasi.',
  },
  {
    title: 'Upload Laporan Akhir',
    description:
      'Mahasiswa wajib mengunggah laporan akhir dalam bentuk PDF sebagai syarat sebelum penilaian akhir diproses.',
  },
  {
    title: 'Penilaian Akhir',
    description:
      'Dosen pembimbing menginput nilai akhir berdasarkan laporan akhir dan dokumen penilaian mitra.',
  },
];

const steps = [
  'Mahasiswa melakukan registrasi menggunakan NPM/NIM dan email kampus.',
  'Mahasiswa mengisi pendataan magang dan mengunggah bukti penerimaan.',
  'staff memverifikasi pengajuan dan menetapkan dosen pembimbing.',
  'Mahasiswa melaksanakan magang sesuai periode yang diajukan.',
  'Mahasiswa mengunggah laporan akhir dalam bentuk PDF.',
  'Dosen pembimbing memeriksa laporan akhir dan menginput nilai akhir.',
];



  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  


  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="app-bg-orb left-[-80px] top-24 h-72 w-72 bg-blue-400/30 dark:bg-blue-500/20" />
      <div className="app-bg-orb right-[-90px] top-[520px] h-80 w-80 bg-sky-300/25 dark:bg-sky-500/10" />

      <section className="relative py-16 md:py-24">
        <div className="app-container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="animate-fade-up">
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#1e3a8a] dark:text-blue-300">
                SI Magang Fasilkom UNSIKA
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
                Sistem informasi magang yang rapi, terintegrasi, dan mudah
                dipantau.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Digitalisasi proses magang mulai dari pendataan magang, pengajuan mitra,
upload laporan akhir, alokasi dosen pembimbing, hingga penilaian akhir.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="app-btn-primary">
                  Masuk ke Portal
                </Link>

                <Link href="/lowongan" className="app-btn-secondary">
                  Lihat Lowongan
                </Link>
              </div>
            </div>
        
        <Link href="/ajukan-lowongan" className="app-btn-secondary">
  Mitra Ajukan Lowongan
</Link>

            <div className="app-card app-card-hover animate-fade-up animate-delay-200 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Ringkasan Sistem
                </p>

                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  Satu portal untuk seluruh proses magang.
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Dirancang untuk memudahkan mahasiswa, dosen, dan admin dalam
                  menjalankan alur magang secara transparan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-400/20 dark:bg-blue-400/10">
                  <p className="font-black text-[#1e3a8a] dark:text-blue-300">
                    Mahasiswa
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Ajukan LOA, isi logbook, dan pantau hasil evaluasi.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="font-black text-slate-950 dark:text-white">
                    Dosen Pembimbing
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Review logbook, terima bimbingan, dan beri nilai akhir.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/70">
                  <p className="font-black text-slate-950 dark:text-white">
                    Admin
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                    Verifikasi pengajuan, kelola pengguna, dan lowongan.
                  </p>
                </div>
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
              Dibuat untuk alur magang yang lebih sederhana.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Setiap fitur dirancang agar proses administrasi magang lebih rapi
              dan mudah ditelusuri.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
                key={feature.title}
                className="app-card app-card-hover animate-fade-up p-6"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-12">
        <div className="app-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="animate-fade-up">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Alur Magang
              </p>

              <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                Proses jelas dari awal sampai selesai.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Mahasiswa, dosen, dan admin memiliki peran masing-masing dalam
                satu alur yang saling terhubung.
              </p>
            </div>

            <div className="app-card p-6">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#1e3a8a] ring-1 ring-blue-100 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20">
                      {index + 1}
                    </div>

                    <p className="text-sm font-semibold leading-6 text-slate-700 dark:text-slate-300">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="relative scroll-mt-24 py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Pertanyaan yang sering diajukan.
            </h2>
          </div>

          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq.tanya}
                className="app-card app-card-hover overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-black text-slate-950 dark:text-white">
                    {faq.tanya}
                  </span>

                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>

                {openFaq === index && (
                  <div className="animate-scale-in border-t border-slate-100 px-6 pb-5 pt-4 dark:border-slate-800">
                    <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {faq.jawab}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
  <div className="app-container">
    <div className="app-card grid grid-cols-1 gap-6 p-8 md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
          Untuk Mitra
        </p>

        <h2 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
          Ingin membuka lowongan magang?
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
          Mitra, perusahaan, atau instansi dapat mengajukan lowongan magang
          melalui sistem. Lowongan akan diverifikasi terlebih dahulu oleh Super
          Admin sebelum ditampilkan kepada mahasiswa.
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