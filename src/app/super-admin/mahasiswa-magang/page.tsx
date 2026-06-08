"use client";

import { useEffect, useMemo, useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Verifikasi';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return status || '-';
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Aktif' || status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Menunggu_Verifikasi') {
    return 'app-badge app-badge-yellow';
  }

  if (status === 'Ditolak') {
    return 'app-badge app-badge-red';
  }

  return 'app-badge app-badge-blue';
}

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function getLaporanStatus(item: Pengajuan) {
  if (item.jenis_magang === 'Tidak Konversi') return 'Tidak Wajib';
  return item.link_laporan_akhir ? 'Sudah Upload' : 'Belum Upload';
}

function getOutputStatus(item: Pengajuan) {
  if (item.jenis_magang !== 'Maksimal 20 SKS') return '-';
  return item.link_output_magang ? 'Sudah Upload' : 'Belum Upload';
}

function getExportRows(data: Pengajuan[]) {
  return data.map((item) => ({
    nama: item.nama_mahasiswa || '',
    npm: item.npm || '',
    prodi: item.program_studi || '',
    kelas: item.kelas || '',
    jenisMagang: item.jenis_magang || '',
    perusahaan: item.perusahaan || '',
    posisi: item.posisi || '',
    tanggalMulai: item.tgl_mulai || '',
    tanggalBerakhir: item.tgl_berakhir || '',
    dosenPembimbing: item.nama_dosen || '',
    status: getStatusLabel(item.status),
    laporan: getLaporanStatus(item),
    output: getOutputStatus(item),
    nilaiAkhir: item.nilai_dari_dosen || '',
  }));
}

export default function SuperAdminMahasiswaMagangPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
      ]);

      if (me.role !== 'Super Admin') {
        window.location.href = getDashboardPathByRole(me.role);
        return;
      }

      setCurrentUser(me);
      setPengajuans(pengajuanData.items || []);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal memuat data mahasiswa magang.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredPengajuans = useMemo(() => {
    const keyword = search.toLowerCase();

    return pengajuans.filter((item) => {
      const matchesKeyword =
        item.nama_mahasiswa.toLowerCase().includes(keyword) ||
        (item.npm || '').toLowerCase().includes(keyword) ||
        (item.program_studi || '').toLowerCase().includes(keyword) ||
        (item.kelas || '').toLowerCase().includes(keyword) ||
        item.perusahaan.toLowerCase().includes(keyword) ||
        (item.nama_dosen || '').toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;

      return matchesKeyword && matchesStatus;
    });
  }, [pengajuans, search, statusFilter]);

  const totalAktif = pengajuans.filter((item) => item.status === 'Aktif').length;
  const totalSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  ).length;
  const totalBelumUploadLaporan = pengajuans.filter(
    (item) => !item.link_laporan_akhir
  ).length;

  const handleExportCsv = () => {
  const headers = [
    'Nama Mahasiswa',
    'NPM',
    'Program Studi',
    'Kelas',
    'Jenis Magang',
    'Perusahaan',
    'Posisi',
    'Tanggal Mulai',
    'Tanggal Berakhir',
    'Dosen Pembimbing',
    'Status',
    'Laporan',
    'Output Magang',
    'Nilai Akhir',
  ];

  const rows = getExportRows(filteredPengajuans).map((item) => [
    item.nama,
    item.npm,
    item.prodi,
    item.kelas,
    item.jenisMagang,
    item.perusahaan,
    item.posisi,
    item.tanggalMulai,
    item.tanggalBerakhir,
    item.dosenPembimbing,
    item.status,
    item.laporan,
    item.output,
    item.nilaiAkhir,
  ]);

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `data-mahasiswa-magang-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const handleExportExcel = () => {
  const rows = getExportRows(filteredPengajuans);

  const tableRows = rows
    .map(
      (item) => `
        <tr>
          <td>${item.nama}</td>
          <td>${item.npm}</td>
          <td>${item.prodi}</td>
          <td>${item.kelas}</td>
          <td>${item.jenisMagang}</td>
          <td>${item.perusahaan}</td>
          <td>${item.posisi}</td>
          <td>${item.tanggalMulai}</td>
          <td>${item.tanggalBerakhir}</td>
          <td>${item.dosenPembimbing}</td>
          <td>${item.status}</td>
          <td>${item.laporan}</td>
          <td>${item.output}</td>
          <td>${item.nilaiAkhir}</td>
        </tr>
      `
    )
    .join('');

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
      </head>
      <body>
        <table border="1">
          <thead>
            <tr>
              <th>Nama Mahasiswa</th>
              <th>NPM</th>
              <th>Program Studi</th>
              <th>Kelas</th>
              <th>Jenis Magang</th>
              <th>Perusahaan</th>
              <th>Posisi</th>
              <th>Tanggal Mulai</th>
              <th>Tanggal Berakhir</th>
              <th>Dosen Pembimbing</th>
              <th>Status</th>
              <th>Laporan</th>
              <th>Output Magang</th>
              <th>Nilai Akhir</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([html], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `data-mahasiswa-magang-${new Date()
    .toISOString()
    .slice(0, 10)}.xls`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

const handleExportPdf = () => {
  const rows = getExportRows(filteredPengajuans);

  const tableRows = rows
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${item.nama}</td>
          <td>${item.npm}</td>
          <td>${item.prodi}</td>
          <td>${item.kelas}</td>
          <td>${item.jenisMagang}</td>
          <td>${item.perusahaan}</td>
          <td>${item.dosenPembimbing}</td>
          <td>${item.status}</td>
          <td>${item.nilaiAkhir || '-'}</td>
        </tr>
      `
    )
    .join('');

  const printWindow = window.open('', '_blank');

  if (!printWindow) {
    alert('Popup diblokir. Izinkan popup untuk export PDF.');
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Data Mahasiswa Magang</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 24px;
            color: #111827;
          }

          h1 {
            margin-bottom: 4px;
            font-size: 22px;
          }

          p {
            margin-top: 0;
            color: #64748b;
            font-size: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
          }

          th, td {
            border: 1px solid #cbd5e1;
            padding: 6px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f1f5f9;
          }

          @media print {
            body {
              padding: 12px;
            }
          }
        </style>
      </head>

      <body>
        <h1>Data Mahasiswa Magang</h1>
        <p>Dicetak pada ${new Date().toLocaleDateString('id-ID')}</p>

        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>NPM</th>
              <th>Program Studi</th>
              <th>Kelas</th>
              <th>Jenis Magang</th>
              <th>Perusahaan</th>
              <th>Dosen Pembimbing</th>
              <th>Status</th>
              <th>Nilai</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  if (isLoading) {
    return (
      <DashboardShell role="Super Admin">
        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 h-96 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell role="Super Admin">
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow="staff"
            title="Data Mahasiswa Magang"
            description={`Kelola rekap mahasiswa magang dan export data ke CSV, Excel, atau PDF. Halo, ${
              currentUser?.name || 'Super Admin'
            }.`}
            action={
  <div className="flex flex-col gap-2 sm:flex-row">
    <button
      type="button"
      onClick={handleExportCsv}
      className="app-btn-secondary"
    >
      Export CSV
    </button>

    <button
      type="button"
      onClick={handleExportExcel}
      className="app-btn-secondary"
    >
      Export Excel
    </button>

    <button
      type="button"
      onClick={handleExportPdf}
      className="app-btn-primary"
    >
      Export PDF
    </button>
  </div>
}
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          {totalBelumUploadLaporan > 0 && (
            <Alert variant="warning">
              Ada {totalBelumUploadLaporan} mahasiswa yang belum melengkapi dokumen magang.
            </Alert>
          )}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Total Mahasiswa"
              value={pengajuans.length}
              description="Seluruh data mahasiswa magang."
              icon="users"
            />

            <StatCard
              title="Magang Aktif"
              value={totalAktif}
              description="Mahasiswa yang sedang magang."
              icon="briefcase"
            />

            <StatCard
              title="Magang Selesai"
              value={totalSelesai}
              description="Mahasiswa yang sudah selesai dinilai."
              icon="check"
            />
          </section>

          <section className="app-card p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Daftar Mahasiswa Magang
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Data diambil dari pengajuan magang mahasiswa.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[260px_180px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama/NPM/prodi..."
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="app-input"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu_Verifikasi">
                    Menunggu Verifikasi
                  </option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
            </div>

            {filteredPengajuans.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Data mahasiswa magang tidak ditemukan.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-black">Mahasiswa</th>
                      <th className="px-5 py-4 font-black">Magang</th>
                      <th className="px-5 py-4 font-black">Dosen</th>
                      <th className="px-5 py-4 font-black">Status</th>
                      <th className="px-5 py-4 font-black">Laporan</th>
                      <th className="px-5 py-4 font-black">Nilai</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPengajuans.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.nama_mahasiswa}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.npm || '-'} • {item.program_studi || '-'} •{' '}
                            {item.kelas || '-'}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-700 dark:text-slate-300">
                            {item.perusahaan}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.tgl_mulai || '-'} sampai{' '}
                            {item.tgl_berakhir || '-'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {item.nama_dosen || '-'}
                        </td>

                        <td className="px-5 py-4">
                          <span className={getStatusBadgeClass(item.status)}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          {item.link_laporan_akhir ? (
                            <a
                              href={item.link_laporan_akhir}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-black text-[#1e3a8a] dark:text-blue-300"
                            >
                              Buka
                            </a>
                          ) : (
                            <span className="app-badge app-badge-yellow">
                              Belum Upload
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4 font-black text-slate-950 dark:text-white">
                          {item.nilai_dari_dosen || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </DashboardShell>
  );
}