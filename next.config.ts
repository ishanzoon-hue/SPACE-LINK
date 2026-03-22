/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // මේකෙන් TypeScript errors තිබුණත් සයිට් එක Build කරන්න ඉඩ දෙනවා.
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint errors තිබුණත් Build කරන්න ඉඩ දෙන්න.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;