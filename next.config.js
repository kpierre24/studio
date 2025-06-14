// next.config.js
/** @type {import('next').NextConfig} */
const nextConfigJs = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'scontent.fpos1-1.fna.fbcdn.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfigJs;
