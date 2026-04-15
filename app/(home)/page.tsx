'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const quickPrompts = [
  { label: 'Reel caption', prompt: 'Write a catchy Instagram Reel caption for my product' },
  { label: '7-day content plan', prompt: 'Create a 7-day content plan for my business' },
  { label: '10 viral hooks', prompt: 'Generate 10 viral hooks for my content' },
  { label: 'Competitor analysis', prompt: 'Analyze my competitors on social media' },
  { label: 'DM flow', prompt: 'Create a DM outreach sequence' },
  { label: 'Festive campaign', prompt: 'Plan a festive campaign for upcoming festival' },
  { label: 'Research market', prompt: 'Research my market and audience' },
  { label: 'Competitor audit', prompt: 'Do a competitor audit' },
];

const megaMenuColumns = [
  {
    title: 'Create',
    items: [
      { label: 'Content', href: '/content' },
      { label: 'Calendar', href: '/calendar' },
      { label: 'Festive Campaigns', href: '/festive' },
      { label: 'Meme & Viral', href: '/meme' },
      { label: 'Visual Direction', href: '/visual' },
      { label: 'Repurpose', href: '/repurpose' },
    ]
  },
  {
    title: 'Manage',
    items: [
      { label: 'Schedule', href: '/schedule' },
      { label: 'Queue', href: '/queue' },
      { label: 'Post History', href: '/history' },
      { label: 'Idea Bank', href: '/ideas' },
      { label: 'Bulk Generate', href: '/bulk' },
      { label: 'Influencer Tracker', href: '/influencer' },
    ]
  },
  {
    title: 'Strategy',
    items: [
      { label: 'Strategy', href: '/strategy' },
      { label: 'Research Intel', href: '/research' },
      { label: 'Social Listening', href: '/listen' },
      { label: 'Engagement', href: '/engage' },
      { label: 'Ads & Collab', href: '/ads' },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { label: 'Reporting', href: '/report' },
      { label: 'Post Diagnosis', href: '/diagnose' },
      { label: 'Profile Optimizer', href: '/profile' },
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'A/B Testing', href: '/ab-testing' },
    ]
  },
  {
    title: 'Brand',
    items: [
      { label: 'Brand Kit', href: '/brand' },
      { label: 'Saved Outputs', href: '/saved' },
    ]
  },
];

export default function HomePage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showWorkDropdown, setShowWorkDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (workDropdownRef.current && !workDropdownRef.current.contains(e.target as Node)) {
        setShowWorkDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowWorkDropdown(false);
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleQuickPrompt = (prompt: string) => {
    // Redirect to Maya with prompt
    const encodedPrompt = encodeURIComponent(prompt);
    router.push(`/ask?prompt=${encodedPrompt}`);
  };

  return (
    <div className="home-main">
      {/* Navigation */}
      <nav className="home-nav">
        <div className="home-nav-brand">SMM Agent</div>
        <div className="home-nav-links">
          <a href="/" className="active">Home</a>
          <div ref={workDropdownRef} style={{ position: 'relative' }}>
            <a 
              href="#" 
              className="dropdown-trigger"
              onClick={(e) => { e.preventDefault(); setShowWorkDropdown(!showWorkDropdown); }}
            >
              Work
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px', transition: 'transform 0.2s', transform: showWorkDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                <path d="M2 4l4 4 4-4" />
              </svg>
            </a>
            {showWorkDropdown && (
              <div className="mega-dropdown">
                <div className="mega-dropdown-inner">
                  {megaMenuColumns.map((col, colIdx) => (
                    <div key={colIdx} className="mega-column">
                      <div className="mega-column-title">{col.title}</div>
                      {col.items.map((item, itemIdx) => (
                        <a key={itemIdx} href={item.href} className="mega-item" onClick={() => setShowWorkDropdown(false)}>
                          {item.label}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <a href="/ask">Ask Maya</a>
          <div ref={userDropdownRef} style={{ position: 'relative' }}>
            <a 
              href="#" 
              className="dropdown-trigger"
              onClick={(e) => { e.preventDefault(); setShowUserDropdown(!showUserDropdown); }}
            >
              {user?.email?.split('@')[0] || 'Account'}
              <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" style={{ marginLeft: '4px' }}>
                <path d="M2 4l4 4 4-4" />
              </svg>
            </a>
            {showUserDropdown && (
              <div className="user-dropdown">
                <a href="/settings">Settings</a>
                <a href="/saved">Saved</a>
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="home-content">
        <div className="hero-section">
          <h1>Welcome to SMM Agent</h1>
          <p>Your AI-powered social media marketing assistant</p>
          <button className="cta-button" onClick={() => router.push('/ask')}>
            Start Chatting with Maya →
          </button>
        </div>

        {/* Quick Prompts */}
        <div className="quick-prompts">
          <h2>Quick Actions</h2>
          <div className="prompt-grid">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                className="prompt-card"
                onClick={() => handleQuickPrompt(item.prompt)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="feature-grid">
          <a href="/strategy" className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Strategy</h3>
            <p>Build winning social strategies</p>
          </a>
          <a href="/content" className="feature-card">
            <span className="feature-icon">✍️</span>
            <h3>Content</h3>
            <p>Create viral content</p>
          </a>
          <a href="/calendar" className="feature-card">
            <span className="feature-icon">📅</span>
            <h3>Calendar</h3>
            <p>Plan your content</p>
          </a>
          <a href="/influencer" className="feature-card">
            <span className="feature-icon">🤝</span>
            <h3>Influencers</h3>
            <p>Find and track influencers</p>
          </a>
        </div>
      </main>

      <style jsx>{`
        .home-main {
          min-height: 100vh;
          background: #0a0a0b;
          color: #fff;
        }

        .home-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .home-nav-brand {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
        }

        .home-nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .home-nav-links a {
          color: #9ca3af;
          text-decoration: none;
          transition: color 0.2s;
        }

        .home-nav-links a:hover,
        .home-nav-links a.active {
          color: #fff;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
        }

        .mega-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 1rem;
          min-width: 400px;
          z-index: 100;
        }

        .mega-dropdown-inner {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1rem;
        }

        .mega-column-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #fff;
        }

        .mega-item {
          display: block;
          padding: 0.25rem 0;
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .mega-item:hover {
          color: #fff;
        }

        .user-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 0.5rem;
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 0.5rem;
          min-width: 150px;
          z-index: 100;
        }

        .user-dropdown a,
        .user-dropdown button {
          display: block;
          width: 100%;
          padding: 0.5rem;
          color: #9ca3af;
          text-decoration: none;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .user-dropdown a:hover,
        .user-dropdown button:hover {
          color: #fff;
        }

        .home-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .hero-section {
          text-align: center;
          padding: 3rem 0;
        }

        .hero-section h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .hero-section p {
          color: #9ca3af;
          margin-bottom: 2rem;
        }

        .cta-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
          border: none;
          padding: 1rem 2rem;
          font-size: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .cta-button:hover {
          transform: scale(1.05);
        }

        .quick-prompts {
          margin: 3rem 0;
        }

        .quick-prompts h2 {
          margin-bottom: 1rem;
        }

        .prompt-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .prompt-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .prompt-card:hover {
          border-color: #667eea;
          background: #252525;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: #1a1a1a;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .feature-card:hover {
          border-color: #667eea;
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2rem;
        }

        .feature-card h3 {
          margin: 0.75rem 0 0.5rem;
        }

        .feature-card p {
          color: #9ca3af;
          font-size: 0.875rem;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
