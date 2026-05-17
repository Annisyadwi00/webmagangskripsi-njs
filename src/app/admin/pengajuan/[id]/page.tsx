"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanById } from '@/lib/pengajuan-client';

function getStatusBadgeClass(status?: string) {
  if (status === 'Aktif' || status === 'Selesai' || status === 'Disetujui') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi' || status === 'Pilih_Dosen' || status === 'Menunggu') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak' || status === 'Revisi') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function getStatusLabel(status?: string) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Pilih_Dosen') return 'Pilih Dosen';

  return status || '-';
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="app-panel p-4">
      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 font-black text-slate-950 dark:text-white">
        {value || '-'}
      </p>
    </div>
  );
}

export default function AdminPengajuanDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrorMsg('');

        const [me, data] = await Promise.all([
          getCurrentUserClient(),
          getPengajuanById(id),
        ]);

        if (me.role !== 'Admin') {
          window.location.href = getDashboardPathByRole(me.role);
          return;
        }

        setCurrentUser(me);
        setPengajuan(data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Gagal memuat detail pengajuan.';

        setErrorMsg(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <div className="app-card p-8">
            <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg || !pengajuan) {
    return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <Alert variant="error">
            {errorMsg || 'Data pengajuan tidak ditemukan.'}
          </Alert>

          <Link href="/admin/pengajuan" className="app-btn-secondary">
            Kembali ke Pengajuan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-8">
      <div className="app-container">
        <PageHeader
          eyebrow="Detail Pengajuan"
          title={pengajuan.nama_mahasiswa}
          description={`Detail pengajuan magang yang dilihat oleh ${currentUser?.name || 'Admin'}.`}
          action={
            <Link href="/admin/pengajuan" className="app-btn-secondary">
              Kembali
            </Link>
          }
        />

        <section className="mb-6 app-card p-6">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Informasi Pengajuan
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Status dan data utama pengajuan magang.
              </p>
            </div>

            <span className={getStatusBadgeClass(pengajuan.status)}>
              {getStatusLabel(pengajuan.status)}
            </span>
          </div>

          {pengajuan.status === 'Ditolak' && pengajuan.alasan_penolakan && (
            <Alert variant="error">
              Alasan penolakan: {pengajuan.alasan_penolakan}
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="Nama Mahasiswa" value={pengajuan.nama_mahasiswa} />
            <DetailItem label="Perusahaan" value={pengajuan.perusahaan} />
            <DetailItem label="Posisi" value={pengajuan.posisi} />
            <DetailItem label="Dosen Pembimbing" value={pengajuan.nama_dosen} />
            <DetailItem label="Tanggal Mulai" value={pengajuan.tgl_mulai} />
            <DetailItem label="Tanggal Berakhir" value={pengajuan.tgl_berakhir} />
            <DetailItem label="Tipe Konversi" value={pengajuan.tipeKonversi} />
            <DetailItem label="Semester Konversi" value={pengajuan.semester_konversi} />
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {pengajuan.link_loa && (
              <a
                href={pengajuan.link_loa}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-primary"
              >
                Buka Dokumen LOA
              </a>
            )}

            {pengajuan.link_laporan_akhir && (
              <a
                href={pengajuan.link_laporan_akhir}
                target="_blank"
                rel="noopener noreferrer"
                className="app-btn-secondary"
              >
                Buka Laporan Akhir
              </a>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Status Dosen
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Status persetujuan dosen pembimbing:
            </p>

            <div className="mt-4">
              <span className={getStatusBadgeClass(pengajuan.status_dosen || undefined)}>
                {pengajuan.status_dosen || 'Belum Ada'}
              </span>
            </div>
          </div>

          <div className="app-card p-6">
            <h2 className="text-xl font-black text-slate-950 dark:text-white">
              Nilai Akhir
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailItem label="Nilai Akhir" value={pengajuan.nilai_dari_dosen} />
              <DetailItem label="Kedisiplinan" value={pengajuan.nilai_kedisiplinan} />
              <DetailItem label="Materi" value={pengajuan.nilai_materi} />
              <DetailItem label="Koding" value={pengajuan.nilai_koding} />
              <DetailItem label="Laporan" value={pengajuan.nilai_laporan} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}