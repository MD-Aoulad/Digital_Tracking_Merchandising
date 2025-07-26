/**
 * Attendance Test Component
 * 
 * Simple component to test the attendance API integration
 * and verify that the frontend can communicate with the backend.
 */

import React, { useState } from 'react';
import { useCurrentAttendance, usePunchIn, usePunchOut } from '../../services/attendanceApi';
import toast from 'react-hot-toast';

const AttendanceTest: React.FC = () => {
  const { data: currentAttendance, loading: statusLoading, error: statusError, refetch } = useCurrentAttendance();
  const { punchIn, loading: punchInLoading, error: punchInError } = usePunchIn();
  const { punchOut, loading: punchOutLoading, error: punchOutError } = usePunchOut();

  const [testLocation, setTestLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    accuracy: 5
  });

  const handlePunchIn = async () => {
    try {
      const result = await punchIn({
        workplaceId: 'test-workplace-123',
        latitude: testLocation.latitude,
        longitude: testLocation.longitude,
        accuracy: testLocation.accuracy,
        notes: 'Test punch-in from frontend'
      });
      
      toast.success('Punch-in successful!');
      console.log('Punch-in result:', result);
      refetch(); // Refresh current status
    } catch (error) {
      toast.error('Punch-in failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Punch-in error:', error);
    }
  };

  const handlePunchOut = async () => {
    try {
      const result = await punchOut({
        latitude: testLocation.latitude,
        longitude: testLocation.longitude,
        accuracy: testLocation.accuracy,
        notes: 'Test punch-out from frontend'
      });
      
      toast.success('Punch-out successful!');
      console.log('Punch-out result:', result);
      refetch(); // Refresh current status
    } catch (error) {
      toast.error('Punch-out failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      console.error('Punch-out error:', error);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Attendance API Test</h2>
      
      {/* Current Status */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        {statusLoading && <p className="text-blue-600">Loading...</p>}
        {statusError && <p className="text-red-600">Error: {statusError}</p>}
        {currentAttendance && (
          <div className="bg-gray-50 p-4 rounded">
            <p><strong>Punched In:</strong> {currentAttendance.isPunchedIn ? 'Yes' : 'No'}</p>
            {currentAttendance.currentAttendance && (
              <div className="mt-2">
                <p><strong>Workplace:</strong> {currentAttendance.currentAttendance.workplace.name}</p>
                <p><strong>Status:</strong> {currentAttendance.currentAttendance.status}</p>
                <p><strong>Hours Worked:</strong> {currentAttendance.currentAttendance.totalWorkHours || 0}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Controls</h3>
        
        {/* Location Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Test Location:</label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="number"
              placeholder="Latitude"
              value={testLocation.latitude}
              onChange={(e) => setTestLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Longitude"
              value={testLocation.longitude}
              onChange={(e) => setTestLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              placeholder="Accuracy"
              value={testLocation.accuracy}
              onChange={(e) => setTestLocation(prev => ({ ...prev, accuracy: parseFloat(e.target.value) || 0 }))}
              className="border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handlePunchIn}
            disabled={punchInLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {punchInLoading ? 'Punching In...' : 'Punch In'}
          </button>
          
          <button
            onClick={handlePunchOut}
            disabled={punchOutLoading}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {punchOutLoading ? 'Punching Out...' : 'Punch Out'}
          </button>
          
          <button
            onClick={refetch}
            disabled={statusLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {statusLoading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>

        {/* Error Display */}
        {(punchInError || punchOutError) && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <p><strong>Errors:</strong></p>
            {punchInError && <p>Punch In: {punchInError}</p>}
            {punchOutError && <p>Punch Out: {punchOutError}</p>}
          </div>
        )}
      </div>

      {/* API Status */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">API Status</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>API Base URL:</strong> http://localhost:3007/api/attendance</p>
          <p><strong>Current Endpoint:</strong> /current</p>
          <p><strong>Punch In Endpoint:</strong> /punch-in</p>
          <p><strong>Punch Out Endpoint:</strong> /punch-out</p>
        </div>
      </div>

      {/* Debug Info */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Debug Information</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p><strong>Auth Token:</strong> {localStorage.getItem('authToken') ? 'Present' : 'Missing'}</p>
          <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
          <p><strong>Test Location:</strong> {JSON.stringify(testLocation)}</p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTest; 