import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Job from '@/models/Job';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies(); 
    const token = cookieStore.get('auth_token')?.value;
    let isAdmin = false;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role === 'Admin') isAdmin = true;
      } catch (e) {}
    }

    const whereClause = isAdmin ? {} : { status: 'Aktif' };
    const jobs = await Job.findAll({ where: whereClause, order: [['createdAt', 'DESC']] });
    return NextResponse.json({ data: jobs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    let isAdmin = false;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        if (decoded.role === 'Admin') isAdmin = true;
      } catch (e) {}
    }

    const body = await request.json();
    const newJob = await Job.create({
      company: body.perusahaan,
      title: body.posisi,
      description: body.deskripsi,
      kuota: body.kuota ? parseInt(body.kuota) : 1,
      location: body.location || 'Menyesuaikan',
      type: body.type || 'Onsite',
      isKonversi: body.isKonversi === 'Ya',
      isPaid: body.isPaid === 'Ya',
      valid_until: body.valid_until || null,
      email_perusahaan: body.email_perusahaan || null,
      link_pendaftaran: body.link_pendaftaran || null,
      status: isAdmin ? 'Aktif' : 'Pending'
    });

    return NextResponse.json({ message: 'Lowongan berhasil disimpan!', data: newJob }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback');
    if (decoded.role !== 'Admin') return NextResponse.json({ message: 'Hanya Admin!' }, { status: 403 });

    const body = await request.json();
    const { id, action } = body;

    if (action === 'approve') {
      await Job.update({ status: 'Aktif' }, { where: { id } });
      return NextResponse.json({ message: 'Lowongan tayang!' }, { status: 200 });
    } else if (action === 'reject' || action === 'delete') {
      await Job.destroy({ where: { id } });
      return NextResponse.json({ message: 'Lowongan dihapus!' }, { status: 200 });
    }
    return NextResponse.json({ message: 'Aksi tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}