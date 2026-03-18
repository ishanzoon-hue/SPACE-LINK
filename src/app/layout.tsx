import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast'; 
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "next-themes"; // ✅ මේක අනිවාර්යයි Dark Mode වලට

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPACE LINK",
  description: "Social Media Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning> {/* ✅ suppressHydrationWarning එක දාන්න */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white dark:bg-[#0F172A] text-gray-900 dark:text-gray-100 transition-colors`}
      >
        {/* ✅ ThemeProvider එක ඇතුළේ තමයි ඔක්කොම තියෙන්න ඕනේ */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <Toaster position="bottom-right" reverseOrder={false} />
          
          <Navbar />

          <main>
            {children}
          </main>

        </ThemeProvider>
      </body>
    </html>
  );
}