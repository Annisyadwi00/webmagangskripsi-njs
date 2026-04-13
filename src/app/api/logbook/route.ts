import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Logbook from '@/models/Logbook';
import { connectDB } from '@/lib/db';

// FUNGSI GET: Mengambil data logbook
export async function GET(request: Request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const secretKey = process.env.JWT_SECRET || 'fallback_secret';
    const decoded: any = jwt.verify(token, secretKey);

    let logbooks;

    // Jika yang login DOSEN / ADMIN, tampilkan SEMUA logbook (Untuk skripsi ini kita buat simpel dulu)
    if (decoded.role === 'Dosen' || decoded.role === 'Admin') {
      logbooks = await Logbook.findAll({
        order: [['tanggal', 'DESC']]
      });
    } else {
      // Jika MAHASISWA, tampilkan miliknya saja
      logbooks = await Logbook.findAll({
        where: { mahasiswaId: decoded.id },
        order: [['tanggal', 'DESC']]
      });
    }

    return NextResponse.json({ data: logbooks }, { status: 200 });
  } catch (error) {
    console.error('Fetch Logbook Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// FUNGSI POST: Menyimpan data logbook baru (Tetap sama seperti sebelumnya)
export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Mahasiswa') return NextResponse.json({ message: 'Hanya mahasiswa!' }, { status: 403 });

    const body = await request.json();
    const { tanggal, jam_kerja, kegiatan, link_dokumen } = body;

    if (!tanggal || !jam_kerja || !kegiatan || !link_dokumen) {
      return NextResponse.json({ message: 'Semua kolom wajib diisi!' }, { status: 400 });
    }

    const newLogbook = await Logbook.create({
      mahasiswaId: decoded.id,
      tanggal, jam_kerja: parseInt(jam_kerja), kegiatan, link_dokumen, status: 'Pending',
    });

    return NextResponse.json({ message: 'Logbook ditambahkan!', data: newLogbook }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// FUNGSI PUT: Dosen menyetujui / menolak logbook
export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Pastikan hanya Dosen atau Admin yang bisa mereview
    if (decoded.role !== 'Dosen' && decoded.role !== 'Admin') {
      return NextResponse.json({ message: 'Hanya dosen yang dapat mereview!' }, { status: 403 });
    }

    const body = await request.json();
    const { logbookId, status, feedback } = body;

    const logbook: any = await Logbook.findByPk(logbookId);
    if (!logbook) {
      return NextResponse.json({ message: 'Logbook tidak ditemukan!' }, { status: 404 });
    }

    // Update data di database
    logbook.status = status;
    logbook.feedback = feedback || null;
    await logbook.save();

    return NextResponse.json({ message: `Logbook berhasil ${status}!`, data: logbook }, { status: 200 });

  } catch (error) {
    console.error('Update Logbook Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}