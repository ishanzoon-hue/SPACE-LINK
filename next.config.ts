/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwqdsnqqszoaczvokirn.supabase.co', // මේක අකුරක්වත් වෙනස් කරන්න එපා
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true, // පින්තූර පේන්න මේක අනිවාර්යයි
  },
};

export default nextConfig;