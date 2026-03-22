/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript errors තිබුණත් බිල්ඩ් කරන්න ඉඩ දෙනවා
    ignoreBuildErrors: true,
  },
  // 💡 Next.js 16 වල ESLint settings දැන් වෙනස් විදිහකටයි ගන්නේ. 
  // දැනට මේක අයින් කළාම අර Warning එක නැති වෙලා යයි.
};

export default nextConfig;