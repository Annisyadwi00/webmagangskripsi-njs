"use client";

import { useState } from 'react';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage('');
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Email wajib diisi.');
      return;
    }

    if (!email.endsWith('@unsika.ac.id')) {
      setErrorMsg('Gunakan email institusi @unsika.ac.id.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal mengirim permintaan reset password.');
      }

      setMessage(
        result.message ||
          'Permintaan reset password berhasil dikirim. Silakan cek email atau hubungi admin/staff.'
      );
      setEmail('');
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat mengirim permintaan reset password.';

      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="app-container">
        <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-xl items-center">
          <section className="app-card w-full animate-fade-up p-6 md:p-8">
            <Link
              href="/login"
              className="mb-6 inline-flex text-sm font-black text-[#1e3a8a] hover:underline dark:text-blue-300"
            >
              ← Kembali ke Login
            </Link>

            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                SI
              </div>

              <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
                Lupa Password
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Masukkan email institusi untuk mengajukan reset password.
              </p>
            </div>

            {message && <Alert variant="success">{message}</Alert>}
            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="app-label">
                  Email Institusi
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="app-input"
                  placeholder="nama@unsika.ac.id"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="app-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? 'Mengirim...' : 'Kirim Permintaan Reset'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-6 text-slate-500 dark:text-slate-400">
              Jika belum menerima akses reset, hubungi staff/admin fakultas.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}