import { NextResponse } from 'next/server';
import Job from '@/models/Job';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    // Menampilkan lowongan dari yang terbaru
    const jobs = await Job.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json({ data: jobs }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Buat lowongan baru
    const newJob = await Job.create({
      title: body.posisi,
      company: body.perusahaan,
      description: body.deskripsi,
      kategori: body.kategori,
      type: body.type,
      tipeKonversi: body.tipeKonversi,
      isPaid: body.isPaid,
      link_pendaftaran: body.link_pendaftaran,
      valid_until: body.valid_until || null,
      status: 'Pending' // Jika yang tambah mitra, status default pending
    });

    return NextResponse.json({ message: 'Lowongan berhasil dibuat', data: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, action } = body;

    if (action === 'approve') {
      await Job.update({ status: 'Aktif' }, { where: { id } });
    } else if (action === 'reject') {
      await Job.update({ status: 'Ditolak' }, { where: { id } });
    } else if (action === 'delete') {
      await Job.destroy({ where: { id } });
    } else if (action === 'edit') {
      // ---> FITUR BARU: EDIT LOWONGAN <---
      await Job.update({
        title: body.posisi,
        company: body.perusahaan,
        description: body.deskripsi,
        kategori: body.kategori,
        type: body.type,
        tipeKonversi: body.tipeKonversi,
        isPaid: body.isPaid,
        link_pendaftaran: body.link_pendaftaran,
        valid_until: body.valid_until || null,
      }, { where: { id } });
    } else {
      return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Proses berhasil dilakukan' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}