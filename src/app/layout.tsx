import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";

// නිවැරදි Import එක
import { createClient } from '@/utils/supabase/server'; 
import IncomingCall from '@/components/IncomingCall';

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // සර්වර් සයිඩ් එකේදී පරිශීලකයා ලබා ගැනීම
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

          {/* පරිශීලකයා ලොග් වී ඇත්නම් පමණක් කෝල් ලොජික් එක පෙන්වන්න. 
            අපි උඩින් Import කරපු නමම (IncomingCall) මෙතනට පාවිච්චි කරන්න.
          */}
          {user && <IncomingCall />}
          
        </ThemeProvider>
      </body>
    </html>
  );
}