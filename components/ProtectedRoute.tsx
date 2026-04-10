'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted (prevents flash)
  if (!mounted) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#080808', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          fontSize: '40px',
          background: 'linear-gradient(135deg, #00ffcc, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          ✦
        </div>
      </div>
    );
  }

  // Allow access to login and auth callback pages
  if (pathname === '/login' || pathname === '/auth/callback') {
    return <>{children}</>;
  }

  // If still checking auth, show clean loading
  if (authLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#080808', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px',
      }}>
        <div style={{ 
          fontSize: '40px',
          background: 'linear-gradient(135deg, #00ffcc, #a855f7)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'pulse 2s infinite',
        }}>
          ✦
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    router.push('/login');
    return null;
  }

  // User logged in - show full app
  return (
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
          position: 'relative',
          zIndex: 1,
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}