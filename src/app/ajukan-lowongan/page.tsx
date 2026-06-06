"use client";

import { useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import { createPengajuanLowongan } from '@/lib/pengajuan-lowongan-client';

type FormState = {
  nama_mitra: string;
  alamat_mitra: string;
  website_mitra: string;

  nama_pic: string;
  kontak_pic: string;
  email_pic: string;

  posisi: string;
  deskripsi: string;
  persyaratan: string;
  lokasi: string;
  sistem_kerja: 'Onsite' | 'Hybrid' | 'Remote';
  tipe_konversi: 'Konversi 20 SKS' | 'Tidak Konversi' | 'Konversi 2 SKS';
  kuota: number;
  link_pendaftaran: string;
};

const initialForm: FormState = {
  nama_mitra: '',
  alamat_mitra: '',
  website_mitra: '',

  nama_pic: '',
  kontak_pic: '',
  email_pic: '',

  posisi: '',
  deskripsi: '',
  persyaratan: '',
  lokasi: '',
  sistem_kerja: 'Onsite',
  tipe_konversi: 'Konversi 20 SKS',
  kuota: 1,
  link_pendaftaran: '',
};

export default function AjukanLowonganPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    field: keyof FormState,
    value: string | number
  ) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');

    if (
      !form.nama_mitra.trim() ||
      !form.nama_pic.trim() ||
      !form.kontak_pic.trim() ||
      !form.posisi.trim() ||
      !form.deskripsi.trim()
    ) {
      setErrorMsg(
        'Nama mitra, nama PIC, kontak PIC, posisi, dan deskripsi wajib diisi.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createPengajuanLowongan({
        nama_mitra: form.nama_mitra.trim(),
        alamat_mitra: form.alamat_mitra.trim() || null,
        website_mitra: form.website_mitra.trim() || null,

        nama_pic: form.nama_pic.trim(),
        kontak_pic: form.kontak_pic.trim(),
        email_pic: form.email_pic.trim() || null,

        posisi: form.posisi.trim(),
        deskripsi: form.deskripsi.trim(),
        persyaratan: form.persyaratan.trim() || null,
        lokasi: form.lokasi.trim() || null,
        sistem_kerja: form.sistem_kerja,
        tipe_konversi: form.tipe_konversi,
        kuota: Number(form.kuota),
        link_pendaftaran: form.link_pendaftaran.trim() || null,
      });

      setMessage(
        result.message ||
          'Pengajuan lowongan berhasil dikirim. Tim akan memverifikasi data lowongan terlebih dahulu.'
      );

      setForm(initialForm);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Gagal mengirim pengajuan lowongan.';

      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
  <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">

      <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
        <div className="app-container">
          <div className="mb-8">
            <Link
              href="/"
              className="text-sm font-black text-[#1e3a8a] dark:text-blue-300"
            >
              ← Kembali ke Landing Page
            </Link>

            <p className="mt-6 text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
              Pengajuan Lowongan Mitra
            </p>

            <h1 className="mt-3 text-3xl font-black text-slate-950 dark:text-white md:text-5xl">
              Ajukan Lowongan Magang
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Form ini digunakan oleh mitra/perusahaan/instansi untuk
              mengajukan lowongan magang agar dapat ditampilkan pada website SI
              Magang. Lowongan akan diverifikasi terlebih dahulu oleh Super
              Admin sebelum dipublikasikan.
            </p>
          </div>

          {message && <Alert variant="success">{message}</Alert>}
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <form onSubmit={handleSubmit} className="app-card p-6 md:p-8">
            <section className="mb-8">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Data Mitra
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Isi identitas perusahaan atau instansi pengaju lowongan.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="app-label">Nama Mitra</label>
                  <input
                    type="text"
                    required
                    value={form.nama_mitra}
                    onChange={(e) =>
                      handleChange('nama_mitra', e.target.value)
                    }
                    className="app-input"
                    placeholder="Contoh: PT Teknologi Indonesia"
                  />
                </div>

                <div>
                  <label className="app-label">Website Mitra</label>
                  <input
                    type="url"
                    value={form.website_mitra}
                    onChange={(e) =>
                      handleChange('website_mitra', e.target.value)
                    }
                    className="app-input"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="app-label">Alamat Mitra</label>
                  <textarea
                    value={form.alamat_mitra}
                    onChange={(e) =>
                      handleChange('alamat_mitra', e.target.value)
                    }
                    className="app-input min-h-28"
                    placeholder="Alamat kantor/perusahaan/instansi"
                  />
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Narahubung / PIC
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Data ini digunakan untuk proses konfirmasi lowongan.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                <div>
                  <label className="app-label">Nama PIC</label>
                  <input
                    type="text"
                    required
                    value={form.nama_pic}
                    onChange={(e) => handleChange('nama_pic', e.target.value)}
                    className="app-input"
                    placeholder="Nama narahubung"
                  />
                </div>

                <div>
                  <label className="app-label">Nomor WhatsApp PIC</label>
                  <input
                    type="text"
                    required
                    value={form.kontak_pic}
                    onChange={(e) =>
                      handleChange(
                        'kontak_pic',
                        e.target.value.replace(/[^0-9]/g, '')
                      )
                    }
                    className="app-input"
                    placeholder="628xxxxxxxxxx"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Gunakan format 62. Contoh: 6285456123.
                  </p>
                </div>

                <div>
                  <label className="app-label">Email PIC</label>
                  <input
                    type="email"
                    value={form.email_pic}
                    onChange={(e) => handleChange('email_pic', e.target.value)}
                    className="app-input"
                    placeholder="email@perusahaan.com"
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-950 dark:text-white">
                Detail Lowongan
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Isi informasi lowongan yang ingin diajukan.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="app-label">Posisi Lowongan</label>
                  <input
                    type="text"
                    required
                    value={form.posisi}
                    onChange={(e) => handleChange('posisi', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Frontend Developer Intern"
                  />
                </div>

                <div>
                  <label className="app-label">Lokasi</label>
                  <input
                    type="text"
                    value={form.lokasi}
                    onChange={(e) => handleChange('lokasi', e.target.value)}
                    className="app-input"
                    placeholder="Contoh: Karawang / Remote"
                  />
                </div>

                <div>
                  <label className="app-label">Sistem Kerja</label>
                  <select
                    value={form.sistem_kerja}
                    onChange={(e) =>
                      handleChange(
                        'sistem_kerja',
                        e.target.value as FormState['sistem_kerja']
                      )
                    }
                    className="app-input"
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Tipe Konversi</label>
                  <select
                    value={form.tipe_konversi}
                    onChange={(e) =>
                      handleChange(
                        'tipe_konversi',
                        e.target.value as FormState['tipe_konversi']
                      )
                    }
                    className="app-input"
                  >
                    <option value="Konversi 20 SKS">Konversi 20 SKS</option>
                    <option value="Tidak Konversi">Tidak Konversi</option>
                    <option value="Konversi 2 SKS">
                      Konversi 2 SKS khusus Sistem Informasi
                    </option>
                  </select>
                </div>

                <div>
                  <label className="app-label">Kuota</label>
                  <input
                    type="number"
                    min={1}
                    value={form.kuota}
                    onChange={(e) =>
                      handleChange('kuota', Number(e.target.value))
                    }
                    className="app-input"
                  />
                </div>

                <div>
                  <label className="app-label">Link Pendaftaran</label>
                  <input
                    type="url"
                    value={form.link_pendaftaran}
                    onChange={(e) =>
                      handleChange('link_pendaftaran', e.target.value)
                    }
                    className="app-input"
                    placeholder="https://..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="app-label">Deskripsi Lowongan</label>
                  <textarea
                    required
                    value={form.deskripsi}
                    onChange={(e) => handleChange('deskripsi', e.target.value)}
                    className="app-input min-h-36"
                    placeholder="Jelaskan tugas, tanggung jawab, dan kebutuhan posisi..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="app-label">Persyaratan</label>
                  <textarea
                    value={form.persyaratan}
                    onChange={(e) =>
                      handleChange('persyaratan', e.target.value)
                    }
                    className="app-input min-h-32"
                    placeholder="Contoh: Menguasai HTML, CSS, JavaScript, mampu bekerja dalam tim..."
                  />
                </div>
              </div>
            </section>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                disabled={isSubmitting}
                className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Lowongan'}
              </button>

              <Link href="/" className="app-btn-secondary flex-1">
                Batal
              </Link>
            </div>
          </form>
        </div>
      </main> 
      </main>
  );
  }