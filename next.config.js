/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clicktoplay.s3.amazonaws.com',
        port: '',
        pathname: '/images/*',
      },
      {
        protocol: 'https',
        hostname: 'clicktoplay.s3.amazonaws.com',
        port: '',
        pathname: '/artists/*',
      },
      {
        protocol: 'https',
        hostname: 'clicktoplay.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/images/*',
      },
      {
        protocol: 'https',
        hostname: 'clicktoplay.s3.ap-southeast-1.amazonaws.com',
        port: '',
        pathname: '/artists/*',
      },
    ],
  },
};

module.exports = nextConfig;
