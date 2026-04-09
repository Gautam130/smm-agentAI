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
    { id: 1, title: 'Instagram Caption - Summer Collection', content: 'Summer is here! ☀️ Get ready for the ultimate summer vibes with our new collection...', type: 'Content', date: '2026-04-08' },
    { id: 2, title: '10 Hooks for Skincare', content: '1. What if your skincare routine could transform your skin in 30 days?\n2. The secret ingredient your skin craves...\n3. Stop wasting money on products that don\'t work...', type: 'Hooks', date: '2026-04-07' },
    { id: 3, title: 'Content Calendar - April', content: 'Week 1: Product launch posts\nWeek 2: Behind the scenes\nWeek 3: Customer testimonials\nWeek 4: Engagement posts', type: 'Calendar', date: '2026-04-05' },
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
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="module-title">💾 Saved Outputs</h2>
        <span style={{ fontSize: '12px', color: '#71717a' }}>{items.length} items</span>
      </div>
      
      <input 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search saved outputs..."
        className="field mb-4"
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
              className={`saved-item ${selectedItem?.id === item.id ? 'selected' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>{item.title}</div>
                  <div style={{ fontSize: '11px', color: '#71717a' }}>
                    <span className="tag tag-purple">{item.type}</span>
                    <span style={{ marginLeft: '8px' }}>{item.date}</span>
                  </div>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer', fontSize: '16px' }}>🗑️</button>
              </div>
              <div style={{ fontSize: '13px', color: '#a1a1aa', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.content.substring(0, 100)}...
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <div className="output-wrap">
          <div className="output-header">
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#ffffff' }}>{selectedItem.title}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => copyContent(selectedItem.content)} className="copy-output">📋 Copy</button>
              <button onClick={() => setSelectedItem(null)} className="action-btn">✕</button>
            </div>
          </div>
          <div className="output-box">
            {selectedItem.content}
          </div>
        </div>
      )}
    </>
  );
}