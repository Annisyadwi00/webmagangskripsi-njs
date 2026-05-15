"use client";

import Link from 'next/link';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createFeedback } from '@/lib/feedback-client';

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
      'Sistem ini dikhususkan untuk Mahasiswa, Dosen Pembimbing, dan Admin dari Fakultas Ilmu Komputer (Fasilkom) Universitas Singaperbangsa Karawang (UNSIKA).',
  },
  {
    tanya: 'Bagaimana alur pendaftaran magang?',
    jawab:
      'Mahasiswa wajib memiliki akun, lalu mengunggah Letter of Acceptance (LOA) dari perusahaan. Setelah diverifikasi oleh Admin, mahasiswa baru bisa memilih Dosen Pembimbing untuk kemudian memulai pengisian logbook.',
  },
  {
    tanya: 'Apakah pengisian logbook wajib setiap hari?',
    jawab:
      'Pengisian logbook dilakukan selama kegiatan magang berlangsung. Mahasiswa perlu melaporkan kegiatan, jam mulai, jam selesai, serta bukti kegiatan agar dapat di-review oleh Dosen Pembimbing.',
  },
  {
    tanya: 'Bagaimana sistem penilaian dan konversi SKS magang?',
    jawab:
      'Sistem konversi akan ditentukan oleh Admin Fakultas setelah LOA disetujui. Nilai akhir akan diberikan oleh Dosen Pembimbing berdasarkan logbook dan laporan akhir kegiatan magang.',
  },
  {
    tanya: 'Apa yang harus dilakukan jika pengajuan LOA ditolak?',
    jawab:
      'Mahasiswa dapat melihat alasan penolakan dari Admin pada halaman pengajuan. Setelah itu, mahasiswa dapat memperbaiki data atau mengajukan ulang sesuai catatan yang diberikan.',
  },
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

  const handleChange = (
    field: keyof FeedbackForm,
    value: string
  ) => {
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
        result.message || 'Pesan & masukan Anda berhasil dikirim. Terima kasih!'
      );

      setForm({
        nama: '',
        email: '',
        pesan: '',
      });
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
    <div className="bg-slate-50 dark:bg-slate-900 transition-colors duration-500 font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-[#1e3a8a]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/10 dark:bg-emerald-900/20 rounded-full blur-3xl -z-10" />

      <main className="flex flex-col items-center justify-center px-6 py-10 md:py-20 text-center relative z-10">
        <div className="inline-block px-5 py-2 mb-8 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <span className="text-[#1e3a8a] dark:text-blue-400 font-extrabold text-xs md:text-sm tracking-wider uppercase">
            Fakultas Ilmu Komputer UNSIKA
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 dark:text-white max-w-4xl leading-tight md:leading-[1.15] mb-6 md:mb-8 transition-colors px-4 md:px-0">
          Sistem Informasi Magang{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1e3a8a] to-blue-500 dark:from-blue-400 dark:to-emerald-400 block md:inline mt-2 md:mt-0">
            Terintegrasi & Modern
          </span>
        </h1>

        <p className="text-base md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed font-medium transition-colors">
          Platform digital inovatif untuk mempermudah mahasiswa dalam mengajukan
          Letter of Acceptance (LOA), menyusun laporan harian, dan memantau
          proses penilaian magang secara transparan.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link
            href="/login"
            className="px-8 py-4 text-base font-bold text-white bg-[#1e3a8a] hover:bg-blue-900 shadow-xl shadow-blue-900/30 rounded-2xl transition-all hover:-translate-y-1 text-center flex items-center justify-center gap-2"
          >
            Masuk ke Portal
            <span>→</span>
          </Link>

          <Link
            href="/lowongan"
            className="px-8 py-4 text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-2xl transition-all hover:-translate-y-1 shadow-sm text-center"
          >
            Lihat Bursa Magang
          </Link>
        </div>
      </main>

      <section
        id="about"
        className="py-20 bg-white dark:bg-slate-900 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] transform rotate-3 scale-105 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />

              <div className="relative bg-slate-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-[32px] p-8 md:p-12 shadow-xl overflow-hidden transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 dark:bg-indigo-900/30 rounded-bl-full -z-10" />

                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                  Menjembatani{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    Akademik & Industri
                  </span>
                </h3>

                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  SI Magang Fasilkom UNSIKA hadir sebagai solusi digital
                  terintegrasi untuk menyederhanakan seluruh proses administrasi
                  magang. Mulai dari pengajuan Letter of Acceptance (LOA),
                  pelaporan logbook, hingga penilaian akhir, semuanya kini dapat
                  dilakukan dalam satu pintu.
                </p>

                <div className="flex items-center gap-4">
                  <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-blue-100 flex items-center justify-center text-xl shadow-sm z-30">
                      👨‍🎓
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-emerald-100 flex items-center justify-center text-xl shadow-sm z-20">
                      👨‍🏫
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 bg-amber-100 flex items-center justify-center text-xl shadow-sm z-10">
                      🏢
                    </div>
                  </div>

                  <p className="text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Mahasiswa • Dosen • Admin
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-8">
              <div>
                <span className="text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <span className="w-8 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
                  Tentang SI Magang
                </span>

                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mt-4 mb-6 leading-tight">
                  Transformasi Digital Magang{' '}
                  <span className="text-[#1e3a8a] dark:text-blue-400">
                    Fasilkom
                  </span>
                </h2>

                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Sistem ini dirancang khusus untuk memberikan kemudahan dan
                  transparansi bagi semua pihak yang terlibat dalam proses
                  pelaksanaan magang mahasiswa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="bg-blue-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-blue-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-600/30 mb-4">
                    ⚡
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    Efisien
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Bebas tumpukan kertas. Ajukan dan pantau status magang
                    secara real-time.
                  </p>
                </div>

                <div className="bg-indigo-50 dark:bg-slate-800/50 p-6 rounded-[24px] border border-indigo-100 dark:border-slate-700 hover:-translate-y-1 transition-transform">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-indigo-600/30 mb-4">
                    🎯
                  </div>
                  <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                    Terpantau
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Evaluasi logbook dan komunikasi dengan dosen pembimbing
                    menjadi lebih terarah.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistik/Fitur */}
      <section className="py-16 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[28px] p-8 shadow-sm">
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Pengajuan LOA
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Mahasiswa dapat mengajukan LOA magang secara digital dan
                memantau status verifikasi.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[28px] p-8 shadow-sm">
              <div className="text-4xl mb-4">🗓️</div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Logbook Harian
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Aktivitas magang dapat dicatat dengan jam kegiatan, bukti, serta
                komentar evaluasi dosen.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-[28px] p-8 shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">
                Evaluasi Akhir
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Dosen pembimbing dapat memberikan nilai akhir berdasarkan
                rubrik evaluasi yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="text-center mb-10 px-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 text-sm md:text-base">
            Pertanyaan yang sering diajukan seputar SI Magang.
          </p>
        </div>

        <div className="space-y-4 px-4 md:px-20 lg:px-40">
          {faqs.map((faq, idx) => (
            <div
              key={faq.tanya}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-6 text-left font-bold text-gray-900 dark:text-white text-base md:text-lg focus:outline-none"
              >
                {faq.tanya}

                <motion.span
                  animate={{ rotate: openFaq === idx ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#1e3a8a] dark:text-blue-400 text-xl ml-4 shrink-0"
                >
                  ▾
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                      {faq.jawab}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-3xl mx-auto px-6 py-16 mb-20 z-10">
        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-gray-200 dark:border-slate-700 p-8 md:p-12 shadow-xl shadow-blue-900/5 transition-colors">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">
              Kirim Pesan & Masukan
            </h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
              Ada kendala teknis atau saran fitur? Beritahu tim pengembang kami.
            </p>
          </div>

          {pesanSukses && (
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-6 py-4 rounded-xl font-bold text-center mb-6 text-sm transition-colors">
              ✅ {pesanSukses}
            </div>
          )}

          {pesanError && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl font-bold text-center mb-6 text-sm transition-colors">
              ⚠️ {pesanError}
            </div>
          )}

          <form onSubmit={kirimPesan} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Nama Lengkap
                </label>
                <input
                  required
                  type="text"
                  value={form.nama}
                  onChange={(e) => handleChange('nama', e.target.value)}
                  className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
                  placeholder="Masukkan nama..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Alamat Email
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
                  placeholder="email@contoh.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Pesan / Kendala
              </label>
              <textarea
                required
                rows={4}
                value={form.pesan}
                onChange={(e) => handleChange('pesan', e.target.value)}
                className="w-full px-5 py-3.5 border border-gray-200 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-slate-600 outline-none focus:ring-2 focus:ring-[#1e3a8a] transition-all"
                placeholder="Jelaskan masalah atau saran Anda..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-900 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0 mt-4"
            >
              {loading ? 'Mengirim Pesan...' : 'Kirim Sekarang'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}