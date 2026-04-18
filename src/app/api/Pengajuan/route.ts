import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';

// ==========================================
// 1. FUNGSI GET (Membaca Data)
// ==========================================
export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    if (decoded.role === 'Mahasiswa') {
      const pengajuan = await Pengajuan.findOne({ where: { mahasiswaId: decoded.id }, order: [['createdAt', 'DESC']] });
      return NextResponse.json({ data: pengajuan }, { status: 200 });
    } 
    // DOSEN: Hanya ambil mahasiswa yang memilih dia sebagai dospem
    else if (decoded.role === 'Dosen') {
      const bimbingan = await Pengajuan.findAll({ where: { dosenId: decoded.id }, order: [['createdAt', 'DESC']] });
      return NextResponse.json({ data: bimbingan }, { status: 200 });
    }
    // ADMIN: Lihat semua
    else if (decoded.role === 'Admin') {
      const semua = await Pengajuan.findAll({ order: [['createdAt', 'DESC']] });
      return NextResponse.json({ data: semua }, { status: 200 });
    }
    return NextResponse.json({ message: 'Role tidak valid' }, { status: 403 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}

// ==========================================
// 2. FUNGSI POST (Submit LOA Mahasiswa)
// ==========================================
export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    if (decoded.role !== 'Mahasiswa') return NextResponse.json({ message: 'Hanya mahasiswa!' }, { status: 403 });

    const body = await request.json();
    // Sesuaikan dengan data yang dikirim dari UI LOA Mahasiswa
    const { nama_perusahaan, posisi, link_loa } = body; 

    if (!nama_perusahaan || !posisi || !link_loa) {
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
      perusahaan: nama_perusahaan,
      posisi: posisi,
      link_loa: link_loa,
      status: 'Menunggu_Verifikasi', // Langsung masuk tahap 2
    });

    return NextResponse.json({ message: 'LOA berhasil dikirim!', data: newPengajuan }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: `Error Server: ${error.message}` }, { status: 500 });
  }
}

// ==========================================
// 3. FUNGSI PUT (Mengupdate Data / Laporan / Nilai)
// ==========================================
export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    const body = await request.json();
    
    if (decoded.role === 'Mahasiswa') {
      const { id_pengajuan, link_laporan_akhir, evaluasi_dari_mahasiswa } = body;
      await Pengajuan.update({ link_laporan_akhir, evaluasi_dari_mahasiswa }, { where: { id: id_pengajuan, mahasiswaId: decoded.id } });
      return NextResponse.json({ message: 'Laporan disimpan!' }, { status: 200 });
    } 
    else if (decoded.role === 'Dosen') {
      const { id_pengajuan, action, nilai_dari_dosen } = body;
      
      // Logika Dosen Terima/Tolak Bimbingan
      if (action === 'terima') {
        await Pengajuan.update({ status_dosen: 'Disetujui' }, { where: { id: id_pengajuan } });
        return NextResponse.json({ message: 'Bimbingan disetujui!' }, { status: 200 });
      } else if (action === 'tolak') {
        await Pengajuan.update({ status_dosen: 'Ditolak', dosenId: null, nama_dosen: null }, { where: { id: id_pengajuan } });
        return NextResponse.json({ message: 'Bimbingan ditolak.' }, { status: 200 });
      } 
      // Logika Dosen Ngasih Nilai
      else if (nilai_dari_dosen) {
        await Pengajuan.update({ nilai_dari_dosen }, { where: { id: id_pengajuan } });
        return NextResponse.json({ message: 'Nilai diberikan!' }, { status: 200 });
      }
    }
    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server.' }, { status: 500 });
  }
}