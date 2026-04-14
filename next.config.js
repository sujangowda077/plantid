/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  // Enable React strict mode for better dev warnings
  reactStrictMode: true,
};
module.exports = nextConfig;
