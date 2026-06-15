import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import busboy from 'busboy';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

const allowedJenisMagang = [
  'Konversi 20 SKS',
  'Tidak Konversi',
  'Konversi 2 SKS',
];

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}

function isValidScore(value: unknown) {
  const score = Number(value);
  return Number.isInteger(score) && score >= 0 && score <= 100;
}

function isValidDate(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function normalizeDate(value: string) {
  return new Date(`${value}T00:00:00`);
}

function isSistemInformasi(prodi?: string | null) {
  return String(prodi || '').toLowerCase().includes('sistem informasi');
}

function getJenisMagangLabel(value?: string | null) {
  if (value === 'Konversi 20 SKS') return 'Konversi Maksimal 20 SKS';
  if (value === 'Konversi 2 SKS') return 'Magang 2 SKS Khusus SI';
  if (value === 'Tidak Konversi') return 'Tidak Konversi';
  return value || '-';
}

function isStaffRole(role?: string | null) {
  return role === 'Admin' || role === 'Super Admin';
}

// ==================== FUNGSI PARSING FORM-DATA ====================
async function parseFormData(request: Request): Promise<{
  fields: Record<string, string>;
  files: Record<string, File>;
}> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('multipart/form-data')) {
    throw new Error('Content-Type harus multipart/form-data');
  }

  const body = await request.arrayBuffer();
  const buffer = Buffer.from(body);

  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: { 'content-type': contentType } });
    const fields: Record<string, string> = {};
    const files: Record<string, File> = {};

    bb.on('field', (name, value) => {
      fields[name] = value;
    });

    bb.on('file', (name, file, info) => {
      const chunks: Buffer[] = [];
      file.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      file.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const fileObj = new File([buffer], info.filename, { type: info.mimeType });
        files[name] = fileObj;
      });
    });

    bb.on('close', () => {
      resolve({ fields, files });
    });

    bb.on('error', (err) => reject(err));
    bb.end(buffer);
  });
}

async function saveFile(file: File, prefix: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), 'public/uploads/pengajuan');
  await mkdir(uploadDir, { recursive: true });

  const timestamp = Date.now();
  const safeName = `${prefix}_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const filePath = path.join(uploadDir, safeName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/pengajuan/${safeName}`;
}

