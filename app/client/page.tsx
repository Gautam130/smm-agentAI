'use client';

import { useState } from 'react';
import { useClients } from '@/components/ClientContext';

export default function ClientPage() {
  const { clients, setClients, deleteClient } = useClients();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const addClient = () => {
    if (!newName.trim()) return;
    const newClient = { id: Date.now(), name: newName, platform: 'Instagram', niche: '', posts: 0, status: 'active' as const };
    setClients(prev => [...prev, newClient]);
    setNewName('');
    setShowAdd(false);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="module-title" style={{ marginBottom: 0 }}>👥 Client Manager</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          style={{ 
            padding: '12px 24px', 
            background: '#00ffcc', 
            color: '#080808', 
            border: 'none', 
            borderRadius: '12px', 
            fontSize: '14px', 
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          + Add Client
        </button>
      </div>
      
      {showAdd && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', padding: '16px', background: '#111111', borderRadius: '12px' }}>
          <input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="Client name" 
            style={{ 
              flex: 1, 
              background: '#080808', 
              border: '1px solid #333', 
              borderRadius: '8px', 
              padding: '12px', 
              fontSize: '14px', 
              color: '#fff' 
            }} 
          />
          <button 
            onClick={addClient} 
            style={{ 
              padding: '12px 24px', 
              background: '#00ffcc', 
              color: '#080808', 
              border: 'none', 
              borderRadius: '8px', 
              fontWeight: 600, 
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {clients.map((client) => (
          <div key={client.id} style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#a855f7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
              {client.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{client.name}</div>
              <div style={{ fontSize: '12px', color: '#71717a' }}>{client.platform} · {client.niche || 'No niche set'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#00ffcc' }}>{client.posts}</div>
              <div style={{ fontSize: '11px', color: '#71717a' }}>posts</div>
            </div>
            <span style={{ 
              padding: '4px 12px', 
              borderRadius: '20px', 
              fontSize: '11px', 
              fontWeight: 600, 
              background: client.status === 'active' ? 'rgba(74,222,128,0.1)' : 'rgba(255,185,71,0.1)', 
              color: client.status === 'active' ? '#4ade80' : '#ffb947'
            }}>
              {client.status}
            </span>
            <button 
              onClick={() => deleteClient(client.id)} 
              style={{ 
                padding: '6px 10px', 
                background: 'transparent', 
                border: '1px solid #333', 
                borderRadius: '6px', 
                color: '#71717a', 
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </>
  );
}