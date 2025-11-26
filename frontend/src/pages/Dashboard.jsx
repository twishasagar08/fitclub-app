import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import OverviewPage from './OverviewPage';
import UserListPage from './UserListPage';
import AddStepsPage from './AddStepsPage';
import SyncStepsPage from './SyncStepsPage';
import LeaderboardPage from './LeaderboardPage';
import StepHistoryPage from './StepHistoryPage';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user data is in URL params (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userId');
    const userName = params.get('name');
    const success = params.get('success');

    if (success === 'true' && userId) {
      setUser({
        id: userId,
        name: decodeURIComponent(userName || 'User'),
      });
      // Clean up URL
      window.history.replaceState({}, '', '/dashboard');
    } else if (success === 'false') {
      const error = params.get('error');
      alert(`Login failed: ${decodeURIComponent(error || 'Unknown error')}`);
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewPage userId={user?.id} />;
      case 'statistics':
        return <StepHistoryPage />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'users':
        return <UserListPage />;
      case 'add-steps':
        return <AddStepsPage />;
      case 'sync-steps':
        return <SyncStepsPage />;
      default:
        return <OverviewPage userId={user?.id} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        userName={user?.name || 'User'}
        onLogout={handleLogout}
      />

      <main>{renderPage()}</main>
    </div>
  );
};

export default Dashboard;
