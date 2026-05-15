"use client";

import { useEffect, useState } from 'react';
import { Lowongan, getLowonganList } from '@/lib/lowongan-client';

export default function LowonganPage() {
  const [lowongan, setLowongan] = useState<Lowongan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchLowongan = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const data = await getAllLowonganList();
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

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat lowongan magang...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Lowongan Magang
        </h1>
        <p className="text-gray-500 mt-1">
          Temukan informasi lowongan magang yang tersedia.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {lowongan.length === 0 ? (
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-gray-500">Belum ada lowongan aktif.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {lowongan.map((item) => (
            <article
              key={item.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-gray-900">
                    {item.title}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {item.company}
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                  {item.type}
                </span>
              </div>

              <p className="mt-4 text-sm text-gray-700 line-clamp-4">
                {item.description}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500">Lokasi</p>
                  <p className="font-bold text-gray-900">{item.location}</p>
                </div>

                <div>
                  <p className="text-gray-500">Konversi</p>
                  <p className="font-bold text-gray-900">
                    {item.tipeKonversi}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Kategori</p>
                  <p className="font-bold text-gray-900">{item.kategori}</p>
                </div>

                <div>
                  <p className="text-gray-500">Kuota</p>
                  <p className="font-bold text-gray-900">{item.kuota}</p>
                </div>

                <div>
                  <p className="text-gray-500">Benefit</p>
                  <p className="font-bold text-gray-900">
                    {item.isPaid ? 'Berbayar' : 'Tidak Berbayar'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Batas Daftar</p>
                  <p className="font-bold text-gray-900">
                    {item.valid_until
                      ? new Date(item.valid_until).toLocaleDateString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                {item.link_pendaftaran && (
                  <a
                    href={item.link_pendaftaran}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900"
                  >
                    Daftar
                  </a>
                )}

                {item.email_perusahaan && (
                  <a
                    href={`mailto:${item.email_perusahaan}`}
                    className="flex-1 text-center px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200"
                  >
                    Email Perusahaan
                  </a>
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}