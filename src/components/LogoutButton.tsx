"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Gagal logout.');
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Terjadi kesalahan saat logout.';

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full px-4 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? 'Keluar...' : 'Keluar'}
    </button>
  );
}