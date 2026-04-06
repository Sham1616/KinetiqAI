import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import api from './services/api';

export const ThemeContext = createContext({ isDarkMode: false, toggleDarkMode: () => {} });

const App = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(!!user);
  
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Fetch profile on initial load or user change
  useEffect(() => {
    if (user) {
      setLoading(true);
      api(`/profile/${user.user_id}`)
        .then(data => setProfile(data))
        .catch(() => setProfile(null))
        .finally(() => setLoading(false));
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  const handleUpdateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading...</div>;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className="ambient-background" />
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/dashboard" /> : <Auth onLogin={handleLogin} />} 
          />
          
          <Route 
            path="/setup" 
            element={!user ? <Navigate to="/auth" /> : <Setup user={user} onDone={handleUpdateProfile} />} 
          />
          
          <Route 
            path="/dashboard" 
            element={
              !user ? <Navigate to="/auth" /> : 
              !profile?.patient ? <Navigate to="/setup" /> : 
              <Dashboard 
                profile={profile} 
                onLogout={handleLogout} 
                onUpdateProfile={handleUpdateProfile} 
              />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ThemeContext.Provider>
  );
};

export default App;
