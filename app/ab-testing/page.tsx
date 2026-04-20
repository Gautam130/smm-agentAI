'use client';

import { useState, useEffect } from 'react';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';

interface ABTest {
  id: string;
  name: string;
  variantA: string;
  variantB: string;
  type: 'hook' | 'cta' | 'caption' | 'timing' | 'audience';
  status: 'draft' | 'running' | 'completed';
  winner?: 'A' | 'B';
  results?: { a: number; b: number };
  createdAt: string;
}

const initialTests: ABTest[] = [
  {
    id: '1',
    name: 'Hook Test - Question vs Statement',
    variantA: 'What if you could...',
    variantB: 'Here\'s the secret...',
    type: 'hook',
    status: 'completed',
    winner: 'A',
    results: { a: 45, b: 32 },
    createdAt: '2026-04-01'
  },
  {
    id: '2',
    name: 'CTA Button - Shop Now vs Learn More',
    variantA: 'Shop Now',
    variantB: 'Learn More',
    type: 'cta',
    status: 'running',
    createdAt: '2026-04-10'
  }
];

export default function ABTestingPage() {
  const [tests, setTests] = useLocalStorage<ABTest[]>('smm_ab_tests', initialTests);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  const [newName, setNewName] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [testType, setTestType] = useState<ABTest['type']>('hook');

  const { response, isLoading, sendMessage } = useStreamingChat();

  const createTest = () => {
    if (!newName || !variantA || !variantB) return;
    
    const newTest: ABTest = {
      id: Date.now().toString(),
      name: newName,
      variantA,
      variantB,
      type: testType,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setTests([...tests, newTest]);
    setNewName('');
    setVariantA('');
    setVariantB('');
    setShowCreate(false);
  };

  const startTest = (id: string) => {
    setTests(tests.map(t => t.id === id ? { ...t, status: 'running' as const } : t));
  };

  const completeTest = (id: string, winner: 'A' | 'B') => {
    setTests(tests.map(t => t.id === id ? { ...t, status: 'completed' as const, winner } : t));
  };

  const deleteTest = (id: string) => {
    setTests(tests.filter(t => t.id !== id));
  };

  const generateHypothesis = async () => {
    const prompt = `Generate 5 A/B test hypotheses for Instagram content. For each include:
- What to test (hook, CTA, timing, etc.)
- Variant A and B descriptions
- Why this matters

Format as a simple list.`;
    
    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'content' });
  };

  const templates = [
    { type: 'hook', a: 'Question hook', b: 'Statement hook' },
    { type: 'hook', a: 'Curiosity gap', b: 'Direct benefit' },
    { type: 'cta', a: 'Shop Now', b: 'Learn More' },
    { type: 'cta', a: 'DM us', b: 'Click link' },
    { type: 'caption', a: 'Long story', b: 'Short & punchy' },
    { type: 'timing', a: 'Morning 7AM', b: 'Evening 8PM' },
  ];

  return (
    <>
      <h2 className="module-title">🧪 A/B Testing</h2>

      <div className="notice n-green mb-4">
        📝 Test different content variations to optimize your strategy. Track results and let data decide.
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowCreate(!showCreate)} className="run-btn">
          {showCreate ? 'Cancel' : '+ New Test'}
        </button>
        <button onClick={() => setShowTemplates(!showTemplates)} className="run-btn btn-purple">
          📋 Templates
        </button>
      </div>

      {showTemplates && (
        <div className="output-wrap mb-4">
          <div className="output-header">
            <div className="output-label text-purple">Quick Templates</div>
          </div>
          <div className="output-box" style={{ padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {templates.map((t, i) => (
                <button 
                  key={i}
                  onClick={() => {
                    setVariantA(t.a);
                    setVariantB(t.b);
                    setTestType(t.type as ABTest['type']);
                    setShowCreate(true);
                    setShowTemplates(false);
                  }}
                  style={{ 
                    textAlign: 'left', 
                    padding: '10px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ color: '#a855f7', fontWeight: 600, marginBottom: '4px' }}>{t.type.toUpperCase()}</div>
                  <div style={{ color: 'var(--text)' }}>A: {t.a}</div>
                  <div style={{ color: 'var(--text)' }}>B: {t.b}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="output-wrap mb-4">
          <div className="output-box" style={{ padding: '20px' }}>
            <div className="field mb-3">
              <label className="lbl">Test name</label>
              <input 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)} 
                placeholder="e.g. Hook Test - Question vs Statement" 
              />
            </div>
            <div className="field mb-3">
              <label className="lbl">Test type</label>
              <select value={testType} onChange={(e) => setTestType(e.target.value as ABTest['type'])}>
                <option value="hook">Hook / Opening</option>
                <option value="cta">CTA Button</option>
                <option value="caption">Caption Style</option>
                <option value="timing">Posting Time</option>
                <option value="audience">Audience Segment</option>
              </select>
            </div>
            <div className="g2 mb-3">
              <div className="field">
                <label className="lbl">Variant A</label>
                <input 
                  value={variantA} 
                  onChange={(e) => setVariantA(e.target.value)} 
                  placeholder="e.g. What if you could..." 
                />
              </div>
              <div className="field">
                <label className="lbl">Variant B</label>
                <input 
                  value={variantB} 
                  onChange={(e) => setVariantB(e.target.value)} 
                  placeholder="e.g. Here's the secret..." 
                />
              </div>
            </div>
            <button onClick={createTest} disabled={!newName || !variantA || !variantB} className="run-btn">
              Create Test
            </button>
          </div>
        </div>
      )}

      <div className="flex-col gap-3">
        {tests.length === 0 && (
          <div className="output-wrap">
            <div className="output-box" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No tests yet. Create your first A/B test!
            </div>
          </div>
        )}

        {tests.map((test) => (
          <div key={test.id} className="output-wrap">
            <div className="output-header">
              <div className="output-label">
                {test.name}
                <span 
                  className="badge" 
                  style={{ 
                    marginLeft: '12px',
                    background: test.status === 'running' ? 'rgba(251,191,36,0.2)' : test.status === 'completed' ? 'rgba(74,222,128,0.2)' : 'rgba(113,113,122,0.2)',
                    color: test.status === 'running' ? '#fbbf24' : test.status === 'completed' ? '#4ade80' : '#71717a'
                  }}
                >
                  {test.status}
                </span>
              </div>
              <button onClick={() => deleteTest(test.id)} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                🗑️
              </button>
            </div>
            <div className="output-box">
              <div className="g2">
                <div 
                  className="field" 
                  style={{ 
                    border: test.winner === 'A' ? '2px solid #4ade80' : '1px solid var(--border)',
                    background: test.winner === 'A' ? 'rgba(74,222,128,0.1)' : 'transparent'
                  }}
                >
                  <label className="lbl">
                    Variant A
                    {test.winner === 'A' && <span style={{ color: '#4ade80', marginLeft: '8px' }}>✓ Winner</span>}
                  </label>
                  <div>{test.variantA}</div>
                  {test.results && (
                    <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '8px' }}>
                      {test.results.a}% engagement
                    </div>
                  )}
                </div>
                <div 
                  className="field" 
                  style={{ 
                    border: test.winner === 'B' ? '2px solid #4ade80' : '1px solid var(--border)',
                    background: test.winner === 'B' ? 'rgba(74,222,128,0.1)' : 'transparent'
                  }}
                >
                  <label className="lbl">
                    Variant B
                    {test.winner === 'B' && <span style={{ color: '#4ade80', marginLeft: '8px' }}>✓ Winner</span>}
                  </label>
                  <div>{test.variantB}</div>
                  {test.results && (
                    <div style={{ fontSize: '12px', color: '#4ade80', marginTop: '8px' }}>
                      {test.results.b}% engagement
                    </div>
                  )}
                </div>
              </div>

              {test.status === 'draft' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => startTest(test.id)} className="run-btn">
                    Start Test
                  </button>
                </div>
              )}

              {test.status === 'running' && (
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={() => completeTest(test.id, 'A')} className="run-btn btn-green">
                    A Won
                  </button>
                  <button onClick={() => completeTest(test.id, 'B')} className="run-btn btn-green">
                    B Won
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {response && (
        <div className="output-wrap mt-4">
          <div className="output-header">
            <div className="output-label">💡 Test Ideas</div>
          </div>
          <div className="output-box">{response}</div>
        </div>
      )}
    </>
  );
}