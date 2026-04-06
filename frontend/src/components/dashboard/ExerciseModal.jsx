import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, ClipboardList, Shield, PlayCircle } from 'lucide-react';

const VIDEO_MAP = {
  // Knee
  'Straight Leg Raises': 'Ka19yzAlIGY',
  'Heel Slides': 'yL5maSn3M-g',
  'Terminal Knee Extensions': 'VuJZ6dqMf8M',
  'Mini Squats': 'IaInMN_WZDM',
  'Step-Ups': 'IaInMN_WZDM',
  'Wall Squats': 'VuJZ6dqMf8M',
  // Back
  'Pelvic Tilts': 'ytvP0oUDKYw',
  'Cat-Cow Stretch': 'Y-s5X4yKPCs',
  'Bird-Dog': 'Y-s5X4yKPCs',
  'Bridges': 'ytvP0oUDKYw',
  'Dead Bug': 'ytvP0oUDKYw',
  'Superman Hold': 'Y-s5X4yKPCs',
  // Shoulder
  'Pendulum Swings': 'QF_ubbr_RUE',
  'Wall Crawl': 'QF_ubbr_RUE',
  'Shoulder External Rotation': 'QF_ubbr_RUE',
  'Scapular Squeezes': 'QF_ubbr_RUE',
  'Lateral Raises': 'QF_ubbr_RUE',
  'PNF Diagonal Pattern': 'QF_ubbr_RUE',
  // Ankle
  'Ankle Circles': 'mzTQGYGI0Ng',
  'Towel Toe Curls': 'mzTQGYGI0Ng',
  'Calf Raises': 'NPWkc5-6qD0',
  'Resistance Band Dorsiflexion': 'mzTQGYGI0Ng',
  'Single Leg Balance': 'mzTQGYGI0Ng',
  'Heel-Toe Walking': 'mzTQGYGI0Ng',
  // Hip
  'Hip Flexor Stretch': 'O2KPabIoPPk',
  'Clam Shells': 'O2KPabIoPPk',
  'Hip Abduction': 'qBqKuEQl9sI',
  'Hip Bridges with Band': 'O2KPabIoPPk',
  'Lateral Band Walks': 'qBqKuEQl9sI',
  'Single Leg Deadlift': 'qBqKuEQl9sI',
  // Neck
  'Chin Tucks': '7rnlAVhAK-8',
  'Neck Side Stretch': '7rnlAVhAK-8',
  'Neck Rotation': '7rnlAVhAK-8',
  'Shoulder Shrugs': '7rnlAVhAK-8',
  'Isometric Neck Resistance': '7rnlAVhAK-8',
  'Levator Scapulae Stretch': '7rnlAVhAK-8',
  // Categories (Fallbacks)
  'Deep Breathing': '-7-CAFhJn78',
  'Gentle Walking': 'ZgxniVfKT4I',
  'general': 'ZgxniVfKT4I'
};

const ExerciseModal = ({ exercise, onClose }) => {
  if (!exercise) return null;

  const getVideoId = () => {
    // 1. Prioritize our clean local mapping first (X-checks name)
    if (VIDEO_MAP[exercise.name]) return VIDEO_MAP[exercise.name];
    
    // 2. Fallback to category mapping
    if (VIDEO_MAP[exercise.category]) return VIDEO_MAP[exercise.category];

    // 3. If backend provides a specific ID (ensure it's a clean 11-char ID, not a legacy URL)
    if (exercise.video_id && exercise.video_id.length === 11 && !exercise.video_id.includes('http')) {
      return exercise.video_id;
    }

    return 'zJg5t1Xj3Xk'; // Final stable fallback (Deep Breathing)
  };

  const videoId = getVideoId();
  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }} />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', padding: '32px', zIndex: 10, maxHeight: '90vh', overflowY: 'auto' }}>
           <button onClick={onClose} aria-label="Close Exercise modal" style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}><X size={20} /></button>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Dumbbell className="text-teal" size={24} />
              </div>
              <div>
                 <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text)' }}>{exercise.name}</h2>
                 <span className={`tag ${exercise.difficulty === 1 ? 'tag-diff-1' : exercise.difficulty === 3 ? 'tag-diff-3' : 'tag-diff-2'}`}>{exercise.difficulty_label} INTENSITY</span>
              </div>
           </div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div className="stat-card" style={{ '--accent-color': 'var(--teal)', padding: '12px' }}>
                 <div className="stat-label">DAILY VOLUME</div>
                 <div className="stat-value" style={{ fontSize: '1.2rem' }}>{exercise.sets} × {exercise.reps}</div>
                 <div className="stat-sub">Sets & Reps</div>
              </div>
              <div className="stat-card" style={{ '--accent-color': 'var(--orange)', padding: '12px' }}>
                 <div className="stat-label">EST. DURATION</div>
                 <div className="stat-value" style={{ fontSize: '1.2rem' }}>8–12 MIN</div>
                 <div className="stat-sub">Sustain focus</div>
              </div>
           </div>

           <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><ClipboardList size={16} className="text-teal" /> Functional Instructions</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text)', lineHeight: 1.6 }}>{exercise.description}. Focus on smooth eccentric control. Avoid any sharp pain; maintain a steady breathing rhythm throughout the entire range of motion.</p>
           </div>

           <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)' }}><PlayCircle size={16} className="text-teal" /> Reference Video</h4>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', border: '1px solid var(--border)', background: '#000' }}>
                 <iframe 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    src={`https://www.youtube.com/embed/${videoId}?rel=0`} 
                    title={`${exercise.name} reference video`} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                 ></iframe>
              </div>
           </div>

           <div style={{ padding: '16px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                 <Shield size={14} className="text-teal" />
                 <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text)' }}>Clinical Focus</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Keep the core engaged. If pain exceeds level 4 during this specific exercise, pause and log for recalibration.</p>
           </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ExerciseModal;
