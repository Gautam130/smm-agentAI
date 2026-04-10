'use client';

export default function Loading() {
  return (
    <div className="content-area" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="home-hero" style={{ textAlign: 'center' }}>
        <div className="hero-eyebrow">
          <span className="hero-eyebrow-dot"></span>
          Live web intelligence · 2026
        </div>
        <h1 className="hero-h1">
          <span style={{ opacity: 0.3 }}>Loading...</span>
        </h1>
        <div style={{ height: '80px' }}></div>
      </div>
    </div>
  );
}