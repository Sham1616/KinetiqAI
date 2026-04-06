import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import {
  Flame, Star, Zap, Target, ClipboardList, ListChecks,
  CheckCircle2, BrainCircuit, Dumbbell, Flower, AlertTriangle,
  BarChart3, Sparkles, Rocket, Lock, ShieldCheck, Award,
  RefreshCw, Stethoscope, Scissors, TriangleAlert
} from 'lucide-react';

/* ─── Injury-specific surgical data ────────────────────────────── */
const SURGICAL_PLANS = {
  "Knee Pain": {
    specialist: "Orthopedic Surgeon",
    procedures: ["ACL Reconstruction", "Meniscectomy / Meniscal Repair", "Total Knee Arthroplasty (TKA)"],
    generic: "Consult a licensed orthopedic specialist for imaging and clinical assessment."
  },
  "Lower Back Pain": {
    specialist: "Spinal Surgeon / Neurosurgeon",
    procedures: ["Microdiscectomy", "Spinal Fusion (ALIF/PLIF)", "Laminectomy / Laminotomy"],
    generic: "Refer to a spinal neurosurgeon or orthopedic spine specialist for MRI review."
  },
  "Shoulder Injury": {
    specialist: "Orthopedic Surgeon (Shoulder & Elbow)",
    procedures: ["Rotator Cuff Repair", "SLAP Tear Repair", "Total Shoulder Arthroplasty"],
    generic: "Consult a shoulder orthopaedic specialist — recurring instability may require surgical stabilisation."
  },
  "Ankle Sprain": {
    specialist: "Orthopedic Surgeon / Foot & Ankle Specialist",
    procedures: ["Broström Ligament Reconstruction", "Peroneal Tendon Repair", "Ankle Arthroscopy"],
    generic: "Refer to a foot & ankle orthopaedic specialist to assess chronic ligament laxity."
  },
  "Hip Pain": {
    specialist: "Orthopedic Surgeon (Hip & Pelvis)",
    procedures: ["Hip Arthroscopy (FAI treatment)", "Periacetabular Osteotomy (PAO)", "Total Hip Replacement (THR)"],
    generic: "Consult an orthopaedic hip specialist — structural causes of recurrent hip pain require imaging assessment."
  },
  "Neck Pain": {
    specialist: "Spinal Neurosurgeon / Orthopedic Cervical Specialist",
    procedures: ["Anterior Cervical Discectomy & Fusion (ACDF)", "Cervical Laminoplasty", "Cervical Disc Replacement (CDR)"],
    generic: "Refer to a cervical spine specialist for MRI-guided assessment of disc and nerve involvement."
  }
};

/* ─── Grade Config ──────────────────────────────────────────────── */
const GRADE_CONFIG = {
  1: { label: "Grade I", color: "#f59e0b", bg: "rgba(245,158,11,0.07)", border: "#f59e0b", title: "Clinical Recovery Confirmed", certLabel: "First Recovery Certificate", icon: "🏅" },
  2: { label: "Grade II", color: "#94a3b8", bg: "rgba(148,163,184,0.07)", border: "#94a3b8", title: "Recurring Injury — Recovery Confirmed", certLabel: "Second Recovery Certificate", icon: "🥈" },
  3: { label: "Grade III — CRITICAL", color: "#ef4444", bg: "rgba(239,68,68,0.07)", border: "#ef4444", title: "Chronic Injury — Recovery Confirmed", certLabel: "Third Recovery Certificate", icon: "⚠️" }
};

