'use client';

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
        {params.slug.charAt(0).toUpperCase() + params.slug.slice(1).replace(/-/g, ' ')}
      </h2>
      <p style={{ fontSize: '14px', color: '#71717a' }}>
        This module is coming soon. Check back later!
      </p>
    </div>
  );
}