import React from 'react';

const Header = ({ currentPage, onPageChange, userName, onLogout }) => {
  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'statistics', name: 'Statistics' },
    { id: 'leaderboard', name: 'Leaderboard' },
  ];

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center">
              <span className="mr-2">🏃</span>
              Wellness Tracker
            </h1>
            <p className="text-xs text-gray-500 mt-1">Welcome back, {userName}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-orange-500">🔥</span>
              <span className="font-medium text-gray-700">7 Day Streak</span>
            </div>
            <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <button 
              onClick={onLogout}
              className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <nav className="flex space-x-1 border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onPageChange(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-all relative ${
                currentPage === tab.id
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
              {currentPage === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
