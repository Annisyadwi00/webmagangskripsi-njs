"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mitra, getMitraList } from '@/lib/mitra-client';

export default function MitraPage() {
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMitra = async () => {
      try {
        setIsLoading(true);
        const data = await getMitraList();
        setMitraList(data);
      } catch {
        setMitraList([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMitra();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="app-container">
        <section className="mb-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-black text-[#1e3a8a] hover:bg-blue-100 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300"
          >
            ← Kembali ke Beranda
          </Link>

          <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
            Daftar Mitra
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
            Mitra magang yang terdata.
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Halaman ini menampilkan daftar perusahaan atau instansi yang telah
            terdata sebagai mitra atau referensi tempat magang mahasiswa.
          </p>
        </section>

        {isLoading ? (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-[2rem] bg-slate-100 dark:bg-slate-800"
              />
            ))}
          </section>
        ) : mitraList.length === 0 ? (
          <section className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="font-black text-slate-700 dark:text-slate-300">
              Data mitra belum tersedia.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Data akan tampil setelah staff menambahkan atau mengimpor data
              mitra.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {mitraList.map((mitra) => (
              <article
                key={mitra.id}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/40"
              >
                <div className="flex items-start gap-4">
                  {mitra.logo ? (
                    <img
                      src={mitra.logo}
                      alt={mitra.nama_mitra}
                      className="h-16 w-16 shrink-0 rounded-3xl object-contain"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-2xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                      {mitra.nama_mitra.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-black text-slate-950 dark:text-white">
                      {mitra.nama_mitra}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {mitra.alamat || 'Alamat belum tersedia'}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {mitra.deskripsi || 'Deskripsi perusahaan belum tersedia.'}
                </p>

                <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      WhatsApp
                    </p>
                    {mitra.kontak_wa ? (
                      <a
                        href={`https://wa.me/${mitra.kontak_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                      >
                        {mitra.kontak_wa}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        -
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                      Email
                    </p>
                    {mitra.email ? (
                      <a
                        href={`mailto:${mitra.email}`}
                        className="mt-1 inline-flex break-all font-black text-[#1e3a8a] dark:text-blue-300"
                      >
                        {mitra.email}
                      </a>
                    ) : (
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        -
                      </p>
                    )}
                  </div>

                  {mitra.website && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Website
                      </p>
                      <a
                        href={mitra.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex break-all font-black text-[#1e3a8a] dark:text-blue-300"
                      >
                        Buka Website
                      </a>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}