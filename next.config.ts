/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript වැරදි තිබුණත් Build එක දිගටම කරගෙන යන්න ඉඩ දෙන්න
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint වැරදි තිබුණත් Build එකට බාධා නොකරන්න
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;