// ==================== GET ====================
export async function GET(request: Request) {
  try {
    await connectDB();

    if (!Pengajuan) {
      console.error('Model Pengajuan tidak ditemukan');
      return NextResponse.json(
        { success: false, message: 'Konfigurasi server error: model tidak tersedia.' },
        { status: 500 }
      );
    }

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    if (!['Super Admin', 'Admin', 'Dosen', 'Mahasiswa'].includes(user.role)) {
      return NextResponse.json(
        { success: false, message: 'Role tidak valid.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveNumber(searchParams.get('page'), 1);
    const requestedLimit = parsePositiveNumber(searchParams.get('limit'), 10);
    const limit = Math.min(requestedLimit, 50);
    const offset = (page - 1) * limit;

    let where: any = undefined;
    if (user.role === 'Mahasiswa') {
      where = { user_id: user.id };
    } else if (user.role === 'Dosen') {
      const attributes = Object.keys(Pengajuan.getAttributes());
      if (attributes.includes('dosenId')) {
        where = { dosenId: user.id };
      } else {
        console.warn('Kolom dosenId tidak ditemukan di model Pengajuan');
        where = { id: null };
      }
    }

    const result = await Pengajuan.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Data pengajuan berhasil dimuat.',
        data: {
          items: result.rows,
          meta: {
            total: result.count,
            page,
            limit,
            totalPages: Math.ceil(result.count / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET_PENGAJUAN_ERROR DETAIL:', error);
    const errorMessage =
      process.env.NODE_ENV === 'development'
        ? error instanceof Error
          ? error.message
          : 'Unknown error'
        : 'Terjadi kesalahan server.';

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// ==================== POST ====================
export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak.' },
        { status: 401 }
      );
    }

    if (user.role !== 'Mahasiswa') {
      return NextResponse.json(
        { success: false, message: 'Hanya mahasiswa yang dapat mengajukan magang.' },
        { status: 403 }
      );
    }

    // Parse multipart form-data
    let fields: Record<string, string>;
    let files: Record<string, File>;
    try {
      const parsed = await parseFormData(request);
      fields = parsed.fields;
      files = parsed.files;
    } catch (err) {
      return NextResponse.json(
        { success: false, message: 'Gagal memproses form data. Pastikan menggunakan multipart/form-data.' },
        { status: 400 }
      );
    }

    const nama_mahasiswa = fields.nama_mahasiswa?.trim() || user.name;
    const npm = fields.npm?.trim() || null;
    const program_studi = fields.program_studi?.trim() || null;
    const angkatan = fields.angkatan?.trim() || null;
    const semester = fields.semester?.trim() || null;
    const kelas = fields.kelas?.trim() || null;

    const jenis_magang = fields.jenis_magang?.trim();
    const no_hp_mahasiswa = fields.no_hp_mahasiswa?.trim();
    const perusahaan = fields.perusahaan?.trim();
    const posisi = fields.posisi?.trim() || 'Peserta Magang';
    const alamat_tempat_magang = fields.alamat_tempat_magang?.trim();
    const nama_penanggung_jawab = fields.nama_penanggung_jawab?.trim() || 'Belum diisi';
    const kontak_penanggung_jawab = fields.kontak_penanggung_jawab?.trim() || no_hp_mahasiswa;
    const latitude = fields.latitude?.trim() || null;
    const longitude = fields.longitude?.trim() || null;
    const rencana_magang = fields.rencana_magang?.trim();
    const tgl_mulai = fields.tgl_mulai;
    const tgl_berakhir = fields.tgl_berakhir;

    // Validasi field mandatory
    if (
      !nama_mahasiswa ||
      !npm ||
      !program_studi ||
      !jenis_magang ||
      !no_hp_mahasiswa ||
      !perusahaan ||
      !alamat_tempat_magang ||
      !tgl_mulai ||
      !tgl_berakhir ||
      !rencana_magang
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama, NPM, program studi, jenis magang, nomor HP, tempat magang, alamat, tanggal, dan rencana magang wajib diisi.',
        },
        { status: 400 }
      );
    }

    // Validasi file PDF
    const buktiFile = files['bukti_penerimaan'];
    const fotoFile = files['foto_diri'];

    if (!buktiFile || buktiFile.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'File bukti penerimaan (PDF) wajib diunggah.' },
        { status: 400 }
      );
    }
    if (!fotoFile || fotoFile.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, message: 'File foto diri (PDF) wajib diunggah.' },
        { status: 400 }
      );
    }

    // Upload files
    let buktiUrl: string, fotoUrl: string;
    try {
      buktiUrl = await saveFile(buktiFile, 'bukti');
      fotoUrl = await saveFile(fotoFile, 'foto');
    } catch (err) {
      console.error('Upload file error:', err);
      return NextResponse.json(
        { success: false, message: 'Gagal menyimpan file. Coba lagi.' },
        { status: 500 }
      );
    }

    // Validasi jenis magang
    if (!allowedJenisMagang.includes(jenis_magang)) {
      return NextResponse.json(
        { success: false, message: 'Jenis magang tidak valid.' },
        { status: 400 }
      );
    }

    if (jenis_magang === 'Konversi 2 SKS' && !isSistemInformasi(program_studi)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Magang 2 SKS Khusus SI hanya tersedia untuk mahasiswa Sistem Informasi.',
        },
        { status: 400 }
      );
    }

    const phoneRegex = /^62\d{8,15}$/;
    if (!phoneRegex.test(no_hp_mahasiswa)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor HP mahasiswa harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    if (kontak_penanggung_jawab && !phoneRegex.test(kontak_penanggung_jawab)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Nomor kontak penanggung jawab harus diawali 62 dan hanya berisi angka. Contoh: 6285456123.',
        },
        { status: 400 }
      );
    }

    if (!isValidDate(tgl_mulai) || !isValidDate(tgl_berakhir)) {
      return NextResponse.json(
        { success: false, message: 'Format tanggal mulai atau tanggal berakhir tidak valid.' },
        { status: 400 }
      );
    }

    const tanggalMulai = normalizeDate(tgl_mulai);
    const tanggalBerakhir = normalizeDate(tgl_berakhir);
    if (tanggalBerakhir < tanggalMulai) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tanggal berakhir magang tidak boleh lebih awal dari tanggal mulai.',
        },
        { status: 400 }
      );
    }

    // Cek pengajuan aktif yang sudah ada
    const existingPengajuan = await Pengajuan.findOne({
      where: {
        user_id: user.id,
        status: {
          [Op.in]: ['Menunggu_Verifikasi', 'Aktif'],
        },
      },
    });

    if (existingPengajuan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Anda sudah memiliki proses magang yang sedang berjalan.',
        },
        { status: 409 }
      );
    }

    // Buat pengajuan baru
    const newPengajuan = await Pengajuan.create({
      user_id: user.id,
      nama_mahasiswa,
      npm,
      program_studi,
      angkatan,
      semester,
      kelas,
      jenis_magang,
      no_hp_mahasiswa,
      foto_diri: fotoUrl,
      bukti_penerimaan: buktiUrl,
      perusahaan,
      posisi,
      link_loa: buktiUrl,
      alamat_tempat_magang,
      nama_penanggung_jawab,
      kontak_penanggung_jawab,
      latitude,
      longitude,
      rencana_magang,
      tipeKonversi: jenis_magang,
      tgl_mulai,
      tgl_berakhir,
      status: 'Menunggu_Verifikasi',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Pengajuan magang berhasil dikirim dan akan diperiksa oleh staff.',
        data: newPengajuan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server.',
      },
      { status: 500 }
    );
  }
}

