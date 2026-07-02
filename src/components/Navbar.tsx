"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import ThemeIcon from '@/components/ui/ThemeIcon';
import { apiClient } from '@/lib/api-client';

type NavbarUser = {
  name?: string;
  role?: string;
  photo?: string;
};

export default function Navbar({ user: propUser }: { user?: NavbarUser | null }) {
  const pathname = usePathname();

  const [user, setUser] = useState<NavbarUser | null>(propUser || null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    document.documentElement.classList.toggle('dark', shouldUseDark);
    setIsDarkMode(shouldUseDark);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      if (propUser) {
        setUser(propUser);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          cache: 'no-store',
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const result = await res.json();
        setUser(result.data || null);
      } catch {
        setUser(null);
      }
    };

    fetchUser();
  }, [pathname, propUser]);

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
    await apiClient<null>('/api/auth/logout', {
      method: 'POST',
    });
  } catch {
    // Tetap arahkan ke landing page meskipun request logout gagal.
  } finally {
    setUser(null);
    setIsLoggingOut(false);
    window.location.href = '/';
  }
};

  const hideNavbar =
    pathname?.includes('/login') ||
    pathname?.includes('/register') ||
    pathname?.includes('/dashboard') ||
    pathname?.includes('/admin') ||
    pathname?.includes('/dosen') ||
    pathname?.includes('/pilih-dosen') ||
    pathname?.includes('/settings');

  if (hideNavbar) {
    return null;
  }

 const navItems = [
  { label: 'Beranda', href: '/' },
  { label: 'Lowongan', href: '/lowongan' },
  { label: 'Mitra', href: '/mitra' },
  { label: 'Ajukan Mitra', href: '/ajukan-mitra' },
];

  const getDashboardPath = () => {
  if (user?.role === 'Super Admin') return '/super-admin/dashboard';
  if (user?.role === 'Admin') return '/admin/dashboard';
  if (user?.role === 'Dosen') return '/dosen/dashboard';

  return '/dashboard';
};

  const getLinkClass = (href: string) => {
    const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);

    return isActive
      ? 'bg-blue-50 text-[#1e3a8a] dark:bg-blue-400/10 dark:text-blue-300'
      : 'text-slate-600 hover:bg-slate-50 hover:text-[#1e3a8a] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-300';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
      <div className="app-container">
        <nav className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xs font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
              AMR
            </div>

            <div>
              <p className="text-lg font-black leading-none tracking-tight text-slate-950 dark:text-white">
                AMIRAT
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Fasilkom UNSIKA
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${getLinkClass(
                  item.href
                )}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:border-[#1e3a8a] hover:text-[#1e3a8a] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-300 dark:hover:text-blue-300"
              aria-label="Ganti mode tema"
              title={isDarkMode ? 'Ganti ke light mode' : 'Ganti ke dark mode'}
            >
              <ThemeIcon type={isDarkMode ? 'sun' : 'moon'} />
            </button>

           {user ? (
  <>
    <Link href={getDashboardPath()} className="app-btn-primary px-5 py-3">
      Dashboard
    </Link>

    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="app-btn-danger px-5 py-3 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? 'Keluar...' : 'Logout'}
    </button>
  </>
) : (
              <>
                <Link href="/login" className="app-btn-secondary px-5 py-3">
                  Masuk
                </Link>
                <Link href="/register" className="app-btn-primary px-5 py-3">
                  Daftar
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Ganti mode tema"
            >
              <ThemeIcon type={isDarkMode ? 'sun' : 'moon'} />
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              aria-label="Buka menu navigasi"
            >
              <span className="text-xl font-black">{isOpen ? '×' : '≡'}</span>
            </button>
          </div>
        </nav>

        {isOpen && (
          <div className="border-t border-slate-100 py-4 dark:border-slate-800 md:hidden">
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-bold ${getLinkClass(
                    item.href
                  )}`}
                >
                  {item.label}
                </Link>
              ))}

              <div className="grid grid-cols-1 gap-2 pt-3">
              
               {user ? (
  <>
    <Link href={getDashboardPath()} className="app-btn-primary">
      Dashboard
    </Link>

    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="app-btn-danger disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoggingOut ? 'Keluar...' : 'Logout'}
    </button>
  </>
) : (
                  <>
                    <Link href="/login" className="app-btn-secondary">
                      Masuk
                    </Link>
                    <Link href="/register" className="app-btn-primary">
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}