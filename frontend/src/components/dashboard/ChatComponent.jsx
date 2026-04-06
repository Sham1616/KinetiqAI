import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send } from 'lucide-react';
import api from '../../services/api';

const ChatComponent = ({ user, isOpen, setOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef();

  useEffect(() => {
    if (messages.length === 0 && user?.name) {
      setMessages([
        { role: 'assistant', content: `Hello ${user.name}. I am your KinetiqBot. My neural engine is ONLINE. How can I help with your recovery today?` }
      ]);
    }
  }, [user]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || busy) return;
    
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setBusy(true);
    try {
      const data = await api('/chat', { 
         method: 'POST', 
         body: JSON.stringify({ 
            user_id: user.user_id, 
            message: input, 
            history: messages.slice(-6)
         }) 
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "My neural core is offline. Please check your connection." }]);
    }
    setBusy(false);
  };

  return (
    <motion.div 
      drag
      dragMomentum={false}
      style={{ position: 'fixed', right: '24px', bottom: '24px', zIndex: 1000, touchAction: 'none' }}
    >
      {/* Trigger */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!isOpen)}
        aria-label="Toggle clinical assistant"
        style={{ 
          width: '56px', height: '56px', borderRadius: '50%', 
          background: 'var(--teal)', color: '#fff', border: 'none',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
      >
        {isOpen ? <X size={24} /> : <Bot size={24} />}
      </motion.button>

      {/* Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.95 }}
            style={{ 
              position: 'absolute', right: '0', bottom: '68px', 
              width: '350px', height: '500px',
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px',
              boxShadow: 'var(--shadow)', backdropFilter: 'blur(24px)', maxWidth: 'calc(100vw - 48px)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
          >
            <div style={{ padding: '16px', background: 'var(--bg-dark)', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <Bot size={18} className="text-teal" />
                <span style={{ fontWeight: 800, fontSize: '0.85rem' }}>Assistant</span>
                <div style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '10px', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--accent)', fontWeight: 800 }}>
                   ENGINE ONLINE
                </div>
            </div>
            <div ref={scrollRef} style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  background: m.role === 'user' ? 'var(--teal)' : 'var(--bg-dark)',
                  color: m.role === 'user' ? '#fff' : 'var(--text)',
                  padding: '10px 14px', borderRadius: '12px', 
                  fontSize: '0.8rem', lineHeight: 1.4, maxWidth: '85%',
                  whiteSpace: 'pre-line', border: m.role === 'user' ? 'none' : '1px solid var(--border)'
                }}>
                  {m.content.split(/(\*\*.*?\*\*)/g).map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={index} style={{ fontWeight: 800, color: 'inherit' }}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                </div>
              ))}
            </div>
            <div style={{ padding: '12px', borderTop: '1px solid var(--border)', background: 'var(--bg-dark)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="form-input" style={{ height: '40px', background: 'var(--surface)' }} placeholder="Ask..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
                <button aria-label="Send message" className="btn btn-primary" onClick={handleSend} style={{ width: '40px', height: '40px', padding: '0', flexShrink: 0 }}><Send size={16} /></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChatComponent;
