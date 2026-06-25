/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan baris ini agar Next.js tidak nge-bundle Sequelize secara berlebihan
  serverExternalPackages: ['sequelize'],
  swcMinify: false,
  experimental: {
    // Membatasi worker yang berjalan bersamaan saat build untuk menghemat RAM
    memoryBasedWorkersCount: true,
  }
};

export default nextConfig;