// ==================== PUT ====================
export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Akses ditolak.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          message: 'Aksi wajib dikirim.',
        },
        { status: 400 }
      );
    }

    if (user.role === 'Mahasiswa') {
      if (action === 'upload_laporan_akhir') {
        const link_laporan_akhir = body.link_laporan_akhir?.trim();
        const link_output_magang = body.link_output_magang?.trim() || null;

        if (!link_laporan_akhir || !isValidUrl(link_laporan_akhir)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Link laporan tidak valid.',
            },
            { status: 400 }
          );
        }

        if (link_output_magang && !isValidUrl(link_output_magang)) {
          return NextResponse.json(
            {
              success: false,
              message: 'Link output magang tidak valid.',
            },
            { status: 400 }
          );
        }

        const pengajuan = await Pengajuan.findOne({
          where: {
            user_id: user.id,
            status: 'Aktif',
          },
        });

        if (!pengajuan) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Pengajuan aktif tidak ditemukan. Dokumen dapat diunggah setelah pengajuan disetujui oleh staff.',
            },
            { status: 404 }
          );
        }

        const jenisMagang = pengajuan.getDataValue('jenis_magang');

        if (jenisMagang === 'Tidak Konversi') {
          return NextResponse.json(
            {
              success: false,
              message:
                'Jenis magang Tidak Konversi tidak mewajibkan upload laporan melalui sistem.',
            },
            { status: 400 }
          );
        }

        if (jenisMagang === 'Konversi 20 SKS' && !link_output_magang) {
          return NextResponse.json(
            {
              success: false,
              message:
                'Output magang wajib diisi untuk Konversi Maksimal 20 SKS.',
            },
            { status: 400 }
          );
        }

        await pengajuan.update({
          link_laporan_akhir,
          link_output_magang:
            jenisMagang === 'Konversi 20 SKS' ? link_output_magang : null,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Dokumen magang berhasil disimpan.',
          },
          { status: 200 }
        );
      }

      if (action === 'batal') {
        const pengajuan = await Pengajuan.findOne({
          where: {
            user_id: user.id,
            status: {
              [Op.in]: ['Menunggu_Verifikasi', 'Ditolak'],
            },
          },
        });

        if (!pengajuan) {
          return NextResponse.json(
            {
              success: false,
              message: 'Pengajuan tidak dapat dibatalkan.',
            },
            { status: 400 }
          );
        }

        await pengajuan.destroy();

        return NextResponse.json(
          {
            success: true,
            message: 'Pengajuan dibatalkan.',
          },
          { status: 200 }
        );
      }
    }

    if (isStaffRole(user.role)) {
      if (!body.id) {
        return NextResponse.json(
          {
            success: false,
            message: 'ID pengajuan wajib dikirim.',
          },
          { status: 400 }
        );
      }

      const pengajuan = await Pengajuan.findByPk(body.id);

      if (!pengajuan) {
        return NextResponse.json(
          {
            success: false,
            message: 'Pengajuan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      if (action === 'setujui') {
        if (!body.dosenId || !body.nama_dosen) {
          return NextResponse.json(
            {
              success: false,
              message: 'Dosen pembimbing wajib dipilih oleh staff.',
            },
            { status: 400 }
          );
        }

        await pengajuan.update({
          tipeKonversi:
            body.tipeKonversi || pengajuan.getDataValue('jenis_magang'),
          matkulKonversi: body.matkulKonversi
            ? JSON.stringify(body.matkulKonversi)
            : null,
          semester_konversi: body.semester_konversi || null,
          dosenId: body.dosenId,
          nama_dosen: body.nama_dosen,
          status_dosen: 'Disetujui',
          dosenPengujiId: body.dosenPengujiId || null,
          nama_dosen_penguji: body.nama_dosen_penguji || null,
          status: 'Aktif',
          alasan_penolakan: null,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Pengajuan disetujui dan dosen pembimbing berhasil ditentukan.',
          },
          { status: 200 }
        );
      }

      if (action === 'tolak') {
        const alasan = body.alasan?.trim();

        if (!alasan) {
          return NextResponse.json(
            {
              success: false,
              message: 'Alasan penolakan wajib diisi.',
            },
            { status: 400 }
          );
        }

        await pengajuan.update({
          status: 'Ditolak',
          alasan_penolakan: alasan,
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Pengajuan ditolak.',
          },
          { status: 200 }
        );
      }
    }

    if (user.role === 'Dosen') {
      if (!body.id_pengajuan) {
        return NextResponse.json(
          {
            success: false,
            message: 'ID pengajuan wajib dikirim.',
          },
          { status: 400 }
        );
      }

      const pengajuan = await Pengajuan.findOne({
        where: {
          id: body.id_pengajuan,
          dosenId: user.id,
        },
      });

      if (!pengajuan) {
        return NextResponse.json(
          {
            success: false,
            message: 'Data mahasiswa bimbingan tidak ditemukan.',
          },
          { status: 404 }
        );
      }

      if (action === 'beri_nilai') {
        const {
          nilai_dari_dosen,
          nilai_kedisiplinan,
          nilai_materi,
          nilai_koding,
          nilai_laporan,
          nilai_mitra,
        } = body;

        if (
          !nilai_dari_dosen ||
          !isValidScore(nilai_kedisiplinan) ||
          !isValidScore(nilai_materi) ||
          !isValidScore(nilai_koding) ||
          !isValidScore(nilai_laporan) ||
          !isValidScore(nilai_mitra)
        ) {
          return NextResponse.json(
            {
              success: false,
              message: 'Nilai dosen dan nilai mitra wajib lengkap pada rentang 0-100.',
            },
            { status: 400 }
          );
        }

        const jenisMagang = pengajuan.getDataValue('jenis_magang');

        if (jenisMagang !== 'Tidak Konversi') {
          if (!pengajuan.getDataValue('link_laporan_akhir')) {
            return NextResponse.json(
              {
                success: false,
                message:
                  jenisMagang === 'Konversi 2 SKS'
                    ? 'Mahasiswa belum mengunggah laporan magang. Penilaian akhir belum dapat diproses.'
                    : 'Mahasiswa belum mengunggah laporan akhir. Penilaian akhir belum dapat diproses.',
              },
              { status: 400 }
            );
          }

          if (
            jenisMagang === 'Konversi 20 SKS' &&
            !pengajuan.getDataValue('link_output_magang')
          ) {
            return NextResponse.json(
              {
                success: false,
                message: 'Mahasiswa belum mengunggah output magang. Penilaian akhir belum dapat diproses.',
              },
              { status: 400 }
            );
          }
        }

        if (
          pengajuan.getDataValue('status') !== 'Aktif' &&
          pengajuan.getDataValue('status') !== 'Selesai'
        ) {
          return NextResponse.json(
            {
              success: false,
              message: 'Penilaian akhir hanya dapat diproses untuk mahasiswa dengan status magang aktif atau selesai.',
            },
            { status: 400 }
          );
        }

        await pengajuan.update({
          nilai_dari_dosen,
          nilai_kedisiplinan,
          nilai_materi,
          nilai_koding,
          nilai_laporan,
          nilai_mitra,
          status: 'Selesai',
        });

        return NextResponse.json(
          {
            success: true,
            message: 'Nilai akhir mahasiswa berhasil disimpan.',
          },
          { status: 200 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Aksi tidak valid atau role tidak memiliki akses.',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Terjadi kesalahan server.',
      },
      { status: 500 }
    );
  }
}