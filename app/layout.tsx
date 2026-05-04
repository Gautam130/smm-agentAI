import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

const inter = Inter({
  variable: "--font",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMM Agent - AI Social Media Manager",
  description: "Your AI-powered social media manager with Maya AI assistant",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body style={{
        height: '100vh',
        overflowY: 'auto',
        background: '#000000',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
        margin: 0,
        padding: 0,
      }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
