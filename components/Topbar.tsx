'use client';

import { useState, useRef, useEffect } from 'react';
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

interface TopbarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export default function Topbar({ onToggleSidebar, sidebarOpen }: TopbarProps) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const title = titles[pathname] || 'SMM Agent';
  const sub = pathname === '/' ? 'Your AI social media manager' : '';

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleProfile = () => {
    setShowUserMenu(false);
    router.push('/profile');
  };

  const handleSettings = () => {
    setShowUserMenu(false);
    router.push('/settings');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(255,255,255,0.05)',
            border: '0.5px solid rgba(255,255,255,0.1)',
            color: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          }}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{
              transition: 'transform 0.3s ease',
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

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
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user && (
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
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
                cursor: 'pointer',
              }}
            >
              {user.email?.split('@')[0]}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ transform: showUserMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>

            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '6px',
                background: '#111',
                border: '1px solid #222',
                borderRadius: '8px',
                padding: '4px',
                minWidth: '140px',
                zIndex: 50,
              }}>
                <button
                  onClick={handleProfile}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#aaa',
                    fontSize: '12px',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  Profile
                </button>
                <button
                  onClick={handleSettings}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#aaa',
                    fontSize: '12px',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  Settings
                </button>
                <button
                  onClick={handleSignOut}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#ff4444',
                    fontSize: '12px',
                    textAlign: 'left',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#1a1a1a'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
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
