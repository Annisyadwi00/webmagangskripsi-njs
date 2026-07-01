import { NextResponse } from 'next/server';
import { connectDB, syncDatabase } from '@/lib/db';
import IndikatorPenilaian from '@/models/IndikatorPenilaian';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Harus Admin atau Super Admin.' }, { status: 403 });
    }

    await connectDB();
    await syncDatabase();

    const { id } = await params;
    const item = await IndikatorPenilaian.findByPk(id);

    if (!item) {
      return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan.' }, { status: 404 });
    }

    const body = await request.json();
    const { label, bobot, urutan, aktif, kode } = body;

    if (label !== undefined) item.label = String(label).trim();
    if (bobot !== undefined) item.bobot = Number(bobot) || 0;
    if (urutan !== undefined) item.urutan = Number(urutan) || 1;
    if (aktif !== undefined) item.aktif = Boolean(aktif);
    if (kode !== undefined && String(kode).trim()) item.kode = String(kode).trim();

    await item.save();

    return NextResponse.json(
      { success: true, message: 'Indikator penilaian berhasil diperbarui.', data: item },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error PUT /api/indikator-penilaian/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal memperbarui indikator penilaian.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Harus Admin atau Super Admin.' }, { status: 403 });
    }

    await connectDB();
    await syncDatabase();

    const { id } = await params;
    const item = await IndikatorPenilaian.findByPk(id);

    if (!item) {
      return NextResponse.json({ success: false, message: 'Indikator tidak ditemukan.' }, { status: 404 });
    }

    await item.destroy();

    return NextResponse.json(
      { success: true, message: 'Indikator penilaian berhasil dihapus.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error DELETE /api/indikator-penilaian/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus indikator penilaian.' },
      { status: 500 }
    );
  }
}
