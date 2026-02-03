/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.platform === 'win32' ? undefined : 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
