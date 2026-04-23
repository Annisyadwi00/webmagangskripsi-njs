import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    const user: any = await User.findOne({ where: { email } });
    if (!user) return NextResponse.json({ message: 'Email tidak terdaftar!' }, { status: 404 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return NextResponse.json({ message: 'Password salah!' }, { status: 401 });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, prodi: user.prodi },
      process.env.JWT_SECRET || 'fallback_secret'
    );

    const cookieStore = await cookies();
    
    // REVISI: maxAge dihapus agar menjadi Session Cookie. 
    // Otomatis terhapus dan minta login ulang saat browser ditutup.
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return NextResponse.json({ message: 'Login berhasil', role: user.role }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}