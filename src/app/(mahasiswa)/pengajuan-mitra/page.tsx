"use client";

import { useEffect } from 'react';

export default function PengajuanMitraMahasiswaRedirectPage() {
  useEffect(() => {
    window.location.href = '/ajukan-mitra';
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="app-container">
        <div className="app-card p-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
            Mengalihkan
          </p>
          <h1 className="mt-3 text-2xl font-black text-slate-950 dark:text-white">
            Membuka halaman pengajuan mitra...
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Jika halaman tidak berpindah otomatis, buka menu Ajukan Mitra.
          </p>
        </div>
      </div>
    </main>
  );
}