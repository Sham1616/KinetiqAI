import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, Zap, Medal, Flame, Star, Trophy, Gem, Crown, 
  Sprout, RefreshCw, TrendingUp, Dumbbell, Footprints, 
  Target, Shield, Check, Activity, Lock, CheckCircle2,
  Trophy as TrophyIcon
} from 'lucide-react';

const IconMap = {
  'rocket': <Rocket />,
  'zap': <Zap />,
  'medal': <Medal />,
  'flame': <Flame />,
  'star': <Star />,
  'trophy': <Trophy />,
  'gem': <Gem />,
  'crown': <Crown />,
  'sprout': <Sprout />,
  'refresh-cw': <RefreshCw />,
  'trending-up': <TrendingUp />,
  'dumbbell': <Dumbbell />,
  'footprints': <Footprints />,
  'target': <Target />,
  'shield': <Shield />,
  'check': <Check />,
  'activity': <Activity />,
};

const GetIcon = (id, size = 24, className = "") => {
  const icon = IconMap[id] || IconMap['star'];
  return React.cloneElement(icon, { size, className });
};

const AchievementsView = ({ profile }) => {
  const [badges, setBadges] = useState([]);
  const gam = profile.gamification || {};
  const xp = gam.xp || 0;
  const streak = gam.streak || 0;

  useEffect(() => {
    try {
      const b = profile.gamification?.badges || [];
      setBadges(Array.isArray(b) ? b : JSON.parse(b));
    } catch(e) { setBadges([]); }
  }, [profile.gamification]);

  // All possible badges with metadata
  const ALL_BADGES = [
    { id: 'first_session', icon: <Rocket />, label: 'First Session', desc: 'Complete your very first exercise session', xp: 50, color: '#10B981', tier: 'Bronze' },
    { id: 'xp_100', icon: <Zap />, label: 'XP 100', desc: 'Accumulate 100 recovery points', xp: 100, color: '#f97316', tier: 'Bronze' },
    { id: 'full_day', icon: <Medal />, label: 'Full Day', desc: 'Complete 100% of your daily protocol', xp: 75, color: '#A78BFA', tier: 'Silver' },
    { id: 'streak_3', icon: <Flame />, label: '3-Day Streak', desc: 'Train 3 days in a row', xp: 150, color: '#ef4444', tier: 'Silver' },
    { id: 'streak_7', icon: <Star />, label: '7-Day Warrior', desc: 'Maintain a 7-day consecutive streak', xp: 300, color: '#8B5CF6', tier: 'Gold' },
    { id: 'xp_500', icon: <Trophy />, label: 'XP 500', desc: 'Reach 500 total recovery XP', xp: 200, color: '#f5c518', tier: 'Gold' },
    { id: 'pain_drop', icon: <Gem />, label: 'Pain Buster', desc: 'Reduce pain level by 3 points over sessions', xp: 250, color: '#A78BFA', tier: 'Platinum' },
    { id: 'xp_1000', icon: <Crown />, label: 'Recovery King', desc: 'Accumulate 1000 recovery XP', xp: 500, color: '#f5c518', tier: 'Platinum' },
  ];

  const TIER_COLORS = { Bronze: '#CD7F32', Silver: '#94a3b8', Gold: '#f5c518', Platinum: '#A78BFA' };

  const earned = ALL_BADGES.filter(b => badges.includes(b.id));
  const locked = ALL_BADGES.filter(b => !badges.includes(b.id));

  // XP level thresholds
  const levels = [
    { name: 'Beginner', min: 0, max: 200 },
    { name: 'Improving', min: 200, max: 500 },
    { name: 'Recovering', min: 500, max: 1000 },
    { name: 'Elite', min: 1000, max: 2000 },
  ];
  const currentLevel = levels.find(l => xp >= l.min && xp < l.max) || levels[levels.length - 1];
  const levelProgress = Math.min(100, ((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><TrophyIcon className="text-teal" size={32} /> Achievements</h1>
        <p className="page-sub">Your gamified clinical recovery journey — earn XP, unlock badges, level up.</p>
      </header>

      {/* XP + Level Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
        style={{ padding: '28px', marginBottom: '24px', background: 'var(--surface)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--teal)', letterSpacing: '1px', marginBottom: '6px' }}>CURRENT RANK</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text)' }}>{currentLevel.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', letterSpacing: '1px', marginBottom: '4px' }}>TOTAL XP</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)' }}>{xp} <span style={{ fontSize: '1rem', color: 'var(--muted)', fontWeight: 600 }}>/ {currentLevel.max}</span></div>
          </div>
        </div>
        <div style={{ height: '10px', background: 'var(--border)', borderRadius: '100px', overflow: 'hidden', marginBottom: '8px' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--teal), #A78BFA)', borderRadius: '100px' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
          <span>{currentLevel.name}</span>
          <span>{Math.round(levelProgress)}% to {levels[Math.min(levels.indexOf(currentLevel) + 1, levels.length - 1)].name}</span>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Badges Earned', value: `${earned.length} / ${ALL_BADGES.length}`, icon: <Medal className="text-teal" /> },
            { label: 'Day Streak', value: `${streak} Days`, icon: <Flame className="text-orange" fill="var(--orange)" /> },
            { label: 'Recovery XP', value: xp, icon: <Zap className="text-gold" fill="var(--gold)" /> },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text)' }}>{s.value}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Earned Badges */}
      {earned.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
            <CheckCircle2 size={18} className="text-green" /> Unlocked Badges <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--teal)', background: 'rgba(139,92,246,0.1)', padding: '2px 10px', borderRadius: '100px' }}>{earned.length}</span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
            {earned.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4, scale: 1.03 }}
                style={{
                  background: `linear-gradient(135deg, ${b.color}15, ${b.color}05)`,
                  border: `1.5px solid ${b.color}40`,
                  borderRadius: '16px', padding: '20px',
                  textAlign: 'center', cursor: 'default',
                  boxShadow: `0 4px 20px ${b.color}15`
                }}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '10px', color: b.color, display: 'flex', justifyContent: 'center' }}>
                  {React.cloneElement(b.icon, { size: 48 })}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text)' }}>{b.label.toUpperCase()}</div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: b.color, letterSpacing: '0.5px', marginBottom: '8px' }}>{b.tier.toUpperCase()} TIER</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.4 }}>{b.desc}</div>
                <div style={{ marginTop: '10px', fontSize: '0.72rem', fontWeight: 800, color: b.color }}>+{b.xp} XP</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}>
          <Lock size={18} className="text-muted" /> Locked Badges <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', background: 'var(--border)', padding: '2px 10px', borderRadius: '100px' }}>{locked.length}</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {locked.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -2 }}
              style={{
                background: 'var(--surface)', border: '1.5px dashed var(--border)',
                borderRadius: '16px', padding: '20px', textAlign: 'center',
                filter: 'grayscale(0.4)', opacity: 0.7
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '10px', opacity: 0.4, color: 'var(--muted)', display: 'flex', justifyContent: 'center' }}>
                {React.cloneElement(b.icon, { size: 48 })}
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '4px', color: 'var(--muted)' }}>{b.label.toUpperCase()}</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: TIER_COLORS[b.tier], letterSpacing: '0.5px', marginBottom: '8px' }}>{b.tier.toUpperCase()} TIER</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--muted)', lineHeight: 1.4 }}>{b.desc}</div>
              <div style={{ marginTop: '10px', fontSize: '0.72rem', fontWeight: 800, color: 'var(--muted)' }}>+{b.xp} XP</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AchievementsView;
