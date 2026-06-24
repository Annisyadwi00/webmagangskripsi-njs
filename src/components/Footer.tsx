import Link from 'next/link';

const footerLinks = [
  {
    title: 'Menu',
    links: [
      { label: 'Beranda', href: '/' },
      { label: 'Lowongan', href: '/lowongan' },
      { label: 'Mitra', href: '/mitra' },
      { label: 'Ajukan Mitra', href: '/ajukan-mitra' },
    ],
  },
  {
    title: 'Akses',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Registrasi', href: '/register' },
      { label: 'Lupa Password', href: '/forgot-password' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="app-container py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                SI
              </div>

              <div>
                <p className="text-lg font-black leading-none text-slate-950 dark:text-white">
                  SI Magang
                </p>
                <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  FASILKOM UNSIKA
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
              Sistem Informasi Magang berbasis web untuk membantu proses
              pendataan magang, pengajuan mitra, informasi lowongan, laporan,
              dan penilaian magang mahasiswa.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                {group.title}
              </h3>

              <div className="mt-4 space-y-3">
                {group.links.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block text-sm font-bold text-slate-600 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:text-blue-300"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-slate-100 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} SI Magang FASILKOM UNSIKA. All rights reserved.
          </p>

          <p className="font-bold">
            Developed by{' Annisya Dwi Chaerani '}
          </p>
        </div>
      </div>
    </footer>
  );
}