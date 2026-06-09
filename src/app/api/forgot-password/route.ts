import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || '').trim();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email wajib diisi.',
        },
        { status: 400 }
      );
    }

    if (!email.endsWith('@unsika.ac.id')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gunakan email institusi @unsika.ac.id.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Permintaan reset password berhasil diterima. Silakan hubungi admin/staff untuk reset password.',
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat memproses permintaan reset password.',
      },
      { status: 500 }
    );
  }
}