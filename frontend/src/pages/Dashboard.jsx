import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from '../components/dashboard/Sidebar';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import FeedbackView from '../components/dashboard/FeedbackView';
import ProgressView from '../components/dashboard/ProgressView';
import AchievementsView from '../components/dashboard/AchievementsView';
import ChatComponent from '../components/dashboard/ChatComponent';
import ExerciseModal from '../components/dashboard/ExerciseModal';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3 } }
};

const Dashboard = ({ profile, onLogout, onUpdateProfile }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedEx, setSelectedEx] = useState(null);
  
  return (
    <div className="app-shell" style={{ background: 'var(--bg-dark)' }}>
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        userName={profile.patient.name}
      />

      {/* Main Content */}
      <main className="main-content">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
            {activeTab === 'dashboard' && <DashboardOverview profile={profile} onSelectEx={setSelectedEx} onUpdateProfile={onUpdateProfile} />}
            {activeTab === 'feedback' && <FeedbackView profile={profile} onUpdateProfile={onUpdateProfile} />}
            {activeTab === 'progress' && <ProgressView profile={profile} />}
            {activeTab === 'achievements' && <AchievementsView profile={profile} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Components */}
      <ChatComponent user={profile.patient} isOpen={chatOpen} setOpen={setChatOpen} />
      <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} />
    </div>
  );
};

export default Dashboard;
