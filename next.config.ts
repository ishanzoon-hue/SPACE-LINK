/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ඔයාගේ-supabase-project-id.supabase.co', // ඔයාගේ Supabase Project එකේ URL එක මෙතනට දෙන්න
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