import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Admin') return NextResponse.json({ message: 'Hanya Admin!' }, { status: 403 });

    // Ambil semua user kecuali Admin itu sendiri
    const users = await User.findAll({ 
      attributes: ['id', 'name', 'email', 'role', 'nim_nidn', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    
    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, action } = body;

    if (action === 'reset_password') {
      // Reset password jadi '123456'
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.update({ password: hashedPassword }, { where: { id } });
      return NextResponse.json({ message: 'Password direset menjadi: 123456' }, { status: 200 });
    } 
    else if (action === 'delete') {
      await User.destroy({ where: { id } });
      return NextResponse.json({ message: 'Akun berhasil dihapus' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}