'use client';

interface ComingSoonProps {
  title: string;
  icon?: string;
}

export default function ComingSoon({ title, icon = '🚧' }: ComingSoonProps) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#ffffff' }}>
        {title}
      </h2>
      <p style={{ fontSize: '14px', color: '#71717a' }}>
        This module is coming soon. Check back later!
      </p>
      <a href="/" style={{ display: 'inline-block', marginTop: '24px', padding: '12px 24px', background: 'rgba(0,255,204,0.1)', border: '1px solid rgba(0,255,204,0.3)', borderRadius: '12px', color: '#00ffcc', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>
        ← Back to Home
      </a>
    </div>
  );
}