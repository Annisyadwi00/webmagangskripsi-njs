require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL belum ada di .env.local');
  }

  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      name: 'Admin SI Magang',
      email: 'admin@unsika.ac.id',
      role: 'Admin',
      nim_nidn: 'ADM001',
      prodi: null,
      semester: null,
      kategori_dosen: null,
    },
    {
      name: 'Dosen Pembimbing',
      email: 'dosen@unsika.ac.id',
      role: 'Dosen',
      nim_nidn: '198801012020121001',
      prodi: null,
      semester: null,
      kategori_dosen: 'Pembimbing',
    },
    {
      name: 'Mahasiswa Demo',
      email: 'mahasiswa@student.unsika.ac.id',
      role: 'Mahasiswa',
      nim_nidn: '2210631170001',
      prodi: 'S1 Informatika',
      semester: '7',
      kategori_dosen: null,
    },
  ];

  for (const user of users) {
    await connection.execute(
      `
      INSERT INTO users
        (
          name,
          email,
          password,
          role,
          nim_nidn,
          prodi,
          semester,
          kategori_dosen,
          kuota_bimbingan,
          createdAt,
          updatedAt
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role),
        nim_nidn = VALUES(nim_nidn),
        prodi = VALUES(prodi),
        semester = VALUES(semester),
        kategori_dosen = VALUES(kategori_dosen),
        updatedAt = NOW()
      `,
      [
        user.name,
        user.email,
        hashedPassword,
        user.role,
        user.nim_nidn,
        user.prodi,
        user.semester,
        user.kategori_dosen,
        5,
      ]
    );
  }

  await connection.end();

  console.log('Seed akun berhasil.');
  console.log('Password semua akun: password123');
}

main().catch((error) => {
  console.error('Seed gagal:', error);
  process.exit(1);
});