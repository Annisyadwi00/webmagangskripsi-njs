"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import { apiClient } from '@/lib/api-client';
import { getCurrentUserClient } from '@/lib/client-auth';

type FormState = {
  nama_mitra: string;
  website: string;
  alamat: string;

  nama_pic: string;
  kontak_wa: string;
  email_pic: string;

  lokasi: string;
  sistem_kerja: 'Onsite' | 'Hybrid' | 'Remote';
  kuota: string;
  link_pendaftaran: string;

  deskripsi_lowongan: string;
  persyaratan: string;
};

const DRAFT_KEY = 'draft_ajukan_mitra';

const initialForm: FormState = {
  nama_mitra: '',
  website: '',
  alamat: '',

  nama_pic: '',
  kontak_wa: '',
  email_pic: '',

  lokasi: '',
  sistem_kerja: 'Onsite',
  kuota: '1',
  link_pendaftaran: '',

  deskripsi_lowongan: '',
  persyaratan: '',
};

export default function AjukanMitraPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);

  const [aktaPendirian, setAktaPendirian] = useState<File | null>(null);
  const [aktaDireksi, setAktaDireksi] = useState<File | null>(null);
  const [ktpPenandatangan, setKtpPenandatangan] = useState<File | null>(null);
  const [npwpPerusahaan, setNpwpPerusahaan] = useState<File | null>(null);
  const [izinUsaha, setIzinUsaha] = useState<File | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [message, setMessage] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);

    if (savedDraft) {
      try {
        setForm(JSON.parse(savedDraft));
        setShowForm(true);
      } catch {
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
  }, [form]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const validatePdf = (file: File | null, label: string) => {
    if (!file) return `${label} wajib diunggah.`;

    if (file.type !== 'application/pdf') {
      return `${label} harus berupa file PDF.`;
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  setErrorMsg('');
  setMessage('');

  if (
    !form.nama_mitra.trim() ||
    !form.alamat.trim() ||
    !form.nama_pic.trim() ||
    !form.kontak_wa.trim() ||
    !form.email_pic.trim() ||
    !form.lokasi.trim() ||
    !form.kuota.trim() ||
    !form.deskripsi_lowongan.trim() ||
    !form.persyaratan.trim()
  ) {
    setErrorMsg('Data mitra, narahubung, dan detail lowongan wajib diisi.');
    return;
  }

  if (!/^62\d{8,15}$/.test(form.kontak_wa)) {
    setErrorMsg(
      'Nomor WhatsApp narahubung harus diawali 62. Contoh: 6285456123.'
    );
    return;
  }

  const fileErrors = [
    validatePdf(aktaPendirian, 'Akta pendirian'),
    validatePdf(aktaDireksi, 'Akta susunan direksi'),
    validatePdf(ktpPenandatangan, 'KTP penandatangan'),
    validatePdf(npwpPerusahaan, 'NPWP perusahaan'),
    validatePdf(izinUsaha, 'Dokumen izin usaha terkait'),
  ].filter(Boolean);

  if (fileErrors.length > 0) {
    setErrorMsg(fileErrors[0]);
    return;
  }

  setIsSubmitting(true);

  try {
    const currentUser = await getCurrentUserClient();

    const result = await apiClient('/api/pengajuan-mitra', {
      method: 'POST',
      body: {
        nama_mitra: form.nama_mitra,
        alamat_kantor_mitra: form.alamat,
        url_mitra: form.website || null,
        nama_narahubung_mitra: form.nama_pic,
        kontak_narahubung_mitra: form.kontak_wa,

        nama_mahasiswa_pengusul: currentUser.name,
        npm_mahasiswa_pengusul: currentUser.nim_nidn || '-',
        program_studi_mahasiswa: currentUser.prodi || '-',
        angkatan_mahasiswa: currentUser.angkatan || '-',
        kontak_mahasiswa: currentUser.phone || form.kontak_wa,
        kelas: currentUser.kelas || '-',

        lokasi: form.lokasi,
        sistem_kerja: form.sistem_kerja,
        kuota: form.kuota,
        link_pendaftaran: form.link_pendaftaran,
        email_pic: form.email_pic,
        deskripsi_lowongan: form.deskripsi_lowongan,
        
        link_akta_pendirian: null,
link_akta_direksi: null,
link_ktp_penandatangan: null,
link_npwp: null,
link_izin_usaha: null,
      },
    });

    setMessage(result.message || 'Pengajuan mitra berhasil dikirim.');

    setForm(initialForm);
    setAktaPendirian(null);
    setAktaDireksi(null);
    setKtpPenandatangan(null);
    setNpwpPerusahaan(null);
    setIzinUsaha(null);
    localStorage.removeItem(DRAFT_KEY);
  } catch (error) {
    const msg =
      error instanceof Error
        ? error.message
        : 'Gagal mengirim pengajuan mitra.';

    setErrorMsg(msg);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="app-container">
        <section className="mb-8 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
            Ajukan Mitra
          </p>

          <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
            Ajukan perusahaan atau instansi untuk menjadi mitra magang.
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Sebelum mengajukan mitra baru, cek terlebih dahulu apakah perusahaan
            sudah terdaftar sebagai mitra. Jika belum, isi form pengajuan mitra
            berikut.
          </p>
        </section>

        {!showForm && (
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300">
                1
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                Perusahaan sudah bermitra?
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Cek daftar mitra terlebih dahulu. Jika perusahaan sudah
                terdaftar, mahasiswa atau mitra tidak perlu mengajukan ulang.
              </p>

              <Link href="/mitra" className="app-btn-secondary mt-6 w-full">
                Cek Daftar Mitra
              </Link>
            </div>

            <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3a8a] text-xl font-black text-white">
                2
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                Ajukan mitra baru
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Jika perusahaan belum terdaftar, isi form pengajuan mitra dan
                lengkapi dokumen pendukung dalam format PDF.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="app-btn-primary mt-6 w-full"
              >
                Ajukan Mitra
              </button>
            </div>
          </section>
        )}

        {showForm && (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a] dark:text-blue-300">
                  Form Pengajuan
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-950 dark:text-white">
                  Data Mitra dan Lowongan
                </h2>

                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Draft form tersimpan otomatis di browser. Jika halaman
                  ter-refresh, isian tidak langsung hilang.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="app-btn-secondary"
              >
                Kembali
              </button>
            </div>

            {message && <Alert variant="success">{message}</Alert>}
            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-8">
              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Data Perusahaan
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Mitra/Perusahaan</label>
                    <input
                      type="text"
                      value={form.nama_mitra}
                      onChange={(e) =>
                        handleChange('nama_mitra', e.target.value)
                      }
                      className="app-input"
                      placeholder="Contoh: PT Teknologi Indonesia"
                    />
                  </div>

                  <div>
                    <label className="app-label">Website Perusahaan</label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                      className="app-input"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">Alamat Perusahaan</label>
                    <textarea
                      value={form.alamat}
                      onChange={(e) => handleChange('alamat', e.target.value)}
                      className="app-input min-h-28"
                      placeholder="Alamat lengkap perusahaan"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Narahubung
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label className="app-label">Nama Narahubung</label>
                    <input
                      type="text"
                      value={form.nama_pic}
                      onChange={(e) => handleChange('nama_pic', e.target.value)}
                      className="app-input"
                      placeholder="Nama PIC"
                    />
                  </div>

                  <div>
                    <label className="app-label">WhatsApp</label>
                    <input
                      type="text"
                      value={form.kontak_wa}
                      onChange={(e) =>
                        handleChange(
                          'kontak_wa',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      className="app-input"
                      placeholder="628xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="app-label">Email</label>
                    <input
                      type="email"
                      value={form.email_pic}
                      onChange={(e) =>
                        handleChange('email_pic', e.target.value)
                      }
                      className="app-input"
                      placeholder="email@perusahaan.com"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Detail Lowongan
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Lokasi</label>
                    <input
                      type="text"
                      value={form.lokasi}
                      onChange={(e) => handleChange('lokasi', e.target.value)}
                      className="app-input"
                      placeholder="Karawang / Jakarta / Remote"
                    />
                  </div>

                  <div>
                    <label className="app-label">Sistem Kerja</label>
                    <select
                      value={form.sistem_kerja}
                      onChange={(e) =>
                        handleChange('sistem_kerja', e.target.value)
                      }
                      className="app-input"
                    >
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>

                  <div>
                    <label className="app-label">Kuota</label>
                    <input
                      type="number"
                      min="1"
                      value={form.kuota}
                      onChange={(e) => handleChange('kuota', e.target.value)}
                      className="app-input"
                      placeholder="1"
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
                      value={form.deskripsi_lowongan}
                      onChange={(e) =>
                        handleChange('deskripsi_lowongan', e.target.value)
                      }
                      className="app-input min-h-32"
                      placeholder="Jelaskan posisi, tugas, dan kebutuhan lowongan"
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
                      placeholder="Tuliskan syarat mahasiswa yang dibutuhkan"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Dokumen Pendukung
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Semua dokumen wajib diunggah dalam format PDF.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FileInput
                    label="Akta Pendirian"
                    file={aktaPendirian}
                    onChange={setAktaPendirian}
                  />

                  <FileInput
                    label="Akta Susunan Direksi"
                    file={aktaDireksi}
                    onChange={setAktaDireksi}
                  />

                  <FileInput
                    label="KTP Penandatangan"
                    file={ktpPenandatangan}
                    onChange={setKtpPenandatangan}
                  />

                  <FileInput
                    label="NPWP Perusahaan"
                    file={npwpPerusahaan}
                    onChange={setNpwpPerusahaan}
                  />

                  <FileInput
                    label="Dokumen Izin Usaha Terkait"
                    file={izinUsaha}
                    onChange={setIzinUsaha}
                  />
                </div>
              </section>

              <button
  type="submit"
  disabled={isSubmitting}
  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
>
  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Mitra'}
</button>

                <button
                  type="button"
                  onClick={() => {
                    setForm(initialForm);
                    setAktaPendirian(null);
                    setAktaDireksi(null);
                    setKtpPenandatangan(null);
                    setNpwpPerusahaan(null);
                    setIzinUsaha(null);
                    localStorage.removeItem(DRAFT_KEY);
                  }}
                  className="app-btn-secondary flex-1"
                >
                  Reset Form
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

function FileInput({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="app-label">{label}</label>

      <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-[#1e3a8a] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-blue-300 dark:hover:bg-blue-400/10">
        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />

        <span className="font-black text-slate-700 dark:text-slate-200">
          {file ? file.name : 'Upload PDF'}
        </span>

        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {file ? 'Klik untuk mengganti file' : 'Format file: PDF'}
        </span>
      </label>
    </div>
  );
}