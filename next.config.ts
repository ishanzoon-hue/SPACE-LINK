/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Build එකේදී Memory (RAM) එක පිරෙන එක නවත්වන්න මේක අනිවාර්යයෙන්ම දාන්න
  productionBrowserSourceMaps: false,
};

export default nextConfig;