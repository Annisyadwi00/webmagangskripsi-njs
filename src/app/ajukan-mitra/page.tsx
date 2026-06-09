"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';
import { apiClient } from '@/lib/api-client';
import { getCurrentUserClient } from '@/lib/client-auth';

type SistemKerja = 'Onsite' | 'Hybrid' | 'Remote';

type FormState = {
  nama_mitra: string;
  website: string;
  alamat: string;

  nama_pic: string;
  kontak_wa: string;
  email_pic: string;

  lokasi: string;
  sistem_kerja: SistemKerja;
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

function isValidUrl(value: string) {
  if (!value) return true;

  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value: string) {
  if (!value) return true;

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validatePdf(file: File | null, label: string) {
  if (!file) return `${label} wajib diunggah.`;

  if (file.type !== 'application/pdf') {
    return `${label} harus berupa file PDF.`;
  }

  return '';
}

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
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleReset = () => {
    setForm(initialForm);
    setAktaPendirian(null);
    setAktaDireksi(null);
    setKtpPenandatangan(null);
    setNpwpPerusahaan(null);
    setIzinUsaha(null);
    setMessage('');
    setErrorMsg('');
    localStorage.removeItem(DRAFT_KEY);
  };

  const validateForm = () => {
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
      return 'Data mitra, narahubung, dan detail lowongan wajib diisi.';
    }

    if (form.website && !isValidUrl(form.website)) {
      return 'Format website perusahaan tidak valid.';
    }

    if (form.link_pendaftaran && !isValidUrl(form.link_pendaftaran)) {
      return 'Format link pendaftaran tidak valid.';
    }

    if (!isValidEmail(form.email_pic)) {
      return 'Format email narahubung tidak valid.';
    }

    if (!/^62\d{8,15}$/.test(form.kontak_wa)) {
      return 'Nomor WhatsApp narahubung harus diawali 62. Contoh: 6285456123.';
    }

    const kuotaNumber = Number(form.kuota);

    if (!Number.isInteger(kuotaNumber) || kuotaNumber < 1) {
      return 'Kuota harus berupa angka minimal 1.';
    }

    const fileErrors = [
      validatePdf(aktaPendirian, 'Akta pendirian'),
      validatePdf(aktaDireksi, 'Akta susunan direksi'),
      validatePdf(ktpPenandatangan, 'KTP penandatangan'),
      validatePdf(npwpPerusahaan, 'NPWP perusahaan'),
      validatePdf(izinUsaha, 'Dokumen izin usaha terkait'),
    ].filter(Boolean);

    if (fileErrors.length > 0) {
      return fileErrors[0];
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');
    setMessage('');

    const validation = validateForm();

    if (validation) {
      setErrorMsg(validation);
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = await getCurrentUserClient();

      const result = await apiClient('/api/pengajuan-mitra', {
        method: 'POST',
        body: {
          nama_mitra: form.nama_mitra.trim(),
          alamat_kantor_mitra: form.alamat.trim(),
          url_mitra: form.website.trim() || null,

          nama_narahubung_mitra: form.nama_pic.trim(),
          kontak_narahubung_mitra: form.kontak_wa.trim(),
          email_pic: form.email_pic.trim(),

          nama_mahasiswa_pengusul: currentUser.name,
          npm_mahasiswa_pengusul: currentUser.nim_nidn || '-',
          program_studi_mahasiswa: currentUser.prodi || '-',
          angkatan_mahasiswa: currentUser.angkatan || '-',
          kontak_mahasiswa: currentUser.phone || form.kontak_wa.trim(),
          kelas: currentUser.kelas || '-',

          lokasi: form.lokasi.trim(),
          sistem_kerja: form.sistem_kerja,
          kuota: Number(form.kuota),
          link_pendaftaran: form.link_pendaftaran.trim() || null,
          deskripsi_lowongan: form.deskripsi_lowongan.trim(),
          persyaratan: form.persyaratan.trim(),

          link_akta_pendirian: null,
          link_akta_direksi: null,
          link_ktp_penandatangan: null,
          link_npwp: null,
          link_izin_usaha: null,
        },
      });

      setMessage(
        result.message ||
          'Pengajuan mitra berhasil dikirim dan akan diperiksa oleh staff.'
      );

      handleReset();
      setShowForm(false);
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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
                Ajukan Mitra
              </p>

              <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
                Ajukan perusahaan atau instansi untuk menjadi mitra magang.
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                Sebelum mengajukan mitra baru, cek terlebih dahulu apakah
                perusahaan sudah terdaftar sebagai mitra. Jika belum, isi form
                pengajuan mitra berikut.
              </p>
            </div>

            <Link href="/" className="app-btn-secondary lg:shrink-0">
              Beranda
            </Link>
          </div>
        </section>

        {message && <Alert variant="success">{message}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

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
                    <label className="app-label">Email Narahubung</label>
                    <input
                      type="email"
                      value={form.email_pic}
                      onChange={(e) => handleChange('email_pic', e.target.value)}
                      className="app-input"
                      placeholder="pic@perusahaan.com"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Detail Lowongan Magang
                </h3>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Lokasi Magang</label>
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
                      type="text"
                      inputMode="numeric"
                      value={form.kuota}
                      onChange={(e) =>
                        handleChange(
                          'kuota',
                          e.target.value.replace(/[^0-9]/g, '')
                        )
                      }
                      className="app-input"
                      placeholder="Contoh: 5"
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
                      placeholder="Jelaskan posisi, bidang kerja, atau kebutuhan magang"
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
                      placeholder="Tuliskan persyaratan magang"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-xl font-black text-slate-950 dark:text-white">
                  Dokumen Pendukung
                </h3>

                <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  Unggah dokumen pendukung dalam format PDF untuk membantu staff
                  memeriksa kelayakan pengajuan mitra.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Akta Pendirian PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setAktaPendirian(e.target.files?.[0] || null)
                      }
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      Akta Susunan Direksi PDF
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setAktaDireksi(e.target.files?.[0] || null)
                      }
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">
                      KTP Penandatangan PDF
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setKtpPenandatangan(e.target.files?.[0] || null)
                      }
                      className="app-input"
                    />
                  </div>

                  <div>
                    <label className="app-label">NPWP Perusahaan PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setNpwpPerusahaan(e.target.files?.[0] || null)
                      }
                      className="app-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="app-label">
                      Izin Usaha Terkait PDF
                    </label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setIzinUsaha(e.target.files?.[0] || null)}
                      className="app-input"
                    />
                  </div>
                </div>
              </section>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 dark:border-slate-800 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-btn-primary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Pengajuan Mitra'}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="app-btn-secondary flex-1 disabled:cursor-not-allowed disabled:opacity-60"
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