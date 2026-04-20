'use client';

import { useState } from 'react';
import { useStreamingChat } from '@/lib/hooks/useStreamingChat';
import { getFestivalsForMonth, getPostingDays, MONTH_NAMES, DAY_NAMES, type Festival } from '@/lib/data/festivals';

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
  
  const { response, isLoading, sendMessage } = useStreamingChat();

  const monthIndex = MONTH_NAMES.indexOf(month);
  const festivals = getFestivalsForMonth(monthIndex);
  const postingDays = getPostingDays(monthIndex, parseInt(year), frequency);

  const generate = async () => {
    if (!brand.trim()) return;
    
    const festivalList = festivals.map(f => `${f.day} ${f.name}`).join(', ') || 'No major festivals this month';
    const postingDaysStr = postingDays.join(', ');
    
    const prompt = `Generate a content calendar for ${brand} for ${month} ${year}. 

POSTING SCHEDULE:
- Frequency: ${frequency}  
- Posting days: ${postingDaysStr}
- Date range: ${startDate} - ${endDate}

INDIAN FESTIVALS THIS MONTH:
${festivalList}

CONTENT PILLARS: ${pillars || 'education, product showcase, testimonials, behind-the-scenes, trending'}
KEY CAMPAIGNS: ${events}

For each posting day, provide:
- Date and day name
- Content type (Reel, Carousel, Story, Static)
- Hook/Topic idea
- Relevant festival (if any)
- 3-5 hashtags

Make it actionable and specific to Indian audience.`;

    await sendMessage([
      { role: 'user', content: prompt }
    ], { task: 'calendar' });
  };

  const months = MONTH_NAMES;
  const years = Array.from({ length: 10 }, (_, i) => String(2026 + i));

  return (
    <>
      <h2 className="module-title">📅 AI Content Calendar</h2>

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

      {festivals.length > 0 && (
        <div className="notice n-green mb-4">
          🎉 <strong>Festivals this month:</strong> {festivals.map(f => f.name).join(', ')}
        </div>
      )}
      
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
      
      <button onClick={generate} disabled={isLoading || !brand} className="run-btn">
        {isLoading ? 'Generating...' : 'Generate full calendar ✦'}
      </button>

      <div className="g2 mt-5" style={{ marginTop: '20px' }}>
        <div className="field">
          <label className="lbl">Posting Days Preview</label>
          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '13px',
            color: 'var(--text-muted)',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {postingDays.slice(0, 15).map((day, idx) => {
              const dayOfWeek = new Date(parseInt(year), monthIndex, day).getDay();
              const festival = festivals.find(f => f.day === day);
              return (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  padding: '4px 0',
                  borderBottom: idx < postingDays.length - 1 ? '1px solid var(--border)' : 'none'
                }}>
                  <span>{DAY_NAMES[dayOfWeek]}, {month} {day}</span>
                  {festival && <span style={{ color: '#00ffcc' }}>🎉 {festival.name}</span>}
                </div>
              );
            })}
            {postingDays.length > 15 && <div style={{ padding: '8px 0', color: 'var(--text-muted)' }}>+ {postingDays.length - 15} more days</div>}
          </div>
        </div>
        
        <div className="field">
          <label className="lbl">All 2026 Festivals</label>
          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '12px', 
            borderRadius: '8px', 
            fontSize: '12px',
            color: 'var(--text-muted)',
            maxHeight: '150px',
            overflow: 'auto'
          }}>
            {[
              'Jan 14 - Makar Sankranti', 'Jan 26 - Republic Day',
              'Feb 14 - Valentine\'s Day', 'Mar 14 - Holi',
              'Mar 30 - Ram Navami', 'Apr 14 - Baisakhi',
              'May 1 - Maharashtra Day', 'Jun 15 - Father\'s Day',
              'Aug 15 - Independence Day', 'Aug 24 - Raksha Bandhan',
              'Sep 9 - Ganesh Chaturthi', 'Oct 2 - Gandhi Jayanti',
              'Oct 12 - Dussehra', 'Nov 1 - Diwali',
              'Dec 25 - Christmas'
            ].map((f, i) => (
              <div key={i} style={{ padding: '3px 0' }}>{f}</div>
            ))}
          </div>
        </div>
      </div>
      
      {response && (
        <div className="output-wrap">
          <div className="output-header">
            <div className="output-label">
              <span className="dot-green"></span>
              Content Calendar
              <button className="clear-btn" onClick={() => sendMessage([], { task: 'calendar' })} title="Clear">✕</button>
            </div>
            <div className="output-actions">
              <button className="excel-export-btn">📄 Excel</button>
              <button className="save-output-btn">Save</button>
              <button className="copy-output" onClick={() => navigator.clipboard.writeText(response)}>Copy</button>
            </div>
          </div>
          <div className="output-box">
            {response}
          </div>
        </div>
      )}
    </>
  );
}
