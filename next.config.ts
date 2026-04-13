/** @type {import('next').NextConfig} */
const nextConfig = {
  // Tambahkan baris ini agar Next.js tidak nge-bundle Sequelize secara berlebihan
  serverExternalPackages: ['sequelize'],
};

export default nextConfig;