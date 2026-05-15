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

export default function DosenDashboardPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
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
          getPengajuanList(1, 50),
          getLogbookList(),
        ]);

        if (currentUser.role !== 'Dosen') {
          window.location.href = '/login';
          return;
        }

        setUser(currentUser);
        setPengajuans(pengajuanData.items);
        setLogbooks(logbookData);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat dashboard dosen.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const permintaanBimbingan = pengajuans.filter(
    (item) => item.status_dosen === 'Menunggu'
  );

  const mahasiswaAktif = pengajuans.filter(
    (item) => item.status_dosen === 'Disetujui' && item.status === 'Aktif'
  );

  const logbookMenunggu = logbooks.filter(
    (item) => item.status === 'Menunggu'
  );

  const pengajuanBelumDinilai = pengajuans.filter(
    (item) =>
      item.status_dosen === 'Disetujui' &&
      item.status === 'Aktif' &&
      !item.nilai_dari_dosen
  );

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat dashboard dosen...</p>
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
          <p className="text-sm font-bold text-indigo-700 uppercase tracking-wide">
            Dashboard Dosen
          </p>
          <h1 className="text-3xl font-black text-gray-900 mt-2">
            Selamat datang, {user?.name}
          </h1>
          <p className="text-gray-500 mt-2">
            Pantau mahasiswa bimbingan, evaluasi logbook, dan pemberian nilai
            akhir.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <StatCard
            title="Permintaan Bimbingan"
            value={permintaanBimbingan.length}
            description="Mahasiswa menunggu persetujuan."
          />
          <StatCard
            title="Mahasiswa Aktif"
            value={mahasiswaAktif.length}
            description="Mahasiswa yang sedang dibimbing."
          />
          <StatCard
            title="Logbook Menunggu"
            value={logbookMenunggu.length}
            description="Logbook perlu dievaluasi."
          />
          <StatCard
            title="Belum Dinilai"
            value={pengajuanBelumDinilai.length}
            description="Mahasiswa aktif belum punya nilai akhir."
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">
              Mahasiswa Bimbingan Terbaru
            </h2>

            {mahasiswaAktif.length === 0 ? (
              <p className="text-gray-500">Belum ada mahasiswa aktif.</p>
            ) : (
              <div className="space-y-3">
                {mahasiswaAktif.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-xl p-4"
                  >
                    <p className="font-bold text-gray-900">
                      {item.nama_mahasiswa}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.perusahaan} - {item.posisi}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">
              Menu Cepat Dosen
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <Link
                href="/dosen/logbook"
                className="px-5 py-4 rounded-xl bg-indigo-50 text-indigo-700 font-bold hover:bg-indigo-100"
              >
                Evaluasi Logbook
              </Link>

              <Link
                href="/dosen/bimbingan"
                className="px-5 py-4 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-100"
              >
                Kelola Bimbingan
              </Link>

              <Link
                href="/dosen/penilaian"
                className="px-5 py-4 rounded-xl bg-yellow-50 text-yellow-700 font-bold hover:bg-yellow-100"
              >
                Input Nilai Akhir
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}