import type { Metadata, Viewport } from "next"; 
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'; 
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes"; 
import { SettingsProvider } from "@/context/SettingsContext";
import { NotificationProvider } from '@/context/NotificationContext'

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
  userScalable: true,
};

export const metadata: Metadata = {
  title: "Elimen | The Next-Gen Web3 Social Platform",
  description: "Join Elimen, the ultimate Web3 social network. Claim your 100 LMO bonus now, connect with friends, and manage your LMO wallet securely.",
  keywords: ["Elimen", "Web3", "Social Media", "LMO Token", "Crypto Wallet", "Space Link"],
  
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
  
  twitter: {
    card: "summary_large_image",
    title: "Elimen | Claim your 100 LMO Bonus!",
    description: "Join Elimen, the ultimate Web3 social network. Claim your 100 LMO bonus now!",
    images: ["https://www.elimeno.live/logo.png"],
  },

  manifest: "/manifest.webmanifest", 
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Elimen",
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
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          min-h-screen 
          overflow-x-hidden
          bg-white 
          dark:bg-[#0F172A] 
          text-gray-900 
          dark:text-gray-100 
          transition-colors
        `}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SettingsProvider>
            <NotificationProvider>   {/* 👈 Add NotificationProvider here */}
              <Toaster position="bottom-right" reverseOrder={false} />
              <Navbar />
              
              {/* Mobile-optimized main container */}
              <main className="w-full max-w-md mx-auto px-4 sm:px-6 md:max-w-2xl lg:max-w-4xl pt-4 pb-20">
                {children}
              </main>
            </NotificationProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}