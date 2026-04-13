import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';

// FUNGSI GET: Cek apakah mahasiswa sudah mendaftar magang
export async function GET() {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Cari pengajuan terbaru milik mahasiswa ini
    const pengajuan = await Pengajuan.findOne({
      where: { mahasiswaId: decoded.id },
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ data: pengajuan }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

// FUNGSI POST: Menyimpan pendaftaran magang baru
export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Mahasiswa') return NextResponse.json({ message: 'Hanya mahasiswa!' }, { status: 403 });

    const body = await request.json();
    // Menangkap 3 link dokumen baru
    const { perusahaan, posisi, jenis_magang, link_ktm, link_ktp, link_cv } = body;

    if (!perusahaan || !posisi || !jenis_magang || !link_ktm || !link_ktp || !link_cv) {
      return NextResponse.json({ message: 'Semua data dan dokumen wajib diisi!' }, { status: 400 });
    }

    const existingPengajuan = await Pengajuan.findOne({
      where: { mahasiswaId: decoded.id, status: ['Pending', 'Disetujui'] }
    });

    if (existingPengajuan) {
      return NextResponse.json({ message: 'Anda sudah memiliki pengajuan magang aktif.' }, { status: 409 });
    }

    // CATATAN: Pastikan di file src/models/Pengajuan.ts kamu sudah mengganti kolom 'link_dokumen' 
    // menjadi 'link_ktm', 'link_ktp', dan 'link_cv' yang bertipe DataTypes.STRING
    const newPengajuan = await Pengajuan.create({
      mahasiswaId: decoded.id,
      nama_mahasiswa: decoded.name,
      perusahaan,
      posisi,
      jenis_magang,
      link_ktm, // Menyimpan link KTM
      link_ktp, // Menyimpan link KTP
      link_cv,  // Menyimpan link CV
      status: 'Pending',
    });

    return NextResponse.json({ message: 'Pendaftaran magang berhasil dikirim!', data: newPengajuan }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: `Error Server: ${error.message}` }, { status: 500 });
  }
}