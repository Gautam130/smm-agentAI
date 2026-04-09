'use client';

import { useState } from 'react';

export default function CalendarPage() {
  const [brand, setBrand] = useState('');
  const [month, setMonth] = useState('January');
  const [year, setYear] = useState('2026');
  const [frequency, setFrequency] = useState('3 per week');
  const [startDate, setStartDate] = useState('1');
  const [endDate, setEndDate] = useState('30');
  const [specificDates, setSpecificDates] = useState('');
  const [pillars, setPillars] = useState('');
  const [events, setEvents] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const generate = async () => {
    if (!brand.trim()) return;
    setLoading(true);
    setResult('');
    try {
      const prompt = `Generate a content calendar for ${brand} for ${month} ${year}. 
Frequency: ${frequency}. 
Start date: ${startDate}, End date: ${endDate}.
Specific dates to highlight: ${specificDates}.
Content pillars: ${pillars}.
Key dates / campaigns: ${events}.
Include post ideas with dates, content types, and themes.`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error('No response');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let text = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.choices?.[0]?.delta?.content) {
                text += parsed.choices[0].delta.content;
              }
            } catch {}
          }
        }
      }
      setResult(text || 'No response');
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    }
    setLoading(false);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from({ length: 10 }, (_, i) => String(2026 + i));

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)', 
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
      }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', var(--head)", fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>
          📅 AI Content Calendar
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Brand / niche</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. organic food brand" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle}>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)} style={inputStyle}>
              <option>3 per week</option>
              <option>5 per week</option>
              <option>Daily (7/week)</option>
              <option>2 per week</option>
            </select>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Start date</label>
            <input type="number" value={startDate} onChange={(e) => setStartDate(e.target.value)} min="1" max="31" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>End date</label>
            <input type="number" value={endDate} onChange={(e) => setEndDate(e.target.value)} min="1" max="31" style={inputStyle} />
          </div>
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Specific dates to highlight</label>
          <input value={specificDates} onChange={(e) => setSpecificDates(e.target.value)} placeholder="e.g. 5th product launch, 14th Valentine's Day, 22nd weekend sale" style={inputStyle} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Content pillars</label>
            <input value={pillars} onChange={(e) => setPillars(e.target.value)} placeholder="e.g. education, product showcase, testimonials, behind-the-scenes, trending" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Key dates / campaigns</label>
            <input value={events} onChange={(e) => setEvents(e.target.value)} placeholder="e.g. Holi on 14th, product launch 18th, weekend sale 22-23rd" style={inputStyle} />
          </div>
        </div>
        
        <button onClick={generate} disabled={loading || !brand} style={btnStyle}>
          {loading ? 'Generating...' : 'Generate full calendar ✦'}
        </button>
      </div>
      
      {result && (
        <div style={resultStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#00ffcc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00ffcc' }}></span>
              Content Calendar
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button style={actionBtnStyle}>📄 Excel</button>
              <button style={actionBtnStyle}>Save</button>
              <button style={actionBtnStyle}>Copy</button>
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: 1.85, color: '#ffffff', whiteSpace: 'pre-wrap' }}>
            {result}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '11px',
  color: '#71717a',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: '8px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: '#111111',
  border: '0.5px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  padding: '14px 18px',
  fontSize: '14px',
  color: '#ffffff',
  outline: 'none',
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '10px',
  padding: '14px 28px',
  background: 'linear-gradient(135deg, #00ffcc 0%, #00ccaa 100%)',
  color: '#080808',
  border: 'none',
  borderRadius: '12px',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
};

const resultStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '16px',
  padding: '24px',
  borderLeft: '2px solid #00ffcc',
};

const actionBtnStyle: React.CSSProperties = {
  fontSize: '11px',
  padding: '4px 10px',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'transparent',
  color: '#a1a1aa',
  cursor: 'pointer',
};