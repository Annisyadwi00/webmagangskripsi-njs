// app/api/pengajuan/route.ts
import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
import { mkdir } from 'fs/promises';
import path from 'path';
import busboy from 'busboy';
import Pengajuan from '@/models/Pengajuan';
import { connectDB, syncDatabase } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { google } from 'googleapis';
import { Readable } from 'stream';
// ==================== KONSTANTA ====================
const allowedJenisMagang = [
  'Konversi 20 SKS',
  'Tidak Konversi',
  'Konversi 2 SKS',
];
function isSistemInformasi(prodi?: string | null) {
  return String(prodi || '').toLowerCase().includes('sistem informasi');
}
function isStaffRole(role?: string | null) {
  return role === 'Admin' || role === 'Super Admin';
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
function parsePositiveNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return parsed;
}
// ==================== GOOGLE DRIVE UPLOAD ====================
async function uploadToGoogleDrive(file: File, folderId: string): Promise<string> {
  if (!folderId) {
    throw new Error('Google Drive folder ID tidak lengkap di environment');
  }

  let drive;
  const serviceAccountEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (serviceAccountEmail && privateKey) {
    // Gunakan Service Account
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    drive = google.drive({ version: 'v3', auth });
  } else {
    // Fallback ke OAuth2
    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error('Google Drive credentials (OAuth/Service Account) tidak lengkap');
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    await oauth2Client.refreshAccessToken();
    drive = google.drive({ version: 'v3', auth: oauth2Client });
  }
  // Konversi File ke Buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  const stream = Readable.from(buffer);
  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId],
    },
    media: {
      mimeType: file.type,
      body: stream,
    },
    fields: 'id, webViewLink',
  });
  const fileId = response.data.id;
  if (!fileId) throw new Error('Gagal mengupload file ke Google Drive');
  // Set permission agar file bisa diakses publik (viewer)
  await drive.permissions.create({
    fileId: fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });
  // Kembalikan webViewLink (bisa diakses semua orang)
  return response.data.webViewLink!;
}
// ==================== PARSING FORM-DATA ====================
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
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 401 });
    }
    if (!['Super Admin', 'Admin', 'Dosen', 'Mahasiswa'].includes(user.role)) {
      return NextResponse.json({ success: false, message: 'Role tidak valid.' }, { status: 403 });
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
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}
// ==================== POST ====================
export async function POST(request: Request) {
  console.log('===== POST /api/pengajuan =====');
  try {
    await connectDB();
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 401 });
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
    const tahun_akademik = fields.tahun_akademik?.trim() || null;
    const jenis_magang = fields.jenis_magang?.trim();
    const no_hp_mahasiswa = fields.no_hp_mahasiswa?.trim();
    const perusahaan = fields.perusahaan?.trim();
    const posisi = fields.posisi?.trim();
    const alamat_tempat_magang = fields.alamat_tempat_magang?.trim();
    const nama_penanggung_jawab = fields.nama_penanggung_jawab?.trim();
    const kontak_penanggung_jawab = fields.kontak_penanggung_jawab?.trim();
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
      !posisi ||
      !tahun_akademik ||
      !alamat_tempat_magang ||
      !nama_penanggung_jawab ||
      !kontak_penanggung_jawab ||
      !tgl_mulai ||
      !tgl_berakhir ||
      !rencana_magang
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Nama, NPM, prodi, tahun akademik, jenis magang, nomor HP, perusahaan, posisi, alamat, penanggung jawab, tanggal, dan rencana magang wajib diisi.',
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
    // Validasi folder Drive
    const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID_PENGAJUAN;
    if (!driveFolderId) {
      return NextResponse.json(
        { success: false, message: 'Konfigurasi folder Google Drive Pengajuan tidak lengkap.' },
        { status: 500 }
      );
    }
    // Upload ke Google Drive
    let buktiUrl: string, fotoUrl: string;
    try {
      buktiUrl = await uploadToGoogleDrive(buktiFile, driveFolderId);
      fotoUrl = await uploadToGoogleDrive(fotoFile, driveFolderId);
    } catch (err) {
      console.error('Upload ke Google Drive gagal:', err);
      return NextResponse.json(
        { success: false, message: 'Gagal mengupload file ke Google Drive. Coba lagi.' },
        { status: 500 }
      );
    }
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
        { success: false, message: 'Tanggal berakhir magang tidak boleh lebih awal dari tanggal mulai.' },
        { status: 400 }
      );
    }
    const existingPengajuan = await Pengajuan.findOne({
      where: {
        user_id: user.id,
        status: { [Op.in]: ['Menunggu_Verifikasi', 'Aktif'] },
      },
    });
    if (existingPengajuan) {
      return NextResponse.json(
        { success: false, message: 'Anda sudah memiliki proses magang yang sedang berjalan.' },
        { status: 409 }
      );
    }
    const newPengajuan = await Pengajuan.create({
      user_id: user.id,
      nama_mahasiswa,
      npm,
      program_studi,
      angkatan,
      semester,
      kelas,
      tahun_akademik,
      jenis_magang,
      no_hp_mahasiswa,
      foto_diri: fotoUrl,
      bukti_penerimaan: buktiUrl,
      link_loa: buktiUrl, // untuk kompatibilitas
      perusahaan,
      posisi,
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
      { success: false, message: 'Terjadi kesalahan server.' },
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
      return NextResponse.json({ success: false, message: 'Akses ditolak.' }, { status: 401 });
    }
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let files: Record<string, File> = {};
    // Deteksi tipe request (form-data atau JSON)
    if (contentType.includes('multipart/form-data')) {
      try {
        const parsed = await parseFormData(request);
        body = parsed.fields;
        files = parsed.files;
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Gagal memproses form data.' },
          { status: 400 }
        );
      }
    } else {
      try {
        body = await request.json();
      } catch (err) {
        return NextResponse.json(
          { success: false, message: 'Format request tidak valid.' },
          { status: 400 }
        );
      }
    }
    const action = body.action;
    if (!action) {
      return NextResponse.json({ success: false, message: 'Aksi wajib dikirim.' }, { status: 400 });
    }
    // ========== MAHASISWA ==========
    if (user.role === 'Mahasiswa') {
      if (action === 'upload_laporan_akhir') {
        const laporanFile = files['laporan_file'];
        const outputFile = files['output_file'];
        const pengajuan = await Pengajuan.findOne({
          where: { user_id: user.id, status: 'Aktif' },
        });
        if (!pengajuan) {
          return NextResponse.json(
            { success: false, message: 'Pengajuan aktif tidak ditemukan.' },
            { status: 404 }
          );
        }
        const jenisMagang = pengajuan.getDataValue('jenis_magang');
        if (jenisMagang === 'Tidak Konversi') {
          return NextResponse.json(
            { success: false, message: 'Jenis magang Tidak Konversi tidak mewajibkan upload laporan.' },
            { status: 400 }
          );
        }
        if (!laporanFile || laporanFile.type !== 'application/pdf') {
          return NextResponse.json(
            { success: false, message: 'File laporan (PDF) wajib diunggah.' },
            { status: 400 }
          );
        }
        if (jenisMagang === 'Konversi 20 SKS') {
          if (!outputFile || outputFile.type !== 'application/pdf') {
            return NextResponse.json(
              { success: false, message: 'File output magang (PDF) wajib diunggah.' },
              { status: 400 }
            );
          }
        }
        const driveFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID_LAPORAN;
        if (!driveFolderId) {
          return NextResponse.json(
            { success: false, message: 'Konfigurasi folder Google Drive Laporan tidak lengkap.' },
            { status: 500 }
          );
        }
        let laporanUrl: string, outputUrl: string | null = null;
        try {
          laporanUrl = await uploadToGoogleDrive(laporanFile, driveFolderId);
          if (outputFile) {
            outputUrl = await uploadToGoogleDrive(outputFile, driveFolderId);
          }
        } catch (err) {
          console.error('Upload laporan ke Drive gagal:', err);
          return NextResponse.json(
            { success: false, message: 'Gagal mengupload file ke Google Drive.' },
            { status: 500 }
          );
        }
        await pengajuan.update({
          link_laporan_akhir: laporanUrl,
          link_output_magang: outputUrl,
        });
        return NextResponse.json(
          { success: true, message: 'Dokumen magang berhasil disimpan.' },
          { status: 200 }
        );
      }
      if (action === 'batal') {
        const pengajuan = await Pengajuan.findOne({
          where: {
            user_id: user.id,
            status: { [Op.in]: ['Menunggu_Verifikasi', 'Ditolak'] },
          },
        });
        if (!pengajuan) {
          return NextResponse.json({ success: false, message: 'Pengajuan tidak dapat dibatalkan.' }, { status: 400 });
        }
        await pengajuan.destroy();
        return NextResponse.json({ success: true, message: 'Pengajuan dibatalkan.' }, { status: 200 });
      }
    }
    // ========== STAFF (Admin/Super Admin) ==========
    if (isStaffRole(user.role)) {
      if (!body.id) {
        return NextResponse.json({ success: false, message: 'ID pengajuan wajib dikirim.' }, { status: 400 });
      }
      const pengajuan = await Pengajuan.findByPk(body.id);
      if (!pengajuan) {
        return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan.' }, { status: 404 });
      }
      if (action === 'setujui') {
        if (!body.dosenId || !body.nama_dosen) {
          return NextResponse.json(
            { success: false, message: 'Dosen pembimbing wajib dipilih oleh staff.' },
            { status: 400 }
          );
        }
        await pengajuan.update({
          tipeKonversi: body.tipeKonversi || pengajuan.getDataValue('jenis_magang'),
          matkulKonversi: body.matkulKonversi ? JSON.stringify(body.matkulKonversi) : null,
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
          { success: true, message: 'Pengajuan disetujui dan dosen pembimbing berhasil ditentukan.' },
          { status: 200 }
        );
      }
      if (action === 'tolak') {
        const alasan = body.alasan?.trim();
        if (!alasan) {
          return NextResponse.json({ success: false, message: 'Alasan penolakan wajib diisi.' }, { status: 400 });
        }
        await pengajuan.update({ status: 'Ditolak', alasan_penolakan: alasan });
        return NextResponse.json({ success: true, message: 'Pengajuan ditolak.' }, { status: 200 });
      }
    }
    // ========== DOSEN ==========
    if (user.role === 'Dosen') {
      if (!body.id_pengajuan) {
        return NextResponse.json({ success: false, message: 'ID pengajuan wajib dikirim.' }, { status: 400 });
      }
      // Cek apakah dosen ini adalah dosen pembimbing atau dosen penguji untuk pengajuan tersebut
      const pengajuan = await Pengajuan.findOne({
        where: {
          id: body.id_pengajuan,
          [Op.or]: [
            { dosenId: user.id },
            { dosenPengujiId: user.id }
          ]
        },
      });
      if (!pengajuan) {
        return NextResponse.json(
          { success: false, message: 'Data mahasiswa tidak ditemukan atau Anda tidak berwenang.' },
          { status: 404 }
        );
      }
      // --- Aksi: beri nilai akhir (dosen pembimbing) ---
      if (action === 'beri_nilai') {
        const {
          nilai_mitra_total,
          nilai_dosen_total,
          nilai_akhir_angka,
          nilai_akhir_grade,
          nilai_mitra_detail,
          nilai_dosen_detail,
        } = body;

        if (
          nilai_mitra_total === undefined ||
          nilai_dosen_total === undefined ||
          nilai_akhir_angka === undefined ||
          !nilai_akhir_grade
        ) {
          return NextResponse.json(
            {
              success: false,
              message: 'Data nilai mitra dan dosen wajib lengkap.',
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
          if (jenisMagang === 'Konversi 20 SKS' && !pengajuan.getDataValue('link_output_magang')) {
            return NextResponse.json(
              {
                success: false,
                message: 'Mahasiswa belum mengunggah output magang. Penilaian akhir belum dapat diproses.',
              },
              { status: 400 }
            );
          }
        }

        if (!['Aktif', 'Selesai'].includes(pengajuan.getDataValue('status'))) {
          return NextResponse.json(
            {
              success: false,
              message: 'Penilaian akhir hanya dapat diproses untuk mahasiswa dengan status magang aktif atau selesai.',
            },
            { status: 400 }
          );
        }

        await syncDatabase();
        await pengajuan.update({
          nilai_mitra_total,
          nilai_dosen_total,
          nilai_akhir_angka,
          nilai_akhir_grade,
          nilai_mitra_detail,
          nilai_dosen_detail,
          nilai_dari_dosen: String(nilai_akhir_grade),
          status: 'Selesai',
        });

        return NextResponse.json(
          { success: true, message: 'Nilai akhir mahasiswa berhasil disimpan.' },
          { status: 200 }
        );
      }
      // --- Aksi baru: beri nilai penguji ---
      if (action === 'beri_nilai_penguji') {
        // Pastikan dosen yang login adalah dosen penguji untuk pengajuan ini
        if (pengajuan.getDataValue('dosenPengujiId') !== user.id) {
          return NextResponse.json(
            { success: false, message: 'Anda tidak terdaftar sebagai dosen penguji untuk mahasiswa ini.' },
            { status: 403 }
          );
        }
        const { nilai_penguji_total, nilai_penguji_grade, nilai_penguji_detail } = body;
        // Validasi: nilai total harus angka 0-100, grade opsional
        if (nilai_penguji_total === undefined || isNaN(Number(nilai_penguji_total))) {
          return NextResponse.json(
            { success: false, message: 'Nilai penguji total harus berupa angka.' },
            { status: 400 }
          );
        }
        const total = Number(nilai_penguji_total);
        if (total < 0 || total > 100) {
          return NextResponse.json(
            { success: false, message: 'Nilai penguji total harus antara 0 dan 100.' },
            { status: 400 }
          );
        }
        // Jika detail dikirim, pastikan berupa objek
        let detail = null;
        if (nilai_penguji_detail) {
          try {
            detail = typeof nilai_penguji_detail === 'string'
              ? JSON.parse(nilai_penguji_detail)
              : nilai_penguji_detail;
          } catch {
            return NextResponse.json(
              { success: false, message: 'Format nilai_penguji_detail tidak valid.' },
              { status: 400 }
            );
          }
        }
        await pengajuan.update({
  nilai_penguji_total: total,
  nilai_penguji_grade: nilai_penguji_grade || null,
  nilai_penguji_detail: detail,
});
        return NextResponse.json(
          { success: true, message: 'Nilai penguji berhasil disimpan.' },
          { status: 200 }
        );
      }
    }
    return NextResponse.json(
      { success: false, message: 'Aksi tidak valid atau role tidak memiliki akses.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_ERROR:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}