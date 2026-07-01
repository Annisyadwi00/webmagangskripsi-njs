import { NextResponse } from 'next/server';
import { connectDB, syncDatabase } from '@/lib/db';
import IndikatorPenilaian from '@/models/IndikatorPenilaian';
import { getCurrentUser } from '@/lib/auth';
import { SIDANG_CURRICULUMS } from '@/lib/sidang-curriculum';

const DEFAULT_DOSPEM_ITEMS = [
  { kode: 'kedisiplinan_bimbingan', label: 'Kedisiplinan bimbingan', bobot: 0, urutan: 1, tipe: 'dospem', aktif: true },
  { kode: 'relevansi_bidang', label: 'Relevansi bidang keahlian', bobot: 0, urutan: 2, tipe: 'dospem', aktif: true },
  { kode: 'penjelasan_isi', label: 'Penjelasan isi laporan', bobot: 0, urutan: 3, tipe: 'dospem', aktif: true },
  { kode: 'analisis', label: 'Analisis dalam laporan', bobot: 0, urutan: 4, tipe: 'dospem', aktif: true },
  { kode: 'kelengkapan_isi', label: 'Kelengkapan isi laporan', bobot: 0, urutan: 5, tipe: 'dospem', aktif: true },
  { kode: 'aspek_kebahasaan', label: 'Aspek kebahasaan', bobot: 0, urutan: 6, tipe: 'dospem', aktif: true },
  { kode: 'arahan_pembimbing', label: 'Kemampuan melaksanakan arahan pembimbing', bobot: 0, urutan: 7, tipe: 'dospem', aktif: true },
];

const DEFAULT_PENGUJI_ITEMS: Array<{ kode: string; label: string; bobot: number; urutan: number; tipe: string; aktif: boolean }> = [];
let urutanPenguji = 1;
SIDANG_CURRICULUMS.forEach((curr) => {
  curr.groups.forEach((group) => {
    group.items.forEach((item) => {
      DEFAULT_PENGUJI_ITEMS.push({
        kode: item.id,
        label: `[${curr.prodi} Sem ${curr.semester} - ${group.category}] ${item.code ? `${item.code}: ` : ''}${item.label}`,
        bobot: 0,
        urutan: urutanPenguji++,
        tipe: 'penguji',
        aktif: true,
      });
    });
  });
});

const DEFAULT_MITRA_ITEMS = [
  { kode: 'disiplin', label: 'Ketepatan waktu / disiplin', bobot: 5, urutan: 1, tipe: 'mitra', aktif: true },
  { kode: 'sikap_kerja', label: 'Sikap kerja / prosedur kerja', bobot: 5, urutan: 2, tipe: 'mitra', aktif: true },
  { kode: 'tanggungjawab', label: 'Tanggungjawab terhadap tugas', bobot: 5, urutan: 3, tipe: 'mitra', aktif: true },
  { kode: 'kehadiran', label: 'Kehadiran', bobot: 5, urutan: 4, tipe: 'mitra', aktif: true },
  { kode: 'patuh_aturan', label: 'Mematuhi aturan dan tata tertib magang', bobot: 5, urutan: 5, tipe: 'mitra', aktif: true },
  { kode: 'penampilan', label: 'Penampilan / kerapian', bobot: 5, urutan: 6, tipe: 'mitra', aktif: true },
  { kode: 'kemampuan_kerja', label: 'Kemampuan kerja', bobot: 5, urutan: 7, tipe: 'mitra', aktif: true },
  { kode: 'keterampilan_kerja', label: 'Keterampilan kerja', bobot: 5, urutan: 8, tipe: 'mitra', aktif: true },
  { kode: 'kualitas_hasil', label: 'Kualitas hasil kerja', bobot: 5, urutan: 9, tipe: 'mitra', aktif: true },
  { kode: 'komunikasi', label: 'Kemampuan berkomunikasi', bobot: 5, urutan: 10, tipe: 'mitra', aktif: true },
  { kode: 'kerjasama', label: 'Kerjasama', bobot: 5, urutan: 11, tipe: 'mitra', aktif: true },
  { kode: 'kerajinan', label: 'Kerajinan / inisiatif', bobot: 5, urutan: 12, tipe: 'mitra', aktif: true },
  { kode: 'percaya_diri', label: 'Memiliki rasa percaya diri', bobot: 5, urutan: 13, tipe: 'mitra', aktif: true },
  { kode: 'relevansi', label: 'Relevansi', bobot: 10, urutan: 14, tipe: 'mitra', aktif: true },
  { kode: 'isi_laporan', label: 'Isi laporan', bobot: 25, urutan: 15, tipe: 'mitra', aktif: true },
];

