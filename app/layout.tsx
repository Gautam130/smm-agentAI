import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

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
        <div className="shell" style={{ 
          display: 'flex', 
          height: '100vh', 
          overflow: 'hidden',
          width: '100%',
        }}>
          <Sidebar />
          <main style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            background: '#080808',
          }}>
            <Topbar />
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '32px',
              position: 'relative',
              zIndex: 1,
            }}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}