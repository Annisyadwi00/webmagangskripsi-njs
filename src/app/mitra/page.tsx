const mitraList = [
  {
    name: 'Toyota Motor Manufacturing Indonesia',
    logo: 'T',
    address: 'Karawang International Industrial City, Karawang',
    phone: '6281234567890',
    email: 'hr@toyota.co.id',
    description:
      'Perusahaan manufaktur otomotif yang menyediakan kesempatan magang pada bidang produksi, engineering, administrasi, dan teknologi informasi.',
  },
  {
    name: 'Kominfo Karawang',
    logo: 'K',
    address: 'Kabupaten Karawang, Jawa Barat',
    phone: '6281234567891',
    email: 'kominfo@karawangkab.go.id',
    description:
      'Instansi pemerintahan yang berfokus pada komunikasi, informatika, layanan digital, dan pengelolaan informasi publik.',
  },
  {
    name: 'LPPM UNSIKA',
    logo: 'L',
    address: 'Universitas Singaperbangsa Karawang',
    phone: '6281234567892',
    email: 'lppm@unsika.ac.id',
    description:
      'Lembaga kampus yang berperan dalam pengelolaan penelitian, pengabdian masyarakat, dan kegiatan akademik berbasis kolaborasi.',
  },
  {
    name: 'Kecamatan Telukjambe',
    logo: 'T',
    address: 'Telukjambe, Karawang',
    phone: '6281234567893',
    email: 'telukjambe@karawangkab.go.id',
    description:
      'Instansi pemerintahan tingkat kecamatan yang mendukung kegiatan administrasi, pelayanan publik, dan digitalisasi layanan masyarakat.',
  },
  {
    name: 'SMK Negeri 1 Karawang',
    logo: 'S',
    address: 'Karawang, Jawa Barat',
    phone: '6281234567894',
    email: 'info@smkn1karawang.sch.id',
    description:
      'Satuan pendidikan kejuruan yang dapat menjadi tempat magang untuk bidang teknologi informasi, administrasi, dan pengelolaan sistem sekolah.',
  },
  {
    name: 'PT Teknologi Indonesia',
    logo: 'P',
    address: 'Karawang, Jawa Barat',
    phone: '6281234567895',
    email: 'career@teknologiindonesia.co.id',
    description:
      'Perusahaan teknologi yang bergerak pada pengembangan aplikasi, sistem informasi, website, dan solusi digital untuk kebutuhan bisnis.',
  },
];

export default function MitraPage() {
  return (
    <main className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="app-container">
        <section className="mb-10 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-8">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1e3a8a] dark:text-blue-300">
            Daftar Mitra
          </p>

          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-5xl">
            Mitra magang yang terdata.
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
            Halaman ini menampilkan daftar perusahaan atau instansi yang telah
            terdata sebagai mitra atau referensi tempat magang mahasiswa.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {mitraList.map((mitra) => (
            <article
              key={mitra.name}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400/40"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50 text-2xl font-black text-[#1e3a8a] dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                  {mitra.logo}
                </div>

                <div>
                  <h2 className="text-xl font-black text-slate-950 dark:text-white">
                    {mitra.name}
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {mitra.address}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-slate-300">
                {mitra.description}
              </p>

              <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    WhatsApp
                  </p>
                  <a
                    href={`https://wa.me/${mitra.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex font-black text-[#1e3a8a] dark:text-blue-300"
                  >
                    {mitra.phone}
                  </a>
                </div>

                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                    Email
                  </p>
                  <a
                    href={`mailto:${mitra.email}`}
                    className="mt-1 inline-flex break-all font-black text-[#1e3a8a] dark:text-blue-300"
                  >
                    {mitra.email}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}