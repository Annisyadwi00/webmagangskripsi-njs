import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '@/lib/db';

export type PengajuanLowonganStatus = 'Menunggu' | 'Disetujui' | 'Ditolak';

export type PengajuanLowonganAttributes = {
  id: number;

  nama_mitra: string;
  alamat_mitra: string | null;
  website_mitra: string | null;

link_akta_pendirian: string | null;
link_akta_direksi: string | null;
link_ktp_penandatangan: string | null;
link_npwp: string | null;
link_izin_usaha: string | null;

dokumen_akta_pendirian: string | null;
dokumen_akta_direksi: string | null;
dokumen_ktp_penandatangan: string | null;
dokumen_npwp: string | null;
dokumen_izin_usaha: string | null;

  nama_pic: string;
  kontak_pic: string;
  email_pic: string | null;

  posisi: string;
  deskripsi: string;
  persyaratan: string | null;
  lokasi: string | null;
  sistem_kerja: 'Onsite' | 'Hybrid' | 'Remote';
  tipe_konversi: 'Konversi 20 SKS' | 'Tidak Konversi' | 'Konversi 2 SKS';
  kuota: number;
  link_pendaftaran: string | null;

  status: PengajuanLowonganStatus;
  catatan_super_admin: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};

export type PengajuanLowonganCreationAttributes = Optional<
  PengajuanLowonganAttributes,
  | 'id'
  | 'alamat_mitra'
  | 'website_mitra'
  | 'email_pic'
  | 'persyaratan'
  | 'lokasi'
  | 'link_pendaftaran'
  | 'status'
  | 'catatan_super_admin'
  | 'createdAt'
  | 'updatedAt'
  | 'link_akta_pendirian'
| 'link_akta_direksi'
| 'link_ktp_penandatangan'
| 'link_npwp'
| 'link_izin_usaha'
>;

class PengajuanLowongan extends Model<
  PengajuanLowonganAttributes,
  PengajuanLowonganCreationAttributes
> implements PengajuanLowonganAttributes {
  declare id: number;

declare link_akta_pendirian: string | null;
declare link_akta_direksi: string | null;
declare link_ktp_penandatangan: string | null;
declare link_npwp: string | null;
declare link_izin_usaha: string | null;

declare dokumen_akta_pendirian: string | null;
declare dokumen_akta_direksi: string | null;
declare dokumen_ktp_penandatangan: string | null;
declare dokumen_npwp: string | null;
declare dokumen_izin_usaha: string | null;

  declare nama_mitra: string;
  declare alamat_mitra: string | null;
  declare website_mitra: string | null;

  declare nama_pic: string;
  declare kontak_pic: string;
  declare email_pic: string | null;

  declare posisi: string;
  declare deskripsi: string;
  declare persyaratan: string | null;
  declare lokasi: string | null;
  declare sistem_kerja: 'Onsite' | 'Hybrid' | 'Remote';
  declare tipe_konversi: 'Konversi 20 SKS' | 'Tidak Konversi' | 'Konversi 2 SKS';
  declare kuota: number;
  declare link_pendaftaran: string | null;

  declare status: PengajuanLowonganStatus;
  declare catatan_super_admin: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

PengajuanLowongan.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },

    nama_mitra: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    alamat_mitra: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    website_mitra: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    nama_pic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    kontak_pic: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email_pic: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    posisi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    persyaratan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lokasi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sistem_kerja: {
      type: DataTypes.ENUM('Onsite', 'Hybrid', 'Remote'),
      allowNull: false,
      defaultValue: 'Onsite',
    },
    tipe_konversi: {
      type: DataTypes.ENUM(
        'Konversi 20 SKS',
        'Tidak Konversi',
        'Konversi 2 SKS'
      ),
      allowNull: false,
      defaultValue: 'Konversi 20 SKS',
    },
    kuota: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    link_pendaftaran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
dokumen_akta_pendirian: {
  type: DataTypes.STRING,
  allowNull: true,
},
dokumen_akta_direksi: {
  type: DataTypes.STRING,
  allowNull: true,
},
dokumen_ktp_penandatangan: {
  type: DataTypes.STRING,
  allowNull: true,
},
dokumen_npwp: {
  type: DataTypes.STRING,
  allowNull: true,
},
dokumen_izin_usaha: {
  type: DataTypes.STRING,
  allowNull: true,
},

link_akta_pendirian: {
  type: DataTypes.STRING,
  allowNull: true,
},
link_akta_direksi: {
  type: DataTypes.STRING,
  allowNull: true,
},
link_ktp_penandatangan: {
  type: DataTypes.STRING,
  allowNull: true,
},
link_npwp: {
  type: DataTypes.STRING,
  allowNull: true,
},
link_izin_usaha: {
  type: DataTypes.STRING,
  allowNull: true,
},

    status: {
      type: DataTypes.ENUM('Menunggu', 'Disetujui', 'Ditolak'),
      allowNull: false,
      defaultValue: 'Menunggu',
    },
    catatan_super_admin: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'pengajuan_lowongan',
    timestamps: true,
  }
);

export default PengajuanLowongan;