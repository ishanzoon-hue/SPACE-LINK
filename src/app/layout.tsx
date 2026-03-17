import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

// අලුතින් එකතු කළ යුතු Import දෙක මෙන්න
import { createClient } from '@/utils/supabase/server'; 
import IncomingCallHandler from '@/components/IncomingCallHandler';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Elimeno",
  description: "Join the conversation today on Elimeno.",
};

// Layout එක 'async' ලෙස වෙනස් කරන්න
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. සර්වර් සයිඩ් එකේදී පරිශීලකයා ලබා ගැනීම
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-spl-gray dark:bg-[#020817] text-spl-black dark:text-gray-200 transition-colors`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </main>
          <Footer />

          {/* 2. පරිශීලකයා ලොග් වී ඇත්නම් පමණක් Call Handler එක පෙන්වන්න */}
          {user && <IncomingCallHandler currentUserId={user.id} />}
          
        </ThemeProvider>
      </body>
    </html>
  );
}