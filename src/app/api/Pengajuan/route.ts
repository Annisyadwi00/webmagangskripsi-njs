import { NextResponse } from 'next/server';
import Pengajuan from '@/models/Pengajuan';
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
      data = await Pengajuan.findAll({ order: [['createdAt', 'DESC']] });
    } else if (decoded.role === 'Mahasiswa') {
      data = await Pengajuan.findAll({ where: { mahasiswaId: decoded.id }, order: [['createdAt', 'DESC']] });
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

    const { perusahaan, posisi, link_loa } = await request.json();

    if (!perusahaan || !posisi || !link_loa) {
      return NextResponse.json({ message: 'Perusahaan, Posisi, dan Link LOA wajib diisi!' }, { status: 400 });
    }

    const existingPengajuan = await Pengajuan.findOne({
      where: { mahasiswaId: decoded.id, status: ['Menunggu_Verifikasi', 'Pilih_Dosen', 'Aktif'] }
    });

    if (existingPengajuan) {
      return NextResponse.json({ message: 'Anda sudah memiliki proses magang yang sedang berjalan.' }, { status: 409 });
    }
    
    const newPengajuan = await Pengajuan.create({
      mahasiswaId: decoded.id,
      nama_mahasiswa: decoded.name,
      perusahaan: perusahaan, 
      posisi: posisi,
      link_loa: link_loa,
      status: 'Menunggu_Verifikasi', 
    });

    return NextResponse.json({ message: 'LOA berhasil dikirim!', data: newPengajuan }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error Server: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const body = await request.json();
    
    if (decoded.role === 'Mahasiswa') {
      if (body.action === 'pilih_dosen') {
        await Pengajuan.update(
          { dosenId: body.dosenId, nama_dosen: body.nama_dosen, status: 'Aktif' }, 
          { where: { mahasiswaId: decoded.id, status: 'Pilih_Dosen' } }
        );
        return NextResponse.json({ message: 'Berhasil memilih dosen pembimbing!' }, { status: 200 });
      }
      if (body.link_laporan_akhir) {
        await Pengajuan.update({ link_laporan_akhir: body.link_laporan_akhir }, { where: { mahasiswaId: decoded.id } });
        return NextResponse.json({ message: 'Laporan disimpan!' }, { status: 200 });
      }
    } 
    else if (decoded.role === 'Admin') {
      if (body.action === 'setujui') {
        await Pengajuan.update({
          tipeKonversi: body.tipeKonversi,
          matkulKonversi: JSON.stringify(body.matkulKonversi),
          status: 'Pilih_Dosen'
        }, { where: { id: body.id } });
        return NextResponse.json({ message: 'Pengajuan disetujui!' }, { status: 200 });
      }
      if (body.action === 'tolak') {
        await Pengajuan.destroy({ where: { id: body.id } });
        return NextResponse.json({ message: 'Pengajuan ditolak.' }, { status: 200 });
      }
    }
    else if (decoded.role === 'Dosen') {
      if (body.action === 'terima') {
        await Pengajuan.update({ status_dosen: 'Disetujui' }, { where: { id: body.id_pengajuan } });
        return NextResponse.json({ message: 'Bimbingan disetujui!' }, { status: 200 });
      } else if (body.action === 'tolak') {
        await Pengajuan.update({ status_dosen: 'Ditolak', dosenId: null, nama_dosen: null, status: 'Pilih_Dosen' }, { where: { id: body.id_pengajuan } });
        return NextResponse.json({ message: 'Bimbingan ditolak.' }, { status: 200 });
      } 
      if (body.nilai_dari_dosen) {
        await Pengajuan.update({ nilai_dari_dosen: body.nilai_dari_dosen }, { where: { id: body.id_pengajuan } });
        return NextResponse.json({ message: 'Nilai diberikan!' }, { status: 200 });
      }
    }
    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}