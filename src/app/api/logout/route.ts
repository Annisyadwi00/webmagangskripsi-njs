import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Berhasil logout' }, { status: 200 });
  
  // Menghapus cookie secara paksa dari jalur response (Dijamin 100% musnah)
  response.cookies.set({
    name: 'auth_token',
    value: '',
    maxAge: 0,
    path: '/',
  });
  
  return response;
}