"use client";

import { useEffect, useState } from 'react';
import {
  Pengajuan,
  createPengajuan,
  getPengajuanList,
  batalPengajuan,
  uploadLaporanAkhir,
} from '@/lib/pengajuan-client';

export default function PengajuanMahasiswaPage() {
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    perusahaan: '',
    posisi: '',
    link_loa: '',
    tgl_mulai: '',
    tgl_berakhir: '',
  });

  const [linkLaporanAkhir, setLinkLaporanAkhir] = useState('');

  const fetchPengajuan = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');

      const result = await getPengajuanList(1, 10);
      setPengajuan(result.items[0] || null);
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengambil data pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPengajuan();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitPengajuan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await createPengajuan({
        perusahaan: form.perusahaan,
        posisi: form.posisi,
        link_loa: form.link_loa,
        tgl_mulai: form.tgl_mulai,
        tgl_berakhir: form.tgl_berakhir,
      });

      setMessage(result.message || 'Pengajuan berhasil dikirim.');
      setForm({
        perusahaan: '',
        posisi: '',
        link_loa: '',
        tgl_mulai: '',
        tgl_berakhir: '',
      });

      await fetchPengajuan();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatalPengajuan = async () => {
    const confirmDelete = confirm('Yakin ingin membatalkan pengajuan?');

    if (!confirmDelete) return;

    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await batalPengajuan();
      setMessage(result.message || 'Pengajuan berhasil dibatalkan.');
      await fetchPengajuan();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal membatalkan pengajuan.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadLaporan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setErrorMsg('');

    try {
      const result = await uploadLaporanAkhir(linkLaporanAkhir);
      setMessage(result.message || 'Laporan akhir berhasil diunggah.');
      setLinkLaporanAkhir('');
      await fetchPengajuan();
    } catch (error) {
      const errMessage =
        error instanceof Error
          ? error.message
          : 'Gagal mengunggah laporan akhir.';

      setErrorMsg(errMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <p className="text-gray-600">Memuat data pengajuan...</p>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">
          Pengajuan Magang
        </h1>
        <p className="text-gray-500 mt-1">
          Ajukan LOA magang dan pantau status pengajuan Anda.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-green-700 font-medium">
          {message}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
          {errorMsg}
        </div>
      )}

      {!pengajuan ? (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Form Pengajuan LOA
          </h2>

          <form onSubmit={handleSubmitPengajuan} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nama Perusahaan
              </label>
              <input
                type="text"
                name="perusahaan"
                required
                value={form.perusahaan}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="Contoh: PT Teknologi Indonesia"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Posisi Magang
              </label>
              <input
                type="text"
                name="posisi"
                required
                value={form.posisi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="Contoh: Frontend Developer Intern"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Link LOA
              </label>
              <input
                type="url"
                name="link_loa"
                required
                value={form.link_loa}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                placeholder="https://drive.google.com/..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tgl_mulai"
                  required
                  value={form.tgl_mulai}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  name="tgl_berakhir"
                  required
                  value={form.tgl_berakhir}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900 disabled:opacity-60"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </section>
      ) : (
        <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Status Pengajuan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
            <div>
              <p className="text-gray-500">Perusahaan</p>
              <p className="font-bold text-gray-900">{pengajuan.perusahaan}</p>
            </div>

            <div>
              <p className="text-gray-500">Posisi</p>
              <p className="font-bold text-gray-900">{pengajuan.posisi}</p>
            </div>

            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-bold text-[#1e3a8a]">{pengajuan.status}</p>
            </div>

            <div>
              <p className="text-gray-500">Dosen Pembimbing</p>
              <p className="font-bold text-gray-900">
                {pengajuan.nama_dosen || '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Tanggal Mulai</p>
              <p className="font-bold text-gray-900">
                {pengajuan.tgl_mulai || '-'}
              </p>
            </div>

            <div>
              <p className="text-gray-500">Tanggal Berakhir</p>
              <p className="font-bold text-gray-900">
                {pengajuan.tgl_berakhir || '-'}
              </p>
            </div>
          </div>

          {pengajuan.alasan_penolakan && (
            <div className="mt-5 rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm font-bold text-red-700">
                Alasan Penolakan
              </p>
              <p className="text-sm text-red-600 mt-1">
                {pengajuan.alasan_penolakan}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={pengajuan.link_loa || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-blue-50 text-blue-700 font-bold text-center hover:bg-blue-100"
            >
              Lihat LOA
            </a>

            {(pengajuan.status === 'Menunggu_Verifikasi' ||
              pengajuan.status === 'Ditolak') && (
              <button
                type="button"
                onClick={handleBatalPengajuan}
                disabled={isSubmitting}
                className="px-5 py-3 rounded-xl bg-red-50 text-red-700 font-bold hover:bg-red-100 disabled:opacity-60"
              >
                Batalkan Pengajuan
              </button>
            )}
          </div>

          {pengajuan.status === 'Aktif' && (
            <form onSubmit={handleUploadLaporan} className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Upload Laporan Akhir
              </h3>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="url"
                  required
                  value={linkLaporanAkhir}
                  onChange={(e) => setLinkLaporanAkhir(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                  placeholder="https://drive.google.com/..."
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-3 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-blue-900 disabled:opacity-60"
                >
                  Simpan Laporan
                </button>
              </div>
            </form>
          )}
        </section>
      )}
    </main>
  );
}