import { NextResponse } from 'next/server';
import User from '@/models/User';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';

// --- PASTE KODE GET KAMU DI BAWAH INI ---
export async function GET() {
  try {
    await connectDB();
    // Tarik semua user yang perannya adalah 'Dosen' beserta kuotanya
    const dosenList = await User.findAll({
      where: { role: 'Dosen' },
      attributes: ['id', 'name', 'email', 'nim_nidn', 'kategori_dosen', 'kuota_bimbingan']
    });

    // Hitung beban mahasiswa aktif untuk masing-masing dosen
    const dosenWithLoad = await Promise.all(dosenList.map(async (dosen) => {
      const count = await Pengajuan.count({
        where: { 
          dosenId: dosen.id, 
          status: ['Pilih_Dosen', 'Aktif'] 
        } 
      });
      return { ...dosen.toJSON(), current_load: count };
    }));

    return NextResponse.json({ data: dosenWithLoad }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data dosen' }, { status: 500 });
  }
}