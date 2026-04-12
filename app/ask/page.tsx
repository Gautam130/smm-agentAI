'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { useMaya } from '@/lib/maya';

const suggestions = [
  'Best Instagram strategy for D2C India',
  '5 hooks for skincare brand India',
  'Research boAt marketing',
  'Diwali campaign 50k budget',
];

interface Message {
  role: 'user' | 'assistant';
  text: string;
  streaming?: boolean;
  attachments?: Array<{ name: string; size: string; content?: string }>;
}

interface MessagesListProps {
  messages: Message[];
  chatRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const MessagesList = memo(function MessagesList({ messages, chatRef, messagesEndRef }: MessagesListProps) {
  const getTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  return (
    <div ref={chatRef} style={{ 
      flex: 1, 
      minHeight: 0,
      overflowY: 'auto', 
      padding: '16px 12px',
      background: '#000000',
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
          <div key={i} className={`chat-msg ${msg.role}`} ref={i === messages.length - 1 ? messagesEndRef : undefined}>
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
  );
});

export default function AskMayaPage() {
  const { messages, isLoading, sendMessage, clearChat } = useMaya();
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; content?: string; file?: File; previewUrl?: string }[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<string | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const plusBtnRef = useRef<HTMLButtonElement>(null);

  // Store preview URLs for each file
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());
  
  const addFilePreview = (fileName: string, file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrls(prev => new Map(prev).set(fileName, url));
  };
  
  const removeFilePreview = (fileName: string) => {
    setPreviewUrls(prev => {
      const newMap = new Map(prev);
      const url = newMap.get(fileName);
      if (url) URL.revokeObjectURL(url);
      newMap.delete(fileName);
      return newMap;
    });
  };

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

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showAttachMenu) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const dropdown = document.querySelector('.attach-dropdown');
      
      if (dropdown && !dropdown.contains(target) && plusBtnRef.current && !plusBtnRef.current.contains(target)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showAttachMenu]);

  const handleSend = () => {
    if (!input.trim() && attachedFiles.length === 0) return;
    if (isLoading) return;
    
    const messageToSend = input.trim() || 'Please analyze these files';
    sendMessage(messageToSend, attachedFiles);
    setInput('');
    setAttachedFiles([]);
    // Clean up preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(new Map());
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check for duplicates
    const fileSize = (file.size / 1024).toFixed(1) + ' KB';
    if (attachedFiles.some(f => f.name === file.name && f.size === fileSize)) {
      alert('File already attached');
      return;
    }
    
    // Check max files (2)
    if (attachedFiles.length >= 2) {
      alert('Maximum 2 files allowed');
      return;
    }
    
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
    
    const newFile = { 
      name: file.name, 
      size: (file.size / 1024).toFixed(1) + ' KB',
      content: fileContent,
      file: file
    };
    
    setAttachedFiles(prev => [...prev, newFile]);
    if (isImage) {
      addFilePreview(file.name, file);
    }
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

  const removeFile = (index: number) => {
    const file = attachedFiles[index];
    if (file) {
      removeFilePreview(file.name);
      setAttachedFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  const clearAllFiles = () => {
    attachedFiles.forEach(f => removeFilePreview(f.name));
    setAttachedFiles([]);
    setPreviewUrls(new Map());
  };

  const getTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const pagePadding = 16;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#000000' }}>
      {/* Header - fixed height */}
      <div style={{ flexShrink: 0, padding: '0 16px' }}>
        <div style={{ fontWeight: 600, fontSize: '14px', padding: '12px 0' }}>Ask Maya</div>
        
        <div className="notice n-green" style={{ marginBottom: '12px', padding: '10px 14px' }}>Ask your agent anything — it remembers the conversation within this session.</div>
        
        <div className="chat-suggestions" style={{ marginBottom: '12px', padding: '8px 0' }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)} className="suggestion-btn">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Chat container - takes all remaining space */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        flex: 1,
        minHeight: 0,
        padding: '0 16px 8px 16px',
        background: '#000000',
      }}>
        <MessagesList messages={messages as Message[]} chatRef={chatRef as React.RefObject<HTMLDivElement | null>} messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement | null>} />

         {/* Meta AI style input - flat dark, exact replica */}
         <div className={`meta-input-container ${attachedFiles.length > 0 ? 'has-attachments' : ''}`} style={{ flexShrink: 0 }}>
          {/* Attachment previews */}
          {attachedFiles.length > 0 && (
            <div className="meta-attachments">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="meta-attachment">
                  {file.name.match(/\.(png|jpg|jpeg|gif|webp|bmp)$/i) && previewUrls.get(file.name) ? (
                    <img src={previewUrls.get(file.name)} alt={file.name} />
                  ) : (
                    <div className="meta-file-icon">{file.name.split('.').pop()?.toUpperCase()}</div>
                  )}
                  <span className="meta-file-name">{file.name}</span>
                  <button className="meta-remove-btn" onClick={() => removeFile(idx)}>×</button>
                </div>
              ))}
            </div>
          )}

          {/* Top row - Textarea */}
          <textarea
            ref={textareaRef}
            className="meta-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={adjustTextareaHeight}
            placeholder="Ask Maya..."
            rows={1}
          />

          {/* Bottom row - Buttons */}
          <div className="meta-input-bottom" style={{ position: 'relative' }}>
            {/* + Button - left */}
            <button 
              ref={plusBtnRef}
              className="meta-plus-btn"
              title="Add"
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              disabled={attachedFiles.length >= 2}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>

            {showAttachMenu && (
              <div className="attach-dropdown" style={{ position: 'absolute', bottom: '100%', left: 0, marginBottom: '8px' }}>
                <label className="attach-option">
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.md" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
                  </svg>
                  Attachment
                </label>
                <label className="attach-option">
                  <input type="file" ref={imageInputRef} onChange={handleFileSelect} style={{ display: 'none' }} accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  Upload Image
                </label>
                {ocrProgress && (
                  <div style={{ padding: '8px 12px', fontSize: '11px', color: '#00ffcc', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {ocrProgress}
                  </div>
                )}
              </div>
            )}

            {/* Right side buttons */}
            <div className="meta-right-buttons">
              {/* Voice button */}
              <button 
                className={`meta-voice-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Stop recording' : 'Voice input'}
                onClick={toggleVoice}
              >
                {isListening ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
                  </svg>
                )}
              </button>

              {/* Send button - blue circle */}
              <button 
                className="meta-send-btn"
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && attachedFiles.length === 0)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="19" x2="12" y2="5"></line>
                  <polyline points="5 12 12 5 19 12"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Input hint */}
        <div className="input-hint">
          <span>Enter to send • Shift+Enter for new line</span>
          {messages.length > 0 && (
            <button onClick={clearChat} className="clear-chat-btn">Clear chat</button>
          )}
        </div>
      </div>
    </div>
  );
}