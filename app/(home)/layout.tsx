import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMM Agent - AI Social Media Manager",
  description: "Your AI-powered social media manager with Maya AI assistant",
};

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body style={{ 
        height: '100vh', 
        overflowY: 'auto',
        background: '#000000',
        color: '#ffffff',
        fontFamily: "'Inter', sans-serif",
      }}>
        {children}
      </body>
    </html>
  );
}
