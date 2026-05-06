import { NextResponse } from 'next/server';
import Logbook from '@/models/Logbook';
import { connectDB } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ message: 'Akses ditolak' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    let data;
    if (decoded.role === 'Admin' || decoded.role === 'Dosen') {
      data = await Logbook.findAll({ order: [['tanggal', 'DESC']] });
    } else if (decoded.role === 'Mahasiswa') {
      data = await Logbook.findAll({ where: { mahasiswaId: decoded.id }, order: [['tanggal', 'DESC']] });
    } else {
      data = [];
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Mahasiswa') return NextResponse.json({ message: 'Hanya mahasiswa!' }, { status: 403 });

    const { judul, tanggal, kegiatan, link_bukti } = await request.json();

    if (!judul || !tanggal || !kegiatan || !link_bukti) {
      return NextResponse.json({ message: 'Semua data wajib diisi!' }, { status: 400 });
    }

    const newLogbook = await Logbook.create({
      mahasiswaId: decoded.id, 
      judul: judul, 
      tanggal: tanggal,
      kegiatan: kegiatan,
      link_dokumen: link_bukti, 
      status: 'Pending', 
    });

    return NextResponse.json({ message: 'Logbook berhasil disimpan!', data: newLogbook }, { status: 201 });
  } catch (error: any) {
    console.error("API POST Error:", error);
    return NextResponse.json({ message: `Gagal simpan ke database: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    if (decoded.role !== 'Dosen') {
      return NextResponse.json({ message: 'Hanya dosen yang bisa mereview logbook!' }, { status: 403 });
    }

    const body = await request.json();
    
    await Logbook.update({ 
      status: body.status, 
      feedback: body.catatan_dosen || null 
    }, { 
      where: { id: body.id } 
    });

    return NextResponse.json({ message: 'Status logbook diperbarui!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error server: ${error.message}` }, { status: 500 });
  }
}