import type { Metadata, Viewport } from "next"; // ✅ Viewport එක අලුතින් import කළා
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

// ✅ 1. PWA එක ෆෝන් එකේ පේන විදිහ හදන්න අලුතින් දැම්මා
export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // ෆෝන් එකේ සූම් වෙන එක නවත්තලා ඇප් එකක් වගේම තියන්න
};

// ✅ 2. iOS (Apple) සහ Android වලට ඇප් එකක් කියලා කියන්න අලුත් දේවල් දැම්මා
export const metadata: Metadata = {
  title: "SPACE LINK",
  description: "Social Media Platform",
  manifest: "/manifest.webmanifest", // 👈 අපි හදපු manifest එක සම්බන්ධ කළා
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