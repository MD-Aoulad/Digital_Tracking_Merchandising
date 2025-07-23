import React, { useState } from 'react';
import TodoStatusTab from './TodoStatusTab';
import TodoManagementTab from './TodoManagementTab';
import TodoSettingsTab from './TodoSettingsTab';

interface TodoDashboardProps {
  userRole?: string;
}

const TABS = [
  { key: 'status', label: 'To-do status' },
  { key: 'management', label: 'To-do management' },
  { key: 'settings', label: 'Settings' },
];

export default function TodoDashboard({ userRole = 'admin' }: TodoDashboardProps) {
  const [activeTab, setActiveTab] = useState('status');

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors duration-150 ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'}`}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`tab-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'status' && <TodoStatusTab userRole={userRole} />}
        {activeTab === 'management' && <TodoManagementTab userRole={userRole} />}
        {activeTab === 'settings' && <TodoSettingsTab userRole={userRole} />}
      </div>
    </div>
  );
} 