'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Allow access to login and auth callback pages
  if (pathname === '/login' || pathname === '/auth/callback') {
    return <>{children}</>;
  }

  // If still loading, show loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#080808',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>✦</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // If no user (not logged in), redirect to login
  if (!user) {
    router.push('/login');
    return null;
  }

  // User is logged in, show full app layout
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