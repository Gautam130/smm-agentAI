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
    <div className="w900">
      <div className="module-card">
        <h2 className="module-title">
          📅 AI Content Calendar
        </h2>
        
        <div className="g3 mb-4">
          <div className="field">
            <label className="lbl">Brand / niche</label>
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. organic food brand" />
          </div>
          <div className="field">
            <label className="lbl">Month</label>
            <select value={month} onChange={(e) => setMonth(e.target.value)}>
              {months.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="lbl">Frequency</label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option>3 per week</option>
              <option>5 per week</option>
              <option>Daily (7/week)</option>
              <option>2 per week</option>
            </select>
          </div>
        </div>
        
        <div className="g3 mb-4">
          <div className="field">
            <label className="lbl">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {years.map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="lbl">Start date</label>
            <input type="number" value={startDate} onChange={(e) => setStartDate(e.target.value)} min="1" max="31" />
          </div>
          <div className="field">
            <label className="lbl">End date</label>
            <input type="number" value={endDate} onChange={(e) => setEndDate(e.target.value)} min="1" max="31" />
          </div>
        </div>
        
        <div className="field mb-4">
          <label className="lbl">Specific dates to highlight</label>
          <input value={specificDates} onChange={(e) => setSpecificDates(e.target.value)} placeholder="e.g. 5th product launch, 14th Valentine's Day, 22nd weekend sale" />
        </div>
        
        <div className="g2 mb-5">
          <div className="field">
            <label className="lbl">Content pillars</label>
            <input value={pillars} onChange={(e) => setPillars(e.target.value)} placeholder="e.g. education, product showcase, testimonials, behind-the-scenes, trending" />
          </div>
          <div className="field">
            <label className="lbl">Key dates / campaigns</label>
            <input value={events} onChange={(e) => setEvents(e.target.value)} placeholder="e.g. Holi on 14th, product launch 18th, weekend sale 22-23rd" />
          </div>
        </div>
        
        <button onClick={generate} disabled={loading || !brand} className="run-btn">
          {loading ? 'Generating...' : 'Generate full calendar ✦'}
        </button>
      </div>
      
      {result && (
        <div className="output-box">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Content Calendar
            </div>
            <div className="output-actions">
              <button className="action-btn">📄 Excel</button>
              <button className="action-btn">Save</button>
              <button className="action-btn">Copy</button>
            </div>
          </div>
          <div className="output-content">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}