async function ensureSeeded(tipe: string) {
  try {
    await IndikatorPenilaian.sequelize?.query('ALTER TABLE indikator_penilaian MODIFY COLUMN label TEXT NOT NULL;');
  } catch (e) {
    // Abaikan jika sudah TEXT atau tabel belum dibuat
  }

  if (tipe === 'penguji') {
    const oldPengujiCount = await IndikatorPenilaian.count({
      where: { tipe: 'penguji', kode: 'kedisiplinan_bimbingan' },
    });
    if (oldPengujiCount > 0) {
      await IndikatorPenilaian.destroy({ where: { tipe: 'penguji' } });
    }
  }

  const count = await IndikatorPenilaian.count({ where: { tipe } });
  if (count === 0) {
    if (tipe === 'dospem') {
      await IndikatorPenilaian.bulkCreate(DEFAULT_DOSPEM_ITEMS);
    } else if (tipe === 'penguji') {
      await IndikatorPenilaian.bulkCreate(DEFAULT_PENGUJI_ITEMS);
    } else if (tipe === 'mitra') {
      await IndikatorPenilaian.bulkCreate(DEFAULT_MITRA_ITEMS);
    }
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    await syncDatabase();

    const { searchParams } = new URL(request.url);
    const tipe = searchParams.get('tipe');
    const aktifOnly = searchParams.get('aktifOnly') === 'true';

    if (tipe) {
      await ensureSeeded(tipe);
    } else {
      await ensureSeeded('dospem');
      await ensureSeeded('penguji');
      await ensureSeeded('mitra');
    }

    const whereClause: Record<string, unknown> = {};
    if (tipe) whereClause.tipe = tipe;
    if (aktifOnly) whereClause.aktif = true;

    const items = await IndikatorPenilaian.findAll({
      where: whereClause,
      order: [['urutan', 'ASC'], ['id', 'ASC']],
    });

    return NextResponse.json({ success: true, message: 'Berhasil mengambil indikator.', data: items }, { status: 200 });
  } catch (error) {
    console.error('Error GET /api/indikator-penilaian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data indikator penilaian.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== 'Admin' && user.role !== 'Super Admin')) {
      return NextResponse.json({ success: false, message: 'Akses ditolak. Harus Admin atau Super Admin.' }, { status: 403 });
    }

    await connectDB();
    await syncDatabase();

    const body = await request.json();
    const { tipe = 'dospem', label, bobot = 0, urutan, kode } = body;

    if (!label || !label.trim()) {
      return NextResponse.json({ success: false, message: 'Label / Judul indikator wajib diisi.' }, { status: 400 });
    }

    // Generate kode if not provided
    let finalKode = kode ? String(kode).trim() : '';
    if (!finalKode) {
      finalKode = label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '') + '_' + Math.floor(Math.random() * 8999 + 1000);
    }

    // If urutan is not specified, put it at the end
    let finalUrutan = Number(urutan);
    if (isNaN(finalUrutan) || !finalUrutan) {
      const maxUrutan = await IndikatorPenilaian.max('urutan', { where: { tipe } });
      finalUrutan = (typeof maxUrutan === 'number' ? maxUrutan : 0) + 1;
    }

    const newItem = await IndikatorPenilaian.create({
      tipe,
      kode: finalKode,
      label: label.trim(),
      bobot: Number(bobot) || 0,
      urutan: finalUrutan,
      aktif: true,
    });

    return NextResponse.json(
      { success: true, message: 'Indikator penilaian berhasil ditambahkan.', data: newItem },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error POST /api/indikator-penilaian:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan indikator penilaian.' },
      { status: 500 }
    );
  }
}
