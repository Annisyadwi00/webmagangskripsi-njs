import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Job from '@/models/Job';
import { connectDB } from '@/lib/db';

// FUNGSI GET: Mengambil daftar lowongan magang
export async function GET() {
  try {
    await connectDB();

    // Cek apakah tabel jobs masih kosong
    const count = await Job.count();
    
    // Jika kosong, kita suntikkan data dummy awal (Seeding otomatis)
    if (count === 0) {
      await Job.bulkCreate([
        {
          title: 'Frontend Developer Intern',
          company: 'PT Digital Teknologi Indonesia',
          description: 'Membantu pengembangan antarmuka website menggunakan React.js dan Next.js. Membutuhkan pemahaman dasar HTML, CSS, dan JavaScript.',
          location: 'Jakarta Selatan (Hybrid)',
          type: 'Hybrid',
          isKonversi: true,
        },
        {
          title: 'Data Analyst Intern',
          company: 'DataVision Analytics',
          description: 'Membersihkan dan menganalisis dataset perusahaan untuk menghasilkan insight bisnis. Familiar dengan Python, SQL, dan Tableau.',
          location: 'Bandung (Onsite)',
          type: 'Onsite',
          isKonversi: true,
        },
        {
          title: 'UI/UX Design Intern',
          company: 'Creative Studio Jkt',
          description: 'Merancang wireframe, prototype, dan user interface menggunakan Figma. Berkolaborasi dengan tim developer.',
          location: 'Remote',
          type: 'Remote',
          isKonversi: false,
        }
      ]);
    }

    // Ambil semua data lowongan
    const jobs = await Job.findAll({
      order: [['createdAt', 'DESC']]
    });

    return NextResponse.json({ data: jobs }, { status: 200 });
  } catch (error) {
    console.error('Fetch Jobs Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

// FUNGSI POST: Menambahkan lowongan baru (Khusus Admin)
export async function POST(request: Request) {
  try {
    await connectDB();
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return NextResponse.json({ message: 'Akses ditolak!' }, { status: 401 });

    const secretKey = process.env.JWT_SECRET || 'fallback_secret';
    const decoded: any = jwt.verify(token, secretKey);

    // Hanya Admin yang boleh memposting lowongan
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ message: 'Hanya Admin yang dapat memposting lowongan!' }, { status: 403 });
    }

    const body = await request.json();
    const { title, company, description, location, type, isKonversi } = body;

    const newJob = await Job.create({
      title, company, description, location, type, isKonversi
    });

    return NextResponse.json(
      { message: 'Lowongan berhasil ditambahkan!', data: newJob },
      { status: 201 }
    );
  } catch (error) {
    console.error('Post Job Error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}