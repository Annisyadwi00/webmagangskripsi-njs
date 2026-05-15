"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { Lowongan, getLowonganList } from '@/lib/lowongan-client';

function getTypeBadgeClass(type: string) {
  if (type === 'Remote') {
    return 'app-badge app-badge-green';
  }

  if (type === 'Hybrid') {
    return 'app-badge app-badge-yellow';
  }

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
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchLowongan = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const data = await getLowonganList();
        setLowongan(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal mengambil data lowongan.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLowongan();
  }, []);

  const filteredLowongan = useMemo(() => {
    const keyword = search.toLowerCase();

    return lowongan.filter((item) => {
      const matchesKeyword =
        item.title.toLowerCase().includes(keyword) ||
        item.company.toLowerCase().includes(keyword) ||
        item.location.toLowerCase().includes(keyword) ||
        item.kategori.toLowerCase().includes(keyword);

      const matchesType = typeFilter === 'Semua' || item.type === typeFilter;

      return matchesKeyword && matchesType;
    });
  }, [lowongan, search, typeFilter]);

  const totalRemote = lowongan.filter((item) => item.type === 'Remote').length;
  const totalHybrid = lowongan.filter((item) => item.type === 'Hybrid').length;

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200" />
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-36 animate-pulse rounded-2xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">{errorMsg}</Alert>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Bursa Magang"
          title="Lowongan Magang"
          description="Temukan informasi lowongan magang yang tersedia dan sesuai dengan minat serta kebutuhan konversi akademik."
          action={
            <Link href="/" className="app-btn-secondary">
              Kembali ke Beranda
            </Link>
          }
        />

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Lowongan Aktif"
            value={lowongan.length}
            description="Total lowongan yang sedang tersedia."
            icon="briefcase"
          />

          <StatCard
            title="Remote"
            value={totalRemote}
            description="Lowongan yang dapat dikerjakan jarak jauh."
            icon="document"
          />

          <StatCard
            title="Hybrid"
            value={totalHybrid}
            description="Lowongan dengan kombinasi onsite dan remote."
            icon="chart"
          />
        </section>

        <section className="app-card mb-6 p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <label className="app-label">Cari Lowongan</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="app-input"
                placeholder="Cari posisi, perusahaan, lokasi, atau kategori..."
              />
            </div>

            <div>
              <label className="app-label">Tipe Kerja</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="app-input"
              >
                <option value="Semua">Semua</option>
                <option value="Onsite">Onsite</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
          </div>
        </section>

        {filteredLowongan.length === 0 ? (
          <section className="app-card p-8 text-center">
            <p className="font-bold text-slate-700">
              Lowongan tidak ditemukan.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Coba ubah kata kunci pencarian atau filter tipe kerja.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filteredLowongan.map((item) => (
              <article
                key={item.id}
                className="app-card group flex flex-col p-6 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-black uppercase tracking-wide text-[#1e3a8a]">
                      {item.company}
                    </p>

                    <h2 className="mt-2 text-xl font-black text-slate-950">
                      {item.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {item.location}
                    </p>
                  </div>

                  <span className={getTypeBadgeClass(item.type)}>
                    {item.type}
                  </span>
                </div>

                <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Kategori
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {item.kategori}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Konversi
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {item.tipeKonversi}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Kuota
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {item.kuota} mahasiswa
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Batas Daftar
                    </p>
                    <p className="mt-1 font-bold text-slate-950">
                      {formatDate(item.valid_until)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {item.link_pendaftaran ? (
                    <a
                      href={item.link_pendaftaran}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="app-btn-primary flex-1"
                    >
                      Daftar Lowongan
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="app-btn-primary flex-1 cursor-not-allowed opacity-60"
                    >
                      Link Belum Tersedia
                    </button>
                  )}

                  {item.email_perusahaan && (
                    <a
                      href={`mailto:${item.email_perusahaan}`}
                      className="app-btn-secondary flex-1"
                    >
                      Hubungi Perusahaan
                    </a>
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