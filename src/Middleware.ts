import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Ambil token dari cookies browser
  const token = request.cookies.get('auth_token')?.value;

  // Daftar rute yang butuh login (dilindungi)
  const protectedRoutes = ['/dashboard', '/dosen/dashboard', '/admin/dashboard', '/settings', '/pendaftaran', '/status-pendaftaran', '/pilih-dosen'];

  // Cek apakah pengguna sedang mencoba mengakses rute yang dilindungi
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // Jika mencoba akses halaman dilindungi TAPI tidak ada token -> Lempar ke halaman Login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // (Opsional) Jika user sudah login, jangan biarkan dia buka halaman login/register lagi
  const isAuthRoute = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register';
  if (isAuthRoute && token) {
    // Kalau sudah login, arahkan saja ke /dashboard (atau bisa disesuaikan role nanti)
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Jika aman, biarkan lanjut
  return NextResponse.next();
}

// Konfigurasi agar middleware hanya berjalan di rute tertentu saja (menghemat performa server)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/dosen/dashboard/:path*',
    '/admin/dashboard/:path*',
    '/settings/:path*',
    '/pendaftaran/:path*',
    '/status-pendaftaran/:path*',
    '/pilih-dosen/:path*',
    '/login',
    '/register'
  ]
};      