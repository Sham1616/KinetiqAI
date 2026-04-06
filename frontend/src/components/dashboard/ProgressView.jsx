import React, { useState, useEffect } from 'react';
import { Target, ClipboardList, BarChart3, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale } from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';
import Skeleton from '../ui/Skeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, RadialLinearScale);

const tooltipConfig = {
  backgroundColor: 'rgba(15, 23, 42, 0.9)',
  titleColor: '#f8fafc',
  bodyColor: '#f8fafc',
  borderColor: 'rgba(139, 92, 246, 0.3)',
  borderWidth: 1,
  padding: 12,
  cornerRadius: 8,
  displayColors: true,
};

const ProgressView = ({ profile }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterInjury, setFilterInjury] = useState('All');

  useEffect(() => {
    api(`/progress/${profile.patient.user_id}`)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [profile.patient.user_id]);

  // Derive available injury types from log data
  const injuryTypes = ['All', ...Array.from(new Set(logs.map(l => l.injury_type).filter(Boolean)))];

  // Filter logs for charts (but not for the history table)
  const filteredLogs = filterInjury === 'All' ? logs : logs.filter(l => l.injury_type === filterInjury);

  // Check if the selected injury has been fully recovered (last log for it has pain = 0)
  const getRecoveryStatus = (injuryType) => {
    if (injuryType === 'All') return null;
    const injuryLogs = logs.filter(l => l.injury_type === injuryType);
    if (injuryLogs.length === 0) return null;
    const lastLog = injuryLogs[injuryLogs.length - 1];
    return lastLog.pain_level === 0 ? lastLog.log_date : null;
  };

  const recoveredDate = getRecoveryStatus(filterInjury);

  const labels = filteredLogs.map(l => l.log_date);
  const dataPain = {
    labels,
    datasets: [{
      label: 'Pain Index',
      data: filteredLogs.map(l => l.pain_level),
      borderColor: '#ef4444',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: '#ef4444'
    }]
  };
  const dataComp = {
    labels,
    datasets: [{
      label: 'Compliance (%)',
      data: filteredLogs.map(l => l.completion_pct),
      backgroundColor: 'rgba(139, 92, 246, 0.8)', borderRadius: 4, barThickness: 20
    }]
  };
  const dataBalance = {
    labels: ['Mobility', 'Strength', 'Symmetry', 'Endurance', 'Flexibility'],
    datasets: [{
       label: 'Assessment', data: [70, 55, 80, 45, 60],
       backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: 'var(--teal)',
       pointBackgroundColor: 'var(--teal)', borderWidth: 2
    }]
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="page-title">Recovery Stats</h1>
          <p className="page-sub">Comprehensive clinical metrics of your functional path.</p>
        </div>

        {/* Injury Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Filter size={14} style={{ color: 'var(--muted)' }} />
          <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Viewing:
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={filterInjury}
              onChange={(e) => setFilterInjury(e.target.value)}
              style={{
                appearance: 'none',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '8px 32px 8px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {loading ? (
                <option>Loading...</option>
              ) : injuryTypes.map(type => (
                <option key={type} value={type} style={{ background: 'var(--bg-dark)' }}>{type}</option>
              ))}
            </select>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '0.6rem', color: 'var(--muted)' }}>▼</div>
          </div>
        </div>
      </header>

      {/* Recovery Banner */}
      <AnimatePresence>
        {recoveredDate && (
          <motion.div
            initial={{ opacity: 0, y: -12, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -12, height: 0 }}
            style={{
              marginBottom: '24px',
              background: 'rgba(20, 184, 166, 0.07)',
              border: '1px solid var(--teal)',
              borderRadius: '14px',
              padding: '16px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <CheckCircle2 size={28} style={{ color: 'var(--teal)', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>
                🎉 Fully Recovered: <span style={{ color: 'var(--teal)' }}>{filterInjury}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', margin: 0 }}>
                Symptom resolution confirmed on <strong style={{ color: 'var(--text)' }}>{recoveredDate}</strong>. 
                Viewing archived protocol data for this injury.
              </p>
            </div>
            <div style={{ marginLeft: 'auto', padding: '4px 12px', background: 'var(--teal)', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              RECOVERED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid-2 mb-6" style={{ gap: '16px' }}>
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Target className="text-teal" size={18} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Subjective Pain Scale</h3>
            {filterInjury !== 'All' && (
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'rgba(20,184,166,0.1)', color: 'var(--teal)', borderRadius: '4px', fontWeight: 800, marginLeft: 'auto' }}>
                {filterInjury}
              </span>
            )}
          </div>
          <div style={{ height: '220px' }}>
            {loading ? <Skeleton width="100%" height="220px" /> : filteredLogs.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No data for selected injury</div>
            ) : (
              <Line
                data={dataPain}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    y: { min: 0, max: 10, grid: { color: 'rgba(139, 92, 246, 0.1)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: { legend: { display: false }, tooltip: tooltipConfig }
                }}
              />
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <ClipboardList className="text-teal" size={18} />
            <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>In-Session Compliance</h3>
            {filterInjury !== 'All' && (
              <span style={{ fontSize: '0.6rem', padding: '2px 8px', background: 'rgba(20,184,166,0.1)', color: 'var(--teal)', borderRadius: '4px', fontWeight: 800, marginLeft: 'auto' }}>
                {filterInjury}
              </span>
            )}
          </div>
          <div style={{ height: '220px' }}>
            {loading ? <Skeleton width="100%" height="220px" /> : filteredLogs.length === 0 ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>No data for selected injury</div>
            ) : (
              <Bar
                data={dataComp}
                options={{
                  responsive: true, maintainAspectRatio: false,
                  scales: {
                    y: { min: 0, max: 100, grid: { color: 'rgba(139, 92, 246, 0.1)' } },
                    x: { grid: { display: false } }
                  },
                  plugins: { legend: { display: false }, tooltip: tooltipConfig }
                }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ gridTemplateColumns: '1.2fr 1.8fr', gap: '16px' }}>
         <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
            <div className="card-title" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BarChart3 size={18} className="text-teal" /> Structural Balance
            </div>
            <div style={{ height: '200px', width: '100%' }}>
              {loading ? <Skeleton width="100%" height="200px" borderRadius="50%" /> : (
                <Radar data={dataBalance} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: tooltipConfig }, scales: { r: { min: 0, max: 100, ticks: { display: false }, grid: { color: 'rgba(139, 92, 246, 0.1)' } } } }} />
              )}
            </div>
         </div>

         {/* Intake History — always shows ALL logs, unfiltered */}
         <div className="card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontSize: '0.85rem', fontWeight: 800 }}>Intake History</h3>
               <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--muted)', background: 'var(--border)', padding: '3px 8px', borderRadius: '4px' }}>ALL INJURIES · FULL LOG</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', minHeight: '300px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.02)', textAlign: 'left', fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.5px' }}>
                       <th style={{ padding: '12px 20px' }}>DATE</th>
                       <th style={{ padding: '12px 20px' }}>INJURY</th>
                       <th style={{ padding: '12px 20px' }}>PAIN</th>
                       <th style={{ padding: '12px 20px' }}>PROTOCOL</th>
                    </tr>
                 </thead>
                 <tbody>
                    {loading ? (
                      [1,2,3].map(i => (
                        <tr key={i}>
                          <td colSpan={4} style={{ padding: '10px 20px' }}><Skeleton width="100%" height="20px" /></td>
                        </tr>
                      ))
                    ) : logs.map((l, i) => {
                       const exs = l.exercises_done ? JSON.parse(l.exercises_done) : [];
                       const isRecovered = l.pain_level === 0;

                       return (
                        <React.Fragment key={i}>
                          <tr style={{ borderBottom: exs.length > 0 ? 'none' : '1px solid var(--border)', fontSize: '0.75rem', color: 'var(--text)', background: isRecovered ? 'rgba(20, 184, 166, 0.05)' : 'transparent' }}>
                              <td style={{ padding: '12px 20px', fontWeight: 600 }}>{l.log_date}</td>
                              <td style={{ padding: '12px 20px', fontWeight: 700, color: 'var(--teal)', fontSize: '0.7rem' }}>{l.injury_type || 'General'}</td>
                              <td style={{ padding: '12px 20px' }}>
                                {isRecovered ? (
                                  <span style={{ fontSize: '0.6rem', padding: '3px 8px', background: 'var(--teal)', color: '#fff', borderRadius: '4px', fontWeight: 800 }}>RECOVERED</span>
                                ) : (
                                  <span style={{ fontWeight: 800, color: l.pain_level > 6 ? 'var(--red)' : l.pain_level > 3 ? 'var(--orange)' : 'var(--green)' }}>{l.pain_level}/10</span>
                                )}
                              </td>
                              <td style={{ padding: '12px 20px', fontWeight: 700, fontSize: '0.75rem' }}>{l.completion_pct}%</td>
                          </tr>
                          {exs.length > 0 && (
                            <tr style={{ borderBottom: '1px solid var(--border)', background: isRecovered ? 'rgba(20, 184, 166, 0.03)' : 'transparent' }}>
                              <td colSpan={4} style={{ padding: '0 20px 12px 20px' }}>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                  {exs.map((ex, idx) => (
                                    <span key={idx} style={{ fontSize: '0.6rem', padding: '2px 6px', background: 'var(--border)', color: 'var(--muted)', borderRadius: '4px' }}>
                                      {ex.name}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                       );
                    })}
                 </tbody>
              </table>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ProgressView;
