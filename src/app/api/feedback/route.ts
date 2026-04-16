import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import Feedback from '@/models/Feedback';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback');
    if (decoded.role !== 'Admin') return NextResponse.json({ message: 'Hanya Admin!' }, { status: 403 });

    const messages = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
    return NextResponse.json({ data: messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const newFeedback = await Feedback.create({
      nama: body.nama, email: body.email, pesan: body.pesan
    });
    return NextResponse.json({ message: 'Pesan terkirim!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error: ${error.message}` }, { status: 500 });
  }
}

// Untuk Admin tandai sudah dibaca
export async function PUT(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    await Feedback.update({ status: 'Read' }, { where: { id: body.id } });
    return NextResponse.json({ message: 'Dibaca' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error server' }, { status: 500 });
  }
}