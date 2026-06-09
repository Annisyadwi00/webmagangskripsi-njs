"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mitra, getMitraList } from '@/lib/mitra-client';
import ThemeIcon from '@/components/ui/ThemeIcon';
import Footer from '@/components/Footer';
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
    title: 'Laporan Akhir Magang',
    description:
      'Mahasiswa mengunggah laporan atau output magang sesuai jenis magang yang dipilih.',
  },
  {
    title: 'Penilaian Akhir',
    description:
      'Dosen pembimbing melihat dokumen laporan mahasiswa lalu menginput komponen penilaian akhir.',
  },
];

const steps = [
  'Mahasiswa melakukan registrasi menggunakan data akademik dan email kampus.',
  'Mahasiswa mengecek mitra atau mengajukan mitra baru jika perusahaan belum terdata.',
  'Mahasiswa mengisi pendataan magang dan mengunggah bukti penerimaan.',
  'Staff memeriksa pengajuan magang dan menetapkan dosen pembimbing.',
  'Mahasiswa melaksanakan magang sesuai periode yang diajukan.',
  'Mahasiswa mengunggah laporan magang atau output magang sesuai jenis magang.',
  'Dosen pembimbing memeriksa dokumen dan menginput nilai akhir.',
];

const roles = [
  {
    title: 'Mahasiswa',
    description:
      'Mengisi pendataan magang, mengajukan mitra, mengunggah laporan, dan memantau status magang.',
  },
  {
    title: 'Dosen Pembimbing',
    description:
      'Melihat laporan mahasiswa bimbingan dan menginput nilai akhir magang.',
  },
  {
    title: 'Staff',
    description:
      'Memeriksa pengajuan magang, mengelola mitra, lowongan, dan kebutuhan administrasi magang.',
  },
  {
    title: 'Mitra',
    description:
      'Perusahaan atau instansi yang dapat menjadi tempat pelaksanaan magang mahasiswa.',
  },
];

const faqs: FAQ[] = [
  {
    tanya: 'Siapa saja yang bisa menggunakan SI Magang?',
    jawab:
      'Sistem ini digunakan oleh mahasiswa, dosen pembimbing, staff, dan super admin sesuai kebutuhan proses magang.',
  },
  {
    tanya: 'Bagaimana alur pengajuan magang?',
    jawab:
      'Mahasiswa mengisi pendataan magang dan bukti penerimaan, kemudian staff memeriksa data serta menetapkan dosen pembimbing.',
  },
  {
    tanya: 'Apakah semua mahasiswa wajib mengunggah laporan akhir?',
    jawab:
      'Kewajiban laporan menyesuaikan jenis magang. Konversi Maksimal 20 SKS wajib laporan akhir dan output magang, Magang 2 SKS Khusus SI wajib laporan magang, sedangkan Tidak Konversi tidak memakai fitur laporan akhir.',
  },
  {
    tanya: 'Bagaimana proses penilaian akhir?',
    jawab:
      'Dosen pembimbing melihat dokumen laporan mahasiswa lalu menginput komponen penilaian akhir, termasuk nilai mitra atau tempat magang.',
  },
];

