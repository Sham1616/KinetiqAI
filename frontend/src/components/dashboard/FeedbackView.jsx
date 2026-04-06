import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Zap, Flame, HeartPulse, Lock } from 'lucide-react';
import api from '../../services/api';

const FeedbackView = ({ profile, onUpdateProfile }) => {
  const [form, setForm] = useState({ pain_level: 5, completion_pct: 80, difficulty: 'ok' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  const getPainColor = (level) => {
    if (level === 0) return 'var(--teal)';
    if (level < 4) return 'var(--green)';
    if (level < 7) return 'var(--orange)';
    return 'var(--red)';
  };

  const handleFeedback = async () => {
    if (!window.confirm("Are you sure you want to sync your session data? This will recalibrate your clinical protocol for tomorrow.")) return;
    
    setLoading(true);
    try {
      const data = await api('/feedback', { method: 'POST', body: JSON.stringify({ user_id: profile.patient.user_id, ...form }) });
      setResult(data);
      setDone(true);
      setTimeout(async () => {
        const fresh = await api(`/profile/${profile.patient.user_id}`);
        onUpdateProfile(fresh);
      }, 1000);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const handleUndo = async () => {
    if (!window.confirm("CAUTION: This will delete today's progress and revert your XP/streak. Are you sure?")) return;
    
    setLoading(true);
    try {
      await api('/feedback/undo', { method: 'POST', body: JSON.stringify({ user_id: profile.patient.user_id }) });
      const fresh = await api(`/profile/${profile.patient.user_id}`);
      onUpdateProfile(fresh);
      setDone(false);
    } catch(e) { alert(e.message); }
    setLoading(false);
  };

  const gam = profile.gamification || {};
  const xp = gam.xp || 0;
  const streak = gam.streak || 0;

  // ── GUARD: lock the form if this injury is already recovered ──
  const recoveredInjuries = profile.recovered_injuries || {};
  const isInjuryRecovered = !!recoveredInjuries[profile.patient.injury_type];
  const recoveredDate = recoveredInjuries[profile.patient.injury_type];

  if (isInjuryRecovered && !done) return (
    <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '80px 40px' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <div style={{ width: '100px', height: '100px', background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <Lock size={40} style={{ color: 'var(--teal)' }} />
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)', marginBottom: '12px' }}>
          Session Locked
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', maxWidth: '380px', margin: '0 auto 8px', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--teal)' }}>{profile.patient.injury_type}</strong> was clinically recovered on{' '}
          <strong style={{ color: 'var(--text)' }}>{recoveredDate}</strong>.
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.88rem', maxWidth: '380px', margin: '0 auto 32px', lineHeight: 1.7 }}>
          Logging further sessions for a resolved injury is not permitted to protect the integrity of your recovery data.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <div style={{ padding: '10px 20px', background: 'rgba(20,184,166,0.08)', border: '1px solid var(--teal)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--teal)' }}>
            ✓ RECOVERY CERTIFIED
          </div>
          <div style={{ padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--muted)' }}>
            → Select a new injury from the Dashboard
          </div>
        </div>
      </motion.div>
    </div>
  );

  if (done && result) return (
    <div style={{ textAlign: 'center', padding: '100px 0' }}>
      {result.is_recovered ? (
         <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }}>
            <div style={{ width: '120px', height: '120px', background: 'rgba(20, 184, 166, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', position: 'relative' }}>
               <HeartPulse size={64} className="text-teal" />
               <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} transition={{ repeat: Infinity, duration: 2 }} style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid var(--teal)' }} />
            </div>
            <h1 className="page-title" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Symptom Resolution!</h1>
            <p className="page-sub" style={{ fontSize: '1.1rem', color: 'var(--teal)', fontWeight: 800 }}>Clinical Recovery Milestone Achieved</p>
            <div className="card" style={{ maxWidth: '450px', margin: '32px auto', border: '1px solid var(--teal)', background: 'rgba(20, 184, 166, 0.05)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
                  <Zap className="text-teal" size={24} />
                  <div>
                     <div style={{ fontWeight: 800, color: 'var(--text)' }}>Neural Alignment Logged</div>
                     <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>The AI has registered a 0-pain state for {profile.patient.injury_type}. New baseline protocol established.</p>
                  </div>
               </div>
            </div>
         </motion.div>
      ) : (
        <>
          <CheckCircle2 size={64} className="text-teal" style={{ marginBottom: '24px' }} />
          <h1 className="page-title">Bio-Sync Complete</h1>
          <p className="page-sub">Next-day protocol recalibrated based on pain vs. intensity response.</p>
        </>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', maxWidth: '600px', margin: '40px auto' }}>
        <div className="card">
           <Zap className="text-teal" size={32} style={{ marginBottom: '10px' }} />
           <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)' }}>+{result.xp_earned} XP</div>
           <div style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.6, color: 'var(--muted)' }}>RECOVERY POINTS</div>
        </div>
        <div className="card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
           <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--teal)', marginBottom: '8px' }}>{result.is_recovered ? 'MAINTENANCE MODE' : 'DYNAMIC UPDATE'}</div>
           <p style={{ fontSize: '0.85rem', color: 'var(--text)' }}>
              {result.is_recovered 
                ? `Transitioning to prevention protocol for ${profile.patient.injury_type}.`
                : `Evolving ${result.adapted_plan?.[0]?.difficulty_label} Level modules for specialized ${profile.patient.injury_type} recovery.`}
           </p>
        </div>
      </div>
      <button className="btn btn-primary" onClick={() => setDone(false)}>Close Session</button>
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <header className="mb-6">
        <h1 className="page-title">Daily Response</h1>
        <p className="page-sub">Sync biometric feedback to evolve your clinical protocol.</p>
      </header>

      {profile.has_submitted_today && !done ? (
        <div className="card" style={{ textAlign: 'center', padding: '80px 40px', border: '1px dashed var(--border)', background: 'transparent' }}>
           <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <CheckCircle2 size={48} className="text-teal" style={{ marginBottom: '20px', margin: '0 auto' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)', marginBottom: '8px' }}>Today's Protocol Synced</h2>
              <p style={{ color: 'var(--muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 28px', lineHeight: 1.6 }}>
                You have already shared your feedback for today. Your next-day session has been intelligently recalibrated.
              </p>
              <button 
                className="btn btn-outline" 
                onClick={handleUndo} 
                disabled={loading}
                style={{ fontSize: '0.85rem', padding: '10px 24px' }}
              >
                {loading ? 'Reverting...' : 'Undo Today\'s Session'}
              </button>
           </motion.div>
        </div>
      ) : (
      
      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>

        {/* Left Form */}
        <div className="card" style={{ padding: '32px' }}>
          <div className="form-group mb-6">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              PAIN INTENSITY<span style={{ fontWeight: 800, color: getPainColor(form.pain_level), transition: 'color 0.3s' }}>{form.pain_level}/10</span>
            </label>
            <div style={{ '--teal': getPainColor(form.pain_level) }}>
              <input 
                type="range" min="0" max="10" value={form.pain_level} 
                onChange={(e) => setForm({ ...form, pain_level: parseInt(e.target.value) })}
                style={{ '--track-bg': `linear-gradient(to right, ${getPainColor(form.pain_level)} ${(form.pain_level / 10) * 100}%, var(--border) ${(form.pain_level / 10) * 100}%)` }} 
              />
            </div>
            <div className="pain-labels" style={{ fontSize: '0.65rem' }}>
              <span style={{ color: form.pain_level === 0 ? 'var(--teal)' : 'inherit', fontWeight: form.pain_level === 0 ? 800 : 400 }}>0 - RECOVERED</span>
              <span>5 - MODERATE</span>
              <span>10 - SEVERE</span>
            </div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              PROTOCOL COMPLETION<span style={{ fontWeight: 800, color: 'var(--teal)' }}>{form.completion_pct}%</span>
            </label>
            <input 
                type="range" min="0" max="100" step="10" value={form.completion_pct} 
                onChange={(e) => setForm({ ...form, completion_pct: parseInt(e.target.value) })}
                style={{ '--track-bg': `linear-gradient(to right, var(--teal) ${form.completion_pct}%, var(--border) ${form.completion_pct}%)` }} 
            />
            <div className="pain-labels"><span>0%</span><span>50%</span><span>100%</span></div>
          </div>

          <div className="form-group mb-6">
            <label className="form-label" style={{ marginBottom: '12px' }}>SESSION DIFFICULTY</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[{id:'easy',label:'Low'},{id:'ok',label:'Balanced'},{id:'hard',label:'High'}].map(d => (
                <button 
                  key={d.id} 
                  className={`btn ${form.difficulty === d.id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setForm({ ...form, difficulty: d.id })}
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', fontSize: '0.9rem' }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          
          <button className="btn btn-primary btn-full" onClick={handleFeedback} disabled={loading} style={{ height: '52px', marginTop: '12px' }}>
            {loading ? 'Syncing...' : 'Sync Session Data'}
          </button>
        </div>

        {/* Right Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent)' }}>
             <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text)' }}><Zap size={18} className="text-teal" /> Recovery Insight</h3>
             <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(249,115,22,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <Flame size={32} fill="var(--orange)" className="text-orange" />
                </div>
                <div>
                   <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--orange)' }}>{streak} Days</div>
                   <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--muted)' }}>ACTIVE RECOVERY STREAK</div>
                </div>
             </div>
             
             <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)', marginBottom: '8px' }}>
                   <span>PHASE XP PROGRESS</span>
                   <span>{xp} / 1000</span>
                </div>
                <div className="xp-bar-wrap" style={{ height: '8px', background: 'var(--border)' }}>
                   <div style={{ height: '100%', width: `${Math.min(100, (xp/1000)*100)}%`, background: 'linear-gradient(90deg, var(--teal), var(--light))', borderRadius: '100px' }} />
                </div>
             </div>
          </div>

          <div className="card" style={{ padding: '24px', border: '1px dashed var(--border)', background: 'transparent' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text)' }}>
                <HeartPulse size={18} className="text-teal" />
                <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>Clinical Pulse</span>
             </div>
             <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--muted)' }}>
                "Maintaining a baseline 80% protocol compliance for 14 consecutive days significantly reduces terminal fascia inflammation. You are currently at <strong style={{ color: 'var(--text)'}}>{streak} days</strong>."
             </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default FeedbackView;
