import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

type SiskaDosen = {
  id: string;
  nidn: string | null;
  nama_gelar: string | null;
  nip: string | null;
  nama: string | null;
  email: string | null;
  jabatan: string | null;
  unit: string | null;
};

type SiskaResponse = {
  success: boolean;
  message: string;
  data: SiskaDosen[][];
};

function isAllowedUnit(unit?: string | null) {
  if (!unit) return false;

  const normalized = unit.toLowerCase();

  return (
    normalized.includes('teknik informatika') ||
    normalized.includes('sistem informasi')
  );
}

export async function POST() {
  let connection: mysql.Connection | null = null;

  try {
    const response = await fetch('https://siska.unsika.ac.id/api/dosen', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.SISKA_API_TOKEN}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: `Gagal mengambil data dari Siska. Status: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result = (await response.json()) as SiskaResponse;

    if (!result.success || !Array.isArray(result.data)) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || 'Format response Siska tidak valid.',
        },
        { status: 400 }
      );
    }

    const allDosen = result.data.flat();

    const filteredDosen = allDosen.filter((dosen) =>
      isAllowedUnit(dosen.unit)
    );

    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    let totalInserted = 0;

    for (const dosen of filteredDosen) {
      await connection.execute(
        `
          INSERT INTO dosen (
            id,
            nidn,
            nama_gelar,
            nip,
            nama,
            email,
            jabatan,
            unit
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            nidn = VALUES(nidn),
            nama_gelar = VALUES(nama_gelar),
            nip = VALUES(nip),
            nama = VALUES(nama),
            email = VALUES(email),
            jabatan = VALUES(jabatan),
            unit = VALUES(unit)
        `,
        [
          dosen.id,
          dosen.nidn,
          dosen.nama_gelar,
          dosen.nip,
          dosen.nama,
          dosen.email,
          dosen.jabatan,
          dosen.unit,
        ]
      );

      totalInserted++;
    }

    return NextResponse.json({
      success: true,
      message: 'Data dosen berhasil disinkronkan.',
      data: {
        totalFetched: allDosen.length,
        totalFiltered: filteredDosen.length,
        totalInserted,
      },
    });
  } catch (error) {
    console.error('SYNC_DOSEN_SISKA_ERROR:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan saat sinkronisasi data dosen.',
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}