function getInitial(name?: string | null) {
  return (name || 'M').charAt(0).toUpperCase();
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
const [mitraList, setMitraList] = useState<Mitra[]>([]);
const [isLoadingMitra, setIsLoadingMitra] = useState(true);
const [isDarkMode, setIsDarkMode] = useState(false);

useEffect(() => {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  document.documentElement.classList.toggle('dark', shouldUseDark);
  setIsDarkMode(shouldUseDark);
}, []);

const toggleDarkMode = () => {
  const nextMode = !isDarkMode;

  document.documentElement.classList.toggle('dark', nextMode);
  localStorage.setItem('theme', nextMode ? 'dark' : 'light');
  setIsDarkMode(nextMode);
};

  useEffect(() => {
    const fetchMitra = async () => {
      try {
        setIsLoadingMitra(true);

        const data = await getMitraList(6);
        setMitraList(data || []);
      } catch {
        setMitraList([]);
      } finally {
        setIsLoadingMitra(false);
      }
    };

    fetchMitra();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        <div className="app-container flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              SI
            </div>

            <div>
              <p className="text-lg font-black leading-none text-slate-950 dark:text-white">
                SI Magang
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                FASILKOM UNSIKA
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-black text-slate-600 dark:text-slate-300 md:flex">
            <Link href="/" className="hover:text-[#1e3a8a] dark:hover:text-blue-300">
              Beranda
            </Link>
            <Link
              href="/lowongan"
              className="hover:text-[#1e3a8a] dark:hover:text-blue-300"
            >
              Lowongan
            </Link>
            <Link
              href="/mitra"
              className="hover:text-[#1e3a8a] dark:hover:text-blue-300"
            >
              Mitra
            </Link>
            <Link
              href="/ajukan-mitra"
              className="hover:text-[#1e3a8a] dark:hover:text-blue-300"
            >
              Ajukan Mitra
            </Link>
          </nav>

          <div className="flex items-center gap-3">
  <button
    type="button"
    onClick={toggleDarkMode}
    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:border-[#1e3a8a] hover:text-[#1e3a8a] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-300 dark:hover:text-blue-300"
    aria-label="Ganti mode tema"
    title={isDarkMode ? 'Ganti ke light mode' : 'Ganti ke dark mode'}
  >
    <ThemeIcon type={isDarkMode ? 'sun' : 'moon'} />
  </button>

  <Link href="/login" className="app-btn-primary">
    Masuk
  </Link>
</div>
        </div>
      </header>

      <section className="relative overflow-hidden py-10 md:py-14 lg:py-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.12),transparent_30%)]" />

        <div className="app-container">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
                SI Magang FASILKOM UNSIKA
              </p>

              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl lg:text-6xl">
                Sistem Informasi Magang Berbasis Web.
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300 md:text-lg">
                Digitalisasi proses magang mulai dari pendataan magang,
                pengajuan mitra, informasi lowongan, alokasi dosen pembimbing,
                laporan akhir, hingga penilaian akhir.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="app-btn-primary">
                  Masuk ke Sistem
                </Link>

                <Link href="/mitra" className="app-btn-secondary">
                  Cek Mitra
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
                  SI Magang membantu proses pendataan, pengelolaan mitra,
                  pelaporan akhir, dan evaluasi magang agar lebih terpusat.
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
              Mitra Magang
            </p>

            <h2 className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
              Perusahaan dan instansi yang terdata.
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Daftar mitra ditampilkan dari data aktif yang dikelola oleh staff.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {isLoadingMitra ? (
              [1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="app-card p-5 text-center">
                  <div className="mx-auto h-16 w-16 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
                  <div className="mx-auto mt-4 h-4 w-28 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                </div>
              ))
            ) : mitraList.length === 0 ? (
              <div className="col-span-full rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Data mitra belum tersedia.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Data akan tampil setelah staff menambahkan data mitra aktif ke
                  sistem.
                </p>
              </div>
            ) : (
              mitraList.slice(0, 6).map((mitra) => (
                <Link
                  href="/mitra"
                  key={mitra.id}
                  className="group rounded-[1.5rem] border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/40"
                >
                  {mitra.logo ? (
                    <img
                      src={mitra.logo}
                      alt={mitra.nama_mitra}
                      className="mx-auto h-16 w-16 rounded-3xl object-contain"
                    />
                  ) : (
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-2xl font-black text-[#1e3a8a] transition group-hover:scale-105 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                      {getInitial(mitra.nama_mitra)}
                    </div>
                  )}

                  <p className="mt-4 text-sm font-black leading-6 text-slate-950 dark:text-white">
                    {mitra.nama_mitra}
                  </p>

                  <p className="mt-2 text-xs font-bold text-[#1e3a8a] dark:text-blue-300">
                    Selengkapnya
                  </p>
                </Link>
              ))
            )}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/mitra" className="app-btn-secondary">
              Lihat Semua Mitra
            </Link>

            <Link href="/ajukan-mitra" className="app-btn-primary">
              Ajukan Mitra
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

          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.tanya} className="app-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left"
                >
                  <span className="font-black text-slate-950 dark:text-white">
                    {faq.tanya}
                  </span>

                  <span className="text-xl font-black text-[#1e3a8a] dark:text-blue-300">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>

                {openFaq === index && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-4 dark:border-slate-800">
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
      <footer />
    </main>
  );
}