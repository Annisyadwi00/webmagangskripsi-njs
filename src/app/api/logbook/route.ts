import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Logbook from '@/models/Logbook';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Tidak ada token' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let logbooks;
    if (decoded.role === 'Mahasiswa') {
      // Mahasiswa hanya melihat logbook miliknya sendiri
      logbooks = await Logbook.findAll({ where: { user_id: decoded.id }, order: [['tanggal', 'DESC']] });
    } else {
      // Dosen/Admin melihat semua logbook
      logbooks = await Logbook.findAll({ order: [['tanggal', 'DESC']] });
    }

    return NextResponse.json({ data: logbooks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error mengambil logbook' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Tidak ada token' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const body = await request.json();

    const newLogbook = await Logbook.create({
      user_id: decoded.id,
      nama_mahasiswa: decoded.name,
      tanggal: body.tanggal,
      kegiatan: body.kegiatan,
      link_bukti: body.link_bukti,
      status: 'Menunggu Validasi'
    });

    return NextResponse.json({ message: 'Logbook berhasil ditambahkan', data: newLogbook }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Tidak ada token' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Dosen' && decoded.role !== 'Admin') {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 403 });
    }

    const body = await request.json();
    
    // Update status dan simpan catatan dosen (jika ada)
    await Logbook.update(
      { 
        status: body.status,
        catatan_dosen: body.catatan_dosen || null 
      }, 
      { where: { id: body.id } }
    );

    return NextResponse.json({ message: `Logbook berhasil di-${body.status}` }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}