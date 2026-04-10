'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const titles: Record<string, string> = {
  '/': 'Home',
  '/ask': 'Ask Maya',
  '/login': 'Login',
  '/client': 'Client',
  '/content': 'Content',
  '/visual': 'Visual Direction',
  '/meme': 'Meme & Viral',
  '/calendar': 'Calendar',
  '/festive': 'Festive Campaigns',
  '/repurpose': 'Repurpose',
  '/schedule': 'Schedule',
  '/queue': 'Queue',
  '/history': 'Post History',
  '/ideas': 'Idea Bank',
  '/bulk': 'Bulk Generate',
  '/influencer': 'Influencer Tracker',
  '/strategy': 'Strategy',
  '/research': 'Research Intel',
  '/listen': 'Social Listening',
  '/engage': 'Engagement',
  '/ads': 'Ads & Collab',
  '/report': 'Reporting',
  '/diagnose': 'Post Diagnosis',
  '/profile': 'Profile Optimizer',
  '/dashboard': 'Dashboard',
  '/ab-testing': 'A/B Testing',
  '/brand': 'Brand Kit',
  '/saved': 'Saved Outputs',
  '/settings': 'Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const title = titles[pathname] || 'SMM Agent';
  const sub = pathname === '/' ? 'Your AI social media manager' : '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <header style={{
      padding: '16px 32px',
      borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(10,10,10,0.8)',
      backdropFilter: 'blur(20px)',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: '18px',
          fontWeight: 700,
          color: '#ffffff',
          letterSpacing: '-0.3px',
        }}>
          {title}
        </h1>
        {sub && (
          <span style={{ fontSize: '12px', color: '#71717a', marginTop: '2px' }}>
            {sub}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '0.5px solid rgba(168, 85, 247, 0.3)',
              borderRadius: '20px',
              fontSize: '12px',
              color: '#a855f7',
              fontWeight: 500,
            }}>
              {user.email?.split('@')[0]}
            </div>
            <button
              onClick={handleSignOut}
              style={{
                background: 'transparent',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '6px 12px',
                color: '#888',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Sign Out
            </button>
          </>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: 'rgba(0,255,204,0.1)',
          border: '0.5px solid rgba(0,255,204,0.3)',
          borderRadius: '24px',
          fontSize: '12px',
          color: '#00ffcc',
          fontWeight: 600,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00ffcc',
            animation: 'pulse-glow 2s infinite',
          }}></span>
          Live Search ON
        </div>
      </div>
    </header>
  );
}