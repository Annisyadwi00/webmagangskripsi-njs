import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Fungsi Helper untuk Cek Admin
const checkAdmin = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded.role === 'Admin' ? decoded : null;
  } catch {
    return null;
  }
};

// GET: Ambil semua user
export async function GET() {
  try {
    await connectDB();
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Akses Ditolak' }, { status: 403 });

    const users = await User.findAll({ 
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    return NextResponse.json({ data: users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}

// POST: Admin menambah user baru
export async function POST(request: Request) {
  try {
    await connectDB();
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Akses Ditolak' }, { status: 403 });

    const body = await request.json();
    const { name, email, password, role, nim_nidn, prodi } = body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return NextResponse.json({ message: 'Email sudah terdaftar!' }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password || 'unsika123', 10); // Default pass jika kosong

    await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      nim_nidn: nim_nidn || '-',
      prodi: role === 'Mahasiswa' ? prodi : null
    });

    return NextResponse.json({ message: 'Pengguna berhasil ditambahkan!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT: Reset Password / Hapus
export async function PUT(request: Request) {
  try {
    await connectDB();
    const isAdmin = await checkAdmin();
    if (!isAdmin) return NextResponse.json({ message: 'Akses Ditolak' }, { status: 403 });

    const { id, action } = await request.json();

    if (action === 'delete') {
      await User.destroy({ where: { id } });
      return NextResponse.json({ message: 'Pengguna dihapus permanen' }, { status: 200 });
    } else if (action === 'reset_password') {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await User.update({ password: hashedPassword }, { where: { id } });
      return NextResponse.json({ message: 'Password direset menjadi: 123456' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}