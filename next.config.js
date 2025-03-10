/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com', 'twitter.com', 'x.com'],
  },
};

module.exports = nextConfig; 