import React, { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { initDefaultExercisesIfNeeded } from './storage/webStorage';
import HomePage from './pages/HomePage';
import ExercisesPage from './pages/ExercisesPage';
import StatsPage from './pages/StatsPage';
import ProfilePage from './pages/ProfilePage';
import NewSessionPage from './pages/NewSessionPage';
import SessionDetailPage from './pages/SessionDetailPage';

const tabs = [
  { path: '/', label: '训练', icon: '🏀' },
  { path: '/exercises', label: '动作库', icon: '📋' },
  { path: '/stats', label: '统计', icon: '📊' },
  { path: '/profile', label: '我的', icon: '⚙️' },
];

export default function App() {
  const [ready, setReady] = useState(false);
  const location = useLocation();
  const isSessionPage = location.pathname.startsWith('/session');

  useEffect(() => {
    initDefaultExercisesIfNeeded().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/session/new" element={<NewSessionPage />} />
          <Route path="/session/:id" element={<SessionDetailPage />} />
        </Routes>
      </div>
      {!isSessionPage && (
        <nav className="tab-bar">
          {tabs.map((tab) => (
            <NavLink key={tab.path} to={tab.path} end={tab.path === '/'}
              className={({ isActive }) => 'tab-item' + (isActive ? ' active' : '')}>
              <span className="tab-icon">{tab.icon}</span>
              <span>{tab.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  );
}