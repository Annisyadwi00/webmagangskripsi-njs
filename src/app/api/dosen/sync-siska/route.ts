import { NextResponse } from 'next/server';
import { QueryTypes } from 'sequelize';
import User from '@/models/User';
import { connectDB } from '@/lib/db';

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

const ALLOWED_DOSEN_NAMES = [
  'Aries Suharso',
  'Adhi Rizal',
  'Agung Susilo Yuda Irawan',
  'Ahmad Khusaeri',
  'Aji Primajaya',
  'Asep Jamaludin',
  'Azhari Ali Ridha',
  'Arip Solehudin',
  "Aziz Ma'shum",
  'Bagja Nugraha',
  'Betha Nurina Sari',
  'Billy Ibrahim H',
  'Budi Arif Darmawan',
  'Carudin',
  'Chaerur Rozikin',
  'Dadang Yusuf',
  'Didi Juardi',
  'Garno',
  'Haodudin Nurkifli',
  'Hannie',
  'Intan Purnamasari',
  'Iqbal Maulana',
  'Irfan Sriyono',
  'Jajam Haerul Jaman',
  'Mohamad Jajuli',
  'Nina Sulistiyowati',
  'Nono Heryana',
  'Oman Komarudin',
  'Purwantoro',
  'Rini Mayasari',
  'Siska',
  'Susilawati',
  'Sofi Defiyanti',
  'Taufik Ridwan',
  'Tesa Nur Padilah',
  'Ultach Enri',
  'Yuyun Umaidah',
  'Ratna Mufidah',
  'Kamal Prihandani',
  'Ade Andri Hendriadi',
  'Riza Ibnu Adam',
];

function normalizeName(name?: string | null) {
  return (name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

const allowedNameSet = new Set(
  ALLOWED_DOSEN_NAMES.map((name) => normalizeName(name))
);

function isAllowedDosenName(nama?: string | null) {
  if (!nama) return false;

  return allowedNameSet.has(normalizeName(nama));
}

function getProdiFromUnit(unit?: string | null) {
  if (!unit) return null;

  const normalized = unit.toLowerCase();

  if (normalized.includes('sistem informasi')) {
    return 'Sistem Informasi';
  }

  if (normalized.includes('informatika')) {
    return 'Teknik Informatika';
  }

  return null;
}

function getNimNidn(dosen: SiskaDosen) {
  if (dosen.nidn && dosen.nidn !== '0000000000') {
    return dosen.nidn;
  }

  if (dosen.nip) {
    return dosen.nip;
  }

  return '-';
}

export async function POST() {
  try {
    await connectDB();

    const sequelize = User.sequelize;

    if (!sequelize) {
      return NextResponse.json(
        {
          success: false,
          message: 'Koneksi database Sequelize tidak ditemukan.',
        },
        { status: 500 }
      );
    }

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
      isAllowedDosenName(dosen.nama)
    );

    let totalInsertedUser = 0;
    let totalUpdatedUser = 0;
    let totalInsertedDosen = 0;
    let totalUpdatedDosen = 0;
    let totalSkipped = 0;

    for (const dosen of filteredDosen) {
      if (!dosen.id || !dosen.email || !dosen.nama) {
        totalSkipped++;
        continue;
      }

      const existingUser = await User.findOne({
        where: {
          email: dosen.email,
        },
      });

      const payloadUser = {
        name: dosen.nama,
        email: dosen.email,
        role: 'Dosen',
        nim_nidn: getNimNidn(dosen),
        prodi: getProdiFromUnit(dosen.unit),
        semester: null,
        angkatan: null,
        kelas: null,
        kategori_dosen: dosen.jabatan || null,
        kuota_bimbingan: 5,
        phone: null,
      };

      if (existingUser) {
        await existingUser.update(payloadUser);
        totalUpdatedUser++;
      } else {
        await User.create({
          ...payloadUser,
          password: process.env.DEFAULT_DOSEN_PASSWORD || 'dosen12345',
        });

        totalInsertedUser++;
      }

      const existingDosen = await sequelize.query(
        `
          SELECT id
          FROM dosen
          WHERE id = :id
          LIMIT 1
        `,
        {
          replacements: {
            id: dosen.id,
          },
          type: QueryTypes.SELECT,
        }
      );

      if (existingDosen.length > 0) {
        await sequelize.query(
          `
            UPDATE dosen
            SET
              nidn = :nidn,
              nama_gelar = :nama_gelar,
              nip = :nip,
              nama = :nama,
              email = :email,
              jabatan = :jabatan,
              unit = :unit
            WHERE id = :id
          `,
          {
            replacements: {
              id: dosen.id,
              nidn: dosen.nidn,
              nama_gelar: dosen.nama_gelar,
              nip: dosen.nip,
              nama: dosen.nama,
              email: dosen.email,
              jabatan: dosen.jabatan,
              unit: dosen.unit,
            },
          }
        );

        totalUpdatedDosen++;
      } else {
        await sequelize.query(
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
            VALUES (
              :id,
              :nidn,
              :nama_gelar,
              :nip,
              :nama,
              :email,
              :jabatan,
              :unit
            )
          `,
          {
            replacements: {
              id: dosen.id,
              nidn: dosen.nidn,
              nama_gelar: dosen.nama_gelar,
              nip: dosen.nip,
              nama: dosen.nama,
              email: dosen.email,
              jabatan: dosen.jabatan,
              unit: dosen.unit,
            },
          }
        );

        totalInsertedDosen++;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Data dosen berhasil disinkronkan dari Siska berdasarkan daftar nama.',
      data: {
        totalFetched: allDosen.length,
        totalFiltered: filteredDosen.length,
        totalInsertedUser,
        totalUpdatedUser,
        totalInsertedDosen,
        totalUpdatedDosen,
        totalSkipped,
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
  }
}