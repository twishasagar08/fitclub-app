import React, { useState, useEffect } from 'react';
import { getUsers, getStepsByUserId } from '../api/api';

const StepHistoryPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [stepHistory, setStepHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users: ' + err.message);
    }
  };

  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setStepHistory([]);
    setError('');

    if (!userId) return;

    try {
      setLoading(true);
      const data = await getStepsByUserId(userId);
      setStepHistory(data);
    } catch (err) {
      setError('Failed to fetch step history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Step History</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={handleUserChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="">-- Select a user to view history --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {selectedUser && (
            <div className="mb-6 p-5 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {selectedUser.name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedUser.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Steps</p>
                  <p className="text-3xl font-bold text-green-600">
                    {selectedUser.totalSteps.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading && <p className="text-gray-600">Loading history...</p>}

          {error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!loading && selectedUserId && stepHistory.length === 0 && !error && (
            <p className="text-gray-600 text-center py-8">
              No step records found for this user.
            </p>
          )}

          {!loading && stepHistory.length > 0 && (
            <div className="space-y-2">
              {stepHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700">
                    {formatDate(record.date)}
                  </span>
                  <span className="text-base font-semibold text-gray-800">
                    {record.steps.toLocaleString()} steps
                  </span>
                </div>
              ))}
              
              <div className="flex justify-between items-center p-4 bg-green-100 rounded-lg mt-4">
                <span className="text-sm font-semibold text-gray-800">
                  Total
                </span>
                <span className="text-lg font-bold text-green-600">
                  {stepHistory.reduce((sum, record) => sum + record.steps, 0).toLocaleString()} steps
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepHistoryPage;
