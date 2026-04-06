import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { ClipboardList, ChevronRight, PenTool, AlertCircle, Sparkles } from 'lucide-react';

const Setup = ({ user, onDone }) => {
  const [form, setForm] = useState({ age: '', injury_type: 'Knee Pain', pain_level: 5, activity_level: 'medium' });
  const [customInjury, setCustomInjury] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const injuries = ["Knee Pain", "Lower Back Pain", "Shoulder Injury", "Ankle Sprain", "Hip Pain", "Neck Pain", "Others"];

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!form.age) return setError('Age is required');
    
    // Validate custom injury if "Others" is selected
    const finalInjuryType = form.injury_type === 'Others' ? customInjury.trim() : form.injury_type;
    if (form.injury_type === 'Others' && !finalInjuryType) {
      return setError('Please specify your injury type');
    }

    setError('');
    setLoading(true);
    try {
      const data = await api('/profile', { 
        method: 'POST', 
        body: JSON.stringify({ 
          user_id: user.user_id, 
          ...form, 
          injury_type: finalInjuryType, // Use custom text if needed
          age: parseInt(form.age) 
        }) 
      });
      onDone(data);
      navigate('/dashboard');
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-screen" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <div className="card" style={{ width: '440px' }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ClipboardList size={22} className="text-teal" /> Patient Profile
        </h2>
        <p className="text-muted text-sm mb-6">Tell us about yourself so we can build your personalized plan</p>
        
        <form onSubmit={handleSetup}>
          <div className="grid-2" style={{ gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Age</label>
              <input 
                className="form-input" 
                type="number" 
                min="10" 
                max="100" 
                placeholder="35"
                value={form.age} 
                onChange={(e) => setForm({ ...form, age: e.target.value })} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Activity Level</label>
              <select 
                className="form-select" 
                value={form.activity_level}
                onChange={(e) => setForm({ ...form, activity_level: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">Injury Type</label>
            <select 
              className="form-select" 
              value={form.injury_type}
              onChange={(e) => setForm({ ...form, injury_type: e.target.value })}
            >
              {injuries.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <AnimatePresence>
            {form.injury_type === 'Others' && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }} 
                animate={{ opacity: 1, height: 'auto', marginTop: 14 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="form-group"
              >
                <label className="form-label">Specify Your Injury</label>
                <div style={{ position: 'relative' }}>
                  <PenTool size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', opacity: 0.5 }} />
                  <input 
                    className="form-input" 
                    style={{ paddingLeft: '38px' }}
                    placeholder="e.g. Wrist Pain or Elbow Strain" 
                    value={customInjury} 
                    onChange={(e) => setCustomInjury(e.target.value)} 
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group" style={{ marginTop: '14px' }}>
            <label className="form-label">
              Current Pain Level: <strong style={{ color: 'var(--teal)' }}>{form.pain_level}/10</strong>
            </label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={form.pain_level}
              onChange={(e) => setForm({ ...form, pain_level: parseInt(e.target.value) })} 
            />
            <div className="pain-labels"><span>1 Minimal</span><span>5 Moderate</span><span>10 Severe</span></div>
          </div>

          {error && <div style={{ color: 'var(--red)', fontSize: '0.83rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}><AlertCircle size={14} /> {error}</div>}

          <button className="btn btn-primary btn-full" type="submit" disabled={loading || !form.age}>
            {loading ? 'Generating Plan…' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} /> Generate My Plan <ChevronRight size={18} />
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
