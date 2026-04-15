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

const templateCards = [
  { icon: '✍️', title: 'Content', desc: 'Captions, hooks, threads', href: '/content' },
  { icon: '📅', title: 'Calendar', desc: 'Full month content plan', href: '/calendar' },
  { icon: '🤝', title: 'Influencers', desc: 'Find, pitch, track', href: '/influencer' },
  { icon: '📊', title: 'Strategy', desc: 'Audit, trends, growth', href: '/strategy' },
  { icon: '⚡', title: 'Bulk Generate', desc: '10 posts in one shot', href: '/bulk' },
  { icon: '🌐', title: 'Listening', desc: 'Monitor, newsjack', href: '/listen' },
  { icon: '💬', title: 'Engagement', desc: 'Replies, DMs, crisis', href: '/engage' },
  { icon: '🔬', title: 'Diagnosis', desc: 'Why did this flop?', href: '/diagnose' },
];

const recentWork = [
  { title: 'boAt Marketing Strategy', date: '2 hours ago' },
  { title: 'Mamaearth Festive Campaign', date: 'Yesterday' },
  { title: 'D2C Content Calendar', date: '3 days ago' },
  { title: 'Competitor Analysis Report', date: '1 week ago' },
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
  const [query, setQuery] = useState('');
  const [showWorkDropdown, setShowWorkDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const workDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/ask?prompt=${encodeURIComponent(query)}`);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    router.push(`/ask?prompt=${encodeURIComponent(prompt)}`);
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
                <a href="/profile">Profile</a>
                <a href="/settings">Settings</a>
                <a href="/saved">Saved</a>
                <button onClick={handleSignOut}>Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="home-hero">
        <h1 className="home-hero-title">
          Your AI Social<br /><span>Media Partner</span>
        </h1>
        <p className="home-hero-subtitle">
          Create, schedule, and analyze — all in one place
        </p>

        {/* Search Box */}
        <div className="home-search-container">
          <div className="home-search-box">
            <textarea
              ref={inputRef}
              className="home-search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
              placeholder="What do you need? (e.g. a week of Instagram posts for my cafe)"
              rows={1}
            />
            <button className="home-search-btn" onClick={handleSearch}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
          <div className="home-search-hint">Press Enter to send · Shift+Enter for new line</div>
        </div>

        {/* Quick Prompts */}
        <div className="home-prompts">
          {quickPrompts.map((qp, i) => (
            <button key={i} className="home-prompt-btn" onClick={() => handleQuickPrompt(qp.prompt)}>
              {qp.label}
            </button>
          ))}
        </div>
      </section>

      {/* Template Cards */}
      <section className="home-templates">
        <div className="home-section-title">Quick Actions</div>
        <div className="home-templates-grid">
          {templateCards.map((card, i) => (
            <a key={i} href={card.href} className="home-template-card">
              <div className="home-template-icon">{card.icon}</div>
              <div className="home-template-title">{card.title}</div>
              <div className="home-template-desc">{card.desc}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Recent Work */}
      <section className="home-recent-work">
        <div className="home-section-title">Recent Work</div>
        <div className="home-work-list">
          {recentWork.map((item, i) => (
            <div key={i} className="home-work-item">
              <span className="home-work-title">{item.title}</span>
              <span className="home-work-meta">{item.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="home-footer-links">
          <a href="/settings">Settings</a>
          <a href="/saved">Saved</a>
        </div>
        <div className="home-footer-copy">© 2026 SMM Agent</div>
      </footer>

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
          border-bottom: 1px solid #1E1E20;
        }

        .home-nav-brand {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .home-nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .home-nav-links a {
          color: #9ca3af;
          text-decoration: none;
          font-size: 0.875rem;
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
          left: 50%;
          transform: translateX(-50%);
          margin-top: 8px;
          background: #111113;
          border: 1px solid #1E1E20;
          border-radius: 16px;
          padding: 24px;
          z-index: 1000;
          min-width: 600px;
        }

        .mega-dropdown-inner {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 24px;
        }

        .mega-column-title {
          font-weight: 600;
          margin-bottom: 12px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #9ca3af;
        }

        .mega-item {
          display: block;
          padding: 6px 0;
          color: #d4d4d8;
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
          margin-top: 8px;
          background: #111113;
          border: 1px solid #1E1E20;
          border-radius: 12px;
          padding: 8px;
          min-width: 160px;
          z-index: 1000;
        }

        .user-dropdown a,
        .user-dropdown button {
          display: block;
          width: 100%;
          padding: 10px 12px;
          color: #d4d4d8;
          text-decoration: none;
          text-align: left;
          background: none;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .user-dropdown a:hover,
        .user-dropdown button:hover {
          background: #1a1a1c;
          color: #fff;
        }

        .home-hero {
          text-align: center;
          padding: 80px 24px;
          max-width: 800px;
          margin: 0 auto;
        }

        .home-hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 16px;
        }

        .home-hero-title span {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .home-hero-subtitle {
          font-size: 1.125rem;
          color: #9ca3af;
          margin-bottom: 40px;
        }

        .home-search-container {
          max-width: 600px;
          margin: 0 auto 32px;
        }

        .home-search-box {
          display: flex;
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 8px 8px 8px 16px;
          align-items: center;
          transition: border-color 0.2s;
        }

        .home-search-box:focus-within {
          border-color: #6366f1;
        }

        .home-search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #fff;
          font-size: 1rem;
          resize: none;
          max-height: 120px;
        }

        .home-search-input::placeholder {
          color: #52525b;
        }

        .home-search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 10px;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .home-search-hint {
          color: #52525b;
          font-size: 0.75rem;
          margin-top: 8px;
        }

        .home-prompts {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .home-prompt-btn {
          background: #18181b;
          border: 1px solid #27272a;
          color: #d4d4d8;
          padding: 10px 16px;
          border-radius: 20px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .home-prompt-btn:hover {
          border-color: #6366f1;
          color: #fff;
        }

        .home-section-title {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #71717a;
          margin-bottom: 16px;
        }

        .home-templates {
          padding: 40px 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .home-templates-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .home-template-card {
          background: #18181b;
          border: 1px solid #27272a;
          border-radius: 16px;
          padding: 20px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .home-template-card:hover {
          border-color: #6366f1;
          transform: translateY(-2px);
        }

        .home-template-icon {
          font-size: 1.5rem;
          margin-bottom: 12px;
        }

        .home-template-title {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .home-template-desc {
          font-size: 0.75rem;
          color: #71717a;
        }

        .home-recent-work {
          padding: 40px 24px;
          max-width: 600px;
          margin: 0 auto;
        }

        .home-work-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .home-work-item {
          display: flex;
          justify-content: space-between;
          padding: 12px 16px;
          background: #18181b;
          border-radius: 8px;
        }

        .home-work-title {
          color: #d4d4d8;
        }

        .home-work-meta {
          color: #52525b;
          font-size: 0.875rem;
        }

        .home-footer {
          display: flex;
          justify-content: space-between;
          padding: 24px;
          border-top: 1px solid #1E1E20;
          max-width: 1000px;
          margin: 0 auto;
        }

        .home-footer-links {
          display: flex;
          gap: 24px;
        }

        .home-footer-links a {
          color: #71717a;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .home-footer-links a:hover {
          color: #fff;
        }

        .home-footer-copy {
          color: #52525b;
          font-size: 0.875rem;
        }

        @media (max-width: 768px) {
          .home-hero-title {
            font-size: 2.5rem;
          }

          .home-templates-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}