/* ─── Recovery Certificate ──────────────────────────────────────── */
const RecoveryCertificate = ({ injuryType, recoveredDate, plan, grade, onExperienceAgain }) => {
  // grade = currentGrade from backend after recovery is logged
  // certGrade = which numbered certificate to show (1 after 1st recovery, 2 after 2nd, etc.)
  const certGrade = Math.min(grade - 1, 3); // grade 4 means 3rd cycle done → certGrade = 3
  const isLocked = certGrade >= 3;          // 3rd certificate = permanently locked
  const cfg = GRADE_CONFIG[certGrade] || GRADE_CONFIG[1];
  const surgical = SURGICAL_PLANS[injuryType];
  const [showSurgical, setShowSurgical] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      style={{ marginTop: '40px' }}
    >
      {/* Grade Warning Banner (Grade 2 & 3) */}
      {certGrade >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: certGrade === 3 ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.08)',
            border: `1px solid ${certGrade === 3 ? '#ef4444' : '#f59e0b'}`,
            borderRadius: '12px', padding: '14px 20px', marginBottom: '20px',
            display: 'flex', alignItems: 'flex-start', gap: '12px'
          }}
        >
          <TriangleAlert size={20} style={{ color: certGrade === 3 ? '#ef4444' : '#f59e0b', flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.85rem', color: certGrade === 3 ? '#ef4444' : '#f59e0b', marginBottom: '4px' }}>
              {certGrade === 3 ? '⚠️ Chronic Recurring Injury — Surgical Review Required — Further Self-Rehab Locked' : '⚠️ Recurrence Detected — Conservative Protocol Applied'}
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', margin: 0, lineHeight: 1.6 }}>
              {certGrade === 3
                ? `This was your 3rd occurrence of ${injuryType}. Chronic recurrence indicates an underlying structural problem. No further self-rehabilitation attempts are permitted. Please consult a specialist immediately.`
                : `This is your 2nd occurrence of ${injuryType}. Your exercise volume was reduced by 30% and difficulty capped at Beginner level to protect against aggravation.`}
            </p>
          </div>
        </motion.div>
      )}

      {/* Main Certificate Card */}
      <div style={{
        background: cfg.bg, border: `1px solid ${cfg.border}`,
        borderRadius: '20px', padding: '40px 48px', textAlign: 'center',
        marginBottom: '24px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Grade watermark */}
        <div style={{ position: 'absolute', top: 16, left: 20, padding: '4px 12px', background: `${cfg.color}22`, border: `1px solid ${cfg.border}`, borderRadius: '6px', fontSize: '0.65rem', fontWeight: 800, color: cfg.color, letterSpacing: '1px' }}>
          {cfg.label}
        </div>

        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ display: 'inline-flex', marginBottom: '16px', marginTop: '12px' }}
        >
          <ShieldCheck size={60} style={{ color: cfg.color }} />
        </motion.div>

        <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '3px', color: cfg.color, textTransform: 'uppercase', marginBottom: '10px' }}>
          {cfg.certLabel}
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text)', marginBottom: '6px' }}>
          {cfg.icon} {injuryType}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--muted)', marginBottom: '28px' }}>
          Symptom resolution certified on <strong style={{ color: 'var(--text)' }}>{recoveredDate}</strong>
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
          {[
            { label: 'Final Pain Score', value: '0 / 10', color: 'var(--teal)' },
            { label: 'Grade', value: cfg.label, color: cfg.color },
            { label: 'Status', value: 'RECOVERED', color: 'var(--green)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{s.label}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Show 'Experience Again' only for Grade 1 and 2 certificates */}
          {!isLocked && (
            <motion.button
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              className="btn btn-outline"
              onClick={onExperienceAgain}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.85rem', fontWeight: 800, borderColor: cfg.color, color: cfg.color }}
            >
              <RefreshCw size={15} />
              {`I'm Experiencing ${injuryType} Again`}
            </motion.button>
          )}
          {/* Grade 3 locked: show lock message instead */}
          {isLocked && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, color: '#ef4444' }}>
              <Lock size={14} /> Further Attempts Locked — Consult a Surgeon
            </div>
          )}
          <motion.button
            whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
            className="btn btn-primary"
            onClick={() => document.querySelector('select')?.focus()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '0.85rem', fontWeight: 800 }}
          >
            <Zap size={15} /> Begin New Injury Protocol
          </motion.button>
        </div>
      </div>

      {/* Grade 3: Surgical Recommendations — also shown for grade 2 cert if locked */}
      {(certGrade >= 3) && surgical && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '28px 32px', marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Stethoscope size={22} style={{ color: '#ef4444' }} />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ef4444' }}>Medical Escalation Required</h3>
          </div>

          <div style={{ marginBottom: '20px', padding: '14px 18px', background: 'rgba(239,68,68,0.05)', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Recommended Specialist</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{surgical.specialist}</div>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.6, margin: '6px 0 0' }}>{surgical.generic}</p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Scissors size={16} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Potential Surgical Interventions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {surgical.procedures.map((proc, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: '10px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.7rem', fontWeight: 800, color: '#ef4444' }}>{i + 1}</div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>{proc}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: '8px', fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={14} />
            This is AI-generated clinical guidance only. Always consult a licensed medical professional before any treatment decision.
          </div>
        </motion.div>
      )}

      {/* Archived Protocol */}
      <div style={{ opacity: 0.6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <ClipboardList size={18} style={{ color: 'var(--muted)' }} />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--muted)' }}>Final Session Protocol — Archived</h3>
          <div style={{ padding: '2px 8px', background: 'var(--border)', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 800, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock size={9} />LOCKED
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
          {plan && plan.map((ex, i) => (
            <div key={i} className="exercise-card" style={{ padding: '16px', cursor: 'default', filter: 'grayscale(0.5)', pointerEvents: 'none' }}>
              <div className="exercise-header">
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>MODULE 0{i + 1}</div>
                <div className={`tag ${ex.difficulty === 1 ? 'tag-diff-1' : ex.difficulty === 3 ? 'tag-diff-3' : 'tag-diff-2'}`}>{ex.difficulty_label}</div>
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>{ex.name}</h4>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div className="tag tag-sets">{ex.sets} SETS</div>
                <div className="tag tag-reps">{ex.reps} REPS</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

/* ─── Main Dashboard ────────────────────────────────────────────── */
const DashboardOverview = ({ profile, onSelectEx, onUpdateProfile }) => {
  const { patient, plan, gamification } = profile;
  const recoveredInjuries = profile.recovered_injuries || {};
  const isCurrentRecovered = profile.is_current_injury_recovered || false;
  const currentGrade = profile.current_injury_grade || 1;

  const [updating, setUpdating] = useState(false);

  const allInjuryTypes = ["Knee Pain", "Lower Back Pain", "Shoulder Injury", "Ankle Sprain", "Hip Pain", "Neck Pain"];

  const handleInjuryChange = async (newType) => {
    if (newType === patient.injury_type) return;
    if (recoveredInjuries[newType]) {
      const confirmed = window.confirm(`"${newType}" was previously recovered.\n\nYou can view its archive, but to start a new recovery cycle you must click "I'm Experiencing This Again" from the certificate.`);
      if (!confirmed) return;
    }
    setUpdating(true);
    try {
      const response = await api('/profile', {
        method: 'POST',
        body: JSON.stringify({ user_id: patient.user_id, age: patient.age, injury_type: newType, pain_level: patient.pain_level, activity_level: patient.activity_level })
      });
      onUpdateProfile(response);
    } catch (err) {
      alert('Failed to recalibrate AI plan. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleExperienceAgain = async () => {
    if (currentGrade >= 4) return; // Already locked after 3rd recovery

    // currentGrade IS the next attempt grade (backend computes: recoveries + 1)
    // e.g. after 1st recovery: currentGrade=2 → next protocol is Grade 2
    const nextGrade = currentGrade;
    const gradeLabels = {
      2: 'Grade II — Mild Protocol (beginner-only, 30% reduced volume)',
      3: 'Grade III — Very Mild Protocol (50% reduced, 3 exercises only, surgeon recommended)'
    };
    const confirmed = window.confirm(
      `Starting a new ${patient.injury_type} recovery cycle.\n\n⚠️  Next protocol: ${gradeLabels[nextGrade] || 'Standard Protocol'}\n\nYour exercise plan will be adjusted for safety. Continue?`
    );
    if (!confirmed) return;
    setUpdating(true);
    try {
      const response = await api('/profile', {
        method: 'POST',
        body: JSON.stringify({
          user_id: patient.user_id,
          age: patient.age,
          injury_type: patient.injury_type,
          pain_level: 5,
          activity_level: patient.activity_level,
          restart_injury: true   // tells backend to insert reset log
        })
      });
      onUpdateProfile(response);
    } catch (err) {
      alert('Failed to restart protocol.');
    } finally {
      setUpdating(false);
    }
  };

  const gam = gamification || {};
  const xp = gam.xp || 0;
  const lvl = gam.level || 'Beginner';
  const streak = gam.streak || 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Welcome back, {patient.name}</h1>
          <p className="page-sub">Clinical Phase: <span style={{ fontWeight: 800, color: 'var(--teal)' }}>{isCurrentRecovered ? 'Recovered ✓' : lvl}</span></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative' }}>
            <select
              value={patient.injury_type}
              onChange={(e) => handleInjuryChange(e.target.value)}
              disabled={updating}
              style={{
                appearance: 'none', background: isCurrentRecovered ? 'rgba(20,184,166,0.07)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isCurrentRecovered ? 'var(--teal)' : 'var(--border)'}`,
                borderRadius: '10px', padding: '8px 34px 8px 12px',
                fontSize: '0.8rem', fontWeight: 700, color: isCurrentRecovered ? 'var(--teal)' : 'var(--text)',
                cursor: updating ? 'not-allowed' : 'pointer', outline: 'none', transition: 'all 0.3s', minWidth: '160px'
              }}
            >
              {allInjuryTypes.map(type => {
                const isRec = !!recoveredInjuries[type];
                return <option key={type} value={type} style={{ background: 'var(--bg-dark)' }}>{isRec ? `✓ ${type}` : type}</option>;
              })}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              {isCurrentRecovered ? <CheckCircle2 size={13} style={{ color: 'var(--teal)' }} /> : <Zap size={12} style={{ opacity: 0.5, color: 'var(--teal)' }} />}
            </div>
          </div>
          <div style={{ padding: '6px 16px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 800, color: 'var(--orange)', background: 'rgba(249,115,22,0.1)' }}>
            <Flame size={14} fill="var(--orange)" /> {streak} Day Streak
          </div>
        </div>
      </header>

      <div className="grid-4 mb-6" style={{ gap: '24px' }}>
        <StatCard label="Phase XP" value={xp} sub="Total earned" color="var(--gold)" icon={<Star size={14} />} />
        <StatCard label="Neural Load" value="Optimal" sub="Stable" color="var(--teal)" icon={<Zap size={14} />} />
        <StatCard label="Pain Scale" value={`${patient.pain_level}/10`} sub="Recent level" color={patient.pain_level === 0 ? 'var(--teal)' : 'var(--red)'} icon={<Target size={14} />} />
        <StatCard label="Protocol" value={plan?.length || 0} sub="Exercises" color="var(--green)" icon={<ClipboardList size={14} />} />
      </div>

      <div className="grid-3 mb-6" style={{ gap: '24px', marginTop: '12px' }}>
        <TodaysGoals plan={plan} style={{ gridColumn: 'span 2' }} />
        <AIInsightCard patient={patient} streak={streak} isRecovered={isCurrentRecovered} grade={currentGrade} />
      </div>

      {isCurrentRecovered ? (
        <RecoveryCertificate
          injuryType={patient.injury_type}
          recoveredDate={recoveredInjuries[patient.injury_type]}
          plan={plan}
          grade={currentGrade}
          onExperienceAgain={handleExperienceAgain}
        />
      ) : (
        <div style={{ marginTop: '40px' }}>
          {/* Grade badge for active protocols that are Grade 2/3 */}
          {currentGrade >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: '20px', padding: '12px 20px', background: currentGrade === 3 ? 'rgba(239,68,68,0.07)' : 'rgba(245,158,11,0.07)', border: `1px solid ${currentGrade === 3 ? '#ef4444' : '#f59e0b'}`, borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TriangleAlert size={18} style={{ color: currentGrade === 3 ? '#ef4444' : '#f59e0b', flexShrink: 0 }} />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: currentGrade === 3 ? '#ef4444' : '#f59e0b' }}>
                  {currentGrade === 3 ? 'Grade III Protocol — Critical Severity' : 'Grade II Protocol — Recurring Injury'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginLeft: '10px' }}>
                  {currentGrade === 3 ? 'Very mild exercises only • Surgical consult recommended' : 'Beginner-only exercises • Reduced volume'}
                </span>
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text)' }}>
              <ClipboardList size={22} className="text-teal" /> Prescribed Daily Protocol
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 10px', background: 'rgba(167, 139, 250, 0.1)', color: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                AI DYNAMIC CALIBRATION ACTIVE
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--muted)' }}>PLAN v{streak + 1}.{Math.floor(xp / 100)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', position: 'relative' }}>
            <AnimatePresence>
              {updating && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ position: 'absolute', inset: -12, zIndex: 10, background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}>
                    <Sparkles size={40} className="text-teal" />
                  </motion.div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text)', letterSpacing: '1px' }}>AI RECALIBRATING PROTOCOL...</div>
                </motion.div>
              )}
            </AnimatePresence>

            {(!plan || plan.length === 0) ? (
              <div className="card" style={{ gridColumn: 'span 3', textAlign: 'center', padding: '60px' }}>Generating AI Plan...</div>
            ) : (
              plan.map((ex, i) => (
                <motion.div key={i} whileHover={{ y: -4 }} onClick={() => onSelectEx(ex)} className="exercise-card" style={{ cursor: 'pointer', padding: '20px' }}>
                  <div className="exercise-header">
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>MODULE 0{i + 1}</div>
                    <div className={`tag ${ex.difficulty === 1 ? 'tag-diff-1' : ex.difficulty === 3 ? 'tag-diff-3' : 'tag-diff-2'}`}>{ex.difficulty_label}</div>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '4px', color: 'var(--text)' }}>{ex.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.4, minHeight: '36px' }}>{ex.description}</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="tag tag-sets">{ex.sets} SETS</div>
                    <div className="tag tag-reps">{ex.reps} REPS</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Sub Components ────────────────────────────────────────────── */
const TodaysGoals = ({ plan, style }) => {
  const goals = [
    { id: 'warmup', label: 'Complete warm-up routine', icon: <Flame size={18} className="text-orange" /> },
    { id: 'protocol', label: 'Finish all protocol exercises', icon: <Dumbbell size={18} className="text-teal" /> },
    { id: 'cooldown', label: 'Cool-down & stretching (5 min)', icon: <Flower size={18} className="text-light" /> },
    { id: 'log', label: 'Log daily session feedback', icon: <ClipboardList size={18} className="text-accent" /> },
  ];
  const [done, setDone] = useState([]);
  const toggle = (id) => setDone(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const progress = Math.round((done.length / goals.length) * 100);
  return (
    <div className="card" style={{ gridColumn: 'span 2', padding: '24px 28px', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', fontWeight: 800, color: 'var(--text)' }}>
          <ListChecks size={18} className="text-teal" /> Today's Goals
        </div>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: progress === 100 ? 'var(--green)' : 'var(--teal)' }}>{done.length}/{goals.length} DONE</div>
      </div>
      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '100px', marginBottom: '18px', overflow: 'hidden' }}>
        <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} style={{ height: '100%', background: 'linear-gradient(90deg, var(--teal), var(--light))', borderRadius: '100px' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {goals.map(g => (
          <motion.div key={g.id} whileTap={{ scale: 0.97 }} onClick={() => toggle(g.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', background: done.includes(g.id) ? 'rgba(139,92,246,0.07)' : 'transparent', border: done.includes(g.id) ? '1px solid rgba(139,92,246,0.25)' : '1px solid var(--border)', transition: 'all 0.2s' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '6px', flexShrink: 0, background: done.includes(g.id) ? 'var(--teal)' : 'transparent', border: done.includes(g.id) ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {done.includes(g.id) && <CheckCircle2 size={14} color="#fff" />}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px' }}>{g.icon}</div>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, color: done.includes(g.id) ? 'var(--muted)' : 'var(--text)', textDecoration: done.includes(g.id) ? 'line-through' : 'none' }}>{g.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const AIInsightCard = ({ patient, streak, isRecovered, grade }) => {
  const pain = patient?.pain_level || 5;
  const injury = patient?.injury_type || 'your injury';
  const insights = isRecovered
    ? [
        { icon: <ShieldCheck style={{ color: 'var(--teal)' }} />, title: 'Recovery Certified', body: `Your ${injury} treatment is clinically complete. Maintain mobility with light weekly movement.` },
        { icon: <Award style={{ color: '#f59e0b' }} />, title: `Grade ${grade} Certificate Earned`, body: grade === 3 ? 'Chronic recurrence detected. Surgeon consultation is strongly recommended before any new rehabilitation cycle.' : 'Protocol milestone achieved. You have demonstrated clinical-grade discipline in your recovery.' },
      ]
    : [
        pain >= 7 ? { icon: <AlertTriangle className="text-red" />, title: 'High Pain Detected', body: `Pain at ${pain}/10 — reduce rep count today and prioritize controlled breathing.` }
          : pain >= 4 ? { icon: <BarChart3 className="text-orange" />, title: 'Moderate Load Advisory', body: `Pain at ${pain}/10 — maintain current intensity. Eccentric control is your focus.` }
          : { icon: <CheckCircle2 className="text-green" />, title: 'Optimal Zone', body: `Pain at ${pain}/10 — you are in the green zone. Push protocol volume today.` },
        streak >= 3
          ? { icon: <Sparkles className="text-teal" />, title: 'Building Momentum', body: `${streak} days in — your neuromuscular adaptation window is opening.` }
          : { icon: <Rocket className="text-muted" />, title: 'Start Your Streak', body: `Complete today's session to begin your recovery streak.` },
      ];
  const [idx, setIdx] = useState(0);
  const tip = insights[Math.min(idx, insights.length - 1)];
  return (
    <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}><BrainCircuit size={18} className="text-teal" /> AI Insight</div>
      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
          <div style={{ fontSize: '1.6rem', marginBottom: '10px' }}>{tip.icon}</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>{tip.title}</div>
          <p style={{ fontSize: '0.78rem', lineHeight: 1.65, color: 'var(--muted)' }}>{tip.body}</p>
        </motion.div>
      </AnimatePresence>
      <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
        {insights.map((_, i) => <button key={i} onClick={() => setIdx(i)} style={{ flex: 1, height: '4px', borderRadius: '2px', border: 'none', cursor: 'pointer', background: i === idx ? 'var(--teal)' : 'var(--border)' }} />)}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, color, icon }) => (
  <div className="stat-card" style={{ '--accent-color': color, padding: '16px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <div className="stat-label" style={{ fontSize: '0.65rem' }}>{label}</div>
      <div style={{ color, opacity: 0.8 }}>{icon}</div>
    </div>
    <div className="stat-value" style={{ color, fontSize: '1.5rem' }}>{value}</div>
    <div className="stat-sub" style={{ fontSize: '0.7rem' }}>{sub}</div>
  </div>
);

export default DashboardOverview;
