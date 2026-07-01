export type SidangIndicatorItem = {
  id: string;
  code?: string;
  label: string;
};

export type SidangCurriculumGroup = {
  category: string;
  items: SidangIndicatorItem[];
};

export type SidangCurriculum = {
  prodi: 'Informatika' | 'Sistem Informasi';
  semester: '5' | '6' | '7';
  groups: SidangCurriculumGroup[];
};

export function getSidangPredicate(num: number): { label: string; color: string; badgeClass: string } {
  if (isNaN(num) || num < 0) return { label: '-', color: 'text-slate-400', badgeClass: 'bg-slate-100 text-slate-500' };
  if (num <= 20) return { label: 'Sangat Kurang', color: 'text-red-600 dark:text-red-400', badgeClass: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800' };
  if (num <= 40) return { label: 'Kurang', color: 'text-orange-600 dark:text-orange-400', badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800' };
  if (num <= 60) return { label: 'Cukup', color: 'text-amber-600 dark:text-amber-400', badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
  if (num <= 80) return { label: 'Baik', color: 'text-blue-600 dark:text-blue-400', badgeClass: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' };
  return { label: 'Sangat Baik', color: 'text-emerald-600 dark:text-emerald-400', badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
}

export function detectProdiAndSemester(programStudi?: string | null, semester?: string | null): { prodi: 'Informatika' | 'Sistem Informasi'; semester: '5' | '6' | '7' } {
  let prodi: 'Informatika' | 'Sistem Informasi' = 'Informatika';
  if (programStudi) {
    const p = programStudi.toLowerCase();
    if (p.includes('sistem') || p.includes('informasi') || p.includes('si') || p === 'sistem informasi') {
      prodi = 'Sistem Informasi';
    }
  }

  let sem: '5' | '6' | '7' = '5';
  if (semester) {
    const s = semester.toString().toLowerCase();
    if (s.includes('7') || s === 'vii' || s.includes('tujuh')) sem = '7';
    else if (s.includes('6') || s === 'vi' || s.includes('enam')) sem = '6';
    else if (s.includes('5') || s === 'v' || s.includes('lima')) sem = '5';
  }

  return { prodi, semester: sem };
}

export const SIDANG_CURRICULUMS: SidangCurriculum[] = [
  // ============================================================
  // PROGRAM STUDI S1 INFORMATIKA - SEMESTER 5
  // ============================================================
  {
    prodi: 'Informatika',
    semester: '5',
    groups: [
      {
        category: 'Aspek Sikap',
        items: [
          { id: 'if_s5_sikap_1', label: 'Menunjukkan sikap bertanggung jawab atas pekerjaan di bidangnya secara mandiri.' },
          { id: 'if_s5_sikap_2', label: 'Menginternalisasi semangat kemandirian, kejuangan, dan kewirausahaan.' },
        ],
      },
      {
        category: 'Aspek Pengetahuan',
        items: [
          { id: 'if_s5_peng_1', label: 'Menguasai konsep teoritis bidang pengetahuan Informatika secara umum dan konsep teoritis bagian khusus di bidang teori komputasi, jaringan komputer, rekayasa perangkat lunak, sistem cerdas, dan data sains secara mendalam serta mampu memformulasikan penyelesaian masalah prosedural.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Umum',
        items: [
          { id: 'if_s5_ku_1', label: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora yang sesuai dengan bidang keahliannya.' },
          { id: 'if_s5_ku_2', label: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.' },
          { id: 'if_s5_ku_3', label: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni.' },
          { id: 'if_s5_ku_4', label: 'Mampu bertanggung jawab atas pencapaian hasil kerja kelompok dan melakukan supervisi serta evaluasi terhadap penyelesaian pekerjaan yang ditugaskan kepada pekerja yang berada di bawah tanggung jawabnya.' },
          { id: 'if_s5_ku_5', label: 'Mampu melakukan proses evaluasi diri terhadap kelompok kerja yang berada di bawah tanggung jawabnya, dan mampu mengelola pembelajaran secara mandiri.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Khusus',
        items: [
          { id: 'if_s5_kk_1', label: 'Mampu menganalisis masalah kompleks dan menerapkan teori komputasi untuk menyelesaikannya.' },
          { id: 'if_s5_kk_2', label: 'Mampu merancang dan menghasilkan sebuah inovasi dalam bidang kewirausahaan yang berbasis teknologi atau sebagai technopreneur.' },
          { id: 'if_s5_kk_3', label: 'Menerapkan teori ilmu komputer dan dasar pengembangan perangkat lunak untuk menghasilkan solusi yang terkomputasi.' },
          { id: 'if_s5_kk_4', label: 'Mampu menerapkan arsitektur komputer, prinsip-prinsip kerja sistem operasi untuk merancang, mengimplementasikan dan mengelola sistem jaringan yang mempunyai kinerja tinggi, aman, dan efisien.' },
        ],
      },
    ],
  },

  // ============================================================
  // PROGRAM STUDI S1 SISTEM INFORMASI - SEMESTER 5
  // ============================================================
  {
    prodi: 'Sistem Informasi',
    semester: '5',
    groups: [
      {
        category: 'Enterprise Resource Planning (CPL 4, 6)',
        items: [
          { id: 'si_s5_erp_1', code: 'CPMK-04-01', label: 'Mampu menganalisis infrastruktur SI, arsitektur jaringan, layanan fisik dan cloud, konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat.' },
          { id: 'si_s5_erp_2', code: 'CPMK-06-01', label: 'Mampu merencanakan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi jangka panjang.' },
        ],
      },
      {
        category: 'Etika Profesi Dan Profesional (CPL 5, 8)',
        items: [
          { id: 'si_s5_etika_1', code: 'CPMK-05-02', label: 'Mampu menerapkan kode etik dalam penggunaan informasi data pada perancangan, implementasi dan penggunaan suatu sistem.' },
          { id: 'si_s5_etika_2', code: 'CPMK-08-02', label: 'Mampu mengidentifikasi konsep sikap jiwa profesional (inovatif, kompetitif, unggul), dan kolaboratif dalam pengembangan diri di dunia industri dan masyarakat.' },
          { id: 'si_s5_etika_3', code: 'CPMK-08-03', label: 'Mampu menerapkan konsep sikap jiwa profesional (inovatif, kompetitif, unggul), dan kolaboratif dalam pengembangan diri di dunia industri dan masyarakat.' },
        ],
      },
      {
        category: 'Pengantar Cloud Computing (CPL 1, 4)',
        items: [
          { id: 'si_s5_cloud_1', code: 'CPMK-01-01', label: 'Mampu memahami konsep dasar sistem informasi.' },
          { id: 'si_s5_cloud_2', code: 'CPMK-04-01', label: 'Mampu menganalisis infrastruktur SI, arsitektur jaringan, layanan fisik dan cloud, konsep identifikasi, otentikasi, otorisasi akses dalam konteks melindungi orang dan perangkat.' },
        ],
      },
      {
        category: 'Pengantar Kecerdasan Buatan (CPL 1, 2)',
        items: [
          { id: 'si_s5_ai_1', code: 'CPMK-01-04', label: 'Mampu menilai peran sistem informasi dalam memberikan rekomendasi pengambilan keputusan di organisasi.' },
          { id: 'si_s5_ai_2', code: 'CPMK-02-04', label: 'Mampu menganalisa data dengan alat dan teknik pengolahan data.' },
        ],
      },
      {
        category: 'Big Data (CPL 1, 2)',
        items: [
          { id: 'si_s5_bigdata_1', code: 'CPMK-01-04', label: 'Mampu menilai peran sistem informasi dalam memberikan rekomendasi pengambilan keputusan di organisasi.' },
          { id: 'si_s5_bigdata_2', code: 'CPMK-02-04', label: 'Mampu menganalisa data dengan alat dan teknik pengolahan data.' },
        ],
      },
      {
        category: 'Pemrograman Web (CPL 3)',
        items: [
          { id: 'si_s5_web_1', code: 'CPMK-03-02', label: 'Mampu menggunakan berbagai alat pengembangan sistem.' },
          { id: 'si_s5_web_2', code: 'CPMK-03-03', label: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi.' },
        ],
      },
      {
        category: 'Framework Blockchain untuk Bisnis (CPL 3, 9)',
        items: [
          { id: 'si_s5_block_1', code: 'CPMK-03-02', label: 'Mampu menggunakan berbagai alat pengembangan sistem.' },
          { id: 'si_s5_block_2', code: 'CPMK-09-03', label: 'Mampu menerapkan perencanaan Kewirausahaan berbasis Teknologi Informasi.' },
        ],
      },
    ],
  },

  // ============================================================
  // PROGRAM STUDI S1 INFORMATIKA - SEMESTER 6
  // ============================================================
  {
    prodi: 'Informatika',
    semester: '6',
    groups: [
      {
        category: 'Aspek Sikap',
        items: [
          { id: 'if_s6_sikap_1', label: 'Menunjukkan sikap bertanggung jawab atas pekerjaan di bidangnya secara mandiri.' },
        ],
      },
      {
        category: 'Aspek Pengetahuan',
        items: [
          { id: 'if_s6_peng_1', label: 'Menguasai konsep teoritis bidang pengetahuan Informatika secara umum dan konsep teoritis bagian khusus di bidang teori komputasi, jaringan komputer, rekayasa perangkat lunak, sistem cerdas, dan data sains secara mendalam serta mampu memformulasikan penyelesaian masalah prosedural.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Umum',
        items: [
          { id: 'if_s6_ku_1', label: 'Mampu menerapkan pemikiran logis, kritis, sistematis, dan inovatif dalam konteks pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora yang sesuai dengan bidang keahliannya.' },
          { id: 'if_s6_ku_2', label: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.' },
          { id: 'if_s6_ku_3', label: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni.' },
          { id: 'if_s6_ku_4', label: 'Mampu melakukan proses evaluasi diri terhadap kelompok kerja yang berada di bawah tanggung jawabnya, dan mampu mengelola pembelajaran secara mandiri.' },
          { id: 'if_s6_ku_5', label: 'Mampu mengimplementasikan teknologi informasi dan komunikasi dalam konteks pelaksanaan pekerjaannya.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Khusus',
        items: [
          { id: 'if_s6_kk_1', label: 'Mampu merancang dan membangun aplikasi dengan menerapkan prinsip-prinsip sistem cerdas dan ilmu komputasi untuk menghasilkan produk aplikasi cerdas pada berbagai bidang.' },
          { id: 'if_s6_kk_2', label: 'Mampu menganalisis masalah kompleks dan menerapkan teori komputasi untuk menyelesaikannya.' },
          { id: 'if_s6_kk_3', label: 'Mampu menerapkan arsitektur komputer, prinsip-prinsip kerja sistem operasi untuk merancang, mengimplementasikan dan mengelola sistem jaringan yang mempunyai kinerja tinggi, aman, dan efisien.' },
        ],
      },
    ],
  },

  // ============================================================
  // PROGRAM STUDI S1 SISTEM INFORMASI - SEMESTER 6
  // ============================================================
  {
    prodi: 'Sistem Informasi',
    semester: '6',
    groups: [
      {
        category: 'UI/UX Design (CPL 3, 6, 7)',
        items: [
          { id: 'si_s6_uiux_1', code: 'CPMK-03-03', label: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi.' },
          { id: 'si_s6_uiux_2', code: 'CPMK-06-04', label: 'Mampu meningkatkan layanan sistem informasi yang strategis secara jangka pendek.' },
          { id: 'si_s6_uiux_3', code: 'CPMK-07-03', label: 'Mampu menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
        ],
      },
      {
        category: 'Kuliah Kerja Nyata (CPL 7, 8)',
        items: [
          { id: 'si_s6_kkn_1', code: 'CPMK-07-03', label: 'Mampu menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
          { id: 'si_s6_kkn_2', code: 'CPMK-08-02', label: 'Mampu mengidentifikasi konsep sikap jiwa profesional (inovatif, kompetitif, unggul), dan kolaboratif dalam pengembangan diri di dunia industri dan masyarakat.' },
          { id: 'si_s6_kkn_3', code: 'CPMK-08-03', label: 'Mampu menerapkan konsep sikap jiwa profesional (inovatif, kompetitif, unggul), dan kolaboratif dalam pengembangan diri di dunia industri dan masyarakat.' },
        ],
      },
      {
        category: 'Technopreneurship (CPL 3, 9)',
        items: [
          { id: 'si_s6_techno_1', code: 'CPMK-03-01', label: 'Mampu memahami berbagai metodologi pengembangan sistem.' },
          { id: 'si_s6_techno_2', code: 'CPMK-09-03', label: 'Mampu menerapkan perencanaan Kewirausahaan berbasis Teknologi Informasi.' },
        ],
      },
      {
        category: 'Metodologi Penelitian dan Penulisan Ilmiah (CPL 3)',
        items: [
          { id: 'si_s6_metpen_1', code: 'CPMK-03-01', label: 'Mampu memahami berbagai metodologi pengembangan sistem.' },
        ],
      },
      {
        category: 'Pemrograman Aplikasi Bergerak (CPL 3)',
        items: [
          { id: 'si_s6_mobile_1', code: 'CPMK-03-02', label: 'Mampu menggunakan berbagai alat pengembangan sistem.' },
          { id: 'si_s6_mobile_2', code: 'CPMK-03-03', label: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi.' },
        ],
      },
      {
        category: 'Manajemen Proyek Sistem Informasi (CPL 7)',
        items: [
          { id: 'si_s6_mpsi_1', code: 'CPMK-07-01', label: 'Mampu memahami konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
          { id: 'si_s6_mpsi_2', code: 'CPMK-07-03', label: 'Mampu menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
        ],
      },
      {
        category: 'Kualitas Sistem Informasi (CPL 3, 6, 7)',
        items: [
          { id: 'si_s6_ksi_1', code: 'CPMK-03-03', label: 'Mampu menganalisa kebutuhan pengguna dalam membangun sistem informasi untuk mencapai tujuan organisasi.' },
          { id: 'si_s6_ksi_2', code: 'CPMK-06-04', label: 'Mampu meningkatkan layanan sistem informasi yang strategis secara jangka pendek.' },
          { id: 'si_s6_ksi_3', code: 'CPMK-07-01', label: 'Mampu memahami konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
        ],
      },
    ],
  },

  // ============================================================
  // PROGRAM STUDI S1 INFORMATIKA - SEMESTER 7
  // ============================================================
  {
    prodi: 'Informatika',
    semester: '7',
    groups: [
      {
        category: 'Aspek Sikap',
        items: [
          { id: 'if_s7_sikap_1', label: 'Menunjukkan sikap bertanggung jawab atas pekerjaan di bidangnya secara mandiri.' },
        ],
      },
      {
        category: 'Aspek Pengetahuan',
        items: [
          { id: 'if_s7_peng_1', label: 'Menguasai konsep teoritis bidang pengetahuan Informatika secara umum dan konsep teoritis bagian khusus di bidang teori komputasi, jaringan komputer, rekayasa perangkat lunak, sistem cerdas, dan data sains secara mendalam serta mampu memformulasikan penyelesaian masalah prosedural.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Umum',
        items: [
          { id: 'if_s7_ku_1', label: 'Mampu menunjukkan kinerja mandiri, bermutu, dan terukur.' },
          { id: 'if_s7_ku_2', label: 'Mampu mengkaji implikasi pengembangan atau implementasi ilmu pengetahuan dan teknologi yang memperhatikan dan menerapkan nilai humaniora sesuai dengan keahliannya berdasarkan kaidah, tata cara dan etika ilmiah dalam rangka menghasilkan solusi, gagasan, desain atau kritik seni.' },
          { id: 'if_s7_ku_3', label: 'Mampu melakukan proses evaluasi diri terhadap kelompok kerja yang berada di bawah tanggung jawabnya, dan mampu mengelola pembelajaran secara mandiri.' },
          { id: 'if_s7_ku_4', label: 'Mampu mengimplementasikan teknologi informasi dan komunikasi dalam konteks pelaksanaan pekerjaannya.' },
        ],
      },
      {
        category: 'Aspek Keterampilan Khusus',
        items: [
          { id: 'if_s7_kk_1', label: 'Mampu menerapkan arsitektur komputer, prinsip-prinsip kerja sistem operasi untuk merancang, mengimplementasikan dan mengelola sistem jaringan yang mempunyai kinerja tinggi, aman, dan efisien.' },
          { id: 'if_s7_kk_2', label: 'Mampu menganalisis masalah kompleks dan menerapkan teori komputasi untuk menyelesaikannya.' },
          { id: 'if_s7_kk_3', label: 'Mampu mendefinisikan kebutuhan pengguna atau pasar terhadap kinerja (menganalisis, mengevaluasi dan mengembangkan) algoritme/ metode berbasis komputer.' },
        ],
      },
    ],
  },

  // ============================================================
  // PROGRAM STUDI S1 SISTEM INFORMASI - SEMESTER 7
  // ============================================================
  {
    prodi: 'Sistem Informasi',
    semester: '7',
    groups: [
      {
        category: 'Riset Operasi (CPL 2)',
        items: [
          { id: 'si_s7_ro_1', code: 'CPMK-02-03', label: 'Mampu mengolah data dengan alat dan teknik pengolahan data.' },
          { id: 'si_s7_ro_2', code: 'CPMK-02-04', label: 'Mampu menganalisa data dengan alat dan teknik pengolahan data.' },
        ],
      },
      {
        category: 'Sistem Pendukung Keputusan (CPL 1, 2)',
        items: [
          { id: 'si_s7_spk_1', code: 'CPMK-01-04', label: 'Mampu menilai peran sistem informasi dalam memberikan rekomendasi pengambilan keputusan di organisasi.' },
          { id: 'si_s7_spk_2', code: 'CPMK-02-04', label: 'Mampu menganalisa data dengan alat dan teknik pengolahan data.' },
        ],
      },
      {
        category: 'Proyek Sistem Aplikasi / Capstone (CPL 7)',
        items: [
          { id: 'si_s7_cap_1', code: 'CPMK-07-03', label: 'Mampu menerapkan konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
        ],
      },
      {
        category: 'Tata Kelola Teknologi Informasi (CPL 6, 7)',
        items: [
          { id: 'si_s7_itgov_1', code: 'CPMK-06-01', label: 'Mampu merencanakan sistem informasi organisasi untuk mencapai tujuan dan sasaran organisasi jangka panjang.' },
          { id: 'si_s7_itgov_2', code: 'CPMK-07-01', label: 'Mampu memahami konsep, teknik dan metodologi manajemen proyek sistem informasi.' },
        ],
      },
      {
        category: 'Hak Atas Kekayaan Intelektual (CPL 5, 8)',
        items: [
          { id: 'si_s7_haki_1', code: 'CPMK-05-02', label: 'Mampu menerapkan kode etik dalam penggunaan informasi data pada perancangan, implementasi dan penggunaan suatu sistem.' },
          { id: 'si_s7_haki_2', code: 'CPMK-08-01', label: 'Mampu memahami konsep sikap jiwa profesional (inovatif, kompetitif, unggul), dan kolaboratif dalam pengembangan diri di dunia industri dan masyarakat.' },
        ],
      },
    ],
  },
];

export function getSidangCurriculum(prodi: 'Informatika' | 'Sistem Informasi', semester: '5' | '6' | '7'): SidangCurriculum {
  const found = SIDANG_CURRICULUMS.find((c) => c.prodi === prodi && c.semester === semester);
  if (found) return found;
  // Fallback default to Informatika semester 5
  return SIDANG_CURRICULUMS[0];
}

export function getAllSidangItems(curriculum: SidangCurriculum): SidangIndicatorItem[] {
  const items: SidangIndicatorItem[] = [];
  curriculum.groups.forEach((g) => {
    g.items.forEach((it) => items.push(it));
  });
  return items;
}
