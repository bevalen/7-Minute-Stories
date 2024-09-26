import type { Metadata } from "next";
import "./globals.css";
import { Inter } from 'next/font/google';
import Header from '@/components/header'; // Importing Header
import Footer from '@/components/footer'; // Importing Footer

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "7-Minute Story",
  description: "Create your 7-Minute Story with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Header /> {/* Using Header */}
        {children}
        <Footer /> {/* Using Footer */}
      </body>
    </html>
  );
}
