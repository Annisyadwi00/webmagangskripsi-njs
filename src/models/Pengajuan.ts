import { Op } from 'sequelize';
import Pengajuan from '@/models/Pengajuan';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import {
  isValidScore,
  isValidUrl,
  optionalTrimString,
  parsePositiveInteger,
  trimString,
} from '@/lib/validators';
import {
  successResponse,
  messageResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  badRequestResponse,
  notFoundResponse,
} from '@/lib/api-response';

export async function GET(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const page = parsePositiveInteger(searchParams.get('page'), 1);
    const requestedLimit = parsePositiveInteger(searchParams.get('limit'), 10);
    const limit = Math.min(requestedLimit, 50);
    const offset = (page - 1) * limit;

    const where =
      user.role === 'Mahasiswa'
        ? { user_id: user.id }
        : user.role === 'Dosen'
          ? { dosenId: user.id }
          : undefined;

    if (!['Admin', 'Dosen', 'Mahasiswa'].includes(user.role)) {
      return forbiddenResponse('Role tidak valid.');
    }

    const result = await Pengajuan.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });

    return successResponse(
      {
        items: result.rows,
        meta: {
          total: result.count,
          page,
          limit,
          totalPages: Math.ceil(result.count / limit),
        },
      },
      'Data pengajuan berhasil diambil.'
    );
  } catch (error) {
    console.error('GET_PENGAJUAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    if (user.role !== 'Mahasiswa') {
      return forbiddenResponse('Hanya mahasiswa yang dapat mengajukan magang.');
    }

    const body = await request.json();

    const perusahaan = trimString(body.perusahaan);
    const posisi = trimString(body.posisi);
    const link_loa = trimString(body.link_loa);
    const nama_mahasiswa = trimString(body.nama_mahasiswa) || user.name;
    const tgl_mulai = body.tgl_mulai;
    const tgl_berakhir = body.tgl_berakhir;

    if (!perusahaan || !posisi || !link_loa || !tgl_mulai || !tgl_berakhir) {
      return badRequestResponse(
        'Perusahaan, posisi, link LOA, tanggal mulai, dan tanggal berakhir wajib diisi.'
      );
    }

    if (!isValidUrl(link_loa)) {
      return badRequestResponse('Format link LOA tidak valid.');
    }

    if (new Date(tgl_mulai) > new Date(tgl_berakhir)) {
      return badRequestResponse(
        'Tanggal mulai tidak boleh lebih besar dari tanggal berakhir.'
      );
    }

    const existingPengajuan = await Pengajuan.findOne({
      where: {
        user_id: user.id,
        status: {
          [Op.in]: ['Menunggu_Verifikasi', 'Pilih_Dosen', 'Aktif'],
        },
      },
    });

    if (existingPengajuan) {
      return badRequestResponse(
        'Anda sudah memiliki proses magang yang sedang berjalan.'
      );
    }

    const newPengajuan = await Pengajuan.create({
      user_id: user.id,
      nama_mahasiswa,
      perusahaan,
      posisi,
      link_loa,
      tgl_mulai,
      tgl_berakhir,
      status: 'Menunggu_Verifikasi',
    });

    return successResponse(
      newPengajuan,
      'LOA berhasil dikirim!',
      201
    );
  } catch (error) {
    console.error('CREATE_PENGAJUAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    const user = await getCurrentUser();

    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const action = body.action;

    if (!action) {
      return badRequestResponse('Aksi wajib dikirim.');
    }

    if (user.role === 'Mahasiswa') {
      if (action === 'pilih_dosen') {
        const dosenId = body.dosenId;
        const nama_dosen = trimString(body.nama_dosen);

        if (!dosenId || !nama_dosen) {
          return badRequestResponse('Dosen pembimbing wajib dipilih.');
        }

        const pengajuan = await Pengajuan.findOne({
          where: {
            user_id: user.id,
            status: 'Pilih_Dosen',
          },
        });

        if (!pengajuan) {
          return notFoundResponse(
            'Pengajuan yang dapat memilih dosen tidak ditemukan.'
          );
        }

        await pengajuan.update({
          dosenId,
          nama_dosen,
          status: 'Aktif',
          status_dosen: 'Menunggu',
        });

        return messageResponse('Berhasil memilih dosen!');
      }

      if (action === 'upload_laporan_akhir') {
        const link_laporan_akhir = trimString(body.link_laporan_akhir);

        if (!link_laporan_akhir || !isValidUrl(link_laporan_akhir)) {
          return badRequestResponse('Link laporan akhir tidak valid.');
        }

        const pengajuan = await Pengajuan.findOne({
          where: {
            user_id: user.id,
            status: 'Aktif',
          },
        });

        if (!pengajuan) {
          return notFoundResponse('Pengajuan aktif tidak ditemukan.');
        }

        await pengajuan.update({
          link_laporan_akhir,
        });

        return messageResponse('Laporan akhir berhasil disimpan!');
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
          return badRequestResponse('Pengajuan tidak dapat dibatalkan.');
        }

        await pengajuan.destroy();

        return messageResponse('Pengajuan dibatalkan.');
      }
    }

    if (user.role === 'Admin') {
      const id = body.id;

      if (!id) {
        return badRequestResponse('ID pengajuan wajib dikirim.');
      }

      const pengajuan = await Pengajuan.findByPk(id);

      if (!pengajuan) {
        return notFoundResponse('Pengajuan tidak ditemukan.');
      }

      if (action === 'setujui') {
        await pengajuan.update({
          tipeKonversi: optionalTrimString(body.tipeKonversi),
          matkulKonversi: body.matkulKonversi
            ? JSON.stringify(body.matkulKonversi)
            : null,
          semester_konversi: optionalTrimString(body.semester_konversi),
          status: 'Pilih_Dosen',
          alasan_penolakan: null,
        });

        return messageResponse('Pengajuan disetujui!');
      }

      if (action === 'tolak') {
        const alasan = trimString(body.alasan);

        if (!alasan) {
          return badRequestResponse('Alasan penolakan wajib diisi.');
        }

        await pengajuan.update({
          status: 'Ditolak',
          alasan_penolakan: alasan,
        });

        return messageResponse('Pengajuan ditolak.');
      }
    }

    if (user.role === 'Dosen') {
      const idPengajuan = body.id_pengajuan;

      if (!idPengajuan) {
        return badRequestResponse('ID pengajuan wajib dikirim.');
      }

      const pengajuan = await Pengajuan.findOne({
        where: {
          id: idPengajuan,
          dosenId: user.id,
        },
      });

      if (!pengajuan) {
        return notFoundResponse('Pengajuan bimbingan tidak ditemukan.');
      }

      if (action === 'terima') {
        await pengajuan.update({
          status_dosen: 'Disetujui',
        });

        return messageResponse('Bimbingan disetujui!');
      }

      if (action === 'tolak') {
        await pengajuan.update({
          status_dosen: 'Ditolak',
          dosenId: null,
          nama_dosen: null,
          status: 'Pilih_Dosen',
        });

        return messageResponse('Bimbingan ditolak.');
      }

      if (action === 'beri_nilai') {
        const nilai_dari_dosen = trimString(body.nilai_dari_dosen);

        if (
          !nilai_dari_dosen ||
          !isValidScore(body.nilai_kedisiplinan) ||
          !isValidScore(body.nilai_materi) ||
          !isValidScore(body.nilai_koding) ||
          !isValidScore(body.nilai_laporan)
        ) {
          return badRequestResponse(
            'Nilai wajib lengkap dan berada pada rentang 0-100.'
          );
        }

        await pengajuan.update({
          nilai_dari_dosen,
          nilai_kedisiplinan: Number(body.nilai_kedisiplinan),
          nilai_materi: Number(body.nilai_materi),
          nilai_koding: Number(body.nilai_koding),
          nilai_laporan: Number(body.nilai_laporan),
          status: 'Selesai',
        });

        return messageResponse(
          'Nilai dan rubrik evaluasi berhasil disimpan!'
        );
      }
    }

    return badRequestResponse('Aksi tidak valid.');
  } catch (error) {
    console.error('UPDATE_PENGAJUAN_ERROR:', error);

    return errorResponse('Terjadi kesalahan server.');
  }
}