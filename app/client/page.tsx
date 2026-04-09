'use client';

import { useState } from 'react';

interface Client {
  id: number;
  name: string;
  platform: string;
  niche: string;
  posts: number;
  status: 'active' | 'inactive';
}

export default function ClientPage() {
  const [clients, setClients] = useState<Client[]>([
    { id: 1, name: 'FreshBrew Teas', platform: 'Instagram', niche: 'Food & Beverage', posts: 45, status: 'active' },
    { id: 2, name: 'FitLife Gym', platform: 'LinkedIn', niche: 'Fitness', posts: 23, status: 'active' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const addClient = () => {
    if (!newName.trim()) return;
    setClients([...clients, { id: Date.now(), name: newName, platform: 'Instagram', niche: '', posts: 0, status: 'active' }]);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700 }}>👥 Client Manager</h2>
          <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)', color: '#080808', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>+ Add Client</button>
        </div>
        
        {showAdd && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '16px', background: '#111111', borderRadius: '12px' }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Client name" style={{ flex: 1, background: '#080808', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '8px', padding: '12px', fontSize: '14px', color: '#ffffff', outline: 'none' }} />
            <button onClick={addClient} style={{ padding: '12px 24px', background: '#00ffcc', color: '#080808', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Save</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {clients.map((client) => (
            <div key={client.id} style={{ background: '#111111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #00ffcc 0%, #a855f7 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#080808' }}>{client.name.charAt(0)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{client.name}</div>
                <div style={{ fontSize: '12px', color: '#71717a' }}>{client.platform} · {client.niche || 'No niche set'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#00ffcc' }}>{client.posts}</div>
                <div style={{ fontSize: '11px', color: '#71717a' }}>posts</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: client.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: client.status === 'active' ? '#4ade80' : '#71717a' }}>{client.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}