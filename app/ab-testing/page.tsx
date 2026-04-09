'use client';

import { useState } from 'react';

interface Test {
  id: number;
  name: string;
  variantA: string;
  variantB: string;
  status: 'running' | 'completed';
  winner?: string;
}

export default function ABTestingPage() {
  const [tests, setTests] = useState<Test[]>([
    { id: 1, name: 'Hook Test - Question vs Statement', variantA: 'What if...?', variantB: 'Here\'s the secret...', status: 'completed', winner: 'A' },
    { id: 2, name: 'CTA Test - Shop Now vs Learn More', variantA: 'Shop Now', variantB: 'Learn More', status: 'running' },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');

  const createTest = () => {
    if (!newName || !variantA || !variantB) return;
    setTests([...tests, { id: Date.now(), name: newName, variantA, variantB, status: 'running' }]);
    setNewName('');
    setVariantA('');
    setVariantB('');
    setShowCreate(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700 }}>🧪 A/B Testing</h2>
          <button onClick={() => setShowCreate(!showCreate)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>+ New Test</button>
        </div>
        
        {showCreate && (
          <div style={{ marginBottom: '20px', padding: '20px', background: '#111111', borderRadius: '12px' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Test name" style={{ width: '100%', background: '#080808', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#ffffff', outline: 'none', marginBottom: '12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <input value={variantA} onChange={(e) => setVariantA(e.target.value)} placeholder="Variant A" style={{ background: '#080808', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#ffffff', outline: 'none' }} />
              <input value={variantB} onChange={(e) => setVariantB(e.target.value)} placeholder="Variant B" style={{ background: '#080808', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#ffffff', outline: 'none' }} />
            </div>
            <button onClick={createTest} style={{ marginTop: '12px', padding: '12px 24px', background: '#a855f7', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Start Test</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tests.map((test) => (
            <div key={test.id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>{test.name}</div>
                <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: test.status === 'running' ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.1)', color: test.status === 'running' ? '#fbbf24' : '#4ade80' }}>{test.status}</span>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px' }}>
                <div style={{ flex: 1, padding: '12px', background: test.winner === 'A' ? 'rgba(0,255,204,0.1)' : '#080808', borderRadius: '8px', border: test.winner === 'A' ? '1px solid #00ffcc' : '1px solid transparent' }}>
                  <div style={{ color: '#71717a', marginBottom: '4px' }}>Variant A</div>
                  <div style={{ color: '#ffffff' }}>{test.variantA}</div>
                </div>
                <div style={{ flex: 1, padding: '12px', background: test.winner === 'B' ? 'rgba(0,255,204,0.1)' : '#080808', borderRadius: '8px', border: test.winner === 'B' ? '1px solid #00ffcc' : '1px solid transparent' }}>
                  <div style={{ color: '#71717a', marginBottom: '4px' }}>Variant B</div>
                  <div style={{ color: '#ffffff' }}>{test.variantB}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}