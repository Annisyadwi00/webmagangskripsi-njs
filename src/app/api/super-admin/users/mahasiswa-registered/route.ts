import { NextResponse } from 'next/server';
import sequelize from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  try {
    await sequelize.authenticate();

    const users = await User.findAll({
      where: {
        role: 'Mahasiswa',
      },
      attributes: {
        exclude: ['password'],
      },
      order: [['id', 'DESC']],
    });

    const data = users.map((user) => {
      const item = user.toJSON() as {
        id: number;
        name?: string;
        email?: string;
        nim_nidn?: string | null;
        prodi?: string | null;
        angkatan?: string | null;
        kelas?: string | null;
        phone?: string | null;
        status?: string | null;
        created_at?: string | null;
        createdAt?: string | null;
      };

      return {
        id: item.id,
        name: item.name || '',
        email: item.email || '',
        nim_nidn: item.nim_nidn || '',
        prodi: item.prodi || '',
        angkatan: item.angkatan || '',
        kelas: item.kelas || '',
        phone: item.phone || '',
        status: item.status || 'Aktif',
        created_at: item.created_at || item.createdAt || null,
      };
    });
  }
}