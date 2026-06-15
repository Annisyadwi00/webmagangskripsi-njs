"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api-client';
import ThemeIcon from '@/components/ui/ThemeIcon';

type DashboardRole = 'Mahasiswa' | 'Admin' | 'Super Admin' | 'Dosen';

type NavItem = {
  label: string;
  href: string;
};

type DashboardShellProps = {
  role: DashboardRole;
  children: React.ReactNode;
};

const navItems: Record<DashboardRole, NavItem[]> = {
  Mahasiswa: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pengajuan Magang', href: '/pengajuan' },
    { label: 'Pengajuan Mitra', href: '/ajukan-mitra' },
    { label: 'Laporan Magang', href: '/laporan-akhir' },
    { label: 'Lowongan', href: '/lowongan' },
    { label: 'Mitra', href: '/mitra' },
    { label: 'Settings', href: '/settings' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Data Mahasiswa Magang', href: '/admin/mahasiswa-magang' },
    { label: 'Pengajuan Magang', href: '/admin/pengajuan' },
    { label: 'Alokasi Dosen', href: '/admin/alokasi-dosen' },
    { label: 'Pengajuan Mitra', href: '/admin/pengajuan-mitra' },
    { label: 'Mitra', href: '/admin/mitra' },
    { label: 'Lowongan', href: '/admin/lowongan' },
  ],
  'Super Admin': [
    { label: 'Dashboard', href: '/super-admin/dashboard' },
    { label: 'Data Mahasiswa Magang', href: '/super-admin/mahasiswa-magang' },
    { label: 'Pengajuan Magang', href: '/super-admin/pengajuan' },
    { label: 'Alokasi Dosen', href: '/super-admin/alokasi-dosen' },
    { label: 'Pengajuan Mitra', href: '/super-admin/pengajuan-mitra' },
    { label: 'Mitra', href: '/super-admin/mitra' },
    { label: 'Lowongan', href: '/super-admin/lowongan' },
    { label: 'User Management', href: '/super-admin/users' },
  ],
  Dosen: [
    { label: 'Dashboard', href: '/dosen/dashboard' },
    { label: 'Laporan Magang', href: '/dosen/laporan-akhir' },
    { label: 'Penilaian Akhir', href: '/dosen/penilaian' },
    { label: 'Settings', href: '/settings' },
  ],
};

function getRoleLabel(role: DashboardRole) {
  if (role === 'Super Admin') return 'Super Admin';
  if (role === 'Admin') return 'Staff TU';
  if (role === 'Dosen') return 'Dosen Pembimbing';
  return 'Mahasiswa';
}

function getRoleHome(role: DashboardRole) {
  if (role === 'Super Admin') return '/super-admin/dashboard';
  if (role === 'Admin') return '/admin/dashboard';
  if (role === 'Dosen') return '/dosen/dashboard';
  return '/dashboard';
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const hasRenderedSidebar = useRef(false);

  // Cegah sidebar double render di development (React Strict Mode)
  useEffect(() => {
    if (hasRenderedSidebar.current) return;
    hasRenderedSidebar.current = true;
    // Tidak ada aksi tambahan, hanya penanda
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    document.documentElement.classList.toggle('dark', nextMode);
    localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    setIsDarkMode(nextMode);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient<null>('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch {
      router.push('/');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getLinkClass = (href: string) => {
    const isDashboardRoot =
      href === '/dashboard' ||
      href === '/admin/dashboard' ||
      href === '/super-admin/dashboard' ||
      href === '/dosen/dashboard';
    const isActive =
      pathname === href || (!isDashboardRoot && pathname.startsWith(`${href}/`));
    return isActive
      ? 'bg-blue-50 text-[#1e3a8a] ring-1 ring-blue-100 dark:bg-blue-400/10 dark:text-blue-300 dark:ring-blue-400/20'
      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300';
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      {/* Sidebar untuk desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link href={getRoleHome(role)} className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
            SI
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {getRoleLabel(role)}
            </p>
            <p className="truncate text-lg font-black text-slate-950 dark:text-white">
              SI Magang
            </p>
          </div>
        </Link>

        <nav className="mt-8 max-h-[calc(100vh-130px)] space-y-2 overflow-y-auto pr-1">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
          >
            ← Beranda
          </Link>
          <div className="my-2 border-t border-slate-200 dark:border-slate-800"></div>
          {navItems[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-black ${getLinkClass(item.href)}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Header untuk mobile */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 lg:ml-72">
        <div className="flex h-20 items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 lg:hidden"
              aria-label="Buka menu"
            >
              {isOpen ? '×' : '≡'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-black text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ThemeIcon type={isDarkMode ? 'sun' : 'moon'} />
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-2xl bg-red-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? 'Keluar...' : 'Keluar'}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="border-t border-slate-100 px-5 py-4 dark:border-slate-800 lg:hidden">
            <nav className="space-y-2">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-black text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300"
              >
                ← Beranda
              </Link>
              <div className="border-t border-slate-200 dark:border-slate-800"></div>
              {navItems[role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black ${getLinkClass(item.href)}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <div className="min-w-0 lg:pl-72">
        <main className="animate-fade-slide min-w-0">{children}</main>
      </div>
    </div>
  );
}