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
    <>
      <h2 className="module-title">🧪 A/B Testing</h2>
      
      <div className="mb-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowCreate(!showCreate)} className="run-btn">+ New Test</button>
      </div>
      
      {showCreate && (
        <div className="output-wrap mb-4">
          <div className="output-box" style={{ padding: '20px' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="inp" placeholder="Test name" style={{ marginBottom: '12px' }} />
            <div className="g2">
              <input value={variantA} onChange={(e) => setVariantA(e.target.value)} className="inp" placeholder="Variant A" />
              <input value={variantB} onChange={(e) => setVariantB(e.target.value)} className="inp" placeholder="Variant B" />
            </div>
            <button onClick={createTest} className="run-btn" style={{ marginTop: '12px' }}>Start Test</button>
          </div>
        </div>
      )}

      <div className="flex-col gap-3">
        {tests.map((test) => (
          <div key={test.id} className="output-wrap">
            <div className="output-header">
              <div className="output-label">
                {test.name}
                <span className={`badge ${test.status === 'running' ? 'badge-warning' : 'badge-success'}`} style={{ marginLeft: '12px' }}>{test.status}</span>
              </div>
            </div>
            <div className="output-box">
              <div className="g2">
                <div className={`field ${test.winner === 'A' ? 'field-success' : ''}`}>
                  <label className="lbl">Variant A</label>
                  {test.variantA}
                </div>
                <div className={`field ${test.winner === 'B' ? 'field-success' : ''}`}>
                  <label className="lbl">Variant B</label>
                  {test.variantB}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}