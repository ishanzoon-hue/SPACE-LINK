/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vwqdsnqqszoaczvokirn.supabase.co', // ඔයාගේ නිවැරදි Supabase ලින්ක් එක
      },
      // Google වලින් ලොග් වෙනවා නම් (Google Auth) මේකත් ඕනේ වෙයි
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', 
      }
    ],
  },
};

module.exports = nextConfig;