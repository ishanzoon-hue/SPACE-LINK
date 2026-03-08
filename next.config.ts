/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // බිල්ඩ් එරර්ස් ඉග්නෝර් කිරීමට
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwqdsnqqszoaczvokirn.supabase.co', // ඔයාගේ නිවැරදි Project ID එක
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true, // Vercel එකෙන් පින්තූර වෙනස් කිරීම වැළැක්වීමට
  },
};

export default nextConfig;