import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer'; // <-- TAMBAHKAN BARIS INI! Wajib hukumnya
import { cookies } from 'next/headers';

export const metadata = {
  title: 'SI Magang UNSIKA',
  description: 'Sistem Informasi Magang Fasilkom UNSIKA',
};

// 1. Tambahkan kata 'async' di sini
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  
  // 2. Tambahkan kata 'await' di depan cookies()
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  let user = null;
  if (token) {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      user = JSON.parse(decodedJson);
    } catch (error) {
      console.error("Gagal membaca token");
    }
  }

  return (
    <html lang="id" className="scroll-smooth">
      {/* TAMBAHKAN suppressHydrationWarning DI SINI */}
      <body suppressHydrationWarning className="font-sans antialiased text-slate-900 bg-slate-50 selection:bg-blue-200 selection:text-[#1e3a8a] flex flex-col min-h-screen">
        <Navbar user={user} />
        
        <div className="flex-grow">
          {children}
        </div>
        
        <Footer />
      </body>
    </html>
  );
}