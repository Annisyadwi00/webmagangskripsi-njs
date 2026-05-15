"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';
import { Logbook, getLogbookList } from '@/lib/logbook-client';

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <p className="text-sm font-bold text-gray-500">{title}</p>
      <h3 className="text-3xl font-black text-gray-900 mt-2">{value}</h3>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    </div>
  );
}

export default function MahasiswaDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [logbooks, setLogbooks] = useState<Logbook[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [currentUser, pengajuanData, logbookData] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanList(1, 10),
          getLogbookList(),
        ]);

        if (currentUser.role !== 'Mahasiswa') {
          window.location.href = '/login';
          return;
        }

        setUser(currentUser);
        setPengajuan(pengajuanData.items[0] || null);
        setLogbooks(logbookData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard mahasiswa.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalDisetujui = logbooks.filter(
    (item) => item.status === 'Disetujui'
  ).length;

  const totalRevisi = logbooks.filter((item) => item.status === 'Revisi').length;

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat dashboard mahasiswa...</p>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="p-6">
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 font-medium">
          {errorMsg}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <section className="mb-8">
          <p className="text-sm font-bold text-[#1e3a8a] uppercase tracking-wide">
            Dashboard Mahasiswa
          </p>
          <h1 className="text-3xl font-black text-gray-900 mt-2">
            Selamat datang, {user?.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Pantau pengajuan magang, logbook, dan laporan akhir kamu di sini.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <StatCard
            title="Status Pengajuan"
            value={pengajuan?.status || 'Belum Ada'}
            description="Status terakhir proses magang kamu."
          />
          <StatCard
            title="Total Logbook"
            value={logbooks.length}
            description="Jumlah logbook yang sudah kamu isi."
          />
          <StatCard
            title="Logbook Disetujui"
            value={totalDisetujui}
            description={`${totalRevisi} logbook masih perlu revisi.`}
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">
              Ringkasan Magang
            </h2>

            {pengajuan ? (
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Perusahaan</p>
                  <p className="font-bold text-gray-900">
                    {pengajuan.perusahaan}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Posisi</p>
                  <p className="font-bold text-gray-900">{pengajuan.posisi}</p>
                </div>

                <div>
                  <p className="text-gray-500">Dosen Pembimbing</p>
                  <p className="font-bold text-gray-900">
                    {pengajuan.nama_dosen || '-'}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500">Nilai Akhir</p>
                  <p className="font-bold text-gray-900">
                    {pengajuan.nilai_dari_dosen || 'Belum dinilai'}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">
                Kamu belum memiliki pengajuan magang.
              </p>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">
              Menu Cepat
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/pengajuan"
                className="px-5 py-4 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100"
              >
                Kelola Pengajuan Magang
              </Link>

              <Link
                href="/logbook"
                className="px-5 py-4 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100"
              >
                Isi Logbook Harian
              </Link>

              <Link
                href="/lowongan"
                className="px-5 py-4 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100"
              >
                Lihat Lowongan Magang
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}