/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['sequelize'],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    memoryBasedWorkersCount: true,
  }
};

export default nextConfig;