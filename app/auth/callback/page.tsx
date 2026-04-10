'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = getSupabase();
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session) {
        router.push('/');
      } else if (error) {
        console.error('Auth error:', error);
        router.push('/login?error=auth_failed');
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    handleCallback();
  }, [router]);

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
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
          <div>Signing you in...</div>
        </div>
      </div>
    );
  }

  return null;
}