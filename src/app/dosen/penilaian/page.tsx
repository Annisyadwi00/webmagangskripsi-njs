"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  beriNilaiPengajuan,
  getPengajuanList,
} from '@/lib/pengajuan-client';

type NilaiForm = {
  id_pengajuan: number;
  nama_mahasiswa: string;
  perusahaan: string;
  nilai_kedisiplinan: string;
  nilai_materi: string;
  nilai_koding: string;
  nilai_laporan: string;
  nilai_mitra: string;
};

const initialNilaiForm: NilaiForm = {
  id_pengajuan: 0,
  nama_mahasiswa: '',
  perusahaan: '',
  nilai_kedisiplinan: '',
  nilai_materi: '',
  nilai_koding: '',
  nilai_laporan: '',
  nilai_mitra: '',
};

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';

  return value || '-';
}

function getLaporanLabel(jenisMagang?: string | null) {
  if (jenisMagang === 'Konversi 2 SKS') return 'Laporan Magang';
  if (jenisMagang === 'Tidak Konversi') return 'Tidak Wajib';

  return 'Laporan Akhir';
}

function wajibLaporan(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS' || jenisMagang === 'Konversi 2 SKS';
}

function wajibOutput(jenisMagang?: string | null) {
  return jenisMagang === 'Konversi 20 SKS';
}

function sudahLengkapDokumen(item: Pengajuan) {
  if (!wajibLaporan(item.jenis_magang)) return true;

  if (!item.link_laporan_akhir) return false;

  if (wajibOutput(item.jenis_magang) && !item.link_output_magang) {
    return false;
  }

  return true;
}

function getStatusBadgeClass(status?: string | null) {
  if (status === 'Selesai') return 'app-badge app-badge-green';
  if (status === 'Aktif') return 'app-badge app-badge-blue';
  if (status === 'Ditolak') return 'app-badge app-badge-red';

  return 'app-badge app-badge-yellow';
}

function getStatusLabel(status?: string | null) {
  if (status === 'Menunggu_Verifikasi') return 'Menunggu Pemeriksaan';
  if (status === 'Aktif') return 'Aktif';
  if (status === 'Selesai') return 'Selesai';
  if (status === 'Ditolak') return 'Ditolak';

  return status || '-';
}

function calculateAverage(form: NilaiForm) {
  const nilai = [
    Number(form.nilai_kedisiplinan),
    Number(form.nilai_materi),
    Number(form.nilai_koding),
    Number(form.nilai_laporan),
    Number(form.nilai_mitra),
  ];

  if (nilai.some((item) => Number.isNaN(item))) {
    return 0;
  }

  return nilai.reduce((total, item) => total + item, 0) / nilai.length;
}

function getGrade(average: number) {
  if (average >= 85) return 'A';
  if (average >= 75) return 'B';
  if (average >= 65) return 'C';
  if (average >= 50) return 'D';

  return 'E';
}

