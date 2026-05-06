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
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var s = localStorage.getItem('smm_settings');
                  if (s) {
                    var settings = JSON.parse(s);
                    if (settings.darkMode === false) {
                      document.documentElement.setAttribute('data-theme', 'light');
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        <style>{`
          [data-theme="light"] body { background-color: #ffffff !important; }
          [data-theme="light"] .shell, [data-theme="light"] .home-main { background-color: #ffffff !important; }
        `}</style>
      </head>
      <body style={{
        height: '100vh',
        overflowY: 'auto',
        fontFamily: "'Inter', sans-serif",
        margin: 0,
        padding: 0,
        background: 'var(--bg-deep, #080808)',
        color: 'var(--text-primary, #ffffff)',
      }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
