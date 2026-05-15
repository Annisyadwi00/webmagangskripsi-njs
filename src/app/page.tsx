"use client";

import Link from 'next/link';
import { useState } from 'react';
import { createFeedback } from '@/lib/feedback-client';
import Alert from '@/components/ui/Alert';

type FeedbackForm = {
  nama: string;
  email: string;
  pesan: string;
};

type FAQ = {
  tanya: string;
  jawab: string;
};

const faqs: FAQ[] = [
  {
    tanya: 'Siapa saja yang bisa menggunakan SI Magang?',
    jawab:
      'Sistem ini digunakan oleh Mahasiswa, Dosen Pembimbing, dan Admin Fakultas Ilmu Komputer UNSIKA untuk mengelola proses magang secara digital.',
  },
  {
    tanya: 'Bagaimana alur pendaftaran magang?',
    jawab:
      'Mahasiswa membuat akun, mengajukan LOA, menunggu verifikasi admin, memilih dosen pembimbing, lalu mengisi logbook selama proses magang.',
  },
  {
    tanya: 'Apakah logbook wajib diisi?',
    jawab:
      'Ya. Logbook digunakan sebagai bukti aktivitas harian mahasiswa dan menjadi salah satu dasar evaluasi oleh dosen pembimbing.',
  },
  {
    tanya: 'Bagaimana proses penilaian akhir?',
    jawab:
      'Dosen pembimbing memberikan nilai berdasarkan komponen kedisiplinan, pemahaman materi, kemampuan teknis, dan laporan akhir mahasiswa.',
  },
];

const features = [
  {
    title: 'Pengajuan LOA',
    description:
      'Mahasiswa dapat mengirim data perusahaan, posisi magang, dan link LOA untuk diverifikasi admin.',
  },
  {
    title: 'Logbook Harian',
    description:
      'Aktivitas magang dicatat secara rutin beserta waktu kegiatan, bukti, dan komentar dari dosen.',
  },
  {
    title: 'Evaluasi Terstruktur',
    description:
      'Dosen pembimbing dapat mengevaluasi logbook dan memberikan nilai akhir dengan komponen yang jelas.',
  },
];

const steps = [
  'Mahasiswa membuat akun menggunakan email institusi.',
  'Mahasiswa mengajukan LOA dan data tempat magang.',
  'Admin memverifikasi pengajuan dan menentukan konversi.',
  'Mahasiswa memilih dosen pembimbing.',
  'Mahasiswa mengisi logbook hingga magang selesai.',
  'Dosen memberikan evaluasi dan nilai akhir.',
];