function formatDate(date?: string | null) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function DosenPenilaianPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(
    null
  );

  const [form, setForm] = useState<NilaiForm>(initialNilaiForm);
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const [currentUser, pengajuanData] = await Promise.all([
        getCurrentUserClient(),
        getPengajuanList(1, 100),
      ]);

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setPengajuans(pengajuanData?.items || []);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data penilaian.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const mahasiswaAktif = pengajuans.filter(
    (item) => item.status === 'Aktif' || item.status === 'Selesai'
  );

  const mahasiswaSiapDinilai = mahasiswaAktif.filter((item) =>
    sudahLengkapDokumen(item)
  );

  const mahasiswaDokumenBelumLengkap = mahasiswaAktif.filter(
    (item) => !sudahLengkapDokumen(item)
  );

  const mahasiswaSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const mahasiswaSudahDinilai = pengajuans.filter(
    (item) => item.nilai_dari_dosen
  );

  const filteredMahasiswaSiapDinilai = useMemo(() => {
    const keyword = search.toLowerCase();

    return mahasiswaSiapDinilai.filter((item) => {
      const nama = item.nama_mahasiswa || '';
      const npm = item.npm || '';
      const perusahaan = item.perusahaan || '';
      const posisi = item.posisi || '';
      const prodi = item.program_studi || '';
      const jenisMagang = getJenisMagangLabel(item.jenis_magang);

      return (
        nama.toLowerCase().includes(keyword) ||
        npm.toLowerCase().includes(keyword) ||
        perusahaan.toLowerCase().includes(keyword) ||
        posisi.toLowerCase().includes(keyword) ||
        prodi.toLowerCase().includes(keyword) ||
        jenisMagang.toLowerCase().includes(keyword)
      );
    });
  }, [mahasiswaSiapDinilai, search]);

  const openNilaiModal = (item: Pengajuan) => {
    if (!sudahLengkapDokumen(item)) {
      setErrorMsg(
        item.jenis_magang === 'Konversi 20 SKS'
          ? 'Mahasiswa belum melengkapi laporan akhir dan output magang, sehingga belum dapat dinilai.'
          : 'Mahasiswa belum mengunggah laporan magang, sehingga belum dapat dinilai.'
      );
      return;
    }

    setSelectedPengajuan(item);
    setMessage('');
    setErrorMsg('');

    setForm({
      id_pengajuan: item.id,
      nama_mahasiswa: item.nama_mahasiswa,
      perusahaan: item.perusahaan,
      nilai_kedisiplinan: item.nilai_kedisiplinan
        ? String(item.nilai_kedisiplinan)
        : '',
      nilai_materi: item.nilai_materi ? String(item.nilai_materi) : '',
      nilai_koding: item.nilai_koding ? String(item.nilai_koding) : '',
      nilai_laporan: item.nilai_laporan ? String(item.nilai_laporan) : '',
      nilai_mitra: item.nilai_mitra ? String(item.nilai_mitra) : '',
    });
  };

  const closeNilaiModal = () => {
    setSelectedPengajuan(null);
    setForm(initialNilaiForm);
  };

  const handleChange = (field: keyof NilaiForm, value: string) => {
    const onlyNumber = value.replace(/[^0-9]/g, '');
    const numberValue = Number(onlyNumber);

    if (onlyNumber && numberValue > 100) {
      return;
    }

    setForm((prev) => ({
      ...prev,
      [field]: onlyNumber,
    }));
  };

  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    const average = calculateAverage(form);
    const grade = getGrade(average);

    if (
      !form.nilai_kedisiplinan ||
      !form.nilai_materi ||
      !form.nilai_koding ||
      !form.nilai_laporan ||
      !form.nilai_mitra
    ) {
      setErrorMsg('Semua komponen nilai, termasuk nilai mitra, wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await beriNilaiPengajuan({
        id_pengajuan: form.id_pengajuan,
        nilai_dari_dosen: grade,
        nilai_kedisiplinan: Number(form.nilai_kedisiplinan),
        nilai_materi: Number(form.nilai_materi),
        nilai_koding: Number(form.nilai_koding),
        nilai_laporan: Number(form.nilai_laporan),
        nilai_mitra: Number(form.nilai_mitra),
      });

      setMessage(result.message || 'Nilai akhir berhasil disimpan.');
      closeNilaiModal();
      await fetchData();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal menyimpan nilai akhir.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const average = calculateAverage(form);
  const grade = getGrade(average);

  if (isLoading) {
    return (

        <main className="min-h-screen py-8">
          <div className="app-container">
            <div className="app-card p-8">
              <div className="h-4 w-40 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-4 h-8 w-80 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800"
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
    );
  }

  if (errorMsg && !selectedPengajuan) {
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
            eyebrow="Penilaian Akhir"
            title={`Input Nilai Mahasiswa ${user?.name || ''}`}
            description="Berikan nilai akhir berdasarkan kedisiplinan, pemahaman materi, kemampuan teknis, laporan, dan nilai mitra."
            action={
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/dosen/dashboard" className="app-btn-secondary">
                  Kembali ke Dashboard
                </Link>

                <Link href="/dosen/laporan-akhir" className="app-btn-primary">
                  Lihat Laporan
                </Link>
              </div>
            }
          />

          {mahasiswaDokumenBelumLengkap.length > 0 && (
            <Alert variant="warning">
              Ada {mahasiswaDokumenBelumLengkap.length} mahasiswa aktif yang
              dokumen magangnya belum lengkap. Penilaian hanya dapat dilakukan
              setelah dokumen wajib terpenuhi.
            </Alert>
          )}

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              title="Siap Dinilai"
              value={mahasiswaSiapDinilai.length}
              description="Mahasiswa aktif/selesai dengan dokumen lengkap."
              icon="chart"
            />

            <StatCard
              title="Sudah Dinilai"
              value={mahasiswaSudahDinilai.length}
              description="Mahasiswa yang sudah memiliki nilai akhir."
              icon="check"
            />

            <StatCard
              title="Selesai"
              value={mahasiswaSelesai.length}
              description="Mahasiswa dengan status magang selesai."
              icon="document"
            />
          </section>

          <section className="app-card p-6">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950 dark:text-white">
                  Daftar Mahasiswa Siap Dinilai
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Mahasiswa akan muncul jika dokumen wajibnya sudah lengkap.
                  Untuk Tidak Konversi, laporan tidak diwajibkan.
                </p>
              </div>

              <div className="w-full md:w-80">
                <label className="app-label">Cari Mahasiswa</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="app-input"
                  placeholder="Cari nama, NPM, prodi, perusahaan..."
                />
              </div>
            </div>

            {filteredMahasiswaSiapDinilai.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/70">
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  Belum ada mahasiswa yang siap dinilai.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Mahasiswa akan muncul di halaman ini setelah dokumen wajib
                  sesuai jenis magangnya lengkap.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-black">Mahasiswa</th>
                      <th className="px-5 py-4 font-black">Tempat Magang</th>
                      <th className="px-5 py-4 font-black">Jenis</th>
                      <th className="px-5 py-4 font-black">Status</th>
                      <th className="px-5 py-4 font-black">Nilai</th>
                      <th className="px-5 py-4 font-black">Aksi</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMahasiswaSiapDinilai.map((item) => (
                      <tr key={item.id} className="align-top">
                        <td className="px-5 py-4">
                          <p className="font-black text-slate-950 dark:text-white">
                            {item.nama_mahasiswa}
                          </p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {item.npm || '-'} • {item.program_studi || '-'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          <p className="font-bold">{item.perusahaan}</p>
                          <p className="mt-1 text-xs">
                            {item.posisi || 'Peserta Magang'}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                          {getJenisMagangLabel(item.jenis_magang)}
                        </td>

                        <td className="px-5 py-4">
                          <span className={getStatusBadgeClass(item.status)}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-black text-slate-950 dark:text-white">
                          {item.nilai_dari_dosen || '-'}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col gap-2">
                            {item.link_laporan_akhir && (
                              <a
                                href={item.link_laporan_akhir}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app-btn-secondary px-3 py-2 text-xs"
                              >
                                Buka {getLaporanLabel(item.jenis_magang)}
                              </a>
                            )}

                            {item.link_output_magang && (
                              <a
                                href={item.link_output_magang}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app-btn-secondary px-3 py-2 text-xs"
                              >
                                Buka Output
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => openNilaiModal(item)}
                              className="app-btn-primary px-3 py-2 text-xs"
                            >
                              {item.nilai_dari_dosen
                                ? 'Ubah Nilai'
                                : 'Input Nilai'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {mahasiswaDokumenBelumLengkap.length > 0 && (
            <section className="app-card mt-6 p-6">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Dokumen Belum Lengkap
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Mahasiswa di bawah ini belum dapat dinilai karena dokumen wajib
                belum lengkap.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {mahasiswaDokumenBelumLengkap.map((item) => (
                  <article key={item.id} className="app-panel p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-black text-slate-950 dark:text-white">
                          {item.nama_mahasiswa}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {getJenisMagangLabel(item.jenis_magang)} •{' '}
                          {item.perusahaan}
                        </p>
                      </div>

                      <span className="app-badge app-badge-yellow">
                        Belum Lengkap
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {!item.link_laporan_akhir &&
                        wajibLaporan(item.jenis_magang) &&
                        `${getLaporanLabel(
                          item.jenis_magang
                        )} belum diunggah. `}
                      {wajibOutput(item.jenis_magang) &&
                        !item.link_output_magang &&
                        'Output magang belum diunggah.'}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        {selectedPengajuan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
              onClick={closeNilaiModal}
            />

            <div className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Form Penilaian
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">
                  {selectedPengajuan.nama_mahasiswa}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedPengajuan.perusahaan} •{' '}
                  {getJenisMagangLabel(selectedPengajuan.jenis_magang)} •{' '}
                  {formatDate(selectedPengajuan.tgl_mulai)} sampai{' '}
                  {formatDate(selectedPengajuan.tgl_berakhir)}
                </p>
              </div>

              <form onSubmit={handleSubmitNilai} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nilai Kedisiplinan</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nilai_kedisiplinan}
                      onChange={(e) =>
                        handleChange('nilai_kedisiplinan', e.target.value)
                      }
                      className="app-input"
                      placeholder="0 - 100"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nilai Materi</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nilai_materi}
                      onChange={(e) =>
                        handleChange('nilai_materi', e.target.value)
                      }
                      className="app-input"
                      placeholder="0 - 100"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nilai Teknis / Koding</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nilai_koding}
                      onChange={(e) =>
                        handleChange('nilai_koding', e.target.value)
                      }
                      className="app-input"
                      placeholder="0 - 100"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nilai Laporan</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nilai_laporan}
                      onChange={(e) =>
                        handleChange('nilai_laporan', e.target.value)
                      }
                      className="app-input"
                      placeholder="0 - 100"
                    />
                  </div>

                  <div>
                    <label className="app-label">Nilai Mitra</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={form.nilai_mitra}
                      onChange={(e) =>
                        handleChange('nilai_mitra', e.target.value)
                      }
                      className="app-input"
                      placeholder="0 - 100"
                    />
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                      Rata-rata & Grade
                    </p>
                    <p className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                      {average.toFixed(1)} / {grade}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Nilai'}
                  </button>

                  <button
                    type="button"
                    onClick={closeNilaiModal}
                    disabled={isSubmitting}
                    className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

  );
}