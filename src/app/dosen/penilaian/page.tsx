"use client";

import { useEffect, useState } from 'react';
import { getDashboardPathByRole } from '@/lib/role-redirect';
import Link from 'next/link';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Alert from '@/components/ui/Alert';
import { CurrentUser, getCurrentUserClient } from '@/lib/client-auth';
import {
  Pengajuan,
  getPengajuanList,
  beriNilaiPengajuan,
} from '@/lib/pengajuan-client';

type NilaiForm = {
  id_pengajuan: number;
  nama_mahasiswa: string;
  perusahaan: string;
  nilai_kedisiplinan: string;
  nilai_materi: string;
  nilai_koding: string;
  nilai_laporan: string;
};

const initialNilaiForm: NilaiForm = {
  id_pengajuan: 0,
  nama_mahasiswa: '',
  perusahaan: '',
  nilai_kedisiplinan: '',
  nilai_materi: '',
  nilai_koding: '',
  nilai_laporan: '',
};

function getStatusBadgeClass(status?: string) {
  if (status === 'Selesai') {
    return 'app-badge app-badge-green';
  }

  if (status === 'Aktif') {
    return 'app-badge app-badge-blue';
  }

  return 'app-badge app-badge-yellow';
}

function calculateAverage(form: NilaiForm) {
  const nilai = [
    Number(form.nilai_kedisiplinan),
    Number(form.nilai_materi),
    Number(form.nilai_koding),
    Number(form.nilai_laporan),
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

export default function DosenPenilaianPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [pengajuans, setPengajuans] = useState<Pengajuan[]>([]);
  const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(
    null
  );

  const [form, setForm] = useState<NilaiForm>(initialNilaiForm);

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
        getPengajuanList(1, 50),
      ]);

      if (currentUser.role !== 'Dosen') {
        window.location.href = getDashboardPathByRole(currentUser.role);
        return;
      }

      setUser(currentUser);
      setPengajuans(pengajuanData.items);
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
    (item) => item.status_dosen === 'Disetujui' && item.status === 'Aktif'
  );

  const mahasiswaSelesai = pengajuans.filter(
    (item) => item.status === 'Selesai'
  );

  const mahasiswaSudahDinilai = pengajuans.filter(
    (item) => item.nilai_dari_dosen
  );

  const openNilaiModal = (item: Pengajuan) => {
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

    setForm({
      ...form,
      [field]: onlyNumber,
    });
  };

  const handleSubmitNilai = async (e: React.FormEvent) => {
    e.preventDefault();

    const average = calculateAverage(form);
    const grade = getGrade(average);

    if (
      !form.nilai_kedisiplinan ||
      !form.nilai_materi ||
      !form.nilai_koding ||
      !form.nilai_laporan
    ) {
      setErrorMsg('Semua komponen nilai wajib diisi.');
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
          description="Berikan nilai akhir berdasarkan kedisiplinan, pemahaman materi, kemampuan teknis, dan laporan akhir mahasiswa."
          action={
            <Link href="/dosen/dashboard" className="app-btn-secondary">
              Kembali ke Dashboard
            </Link>
          }
        />

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <StatCard
            title="Siap Dinilai"
            value={mahasiswaAktif.length}
            description="Mahasiswa aktif yang dapat diberikan nilai."
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
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-950">
                Daftar Mahasiswa Aktif
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Pilih mahasiswa untuk mengisi nilai akhir magang.
              </p>
            </div>
          </div>

          {mahasiswaAktif.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Tidak ada mahasiswa yang perlu dinilai.
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Mahasiswa aktif yang belum selesai dinilai akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-black">Mahasiswa</th>
                    <th className="px-5 py-4 font-black">Perusahaan</th>
                    <th className="px-5 py-4 font-black">Posisi</th>
                    <th className="px-5 py-4 font-black">Status</th>
                    <th className="px-5 py-4 font-black">Nilai</th>
                    <th className="px-5 py-4 font-black">Aksi</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {mahasiswaAktif.map((item) => (
                    <tr key={item.id} className="align-top">
                      <td className="px-5 py-4 font-black text-slate-950">
                        {item.nama_mahasiswa}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.perusahaan}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {item.posisi}
                      </td>

                      <td className="px-5 py-4">
                        <span className={getStatusBadgeClass(item.status)}>
                          {item.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-black text-slate-950">
                        {item.nilai_dari_dosen || '-'}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => openNilaiModal(item)}
                          className="app-btn-primary px-4 py-2 text-sm"
                        >
                          Input Nilai
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="app-card mt-6 p-6">
          <div className="mb-5">
            <h2 className="text-xl font-black text-slate-950">
              Riwayat Penilaian
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Mahasiswa yang sudah diberikan nilai akhir.
            </p>
          </div>

          {mahasiswaSudahDinilai.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="font-bold text-slate-700">
                Belum ada riwayat penilaian.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {mahasiswaSudahDinilai.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-black text-slate-950">
                        {item.nama_mahasiswa}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.perusahaan} - {item.posisi}
                      </p>
                    </div>

                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a]">
                      {item.nilai_dari_dosen}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-500">Kedisiplinan</p>
                      <p className="mt-1 font-black text-slate-900">
                        {item.nilai_kedisiplinan || '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-500">Materi</p>
                      <p className="mt-1 font-black text-slate-900">
                        {item.nilai_materi || '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-500">Teknis</p>
                      <p className="mt-1 font-black text-slate-900">
                        {item.nilai_koding || '-'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="font-bold text-slate-500">Laporan</p>
                      <p className="mt-1 font-black text-slate-900">
                        {item.nilai_laporan || '-'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedPengajuan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={closeNilaiModal}
          />

          <div className="animate-scale-in relative z-10 w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-6">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                Form Penilaian
              </p>
              <h3 className="mt-2 text-2xl font-black text-slate-950">
                {selectedPengajuan.nama_mahasiswa}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedPengajuan.perusahaan} - {selectedPengajuan.posisi}
              </p>
            </div>

            <form onSubmit={handleSubmitNilai} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="app-label">Nilai Kedisiplinan</label>
                  <input
                    type="text"
                    required
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
                    required
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
                    required
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
                    required
                    inputMode="numeric"
                    value={form.nilai_laporan}
                    onChange={(e) =>
                      handleChange('nilai_laporan', e.target.value)
                    }
                    className="app-input"
                    placeholder="0 - 100"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-sm font-bold text-[#1e3a8a]">
                  Preview Nilai Akhir
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-3xl font-black text-[#1e3a8a]">
                      {grade}
                    </p>
                    <p className="text-sm text-slate-500">
                      Rata-rata: {average.toFixed(1)}
                    </p>
                  </div>

                  <p className="max-w-sm text-right text-sm text-slate-500">
                    Nilai huruf otomatis dihitung dari rata-rata empat komponen.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
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