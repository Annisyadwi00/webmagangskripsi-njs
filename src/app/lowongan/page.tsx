"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import { Lowongan, getLowonganList } from '@/lib/lowongan-client';

function getTypeBadgeClass(type?: string) {
  if (type === 'Remote') return 'app-badge app-badge-green';
  if (type === 'Hybrid') return 'app-badge app-badge-yellow';

  return 'app-badge app-badge-blue';
}

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function LowonganPage() {
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [selectedLowongan, setSelectedLowongan] = useState<Lowongan | null>(
    null
  );

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');
  const [konversiFilter, setKonversiFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchLowongan = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const data = await getLowonganList();
      setLowongan(data || []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLowongan();
  }, []);

  const filteredLowongan = useMemo(() => {
    const keyword = search.toLowerCase();

    return lowongan.filter((item) => {
      const matchesKeyword =
        item.title.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.kategori.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword);

      const matchesType = typeFilter === 'Semua' || item.type === typeFilter;

      const matchesKonversi =
        konversiFilter === 'Semua' || item.tipeKonversi === konversiFilter;

      return matchesKeyword && matchesType && matchesKonversi;
    });
  }, [lowongan, search, typeFilter, konversiFilter]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />

            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 dark:bg-slate-950">
      <div className="app-container">
        <section className="relative mb-8 overflow-hidden rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.10),transparent_30%)]" />

  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
    <div>
      <p className="mt-8 text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
        Lowongan Magang
      </p>

      <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
        Temukan lowongan magang yang sesuai.
      </h1>

      <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
        Jelajahi lowongan magang berdasarkan perusahaan, posisi, sistem kerja,
        dan jenis konversi. Detail lowongan dapat dilihat tanpa meninggalkan
        halaman ini.
      </p>
    </div>

    <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-400/20 dark:bg-blue-400/10 lg:w-72">
      <p className="text-sm font-black text-[#1e3a8a] dark:text-blue-300">
        Total Lowongan
      </p>

      <p className="mt-2 text-4xl font-black text-slate-950 dark:text-white">
        {filteredLowongan.length}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-500 dark:text-slate-400">
        lowongan sesuai filter
      </p>
    </div>
  </div>
</section>

        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-6">
  <div className="mb-5">
    <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
      Filter Lowongan
    </p>

    <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
      Cari berdasarkan kebutuhanmu
    </h2>
  </div>

  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px_260px_auto]">
    <div>
      <label className="app-label">Kata Kunci</label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔎
        </span>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="app-input pl-11"
          placeholder="Cari posisi, perusahaan, lokasi..."
        />
      </div>
    </div>

    <div>
      <label className="app-label">Sistem Kerja</label>
      <select
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="app-input"
      >
        <option value="Semua">Semua Sistem</option>
        <option value="Onsite">Onsite</option>
        <option value="Hybrid">Hybrid</option>
        <option value="Remote">Remote</option>
      </select>
    </div>

    <div>
      <label className="app-label">Konversi</label>
      <select
        value={konversiFilter}
        onChange={(e) => setKonversiFilter(e.target.value)}
        className="app-input"
      >
        <option value="Semua">Semua Konversi</option>
        <option value="Konversi 20 SKS">Konversi 20 SKS</option>
        <option value="Tidak Konversi">Tidak Konversi</option>
        <option value="Konversi 2 SKS">Konversi 2 SKS</option>
      </select>
    </div>

    <div className="flex items-end">
      <button
        type="button"
        onClick={() => {
          setSearch('');
          setTypeFilter('Semua');
          setKonversiFilter('Semua');
        }}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 font-black text-slate-700 transition hover:border-[#1e3a8a] hover:bg-blue-50 hover:text-[#1e3a8a] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-300 dark:hover:bg-blue-400/10 dark:hover:text-blue-300"
      >
        Reset
      </button>
    </div>
  </div>
</section>

        {filteredLowongan.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700 dark:text-slate-300">
              Lowongan tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Coba ubah kata kunci pencarian atau filter yang dipilih.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredLowongan.map((item) => (
              <article key={item.id} className="app-card app-card-hover p-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-950 dark:text-white">
                        {item.company}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {item.location || 'Menyesuaikan'}
                      </p>
                    </div>

                    <span className={getTypeBadgeClass(item.type)}>
                      {item.type}
                    </span>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="font-black text-slate-950 dark:text-white">
                      {item.title}
                    </p>

                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="app-badge app-badge-blue">
                      {item.tipeKonversi}
                    </span>

                    <span className="app-badge app-badge-yellow">
                      Kuota {item.kuota}
                    </span>

                    {item.isPaid && (
                      <span className="app-badge app-badge-green">
                        Paid
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      Berlaku sampai: {formatDate(item.valid_until)}
                    </p>

                    <button
                      type="button"
                      onClick={() => setSelectedLowongan(item)}
                      className="app-btn-primary px-4 py-2 text-sm"
                    >
                      Lihat Detail
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {selectedLowongan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setSelectedLowongan(null)}
          />

          <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                Detail Lowongan
              </p>

              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                {selectedLowongan.title}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedLowongan.company} • {selectedLowongan.location}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Sistem Kerja
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {selectedLowongan.type}
                </p>
              </div>

              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Konversi
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {selectedLowongan.tipeKonversi}
                </p>
              </div>

              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Kuota
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {selectedLowongan.kuota} mahasiswa
                </p>
              </div>

              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Kategori
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {selectedLowongan.kategori || '-'}
                </p>
              </div>

              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Status Benefit
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {selectedLowongan.isPaid ? 'Paid' : 'Unpaid'}
                </p>
              </div>

              <div className="app-panel p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Batas Pendaftaran
                </p>
                <p className="mt-1 font-black text-slate-950 dark:text-white">
                  {formatDate(selectedLowongan.valid_until)}
                </p>
              </div>
            </div>

            <div className="app-panel mt-5 p-4">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                Deskripsi
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700 dark:text-slate-300">
                {selectedLowongan.description}
              </p>
            </div>

            {selectedLowongan.email_perusahaan && (
              <div className="app-panel mt-4 p-4">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                  Email Perusahaan
                </p>
                <p className="mt-1 break-words font-black text-slate-950 dark:text-white">
                  {selectedLowongan.email_perusahaan}
                </p>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {selectedLowongan.link_pendaftaran && (
                <a
                  href={selectedLowongan.link_pendaftaran}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-btn-primary flex-1"
                >
                  Daftar Lowongan
                </a>
              )}

              <button
                type="button"
                onClick={() => setSelectedLowongan(null)}
                className="app-btn-secondary flex-1"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}