'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClients } from './ClientContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  label: string;
  id: string;
  items: NavItem[];
}

const navItems: { section: string; items: NavItem[] }[] = [
  {
    section: 'Quick Access',
    items: [
      { label: 'Home', href: '/', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 6.5L8 2l6 4.5V14H2V6.5z"></path></svg> },
      { label: 'Ask Maya', href: '/ask', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 11V4a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H6l-4 3z"></path></svg>, badge: 'Live' },
      { label: 'Client', href: '/client', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zM2 14c0-3 2.7-6 6-6s6 3 6 6"></path></svg> },
    ],
  },
];

const navGroups: NavGroup[] = [
  {
    label: 'Create',
    id: 'create',
    items: [
      { label: 'Content', href: '/content', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><rect height="12" rx="2" width="12" x="2" y="2"></rect><path d="M5 6h6M5 9h4"></path></svg>, badge: 'AI' },
      { label: 'Visual Direction', href: '/visual', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><rect height="10" rx="2" width="14" x="1" y="3"></rect><circle cx="5" cy="7" r="1.5"></circle><path d="M1 10l3.5-3 3 3 2.5-2.5 4 4"></path></svg>, badge: 'New' },
      { label: 'Meme & Viral', href: '/meme', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"></circle><path d="M5 9.5s1 1.5 3 1.5 3-1.5 3-1.5M6 6.5h.5M9.5 6.5h.5"></path></svg>, badge: 'New' },
      { label: 'Calendar', href: '/calendar', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><rect height="11" rx="2" width="14" x="1" y="3"></rect><path d="M1 7h14M5 1v4M11 1v4"></path></svg>, badge: 'AI' },
      { label: 'Festive Campaigns', href: '/festive', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5z"></path></svg>, badge: 'New' },
      { label: 'Repurpose', href: '/repurpose', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M3 8a5 5 0 0110 0M13 6l2 2-2 2M3 10L1 8l2-2"></path></svg>, badge: 'AI' },
    ],
  },
  {
    label: 'Manage',
    id: 'manage',
    items: [
      { label: 'Schedule', href: '/schedule', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"></circle><path d="M8 5v3l2 2"></path></svg> },
      { label: 'Queue', href: '/queue', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 4h12M2 8h9M2 12h6"></path></svg> },
      { label: 'Post History', href: '/history', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"></circle><path d="M8 5v3l-2 2"></path></svg> },
      { label: 'Idea Bank', href: '/ideas', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="6" r="3"></circle><path d="M6 9v4M10 9v4M6 12h4"></path></svg> },
      { label: 'Bulk Generate', href: '/bulk', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><rect height="6" rx="1" width="6" x="1" y="1"></rect><rect height="6" rx="1" width="6" x="9" y="1"></rect><rect height="6" rx="1" width="6" x="1" y="9"></rect><rect height="6" rx="1" width="6" x="9" y="9"></rect></svg>, badge: 'New' },
      { label: 'Influencer Tracker', href: '/influencer', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="6" cy="5" r="3"></circle><path d="M1 14c0-3 2-5 5-5M11 9l4 4-1.5 1.5L9.5 11"></path></svg>, badge: 'New' },
    ],
  },
  {
    label: 'Strategy',
    id: 'strategy',
    items: [
      { label: 'Strategy', href: '/strategy', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 14V5l4-3 4 3 4-3v9l-4 3-4-3-4 3z"></path></svg>, badge: 'Live' },
      { label: 'Research Intel', href: '/research', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="7" cy="7" r="5"></circle><path d="M11 11l3 3"></path><path d="M5 7h4M7 5v4"></path></svg>, badge: 'New+AI' },
      { label: 'Social Listening', href: '/listen', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M6 2a4 4 0 014 4v3a4 4 0 01-8 0V6a4 4 0 014-4zM3 9a5 5 0 0010 0M8 13v2"></path></svg>, badge: 'New+Live' },
      { label: 'Engagement', href: '/engage', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 12V5a2 2 0 012-2h8a2 2 0 012 2v5a2 2 0 01-2 2H6l-4 2z"></path></svg>, badge: 'AI' },
      { label: 'Ads & Collab', href: '/ads', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M1 11l4-8 3 5 2-3 5 6H1z"></path></svg>, badge: 'AI' },
    ],
  },
  {
    label: 'Analytics',
    id: 'analytics',
    items: [
      { label: 'Reporting', href: '/report', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M2 14V9l3-3 3 3 3-5 3 2v8H2z"></path></svg>, badge: 'AI' },
      { label: 'Post Diagnosis', href: '/diagnose', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6"></circle><path d="M8 5v3M8 11h.01"></path></svg>, badge: 'New' },
      { label: 'Profile Optimizer', href: '/profile', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3"></circle><path d="M2 14c0-4 2.7-6 6-6s6 2 6 6"></path></svg>, badge: 'New' },
      { label: 'Dashboard', href: '/dashboard', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="8" width="3" height="6" rx="1"/><rect x="6" y="5" width="3" height="9" rx="1"/><rect x="11" y="2" width="3" height="12" rx="1"/></svg> },
      { label: 'A/B Testing', href: '/ab-testing', icon: <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 2v4M8 10v4M4 8H2M14 8h-2M5.17 5.17l-1.41 1.41M12.24 12.24l-1.41 1.41M5.17 10.83l-1.41-1.41M12.24 3.76l-1.41-1.41"/></svg> },
    ],
  },
  {
    label: 'Brand',
    id: 'brand',
    items: [
      { label: 'Brand Kit', href: '/brand', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><polygon points="8,1 10,6 15,6 11,9 13,14 8,11 3,14 5,9 1,6 6,6"></polygon></svg> },
      { label: 'Saved Outputs', href: '/saved', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><path d="M3 2h10v12l-5-3-5 3V2z"></path></svg> },
    ],
  },
  {
    label: 'Settings',
    id: 'settings',
    items: [
      { label: 'Settings', href: '/settings', icon: <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2"></circle><path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.5 1.5M12 12l1.5 1.5M2.5 13.5l1.5-1.5M12 4l1.5-1.5"></path></svg> },
    ],
  },
];

function Badge({ type }: { type?: string }) {
  if (!type) return null;
  
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'AI': { bg: 'rgba(0,255,204,0.1)', text: '#00ffcc', border: 'rgba(0,255,204,0.3)' },
    'Live': { bg: 'rgba(0,255,204,0.1)', text: '#00ffcc', border: 'rgba(0,255,204,0.3)' },
    'New': { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    'New+AI': { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
    'New+Live': { bg: 'rgba(168,85,247,0.1)', text: '#a855f7', border: 'rgba(168,85,247,0.3)' },
  };
  
  const style = colors[type] || colors['AI'];
  
  return (
    <span style={{
      marginLeft: 'auto',
      fontSize: '10px',
      padding: '4px 10px',
      borderRadius: '20px',
      fontWeight: 700,
      background: style.bg,
      color: style.text,
      border: `0.5px solid ${style.border}`,
    }}>
      {type}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { clients, activeClient, setActiveClient, addClient } = useClients();
  const [showAdd, setShowAdd] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    create: false,
    manage: false,
    strategy: false,
    analytics: false,
    brand: false,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  const handleAddClient = () => {
    if (newClientName.trim()) {
      addClient(newClientName.trim());
      setNewClientName('');
      setShowAdd(false);
    }
  };

  return (
    <aside style={{
      width: '280px',
      minWidth: '280px',
      background: '#0a0a0a',
      borderRight: '0.5px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      backdropFilter: 'blur(20px)',
    }}>
      {/* Brand */}
      <div style={{
        padding: '24px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        background: 'linear-gradient(180deg, #0a0a0a 0%, rgba(10,10,10,0.5) 100%)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ffcc 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '11px',
              color: '#080808',
              boxShadow: '0 4px 20px rgba(0,255,204,0.2)',
            }}>
              SMM
            </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '16px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.3px',
          }}>
            SMM Agent
          </div>
        </div>
      </div>

      {/* Client Switcher */}
      <div style={{
        padding: '20px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        background: 'rgba(10,10,10,0.5)',
      }}>
        <div style={{
          fontSize: '10px',
          color: '#71717a',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '1.2px',
          marginBottom: '10px',
        }}>
          Active Client
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <select 
            value={activeClient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id === Number(e.target.value));
              setActiveClient(client || null);
            }}
            style={{
              flex: 1,
              background: '#111111',
              border: '0.5px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#ffffff',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="">Select client...</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: 'rgba(0,255,204,0.1)',
              border: '0.5px solid rgba(0,255,204,0.3)',
              color: '#00ffcc',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            +
          </button>
        </div>
        
        {showAdd && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <input
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              placeholder="Client name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddClient()}
              style={{
                flex: 1,
                background: '#080808',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
            <button
              onClick={handleAddClient}
              style={{
                padding: '8px 14px',
                background: '#00ffcc',
                color: '#080808',
                border: 'none',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </div>
        )}
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginTop: '12px',
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
          {activeClient ? activeClient.name : 'No client selected'}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: '8px 12px' }}>
        {/* Quick Access */}
        <div style={{ padding: '4px 12px' }}>
          <div style={{
            fontSize: '9px',
            color: '#52525b',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            padding: '12px 0 6px',
          }}>Quick Access</div>
            {navItems[0].items.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <button 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isActive(item.href) ? 'rgba(0,255,204,0.1)' : 'transparent',
                  color: isActive(item.href) ? '#00ffcc' : '#a1a1aa',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.href)) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isActive(item.href) ? 'rgba(0,255,204,0.1)' : 'transparent';
                  e.currentTarget.style.color = isActive(item.href) ? '#00ffcc' : '#a1a1aa';
                }}
              >
                <span style={{ width: '18px', height: '18px', flexShrink: 0, opacity: isActive(item.href) ? 1 : 0.7 }}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge && <Badge type={item.badge} />}
              </button>
            </Link>
          ))}
        </div>

        <div style={{ height: '0.5px', background: 'rgba(255,255,255,0.08)', margin: '8px 12px' }} />

        {/* Collapsible Groups */}
        {navGroups.map((group) => (
          <div key={group.id} style={{ padding: '0 12px', marginBottom: '8px' }}>
            <button
              onClick={() => toggleGroup(group.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                cursor: 'pointer',
                borderRadius: '12px',
                background: 'transparent',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{
                fontSize: '11px',
                color: '#71717a',
                fontWeight: 700,
                letterSpacing: '0.5px',
              }}>
                {group.label}
              </span>
              <span style={{
                width: '14px',
                height: '14px',
                color: '#71717a',
                transform: openGroups[group.id] ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }}>
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 12 12">
                  <path d="M4 2l4 4-4 4" />
                </svg>
              </span>
            </button>
            <div style={{
              overflow: 'hidden',
              maxHeight: openGroups[group.id] ? '800px' : '0',
              opacity: openGroups[group.id] ? 1 : 0,
              transition: 'all 0.3s ease',
            }}>
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <button 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive(item.href) ? 'rgba(0,255,204,0.1)' : 'transparent',
                      color: isActive(item.href) ? '#00ffcc' : '#a1a1aa',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      marginBottom: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.href)) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = '#ffffff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isActive(item.href) ? 'rgba(0,255,204,0.1)' : 'transparent';
                      e.currentTarget.style.color = isActive(item.href) ? '#00ffcc' : '#a1a1aa';
                    }}
                  >
                    <span style={{ width: '18px', height: '18px', flexShrink: 0, opacity: isActive(item.href) ? 1 : 0.7 }}>
                      {item.icon}
                    </span>
                    {item.label}
                    {item.badge && <Badge type={item.badge} />}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}