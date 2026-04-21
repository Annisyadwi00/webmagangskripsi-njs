import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Tidak ada token' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
    if (!user) return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    
    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Token tidak valid' }, { status: 401 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Tidak ada token' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const body = await request.json();
    
    // UPDATE PROFIL (Ditambah field "photo")
    if (body.action === 'update_profile') {
      await User.update({ 
        name: body.name, 
        phone: body.phone,
        photo: body.photo  // <--- INI TAMBAHANNYA
      }, { where: { id: decoded.id } });
      return NextResponse.json({ message: 'Profil berhasil diperbarui di database!' }, { status: 200 });
    }

    // UPDATE PASSWORD
    if (body.action === 'update_password') {
      const user: any = await User.findByPk(decoded.id);
      const isMatch = await bcrypt.compare(body.currentPassword, user.password);
      if (!isMatch) return NextResponse.json({ message: 'Kata sandi saat ini salah!' }, { status: 400 });

      const hashedNewPassword = await bcrypt.hash(body.newPassword, 10);
      await User.update({ password: hashedNewPassword }, { where: { id: decoded.id } });
      return NextResponse.json({ message: 'Kata sandi berhasil diubah!' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}