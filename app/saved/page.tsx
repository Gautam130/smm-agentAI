'use client';

import { useState, useEffect } from 'react';

interface SavedItem {
  id: number;
  title: string;
  content: string;
  type: string;
  date: string;
}

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([
    { id: 1, title: 'Instagram Caption - Summer Collection', content: 'Summer is here! ☀️...', type: 'Content', date: '2026-04-08' },
    { id: 2, title: '10 Hooks for Skincare', content: '1. What if your skincare routine...', type: 'Hooks', date: '2026-04-07' },
    { id: 3, title: 'Content Calendar - April', content: 'Week 1: Product launch posts...', type: 'Calendar', date: '2026-04-05' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700 }}>
            💾 Saved Outputs
          </h2>
          <span style={{ fontSize: '12px', color: '#71717a' }}>{items.length} items</span>
        </div>
        
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search saved outputs..."
          style={{
            width: '100%',
            background: '#111111',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '14px 18px',
            fontSize: '14px',
            color: '#ffffff',
            outline: 'none',
            marginBottom: '20px',
          }}
        />

        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#71717a' }}>
              No saved outputs found
            </div>
          ) : (
            filteredItems.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  background: selectedItem?.id === item.id ? 'rgba(0,255,204,0.05)' : '#111111',
                  border: `1px solid ${selectedItem?.id === item.id ? 'rgba(0,255,204,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{item.title}</div>
                    <div style={{ fontSize: '11px', color: '#71717a' }}>
                      <span style={{ background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 8px', borderRadius: '10px', marginRight: '8px' }}>{item.type}</span>
                      {item.date}
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                    style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ fontSize: '13px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.content.substring(0, 100)}...
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedItem && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '24px',
          borderLeft: '2px solid #a855f7',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{selectedItem.title}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => copyContent(selectedItem.content)}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#a1a1aa', cursor: 'pointer' }}
              >
                📋 Copy
              </button>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#71717a', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.8, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {selectedItem.content}
          </div>
        </div>
      )}
    </div>
  );
}