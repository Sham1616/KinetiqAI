import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CalendarCheck, TrendingUp, Award, LogOut, Shield, Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../../App';

const Sidebar = ({ activeTab, setActiveTab, onLogout, userName }) => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <motion.aside initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="sidebar">
      <div className="sidebar-logo">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={24} className="text-teal" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>KinetiqAI</h2>
        </div>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.6 }}>CLINICAL PORTAL</span>
      </div>
      
      <div>
        <button className="theme-toggle-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span className="nav-label">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>
      
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
        <SidebarItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
        <SidebarItem active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} icon={<CalendarCheck size={18} />} label="Daily Session" />
        <SidebarItem active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} icon={<TrendingUp size={18} />} label="Stats" />
        <SidebarItem active={activeTab === 'achievements'} onClick={() => setActiveTab('achievements')} icon={<Award size={18} />} label="Achievements" />
      </nav>

      <div style={{ marginTop: 'auto', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '0 10px 12px 10px' }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Patient Profile</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text)' }}>{userName || 'User'}</div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{ width: '100%', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '0.9rem' }}>
          <LogOut size={18} /> <span className="nav-label" style={{ fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>
    </motion.aside>
  );
};

const SidebarItem = ({ active, onClick, icon, label }) => (
  <button 
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
    aria-label={label}
  >
    {icon} <span className="nav-label">{label}</span>
  </button>
);

export default Sidebar;
