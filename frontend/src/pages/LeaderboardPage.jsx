import React, { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/api';

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await getLeaderboard();
      setLeaderboard(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch leaderboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {loading && <p className="text-gray-600">Loading leaderboard...</p>}

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {!loading && leaderboard.length === 0 && !error && (
          <p className="text-gray-600 text-center py-8">
            No users found. Create users and add steps to see the leaderboard!
          </p>
        )}

        {!loading && leaderboard.length > 0 && (
          <div className="space-y-3">
            {leaderboard.map((user, index) => {
              const rank = index + 1;
              const isTopThree = rank <= 3;
              const medal = getMedalEmoji(rank);
              
              return (
                <div
                  key={user.id}
                  className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Rank Number or Medal */}
                      {medal ? (
                        <div className="text-3xl">{medal}</div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-gray-600">#{rank}</span>
                        </div>
                      )}
                      
                      {/* User Info */}
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {user.name}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    
                    {/* Steps Count */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">
                        {user.totalSteps.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">steps</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
