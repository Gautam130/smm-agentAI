import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/components/ClientContext";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const inter = Inter({
  variable: "--font",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--head",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--mono",
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
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        background: '#080808',
        color: '#ffffff',
        fontFamily: 'var(--font)',
      }}>
        <AuthProvider>
          <ClientProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}