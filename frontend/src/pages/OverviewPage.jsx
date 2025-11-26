import React, { useState, useEffect } from 'react';
import { getUsers, getStepsByUserId, syncStepsFromGoogleFit } from '../api/api';

const OverviewPage = ({ userId }) => {
  const [userData, setUserData] = useState(null);
  const [stepHistory, setStepHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState('');

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const users = await getUsers();
      const user = users.find(u => u.id === userId);
      setUserData(user);

      const steps = await getStepsByUserId(userId);
      console.log('Raw step history from API:', steps);
      
      // Log each date to see format
      steps.forEach((record, index) => {
        console.log(`Record ${index}:`, {
          rawDate: record.date,
          dateType: typeof record.date,
          parsedDate: new Date(record.date).toISOString(),
          localDate: new Date(record.date).toLocaleDateString(),
          steps: record.steps
        });
      });
      
      setStepHistory(steps);
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSteps = async () => {
    if (!userId) return;
    
    try {
      setSyncing(true);
      setError('');
      setSyncSuccess('');
      await syncStepsFromGoogleFit(userId);
      setSyncSuccess('Steps synced successfully from Google Fit!');
      await fetchUserData();
      setTimeout(() => setSyncSuccess(''), 3000);
    } catch (err) {
      console.error('Sync error:', err);
      setError('Failed to sync steps: ' + (err.response?.data?.message || err.message));
    } finally {
      setSyncing(false);
    }
  };

  // Improved date comparison - handles timezone issues
  const getTodaySteps = () => {
    if (!stepHistory || stepHistory.length === 0) {
      console.log('No step history available');
      return 0;
    }
    
    // Get today's date in local timezone
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    console.log('Looking for today:', { todayYear, todayMonth, todayDate });
    console.log('Today as string:', `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`);
    
    const todayRecord = stepHistory.find(record => {
      // Parse the date from the record
      const recordDate = new Date(record.date);
      const recordYear = recordDate.getFullYear();
      const recordMonth = recordDate.getMonth();
      const recordDateDay = recordDate.getDate();
      
      console.log('Comparing record:', {
        rawDate: record.date,
        recordYear,
        recordMonth,
        recordDateDay,
        matches: recordYear === todayYear && recordMonth === todayMonth && recordDateDay === todayDate,
        steps: record.steps
      });
      
      return recordYear === todayYear && recordMonth === todayMonth && recordDateDay === todayDate;
    });
    
    if (todayRecord) {
      console.log('✅ Found today\'s record:', todayRecord);
      return todayRecord.steps;
    } else {
      console.log('❌ No record found for today, trying most recent...');
      
      // Fallback: get most recent step record
      if (stepHistory.length > 0) {
        const sortedSteps = [...stepHistory].sort((a, b) => new Date(b.date) - new Date(a.date));
        const mostRecent = sortedSteps[0];
        console.log('Using most recent record:', mostRecent);
        return mostRecent.steps;
      }
      
      return 0;
    }
  };

  const getTotalSteps = () => {
    if (!stepHistory || stepHistory.length === 0) return 0;
    return stepHistory.reduce((sum, record) => sum + record.steps, 0);
  };

  const getAverageDailySteps = () => {
    if (!stepHistory || stepHistory.length === 0) return 0;
    const total = stepHistory.reduce((sum, record) => sum + record.steps, 0);
    return Math.round(total / stepHistory.length);
  };

  const getActiveDays = () => {
    if (!stepHistory || stepHistory.length === 0) return 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeDays = stepHistory.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= sevenDaysAgo && record.steps > 0;
    });
    
    return activeDays.length;
  };

  const todaySteps = getTodaySteps();
  const goal = 10000;
  const progress = Math.min((todaySteps / goal) * 100, 100);
  const distance = (todaySteps * 0.0008).toFixed(1);
  const activeTime = Math.round(todaySteps / 100);
  const totalSteps = getTotalSteps();
  const avgDaily = getAverageDailySteps();
  const activeDays = getActiveDays();

  console.log('📊 Final calculated values:', { 
    todaySteps, 
    distance, 
    activeTime, 
    totalSteps, 
    avgDaily, 
    activeDays,
    stepHistoryCount: stepHistory.length 
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="ml-4 text-gray-600">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Enhanced Debug Info */}
        {/* {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="font-bold mb-2">🐛 Debug Info:</p>
            <p>Step History Count: <strong>{stepHistory.length}</strong></p>
            <p>Today Steps: <strong>{todaySteps.toLocaleString()}</strong></p>
            <p>User Data: <strong>{userData ? 'Loaded ✓' : 'Not loaded ✗'}</strong></p>
            <p>Google Token: <strong>{userData?.googleAccessToken ? 'Connected ✓' : 'Not connected ✗'}</strong></p>
            <div className="mt-2 pt-2 border-t border-yellow-300">
              <p className="font-semibold">Available dates in database:</p>
              {stepHistory.map((record, idx) => (
                <p key={idx} className="text-xs">
                  • {new Date(record.date).toLocaleDateString()} - {record.steps.toLocaleString()} steps
                </p>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-600">
              💡 Check browser console (F12) for detailed date comparison logs
            </p>
          </div>
        )} */}

        {/* Sync Button and Messages */}
        <div className="mb-6 flex justify-between items-center">
          <div className="flex-1">
            {syncSuccess && (
              <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {syncSuccess}
              </div>
            )}
            {error && !syncSuccess && (
              <div className="inline-flex items-center px-4 py-2 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>
          {userData?.googleAccessToken && (
            <button
              onClick={handleSyncSteps}
              disabled={syncing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors font-medium shadow-sm"
            >
              <svg 
                className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{syncing ? 'Syncing...' : 'Sync from Google Fit'}</span>
            </button>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Steps Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Today's Steps</h3>
            <div className="mb-4">
              <div className="flex items-baseline mb-2">
                <span className="text-5xl font-bold text-green-600">{todaySteps.toLocaleString()}</span>
                <span className="text-lg text-gray-500 ml-2">steps</span>
              </div>
              <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">Goal: {goal.toLocaleString()}</span>
                <span className="text-xs font-medium text-green-600">
                  {todaySteps >= goal 
                    ? `${(todaySteps - goal).toLocaleString()} over goal!` 
                    : `${(goal - todaySteps).toLocaleString()} left`}
                </span>
              </div>
            </div>

            {/* Distance and Active Time */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{distance} km</p>
                  <p className="text-xs text-gray-500">Distance</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{activeTime} min</p>
                  <p className="text-xs text-gray-500">Active Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Breakdown Card */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Activity Breakdown</h3>
            <div className="flex items-center justify-center mb-6">
              <svg className="w-40 h-40" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="10"
                  strokeDasharray="150.8 251.2"
                  strokeDashoffset="0"
                  transform="rotate(-90 50 50)"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="10"
                  strokeDasharray="75.4 326.6"
                  strokeDashoffset="-150.8"
                  transform="rotate(-90 50 50)"
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  fill="none" 
                  stroke="#8b5cf6" 
                  strokeWidth="10"
                  strokeDasharray="25.1 376.9"
                  strokeDashoffset="-226.2"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-700">Walking</span>
                </div>
                <span className="text-sm font-medium text-gray-900">60%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-700">Running</span>
                </div>
                <span className="text-sm font-medium text-gray-900">30%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-700">Stairs</span>
                </div>
                <span className="text-sm font-medium text-gray-900">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalSteps.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Total Steps</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{avgDaily.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Avg Daily</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{activeDays}/7</p>
                <p className="text-xs text-gray-500">Active Days</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;