import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ClientProvider } from "@/components/ClientContext";
import { AuthProvider } from "@/lib/auth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

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

function LayoutContent({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body style={{ 
        height: '100vh', 
        overflow: 'hidden',
        display: 'flex', 
        background: '#080808',
        color: '#ffffff',
        fontFamily: 'var(--font)',
      }}>
        <AuthProvider>
          <ClientProvider>
            <ProtectedRoute>
              <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
                <Sidebar />
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  flex: 1, 
                  minWidth: 0, 
                  height: '100vh', 
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}>
                  <Topbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
                  <main style={{ 
                    flex: 1, 
                    padding: '24px', 
                    overflowY: 'auto',
                    height: 'calc(100vh - 60px)',
                    background: '#080808'
                  }}>
                    {children}
                  </main>
                </div>
              </div>
            </ProtectedRoute>
          </ClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
