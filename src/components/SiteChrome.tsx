"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

type NavbarUser = {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
} | null;

type SiteChromeProps = {
  children: React.ReactNode;
  user: NavbarUser;
};

const customChromeRoutes = [
  '/',
  '/dashboard',
  '/pengajuan',
  '/pengajuan-mitra',
  '/ajukan-mitra',
  '/laporan-akhir',
  '/settings',
  '/mitra',
  '/lowongan',
  '/admin',
  '/dosen',
  '/super-admin',
];

export default function SiteChrome({ children, user }: SiteChromeProps) {
  const pathname = usePathname();

  const isCustomChromePage = customChromeRoutes.some((route) => {
    if (route === '/') return pathname === '/';

    return pathname === route || pathname.startsWith(`${route}/`);
  });

  if (isCustomChromePage) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar user={user} />

      <div className="flex-grow">{children}</div>

      <Footer />
    </>
  );
}