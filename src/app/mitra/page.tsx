// app/(routes)/mitra/page.tsx
"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import { Mitra, getMitraList } from '@/lib/mitra-client';
import Navbar from '@/components/Navbar'; // <-- navbar

function getInitial(name?: string | null) {
  return (name || 'M').charAt(0).toUpperCase();
}

function getWhatsappLink(phone?: string | null) {
  if (!phone) return '';
  return `https://wa.me/${phone}`;
}

export default function MitraPage() {
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchMitra = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');
        const data = await getMitraList();
        setMitraList(data || []);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Gagal memuat data mitra.';
        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMitra();
  }, []);

  const filteredMitra = useMemo(() => {
    const keyword = search.toLowerCase();
    return mitraList.filter((mitra) => {
      const nama = mitra.nama_mitra || '';
      const alamat = mitra.alamat || '';
      const email = mitra.email || '';
      const website = mitra.website || '';
      const deskripsi = mitra.deskripsi || '';
      return (
        nama.toLowerCase().includes(keyword) ||
        alamat.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        website.toLowerCase().includes(keyword) ||
        deskripsi.toLowerCase().includes(keyword)
      );
    });
  }, [mitraList, search]);

  return (
    <>
      <Navbar /> {/* navbar atas ditampilkan */}
      <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <div className="app-container">
          <section className="mb-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
                  Daftar Mitra
                </p>
                <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
                  Mitra magang yang sudah terdata.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                  Halaman ini menampilkan perusahaan atau instansi yang telah
                  terdata sebagai mitra magang. Mahasiswa dapat mengecek mitra
                  sebelum melakukan pendataan atau pengajuan magang.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                <Link href="/" className="app-btn-secondary">
                  Beranda
                </Link>
                <Link href="/ajukan-mitra" className="app-btn-primary">
                  Ajukan Mitra
                </Link>
              </div>
            </div>
          </section>

          <section className="app-card mb-6 p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <div>
                <label className="app-label">Cari Mitra</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama perusahaan, alamat, email, website, atau deskripsi..."
                />
              </div>
              <div className="rounded-2xl bg-blue-50 px-5 py-4 text-sm font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                {filteredMitra.length} Mitra Aktif
              </div>
            </div>
          </section>

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {isLoading ? (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="app-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
                    <div className="flex-1">
                      <div className="h-5 w-40 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                      <div className="mt-3 h-4 w-56 animate-pulse rounded-full bg-slate-100 dark:bg-slate-800" />
                    </div>
                  </div>
                  <div className="mt-6 h-20 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                </div>
              ))}
            </section>
          ) : filteredMitra.length === 0 ? (
            <section className="app-card p-8 text-center">
              <p className="text-lg font-black text-slate-950 dark:text-white">
                Mitra tidak ditemukan.
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Coba gunakan kata kunci lain atau ajukan mitra baru jika
                perusahaan belum terdata.
              </p>
              <Link href="/ajukan-mitra" className="app-btn-primary mt-5 inline-flex">
                Ajukan Mitra
              </Link>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredMitra.map((mitra) => (
                <article
                  key={mitra.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/40"
                >
                  <div className="flex items-start gap-4">
                    {mitra.logo ? (
                      <img
                        src={mitra.logo}
                        alt={mitra.nama_mitra}
                        className="h-16 w-16 shrink-0 rounded-3xl border border-blue-100 object-contain p-2 dark:border-blue-400/20"
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-2xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                        {getInitial(mitra.nama_mitra)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h2 className="break-words text-xl font-black text-slate-950 dark:text-white">
                        {mitra.nama_mitra}
                      </h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {mitra.alamat || 'Alamat belum tersedia'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 line-clamp-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {mitra.deskripsi || 'Deskripsi mitra belum tersedia.'}
                  </p>
                  <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        WhatsApp
                      </p>
                      {mitra.kontak_wa ? (
                        <a
                          href={getWhatsappLink(mitra.kontak_wa)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                        >
                          {mitra.kontak_wa}
                        </a>
                      ) : (
                        <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">
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
                        <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">
                          -
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Website
                      </p>
                      {mitra.website ? (
                        <a
                          href={mitra.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex break-all font-black text-[#1e3a8a] dark:text-blue-300"
                        >
                          {mitra.website}
                        </a>
                      ) : (
                        <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">
                          -
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}