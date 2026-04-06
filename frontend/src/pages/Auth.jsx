import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { Shield, Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

const Auth = ({ onLogin }) => {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (tab === 'login') {
        data = await api('/login', { 
          method: 'POST', 
          body: JSON.stringify({ email: form.email, password: form.password }) 
        });
      } else {
        data = await api('/register', { 
          method: 'POST', 
          body: JSON.stringify(form) 
        });
      }
      onLogin(data);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', padding: '20px' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="auth-card card" 
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div className="auth-logo" style={{ textAlign: 'center', marginBottom: '32px' }}>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ display: 'inline-flex', marginBottom: '12px' }}
          >
            <Shield size={40} className="text-teal" />
          </motion.div>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '1.75rem', fontWeight: 800 }}>
            KinetiqAI
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: '6px' }}>Clinical Rehabilitation Portal</p>
        </div>

        <div className="auth-tabs" style={{ display: 'flex', marginBottom: '24px', background: 'rgba(0,0,0,0.03)', borderRadius: '14px', padding: '4px' }}>
          {['login', 'register'].map((t) => (
            <div 
              key={t} 
              className={`auth-tab ${tab === t ? 'active' : ''}`} 
              onClick={() => setTab(t)}
              style={{ 
                flex: 1, textAlign: 'center', padding: '10px', borderRadius: '10px', 
                cursor: 'pointer', fontSize: '0.9rem', fontWeight: 700, 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: tab === t ? '#fff' : 'transparent',
                boxShadow: tab === t ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                color: tab === t ? 'var(--teal)' : 'var(--muted)'
              }}
            >
              {t === 'login' ? 'Sign In' : 'Join'}
            </div>
          ))}
        </div>

        <form onSubmit={handleAuth}>
          {tab === 'register' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="form-group"
            >
              <label className="form-label">Full Legal Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.7 }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: '44px', height: '48px' }}
                  placeholder="John Doe" 
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                />
              </div>
            </motion.div>
          )}
          <div className="form-group">
            <label className="form-label">Patient Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.7 }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '44px', height: '48px' }}
                type="email" 
                placeholder="patient@medical.com" 
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Access Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.7 }} />
              <input 
                className="form-input" 
                style={{ paddingLeft: '44px', height: '48px' }}
                type="password" 
                placeholder="••••••••" 
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} 
              />
            </div>
          </div>

          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--red)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}><AlertCircle size={14} /> {error}</motion.div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ height: '48px', fontSize: '1rem' }}>
            {loading ? 'Verifying...' : tab === 'login' ? 'Secure Login' : 'Create Patient Profile'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', color: 'var(--muted)', textDecoration: 'none', transition: '0.3s' }}>
            <ArrowLeft size={14} /> Return to Public Site
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
