'use client';

import { useState } from 'react';

const dashboardData = {
  followers: '12.5K',
  following: '892',
  posts: '156',
  engagement: '4.2%',
  reach: '45.2K',
  impressions: '89.1K',
};

const posts = [
  { id: 1, type: 'Reel', likes: 1240, comments: 89, shares: 45, date: '2026-04-08' },
  { id: 2, type: 'Carousel', likes: 856, comments: 67, shares: 23, date: '2026-04-06' },
  { id: 3, type: 'Static', likes: 542, comments: 34, shares: 12, date: '2026-04-04' },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState('7 days');

  const kpiCards = [
    { label: 'Followers', value: dashboardData.followers, change: '+12%', color: '#00ffcc' },
    { label: 'Posts', value: dashboardData.posts, change: '+5', color: '#a855f7' },
    { label: 'Engagement Rate', value: dashboardData.engagement, change: '+0.8%', color: '#4ade80' },
    { label: 'Reach', value: dashboardData.reach, change: '+18%', color: '#fbbf24' },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 className="module-title">📊 Analytics Dashboard</h2>
        <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)}>
          <option>7 days</option>
          <option>30 days</option>
          <option>90 days</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div style={{ fontSize: '12px', color: '#71717a', marginBottom: '8px' }}>{kpi.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>{kpi.value}</div>
            <div style={{ fontSize: '12px', color: kpi.color }}>{kpi.change} vs last period</div>
          </div>
        ))}
      </div>

      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Recent Post Performance</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {posts.map((post) => (
            <div key={post.id} className="post-row">
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{post.type}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{post.date}</div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 600, color: '#00ffcc' }}>{post.likes.toLocaleString()}</div><div style={{ fontSize: '11px', color: '#71717a' }}>Likes</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 600, color: '#a855f7' }}>{post.comments}</div><div style={{ fontSize: '11px', color: '#71717a' }}>Comments</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: '14px', fontWeight: 600, color: '#4ade80' }}>{post.shares}</div><div style={{ fontSize: '11px', color: '#71717a' }}>Shares</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Audience Growth</h3>
          <div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#71717a' }}>Chart placeholder</div>
        </div>
        <div className="dashboard-card">
          <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Top Content Types</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Reels 45%', 'Carousel 30%', 'Static 15%', 'Stories 10%'].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#a1a1aa' }}>{item.split(' ')[0]}</span>
                <div style={{ flex: 1, height: '8px', background: '#111111', borderRadius: '4px', margin: '0 12px' }}>
                  <div style={{ width: item.split(' ')[1], height: '100%', background: '#00ffcc', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '13px', color: '#00ffcc' }}>{item.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}