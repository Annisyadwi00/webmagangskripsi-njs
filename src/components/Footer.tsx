"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  const hideFooter =
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.includes('/dashboard') ||
    pathname?.includes('/admin') ||
    pathname?.includes('/dosen') ||
    pathname?.includes('/pilih-dosen') ||
    pathname?.includes('/settings');

  if (hideFooter) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="app-container py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a]">
                SI
              </div>

              <div>
                <p className="text-lg font-black leading-none text-slate-950">
                  SI Magang
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Fasilkom UNSIKA
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">
              Sistem informasi magang berbasis web untuk membantu proses
              pengajuan LOA, pengisian logbook, bimbingan dosen, dan evaluasi
              akhir mahasiswa.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
              Navigasi
            </h3>

            <div className="mt-4 space-y-3">
              <Link
                href="/"
                className="block text-sm font-semibold text-slate-500 hover:text-[#1e3a8a]"
              >
                Beranda
              </Link>

              <Link
                href="/lowongan"
                className="block text-sm font-semibold text-slate-500 hover:text-[#1e3a8a]"
              >
                Lowongan Magang
              </Link>

              <Link
                href="/login"
                className="block text-sm font-semibold text-slate-500 hover:text-[#1e3a8a]"
              >
                Portal Login
              </Link>

              <Link
                href="/register"
                className="block text-sm font-semibold text-slate-500 hover:text-[#1e3a8a]"
              >
                Registrasi
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-slate-950">
              Kontak
            </h3>

            <div className="mt-4 space-y-3 text-sm leading-7 text-slate-500">
              <p>Fakultas Ilmu Komputer</p>
              <p>Universitas Singaperbangsa Karawang</p>
              <p>Karawang, Jawa Barat</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} SI Magang Fasilkom UNSIKA.
          </p>
          <p>Dikembangkan oleh Annisya Dwi Chaerani dengan penuh perasaan</p>
        </div>
      </div>
    </footer>
  );
}