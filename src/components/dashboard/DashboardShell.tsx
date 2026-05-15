"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

type DashboardRole = 'Mahasiswa' | 'Admin' | 'Dosen';

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
    { label: 'Pengajuan', href: '/pengajuan' },
    { label: 'Logbook', href: '/logbook' },
    { label: 'Lowongan', href: '/lowongan' },
  ],
  Admin: [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Pengajuan', href: '/admin/pengajuan' },
    { label: 'Pengguna', href: '/admin/users' },
    { label: 'Lowongan', href: '/admin/lowongan' },
    { label: 'Feedback', href: '/admin/feedback' },
  ],
  Dosen: [
    { label: 'Dashboard', href: '/dosen/dashboard' },
    { label: 'Bimbingan', href: '/dosen/bimbingan' },
    { label: 'Logbook', href: '/dosen/logbook' },
    { label: 'Penilaian', href: '/dosen/penilaian' },
  ],
};

function getRoleLabel(role: DashboardRole) {
  if (role === 'Admin') return 'Administrator';
  if (role === 'Dosen') return 'Dosen Pembimbing';

  return 'Mahasiswa';
}

export default function DashboardShell({ role, children }: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await apiClient<null>('/api/auth/logout', {
        method: 'POST',
      });

      router.push('/login');
      router.refresh();
    } catch {
      router.push('/login');
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getLinkClass = (href: string) => {
    const isActive = pathname === href;

    return isActive
      ? 'bg-blue-50 text-[#1e3a8a] ring-1 ring-blue-100'
      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a]';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white px-5 py-6 lg:block">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a]">
            SI
          </div>

          <div>
            <p className="text-lg font-black leading-none text-slate-950">
              SI Magang
            </p>
            <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              {getRoleLabel(role)}
            </p>
          </div>
        </Link>

        <nav className="mt-8 space-y-2">
          {navItems[role].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-2xl px-4 py-3 text-sm font-black ${getLinkClass(
                item.href
              )}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-5 right-5">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="app-btn-danger w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoggingOut ? 'Keluar...' : 'Keluar'}
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a]">
              SI
            </div>

            <div>
              <p className="text-base font-black leading-none text-slate-950">
                SI Magang
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                {getRoleLabel(role)}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-black text-slate-700"
          >
            {isOpen ? '×' : '≡'}
          </button>
        </div>

        {isOpen && (
          <div className="border-t border-slate-100 px-5 py-4">
            <nav className="space-y-2">
              {navItems[role].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-black ${getLinkClass(
                    item.href
                  )}`}
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="app-btn-danger mt-3 w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? 'Keluar...' : 'Keluar'}
              </button>
            </nav>
          </div>
        )}
      </header>

      <div className="lg:pl-72">
        <main>{children}</main>
      </div>
    </div>
  );
}