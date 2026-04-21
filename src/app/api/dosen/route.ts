import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    // Tarik semua user yang perannya adalah 'Dosen'
    const dosenList = await User.findAll({
      where: { role: 'Dosen' },
      attributes: ['id', 'name', 'email', 'nim_nidn'] // Ambil data penting saja
    });
    return NextResponse.json({ data: dosenList }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data dosen' }, { status: 500 });
  }
}