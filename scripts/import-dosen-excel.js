require('dotenv').config({ path: '.env.local' });

const path = require('path');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');
const { Sequelize, DataTypes } = require('sequelize');

const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS;
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT || 3306);

if (!DB_NAME || !DB_USER || !DB_HOST) {
  console.error('ENV database belum lengkap. Cek DB_NAME, DB_USER, DB_PASSWORD/DB_PASS, DB_HOST, DB_PORT.');
  process.exit(1);
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('Admin', 'Mahasiswa', 'Dosen'),
      allowNull: false,
      defaultValue: 'Mahasiswa',
    },
    nim_nidn: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    prodi: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'S1 Informatika',
    },
    semester: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kategori_dosen: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kuota_bimbingan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    photo: {
      type: DataTypes.TEXT('long'),
      allowNull: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
  }
);

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeKuota(value) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 0) {
    return 5;
  }

  return number;
}

async function main() {
  const filePath = path.join(process.cwd(), 'data', 'dosen.xlsx');

  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  if (rows.length === 0) {
    console.log('File Excel kosong.');
    return;
  }

  await sequelize.authenticate();

  const defaultPassword = process.env.DEFAULT_DOSEN_PASSWORD || 'Dosen12345!';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = normalizeString(row.name);
    const email = normalizeEmail(row.email);
    const nim_nidn = normalizeString(row.nim_nidn);

    if (!name || !email || !nim_nidn) {
      skipped += 1;
      console.log('SKIP: name/email/nim_nidn kosong:', row);
      continue;
    }

    if (!email.endsWith('@unsika.ac.id')) {
      skipped += 1;
      console.log(`SKIP: email bukan @unsika.ac.id -> ${email}`);
      continue;
    }

    const payload = {
      name,
      email,
      nim_nidn,
      password: hashedPassword,
      role: 'Dosen',
      prodi: normalizeString(row.prodi) || 'Informatika',
      semester: null,
      kategori_dosen: normalizeString(row.kategori_dosen) || null,
      kuota_bimbingan: normalizeKuota(row.kuota_bimbingan),
      phone: normalizeString(row.phone) || null,
      photo: null,
    };

    const existingUser = await User.findOne({
      where: {
        email,
      },
    });

    if (existingUser) {
      await existingUser.update({
        name: payload.name,
        nim_nidn: payload.nim_nidn,
        role: 'Dosen',
        prodi: payload.prodi,
        kategori_dosen: payload.kategori_dosen,
        kuota_bimbingan: payload.kuota_bimbingan,
        phone: payload.phone,
      });

      updated += 1;
      console.log(`UPDATED: ${email}`);
    } else {
      await User.create(payload);

      created += 1;
      console.log(`CREATED: ${email}`);
    }
  }

  console.log('Import selesai.');
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Password default dosen baru: ${defaultPassword}`);

  await sequelize.close();
}

main().catch(async (error) => {
  console.error('IMPORT_DOSEN_ERROR:', error);
  await sequelize.close();
  process.exit(1);
});