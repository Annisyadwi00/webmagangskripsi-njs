import { NextResponse } from 'next/server';

type KampusMahasiswaRaw = Record<string, unknown>;

function getString(data: KampusMahasiswaRaw, keys: string[]) {
  for (const key of keys) {
    const value = data[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return '';
}

function normalizeMahasiswa(data: KampusMahasiswaRaw) {
  return {
    npm: getString(data, ['npm', 'nim', 'NPM', 'NIM']),
    nama: getString(data, ['nama', 'name', 'nama_mahasiswa', 'Nama']),
    email: getString(data, ['email', 'email_kampus', 'Email']),
    prodi: getString(data, ['prodi', 'program_studi', 'jurusan', 'Program Studi']),
    angkatan: getString(data, ['angkatan', 'tahun_masuk', 'Angkatan']),
    semester: getString(data, ['semester', 'Semester']),
    kelas: getString(data, ['kelas', 'Kelas']),
    no_hp: getString(data, ['no_hp', 'phone', 'nomor_hp', 'wa', 'whatsapp']),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const npm = searchParams.get('npm')?.trim();

    if (!npm) {
      return NextResponse.json(
        {
          success: false,
          message: 'NPM wajib dikirim.',
        },
        { status: 400 }
      );
    }

    const apiUrl = process.env.KAMPUS_MAHASISWA_API_URL;
    const apiToken = process.env.KAMPUS_API_TOKEN;

    if (!apiUrl || !apiToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Konfigurasi API kampus belum lengkap. Cek KAMPUS_MAHASISWA_API_URL dan KAMPUS_API_TOKEN.',
        },
        { status: 500 }
      );
    }

  const kampusUrl = apiUrl.includes('{npm}')
  ? apiUrl.replace('{npm}', encodeURIComponent(npm))
  : `${apiUrl}${apiUrl.includes('?') ? '&' : '?'}npm=${encodeURIComponent(npm)}`;

const response = await fetch(kampusUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal mengambil data mahasiswa dari API kampus.',
          data: result,
        },
        { status: response.status }
      );
    }

    const rawData = Array.isArray(result)
      ? result[0]
      : result?.data
        ? Array.isArray(result.data)
          ? result.data[0]
          : result.data
        : result;

    if (!rawData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Data mahasiswa tidak ditemukan.',
        },
        { status: 404 }
      );
    }

    const mahasiswa = normalizeMahasiswa(rawData);

    if (!mahasiswa.npm && !mahasiswa.nama) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Data mahasiswa berhasil diterima, tetapi format response API kampus belum sesuai mapping.',
          data: result,
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data mahasiswa berhasil diambil.',
      data: mahasiswa,
    });
  } catch (error) {
    console.error('KAMPUS_MAHASISWA_API_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat menghubungi API kampus.',
      },
      { status: 500 }
    );
  }
}