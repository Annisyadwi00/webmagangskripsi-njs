import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Sesi berakhir, silakan login ulang.' }, { status: 401 });
    }

    // Membaca token untuk mendapatkan ID user yang sedang login
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Cari data lengkap user di database berdasarkan ID (tapi sembunyikan password-nya)
    const currentUser = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] } 
    });

    if (!currentUser) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: currentUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server atau token tidak valid' }, { status: 500 });
  }
}