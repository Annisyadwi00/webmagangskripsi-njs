"use client";

import { useEffect, useMemo, useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Alert from '@/components/ui/Alert';
import StatCard from '@/components/ui/StatCard';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import { Pengajuan, getPengajuanList } from '@/lib/pengajuan-client';

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
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

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function formatDate(date?: string | null) {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function escapeCsv(value: string | number | null | undefined) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getLaporanStatus(item: Pengajuan) {
  if (item.jenis_magang === 'Tidak Konversi') return 'Tidak Wajib';
  if (item.jenis_magang === 'Konversi 2 SKS') {
    return item.link_laporan_akhir ? 'Sudah Upload' : 'Belum Upload';
  }
  if (item.jenis_magang === 'Konversi 20 SKS') {
    return item.link_laporan_akhir ? 'Sudah Upload' : 'Belum Upload';
  }
  return '-';
}

function getOutputStatus(item: Pengajuan) {
  if (item.jenis_magang !== 'Konversi 20 SKS') return '-';
  return item.link_output_magang ? 'Sudah Upload' : 'Belum Upload';
}

function getDokumenStatus(item: Pengajuan) {
  if (item.jenis_magang === 'Tidak Konversi') return 'Tidak Wajib';
  if (item.jenis_magang === 'Konversi 2 SKS') {
    return item.link_laporan_akhir ? 'Lengkap' : 'Belum Lengkap';
  }
  if (item.jenis_magang === 'Konversi 20 SKS') {
    return item.link_laporan_akhir && item.link_output_magang
      ? 'Lengkap'
      : 'Belum Lengkap';
  }
  return '-';
}

function getExportRows(data: Pengajuan[]) {
  return data.map((item) => ({
    nama: item.nama_mahasiswa || '',
    npm: item.npm || '',
    prodi: item.program_studi || '',
    angkatan: item.angkatan || '',
    semester: item.semester || '',
    kelas: item.kelas || '',
    jenisMagang: getJenisMagangLabel(item.jenis_magang),
    perusahaan: item.perusahaan || '',
    posisi: item.posisi || '',
    tanggalMulai: item.tgl_mulai || '',
    tanggalBerakhir: item.tgl_berakhir || '',
    dosenPembimbing: item.nama_dosen || '',
    dosenPenguji: item.nama_dosen_penguji || '',
    status: getStatusLabel(item.status),
    laporan: getLaporanStatus(item),
    output: getOutputStatus(item),
    dokumen: getDokumenStatus(item),
    nilaiAkhir: item.nilai_dari_dosen || '',
  }));
}

export default function AdminMahasiswaMagangPage() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [jenisFilter, setJenisFilter] = useState('Semua');
  const [tahunFilter, setTahunFilter] = useState('Semua');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [me, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 500),
      ]);

      // Izinkan Admin dan Admin
      if (me.role !== 'Admin' && me.role !== 'Admin') {
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
      const nama = item.nama_mahasiswa || '';
      const npm = item.npm || '';
      const prodi = item.program_studi || '';
      const angkatan = item.angkatan || '';
      const semester = item.semester || '';
      const kelas = item.kelas || '';
      const perusahaan = item.perusahaan || '';
      const dosen = item.nama_dosen || '';
      const dosenPenguji = item.nama_dosen_penguji || '';
      const jenisLabel = getJenisMagangLabel(item.jenis_magang);

      const matchesKeyword =
        nama.toLowerCase().includes(keyword) ||
        npm.toLowerCase().includes(keyword) ||
        prodi.toLowerCase().includes(keyword) ||
        angkatan.toLowerCase().includes(keyword) ||
        semester.toLowerCase().includes(keyword) ||
        angkatan.toLowerCase().includes(keyword) ||
        kelas.toLowerCase().includes(keyword) ||
        perusahaan.toLowerCase().includes(keyword) ||
        dosen.toLowerCase().includes(keyword) ||
        dosenPenguji.toLowerCase().includes(keyword) ||
        (item.tahun_akademik || '').toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === 'Semua' || item.status === statusFilter;
      const matchesJenis =
        jenisFilter === 'Semua' || item.jenis_magang === jenisFilter;
      const matchesTahun = 
        tahunFilter === 'Semua' || item.tahun_akademik === tahunFilter;

      return matchesKeyword && matchesStatus && matchesJenis && matchesTahun;
    });
  }, [pengajuans, search, statusFilter, jenisFilter, tahunFilter]);

  const uniqueTahunAkademik = Array.from(
    new Set(pengajuans.map((p) => p.tahun_akademik).filter(Boolean))
  ).sort().reverse();

  const pengajuanFilteredByTahun = useMemo(() => {
    return pengajuans.filter(
      (item) => tahunFilter === 'Semua' || item.tahun_akademik === tahunFilter
    );
  }, [pengajuans, tahunFilter]);

  const totalAktif = pengajuanFilteredByTahun.filter((item) => item.status === 'Aktif').length;
  const totalSelesai = pengajuanFilteredByTahun.filter((item) => item.status === 'Selesai').length;
  const totalMenunggu = pengajuanFilteredByTahun.filter(
    (item) => item.status === 'Menunggu_Verifikasi'
  ).length;
  const totalBelumLengkap = pengajuanFilteredByTahun.filter(
    (item) =>
      item.jenis_magang !== 'Tidak Konversi' &&
      getDokumenStatus(item) === 'Belum Lengkap'
  ).length;

  const exportHeaders = [
    'Nama Mahasiswa',
    'NPM',
    'Program Studi',
    'Angkatan',
    'Semester',
    'Kelas',
    'Jenis Magang',
    'Perusahaan',
    'Posisi',
    'Tanggal Mulai',
    'Tanggal Berakhir',
    'Dosen Pembimbing',
    'Dosen Penguji',
    'Status',
    'Laporan',
    'Output Magang',
    'Dokumen',
    'Nilai Akhir',
  ];

  const handleExportCsv = () => {
    const rows = getExportRows(filteredPengajuans).map((item) => [
      item.nama,
      item.npm,
      item.prodi,
      item.angkatan,
      item.semester,
      item.kelas,
      item.jenisMagang,
      item.perusahaan,
      item.posisi,
      item.tanggalMulai,
      item.tanggalBerakhir,
      item.dosenPembimbing,
      item.dosenPenguji,
      item.status,
      item.laporan,
      item.output,
      item.dokumen,
      item.nilaiAkhir,
    ]);
    const csvContent = [
      exportHeaders.map(escapeCsv).join(','),
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
            <td>${escapeHtml(item.nama)}</td>
            <td>${escapeHtml(item.npm)}</td>
            <td>${escapeHtml(item.prodi)}</td>
            <td>${escapeHtml(item.angkatan)}</td>
            <td>${escapeHtml(item.semester)}</td>
            <td>${escapeHtml(item.kelas)}</td>
            <td>${escapeHtml(item.jenisMagang)}</td>
            <td>${escapeHtml(item.perusahaan)}</td>
            <td>${escapeHtml(item.posisi)}</td>
            <td>${escapeHtml(item.tanggalMulai)}</td>
            <td>${escapeHtml(item.tanggalBerakhir)}</td>
            <td>${escapeHtml(item.dosenPembimbing)}</td>
            <td>${escapeHtml(item.dosenPenguji)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${escapeHtml(item.laporan)}</td>
            <td>${escapeHtml(item.output)}</td>
            <td>${escapeHtml(item.dokumen)}</td>
            <td>${escapeHtml(item.nilaiAkhir)}</td>
          </tr>
        `
      )
      .join('');
    const html = `
      <html>
        <head><meta charset="UTF-8" /></head>
        <body>
          <table border="1">
            <thead><tr>${exportHeaders.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-mahasiswa-magang-${new Date().toISOString().slice(0, 10)}.xls`;
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
            <td>${escapeHtml(item.nama)}</td>
            <td>${escapeHtml(item.npm)}</td>
            <td>${escapeHtml(item.prodi)}</td>
            <td>${escapeHtml(item.angkatan)}</td>
            <td>${escapeHtml(item.kelas)}</td>
            <td>${escapeHtml(item.jenisMagang)}</td>
            <td>${escapeHtml(item.perusahaan)}</td>
            <td>${escapeHtml(item.dosenPembimbing)}</td>
            <td>${escapeHtml(item.dosenPenguji)}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${escapeHtml(item.dokumen)}</td>
            <td>${escapeHtml(item.nilaiAkhir || '-')}</td>
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
            body { font-family: Arial; padding: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px; text-align: left; }
            th { background: #f1f5f9; }
          </style>
        </head>
        <body>
          <h1>Data Mahasiswa Magang</h1>
          <p>Dicetak pada ${new Date().toLocaleDateString('id-ID')}</p>
          <table>
            <thead><tr><th>No</th><th>Nama</th><th>NPM</th><th>Prodi</th><th>Angkatan</th><th>Kelas</th><th>Jenis Magang</th><th>Perusahaan</th><th>Dosen Pembimbing</th><th>Dosen Penguji</th><th>Status</th><th>Dokumen</th><th>Nilai</th></tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

  return (
      <main className="min-h-screen py-8">
        <div className="app-container">
          <PageHeader
            eyebrow={currentUser?.role === 'Admin' ? 'Admin' : 'Admin'}
            title={`Data Mahasiswa Magang ${currentUser?.name || ''}`}
            description="Lihat dan export data mahasiswa magang berdasarkan pengajuan yang masuk ke sistem."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <button type="button" onClick={handleExportCsv} className="app-btn-secondary">
                  Export CSV
                </button>
                <button type="button" onClick={handleExportExcel} className="app-btn-secondary">
                  Export Excel
                </button>
                <button type="button" onClick={handleExportPdf} className="app-btn-primary">
                  Export PDF
                </button>
              </div>
            }
          />

          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
            <StatCard title="Total Data" value={pengajuanFilteredByTahun.length} description="Seluruh pengajuan magang." icon="document" />
            <StatCard title="Aktif" value={totalAktif} description="Mahasiswa sedang magang." icon="briefcase" />
            <StatCard title="Selesai" value={totalSelesai} description="Sudah selesai dinilai." icon="check" />
            <StatCard title="Belum Lengkap" value={totalBelumLengkap} description="Dokumen laporan belum lengkap." icon="warning" />
          </section>

          {totalMenunggu > 0 && (
            <Alert variant="warning">Ada {totalMenunggu} pengajuan yang masih menunggu pemeriksaan.</Alert>
          )}

          <section className="app-card mb-6 p-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_180px_180px_180px_150px]">
              <div>
                <label className="app-label">Cari Mahasiswa</label>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="app-input" placeholder="Cari nama, NPM, prodi, angkatan, kelas, perusahaan, dosen..." />
              </div>
              <div>
                <label className="app-label">Status</label>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="app-input">
                  <option value="Semua">Semua Status</option>
                  <option value="Menunggu_Verifikasi">Menunggu Pemeriksaan</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="app-label">Jenis Magang</label>
                <select value={jenisFilter} onChange={(e) => setJenisFilter(e.target.value)} className="app-input">
                  <option value="Semua">Semua Jenis</option>
                  <option value="Konversi 20 SKS">Konversi Maks 20 SKS</option>
                  <option value="Konversi 2 SKS">Magang 2 SKS Khusus SI</option>
                  <option value="Tidak Konversi">Tidak Konversi</option>
                </select>
              </div>
              <div>
                <label className="app-label">Tahun Akademik</label>
                <select value={tahunFilter} onChange={(e) => setTahunFilter(e.target.value)} className="app-input">
                  <option value="Semua">Semua Tahun</option>
                  {uniqueTahunAkademik.map((thn) => (
                    <option key={thn} value={thn}>{thn}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="app-card overflow-hidden">
            <div className="border-b border-slate-100 p-5 dark:border-slate-800">
              <p className="font-black text-slate-950 dark:text-white">{filteredPengajuans.length} data mahasiswa magang</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Data yang tampil mengikuti filter pencarian saat ini.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1400px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-5 py-4">Mahasiswa</th>
                    <th className="px-5 py-4">Prodi</th>
                    <th className="px-5 py-4">Angkatan</th>
                    <th className="px-5 py-4">Semester</th>
                    <th className="px-5 py-4">Kelas</th>
                    <th className="px-5 py-4">Jenis Magang</th>
                    <th className="px-5 py-4">Perusahaan</th>
                    <th className="px-5 py-4">Periode</th>
                    <th className="px-5 py-4">Pembimbing</th>
                    <th className="px-5 py-4">Penguji</th>
                    <th className="px-5 py-4">Dokumen</th>
                    <th className="px-5 py-4">Nilai</th>
                    <th className="px-5 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPengajuans.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="px-5 py-10 text-center font-bold text-slate-500">
                        Data mahasiswa magang tidak ditemukan.
                      </td>
                    </tr>
                  ) : (
                    filteredPengajuans.map((item) => (
                      <tr key={item.id} className="bg-white align-top dark:bg-slate-900">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950 dark:text-white">{item.nama_mahasiswa}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{item.npm || '-'}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.program_studi || '-'}</td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.angkatan || '-'}</td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.semester || '-'}</td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.kelas || '-'}</td>
                        <td className="px-5 py-4">
                          <span className="app-badge app-badge-blue">{getJenisMagangLabel(item.jenis_magang)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-700 dark:text-slate-200">{item.perusahaan || '-'}</p>
                          <p className="mt-1 text-xs font-bold text-slate-500 dark:text-slate-400">{item.posisi || '-'}</p>
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">
                          {formatDate(item.tgl_mulai)} - {formatDate(item.tgl_berakhir)}
                        </td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.nama_dosen || '-'}</td>
                        <td className="px-5 py-4 font-bold text-slate-600 dark:text-slate-300">{item.nama_dosen_penguji || '-'}</td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              getDokumenStatus(item) === 'Lengkap'
                                ? 'app-badge app-badge-green'
                                : getDokumenStatus(item) === 'Belum Lengkap'
                                ? 'app-badge app-badge-yellow'
                                : 'app-badge app-badge-blue'
                            }
                          >
                            {getDokumenStatus(item)}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-black text-slate-700 dark:text-slate-200">{item.nilai_dari_dosen || '-'}</td>
                        <td className="px-5 py-4">
                          <span className={getStatusBadgeClass(item.status)}>{getStatusLabel(item.status)}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
  );
}