'use client';

import { useState, useRef, useEffect } from 'react';
import { useMaya } from '@/lib/maya';

const suggestions = [
  'Best Instagram strategy for D2C India',
  '5 hooks for skincare brand India',
  'Research boAt marketing',
  'Diwali campaign 50k budget',
];

export default function AskMayaPage() {
  const { messages, isLoading, sendMessage, clearChat } = useMaya();
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<{ name: string; size: string; content?: string } | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize voice recognition on mount
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setInput((prev) => prev + transcript);
        };
        
        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.log('Voice error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() && !attachedFile) return;
    if (isLoading) return;
    
    const messageToSend = input.trim() || 'Please analyze this file';
    sendMessage(messageToSend, attachedFile ? [attachedFile] : []);
    setInput('');
    setAttachedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    let fileContent = '';
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDocx = file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc');
    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file.name);
    
    if (isImage) {
      // OCR for images using Tesseract.js
      try {
        fileContent = `[Analyzing image: ${file.name}...`;
        
        // Dynamic import Tesseract
        const Tesseract = await import('tesseract.js');
        
        const result = await Tesseract.recognize(file, 'eng+hin', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(m.progress * 100);
              setOcrProgress(`Extracting text: ${pct}%`);
            }
          }
        });
        
        setOcrProgress(null);
        const extractedText = result.data.text.trim();
        if (extractedText) {
          fileContent = `=== IMAGE TEXT (OCR) ===\n${file.name}\n\n${extractedText.substring(0, 15000)}\n=== END OCR ===`;
        } else {
          fileContent = `[Image: ${file.name} - No text detected in image]`;
        }
      } catch (err: any) {
        console.error('OCR error:', err);
        fileContent = `[Image: ${file.name} - Could not extract text: ${err.message}]`;
      }
    } else if (isPDF) {
      try {
        const pdfjs = await import('pdfjs-dist');
        const arrayBuffer = await file.arrayBuffer();
        
        // Set worker from CDN
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';
        }
        
        const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        const maxPages = Math.min(pdf.numPages, 10);
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => item.str)
            .filter((s: string) => s.trim())
            .join(' ');
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        }
        
        if (fullText.trim()) {
          fileContent = fullText.substring(0, 15000);
        } else {
          fileContent = `[PDF file - ${file.name} - No text content found in PDF]`;
        }
      } catch (err: any) {
        console.error('PDF parse error:', err);
        fileContent = `[PDF file - ${file.name} - Parse error: ${err.message}]`;
      }
    } else if (isDocx) {
      try {
        const mammoth = await import('mammoth');
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        if (result.value && result.value.trim()) {
          fileContent = result.value.substring(0, 15000);
        } else {
          fileContent = `[Word document - ${file.name} - No text content found]`;
        }
      } catch (err: any) {
        console.error('DOCX parse error:', err);
        fileContent = `[Word document - ${file.name} - Parse error: ${err.message}]`;
      }
    } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      try {
        const text = await file.text();
        fileContent = text.substring(0, 15000);
      } catch (err) {
        console.log('Could not read file:', err);
        fileContent = `[File: ${file.name}]`;
      }
    } else {
      fileContent = `[File: ${file.name}]`;
    }
    
    setAttachedFile({ 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB',
      content: fileContent
    });
    setShowAttachMenu(false);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) {
      alert('Voice input not supported in this browser');
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.log('Voice start error:', e);
      }
    }
  };

  const getTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <>
      <div className="panel-header">
        <div style={{ fontWeight: 600, fontSize: '14px' }}>Ask Maya</div>
      </div>
      
      <div className="notice n-green">Ask your agent anything — it remembers the conversation within this session.</div>
      
      <div className="chat-suggestions">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => setInput(s)} className="suggestion-btn">
            {s}
          </button>
        ))}
      </div>

      {/* WhatsApp-style chat container */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'calc(100vh - 280px)', 
        minHeight: '400px',
      }}>
        {/* Messages area - scrolls */}
        <div ref={chatRef} style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '16px 12px',
          background: 'var(--bg-onyx)',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          border: '1px solid var(--border-glass)',
          borderBottom: 'none',
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              Ask Maya anything about your social media strategy
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`chat-msg ${msg.role}`}>
                <div className={`chat-avatar ${msg.role === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
                  {msg.role === 'user' ? 'You' : 'M'}
                </div>
                <div className={`chat-bubble ${msg.role === 'user' ? 'bubble-user' : 'bubble-ai'} ${msg.streaming && !msg.text ? 'typing' : ''}`}>
                  {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      {msg.attachments.map((att: any, idx: number) => (
                        <div key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '11px', marginRight: '4px', marginBottom: '4px' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          {att.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {msg.streaming && !msg.text ? '🤔 Thinking...' : msg.text}
                  {msg.streaming && msg.text && <span className="cursor-blink">▋</span>}
                  <div className="chat-time">{getTime()}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input area - fixed at bottom */}
        <div style={{ 
          background: 'var(--bg-onyx)', 
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
          border: '1px solid var(--border-glass)',
          borderTop: 'none',
        }}>
          {attachedFile && (
            <div style={{ 
              margin: '6px 0', 
              padding: '6px 10px', 
              background: 'rgba(0,212,170,0.08)', 
              border: '1px solid rgba(0,212,170,0.2)', 
              borderRadius: '8px', 
              fontSize: '12px', 
              color: '#00ffcc',
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              maxHeight: '60px',
              overflow: 'hidden',
              maxWidth: '300px',
            }}>
              {/* Show image thumbnail if it's an image */}
              {attachedFile.name.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i) ? (
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '6px', 
                  overflow: 'hidden',
                  background: '#111',
                  flexShrink: 0,
                }}>
                  <img 
                    src={URL.createObjectURL(new Blob([attachedFile.content || '']))} 
                    alt="preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              ) : (
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  background: 'rgba(0,212,170,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ffcc" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
              )}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {attachedFile.name}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.7 }}>{attachedFile.size}</div>
              </div>
              <button 
                onClick={() => setAttachedFile(null)} 
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: '#00ffcc', 
                  cursor: 'pointer',
                  padding: '4px',
                  fontSize: '14px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          <div className="chat-input-row" style={{ border: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)' }}>
            <div style={{ position: 'relative' }}>
              <button 
                className="chat-attach-btn" 
                title="Add"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              {showAttachMenu && (
                <div className="attach-dropdown">
                  {/* Attachment - Document option */}
                  <label className="attach-option">
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      accept=".pdf,.doc,.docx,.txt,.md"
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                    </svg>
                    Attachment
                  </label>
                  
                  {/* Image option - with OCR */}
                  <label className="attach-option">
                    <input 
                      type="file" 
                      ref={imageInputRef}
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                      accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp"
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    Upload Image
                  </label>
                  
                  <button onClick={() => { setShowAttachMenu(false); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
                    </svg>
                    Preferences
                  </button>
                  
                  {ocrProgress && (
                    <div style={{ 
                      padding: '8px 12px', 
                      fontSize: '11px', 
                      color: '#00ffcc',
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                    }}>
                      {ocrProgress}
                    </div>
                  )}
                </div>
              )}
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything... e.g. I run a chai brand in Jaipur targeting 18-30 year olds. What should I post this week?"
              rows={2}
            />
            <button 
              className={`voice-btn ${isListening ? 'listening' : ''}`} 
              title={isListening ? 'Stop recording' : 'Voice input'}
              onClick={toggleVoice}
            >
              {isListening ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                </svg>
              )}
            </button>
            <button className="chat-send" onClick={handleSend} disabled={isLoading || !input.trim()}>
              Send ↑
            </button>
          </div>
        </div>
      </div>

      <div className="input-hint">
        <span>Press Enter to send • Shift+Enter for new line</span>
        {messages.length > 0 && (
          <button onClick={clearChat} className="clear-chat-btn">Clear chat</button>
        )}
      </div>
    </>
  );
}