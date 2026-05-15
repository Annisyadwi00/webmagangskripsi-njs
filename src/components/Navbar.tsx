"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

type NavbarUser = {
  name?: string;
  role?: string;
  photo?: string;
};

export default function Navbar({ user: propUser }: { user?: NavbarUser | null }) {
  const pathname = usePathname();
  const [user, setUser] = useState<NavbarUser | null>(propUser || null);
  const [isOpen, setIsOpen] = useState(false);

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
    { label: 'FAQ', href: '/#faq' },
    { label: 'Feedback', href: '/#feedback' },
  ];

  const getDashboardPath = () => {
    if (user?.role === 'Admin') return '/admin/dashboard';
    if (user?.role === 'Dosen') return '/dosen/dashboard';
    return '/dashboard';
  };

  const getLinkClass = (href: string) => {
    const isActive = href === '/' ? pathname === '/' : pathname?.startsWith(href);

    return isActive
      ? 'text-[#1e3a8a] bg-blue-50'
      : 'text-slate-600 hover:text-[#1e3a8a] hover:bg-slate-50';
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="app-container">
        <nav className="flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-sm font-black text-[#1e3a8a]">
              SI
            </div>

            <div>
              <p className="text-lg font-black leading-none text-slate-950">
                SI Magang
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-400">
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
            {user ? (
              <Link href={getDashboardPath()} className="app-btn-primary px-5 py-3">
                Dashboard
              </Link>
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

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-label="Buka menu navigasi"
          >
            <span className="text-xl font-black">{isOpen ? '×' : '≡'}</span>
          </button>
        </nav>

        {isOpen && (
          <div className="border-t border-slate-100 py-4 md:hidden">
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
                  <Link href={getDashboardPath()} className="app-btn-primary">
                    Dashboard
                  </Link>
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