export default function LandingPage() {
  const [form, setForm] = useState<FeedbackForm>({
    nama: '',
    email: '',
    pesan: '',
  });

  const [loading, setLoading] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');
  const [pesanError, setPesanError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleChange = (field: keyof FeedbackForm, value: string) => {
    setForm({
      ...form,
      [field]: value,
    });
  };

  const kirimPesan = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setPesanSukses('');
    setPesanError('');

    try {
      const result = await createFeedback({
        nama: form.nama.trim(),
        email: form.email.trim(),
        pesan: form.pesan.trim(),
      });

      setPesanSukses(
        result.message || 'Pesan dan masukan berhasil dikirim. Terima kasih.'
      );
      setForm({ nama: '', email: '', pesan: '' });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengirim pesan.';

      setPesanError(message);
    } finally {
      setLoading(false);

      setTimeout(() => {
        setPesanSukses('');
        setPesanError('');
      }, 5000);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
  <div className="app-bg-orb left-[-80px] top-24 h-72 w-72 bg-blue-400/40 dark:bg-blue-500/20" />
  <div className="app-bg-orb right-[-90px] top-[520px] h-80 w-80 bg-sky-300/30 dark:bg-sky-500/10" />
      <section className="py-16 md:py-24">
        <div className="app-container">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-[#1e3a8a]">
                SI Magang Fasilkom UNSIKA
              </p>

              <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                Sistem informasi magang yang rapi, terintegrasi, dan mudah
                dipantau.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-500 md:text-lg">
                Digitalisasi proses magang mulai dari pengajuan LOA, pengisian
                logbook, bimbingan dosen, hingga evaluasi dan nilai akhir.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/login" className="app-btn-primary">
                  Masuk ke Portal
                </Link>

                <Link href="/lowongan" className="app-btn-secondary">
                  Lihat Lowongan
                </Link>
              </div>
            </div>

            <div className="app-card app-card-hover animate-fade-up animate-delay-200 p-6 md:p-8">
              <div className="mb-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                  Ringkasan Sistem
                </p>
                <h2 className="mt-2 text-2xl font-black text-slate-950">
                  Satu portal untuk seluruh proses magang.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Dirancang untuk memudahkan mahasiswa, dosen, dan admin dalam
                  menjalankan alur magang secara transparan.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="font-black text-[#1e3a8a]">
                    Mahasiswa
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Ajukan LOA, isi logbook, dan pantau hasil evaluasi.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">
                    Dosen Pembimbing
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Review logbook, terima bimbingan, dan beri nilai akhir.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="font-black text-slate-950">
                    Admin
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Verifikasi pengajuan, kelola pengguna, dan lowongan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-24 py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
              Fitur Utama
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Dibuat untuk alur magang yang lebih sederhana.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Setiap fitur dirancang agar proses administrasi magang lebih rapi
              dan mudah ditelusuri.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <article
  key={feature.title}
  className="app-card app-card-hover animate-fade-up p-6"
>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a]">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <h3 className="mt-5 text-xl font-black text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="app-container">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                Alur Magang
              </p>
              <h2 className="mt-3 text-3xl font-black text-slate-950">
                Proses jelas dari awal sampai selesai.
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-500">
                Mahasiswa, dosen, dan admin memiliki peran masing-masing dalam
                satu alur yang saling terhubung.
              </p>
            </div>

            <div className="app-card p-6">
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div
                    key={step}
                    className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-[#1e3a8a] ring-1 ring-blue-100">
                      {index + 1}
                    </div>

                    <p className="text-sm font-semibold leading-6 text-slate-700">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="app-container">
          <div className="mb-8 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
              FAQ
            </p>
            <h2 className="mt-3 text-3xl font-black text-slate-950">
              Pertanyaan yang sering diajukan.
            </h2>
          </div>

          <div className="mx-auto max-w-4xl space-y-4">
            {faqs.map((faq, index) => (
              <div key={faq.tanya} className="app-card app-card-hover overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-black text-slate-950">{faq.tanya}</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-black text-[#1e3a8a]">
                    {openFaq === index ? '−' : '+'}
                  </span>
                </button>

                {openFaq === index && (
                  <div className="border-t border-slate-100 px-6 pb-5 pt-4">
                    <p className="text-sm leading-7 text-slate-500">
                      {faq.jawab}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="feedback" className="scroll-mt-24 py-12 pb-20">
        <div className="app-container">
          <div className="mx-auto max-w-3xl">
            <div className="app-card app-card-hover animate-fade-up p-6 md:p-8">
              <div className="mb-8 text-center">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#1e3a8a]">
                  Feedback
                </p>
                <h2 className="mt-3 text-3xl font-black text-slate-950">
                  Kirim pesan atau masukan.
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  Masukan pengguna membantu pengembangan SI Magang agar lebih
                  baik.
                </p>
              </div>

              {pesanSukses && <Alert variant="success">{pesanSukses}</Alert>}
              {pesanError && <Alert variant="error">{pesanError}</Alert>}

              <form onSubmit={kirimPesan} className="space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className="app-label">Nama Lengkap</label>
                    <input
                      required
                      type="text"
                      value={form.nama}
                      onChange={(e) => handleChange('nama', e.target.value)}
                      className="app-input"
                      placeholder="Masukkan nama"
                    />
                  </div>

                  <div>
                    <label className="app-label">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="app-input"
                      placeholder="email@contoh.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="app-label">Pesan</label>
                  <textarea
                    required
                    rows={5}
                    value={form.pesan}
                    onChange={(e) => handleChange('pesan', e.target.value)}
                    className="app-input"
                    placeholder="Tuliskan kendala atau saran..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Mengirim...' : 'Kirim Pesan'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}