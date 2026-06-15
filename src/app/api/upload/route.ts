import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // 1. Dapatkan user yang sedang login
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    // 2. Ambil file dari form-data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diupload' }, { status: 400 });
    }

    // 3. Validasi tipe file (hanya PDF)
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Hanya file PDF yang diperbolehkan' }, { status: 400 });
    }

    // 4. Simpan file ke disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/\s/g, '_');
    const fileName = `${timestamp}_${safeFileName}`;
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);
    const url = `/uploads/${fileName}`;

    // 5. Simpan metadata ke tabel uploads menggunakan connectDB

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload file' },
      { status: 500 }
    );
  }
}

// Tangani method lain dengan 405
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}