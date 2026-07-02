import { NextResponse } from 'next/server';
import PengajuanLowongan from '@/models/PengajuanLowongan';
import Job from '@/models/Job';
import { connectDB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user || !['Super Admin', 'Admin', 'Dosen', 'Mahasiswa'].includes(user.role)) {
      return NextResponse.json({ message: 'Akses ditolak.' }, { status: 401 });
    }

    const result = await PengajuanLowongan.findAll({
      order: [['createdAt', 'DESC']],
    });

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error('GET_PENGAJUAN_LOWONGAN_ERROR:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.nama_mitra || !body.nama_pic || !body.kontak_pic || !body.posisi || !body.deskripsi) {
      return NextResponse.json(
        { message: 'Nama mitra, nama PIC, kontak PIC, posisi, dan deskripsi wajib diisi.' },
        { status: 400 }
      );
    }

    const newPengajuan = await PengajuanLowongan.create({
      nama_mitra: body.nama_mitra.trim(),
      alamat_mitra: body.alamat_mitra?.trim() || null,
      website_mitra: body.website_mitra?.trim() || null,
      nama_pic: body.nama_pic.trim(),
      kontak_pic: body.kontak_pic.trim(),
      email_pic: body.email_pic?.trim() || null,
      posisi: body.posisi.trim(),
      deskripsi: body.deskripsi.trim(),
      persyaratan: body.persyaratan?.trim() || null,
      lokasi: body.lokasi?.trim() || 'Menyesuaikan',
      sistem_kerja: body.sistem_kerja || 'Onsite',
      tipe_konversi: body.tipe_konversi || 'Konversi 20 SKS',
      kuota: Number(body.kuota) || 1,
      link_pendaftaran: body.link_pendaftaran?.trim() || null,
      status: 'Menunggu',
      catatan_super_admin: null,
    });

    return NextResponse.json(
      {
        message: 'Pengajuan lowongan berhasil dikirim. Tim HIKARI akan memeriksa data lowongan terlebih dahulu.',
        data: newPengajuan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST_PENGAJUAN_LOWONGAN_ERROR:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server saat menyimpan pengajuan lowongan.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user || !['Super Admin', 'Admin'].includes(user.role)) {
      return NextResponse.json({ message: 'Hanya Admin/Super Admin yang dapat mengubah status.' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, catatan_super_admin } = body;

    if (!id || !status) {
      return NextResponse.json({ message: 'ID dan status wajib dikirim.' }, { status: 400 });
    }

    const pengajuan = await PengajuanLowongan.findByPk(id);
    if (!pengajuan) {
      return NextResponse.json({ message: 'Data pengajuan tidak ditemukan.' }, { status: 404 });
    }

    pengajuan.status = status;
    if (catatan_super_admin !== undefined) {
      pengajuan.catatan_super_admin = catatan_super_admin;
    }
    await pengajuan.save();

    if (status === 'Disetujui') {
      try {
        await Job.create({
          title: pengajuan.posisi,
          company: pengajuan.nama_mitra,
          description: pengajuan.deskripsi + (pengajuan.persyaratan ? `\n\nPersyaratan:\n${pengajuan.persyaratan}` : ''),
          location: pengajuan.lokasi || 'Menyesuaikan',
          type: pengajuan.sistem_kerja,
          tipeKonversi: pengajuan.tipe_konversi,
          kategori: 'Magang',
          isPaid: false,
          kuota: pengajuan.kuota,
          link_pendaftaran: pengajuan.link_pendaftaran,
          email_perusahaan: pengajuan.email_pic,
          status: 'Aktif',
        });
      } catch (jobErr) {
        console.error('Gagal membuat job otomatis:', jobErr);
      }
    }

    return NextResponse.json({ message: `Status berhasil diubah menjadi ${status}.`, data: pengajuan }, { status: 200 });
  } catch (error) {
    console.error('PUT_PENGAJUAN_LOWONGAN_ERROR:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const user = await getCurrentUser();

    if (!user || !['Super Admin', 'Admin'].includes(user.role)) {
      return NextResponse.json({ message: 'Hanya Admin/Super Admin yang dapat menghapus.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'ID wajib dikirim.' }, { status: 400 });
    }

    const deleted = await PengajuanLowongan.destroy({ where: { id } });
    if (!deleted) {
      return NextResponse.json({ message: 'Data tidak ditemukan.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Pengajuan lowongan berhasil dihapus.' }, { status: 200 });
  } catch (error) {
    console.error('DELETE_PENGAJUAN_LOWONGAN_ERROR:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan server.' }, { status: 500 });
  }
}