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

// ✅ Apple ෆෝන් එකේ ලෝගෝ එක පේන්න අලුතින් 'icons' කෑල්ල ඇඩ් කළා!
export const metadata: Metadata = {
  title: "SPACE LINK",
  description: "Social Media Platform",
  manifest: "/manifest.webmanifest", 
  icons: {
    icon: "/icon.png",      // 👈 සාමාන්‍ය Android/PC වලට
    apple: "/icon.png",     // 👈 🍎 අන්න iPhone එකේ Home Screen ලෝගෝ එක!
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Space Link",
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