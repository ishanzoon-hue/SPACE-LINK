import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'; 
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes"; 
import { SettingsProvider } from "@/context/SettingsContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, 
};

// ✅ අලුත් SEO සෙටින්ග්ස් + කලින් තිබ්බ Apple PWA සෙටින්ග්ස් එකට එකතු කළා!
export const metadata: Metadata = {
  title: "Elimen | The Next-Gen Web3 Social Platform",
  description: "Join Elimen, the ultimate Web3 social network. Claim your 100 LMO bonus now, connect with friends, and manage your LMO wallet securely.",
  keywords: ["Elimen", "Web3", "Social Media", "LMO Token", "Crypto Wallet", "Space Link"],
  
  // Facebook, WhatsApp වගේ ඒවගේ ලින්ක් එක ෂෙයාර් කරද්දි පේන විදිහ
  openGraph: {
    title: "Elimen | The Next-Gen Web3 Social Platform",
    description: "Join Elimen, the ultimate Web3 social network. Claim your 100 LMO bonus now!",
    url: "https://www.elimeno.live",
    siteName: "Elimen",
    images: [
      {
        url: "https://www.elimeno.live/logo.png",
        width: 1200,
        height: 630,
        alt: "Elimen Web3 Social Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  
  // Twitter (X) වල ෂෙයාර් කරද්දි
  twitter: {
    card: "summary_large_image",
    title: "Elimen | Claim your 100 LMO Bonus!",
    description: "Join Elimen, the ultimate Web3 social network. Claim your 100 LMO bonus now!",
    images: ["https://www.elimeno.live/logo.png"],
  },

  // Apple ෆෝන් සහ PWA (Install) සෙටින්ග්ස් (කිසිම වෙනසක් කරේ නෑ, නම විතරක් හැදුවා)
  manifest: "/manifest.webmanifest", 
  icons: {
    icon: "/icon.png",      // 👈 සාමාන්‍ය Android/PC වලට
    apple: "/icon.png",     // 👈 🍎 අන්න iPhone එකේ Home Screen ලෝගෝ එක!
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elimen", // 👈 මෙතනත් අලුත් නම දැම්මා
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> 
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 transition-colors`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <SettingsProvider>
            <Toaster position="bottom-right" reverseOrder={false} />
            <Navbar />
            <main>
              {children}
            </main>
          </SettingsProvider>

        </ThemeProvider>
      </body>
    </html>
  );
}