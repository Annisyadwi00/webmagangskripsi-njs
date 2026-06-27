// app/admin/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import Alert from "@/components/ui/Alert";
import LoadingAnimation from "@/components/ui/LoadingAnimation";
import { getDashboardPathByRole } from "@/lib/role-redirect";
import { CurrentUser, getCurrentUserClient } from "@/lib/client-auth";
import {
  PengajuanMitra,
  getPengajuanMitraList,
} from "@/lib/pengajuan-mitra-client";
import {
  Pengajuan,
  getPengajuanList,
} from "@/lib/pengajuan-client"; // <-- import pengajuan magang

function getStatusBadgeClass(status?: string | null) {
  if (status === "Aktif" || status === "Selesai" || status === "Disetujui") {
    return "app-badge app-badge-green";
  }
  if (status === "Menunggu_Verifikasi" || status === "Menunggu") {
    return "app-badge app-badge-yellow";
  }
  if (status === "Ditolak" || status === "Revisi") {
    return "app-badge app-badge-red";
  }
  return "app-badge app-badge-blue";
}

function getStatusLabel(status?: string | null) {
  if (status === "Menunggu_Verifikasi") return "Menunggu Verifikasi";
  if (status === "Aktif") return "Aktif";
  if (status === "Selesai") return "Selesai";
  if (status === "Ditolak") return "Ditolak";
  if (status === "Menunggu") return "Menunggu";
  if (status === "Disetujui") return "Disetujui";
  return status || "-";
}

export default function AdminDashboardPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuanMitra, setPengajuanMitra] = useState<PengajuanMitra[]>([]);
  const [pengajuanMagang, setPengajuanMagang] = useState<Pengajuan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const [me, mitraData, magangData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanMitraList(),
        getPengajuanList(1, 100), // ambil semua data (bisa disesuaikan)
      ]);

      if (me.role !== "Admin") {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setPengajuanMitra(mitraData || []);
      setPengajuanMagang(magangData.items || []);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memuat dashboard admin.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const pendingMitra = useMemo(
    () => pengajuanMitra.filter((item) => item.status === "Menunggu"),
    [pengajuanMitra]
  );

  const pendingMagang = useMemo(
    () => pengajuanMagang.filter((item) => item.status === "Menunggu_Verifikasi"),
    [pengajuanMagang]
  );

  const latestMitra = useMemo(() => pengajuanMitra.slice(0, 5), [pengajuanMitra]);
  const latestMagang = useMemo(() => pengajuanMagang.slice(0, 5), [pengajuanMagang]);

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <LoadingAnimation />
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
          eyebrow="Dashboard Admin"
          title={`Halo, ${currentUser?.name || "Admin"}`}
          description="Kelola pengajuan mitra dan pengajuan magang dalam satu dashboard."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/admin/pengajuan-mitra" className="app-btn-primary">
                Verifikasi Mitra
              </Link>
              <Link href="/admin/pengajuan" className="app-btn-primary">
                Verifikasi Magang
              </Link>
            </div>
          }
        />

        {pendingMitra.length > 0 && (
          <Alert variant="info" className="mb-6">
            Ada {pendingMitra.length} pengajuan mitra yang menunggu verifikasi.
          </Alert>
        )}
        {pendingMagang.length > 0 && (
          <Alert variant="info" className="mb-6">
            Ada {pendingMagang.length} pengajuan magang yang menunggu verifikasi.
          </Alert>
        )}

        {/* Statistik */}
        <section className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pengajuan Mitra Menunggu"
            value={pendingMitra.length}
            description="Mitra baru menunggu validasi."
            icon="document"
          />
          <StatCard
            title="Total Pengajuan Mitra"
            value={pengajuanMitra.length}
            description="Semua pengajuan mitra masuk."
            icon="users"
          />
          <StatCard
            title="Pengajuan Magang Menunggu"
            value={pendingMagang.length}
            description="Magang menunggu verifikasi staff."
            icon="clipboard"
          />
          <StatCard
            title="Total Pengajuan Magang"
            value={pengajuanMagang.length}
            description="Semua pengajuan magang."
            icon="file"
          />
        </section>

        {/* Daftar Pengajuan Mitra Terbaru */}
        <section className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="app-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Pengajuan Mitra Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data mitra baru yang diajukan mahasiswa.
                </p>
              </div>
              <Link
                href="/admin/pengajuan-mitra"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>
            {latestMitra.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengajuan mitra.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestMitra.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          {item.nama_mitra}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Pengusul: {item.nama_mahasiswa_pengusul}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Narahubung: {item.nama_narahubung_mitra}
                        </p>
                      </div>
                      <span className={getStatusBadgeClass(item.status)}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daftar Pengajuan Magang Terbaru */}
          <div className="app-card p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Pengajuan Magang Terbaru
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data magang yang diajukan mahasiswa.
                </p>
              </div>
              <Link
                href="/admin/pengajuan"
                className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
              >
                Lihat semua
              </Link>
            </div>
            {latestMagang.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada pengajuan magang.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {latestMagang.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-black text-slate-950 dark:text-white">
                          {item.perusahaan}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Mahasiswa: {item.nama_mahasiswa}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Periode: {item.tgl_mulai} s.d {item.tgl_berakhir}
                        </p>
                      </div>
                      <span className={getStatusBadgeClass(item.status)}>
                        {getStatusLabel(item.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}