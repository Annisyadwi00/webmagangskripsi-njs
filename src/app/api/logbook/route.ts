import { NextResponse } from 'next/server';
import Logbook from '@/models/Logbook';
import { connectDB } from '@/lib/db';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';



export async function GET(request: Request) {
  try {
    await connectDB();
   
    // ---> MANTRA SAKTI: Paksa sinkronisasi kolom baru ke MySQL <---
    await Logbook.sync({ alter: true });
   
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
   
    if (!token) {
      return NextResponse.json({ message: 'Akses ditolak' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
   
    // PERBAIKAN DI SINI: Deklarasi tipe eksplisit agar TypeScript tidak bingung
    let data: any[] = []; 
    
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

    if (!token) {
      return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Mahasiswa') {
      return NextResponse.json({ message: 'Hanya mahasiswa!' }, { status: 403 });
    }

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
   
    if (!token) {
      return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    }
   
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const body = await request.json();
   
    // --- LOGIKA UNTUK DOSEN MEMBERIKAN KOMENTAR/ACC ---
    if (decoded.role === 'Dosen') {
      if (body.action === 'evaluasi') {
        await Logbook.update({ 
          status: body.status, // 'Disetujui' atau 'Revisi'
          komentar_dosen: body.komentar_dosen 
        }, { 
          where: { id: body.logbook_id } 
        });
        return NextResponse.json({ message: 'Evaluasi logbook berhasil disimpan!' }, { status: 200 });
      }
    }

    // --- LOGIKA UNTUK MAHASISWA MEMPERBAIKI LOGBOOK ---
    if (decoded.role === 'Mahasiswa') {
      // Jika mahasiswa mengirim ulang logbook yang direvisi, ubah status kembali jadi 'Menunggu'
      await Logbook.update({
        kegiatan: body.kegiatan,
        jam_mulai: body.jam_mulai,
        jam_selesai: body.jam_selesai,
        bukti_kegiatan: body.bukti_kegiatan || null,
        status: 'Menunggu' // <--- Reset ke Menunggu agar dosen tahu sudah diperbaiki
      }, {
        where: { id: body.logbook_id, user_id: decoded.id }
      });
      return NextResponse.json({ message: 'Logbook berhasil diperbarui!' }, { status: 200 });
    }
   
    // UPDATE DATA: Menyimpan status, catatan dari dosen, dan juga NILAI ANGKA
    await Logbook.update({
      status: body.status,
      catatan_dosen: body.catatan_dosen || null,
      nilai: body.nilai || null
    }, {
      where: { id: body.id }
    });

    return NextResponse.json({ message: 'Status dan nilai logbook diperbarui!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error server: ${error.message}` }, { status: 500 });
  }
}
