'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Successfully authenticated, redirect to home
      router.push('/');
    } else {
      // No user, redirect to login
      router.push('/login');
    }
  }, [user, router]);

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
        <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
        <div>Signing you in...</div>
      </div>
    </div>
  );
}